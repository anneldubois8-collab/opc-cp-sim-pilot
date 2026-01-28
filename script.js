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
          return { verdict: "Incorrect
