// ------------------------------
// CP SIM PILOT ENGINE (v0.3)
// ------------------------------

// Pilot transtibial scenario data
const scenario = [
  {
    stepTitle: "Initial Evaluation",
    items: [
      {
        text: "Review surgeon’s operative note and vascular studies.",
        score: +2,
        bucket: "Essential",
        rationale:
          "Operative notes and vascular status inform healing potential, expected weight bearing tolerance, and socket design considerations."
      },
      {
        text: "Obtain detailed history of falls and near falls since amputation.",
        score: +2,
        bucket: "Essential",
        rationale:
          "Fall and near fall history affects component decisions and rehab planning. Safety and balance assessment are central in dysvascular transtibial patients."
      },
      {
        text: "Inspect residual limb for skin integrity, edema, scar mobility, and bony prominences.",
        score: +2,
        bucket: "Essential",
        rationale:
          "Inspection determines readiness for prosthetic fitting and informs relief and build-up needs for socket design."
      },
      {
        text: "Observe pre-prosthetic mobility using the current assistive device.",
        score: +1,
        bucket: "Appropriate",
        rationale:
          "Observing mobility with the patient’s walker provides insight into balance, endurance, weight shift strategy, and transfer ability prior to prosthetic fitting."
      },
      {
        text: "Attempt gait observation in parallel bars without an assistive device.",
        score: -2,
        bucket: "Contraindicated",
        rationale:
          "This patient has no prosthesis and balance deficits; attempting unsupported gait is unsafe and provides no valid biomechanical assessment."
      }
    ]
  },
  {
    stepTitle: "Problem Identification",
    items: [
      {
        text: "Limited community ambulator based on functional history and exam.",
        score: +2,
        bucket: "Essential",
        rationale:
          "Goals and observed performance match the functional expectations for limited community ambulation."
      },
      {
        text: "Distal tibial tenderness must influence socket relief strategy.",
        score: +2,
        bucket: "Essential",
        rationale:
          "Distal tibia is pressure-sensitive; socket design should load pressure-tolerant regions such as the patellar tendon and medial tibial flare."
      },
      {
        text: "Contralateral neuropathic foot is at elevated ulceration risk.",
        score: +1,
        bucket: "Appropriate",
        rationale:
          "Dysvascular transtibial patients commonly fail on the contralateral limb; foot preservation strategies and footwear matter clinically."
      }
    ]
  },
  {
    stepTitle: "Treatment Plan",
    items: [
      {
        text: "Select a PTB or TSB socket with gel liner based on limb tolerance.",
        score: +2,
        bucket: "Essential",
        rationale:
          "Both PTB and TSB approaches are acceptable; liners reduce shear and improve load distribution in dysvascular cases."
      },
      {
        text: "Select a SACH or single-axis foot to prioritize stability.",
        score: +1,
        bucket: "Appropriate",
        rationale:
          "Simpler, stable feet align with lower activity level and reduced push-off demands."
      },
      {
        text: "Select a high-energy-return foot primarily to 'motivate' higher function.",
        score: -1,
        bucket: "Inappropriate",
        rationale:
          "Dynamic feet require greater control and may reduce stability in patients with balance deficits and dysvascular etiology."
      }
    ]
  }
];

let currentStep = 0;
let totalScore = 0;

// Renders the current step into #step-container
function renderStep() {
  const step = scenario[currentStep];
  const stepContainer = document.getElementById("step-container");

  if (!stepContainer) return;

  stepContainer.innerHTML = `
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

// Called when user clicks Yes/No on an action
function handleSelection(index, userChoice) {
  const step = scenario[currentStep];
  const item = step.items[index];
  const fb = document.getElementById(`feedback-${index}`);

  if (!fb) return;

  // For pilot: only score when user chooses "Yes"
  if (userChoice === true) {
    totalScore += item.score;
  }

  const bucketClass = `bucket-${item.bucket.replace(/\s+/g, "").toLowerCase()}`;

  fb.innerHTML = `
    <span class="${bucketClass}">${item.bucket}</span>
    — ${item.rationale}
  `;
  fb.style.display = "block";
}

// Shows the summary panel at the end
function showSummary() {
  const stepContainer = document.getElementById("step-container");
  const nextBtn = document.getElementById("next-btn");
  const summaryPanel = document.getElementById("summary-panel");

  if (stepContainer) stepContainer.style.display = "none";
  if (nextBtn) nextBtn.style.display = "none";

  if (summaryPanel) {
    summaryPanel.innerHTML = `
      <h2>Scenario Complete</h2>
      <p>Your total pilot score: <strong>${totalScore}</strong></p>
      <p>This score is for study purposes only. In future versions, it can be mapped to performance categories (e.g., Emerging, Competent, Proficient).</p>
    `;
    summaryPanel.style.display = "block";
  }
}

// Next section button
function nextStep() {
  currentStep++;
  if (currentStep < scenario.length) {
    renderStep();
  } else {
    showSummary();
  }
}

// Start Case button
function startCase() {
  const intro = document.getElementById("intro");
  const caseSection = document.getElementById("case");
  const summaryPanel = document.getElementById("summary-panel");
  const stepContainer = document.getElementById("step-container");
  const nextBtn = document.getElementById("next-btn");

  if (intro) intro.style.display = "none";
  if (caseSection) caseSection.style.display = "block";

  currentStep = 0;
  totalScore = 0;

  if (summaryPanel) summaryPanel.style.display = "none";
  if (stepContainer) stepContainer.style.display = "block";
  if (nextBtn) nextBtn.style.display = "inline-block";

  renderStep();
}

// Hide case section on initial load
document.addEventListener("DOMContentLoaded", function () {
  const caseSection = document.getElementById("case");
  if (caseSection) {
    caseSection.style.display = "none";
  }
});

// Expose functions globally for inline onclick handlers
window.handleSelection = handleSelection;
window.startCase = startCase;
window.nextStep = nextStep;
