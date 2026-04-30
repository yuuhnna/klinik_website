(function () {
  const config = window.KLINIK_SUPABASE_CONFIG || {};
  const supabaseUrl = (config.url || "").replace(/\/$/, "");
  const anonKey = config.anonKey || "";
  const patientsTable = config.patientsTable || "patients";
  const appointmentsTable = config.appointmentsTable || "appointments";
  const patientTestsTable = config.patientTestsTable || "patient_tests";
  const labTestsTable = config.labTestsTable || "lab_tests";
  const transactionsTable = config.transactionsTable || "transactions";

  function getConfigError() {
    if (!supabaseUrl || supabaseUrl.includes("YOUR_PROJECT_REF") || !anonKey || anonKey.includes("YOUR_SUPABASE_ANON_KEY")) {
      return "Supabase is not configured yet. Update js/supabase-config.js with your project URL and anon key.";
    }

    return "";
  }

  function normalizeTestName(testName) {
    return String(testName || "")
      .trim()
      .replace(/^₱\s*\d[\d,\.]*\s*/, "")
      .replace(/\s+/g, " ");
  }

  function generateControlNo() {
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
    return `HS-${stamp}-${randomSuffix}`;
  }

  function generateControlNoFromLabTest(labTest) {
    if (!labTest) {
      return "";
    }

    const prefix = String(labTest.control_prefix || "").trim();
    const start = labTest.control_start;
    const normalizedStart = String(start ?? "").trim();
    if (!prefix || !/^\d+$/.test(normalizedStart)) {
      return "";
    }

    return `${prefix}${normalizedStart}`;
  }

  function generateUuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    const template = "10000000-1000-4000-8000-100000000000";
    return template.replace(/[018]/g, (char) => {
      const value = Number(char);
      return (value ^ (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (value / 4)))).toString(16);
    });
  }

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${supabaseUrl}${path}`, {
      ...options,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Supabase request failed with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }

    return null;
  }

  async function fetchJson(path) {
    const response = await fetch(`${supabaseUrl}${path}`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Supabase request failed with status ${response.status}`);
    }

    return response.json();
  }

  async function insertBooking(payload) {
    const patientId = generateUuid();
    await apiRequest(`/rest/v1/${encodeURIComponent(patientsTable)}`, {
      method: "POST",
      headers: {
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        id: patientId,
        first_name: payload.firstName,
        last_name: payload.lastName,
        middle_name: payload.middleInitial || null,
        suffix: payload.suffix || null,
        sex: payload.sex,
        date_of_birth: payload.dob,
        age: Number(payload.age),
        address: payload.address,
        contact_number: payload.contactNo,
        type: "Home_Service"
      })
    });

    const selectedTests = Array.isArray(payload.selectedServices) ? payload.selectedServices : [];
    const resolvedTests = [];
    for (const selectedTest of selectedTests) {
      const testName = normalizeTestName(selectedTest.name);
      if (!testName) {
        continue;
      }

      const matchedTests = await fetchJson(`/rest/v1/${encodeURIComponent(labTestsTable)}?select=id,test_name,control_prefix,control_start&test_name=ilike.${encodeURIComponent(testName)}`);
      const labTest = matchedTests && matchedTests[0];

      if (!labTest) {
        throw new Error(`No lab test found for "${testName}". Add a matching row in lab_tests.`);
      }

      resolvedTests.push(labTest);
    }

    let controlNo = "";
    for (const test of resolvedTests) {
      const derived = generateControlNoFromLabTest(test);
      if (derived) {
        controlNo = derived;
        break;
      }
    }

    // If no test provides a control prefix (e.g., ECG only), use a fallback HS number
    if (!controlNo) {
      controlNo = generateControlNo();
    }

    const appointmentId = generateUuid();
    await apiRequest(`/rest/v1/${encodeURIComponent(appointmentsTable)}`, {
      method: "POST",
      headers: {
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        id: appointmentId,
        patient_id: patientId,
        type: "Home Service",
        status: "pending",
        preferred_date: payload.preferredDate,
        time: new Date().toTimeString().slice(0, 8),
        control_no: controlNo
      })
    });

    for (const labTest of resolvedTests) {

      await apiRequest(`/rest/v1/${encodeURIComponent(patientTestsTable)}`, {
        method: "POST",
        body: JSON.stringify({
          appointment_id: appointmentId,
          test_id: labTest.id,
          status: "pending",
          result_data: null
        })
      });
    }

    // 5. Insert Transaction
    const amountStr = String(payload.totalAmount || "0").replace(/[^\d.]/g, "");
    const amountCollected = parseFloat(amountStr) || 0;

    await apiRequest(`/rest/v1/${encodeURIComponent(transactionsTable)}`, {
      method: "POST",
      headers: {
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        appointment_id: appointmentId,
        amount_collected: amountCollected,
        discount_type: payload.discountType || null,
        date: new Date().toISOString()
      })
    });

    return {
      patientId,
      appointmentId,
      controlNo
    };
  }

  async function insertSubmission(formType, payload) {
    const configError = getConfigError();
    if (configError) {
      throw new Error(configError);
    }

    if (formType === "booking") {
      return insertBooking(payload);
    }

    throw new Error(`Unsupported form type: ${formType}`);
  }

  window.KlinikSubmissions = {
    submitReview(data) {
      return insertSubmission("review", data);
    },
    submitBooking(data) {
      return insertSubmission("booking", data);
    }
  };

})();