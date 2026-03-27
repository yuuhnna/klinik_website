document.addEventListener("DOMContentLoaded", function () {
  fetch("home.html")
    .then(response => response.text())
    .then(data => {
      document.querySelector("#home").innerHTML = data;

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

        //Close ALL <details> dropdowns
        document.querySelectorAll(".category-grid details").forEach(detailsEl => {
          detailsEl.removeAttribute("open");
        });

        // Clear discount selection
        document.querySelectorAll(".discount-option.selected").forEach(opt => {
          opt.classList.remove("selected");
        });

        // Reset all form inputs
        document.querySelectorAll("#modal input, #modal select, #modal textarea").forEach(field => {
          if (field.type === "checkbox" || field.type === "radio") {
            field.checked = false;
          } else {
            field.value = "";
          }
        });

        // Scroll modal back to top so user starts at beginning
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
        const confirmExit = document.createElement("div");
        confirmExit.classList.add("confirm-exit");
        confirmExit.innerHTML = `
        <div class="confirm-exit-box">
            <p>Are you sure you want to exit the Request Form?</p>
            <p style="font-size:0.9em; color:#555; margin-top:8px;">
            All information you entered will be deleted.
            </p>
            <div class="confirm-buttons">
            <button id="exitYes">Yes</button>
            <button id="exitNo">No</button>
            </div>
        </div>
        `;
        document.body.appendChild(confirmExit);

        document.getElementById("exitYes").addEventListener("click", () => {
        modal.style.display = "none";
        resetBookingForm();
        confirmExit.remove();
        });

        document.getElementById("exitNo").addEventListener("click", () => {
        confirmExit.remove();
        });
    });
    }
      //Auto-format contact number with dashes
      const contactNo = document.getElementById("contactNo");
        if (contactNo) {
        contactNo.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, ""); // digits only
            if (value.length > 4) value = value.slice(0,4) + "-" + value.slice(4);
            if (value.length > 8) value = value.slice(0,8) + "-" + value.slice(8);
            e.target.value = value;
        });
        }

      // Prevent past dates for Preferred Date
      const preferredDate = document.getElementById("preferredDate");
      if (preferredDate) {
        const today = new Date().toISOString().split("T")[0];
        preferredDate.setAttribute("min", today);
      }

      // Auto-uppercase helper
        function forceUppercase(field) {
        field.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase();
        });
        }

        // Apply to all name fields
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
          // Personal info validation
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

            // strip time for accurate comparison
            today.setHours(0,0,0,0);
            birthDate.setHours(0,0,0,0);

            if (birthDate >= today) {
                valid = false;
                errors.push("Date of Birth cannot be today or in the future");
            }
            }
          if (age < 0 || age > 120) { valid = false; errors.push("Age invalid"); }
          if (!/^09\d{2}-\d{3}-\d{4}$/.test(contact)) { valid = false; errors.push("Contact number invalid"); }
          if (!prefDate) { valid = false; errors.push("Preferred Date required"); }
          if (!prefDate) {
            valid = false;
            errors.push("Preferred Date required");
            } else {
            const today = new Date();
            const chosenDate = new Date(prefDate);

            // strip time for accurate comparison
            today.setHours(0,0,0,0);
            chosenDate.setHours(0,0,0,0);

            if (chosenDate < today) {
                valid = false;
                errors.push("Preferred Date cannot be in the past");
            }
            }

            if (!valid) {
            const errorPopup = document.getElementById("errorPopup");
            if (errorPopup) {
                errorPopup.innerHTML = '<span class="close-error">&times;</span>' +
                "<strong>Please fix the following errors before submitting:</strong><ul>" +
                errors.map(err => `<li>${err}</li>`).join("") +
                "</ul>";
                errorPopup.style.display = "block";

                // attach dismiss button
                const closeBtn = errorPopup.querySelector(".close-error");
                if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                    errorPopup.style.display = "none";
                });
                }
            }
            return; // stop submission
            } else {
                const errorPopup = document.getElementById("errorPopup");
                if (errorPopup) errorPopup.style.display = "none";
                }

                // Confirmation popup before final submission
                const confirmSubmit = document.createElement("div");
                confirmSubmit.classList.add("confirm-exit");
                confirmSubmit.innerHTML = `
                <div class="confirm-exit-box">
                    <p>Are you sure you want to submit this request?</p>
                    <p style="font-size:0.9em; color:#555; margin-top:8px;">
                    All information you entered will be sent and cannot be edited.
                    </p>
                    <div class="confirm-buttons">
                    <button id="submitYes">Yes</button>
                    <button id="submitNo">No</button>
                    </div>
                </div>
                `;
                document.body.appendChild(confirmSubmit);

                document.getElementById("submitYes").addEventListener("click", () => {
                // Proceed with submission
                const selectedServices = [];
                document.querySelectorAll(".test-item-total").forEach(item => {
                    const name = item.querySelector(".test-name-total").textContent.trim();
                    const price = item.querySelector(".test-price-total").textContent.trim();
                    selectedServices.push({ name, price });
                });

                const totalAmount = document.querySelector(".total-price").textContent;

                console.log("Submitting booking:", {
                    services: selectedServices,
                    total: totalAmount
                });

                modal.style.display = "none";
                resetBookingForm();
                confirmSubmit.remove();
                });

                document.getElementById("submitNo").addEventListener("click", () => {
                confirmSubmit.remove();
                });
            });
            }

      // Event delegation for dropdowns, sub-tests, discounts
      const home = document.querySelector("#home");
      home.addEventListener("click", (event) => {
        // Dropdown toggle using <details>
        const summary = event.target.closest('summary');
        if (summary) {
          const currentDetails = summary.parentElement;
          document.querySelectorAll(".category-grid details").forEach(detailsEl => {
            if (detailsEl !== currentDetails) {
              detailsEl.removeAttribute("open");
            }
          });
        }

        // Sub-test selection
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

        // Remove test
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

        // Discount toggle
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
            if (['CBC','Urinalysis','Fecalysis','FBS','RBS','Total Cholesterol','Triglycerides'].includes(name)) {
              discount = 0.20;
              discountLabel = "-20% Card Bank Discount (Basic Tests)";
            } else if (['HBsAG','Anti TP','Typhidot','Dengue NS1 Ag','Dengue IgG','Dengue IgM',
                        'ASOT','Fecal Occult Blood Test','CRP','H. Pylori Ab Rapid Test',
                        'H. Pylori Ag Rapid Test','Troponin-l','Pregnancy Test','Anti-HAV IgM',
                        'Anti-HBs','Widals Test','T3','T4','TSH','FT3','FT4','TPSA','HBA1c'].includes(name)) {
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

        document.querySelector('.total-price').textContent = "₱ " + total.toFixed(2);

        let discountInfo = document.querySelector('.discount-info');
        if (!discountInfo) {
        discountInfo = document.createElement("div");
        discountInfo.classList.add("discount-info");
        discountInfo.style.fontSize = "0.55em";
        discountInfo.style.color = "#c00";
        discountInfo.style.marginTop = "4px";
        discountInfo.style.textAlign = "right";
        document.querySelector('.test-list-total').insertAdjacentElement("afterend", discountInfo);
        }

        // Show discount label if active, otherwise show "No discount applied"
        if (discountLabel) {
        discountInfo.textContent = discountLabel;
        discountInfo.style.display = "block";
        } else {
        discountInfo.textContent = "No discount applied";
        discountInfo.style.display = "block"; // always visible
        } 
      }
    })
    .catch(error => console.error("Error loading home section:", error));

    
});