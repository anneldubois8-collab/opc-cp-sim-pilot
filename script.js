// ------------------------------
// CP SIM PILOT ENGINE (v0.1)
// ------------------------------

// Data model for the pilot scenario
// Each step contains:
// - text: question or action
// - options: array of Yes/No actions
// - feedback: rationale text to display on selection
// - score: category classification (for future analytics)
//
// Score buckets:
//   +2 = Essential
//   +1 = Appropriate
//    0 = Low Value
//   -1 = Inappropriate
//   -2 = Contraindicated
//
// For now we only display rationale + simple color coding
// We store scores silently for the summary panel later.

const scenario = [
  {
    stepTitle: "Initial Evaluation",
    items: [
      {
        text: "Review surgeon’s operative note and vascular studies.",
        score: +2,
        bucket: "Essential",
        rationale:
          "Operative notes and vascular status inform healing potential, expected weight bearing tolerance, and socket design considerations. This aligns with Atlas and AAOP eval practices."
      },
      {
        text: "Obtain detailed history of falls and near falls since amputation.",
        score: +2,
        bucket: "Essential",
        rationale:
          "Fall and near fall history affects component decisions and rehab planning. Safety and balance assessment are central in dysvascular TT patients."
      },
      {
        text: "Inspect residual limb for skin integrity, edema, scar mobility, and bony prominences.",
        score: +2,
        bucket: "Essential",
        rationale:
          "Inspection determines readiness for prosthetic fitting and informs relief and build-up needs for socket design."
      },
      {
        text: "Observe pre-prosthetic mobility using current assistive device.",
        score: +1,
        bucket: "Appropriate",
        rationale:
          "Observing mobility with the patient's walker provides insight into balance, endurance, weight shift strategy, and transfer ability prior to prosthetic fitting."
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
        text: "Limited community ambulator based on functional history.",
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
        text: "Contralateral neuropathic foot at elevated ulceration risk.",
        score: +1,
        bucket: "Appropriate",
        rationale:
          "Dysvascular TT patients often fail on the contralateral limb; foot preservation strategies and footwear matter clinically."
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
        text: "Select a SACH or single-axis foot for stability.",
        score: +1,
        bucket: "Appropriate",
        rationale:
          "Simpler, stable feet align with lower activity level and reduced push-off demands."
      },
      {
        text: "Select a high-energy-return foot to 'motivate' higher function.",
        score: -1,
        bucket: "Inappropriate",
        rationale:
          "Dynamic feet require greater control and may reduce stability in patients with balance deficits."
      }
    ]
  }
];

// ------------------------------
// STATE & UI LOGIC
// ------------------------------

let currentStep = 0;
let totalScore = 0;

const stepContainer = document.getElementById("step-container");
const nextBtn = document.getElementById("next-btn");
const summaryPanel = document.getElementById("summary-panel");

function renderStep() {
  const step = scenario[currentStep];
  stepContainer.innerHTML = `
    <h2 class="step-title">${step.stepTitle}</h2>
    ${step.items
      .map(
        (item, index) => `
      <div class="action-block">
        <p class="action-text">${item.text}</p>
        <button class="yes-btn" onclick="handleSelection(${index}, true)">Yes</button>
        <button class="no-btn" onclick="handleSelection(${index}, false)">No</button>
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

  // For pilot we score only if the action should be 'Yes'
  if (userChoice === true) totalScore += item.score;

  fb.innerHTML = `
    <span class="bucket-${item.bucket.replace(/\s+/g, '').toLowerCase()}">${item.bucket}</span>
    — ${item.rationale}
  `;
  fb.style.display = "block";
}

nextBtn.onclick = () => {
  currentStep++;
  if (currentStep < scenario.length) {
    renderStep();
  } else {
    showSummary();
  }
};

function showSummary() {
  stepContainer.style.display = "none";
  nextBtn.style.display = "none";
  summaryPanel.innerHTML = `
    <h2>Scenario Complete</h2>
    <p>Your total score (pilot mode): <strong>${totalScore}</strong></p>
    <p>This will later map to performance categories (e.g., Emerging, Competent, Proficient).</p>
  `;
  summaryPanel.style.display = "block";
}

// initialize
renderStep();
