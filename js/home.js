(function () {

  let isRoot = window.location.pathname.indexOf('/pages/') === -1;
  let basePath = "";
  if (isRoot === false) {
    basePath = "../";
  }

  fetch(basePath + 'pages/home.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('home-placeholder').innerHTML = data;

      const modal = document.getElementById("modal");
      const openBtn = document.getElementById("openModal");
      const closeBtn = document.getElementById("closeModal");

      const seniorOption = document.querySelector('.discount-option[data-discount="senior_pwd"]');
      const cardOption = document.querySelector('.discount-option[data-discount="card"]');
      const noteBox = document.getElementById("discount-note");

      function updateDiscountNote() {
        if (!noteBox) return;
        if (seniorOption && seniorOption.classList.contains("selected")) {
          noteBox.innerHTML = "Please present your Senior Citizen ID or any valid ID that shows your birthdate, OR a valid PWD ID.";
        } else if (cardOption && cardOption.classList.contains("selected")) {
          noteBox.innerHTML = "Please present your membership card or proof of membership.";
        } else {
          noteBox.innerHTML = "REMINDER: Please present your Senior Citizen ID or any valid ID that shows your birthdate, OR a valid PWD ID. For Card Bank Member, please present your membership card or proof of membership.";
        }
      }

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
          field.style.border = "";
          field.style.boxShadow = "";
        });

        document.querySelectorAll(".field").forEach(f => {
          f.classList.remove("invalid");
        });

        const modalContent = modal.querySelector(".modal-content");
        if (modalContent) modalContent.scrollTop = 0;

        const errorPopup = document.getElementById("errorPopup");
        if (errorPopup) errorPopup.style.display = "none";

        updateDiscountNote();
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

      const contactNo = document.getElementById("contactNo");
      if (contactNo) {
        contactNo.addEventListener("input", function (e) {
          let value = e.target.value.replace(/\D/g, "").slice(0, 11);
          if (value.length > 4) value = value.slice(0, 4) + "-" + value.slice(4);
          if (value.length > 8) value = value.slice(0, 8) + "-" + value.slice(8);
          e.target.value = value;
        });
      }

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
          document.querySelectorAll(".field").forEach(f => f.classList.remove("invalid"));

          const lastNameField = document.getElementById("lastName");
          const firstNameField = document.getElementById("firstName");
          const miField = document.getElementById("middleInitial");
          const sexField = document.getElementById("sex");
          const dobField = document.getElementById("dob");
          const ageField = document.getElementById("age");
          const contactField = document.getElementById("contactNo");
          const addressField = document.getElementById("address");
          const prefDateField = document.getElementById("preferredDate");

          const lastName = lastNameField.value.trim();
          const firstName = firstNameField.value.trim();
          const mi = miField.value.trim();
          const suffix = document.getElementById("suffix").value.trim();
          const sex = sexField.value;
          const dob = dobField.value;
          const age = ageField.value;
          const contact = contactField.value.trim();
          const address = addressField.value.trim();
          const prefDate = prefDateField.value;

          let valid = true;

          const markInvalid = (field, message) => {
            valid = false;
            if (field) {
              const fieldContainer = field.closest(".field");
              if (fieldContainer) {
                fieldContainer.classList.add("invalid");
                const note = fieldContainer.querySelector(".error-note");
                if (note && message) {
                  note.textContent = message;
                }
              }
            }
          };

          if (!/^[A-Za-z\s]+$/.test(lastName)) { markInvalid(lastNameField, lastName === "" ? "Please fill up" : "Invalid"); }
          if (!/^[A-Za-z\s]+$/.test(firstName)) { markInvalid(firstNameField, firstName === "" ? "Please fill up" : "Invalid"); }
          if (!/^[A-Za-z]$/.test(mi)) { markInvalid(miField, mi === "" ? "Please fill up" : "Invalid"); }
          if (suffix && !/^[A-Za-z]+$/.test(suffix)) { markInvalid(document.getElementById("suffix"), "Invalid"); }
          if (!sex) { markInvalid(sexField, "Please fill up"); }
          if (!dob) {
            markInvalid(dobField, "Please fill up");
          } else {
            const today = new Date();
            const birthDate = new Date(dob);
            today.setHours(0, 0, 0, 0);
            birthDate.setHours(0, 0, 0, 0);
            if (birthDate >= today) {
              markInvalid(dobField, "Invalid Date");
            }
          }
          if (age === "" || age < 0 || age > 120) { markInvalid(ageField, "Invalid"); }
          if (!/^09\d{2}-\d{3}-\d{4}$/.test(contact)) { markInvalid(contactField, contact === "" ? "Please fill up" : "Invalid"); }
          if (!address) { markInvalid(addressField, "Please fill up"); }
          if (!prefDate) {
            markInvalid(prefDateField, "Please fill up");
          } else {
            const today = new Date();
            const chosenDate = new Date(prefDate);
            today.setHours(0, 0, 0, 0);
            chosenDate.setHours(0, 0, 0, 0);
            if (chosenDate <= today) {
              markInvalid(prefDateField, "Invalid Date");
            }
          }

          const selectedServices = [];
          document.querySelectorAll(".test-item-total").forEach(item => {
            const name = item.querySelector(".test-name-total").textContent.trim();
            const price = item.querySelector(".test-price-total").textContent.trim();
            selectedServices.push({ name, price });
          });

          if (selectedServices.length === 0) {
            valid = false;
            const validationModal = document.getElementById("validationModal");
            const validationOk = document.getElementById("validationOk");
            if (validationModal) {
              validationModal.style.display = "flex";
              if (validationOk) {
                validationOk.onclick = () => {
                  validationModal.style.display = "none";
                };
              }
            }
          }

          if (!valid) {
            const modalBody = document.querySelector(".modal-body-scroll");
            if (modalBody) modalBody.scrollTop = 0;
            return;
          }

          const errorPopup = document.getElementById("errorPopup");
          if (errorPopup) errorPopup.style.display = "none";

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
                    modal.style.display = "none";
                    resetBookingForm();
                    confirmSubmitModal.style.display = "none";

                    const successModal = document.getElementById("successModal");
                    if (successModal) {
                      successModal.style.display = "flex";

                      const successOk = document.getElementById("successOk");
                      let secondsLeft = 60;

                      if (successOk) successOk.textContent = `OK, Got It! (${secondsLeft}s)`;

                      const countdown = setInterval(() => {
                        secondsLeft--;
                        if (successOk) successOk.textContent = `OK, Got It! (${secondsLeft}s)`;
                        if (secondsLeft <= 0) {
                          clearInterval(countdown);
                          successModal.style.display = "none";
                        }
                      }, 1000);

                      if (successOk) {
                        successOk.onclick = () => {
                          clearInterval(countdown);
                          successModal.style.display = "none";
                        };
                      }
                    }
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
            updateDiscountNote();
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