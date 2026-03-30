(function () {

  // check if we are in main folder
  let isRoot = window.location.pathname.indexOf('/pages/') === -1;
  let basePath = "";
  if (isRoot === false) {
    basePath = "../";
  }

  // load home html
  fetch(basePath + 'pages/home.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('home-placeholder').innerHTML = data;

      const modal = document.getElementById("modal");
      const openBtn = document.getElementById("openModal");
      const closeBtn = document.getElementById("closeModal");

      function resetBookingForm() {
        const testListTotal = document.querySelector(".test-list-total");
        if (testListTotal) testListTotal.innerHTML = "";

        const totalPrice = document.querySelector(".total-price");
        if (totalPrice) totalPrice.textContent = "₱ 0.00";

        const discountInfo = document.querySelector(".discount-info");
        if (discountInfo) {
          discountInfo.textContent = "";
          discountInfo.style.display = "none";
        }

        document.querySelectorAll(".test-item.selected").forEach(item => {
          item.classList.remove("selected");
        });

        document.querySelectorAll(".category-grid details").forEach(detailsEl => {
          detailsEl.removeAttribute("open");
        });

        document.querySelectorAll(".discount-option.selected").forEach(opt => {
          opt.classList.remove("selected");
        });

        document.querySelectorAll("#modal input, #modal select, #modal textarea").forEach(field => {
          if (field.type === "checkbox" || field.type === "radio") {
            field.checked = false;
          } else {
            field.value = "";
          }
        });

        const modalContent = modal.querySelector(".modal-content");
        if (modalContent) modalContent.scrollTop = 0;

        const errorPopup = document.getElementById("errorPopup");
        if (errorPopup) errorPopup.style.display = "none";
      }

      if (openBtn) {
        openBtn.addEventListener("click", () => {
          modal.style.display = "block";
          resetBookingForm();
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          modal.style.display = "none";
          resetBookingForm();
        });
      }

      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.style.display === "block") {
          modal.style.display = "none";
          resetBookingForm();
        }
      });

      // Cancel and Submit buttons
      const cancelBtn = document.getElementById("cancelBtn");
      const submitBtn = document.getElementById("submitBtn");

      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          const confirmExitModal = document.getElementById("confirmExitModal");
          if (confirmExitModal) {
            confirmExitModal.style.display = "flex";
            document.getElementById("exitYes").onclick = () => {
              modal.style.display = "none";
              resetBookingForm();
              confirmExitModal.style.display = "none";
            };
            document.getElementById("exitNo").onclick = () => {
              confirmExitModal.style.display = "none";
            };
          }
        });
      }

      // add dashes to contact number
      const contactNo = document.getElementById("contactNo");
      if (contactNo) {
        contactNo.addEventListener("input", function (e) {
          let value = e.target.value.replace(/\D/g, "");
          if (value.length > 4) value = value.slice(0, 4) + "-" + value.slice(4);
          if (value.length > 8) value = value.slice(0, 8) + "-" + value.slice(8);
          e.target.value = value;
        });
      }

      // disable past dates for booking
      const preferredDate = document.getElementById("preferredDate");
      if (preferredDate) {
        const today = new Date().toISOString().split("T")[0];
        preferredDate.setAttribute("min", today);
      }

      // custom address typed dropdown
      const addressInput = document.getElementById("address");
      const addressList = document.getElementById("address-list");
      const addressArrow = document.getElementById("address-arrow");

      if (addressInput && addressList && addressArrow) {
        addressArrow.addEventListener("click", function (e) {
          e.stopPropagation();
          addressList.classList.toggle("show");
          const items = addressList.querySelectorAll("li");
          for (let i = 0; i < items.length; i++) {
            items[i].style.display = "block";
          }
          addressInput.focus();
        });

        addressInput.addEventListener("input", function () {
          addressList.classList.add("show");
          let filter = addressInput.value.toUpperCase();
          const items = addressList.querySelectorAll("li");
          let hasVisible = false;
          for (let i = 0; i < items.length; i++) {
            let txtValue = items[i].textContent || items[i].innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
              items[i].style.display = "block";
              hasVisible = true;
            } else {
              items[i].style.display = "none";
            }
          }
          if (!hasVisible && filter !== "") {
            addressList.classList.remove("show");
          }
        });

        addressList.addEventListener("click", function (e) {
          if (e.target.tagName === "LI") {
            addressInput.value = e.target.textContent;
            addressList.classList.remove("show");
          }
        });

        document.addEventListener("click", function (e) {
          if (e.target !== addressInput && e.target !== addressArrow && e.target !== addressList) {
            addressList.classList.remove("show");
          }
        });
      }

      // names to uppercase (allow spaces)
      function forceUppercase(field) {
        field.addEventListener("input", (e) => {
          e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "").toUpperCase();
        });
      }

      const lastName = document.getElementById("lastName");
      const firstName = document.getElementById("firstName");
      const middleInitial = document.getElementById("middleInitial");
      const suffix = document.getElementById("suffix");

      if (lastName) forceUppercase(lastName);
      if (firstName) forceUppercase(firstName);
      if (middleInitial) forceUppercase(middleInitial);
      if (suffix) forceUppercase(suffix);

      if (submitBtn) {
        submitBtn.addEventListener("click", () => {
          const lastName = document.getElementById("lastName").value.trim();
          const firstName = document.getElementById("firstName").value.trim();
          const mi = document.getElementById("middleInitial").value.trim();
          const suffix = document.getElementById("suffix").value.trim();
          const sex = document.getElementById("sex").value;
          const dob = document.getElementById("dob").value;
          const age = document.getElementById("age").value;
          const contact = document.getElementById("contactNo").value.trim();
          const prefDate = document.getElementById("preferredDate").value;
          const testsChosen = document.querySelectorAll(".test-item-total").length > 0;

          let valid = true;
          let errors = [];

          if (!/^[A-Za-z\s]+$/.test(lastName)) { valid = false; errors.push("Last name invalid"); }
          if (!/^[A-Za-z\s]+$/.test(firstName)) { valid = false; errors.push("First name invalid"); }
          if (mi && !/^[A-Za-z]$/.test(mi)) { valid = false; errors.push("Middle initial invalid"); }
          if (suffix && !/^[A-Za-z]+$/.test(suffix)) { valid = false; errors.push("Suffix invalid"); }
          if (!sex) { valid = false; errors.push("Sex required"); }
          if (!dob) {
            valid = false;
            errors.push("Date of Birth required");
          } else {
            const today = new Date();
            const birthDate = new Date(dob);
            today.setHours(0, 0, 0, 0);
            birthDate.setHours(0, 0, 0, 0);
            if (birthDate >= today) {
              valid = false;
              errors.push("Date of Birth cannot be today or in the future");
            }
          }
          if (age < 0 || age > 120) { valid = false; errors.push("Age invalid"); }
          if (!/^09\d{2}-\d{3}-\d{4}$/.test(contact)) { valid = false; errors.push("Contact number invalid"); }
          if (!prefDate) {
            valid = false;
            errors.push("Preferred Date required");
          } else {
            const today = new Date();
            const chosenDate = new Date(prefDate);
                        today.setHours(0, 0, 0, 0);
            chosenDate.setHours(0, 0, 0, 0);
            if (chosenDate < today) {
              valid = false;
              errors.push("Preferred Date cannot be in the past");
            }
          }
          if (!testsChosen) {
            valid = false;
            errors.push("Please choose at least one test");
          }

          if (!valid) {
            const errorPopup = document.getElementById("errorPopup");
            if (errorPopup) {
              errorPopup.innerHTML = '<span class="close-error">&times;</span>' +
                "<strong>Please fix the following errors before submitting:</strong><ul>" +
                errors.map(err => `<li>${err}</li>`).join("") +
                "</ul>";
              errorPopup.style.display = "block";

              const closeBtn = errorPopup.querySelector(".close-error");
              if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                  errorPopup.style.display = "none";
                });
              }
            }
            return;
          } else {
            const errorPopup = document.getElementById("errorPopup");
            if (errorPopup) errorPopup.style.display = "none";
          }

          // confirm submission (use static modal)
          const confirmSubmitModal = document.getElementById("confirmSubmitModal");
          if (confirmSubmitModal) {
            confirmSubmitModal.style.display = "flex";

            const submitYesBtn = document.getElementById("submitYes");
            const submitNoBtn = document.getElementById("submitNo");

            if (submitYesBtn) {
              submitYesBtn.onclick = () => {
                const selectedServices = [];
                document.querySelectorAll(".test-item-total").forEach(item => {
                  const name = item.querySelector(".test-name-total").textContent.trim();
                  const price = item.querySelector(".test-price-total").textContent.trim();
                  selectedServices.push({ name, price });
                });

                const totalAmount = document.querySelector(".total-price").textContent;
                console.log("Submitting booking:", { services: selectedServices, total: totalAmount });

                modal.style.display = "none";
                resetBookingForm();
                confirmSubmitModal.style.display = "none";

                // success popup
                const successPopup = document.createElement("div");
                successPopup.classList.add("success-popup");
                successPopup.innerHTML = `
                  <div class="success-popup-box">
                    <strong>Thank you!</strong><br>
                    Your Request Form was successfully submitted to the Clinic.<br>
                    Please wait for the clinic’s call to confirm the time of the home service.<br><br>
                    <em>Thank you for choosing CentriHealth Laboratory Co.</em>
                  </div>
                `;
                document.body.appendChild(successPopup);
                setTimeout(() => successPopup.remove(), 10000);
              };
            }

            if (submitNoBtn) {
              submitNoBtn.onclick = () => {
                confirmSubmitModal.style.display = "none";
              };
            }
          }
        });
      }

      // click events
      const home = document.querySelector("#home");
      if (home) {
        home.addEventListener("click", (event) => {
          const summary = event.target.closest('summary');
          if (summary) {
            const currentDetails = summary.parentElement;
            document.querySelectorAll(".category-grid details").forEach(detailsEl => {
              if (detailsEl !== currentDetails) {
                detailsEl.removeAttribute("open");
              }
            });
          }

          const subTest = event.target.closest('.test-item');
          if (subTest && !event.target.classList.contains('remove-btn')) {
            const name = subTest.querySelector('.test-name').textContent.trim();
            const price = subTest.querySelector('.test-price').textContent.trim();

            if (subTest.classList.contains('selected')) {
              document.querySelectorAll(".test-item-total").forEach(item => {
                if (item.querySelector(".test-name-total").textContent.trim() === name) {
                  item.remove();
                }
              });
              subTest.classList.remove('selected');
            } else {
              const newRow = document.createElement("div");
              newRow.classList.add("test-item-total");
              newRow.innerHTML = `
                <span class="test-name-total">${name}</span>
                <span class="test-price-total">${price}</span>
                <button class="remove-btn">×</button>
              `;
              document.querySelector(".test-list-total").appendChild(newRow);
              subTest.classList.add('selected');
            }
            recalculateTotal();
          }

          if (event.target.classList.contains("remove-btn")) {
            const removedRow = event.target.closest(".test-item-total");
            const removedName = removedRow.querySelector(".test-name-total").textContent.trim();
            document.querySelectorAll(".test-item").forEach(item => {
              if (item.querySelector(".test-name").textContent.trim() === removedName) {
                item.classList.remove("selected");
              }
            });
            removedRow.remove();
            recalculateTotal();
          }

          const discountOption = event.target.closest('.discount-option');
          if (discountOption) {
            if (discountOption.classList.contains('selected')) {
              discountOption.classList.remove('selected');
            } else {
              document.querySelectorAll('.discount-option').forEach(opt => {
                opt.classList.remove('selected');
              });
              discountOption.classList.add('selected');
            }
            recalculateTotal();
          }
        });
      }

      function recalculateTotal() {
        let total = 0;
        const activeDiscount = document.querySelector('.discount-option.selected');
        const discountType = activeDiscount ? activeDiscount.dataset.discount : null;
        let discountLabel = "";

        document.querySelectorAll('.test-item-total').forEach(item => {
          const name = item.querySelector('.test-name-total').textContent.trim();
          const price = parseFloat(item.querySelector('.test-price-total').textContent.replace(/[^\d.]/g, ""));
          let discount = 0;

          if (discountType === 'senior') {
            discount = 0.20;
            discountLabel = "-20% Senior Citizen / PWD Discount";
          } else if (discountType === 'card') {
            if (['CBC', 'Urinalysis', 'Fecalysis', 'FBS', 'RBS', 'Total Cholesterol', 'Triglycerides'].includes(name)) {
              discount = 0.20;
              discountLabel = "-20% Card Bank Discount (Basic Tests)";
            } else if (['HBsAG', 'Anti TP', 'Typhidot', 'Dengue NS1 Ag', 'Dengue IgG', 'Dengue IgM',
              'ASOT', 'Fecal Occult Blood Test', 'CRP', 'H. Pylori Ab Rapid Test',
              'H. Pylori Ag Rapid Test', 'Troponin-l', 'Pregnancy Test', 'Anti-HAV IgM',
              'Anti-HBs', 'Widals Test', 'T3', 'T4', 'TSH', 'FT3', 'FT4', 'TPSA', 'HBA1c'].includes(name)) {
              discount = 0.10;
              discountLabel = "-10% Card Bank Discount (Special Tests)";
            } else if (name.toLowerCase().includes("ecg")) {
              discount = 0;
              discountLabel = "No discount for ECG tests";
            } else {
              discount = 0.10;
              discountLabel = "-10% Card Bank Discount";
            }
          }

          total += price - (price * discount);
        });

        const totalPriceEl = document.querySelector('.total-price');
        if (totalPriceEl) totalPriceEl.textContent = "₱ " + total.toFixed(2);

        let discountInfo = document.querySelector('.discount-info');
        if (!discountInfo) {
          discountInfo = document.createElement("div");
          discountInfo.classList.add("discount-info");
          discountInfo.style.fontSize = "0.55em";
          discountInfo.style.color = "#c00";
          discountInfo.style.marginTop = "4px";
          discountInfo.style.textAlign = "right";
          const testListTotalEl = document.querySelector('.test-list-total');
          if (testListTotalEl) testListTotalEl.insertAdjacentElement("afterend", discountInfo);
        }

        if (discountLabel) {
          discountInfo.textContent = discountLabel;
          discountInfo.style.display = "block";
        } else {
          discountInfo.textContent = "";
          discountInfo.style.display = "none";
        }
      }
    })
    .catch(error => console.error("Error loading home section:", error));

})();