document.addEventListener("DOMContentLoaded", function () {
  // --- 1. ĐIỀU HƯỚNG CHUYỂN TRANG TỪNG BƯỚC ---
  const steps = document.querySelectorAll(".step");
  const nextBtns = document.querySelectorAll(".next-btn");
  const prevBtns = document.querySelectorAll(".prev-btn");
  const progressBar = document.getElementById("progressBar");
  let currentStep = 0;

  // Thứ tự step khớp với HTML:
  // 0  Q1  job            (radio)
  // 1  Q2  purpose        (checkbox, max 2)
  // 2  Q3  experience     (radio) + sub language
  // 3  Q4  level          (radio)
  // 4  Q5  skill_detail   (checkbox, optional)
  // 5  Q6  goal           (checkbox)
  // 6  Q7  domain         (checkbox, max 3)
  // 7  Q8  career_target  (radio)
  // 8  Q9  time           (radio)
  // 9  Q10 timeline       (radio)
  const STEP_REQUIRED = [
    { name: 'job',           otherId: 'job_other',     textId: 'job_text' },
    { name: 'purpose',       otherId: 'purpose_other', textId: 'purpose_text' },
    { name: 'experience',    otherId: null,             textId: null },
    { name: 'level',         otherId: null,             textId: null },
    { name: 'skill_detail',  otherId: 'skill_other',  textId: 'skill_text', optional: true },
    { name: 'goal',          otherId: 'goal_other',    textId: 'goal_text' },
    { name: 'domain',        otherId: 'domain_other',  textId: 'domain_text' },
    { name: 'career_target', otherId: 'career_other',  textId: 'career_text' },
    { name: 'time',          otherId: null,             textId: null },
    { name: 'timeline',      otherId: null,             textId: null },
  ];

  function isStepAnswered(stepIndex) {
    const req = STEP_REQUIRED[stepIndex];
    if (!req) return true;
    const hasSelection = document.querySelectorAll(`input[name="${req.name}"]:checked`).length > 0;
    if (!hasSelection) return !!req.optional;
    if (req.otherId && req.textId) {
      const otherChecked = document.querySelector(`#${req.otherId}:checked`);
      if (otherChecked && !document.getElementById(req.textId).value.trim()) return false;
    }
    // Q3 (step 2): nếu sub_language_section đang hiện thì bắt buộc chọn ít nhất 1 ngôn ngữ
    if (stepIndex === 2) {
      const langSection = document.getElementById('sub_language_section');
      if (langSection && langSection.style.display !== 'none') {
        const hasLang = document.querySelectorAll('input[name="language"]:checked').length > 0;
        if (!hasLang) return false;
        const langOther = document.querySelector('#lang_other:checked');
        if (langOther && !document.getElementById('lang_text').value.trim()) return false;
      }
    }
    return true;
  }

  function updateNextBtn() {
    const activeStep = steps[currentStep];
    if (!activeStep) return;
    const nextBtn = activeStep.querySelector('.next-btn');
    if (!nextBtn) return;
    nextBtn.classList.toggle('locked', !isStepAnswered(currentStep));
  }

  function updateForm() {
    steps.forEach((step, index) => {
      step.classList.toggle("active", index === currentStep);
    });
    const progress = (currentStep / (steps.length - 1)) * 100;
    progressBar.style.width = progress + "%";
    updateNextBtn();
  }

  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!isStepAnswered(currentStep)) {
        showStepError('Vui lòng trả lời câu hỏi bắt buộc trước khi tiếp tục.');
        shakeQuestion();
        return;
      }
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

  updateForm();

  document.getElementById("surveyForm").addEventListener("change", updateNextBtn);
  document.getElementById("surveyForm").addEventListener("input", updateNextBtn);

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
  setupOtherInput("checkbox", "language", "lang_other", "lang_text");
  setupOtherInput("checkbox", "skill_detail", "skill_other", "skill_text");
  setupOtherInput("checkbox", "goal", "goal_other", "goal_text");
  setupOtherInput("checkbox", "domain", "domain_other", "domain_text");
  setupOtherInput("radio", "career_target", "career_other", "career_text");

  // --- 3. GIỚI HẠN CHỌN TỐI ĐA (purpose: 2, domain: 3) ---
  function setupMaxCheck(name, max, otherId, textId) {
    document.querySelectorAll(`input[name="${name}"]`).forEach((cb) => {
      cb.addEventListener("change", () => {
        if (document.querySelectorAll(`input[name="${name}"]:checked`).length > max) {
          cb.checked = false;
          alert(`Bạn chỉ được chọn tối đa ${max} mục!`);
          if (otherId && cb.id === otherId) {
            document.getElementById(textId).disabled = true;
            document.getElementById(textId).value = "";
          }
        }
      });
    });
  }

  setupMaxCheck("purpose", 2, "purpose_other", "purpose_text");
  setupMaxCheck("domain", 3, "domain_other", "domain_text");

  // --- 4. ẨN/HIỆN CÂU HỎI PHỤ THEO ĐIỀU KIỆN (Q3 – experience) ---
  const experienceRadios = document.querySelectorAll('input[name="experience"]');
  const subLanguageSection = document.getElementById("sub_language_section");
  const languageCheckboxes = document.querySelectorAll('input[name="language"]');
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

  const preCheckedExperience = document.querySelector('input[name="experience"]:checked');
  if (preCheckedExperience && preCheckedExperience.value.includes("Có")) {
    subLanguageSection.style.display = "block";
  }

  // --- 5. VALIDATE TOÀN BỘ TRƯỚC KHI SUBMIT ---
  function validateAll() {
    for (let i = 0; i < steps.length; i++) {
      if (!isStepAnswered(i)) return i;
    }
    return -1;
  }

  function shakeQuestion() {
    const block = steps[currentStep].querySelector('.question-block');
    if (!block) return;
    block.classList.remove('shake');
    void block.offsetWidth;
    block.classList.add('shake');
    block.addEventListener('animationend', () => block.classList.remove('shake'), { once: true });
  }

  function showStepError(message) {
    const activeStep = steps[currentStep];
    let errEl = activeStep.querySelector('.step-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'step-error';
      activeStep.querySelector('.btn-group').before(errEl);
    }
    errEl.textContent = message;
    errEl.style.display = 'block';
    clearTimeout(errEl._hideTimer);
    errEl._hideTimer = setTimeout(() => { errEl.style.display = 'none'; }, 3000);
  }

  // --- 6. XỬ LÝ LƯU KẾT QUẢ KHI SUBMIT FORM ---
  document
    .getElementById("surveyForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const failingStep = validateAll();
      if (failingStep !== -1) {
        currentStep = failingStep;
        updateForm();
        showStepError('Vui lòng hoàn thành câu hỏi này trước khi gửi.');
        return;
      }

      const formData = new FormData(this);
      let finalSurveyData = {};

      finalSurveyData.purpose = [];
      finalSurveyData.goal = [];
      finalSurveyData.language = [];
      finalSurveyData.domain = [];
      finalSurveyData.skill_detail = [];

      const OTHER_TEXT_MAP = {
        job:            'job_text',
        purpose:        'purpose_text',
        goal:           'goal_text',
        language:       'lang_text',
        career_target:  'career_text',
        domain:         'domain_text',
        skill_detail:   'skill_text',
      };

      for (let [key, value] of formData.entries()) {
        if (value === "other") {
          const textId = OTHER_TEXT_MAP[key];
          if (textId) value = document.getElementById(textId).value.trim();
          if (!value) {
            alert("Vui lòng điền thông tin vào ô 'Khác'!");
            return;
          }
        }

        if (Array.isArray(finalSurveyData[key])) {
          finalSurveyData[key].push(value);
        } else {
          finalSurveyData[key] = value;
        }
      }

      ['purpose', 'goal', 'language', 'domain', 'skill_detail'].forEach((k) => {
        if (Array.isArray(finalSurveyData[k]) && finalSurveyData[k].length > 0) {
          finalSurveyData[k] = finalSurveyData[k].join(", ");
        }
      });

      console.log("DỮ LIỆU KHẢO SÁT THU THẬP ĐƯỢC:", finalSurveyData);

      try {
        const res = await fetch("/api/survey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(finalSurveyData),
        });
        const data = await res.json();
        if (!res.ok) {
          let errMsg = "Không thể lưu khảo sát.";
          if (typeof data.error === 'string') {
            errMsg = data.error;
          } else if (data.error && typeof data.error === 'object' && data.error.message) {
            errMsg = data.error.message;
          }
          throw new Error(errMsg);
        }

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
