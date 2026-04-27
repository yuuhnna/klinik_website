window.KLINIK_SUPABASE_CONFIG = {
  url: "https://rllgfizvvdifdxbwtqzy.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbGdmaXp2dmRpZmR4Ynd0cXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjUyMjQsImV4cCI6MjA5MDQ0MTIyNH0.ZHOZWBF5bIFA92WS15x6t5UxGv_8pl_ni6MzDNpFjmk",
  patientsTable: "patients",
  appointmentsTable: "appointments",
  patientTestsTable: "patient_tests",
  labTestsTable: "lab_tests"
};

(function () {
  const config = window.KLINIK_SUPABASE_CONFIG || {};
  const supabaseUrl = (config.url || "").replace(/\/$/, "");
  const anonKey = config.anonKey || "";
  const patientsTable = config.patientsTable || "patients";
  const appointmentsTable = config.appointmentsTable || "appointments";
  const patientTestsTable = config.patientTestsTable || "patient_tests";
  const labTestsTable = config.labTestsTable || "lab_tests";

  function getConfigError() {
    if (
      !supabaseUrl ||
      supabaseUrl.includes("YOUR_PROJECT_REF") ||
      !anonKey ||
      anonKey.includes("YOUR_SUPABASE_ANON_KEY")
    ) {
      return "Supabase is not configured yet. Update js/supabase-config.js with your project URL and anon key.";
    }
    return "";
  }

  // Normalize test name from HTML to match DB (uppercase, trimmed)
  function normalizeTestName(testName) {
    return String(testName || "")
      .trim()
      .replace(/^₱\s*\d[\d,\.]*\s*/, "")
      .replace(/\s+/g, " ")
      .toUpperCase();
  }

  // Generate control_no from lab_test row — returns null for ECG (no prefix)
  function generateControlNoFromLabTest(labTest) {
    if (!labTest) return null;
    const prefix = String(labTest.control_prefix || "").trim();
    const start = String(labTest.control_start ?? "").trim();
    if (!prefix || !/^\d+$/.test(start)) return null;
    return `${prefix}${start}`;
  }

  function generateUuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    const template = "10000000-1000-4000-8000-100000000000";
    return template.replace(/[018]/g, (char) => {
      const value = Number(char);
      return (
        value ^
        (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (value / 4)))
      ).toString(16);
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
    // 1. Insert patient
    const patientId = generateUuid();
    await apiRequest(`/rest/v1/${encodeURIComponent(patientsTable)}`, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
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

    // 2. Resolve each selected test from lab_tests using normalized (uppercase) name
    const selectedTests = Array.isArray(payload.selectedServices) ? payload.selectedServices : [];
    const resolvedTests = [];

    for (const selectedTest of selectedTests) {
      const testName = normalizeTestName(selectedTest.name);
      if (!testName) continue;

      const matchedTests = await fetchJson(
        `/rest/v1/${encodeURIComponent(labTestsTable)}?select=id,test_name,control_prefix,control_start&test_name=ilike.${encodeURIComponent(testName)}`
      );
      const labTest = matchedTests && matchedTests[0];

      if (!labTest) {
        throw new Error(
          `No lab test found for "${selectedTest.name}". Add a matching row in lab_tests.`
        );
      }

      // Generate control_no for this specific test (null for ECG)
      const controlNo = generateControlNoFromLabTest(labTest);
      resolvedTests.push({ ...labTest, controlNo });
    }

    // 3. Use the first non-null control_no as the appointment-level control_no
    const appointmentControlNo =
      resolvedTests.find((t) => t.controlNo)?.controlNo || null;

    if (!appointmentControlNo) {
      throw new Error(
        "Unable to generate control number. Ensure at least one selected test has control_prefix and control_start set."
      );
    }

    // 4. Insert appointment
    const appointmentId = generateUuid();
    await apiRequest(`/rest/v1/${encodeURIComponent(appointmentsTable)}`, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        id: appointmentId,
        patient_id: patientId,
        type: "Home Service",
        status: "pending",
        preferred_date: payload.preferredDate,
        time: new Date().toTimeString().slice(0, 8),
        control_no: appointmentControlNo
      })
    });

    // 5. Insert each patient_test with its own control_no
    for (const labTest of resolvedTests) {
      await apiRequest(`/rest/v1/${encodeURIComponent(patientTestsTable)}`, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          appointment_id: appointmentId,
          test_id: labTest.id,
          status: "pending",
          result_data: null,
          control_no: labTest.controlNo || null  // null for ECG tests
        })
      });
    }

    return { patientId, appointmentId, controlNo: appointmentControlNo };
  }

  async function insertSubmission(formType, payload) {
    const configError = getConfigError();
    if (configError) throw new Error(configError);

    if (formType === "booking") return insertBooking(payload);

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