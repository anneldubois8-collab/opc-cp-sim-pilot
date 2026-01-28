// CP SIM PILOT ENGINE (v0.5) — branching "choose your own adventure"

const state = {
  facts: {},
  flags: {},
  score: 0,
  log: []
};

// Utility: set fact + log it
function learn(key, value) {
  state.facts[key] = value;
  state.log.push({ type: "fact", key, value });
}

function flag(key, value = true) {
  state.flags[key] = value;
  state.log.push({ type: "flag", key, value });
}

// ------------------------------
// CASE CONTENT
// ------------------------------

const caseStemHtml = `
  <div class="case-stem">
    <strong>Case Summary:</strong><br>
    68-year-old male, DM2 + PAD, right transtibial amputation 4 months ago for infected nonhealing plantar ulcer with osteomyelitis.
    Completed inpatient rehab, now outpatient PT. Household ambulator with RW, short community distances with rests.
    Reports unsteadiness on uneven ground and in crowds, two near-falls. Goals: independent household walking, mailbox, church, grocery trips.
  </div>
`;

// Nodes: each node has an id, title, actions, and a next() function that can branch
const nodes = {
  start_eval: {
    title: "Initial Evaluation – What do you do first?",
    actions: [
      {
        text: "Review surgeon operative note and vascular studies.",
        recommended: true,
        onYes: () => {
          learn("vascularStatus", "ABI 0.65; vascular surgeon note: slow healing risk but cleared for prosthetic rehab");
          learn("surgicalDetails", "TT length ~12 cm; posterior flap viable; mild knee flexion contracture noted");
          return {
            reveal: `
              <strong>Chart excerpt:</strong> ABI 0.65. Vascular note: “moderate PAD; healing risk elevated; cleared for progressive prosthetic rehab.”
              Operative note: “TT length ~12 cm; posterior flap viable; mild knee flexion contracture.”
            `
          };
        },
        onNo: () => {
          flag("missedChartReview");
          return {
            reveal: `<strong>Missed info:</strong> You proceed without objective vascular/surgical context, increasing downstream risk of wrong expectations and socket strategy.`
          };
        }
      },
      {
        text: "Take detailed fall and near-fall history since amputation.",
        recommended: true,
        onYes: () => {
          learn("fallProfile", "2 near-falls, avoids uneven ground and crowded environments, moderate fear of falling");
          return {
            reveal: `
              <strong>History detail:</strong> Two near-falls in the last month while turning and when stepping off a curb.
              Patient avoids uneven surfaces and crowded areas; moderate fear of falling.
            `
          };
        },
        onNo: () => {
          flag("missedFallHistory");
          return { reveal: `<strong>Missed info:</strong> You do not quantify fall risk triggers, which later affects component and training decisions.` };
        }
      },
      {
        text: "Attempt gait observation in parallel bars without an assistive device.",
        recommended: false,
        onYes: () => {
          flag("unsafeClinicEvent");
          state.score -= 2;
          return {
            reveal: `
              <strong>Event:</strong> Patient loses balance during first step attempt. You catch him, but this is a near-fall.
              You must re-establish safety before continuing.
            `
          };
        },
        onNo: () => ({ reveal: `<strong>Good safety call:</strong> No prosthesis + balance deficits makes unsupported gait unsafe and non-informative.` })
      }
    ],
    next: () => {
      // Branching logic example:
      // If unsafe event occurred, force a safety remediation node.
      if (state.flags.unsafeClinicEvent) return "safety_recovery";

      // If chart review was missed, route to a complication-prone path
      if (state.flags.missedChartReview) return "eval_without_chart";

      // Otherwise continue to standard problem identification
      return "problem_id";
    }
  },

  safety_recovery: {
    title: "Safety Recovery – What do you do after the near-fall?",
    actions: [
      {
        text: "Reassess vitals, review safety, and continue mobility observation with the rolling walker only.",
        recommended: true,
        onYes: () => {
          learn("safetyPlan", "Return to RW only; document near-fall; reinforce guarding and environment control");
          state.score += 1;
          return { reveal: `<strong>Action outcome:</strong> Patient stabilizes. You document the near-fall and proceed with safer observation.` };
        },
        onNo: () => {
          state.score -= 1;
          return { reveal: `<strong>Consequence:</strong> Skipping safety remediation increases risk and weakens clinical reasoning documentation.` };
        }
      }
    ],
    next: () => "problem_id"
  },

  eval_without_chart: {
    title: "You skipped chart review – New information shows up later",
    actions: [
      {
        text: "Proceed with casting and socket plan without obtaining vascular/surgical details.",
        recommended: false,
        onYes: () => {
          flag("higherBreakdownRisk");
          return {
            reveal: `
              <strong>Consequence:</strong> Two weeks later, patient presents with distal anterior redness and delayed skin recovery.
              You now must backtrack and obtain the information you skipped.
            `
          };
        },
        onNo: () => {
          // They correct course
          learn("chartRecovered", "You obtain operative note and vascular studies before finalizing the plan");
          return { reveal: `<strong>Course correction:</strong> You pause and obtain the missing chart details before proceeding.` };
        }
      }
    ],
    next: () => "problem_id"
  },

  problem_id: {
    title: "Problem Identification – What stands out?",
    actions: [
      {
        text: "Identify fall risk triggers and prioritize stability + training progression.",
        recommended: true,
        onYes: () => {
          state.score += 2;
          return { reveal: `<strong>Clinical impact:</strong> Your plan will emphasize stability, predictable rollover, and structured gait/balance training.` };
        },
        onNo: () => {
          state.score -= 1;
          return { reveal: `<strong>Missed opportunity:</strong> Ignoring fall triggers leads to weaker component selection and rehab planning.` };
        }
      },
      {
        text: "Address mild knee flexion contracture in alignment and rehab plan (if present).",
        recommended: true,
        onYes: () => {
          if (state.facts.surgicalDetails) {
            learn("contracturePlan", "Alignment + stretching plan; avoid excessive posterior brim pressure; PT coordination");
            state.score += 1;
            return { reveal: `<strong>Because you reviewed the op note:</strong> You integrate a contracture-aware plan and coordinate with PT.` };
          }
          // If they didn’t learn it, they can’t properly justify it
          state.score += 0;
          return { reveal: `<strong>Note:</strong> You did not document objective contracture data earlier; your plan is less defensible.` };
        },
        onNo: () => ({ reveal: `<strong>Risk:</strong> Unaddressed contracture can compromise alignment, knee stability, and gait efficiency.` })
      }
    ],
    next: () => "final_plan"
  },

  final_plan: {
    title: "Final Plan – Choose the best overall approach",
    type: "single_choice",
    options: () => {
      // Options can change based on learned facts
      const hasFallProfile = !!state.facts.fallProfile;
      const hasVascular = !!state.facts.vascularStatus;

      return [
        {
          id: "plan_best",
          text: `Proceed with TT prosthesis using a stability-prioritized foot, liner-based system as appropriate, and a structured PT gait/balance program with early skin checks${hasVascular ? " accounting for PAD healing risk" : ""}${hasFallProfile ? " and documented near-fall triggers" : ""}.`,
          isBest: true,
          rationale: "Matches safety needs, dysvascular tissue tolerance, predictable rollover, and rehab progression."
        },
        {
          id: "plan_delay",
          text: "Delay prosthetic fitting due to fall risk; continue pre-prosthetic PT only with no defined prosthetic timeline.",
          isBest: false,
          rationale: "Overcorrects for risk, promotes deconditioning, and fails to meet functional goals."
        },
        {
          id: "plan_k3",
          text: "Provide a high-energy-return K3 foot immediately to encourage higher activity and reduce PT needs.",
          isBest: false,
          rationale: "Increases control demands and can reduce stability; not justified by current function or fall profile."
        }
      ];
    },
    next: () => "summary"
  },

  summary: {
    title: "Scenario Complete",
    type: "summary"
  }
};

