// CP SIM PILOT ENGINE (v0.6) — branching with case file, unlocked info, and cause/effect

const state = {
  facts: {},
  flags: {},
  score: 0,
  unlocked: [],
  events: []
};

function learn(key, value, labelForUnlocked) {
  state.facts[key] = value;
  if (labelForUnlocked) {
    state.unlocked.push(labelForUnlocked);
  }
  renderSidePanels();
}

function flag(key, value = true) {
  state.flags[key] = value;
  renderSidePanels();
}

function addEvent(message) {
  state.events.push(message);
  const banner = document.getElementById("event-banner");
  if (banner) {
    banner.style.display = "block";
    banner.innerHTML = `<strong>Case Update:</strong> ${message}`;
  }
}

function clearEventBanner() {
  const banner = document.getElementById("event-banner");
  if (banner) banner.style.display = "none";
}

function renderSidePanels() {
  const casefile = document.getElementById("casefile-panel");
  const unlocked = document.getElementById("unlocked-panel");

  if (casefile) {
    const factsList = Object.entries(state.facts)
      .map(([k, v]) => `<li><strong>${k}:</strong> ${String(v)}</li>`)
      .join("");

    const flagsList = Object.entries(state.flags)
      .map(([k, v]) => `<li><strong>${k}:</strong> ${String(v)}</li>`)
      .join("");

    casefile.innerHTML = `
      <div><strong>Score (pilot):</strong> ${state.score}</div>
      <div style="margin-top:10px;"><strong>Facts on file:</strong></div>
      <ul>${factsList || "<li>None yet</li>"}</ul>
      <div style="margin-top:10px;"><strong>Flags:</strong></div>
      <ul>${flagsList || "<li>None</li>"}</ul>
    `;
  }

  if (unlocked) {
    const items = state.unlocked.map((x) => `<li>${x}</li>`).join("");
    unlocked.innerHTML = `<ul>${items || "<li>Nothing unlocked yet</li>"}</ul>`;
  }
}

const caseStemHtml = `
  <div class="case-stem">
    <strong>Case Summary:</strong><br>
    68-year-old male, DM2 + PAD, right transtibial amputation 4 months ago for infected nonhealing plantar ulcer with osteomyelitis.
    Completed inpatient rehab, now outpatient PT. Household ambulator with rolling walker, short community distances with rests.
    Reports unsteadiness on uneven ground and in crowds, two near-falls. Goals: independent household walking, mailbox, church, grocery trips.
  </div>
`;

