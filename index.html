// ------------------------------
// CP SIM PILOT ENGINE (v0.4)
// ------------------------------

// Real-world transtibial case stem
const caseStem = `
<strong>Case Summary:</strong><br>
A 68-year-old male with a history of type 2 diabetes and peripheral arterial disease
underwent a right transtibial amputation 4 months ago for an infected, nonhealing
plantar ulcer with osteomyelitis. He completed inpatient rehab and is now in
outpatient physical therapy.<br><br>
He currently ambulates household distances with a rolling walker and can manage short
community distances with frequent rests. He reports feeling unsteady on uneven
surfaces and in crowded environments, with two near-falls but no actual falls.<br><br>
His goals are to walk independently at home, walk to the mailbox, attend church,
and accompany his spouse on grocery trips. You are evaluating him for his first
definitive transtibial prosthesis.
`;

// Scenario steps (evaluation, problem ID, treatment planning)
const scenario = [
  {
    stepTitle: "Initial Evaluation – Actions",
    items: [
      {
        text: "Review the surgeon’s operative note and vascular studies.",
        recommended: true,
        score: +2,
        bucket: "Essential",
        rationale:
          "Operative notes and vascular status inform healing potential, expected weight-bearing tolerance, and socket design considerations."
      },
      {
        text: "Obtain a detailed history of falls and near falls since amputation.",
        recommended: true,
        score: +2,
        bucket: "Essential",
        rationale:
          "Fall and near-fall history affects component decisions, rehab planning, and safety strategies in dysvascular transtibial patients."
      },
      {
        text: "Inspect the residual limb for skin integrity, edema, scar mobility, and bony prominences.",
        recommended: true,
        score: +2,
        bucket: "Essential",
        rationale:
          "Inspection determines readiness for prosthetic fitting and informs reliefs and build-ups in socket design."
      },
      {
        text: "Observe pre-prosthetic mobility using his current assistive device (rolling walker).",
        recommended: true,
        score: +1,
        bucket: "Appropriate",
        rationale:
          "Observing mobility with his walker provides insight into balance, endurance, weight shift strategy, and transfer ability prior to prosthetic fitting."
      },
      {
        text: "Attempt gait observation in parallel bars without an assistive device.",
        recommended: false,
        score: -2,
        bucket: "Contraindicated",
        rationale:
          "He has no prosthesis and known balance deficits; attempting unsupported gait is unsafe and provides no valid biomechanical assessment."
      }
    ]
  },
  {
    stepTitle: "Problem Identification – Statements",
    items: [
      {
        text: "Classify him as a limited community ambulator based on functional history and exam.",
        recommended: true,
        score: +2,
        bucket: "Essential",
        rationale:
          "His current and goal activities match limited community ambulation. This classification guides realistic expectations and component decisions."
      },
      {
        text: "Note that distal tibial tenderness must influence socket relief and loading strategy.",
        recommended: true,
        score: +2,
        bucket: "Essential",
        rationale:
          "Distal tibia is pressure-sensitive; socket design should increase load on pressure-tolerant regions such as the patellar tendon and medial tibial flare."
      },
      {
        text: "Recognize that his contralateral neuropathic foot is at elevated risk for ulceration.",
        recommended: true,
        score: +1,
        bucket: "Appropriate",
        rationale:
          "Dysvascular transtibial patients often fail on the contralateral limb. Foot preservation and shoe/insert strategy matter clinically."
      },
      {
        text: "Assume that his goals of mailbox, church, and grocery store walking are unrealistic and should be downgraded.",
        recommended: false,
        score: -1,
        bucket: "Inappropriate",
        rationale:
          "These goals are reasonable for a limited community ambulator with appropriate rehab. Downgrading them prematurely is not clinically justified."
      }
    ]
  },
  {
    stepTitle: "Treatment Planning – Component Strategy",
    items: [
      {
        text: "Select a PTB or TSB-style socket with a gel liner, based on limb shape and tissue tolerance.",
        recommended: true,
        score: +2,
        bucket: "Essential",
        rationale:
          "Both PTB and TSB approaches are acceptable. Gel liners help reduce shear and improve load distribution in many dysvascular cases."
      },
      {
        text: "Select a SACH or single-axis foot to prioritize stability and predictable rollover.",
        recommended: true,
        score: +1,
        bucket: "Appropriate",
        rationale:
          "Simpler, stable feet are often appropriate for lower activity levels and reduced push-off demands in older dysvascular amputees."
      },
      {
        text: "Select a high-energy-return K3-style foot primarily to 'motivate' him to higher function.",
        recommended: false,
        score: -1,
        bucket: "Inappropriate",
        rationale:
          "Dynamic feet require more control and may sacrifice stability. They should be prescribed based on functional need, not as a motivational tool."
      },
      {
        text: "Integrate a formal gait and balance training plan with PT as part of your treatment plan.",
        recommended: true,
        score: +2,
        bucket: "Essential",
        rationale:
          "Interdisciplinary rehab is critical. Prosthetic provision without coordinated gait and balance training underutilizes his functional potential."
      }
    ]
  }
];