// ------------------------------
// RENDERING
// ------------------------------

let currentNodeId = "start_eval";

function render() {
  const stepContainer = document.getElementById("step-container");
  const summaryPanel = document.getElementById("summary-panel");
  const nextBtn = document.getElementById("next-btn");

  if (!stepContainer || !summaryPanel || !nextBtn) return;

  summaryPanel.style.display = "none";
  stepContainer.style.display = "block";
  nextBtn.style.display = "inline-block";
  nextBtn.textContent = "Next";

  const node = nodes[currentNodeId];

  // Summary node
  if (node.type === "summary") {
    stepContainer.style.display = "none";
    nextBtn.style.display = "none";
    summaryPanel.innerHTML = `
      <h2>${node.title}</h2>
      <p><strong>Score (pilot):</strong> ${state.score}</p>
      <p><strong>Learned facts:</strong></p>
      <ul>${Object.entries(state.facts).map(([k,v]) => `<li>${k}: ${String(v)}</li>`).join("")}</ul>
      <p><strong>Flags:</strong></p>
      <ul>${Object.entries(state.flags).map(([k,v]) => `<li>${k}: ${String(v)}</li>`).join("")}</ul>
    `;
    summaryPanel.style.display = "block";
    return;
  }

  // Build node HTML
  let html = `${caseStemHtml}<h2 class="step-title">${node.title}</h2>`;

  if (node.type === "single_choice") {
    const options = node.options();
    html += `<p>Select the single best plan:</p><form id="plan-form">`;
    for (const opt of options) {
      html += `
        <div class="plan-option">
          <label>
            <input type="radio" name="plan" value="${opt.id}">
            ${opt.text}
          </label>
        </div>`;
    }
    html += `</form><div class="feedback" id="node-feedback" style="display:none;"></div>`;
    stepContainer.innerHTML = html;

    // Next button submits
    nextBtn.onclick = () => {
      const form = document.getElementById("plan-form");
      const fb = document.getElementById("node-feedback");
      const choice = new FormData(form).get("plan");
      const selected = options.find(o => o.id === choice);

      if (!selected) {
        fb.style.display = "block";
        fb.innerHTML = `<strong>Please select a plan.</strong>`;
        return;
      }

      fb.style.display = "block";
      fb.innerHTML = selected.isBest
        ? `<strong>Correct.</strong> ${selected.rationale}`
        : `<strong>Not the best choice.</strong> ${selected.rationale}`;

      currentNodeId = node.next();
      // brief pause not required; user clicks Next again
      nextBtn.textContent = "Finish";
      nextBtn.onclick = () => render();
    };

    return;
  }

  // Standard action node
  html += node.actions.map((a, idx) => `
    <div class="action-block">
      <p class="action-text">${a.text}</p>
      <div class="action-buttons">
        <button class="yes-btn" data-idx="${idx}" data-ans="yes">Yes</button>
        <button class="no-btn" data-idx="${idx}" data-ans="no">No</button>
      </div>
      <div class="feedback" id="fb-${idx}" style="display:none;"></div>
    </div>
  `).join("");

  stepContainer.innerHTML = html;

  // Attach handlers
  stepContainer.querySelectorAll("button[data-idx]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = Number(e.currentTarget.getAttribute("data-idx"));
      const ans = e.currentTarget.getAttribute("data-ans");
      const action = node.actions[idx];
      const fb = document.getElementById(`fb-${idx}`);

      const choseYes = ans === "yes";
      const correct = choseYes === action.recommended;

      // Run side effects
      const result = choseYes ? action.onYes?.() : action.onNo?.();
      const reveal = result?.reveal ? `<br><br>${result.reveal}` : "";

      fb.style.display = "block";
      fb.innerHTML = correct
        ? `<strong>Correct.</strong>${reveal}`
        : `<strong>Not ideal.</strong>${reveal}`;
    });
  });

  // Next button moves to computed next node
  nextBtn.onclick = () => {
    currentNodeId = node.next();
    render();
  };
}

// ------------------------------
// START/INIT
// ------------------------------

function startCase() {
  const intro = document.getElementById("intro");
  const caseSection = document.getElementById("case");

  if (intro) intro.style.display = "none";
  if (caseSection) caseSection.style.display = "block";

  // reset state
  state.facts = {};
  state.flags = {};
  state.score = 0;
  state.log = [];
  currentNodeId = "start_eval";

  render();
}

document.addEventListener("DOMContentLoaded", () => {
  const caseSection = document.getElementById("case");
  if (caseSection) caseSection.style.display = "none";
});

// expose
window.startCase = startCase;
