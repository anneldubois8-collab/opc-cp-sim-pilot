# CP Prosthetic Simulation – Pilot (TT Case)

This is a pilot **clinical reasoning trainer** for candidates preparing for the **ABC Certified Prosthetist (CP) Written Simulation Exam**.

It is **not** an official ABC product and does **not** contain any real exam questions.  
Instead, it uses Atlas/AAOP-style clinical reasoning to mimic the structure and feel of a simulation case.

---

## What This Pilot Does

- Presents **one transtibial (TT) scenario**:
  - Older adult, dysvascular transtibial amputee
  - First definitive prosthesis
  - Focus on assessment, problem identification, treatment planning, and follow-up

- Uses **multi-action decisions**:
  - For each action, the user chooses **Yes** or **No**
  - Each action is classified internally as:
    - Essential
    - Appropriate
    - Low value
    - Inappropriate
    - Contraindicated

- Provides **real-time feedback**:
  - Immediately shows whether the action was beneficial or not
  - Explains the clinical reasoning behind each classification
  - Draws from:
    - Atlas of Amputations and Limb Deficiencies
    - Atlas of Limb Prosthetics
    - Orthotics and Prosthetics in Rehabilitation
    - AAOP State of the Science conferences
    - Standard amputee rehab and gait analysis principles

- Computes a simple **total score** at the end of the scenario (pilot mode only).

---

## Files

- `index.html`  
  Main page and structure for the simulation.

- `style.css`  
  Visual styling, including OPC-inspired branding.

- `script.js`  
  Simulation logic:
  - Loads the pilot TT scenario
  - Renders steps and actions
  - Handles Yes/No selections
  - Displays rationales
  - Tracks a simple score

- `assets/` (optional, recommended)
  - `opc-logo.png` – logo in the header (replace with real asset if desired)
  - `favicon.ico` – browser tab icon (optional)

---

## How to Run Locally

1. Clone or download this repository.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
3. Walk through the steps, click **Yes/No** for each action, and read the feedback.

No server or backend is required. Everything runs locally in the browser.

---

## How to Deploy via GitHub Pages

1. Create a new GitHub repository and upload all files:
   - `index.html`
   - `style.css`
   - `script.js`
   - `assets/` (if using)
   - `README.md`

2. In GitHub:
   - Go to **Settings → Pages**
   - Under **Source**, select `main` (or `master`) branch and root directory
   - Click **Save**

3. After a short delay, GitHub Pages will give you a URL, for example:
   - `https://<your-username>.github.io/<repo-name>/`

4. Share that link with recent CP candidates to test the format.

---

## How Testers Should Use This

When you send this out, you can ask testers questions like:

1. Does this **feel** similar in structure to the CP Written Simulation exam?
2. Is the **level of clinical detail** appropriate, too shallow, or too deep?
3. Is the **real-time feedback** helpful, or would you prefer feedback at the end?
4. Would this format help you **study and think clinically**, not just memorize?

Their answers will guide changes to:

- Scenario depth
- Number and type of decision points
- How much biomechanical detail to show
- Whether to add more scenarios (TF, Symes, UE)

---

## Known Limitations (Pilot)

- Only one TT scenario is included.
- No user login, data storage, or analytics.
- Scoring is simplified and is not scaled to ABC’s scoring model.
- This is a **study tool**, not a predictive exam score.

---

## Disclaimer

This project is **independent of ABC** and is intended purely as an educational resource.  
All clinical content is based on standard prosthetics references and professional practice, not on any proprietary exam materials.