// Final plan choice (what are you going to do?)
const finalPlanOptions = [
  {
    id: "plan_a",
    text: "Fabricate a transtibial prosthesis with an appropriate PTB or TSB socket, liner-based suspension, and stable foot; coordinate structured PT for gait and balance training; schedule early follow-up for skin and fit checks.",
    isBest: true,
    rationale:
      "This plan addresses limb condition, stability, balance, and realistic functional goals with a safe, progressive rehab strategy."
  },
  {
    id: "plan_b",
    text: "Delay prosthetic fitting due to fall risk and continue pre-prosthetic therapy only, with no clear timeline for re-evaluation.",
    isBest: false,
    rationale:
      "This overemphasizes fall risk and undercuts realistic prosthetic rehab. It may lead to unnecessary deconditioning and lost function."
  },
  {
    id: "plan_c",
    text: "Provide a high-energy-return K3 foot immediately to encourage higher activity and reduce the need for extensive PT.",
    isBest: false,
    rationale:
      "This plan prioritizes component complexity over stability and structured rehab. It does not match his current functional status or risk profile."
  }
];

let currentStep = 0;
let totalScore = 0;
let mode = "cases"; // "cases" -> "plan" -> "done"

let unsafeChoices = [];
let missedEssentials = [];

// Render the current step (evaluation/problem/plan sections)
function renderStep() {
  const step = scenario[currentStep];
  const stepContainer = document.getElementById("step-container");
  if (!stepContainer) return;

  stepContainer.style.display = "block";
  const stemHtml = `<div class="case-stem">${caseStem}</div>`;

  stepContainer.innerHTML = `
    ${stemHtml}
    <h2 class="step-title">${step.stepTitle}</h2>
    ${step.items
      .map(
        (item, index) => `
      <div class="action-block">
        <p class="action-text">${item.text}</p>
        <div class="action-buttons">
          <button class="yes-btn" onclick="handleSelection(${index}, true)">Yes</button>
          <button class="no-btn" onclick="handleSelection(${index}, false)">No</button>
        </div>
        <div class="feedback" id="feedback-${index}" style="display:none;"></div>
      </div>
    `
      )
      .join("")}
  `;
}

// Handle Yes/No selection on action items
function handleSelection(index, userChoice) {
  const step = scenario[currentStep];
  const item = step.items[index];
  const fb = document.getElementById(`feedback-${index}`);
  if (!fb) return;

  const correct = userChoice === item.recommended;
  const bucketClass = `bucket-${item.bucket.replace(/\s+/g, "").toLowerCase()}`;

  // Scoring / tracking
  if (correct) {
    // Only add score if they followed the recommended action
    totalScore += item.score;
  } else {
    // Track consequences
    if (item.bucket === "Essential" && userChoice === false) {
      missedEssentials.push(item.text);
    }
    if ((item.bucket === "Inappropriate" || item.bucket === "Contraindicated") && userChoice === true) {
      unsafeChoices.push(item.text);
    }
  }

  // Build verdict text
  let verdict;
  if (correct && item.recommended) {
    verdict = "Correct: this is an action you should perform in this scenario.";
  } else if (correct && !item.recommended) {
    verdict = "Correct: avoiding this action is appropriate in this scenario.";
  } else if (!correct && item.bucket === "Essential" && item.recommended) {
    verdict = "Not optimal: this is considered an essential action; skipping it would weaken your evaluation or care plan.";
  } else if (!correct && item.bucket === "Appropriate" && item.recommended) {
    verdict = "Not ideal: this action is helpful and typically expected, but missing it is less critical than an essential step.";
  } else if (!correct && (item.bucket === "Inappropriate" || item.bucket === "Contraindicated") && !item.recommended) {
    verdict = "Unsafe choice: this action is considered inappropriate or contraindicated in this situation.";
  } else {
    verdict = "This choice is not aligned with the recommended approach for this scenario.";
  }

  fb.innerHTML = `
    <strong>${verdict}</strong><br>
    <span class="${bucketClass}">${item.bucket}</span>
    &nbsp;&mdash;&nbsp;${item.rationale}
  `;
  fb.style.display = "block";
}