// Nodes define steps. Each node can branch using next()
const nodes = {
  start_eval: {
    title: "Initial Evaluation – Which actions would you perform? (Select Yes or No for each.)",
    instruction: "For each item below, indicate whether you would perform this action during your evaluation of this patient.",
    actions: [
      {
        text: "Review referring physician notes, operative note, and vascular studies.",
        recommended: true,
        onYes: () => {
          learn(
            "vascularStatus",
            "ABI 0.65; moderate PAD; healing risk elevated; cleared for progressive prosthetic rehab",
            "Chart Review: ABI 0.65, moderate PAD, cleared for prosthetic rehab"
          );
          learn(
            "opNoteKey",
            "TT length ~12 cm; posterior flap viable; note indicates mild knee flexion contracture",
            "Op Note: TT length ~12 cm, posterior flap viable, mild knee flexion contracture noted"
          );
          addEvent("Chart review reveals moderate PAD and a mild knee flexion contracture documented in the operative note.");
          state.score += 2;
          return {
            verdict: "Correct.",
            detail:
              "You now have objective context that should drive ROM testing, socket/alignment planning, and expected tissue tolerance."
          };
        },
        onNo: () => {
          flag("missedChartReview");
          addEvent("You proceeded without reviewing key surgical and vascular information.");
          state.score -= 1;
          return {
            verdict: "Not ideal.",
            detail:
              "Skipping chart review increases risk of missing contracture, vascular tolerance, and surgical constraints that affect socket design and alignment."
          };
        }
      },
      {
        text: "Perform residual limb exam including skin, edema, scar mobility, and bony prominences.",
        recommended: true,
        onYes: () => {
          learn("limbSkin", "Healed incision, mild distal edema, anterior distal tibia sensitive", "Exam: healed incision, mild distal edema, distal tibial sensitivity");
          state.score += 2;
          return { verdict: "Correct.", detail: "This drives relief strategy and tissue tolerance decisions." };
        },
        onNo: () => {
          flag("missedLimbExam");
          state.score -= 2;
          return { verdict: "Incorrect.", detail: "This is a foundational exam step and is expected in real-world care." };
        }
      },
      {
        text: "Perform ROM testing at hip and knee, including contracture assessment.",
        recommended: true,
        onYes: () => {
          // Trick: ROM is most meaningful if the op note hinted at contracture
          const hinted = !!state.facts.opNoteKey;
          learn("kneeROM", "Knee extension limited to -10 degrees; flexion WNL", "ROM: knee extension -10 degrees, flexion WNL");
          if (hinted) {
            addEvent("ROM confirms a knee flexion contracture (-10 degrees extension). This must influence socket and alignment.");
            state.score += 2;
            return { verdict: "Correct.", detail: "You quantified the contracture. Now you must react with alignment and rehab planning." };
          }
          state.score += 1;
          return {
            verdict: "Good.",
            detail:
              "ROM testing is essential regardless, but it becomes especially important when notes suggest a contracture."
          };
        },
        onNo: () => {
          flag("noROMTesting");
          addEvent("Knee contracture is not quantified. This will reduce your ability to justify alignment decisions later.");
          state.score -= 2;
          return { verdict: "Incorrect.", detail: "You cannot safely plan alignment or gait goals without quantifying ROM limits." };
        }
      },
      {
        text: "Attempt unsupported gait in parallel bars to assess balance.",
        recommended: false,
        onYes: () => {
          flag("unsafeEvent");
          addEvent("Near-fall event occurs during unsupported attempt. You must re-establish safety before continuing.");
          state.score -= 2;
          return { verdict: "Unsafe choice.", detail: "Without a prosthesis and with known balance deficits, this is not appropriate." };
        },
        onNo: () => {
          state.score += 1;
          return { verdict: "Correct.", detail: "Safer observation is with his current assistive device." };
        }
      }
    ],
    next: () => {
      if (state.flags.unsafeEvent) return "safety_recovery";
      return "interpret_contracture";
    }
  },

  safety_recovery: {
    title: "Safety Recovery – After the near-fall, what do you do?",
    instruction: "Select Yes or No for each action.",
    actions: [
      {
        text: "Reassess vitals, document the near-fall, and continue mobility observation with rolling walker only.",
        recommended: true,
        onYes: () => {
          learn("safetyPlan", "Return to RW observation only; reinforce guarding and environment control", "Safety: documented near-fall, RW-only mobility observation");
          state.score += 1;
          return { verdict: "Correct.", detail: "You corrected course and restored a safe assessment environment." };
        },
        onNo: () => {
          state.score -= 1;
          return { verdict: "Not ideal.", detail: "Ignoring the safety event weakens clinical reasoning and increases risk." };
        }
      }
    ],
    next: () => "interpret_contracture"
  },

  interpret_contracture: {
    title: "Interpreting Key Findings – Contracture and implications",
    instruction: "Select Yes or No for each action.",
    actions: [
      {
        text: "Treat the mild knee flexion contracture as clinically irrelevant because it is 'only mild.'",
        recommended: false,
        onYes: () => {
          flag("ignoredContracture");
          addEvent("Contracture is ignored. This will show up during gait observation and dynamic alignment.");
          state.score -= 2;
          return { verdict: "Incorrect.", detail: "Even a mild contracture can affect alignment, stance stability, and distal loading." };
        },
        onNo: () => {
          state.score += 1;
          return { verdict: "Correct.", detail: "You recognize this finding needs a response." };
        }
      },
      {
        text: "Plan to accommodate the contracture with socket flexion and alignment strategies, then validate during dynamic alignment.",
        recommended: true,
        onYes: () => {
          learn("alignmentIntent", "Socket flexion planned; dynamic alignment will confirm gait effects", "Plan: socket flexion and dynamic alignment to accommodate contracture");
          state.score += 2;
          return { verdict: "Correct.", detail: "This is the expected real-world response: plan, implement, then validate dynamically." };
        },
        onNo: () => {
          flag("noContractureAccommodation");
          state.score -= 2;
          addEvent("No accommodation plan is documented. Expect compensations during gait and potential distal loading issues.");
          return { verdict: "Incorrect.", detail: "If you do not plan accommodation, you cannot predict or manage gait consequences." };
        }
      }
    ],
    next: () => "alignment_choices"
  },

  alignment_choices: {
    title: "Static and Dynamic Alignment – Which actions would you perform?",
    instruction: "Select Yes or No for each action.",
    actions: [
      {
        text: "If knee extension is limited, consider socket flexion and a posterior socket shift relative to the foot to support stable tibial progression.",
        recommended: true,
        onYes: () => {
          learn("socketAdjustment", "Socket flexion applied; posterior shift considered to support stability", "Alignment: socket flexion used, posterior shift considered");
          state.score += 2;
          return { verdict: "Correct.", detail: "This is a thoughtful alignment response that you must confirm with gait observation." };
        },
        onNo: () => {
          flag("noPosteriorShiftConsideration");
          state.score -= 1;
          return { verdict: "Not ideal.", detail: "You may still manage stability in other ways, but skipping consideration reduces problem-solving quality." };
        }
      },
      {
        text: "Proceed with bench alignment only and skip dynamic alignment because the patient is low level.",
        recommended: false,
        onYes: () => {
          flag("skippedDynamicAlignment");
          addEvent("Dynamic alignment is skipped. Gait deviations are not addressed and will persist.");
          state.score -= 2;
          return { verdict: "Incorrect.", detail: "Dynamic alignment is where you validate and correct real gait consequences." };
        },
        onNo: () => {
          state.score += 1;
          return { verdict: "Correct.", detail: "Dynamic alignment is appropriate even for lower level patients when safety permits." };
        }
      },
      {
        text: "Observe gait with the rolling walker and document specific deviations that would reflect contracture accommodation success or failure.",
        recommended: true,
        onYes: () => {
          const hasROM = !!state.facts.kneeROM;
          if (!hasROM) {
            addEvent("You document gait, but ROM was not quantified earlier. Your interpretation is weaker.");
            state.score += 1;
            return { verdict: "Good.", detail: "Gait observation is correct, but it should be paired with quantified ROM." };
          }
          learn("gaitObserved", "Mild persistent knee flexion in stance; shortened step length; cautious cadence", "Gait: mild persistent knee flexion in stance, shortened step length, cautious cadence");
          state.score += 2;
          return { verdict: "Correct.", detail: "Now you can tie deviations to alignment decisions and refine dynamically." };
        },
        onNo: () => {
          flag("noGaitObservation");
          state.score -= 2;
          return { verdict: "Incorrect.", detail: "You cannot confirm accommodation success without observing gait and responding dynamically." };
        }
      }
    ],
    next: () => "dynamic_outcome"
  },

  dynamic_outcome: {
    title: "Cause and Effect – What happens with your current choices?",
    instruction: "Select Yes or No for each action.",
    actions: [
      {
        text: "If gait shows persistent knee flexion and instability, perform iterative dynamic alignment adjustments and reassess.",
        recommended: true,
        onYes: () => {
          const ignored = !!state.flags.ignoredContracture || !!state.flags.noContractureAccommodation;
          if (ignored) {
            addEvent("You attempt dynamic correction, but earlier you ignored or failed to plan accommodation. You need to backtrack and formalize the rationale.");
            state.score += 1;
            return { verdict: "Course correction.", detail: "You can still recover, but it costs efficiency and clarity." };
          }
          learn("dynamicAlignment", "Iterative adjustments improve stance stability and tibial progression", "Dynamic alignment: iterative changes improved stance stability and tibial progression");
          state.score += 2;
          addEvent("Dynamic alignment improves stance stability and reduces compensatory gait patterns.");
          return { verdict: "Correct.", detail: "This is the real-world loop: observe, adjust, recheck." };
        },
        onNo: () => {
          flag("leftDeviationsUncorrected");
          addEvent("Gait deviations persist. Increased risk of distal anterior pressure and reduced confidence.");
          state.score -= 2;
          return { verdict: "Incorrect.", detail: "Leaving deviations unaddressed is a functional and tissue risk." };
        }
      },
      {
        text: "If distal tibial sensitivity is present, confirm relief strategy and monitor early skin response in follow-ups.",
        recommended: true,
        onYes: () => {
          learn("followUpPlan", "Early follow-up scheduled to check skin and adjust fit/alignment", "Follow-up: early skin checks planned due to distal tibial sensitivity");
          state.score += 2;
          return { verdict: "Correct.", detail: "This ties tissue tolerance findings directly to safe implementation." };
        },
        onNo: () => {
          flag("noEarlySkinFollowUp");
          state.score -= 2;
          return { verdict: "Incorrect.", detail: "With dysvascular risk and distal sensitivity, early follow-up is not optional in good practice." };
        }
      }
    ],
    next: () => "final_plan"
  },

  final_plan: {
    title: "Final Plan – Choose the best overall approach",
    type: "single_choice",
    options: () => {
      const hasContracture = !!state.facts.kneeROM || !!state.facts.opNoteKey;
      const didDynamic = !!state.facts.dynamicAlignment && !state.flags.skippedDynamicAlignment;
      const hasSkinRisk = !!state.facts.limbSkin;

      const bestText = [
        "Proceed with TT prosthesis using stability-prioritized componentry, liner-based system as appropriate, and structured PT gait and balance training.",
        hasContracture ? "Accommodate knee flexion contracture with socket flexion and alignment strategy, validated through dynamic alignment." : "",
        didDynamic ? "Document dynamic alignment changes and observed gait response." : "Complete dynamic alignment prior to finalizing settings.",
        hasSkinRisk ? "Schedule early follow-up to assess skin response and adjust fit and alignment." : "Schedule early follow-up for skin and fit checks."
      ].filter(Boolean).join(" ");

      return [
        {
          id: "plan_best",
          text: bestText,
          isBest: true,
          rationale: "This integrates objective findings, safety, gait validation, and tissue tolerance into a coherent real-world plan."
        },
        {
          id: "plan_delay",
          text: "Delay prosthetic fitting due to fall risk; continue pre-prosthetic PT only with no defined prosthetic timeline.",
          isBest: false,
          rationale: "This overcorrects for risk, promotes deconditioning, and does not meet realistic functional goals."
        },
        {
          id: "plan_k3",
          text: "Provide a high-energy-return K3 foot immediately to encourage higher activity and reduce PT needs.",
          isBest: false,
          rationale: "This increases control demands and can reduce stability. It is not justified by the current functional profile and risk factors."
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

let currentNodeId = "start_eval";

function renderNode() {
  clearEventBanner();

  const stepContainer = document.getElementById("step-container");
  const summaryPanel = document.getElementById("summary-panel");
  const nextBtn = document.getElementById("next-btn");

  if (!stepContainer || !summaryPanel || !nextBtn) return;

  summaryPanel.style.display = "none";
  stepContainer.style.display = "block";
  nextBtn.style.display = "inline-block";
  nextBtn.textContent = "Next";

  const node = nodes[currentNodeId];

  if (node.type === "summary") {
    stepContainer.style.display = "none";
    nextBtn.style.display = "none";

    const factsList = Object.entries(state.facts).map(([k, v]) => `<li><strong>${k}:</strong> ${String(v)}</li>`).join("");
    const flagsList = Object.entries(state.flags).map(([k, v]) => `<li><strong>${k}:</strong> ${String(v)}</li>`).join("");

    summaryPanel.innerHTML = `
      <h2>${node.title}</h2>
      <p><strong>Score (pilot):</strong> ${state.score}</p>
      <p><strong>Facts on file:</strong></p>
      <ul>${factsList || "<li>None</li>"}</ul>
      <p><strong>Flags:</strong></p>
      <ul>${flagsList || "<li>None</li>"}</ul>
      <p>This feedback is for study purposes only and is not scaled to the actual ABC scoring model.</p>
    `;
    summaryPanel.style.display = "block";
    return;
  }

  let html = `
    ${caseStemHtml}
    <h2 class="step-title">${node.title}</h2>
    ${node.instruction ? `<p class="instruction-text">${node.instruction}</p>` : ""}
  `;

  if (node.type === "single_choice") {
    const options = node.options();
    html += `<form id="plan-form">`;
    for (const opt of options) {
      html += `
        <div class="plan-option">
          <label>
            <input type="radio" name="plan" value="${opt.id}">
            ${opt.text}
          </label>
        </div>
      `;
    }
    html += `</form><div class="feedback" id="node-feedback" style="display:none;"></div>`;

    stepContainer.innerHTML = html;

    nextBtn.onclick = () => {
      const form = document.getElementById("plan-form");
      const fb = document.getElementById("node-feedback");
      const choice = new FormData(form).get("plan");
      const selected = options.find((o) => o.id === choice);

      if (!selected) {
        fb.style.display = "block";
        fb.innerHTML = `<strong>Please select a plan.</strong>`;
        return;
      }

      fb.style.display = "block";
      fb.innerHTML = selected.isBest
        ? `<strong>Correct.</strong> ${selected.rationale}`
        : `<strong>Not the best choice.</strong> ${selected.rationale}`;

      nextBtn.textContent = "Finish";
      nextBtn.onclick = () => {
        currentNodeId = node.next();
        renderNode();
      };
    };

    return;
  }

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

  stepContainer.querySelectorAll("button[data-idx]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = Number(e.currentTarget.getAttribute("data-idx"));
      const ans = e.currentTarget.getAttribute("data-ans");
      const action = node.actions[idx];
      const fb = document.getElementById(`fb-${idx}`);

      const choseYes = ans === "yes";
      const correct = choseYes === action.recommended;

      const result = choseYes ? action.onYes?.() : action.onNo?.();
      const verdict = result?.verdict || (correct ? "Correct." : "Not ideal.");
      const detail = result?.detail ? `<br><br>${result.detail}` : "";

      fb.style.display = "block";
      fb.innerHTML = `<strong>${verdict}</strong>${detail}`;
    });
  });

  nextBtn.onclick = () => {
    currentNodeId = node.next();
    renderNode();
  };
}

function startCase() {
  const intro = document.getElementById("intro");
  const caseSection = document.getElementById("case");
  const summaryPanel = document.getElementById("summary-panel");

  if (intro) intro.style.display = "none";
  if (caseSection) caseSection.style.display = "block";
  if (summaryPanel) summaryPanel.style.display = "none";

  state.facts = {};
  state.flags = {};
  state.score = 0;
  state.unlocked = [];
  state.events = [];
  currentNodeId = "start_eval";

  renderSidePanels();
  renderNode();
}

function nextStep() {
  // The Next button handlers are assigned per-node in renderNode().
  // This exists only because your HTML calls nextStep() directly.
}

document.addEventListener("DOMContentLoaded", () => {
  const caseSection = document.getElementById("case");
  if (caseSection) caseSection.style.display = "none";
  renderSidePanels();
});

window.startCase = startCase;
window.nextStep = nextStep;
