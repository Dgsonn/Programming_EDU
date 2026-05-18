document.addEventListener("DOMContentLoaded", function () {
  // --- 1. ĐIỀU HƯỚNG CHUYỂN TRANG TỪNG BƯỚC ---
  const steps = document.querySelectorAll(".step");
  const nextBtns = document.querySelectorAll(".next-btn");
  const prevBtns = document.querySelectorAll(".prev-btn");
  const progressBar = document.getElementById("progressBar");
  let currentStep = 0;

  function updateForm() {
    steps.forEach((step, index) => {
      step.classList.toggle("active", index === currentStep);
    });
    // Cập nhật thanh tiến trình %
    const progress = (currentStep / (steps.length - 1)) * 100;
    progressBar.style.width = progress + "%";
  }

  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        updateForm();
      }
    });
  });

  prevBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep > 0) {
        currentStep--;
        updateForm();
      }
    });
  });

  updateForm(); // Khởi chạy lần đầu

  // --- 2. LOGIC BẬT/TẮT Ô NHẬP "KHÁC" ---
  function setupOtherInput(inputType, name, otherId, textId) {
    const inputs = document.querySelectorAll(`input[name="${name}"]`);
    const textInput = document.getElementById(textId);
    const otherEl = document.getElementById(otherId);

    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (inputType === "radio") {
          if (input.value === "other") {
            textInput.disabled = false;
            textInput.focus();
          } else {
            textInput.disabled = true;
            textInput.value = "";
          }
        } else if (inputType === "checkbox") {
          if (otherEl.checked) {
            textInput.disabled = false;
          } else {
            textInput.disabled = true;
            textInput.value = "";
          }
        }
      });
    });
  }

  setupOtherInput("radio", "job", "job_other", "job_text");
  setupOtherInput("checkbox", "purpose", "purpose_other", "purpose_text");
  setupOtherInput("radio", "goal", "goal_other", "goal_text");
  setupOtherInput("checkbox", "language", "lang_other", "lang_text");
  setupOtherInput("checkbox", "field", "field_other", "field_text");

  // --- 3. GIỚI HẠN CHỌN TỐI ĐA 2 ĐÁP ÁN (CÂU 2) ---
  const purposeCheckboxes = document.querySelectorAll('input[name="purpose"]');
  purposeCheckboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      const checkedCount = document.querySelectorAll(
        'input[name="purpose"]:checked',
      ).length;
      if (checkedCount > 2) {
        cb.checked = false;
        alert("Bạn chỉ được chọn tối đa 2 mục!");
        if (cb.id === "purpose_other") {
          document.getElementById("purpose_text").disabled = true;
          document.getElementById("purpose_text").value = "";
        }
      }
    });
  });

  // --- 4. ẨN/HIỆN CÂU HỎI PHỤ THEO ĐIỀU KIỆN (CÂU 4) ---
  const experienceRadios = document.querySelectorAll(
    'input[name="experience"]',
  );
  const subLanguageSection = document.getElementById("sub_language_section");
  const languageCheckboxes = document.querySelectorAll(
    'input[name="language"]',
  );
  const langTextInput = document.getElementById("lang_text");

  experienceRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value.includes("Có")) {
        subLanguageSection.style.display = "block";
      } else {
        subLanguageSection.style.display = "none";
        languageCheckboxes.forEach((cb) => (cb.checked = false));
        langTextInput.disabled = true;
        langTextInput.value = "";
      }
    });
  });

  // --- 5. XỬ LÝ LƯU KẾT QUẢ KHI SUBMIT FORM (KHÔNG CHẤM ĐIỂM) ---
  document
    .getElementById("surveyForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const formData = new FormData(this);
      let finalSurveyData = {};

      // Khởi tạo các mảng cho câu hỏi chọn nhiều (checkbox) để gom dữ liệu lại cho gọn
      finalSurveyData.purpose = [];
      finalSurveyData.language = [];
      finalSurveyData.field = [];

      for (let [key, value] of formData.entries()) {
        // Xử lý giá trị nếu người dùng chọn "Khác" công nghệ nhập tay
        if (value === "other") {
          if (key === "job")
            value = document.getElementById("job_text").value.trim();
          if (key === "purpose")
            value = document.getElementById("purpose_text").value.trim();
          if (key === "goal")
            value = document.getElementById("goal_text").value.trim();
          if (key === "language")
            value = document.getElementById("lang_text").value.trim();
          if (key === "field")
            value = document.getElementById("field_text").value.trim();

          if (!value) {
            alert("Vui lòng điền thông tin vào ô 'Khác'!");
            return;
          }
        }

        // Phân loại lưu trữ: nếu là mảng chọn nhiều thì đẩy vào array, chọn một thì gán trực tiếp
        if (Array.isArray(finalSurveyData[key])) {
          finalSurveyData[key].push(value);
        } else {
          finalSurveyData[key] = value;
        }
      }

      // Định dạng lại các mảng thành chuỗi cách nhau bằng dấu phẩy cho sạch dữ liệu
      if (finalSurveyData.purpose.length > 0)
        finalSurveyData.purpose = finalSurveyData.purpose.join(", ");
      if (finalSurveyData.language.length > 0)
        finalSurveyData.language = finalSurveyData.language.join(", ");
      if (finalSurveyData.field.length > 0)
        finalSurveyData.field = finalSurveyData.field.join(", ");

      // ĐỐI TƯỢNG KẾT QUẢ CUỐI CÙNG SẴN SÀNG ĐỂ LƯU TRỮ
      console.log("DỮ LIỆU KHẢO SÁT THU THẬP ĐƯỢC:", finalSurveyData);

      try {
        const res = await fetch("/api/survey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(finalSurveyData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Không thể lưu khảo sát.");

        showThanksModal();
      } catch (err) {
        alert(err.message || "Không thể lưu khảo sát, vui lòng thử lại.");
      }
    });

  function showThanksModal() {
    const overlay = document.getElementById("thanksOverlay");
    const okBtn = document.getElementById("thanksOkBtn");
    if (!overlay || !okBtn) return;

    overlay.classList.add("show");
    overlay.setAttribute("aria-hidden", "false");

    okBtn.onclick = function () {
      window.location.href = "/dashboard";
    };
  }
});