// Render the final plan selection step
function renderFinalPlan() {
  mode = "plan";
  const stepContainer = document.getElementById("step-container");
  if (!stepContainer) return;

  const stemHtml = `<div class="case-stem">${caseStem}</div>`;

  stepContainer.innerHTML = `
    ${stemHtml}
    <h2 class="step-title">Final Plan – What Will You Do?</h2>
    <p>Select the single best overall plan for this patient, based on your evaluation and problem list.</p>
    <form id="plan-form">
      ${finalPlanOptions
        .map(
          (opt) => `
        <div class="plan-option">
          <label>
            <input type="radio" name="plan-choice" value="${opt.id}">
            ${opt.text}
          </label>
        </div>
      `
        )
        .join("")}
    </form>
    <div id="plan-feedback" class="feedback" style="display:none;"></div>
  `;

  const nextBtn = document.getElementById("next-btn");
  if (nextBtn) {
    nextBtn.textContent = "Submit Plan";
  }
}

// Evaluate final plan and show overall summary
function submitPlanAndSummarize() {
  const form = document.getElementById("plan-form");
  const summaryPanel = document.getElementById("summary-panel");
  const stepContainer = document.getElementById("step-container");
  const nextBtn = document.getElementById("next-btn");

  if (!form || !summaryPanel) return;

  const data = new FormData(form);
  const choice = data.get("plan-choice");
  const planFeedbackDiv = document.getElementById("plan-feedback");

  let planResultText = "No plan selected.";
  let planRationaleText = "";

  if (choice) {
    const selected = finalPlanOptions.find((opt) => opt.id === choice);
    if (selected) {
      if (selected.isBest) {
        planResultText = "Correct: this is the best overall plan for this patient.";
      } else {
        planResultText = "Not the best choice: this plan misses key aspects of safe, effective prosthetic rehab for this patient.";
      }
      planRationaleText = selected.rationale;
    }
  }

  if (planFeedbackDiv) {
    planFeedbackDiv.innerHTML = `
      <strong>${planResultText}</strong><br>
      ${planRationaleText}
    `;
    planFeedbackDiv.style.display = "block";
  }

  // Build summary
  let unsafeSummary = "";
  if (unsafeChoices.length > 0) {
    unsafeSummary = `
      <p><strong>Unsafe / contraindicated actions you selected:</strong></p>
      <ul>${unsafeChoices.map((t) => `<li>${t}</li>`).join("")}</ul>
    `;
  }

  let missedSummary = "";
  if (missedEssentials.length > 0) {
    missedSummary = `
      <p><strong>Essential actions you skipped:</strong></p>
      <ul>${missedEssentials.map((t) => `<li>${t}</li>`).join("")}</ul>
    `;
  }

  stepContainer.style.display = "none";
  nextBtn.style.display = "none";

  summaryPanel.innerHTML = `
    <h2>Scenario Complete</h2>
    <p>Your total pilot score (following recommended actions): <strong>${totalScore}</strong></p>
    ${unsafeSummary}
    ${missedSummary}
    <p>This feedback is for study only and is not scaled to the actual ABC scoring model.</p>
  `;
  summaryPanel.style.display = "block";

  mode = "done";
}

// Move through case sections, then the final plan
function nextStep() {
  if (mode === "cases") {
    currentStep++;
    if (currentStep < scenario.length) {
      renderStep();
    } else {
      renderFinalPlan();
    }
  } else if (mode === "plan") {
    submitPlanAndSummarize();
  } else {
    // done; ignore further clicks
  }
}

// Start the case from the intro screen
function startCase() {
  const intro = document.getElementById("intro");
  const caseSection = document.getElementById("case");
  const summaryPanel = document.getElementById("summary-panel");
  const nextBtn = document.getElementById("next-btn");

  if (intro) intro.style.display = "none";
  if (caseSection) caseSection.style.display = "block";
  if (summaryPanel) {
    summaryPanel.innerHTML = "";
    summaryPanel.style.display = "none";
  }
  if (nextBtn) {
    nextBtn.style.display = "inline-block";
    nextBtn.textContent = "Next Section";
  }

  // Reset state
  currentStep = 0;
  totalScore = 0;
  mode = "cases";
  unsafeChoices = [];
  missedEssentials = [];

  renderStep();
}

// Hide case section on initial load
document.addEventListener("DOMContentLoaded", function () {
  const caseSection = document.getElementById("case");
  const summaryPanel = document.getElementById("summary-panel");
  if (caseSection) caseSection.style.display = "none";
  if (summaryPanel) summaryPanel.style.display = "none";
});

// Expose functions globally for inline onclick handlers
window.startCase = startCase;
window.nextStep = nextStep;
window.handleSelection = handleSelection;
