/**
 * utils/eligibilityLogic.js
 * Evaluates answers from the inline eligibility quiz.
 *
 * Legal basis:
 *   Article 326 — Constitution of India (universal adult suffrage)
 *   Section 16  — Representation of the People Act, 1950 (disqualifications)
 */

export function checkEligibility(answers) {
  const reasons   = [];
  const nextSteps = [];
  let eligible    = true;

  // ── Age check ──────────────────────────────────────────────────────────
  const age = parseInt(answers.age, 10);
  if (!answers.age || isNaN(age) || age < 18) {
    eligible = false;
    if (age > 0 && !isNaN(age)) {
      const yearsLeft = 18 - age;
      reasons.push(
        `You must be at least 18 years old to vote. You'll become eligible in ${yearsLeft} year${yearsLeft === 1 ? "" : "s"} — register as soon as you turn 18!`
      );
    } else {
      reasons.push("You must be at least 18 years old on the qualifying date to be enrolled as a voter. (Article 326, Constitution of India.)");
    }
  }

  // ── Citizenship check ──────────────────────────────────────────────────
  if (answers.citizen !== "Yes") {
    eligible = false;
    reasons.push(
      "Only citizens of India can vote in Indian elections. Non-citizens and foreign nationals are not eligible regardless of their period of residence. (Article 326, Constitution of India.)"
    );
  }

  // ── Residence check ────────────────────────────────────────────────────
  if (answers.resident !== "Yes") {
    eligible = false;
    reasons.push(
      "You must be 'ordinarily resident' at an address in a constituency to enroll there. Temporary absence (work, study abroad) may not disqualify you — contact ECI at 1950 for your specific situation."
    );
  }

  // ── Unsound mind check ─────────────────────────────────────────────────
  if (answers.soundMind === "Yes") {
    eligible = false;
    reasons.push(
      "Persons declared of unsound mind by a competent court are disqualified from voting under Section 16(1)(b) of the Representation of the People Act, 1950."
    );
  }

  // ── Legal disqualification check ───────────────────────────────────────
  if (answers.disqualified === "Yes") {
    eligible = false;
    reasons.push(
      "Legal disqualification under election law (e.g., certain criminal convictions) prevents enrollment and voting. Contact the ECI Voter Helpline at 1950 (toll-free) for guidance specific to your situation."
    );
  }

  // ── Next steps for eligible voters ────────────────────────────────────
  if (eligible) {
    nextSteps.push("Check your name at electoralsearch.eci.gov.in — takes 30 seconds");
    nextSteps.push("Not listed? Register at voters.eci.gov.in using Form 6 (free, ~5 minutes)");
    nextSteps.push("Find your polling booth and carry your Voter ID or any approved alternate document");
  }

  return { eligible, reasons, nextSteps };
}
