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
        // Clear selected services
        const testListTotal = document.querySelector(".test-list-total");
        if (testListTotal) testListTotal.innerHTML = "";

        const totalPrice = document.querySelector(".total-price");
        if (totalPrice) totalPrice.textContent = "₱ 0.00";

        const discountInfo = document.querySelector(".discount-info");
        if (discountInfo) {
          discountInfo.textContent = "";
          discountInfo.style.display = "none"; // hide when reset
        }

        document.querySelectorAll(".test-item.selected").forEach(item => {
          item.classList.remove("selected");
        });

        // close dropdowns
        document.querySelectorAll(".category-grid details").forEach(detailsEl => {
          detailsEl.removeAttribute("open");
        });

        // Clear discount selection
        document.querySelectorAll(".discount-option.selected").forEach(opt => {
          opt.classList.remove("selected");
        });

        // reset form
        document.querySelectorAll("#modal input, #modal select, #modal textarea").forEach(field => {
          if (field.type === "checkbox" || field.type === "radio") {
            field.checked = false;
          } else {
            field.value = "";
          }
        });

        // scroll to top
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

            const exitYesBtn = document.getElementById("exitYes");
            const exitNoBtn = document.getElementById("exitNo");

            if (exitYesBtn) {
              exitYesBtn.onclick = () => {
                modal.style.display = "none";
                resetBookingForm();
                confirmExitModal.style.display = "none";
              };
            }

            if (exitNoBtn) {
              exitNoBtn.onclick = () => {
                confirmExitModal.style.display = "none";
              };
            }
          }
        });
      }

      // add dashes to contact number
      const contactNo = document.getElementById("contactNo");
      if (contactNo) {
        contactNo.addEventListener("input", function (e) {
          let value = e.target.value.replace(/\D/g, "").slice(0, 11);
          if (value.length > 4) value = value.slice(0, 4) + "-" + value.slice(4);
          if (value.length > 8) value = value.slice(0, 8) + "-" + value.slice(8);
          e.target.value = value;
        });
      }

      // disable past dates for booking
      const preferredDate = document.getElementById("preferredDate");
      if (preferredDate) {
        const formatDateForInput = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = formatDateForInput(tomorrow);
        preferredDate.setAttribute("min", minDate);
      }

      // auto-compute age from Date of Birth
      const dobInput = document.getElementById("dob");
      const ageInput = document.getElementById("age");

      function computeAgeFromDob(dobValue) {
        if (!dobValue) {
          return "";
        }

        const today = new Date();
        const birthDate = new Date(dobValue);

        if (Number.isNaN(birthDate.getTime())) {
          return "";
        }

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age -= 1;
        }

        if (age < 0) {
          return "";
        }

        return String(age);
      }

      if (dobInput && ageInput) {
        ageInput.readOnly = true;

        const refreshAge = () => {
          ageInput.value = computeAgeFromDob(dobInput.value);
        };

        dobInput.addEventListener("change", refreshAge);
        dobInput.addEventListener("input", refreshAge);
        refreshAge();
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
          if (hasVisible === false && filter !== "") {
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

      // names to uppercase 
      function forceUppercase(field) {
        field.addEventListener("input", (e) => {
          e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "").toUpperCase();
        });
      }

      // name fields
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
          // validate info
          const lastName = document.getElementById("lastName").value.trim();
          const firstName = document.getElementById("firstName").value.trim();
          const mi = document.getElementById("middleInitial").value.trim();
          const suffix = document.getElementById("suffix").value.trim();
          const sex = document.getElementById("sex").value;
          const dob = document.getElementById("dob").value;
          const age = document.getElementById("age").value;
          const contact = document.getElementById("contactNo").value.trim();
          const prefDate = document.getElementById("preferredDate").value;

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

            if (chosenDate <= today) {
              valid = false;
              errors.push("Preferred Date must be at least tomorrow (same-day booking is not allowed)");
            }
          }

          if (!valid) {
            const errorPopup = document.getElementById("errorPopup");
            if (errorPopup) {
              let errorMsg = '<span class="close-error">&times;</span>';
              errorMsg += "<strong>Please fix the following errors before submitting:</strong><ul>";
              for (let i = 0; i < errors.length; i++) {
                errorMsg += "<li>" + errors[i] + "</li>";
              }
              errorMsg += "</ul>";
              errorPopup.innerHTML = errorMsg;
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

          const selectedServices = [];
          document.querySelectorAll(".test-item-total").forEach(item => {
            const name = item.querySelector(".test-name-total").textContent.trim();
            const price = item.querySelector(".test-price-total").textContent.trim();
            selectedServices.push({ name, price });
          });

          const activeDiscount = document.querySelector('.discount-option.selected');
          const bookingPayload = {
            lastName,
            firstName,
            middleInitial: mi,
            suffix,
            sex,
            dob,
            age,
            contactNo: contact,
            address: document.getElementById("address").value.trim(),
            preferredDate: prefDate,
            selectedServices,
            totalAmount: document.querySelector(".total-price").textContent,
            discountType: activeDiscount ? activeDiscount.dataset.discount : null
          };

          if (!window.KlinikSubmissions) {
            const errorPopup = document.getElementById("errorPopup");
            if (errorPopup) {
              errorPopup.innerHTML = '<span class="close-error">&times;</span><strong>Supabase is not configured yet.</strong><ul><li>Update js/supabase-config.js with your project URL and anon key.</li></ul>';
              errorPopup.style.display = "block";

              const closeBtn = errorPopup.querySelector(".close-error");
              if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                  errorPopup.style.display = "none";
                });
              }
            }
            return;
          }

          // confirm submission
          const confirmSubmitModal = document.getElementById("confirmSubmitModal");
          if (confirmSubmitModal) {
            confirmSubmitModal.style.display = "flex";

            const submitYesBtn = document.getElementById("submitYes");
            const submitNoBtn = document.getElementById("submitNo");

            if (submitYesBtn) {
              submitYesBtn.onclick = () => {
                submitYesBtn.disabled = true;

                window.KlinikSubmissions.submitBooking(bookingPayload)
                  .then(() => {
                    alert("Your request has been saved to the system.");
                    modal.style.display = "none";
                    resetBookingForm();
                    confirmSubmitModal.style.display = "none";
                  })
                  .catch((err) => {
                    console.error("Supabase error:", err);
                    const message = err && err.message ? err.message : "Please check your Supabase config and try again.";
                    const errorPopup = document.getElementById("errorPopup");
                    if (errorPopup) {
                      errorPopup.innerHTML = '<span class="close-error">&times;</span><strong>Request could not be saved.</strong><ul><li>' + message + '</li></ul>';
                      errorPopup.style.display = "block";

                      const closeBtn = errorPopup.querySelector(".close-error");
                      if (closeBtn) {
                        closeBtn.addEventListener("click", () => {
                          errorPopup.style.display = "none";
                        });
                      }
                    }

                    confirmSubmitModal.style.display = "none";
                  })
                  .finally(() => {
                    submitYesBtn.disabled = false;
                  });
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
          // toggle categories
          const summary = event.target.closest('summary');
          if (summary) {
            const currentDetails = summary.parentElement;
            document.querySelectorAll(".category-grid details").forEach(detailsEl => {
              if (detailsEl !== currentDetails) {
                detailsEl.removeAttribute("open");
              }
            });
          }

          // select test
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

          // delete test
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

          // toggle discounts
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

          if (discountType === 'senior_pwd') {
            discount = 0.20;
            discountLabel = "-20% Senior Citizen / PWD Discount";
          } else if (discountType === 'card') {
            if (['CBC', 'URINALYSIS', 'FECALYSIS', 'FBS', 'RBS', 'TOTAL CHOLESTEROL', 'TRIGLYCERIDES'].includes(name)) {
              discount = 0.20;
              discountLabel = "-20% Card Bank Discount (Basic Tests)";
            } else if (name.toLowerCase().includes("ecg")) {
              discount = 0;
              discountLabel = "No discount for ECG tests";
            } else {
              discount = 0.10;
              discountLabel = "-10% Card Bank Discount (Special Tests)";
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
          const testListTotalEl = document.querySelector('.test-list-total');
          if (testListTotalEl) testListTotalEl.insertAdjacentElement("afterend", discountInfo);
        }

        if (discountLabel) {
          discountInfo.textContent = discountLabel;
          discountInfo.style.display = "block";
        } else {
          discountInfo.textContent = "No discount applied";
          discountInfo.style.display = "block";
        }
      }
    })
    .catch(error => console.error("Error loading home section:", error));

})();