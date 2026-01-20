// ------------------------------
// CP SIM PILOT ENGINE (v0.2)
// ------------------------------

// Scenario data for the pilot TT case
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
        text: "Attempt gait observation in parallel bars without assistive device.",
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

let introSection;
let caseSection;
let stepContainer;
let nextBtn;
let summaryPanel;
let startBtn;

function renderStep() {
  const step = scenario[currentStep];
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

function handleSelection(index, userChoice) {
  const item = scenario[currentStep].items[index];
  const fb = document.getElementById(`feedback-${index}`);

  // For now, only score if the user chooses "Yes" on an action
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

function showSummary() {
  stepContainer.style.display = "none";
  nextBtn.style.display = "none";
  summaryPanel.innerHTML = `
    <h2>Scenario Complete</h2>
    <p>Your total pilot score: <strong>${totalScore}</strong></p>
    <p>This score is for study purposes only. In future versions, this will be mapped to performance categories (e.g., Emerging, Competent, Proficient).</p>
  `;
  summaryPanel.style.display = "block";
}

function goToNextStep() {
  currentStep++;
  if (currentStep < scenario.length) {
    renderStep();
  } else {
    showSummary();
  }
}

function startCase() {
  // Hide intro, show case
  introSection.style.display = "none";
  caseSection.style.display = "block";

  // Reset state in case user replays
  currentStep = 0;
  totalScore = 0;
  summaryPanel.style.display = "none";
  stepContainer.style.display = "block";
  nextBtn.style.display = "inline-block";

  renderStep();
}

// Initialize after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  introSection = document.getElementById("intro");
  caseSection = document.getElementById("case");
  stepContainer = document.getElementById("step-container");
  nextBtn = document.getElementById("next-btn");
  summaryPanel = document.getElementById("summary-panel");
  startBtn = document.getElementById("start-btn");

  // Ensure case section is hidden initially
  if (caseSection) {
    caseSection.style.display = "none";
  }

  if (startBtn) {
    startBtn.addEventListener("click", startCase);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", goToNextStep);
  }
});

// Expose handleSelection globally for inline onclick
window.handleSelection = handleSelection;
