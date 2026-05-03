import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import "./App.css";
import { TIMELINE, VOTE_STEPS } from "./data/electionData";
import { checkEligibility } from "./utils/eligibilityLogic";

const FACTS = [
  "🗳️ India has 1 polling booth per 1,500 voters — none more than 2 km from any home.",
  "🖊️ Indelible ink has been used in Indian elections since 1962. Made in Mysore.",
  "📱 You can download your e-EPIC Voter ID free on the ECI Voter Helpline App.",
  "⏱️ The average Indian spends under 3 minutes inside a polling booth.",
  "🔒 EVMs have never been successfully hacked in any Indian election.",
  "🌍 India's election uses more EVMs than any country on Earth.",
];

const STR = {
  en: {
    namaste: "Namaste",
    guideVote: "Guide Me to Vote", guideDesc: "6 steps · registration to ballot",
    journey: "Election Journey", journeyDesc: "7 phases · announcement to results",
    eligible: "Am I Eligible?", eligDesc: "5 questions · takes 1 minute",
    readiness: "Readiness Check", readinessDesc: "Score out of 10 · know your gaps",
    placeholder: "Ask anything about elections…",
    hint: 'Try: "What is EPIC?" or "How do I register?"',
    clearer: "Clearer than Google. Faster than asking around.",
    toggle: "हिं",
  },
  hi: {
    namaste: "नमस्ते",
    guideVote: "मतदान गाइड", guideDesc: "6 चरण · पंजीकरण से मतदान",
    journey: "चुनाव यात्रा", journeyDesc: "7 चरण · घोषणा से परिणाम",
    eligible: "क्या मैं योग्य हूं?", eligDesc: "5 प्रश्न · 1 मिनट में",
    readiness: "तैयारी जांच", readinessDesc: "10 में से स्कोर",
    placeholder: "चुनाव के बारे में कुछ भी पूछें…",
    hint: "पूछें: \"EVM क्या है?\" या \"पंजीकरण कैसे करें?\"",
    clearer: "Google से स्पष्ट। पूछने से तेज़।",
    toggle: "EN",
  },
};

const FALLBACKS = [
  "I can help you with voting steps, eligibility, election timeline, or a readiness check — pick a topic or ask away!",
  "Good question! Try asking: 'What is EVM?', 'How do I register?', or 'Am I eligible?' — I'll answer instantly.",
  "I'm your Indian elections guide. Ask about voter ID, polling booths, eligibility, voting steps, or the election timeline.",
];

const LocationActionCard = memo(({ city }) => (
  <div style={{
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    borderRadius: "16px",
    padding: "1.25rem",
    color: "white",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  }}>
    <div style={{
      position: "absolute", top: 0, right: 0, width: "120px", height: "120px",
      background: "radial-gradient(circle, rgba(255,153,51,0.15) 0%, transparent 70%)",
      borderRadius: "50%", transform: "translate(30%, -30%)",
    }} />
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      background: "rgba(255,153,51,0.2)", border: "1px solid rgba(255,153,51,0.4)",
      borderRadius: "99px", padding: "3px 10px", fontSize: "0.7rem",
      fontWeight: "700", color: "#FF9933", marginBottom: "0.75rem",
      letterSpacing: "0.05em", textTransform: "uppercase",
    }}>
      ⚡ QUICK ACTION
    </div>
    <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", lineHeight: 1.5, color: "rgba(255,255,255,0.9)" }}>
      Showing polling data for <strong style={{ color: "white" }}>{city}</strong>. Ready to find your nearest booth?
    </p>
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <button
        onClick={() => window.open('https://electoralsearch.eci.gov.in', '_blank')}
        style={{
          background: "#FF9933", color: "white", border: "none",
          padding: "0.5rem 1.25rem", borderRadius: "99px", fontWeight: "700",
          fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s",
        }}
        onMouseOver={e => e.currentTarget.style.transform = "translateY(-1px)"}
        onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
      >
        Find Nearest Booth →
      </button>
      <button style={{
        background: "rgba(255,255,255,0.1)", color: "white",
        border: "1px solid rgba(255,255,255,0.2)",
        padding: "0.5rem 1.25rem", borderRadius: "99px", fontWeight: "600",
        fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s",
      }}
        onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
        onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
      >
        View All in {city}
      </button>
    </div>
  </div>
));

const OFFLINE_RESPONSES = [
  {
    pattern: /evm|electronic.?voting.?machine|voting machine|how.*evm|evm.*work|what.*evm|evm.*mean/i,
    reply: "EVM (Electronic Voting Machine) is a tamper-proof device. Press the blue button next to your candidate — the vote records instantly. Every EVM has a VVPAT for paper verification.",
    actions: ["How do I vote?", "What is VVPAT?"],
  },
  {
    pattern: /vvpat|paper.?trail|paper.?slip|voter.?verifiable/i,
    reply: "VVPAT prints a paper slip showing your candidate for 7 seconds after you vote — then it drops into a sealed box. Attached to every EVM across India.",
    actions: ["Guide me to vote", "What is EVM?"],
  },
  {
    pattern: /\bepic\b|voter.?id|voter card|id card|elector.*photo|photo.*id/i,
    reply: "EPIC (Elector Photo Identity Card) is your official Voter ID. Get a free digital e-EPIC on the ECI Voter Helpline App — no office visit needed.",
    actions: ["How do I vote?", "Find my polling booth"],
  },
  {
    pattern: /voter.*roll|electoral.*roll|voter.*list|check.*name|name.*list|am i.*registered/i,
    reply: "Check if your name is on the electoral roll at electoralsearch.eci.gov.in — search by name, EPIC number, or mobile number. It takes 30 seconds.",
    actions: ["Check my eligibility", "Guide me to vote"],
  },
  {
    pattern: /register|enrollment|new voter|form.?6|sign.?up|apply.*vote|how to.*vote.*first/i,
    reply: "Register as a new voter at voters.eci.gov.in → fill Form 6 online → upload age proof, address proof, and a photo. Takes 4–6 weeks to process.",
    actions: ["Guide me to vote", "Check my eligibility"],
  },
  {
    pattern: /booth|polling station|polling centre|where.*vote|vote.*where|my booth|find.*booth/i,
    reply: "Find your assigned booth at electoralsearch.eci.gov.in — search by name or EPIC number. Booths are always within 2 km of your registered address.",
    actions: ["Guide me to vote", "Check my eligibility"],
    type: "location_card"
  },
  {
    pattern: /time|hours|open|close|timing|when.*poll|poll.*when|booth.*time|voting.*time/i,
    reply: "Polling booths are open 7:00 AM – 6:00 PM on election day. Hours can vary slightly by state — verify your exact booth timing via the ECI app.",
    actions: ["Find my polling booth", "Guide me to vote"],
  },
  {
    pattern: /eligib|qualify|can i vote|who can vote|age.*vote|vote.*age|18|minimum age|citizen.*vote/i,
    reply: "You're eligible to vote if you're 18+ years old, an Indian citizen, and ordinarily resident at a registered address. Registration is free at voters.eci.gov.in.",
    actions: ["Check my eligibility", "Guide me to vote"],
  },
  {
    pattern: /indelible.?ink|\bink\b|finger.*mark|mark.*finger|ink.*finger/i,
    reply: "Indelible silver-nitrate ink is applied to your left index finger to prevent double voting — stays ~2 weeks. Used in India since 1962, made in Mysore.",
    actions: ["Guide me to vote", "Show election timeline"],
  },
  {
    pattern: /mcc|model.?code|code.?of.?conduct/i,
    reply: "The Model Code of Conduct kicks in when the election schedule is announced — banning new govt schemes and political misuse of official resources until results.",
    actions: ["Show election timeline", "Guide me to vote"],
  },
  {
    pattern: /silent.?period|48.?hour|campaign.*ban|no.*campaign/i,
    reply: "A 48-hour silent period before polling day bans all campaigns, rallies, and political ads — giving voters space to decide freely.",
    actions: ["Show election timeline", "Guide me to vote"],
  },
  {
    pattern: /helpline|1950|toll.?free|complaint|report.*violation/i,
    reply: "ECI Voter Helpline: 1950 (toll-free, every day). Report violations with geo-tagged photos via the cVIGIL app — anonymously.",
    actions: ["Am I eligible?", "Guide me to vote"],
  },
  {
    pattern: /document|id.*bring|carry.*id|what.*bring|bring.*poll/i,
    reply: "Bring any one of these to vote: Voter ID (EPIC), Aadhaar, PAN card, Passport, Driving Licence, or MNREGA job card. Your name must be on the electoral roll.",
    actions: ["Guide me to vote", "Find my polling booth"],
  },
  {
    pattern: /proxy|someone.*vote|vote.*behalf|vote.*me/i,
    reply: "No proxy voting is allowed in India — only you can cast your own vote in person. NRI voters can vote in person at their constituency.",
    actions: ["Guide me to vote", "Check my eligibility"],
  },
];

function getOfflineResponse(text) {
  for (const { pattern, reply, actions, type } of OFFLINE_RESPONSES) {
    if (pattern.test(text)) return { reply, actions, type: type || "text" };
  }
  return {
    reply: FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)],
    actions: ["Guide me to vote", "Check my eligibility", "Show election timeline"],
    type: "text"
  };
}

const IndiaFlag = memo(function IndiaFlag({ size = 22 }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.667)}
      viewBox="0 0 900 600"
      style={{ borderRadius: 2, flexShrink: 0, display: "block" }}
    >
      <rect width="900" height="200" fill="#FF9933" />
      <rect y="200" width="900" height="200" fill="#FFFFFF" />
      <rect y="400" width="900" height="200" fill="#138808" />
      <circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="7" />
      <circle cx="450" cy="300" r="9" fill="#000080" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <line key={i} x1="450" y1="300"
            x2={450 + 52 * Math.cos(a)}
            y2={300 + 52 * Math.sin(a)}
            stroke="#000080" strokeWidth="2.5"
          />
        );
      })}
    </svg>
  );
});

const INTENT_PATTERNS = [
  { flow: "voting", re: /\bvot(e|ing|er)\b|ballot|cast.*vote|how.*vote|steps.*vote|guide.*vote|booth|evm|vvpat|indelible|register.*voter|voter.*register|what.*bring.*poll|document.*poll/i },
  { flow: "timeline", re: /timeline|schedule|phase|when.*elect|elect.*when|announce|campaign|\bmcc\b|counting|result|election date|poll date/i },
  { flow: "eligibility", re: /eligib|can i vote|who can vote|qualify|citizenship|age.*vote|vote.*age|am i.*register|18.*vote|nri.*vote|check.*elig/i },
  { flow: "quiz", re: /quiz|ready|readiness|\bscore\b|\btest\b|prepared|assess|how ready|am i ready/i },
];

const QUICK_ANSWERS = [
  { q: /evm|electronic.?voting.?machine|how.*evm|evm.*work|what.*evm|evm.*mean/i, a: "EVM (Electronic Voting Machine) is a tamper-proof device — press the blue button next to your candidate to cast your vote. Each EVM is paired with a VVPAT that prints a paper slip for verification." },
  { q: /vvpat|paper.?trail|paper.?slip|voter.?verifiable/i, a: "VVPAT shows a printed paper slip of your chosen candidate for 7 seconds after voting, then drops it into a sealed box. Every EVM in India has one." },
  { q: /\bepic\b|voter.?id|voter card|elector.*photo|what.*voter.?id/i, a: "EPIC (Elector Photo Identity Card) is your official Voter ID. Get a free digital e-EPIC instantly on the ECI Voter Helpline App — no office visit needed." },
  { q: /voter.*roll|electoral.*roll|voter.*list|check.*name|am i.*register/i, a: "Check your name on the electoral roll at electoralsearch.eci.gov.in — search by name, EPIC number, or mobile. Takes under 30 seconds." },
  { q: /eligib|can i vote|who can vote|18.*vote|age.*vote|minimum age/i, a: "To vote in India you must be: 18+ years old, an Indian citizen, and registered at an address in India. Register free at voters.eci.gov.in." },
  { q: /register|form.?6|how.*register|sign up.*vote|new voter/i, a: "Register at voters.eci.gov.in → 'Register as New Voter' → fill Form 6 → upload age proof, address proof, photo. Confirmation by SMS within 4–6 weeks." },
  { q: /booth|polling station|where.*vote|find.*booth|my booth/i, a: "Find your polling booth at electoralsearch.eci.gov.in — search by name or EPIC number. Your booth is always within 2 km of your registered address." },
  { q: /time|hours|open|close|timing|when.*poll|voting.*time|booth.*hour/i, a: "Polling booths are open 7:00 AM – 6:00 PM on election day. Hours vary slightly by state — check your exact booth timing on the ECI Voter Helpline App." },
  { q: /document|id.*bring|carry.*id|what.*bring|bring.*poll|id.*poll/i, a: "Bring any one: Voter ID (EPIC), Aadhaar, PAN card, Passport, Driving Licence, or MNREGA job card. Your name must be on the electoral roll." },
  { q: /indelible.?ink|\bink\b|finger.*mark|mark.*finger/i, a: "Indelible silver-nitrate ink is applied to your left index finger to prevent double voting — stays ~2 weeks. Used since 1962, made in Mysore." },
  { q: /mcc|model.?code|code.?of.?conduct/i, a: "The Model Code of Conduct activates when the election schedule is announced — banning new govt schemes and political misuse of resources until results." },
  { q: /form.?6/i, a: "Form 6 is the voter registration form. Fill it free at voters.eci.gov.in — needs age proof, address proof, and a photo. Processing: 4–6 weeks." },
  { q: /helpline|1950|toll.?free|complaint/i, a: "ECI Voter Helpline: 1950 (toll-free, every day). Report violations via the cVIGIL app with geo-tagged photos — anonymously." },
  { q: /silent.?period|48.?hour|campaign.*ban/i, a: "A 48-hour silent period before polling day bans all campaigns and political ads — giving voters space to decide without any pressure." },
  { q: /proxy|someone.*vote|vote.*behalf/i, a: "Proxy voting is not allowed in India — only you can cast your vote in person at your assigned booth." },
];

function getIntent(input) {
  const text = (input || "").toLowerCase().trim();
  if (!text) return null;
  for (const { flow, re } of INTENT_PATTERNS) {
    if (re.test(text)) return flow;
  }
  return null;
}

const QUIZ_QUESTIONS = [
  {
    id: "roll",
    question: "Have you checked that your name is on the Electoral Roll?",
    options: [
      { label: "Yes, I've confirmed", score: 3 },
      { label: "Not yet, but I plan to", score: 1 },
      { label: "No / I don't know how", score: 0 },
    ],
  },
  {
    id: "id",
    question: "Do you have a Voter ID, Aadhaar, PAN, or Passport ready?",
    options: [
      { label: "Yes, Voter ID ready", score: 3 },
      { label: "Have Aadhaar / PAN / Passport", score: 3 },
      { label: "No, need to arrange one", score: 0 },
    ],
  },
  {
    id: "booth",
    question: "Do you know the location of your assigned polling booth?",
    options: [
      { label: "Yes, I know exactly where it is", score: 4 },
      { label: "I know the area roughly", score: 2 },
      { label: "No idea — haven't checked yet", score: 0 },
    ],
  },
];

function calcScore(answers) {
  const total = answers.reduce((s, a) => s + a.score, 0);
  const scaled = Math.min(10, Math.round((total / 10) * 10));
  const gaps = [];
  if (answers[0]?.score === 0) gaps.push("Confirm your name on the electoral roll");
  if (answers[1]?.score === 0) gaps.push("Arrange a Voter ID or alternate document (Aadhaar, PAN, Passport)");
  if (answers[2]?.score === 0) gaps.push("Find your polling booth before election day");
  if (scaled >= 9) return { score: scaled, label: "Election-Ready!", color: "#138808", msg: "You're fully prepared — nothing left to do but show up and vote.", insight: "You've covered every critical step. Most voters skip booth verification — you didn't.", suggestion: "Share Nagarik AI with a friend who hasn't checked yet.", gaps: [] };
  if (scaled >= 6) return { score: scaled, label: "Almost There", color: "#e8650a", msg: "You're close. A couple of quick checks and you'll be fully ready.", insight: "Most preparation gaps happen in the final week before election day — you still have time.", suggestion: gaps.length ? gaps[0] : "Double-check your booth address — it can change between elections.", gaps };
  if (scaled >= 3) return { score: scaled, label: "Getting Started", color: "#d97706", msg: "Good start. Let's close the gaps before election day.", insight: "Voters who prepare in advance are significantly more likely to actually vote.", suggestion: gaps.length ? `Start with: ${gaps[0]}.` : "Begin with the Voting Guide — it takes under 5 minutes.", gaps };
  return { score: scaled, label: "Let's Get You Ready", color: "#dc2626", msg: "No worries — Nagarik AI will walk you through every step.", insight: "Every prepared voter starts exactly here. The next 5 minutes can change that.", suggestion: "Start by checking your name on the voter roll — it's the most common blocker.", gaps };
}

const ELIG_QUESTIONS = [
  { id: "age", label: "How old are you?", type: "number" },
  { id: "citizen", label: "Are you a citizen of India?", opts: ["Yes", "No"] },
  { id: "resident", label: "Are you ordinarily resident at an address in India?", opts: ["Yes", "No"] },
  { id: "soundMind", label: "Have you been declared of unsound mind by any court?", opts: ["No", "Yes"] },
  { id: "disqualified", label: "Are you disqualified from voting under any law?", opts: ["No", "Yes"] },
];

const TAGLINES = [
  { h: "Your voice. Your vote. Your India.", s: "Find your booth, check eligibility, and vote — all in one place." },
  { h: "Democracy starts with one citizen.", s: "First time voting? Start here. Takes under 5 minutes." },
  { h: "India votes. Does it include you?", s: "Check if you're eligible — 5 yes/no questions, done instantly." },
  { h: "Understand before you vote.", s: "Know exactly what happens inside a polling booth before you go." },
  { h: "640 million Indians voted last time.", s: "Be one of them. Nagarik AI shows you every step." },
];

const ProgressBar = memo(function ProgressBar({ step, total }) {
  const pct = (step / total) * 100;
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px"
      }}>
        <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.05em" }}>
          STEP {step} OF {total}
        </span>
        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#FF9933" }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg, #FF9933, #FFB347)",
          borderRadius: "99px", transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
    </div>
  );
});

const FlowCompletion = memo(function FlowCompletion({ onFlow, prompt }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "14px", padding: "1rem", margin: "1rem 0",
    }}>
      <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {prompt || "What would you like to do next?"}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {[
          { flow: "eligibility", label: "✅ Check Eligibility" },
          { flow: "timeline", label: "📅 View Timeline" },
          { flow: "quiz", label: "🧠 Take Quiz" },
        ].map(({ flow, label }) => (
          <button
            key={flow}
            onClick={() => onFlow(flow)}
            style={{
              background: "rgba(255,153,51,0.1)", border: "1px solid rgba(255,153,51,0.25)",
              color: "#FF9933", borderRadius: "99px", padding: "0.4rem 0.9rem",
              fontSize: "0.82rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseOver={e => { e.currentTarget.style.background = "rgba(255,153,51,0.2)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseOut={e => { e.currentTarget.style.background = "rgba(255,153,51,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
});

const TimelineView = memo(function TimelineView({ onDone, onFlow, name }) {
  return (
    <div className="flow-container">
      <div style={{
        textAlign: "center", padding: "2rem 1rem 1.5rem",
        background: "linear-gradient(135deg, rgba(255,153,51,0.1), rgba(19,136,8,0.1))",
        borderRadius: "16px", marginBottom: "1.5rem",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📅</div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "white", margin: "0 0 0.4rem" }}>India's Election Journey</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>7 phases from announcement to results</p>
      </div>
      <div className="timeline-list">
        {TIMELINE.map((t, i) => (
          <div key={t.phase} className="tl-item" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="tl-left">
              <div className="tl-dot" style={{ background: t.border }}>
                <span>{t.icon}</span>
              </div>
              {i < TIMELINE.length - 1 && <div className="tl-connector" />}
            </div>
            <div className="tl-right">
              <div className="tl-badge" style={{ background: t.color, color: t.text, borderColor: t.border }}>
                Phase {t.phase}
              </div>
              <div className="tl-name">{t.name}</div>
              <div className="tl-desc">{t.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <FlowCompletion onFlow={onFlow} prompt="Explore another topic:" />
      <button className="btn-primary full-width" onClick={onDone}>
        ✅ Got it — What's next?
      </button>
    </div>
  );
});

function VotingGuide({ onDone, onFlow, name }) {
  const [step, setStep] = useState(0);
  const s = VOTE_STEPS[step];
  const isLast = step === VOTE_STEPS.length - 1;

  const handleNext = useCallback(() => setStep(p => Math.min(VOTE_STEPS.length - 1, p + 1)), []);
  const handleBack = useCallback(() => setStep(p => Math.max(0, p - 1)), []);

  return (
    <div className="flow-container">
      <div style={{
        textAlign: "center", padding: "2rem 1rem 1.5rem",
        background: "linear-gradient(135deg, rgba(255,153,51,0.1), rgba(0,0,128,0.1))",
        borderRadius: "16px", marginBottom: "1.5rem",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{s.emoji}</div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "white", margin: 0 }}>{s.title}</h2>
      </div>
      <ProgressBar step={step + 1} total={VOTE_STEPS.length} />
      <div className="step-content">
        <ul className="step-list">
          {s.details.map((d, i) => (
            <li key={i} className="step-item">
              <span className="step-bullet">→</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
        {step === 4 && (
          <div className="wow-moment">
            <span className="wow-icon">🖊️</span>
            <p>That ink mark on your finger? It's been applied to over 640 million Indians this election alone. Today it's your turn.</p>
          </div>
        )}
        {s.tip && (
          <div className="tip-box">
            <span className="tip-icon">💡</span>
            <span>{s.tip}</span>
          </div>
        )}
      </div>
      <div className="step-nav">
        {step > 0 && (
          <button className="btn-secondary" onClick={handleBack}>← Back</button>
        )}
        {isLast ? (
          <div className="last-step-actions">
            <a href="https://electoralsearch.eci.gov.in" target="_blank" rel="noopener noreferrer" className="cta-link-btn">
              Find my polling booth →
            </a>
            <button className="btn-primary celebrate" onClick={onDone}>🎉 I'm Ready to Vote!</button>
          </div>
        ) : (
          <button className="btn-primary" onClick={handleNext}>Next →</button>
        )}
      </div>
      {isLast && <FlowCompletion onFlow={onFlow} prompt="Explore another topic:" />}
    </div>
  );
}

function EligibilityChecker({ onDone, onFlow, name }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [numVal, setNumVal] = useState("");
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, [step]);

  const q = ELIG_QUESTIONS[step];

  const advance = useCallback((val) => {
    const a = { ...answers, [q.id]: val };
    setAnswers(a);
    if (step < ELIG_QUESTIONS.length - 1) {
      setStep(s => s + 1);
      setNumVal("");
    } else {
      setResult(checkEligibility(a));
    }
  }, [answers, q, step]);

  if (result) {
    const { eligible, reasons, nextSteps } = result;
    return (
      <div className="flow-container">
        <div style={{
          borderRadius: "16px", padding: "2rem",
          background: eligible
            ? "linear-gradient(135deg, rgba(19,136,8,0.15), rgba(19,136,8,0.05))"
            : "linear-gradient(135deg, rgba(220,38,38,0.15), rgba(220,38,38,0.05))",
          border: `1px solid ${eligible ? "rgba(19,136,8,0.3)" : "rgba(220,38,38,0.3)"}`,
          textAlign: "center", marginBottom: "1rem",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>{eligible ? "✅" : "❌"}</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "white", margin: "0 0 0.5rem" }}>
            {eligible ? `Great news, ${name}!` : `Not quite, ${name}`}
          </h2>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.9rem" }}>
            {eligible ? "You're one of ~950 million eligible voters in India." : "Here's why you may not be eligible:"}
          </p>
        </div>
        <div className="result-items">
          {(eligible ? nextSteps : reasons).map((item, i) => (
            <div key={i} className={`result-item ${eligible ? "item-pass" : "item-fail"}`}>
              <span>{eligible ? "✓" : "•"}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        {!eligible && (
          <div className="contact-box">
            <strong>Need help?</strong> Call ECI Voter Helpline: <strong>1950</strong> (toll-free) · eci.gov.in
          </div>
        )}
        {eligible && (
          <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer" className="cta-link-btn">
            Register on voters.eci.gov.in →
          </a>
        )}
        <FlowCompletion onFlow={onFlow} prompt="What would you like to do next?" />
        <button className="btn-primary full-width" onClick={onDone}>
          {eligible ? "🗳️ Show me how to vote" : "📚 Learn more"}
        </button>
      </div>
    );
  }

  return (
    <div className="flow-container">
      <div style={{
        textAlign: "center", padding: "2rem 1rem 1.5rem",
        background: "linear-gradient(135deg, rgba(19,136,8,0.1), rgba(255,153,51,0.1))",
        borderRadius: "16px", marginBottom: "1.5rem",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✅</div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "white", margin: "0 0 0.4rem" }}>Eligibility Check</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>5 yes/no questions — takes about 1 minute</p>
      </div>
      <ProgressBar step={step + 1} total={ELIG_QUESTIONS.length} />
      <div className="elig-question">
        <p className="q-label">{q.label}</p>
        {q.opts ? (
          <div className="elig-opts">
            {q.opts.map(o => (
              <button key={o} className="elig-btn" onClick={() => advance(o)}>{o}</button>
            ))}
          </div>
        ) : (
          <div className="elig-num-row">
            <input
              ref={inputRef}
              type="number"
              min={0}
              max={120}
              value={numVal}
              placeholder="Enter your age"
              className="age-input"
              onChange={e => setNumVal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && numVal && advance(numVal)}
            />
            <button className="btn-primary" disabled={!numVal} onClick={() => numVal && advance(numVal)}>
              Confirm →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadinessQuiz({ onDone, onFlow, name }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const pickOption = useCallback((opt) => {
    const a = [...answers, opt];
    if (step < QUIZ_QUESTIONS.length - 1) {
      setAnswers(a);
      setStep(s => s + 1);
    } else {
      setResult(calcScore(a));
    }
  }, [answers, step]);

  const handleShare = useCallback(async (score) => {
    const shareData = {
      title: `Nagarik AI — I scored ${score}/10!`,
      text: `I scored ${score}/10 on my Election Readiness Check. Are YOU ready to vote? Check on Nagarik AI.`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { }
    }
  }, []);

  if (result) {
    const pct = result.score * 10;
    const LABELS = ["Electoral roll confirmed", "Valid ID document ready", "Polling booth located"];
    return (
      <div className="flow-container">
        <div className="score-banner">
          <div className="score-ring" style={{ "--score-color": result.color }}>
            <svg viewBox="0 0 100 100" className="score-svg">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={result.color} strokeWidth="8"
                strokeDasharray={`${2.64 * pct} 264`} strokeLinecap="round"
                transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div className="score-inner">
              <span className="score-num">{result.score}</span>
              <span className="score-denom">/10</span>
            </div>
          </div>
          <h2>{result.label}</h2>
          <p>{name}, {result.msg}</p>
        </div>
        <div className="score-insight-box">
          <div className="insight-row">
            <span className="insight-icon">💡</span>
            <div>
              <p className="insight-label">What this means</p>
              <p className="insight-text">{result.insight}</p>
            </div>
          </div>
          <div className="insight-row insight-suggest">
            <span className="insight-icon">→</span>
            <div>
              <p className="insight-label">What to do next</p>
              <p className="insight-text">{result.suggestion}</p>
            </div>
          </div>
        </div>
        <div className="score-breakdown">
          {answers.map((a, i) => (
            <div key={i} className="breakdown-item">
              <span className="breakdown-q">{LABELS[i]}</span>
              <span className="breakdown-dots" style={{ color: a.score > 0 ? "#138808" : "#dc2626" }}>
                {a.score > 0 ? "✓" : "✗"}
              </span>
            </div>
          ))}
        </div>
        <div className="share-box">
          <button className="btn-secondary" onClick={() => handleShare(result.score)}>
            {copied ? "✅ Copied!" : "📤 Share My Score"}
          </button>
        </div>
        <FlowCompletion onFlow={onFlow} prompt="Explore another topic:" />
        <button className="btn-primary full-width" onClick={onDone}>🗳️ Guide me through voting</button>
      </div>
    );
  }

  const q = QUIZ_QUESTIONS[step];
  return (
    <div className="flow-container">
      <div style={{
        textAlign: "center", padding: "2rem 1rem 1.5rem",
        background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(255,153,51,0.1))",
        borderRadius: "16px", marginBottom: "1.5rem",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🧠</div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "white", margin: "0 0 0.4rem" }}>Readiness Check</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>3 questions · get your score in 30 seconds</p>
      </div>
      <ProgressBar step={step + 1} total={QUIZ_QUESTIONS.length} />
      <div className="quiz-question">
        <p className="q-label">{q.question}</p>
        <div className="quiz-opts">
          {q.options.map((o, i) => (
            <button key={i} className="quiz-btn" onClick={() => pickOption(o)}>{o.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

const ChatMessage = memo(function ChatMessage({ msg, onAction, userLocation }) {
  const isUser = msg.role === "user";
  const [showWhy, setShowWhy] = useState(false);

  return (
    <div style={{
      display: "flex", gap: "0.625rem", marginBottom: "1rem",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-start",
      animation: "slideUp 0.3s cubic-bezier(0.4,0,0.2,1) both",
    }}>
      {!isUser && (
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #FF9933, #FFB347)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.9rem", boxShadow: "0 2px 8px rgba(255,153,51,0.3)",
          marginTop: "2px",
        }}>
          🪬
        </div>
      )}
      <div style={{ maxWidth: "82%", minWidth: 0 }}>
        {msg.type === "location_card" ? (
          <LocationActionCard city={userLocation} />
        ) : (
          <div style={{
            padding: msg.isTyping ? "0.75rem 1.25rem" : "0.75rem 1rem",
            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            background: isUser
              ? "linear-gradient(135deg, #FF9933, #e07b00)"
              : "rgba(255,255,255,0.06)",
            border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
            color: isUser ? "white" : "#e2e8f0",
            fontSize: "0.9rem",
            lineHeight: "1.55",
            boxShadow: isUser ? "0 4px 12px rgba(255,153,51,0.25)" : "none",
          }}>
            {msg.isQuickAnswer && !isUser && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                background: "rgba(255,153,51,0.15)", border: "1px solid rgba(255,153,51,0.3)",
                color: "#FF9933", borderRadius: "99px", padding: "2px 8px",
                fontSize: "0.68rem", fontWeight: "700", marginBottom: "6px",
                letterSpacing: "0.04em",
              }}>
                ⚡ QUICK ANSWER
              </span>
            )}
            {msg.isTyping ? (
              <div style={{ display: "flex", gap: "5px", alignItems: "center", height: "18px" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: "7px", height: "7px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.4)",
                    animation: `typingBounce 1.2s ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            ) : msg.content}
          </div>
        )}
        {!isUser && !msg.isTyping && (
          <div style={{ marginTop: "6px", paddingLeft: "4px" }}>
            <button
              onClick={() => setShowWhy(w => !w)}
              style={{
                background: "none", border: "none", color: "#64748b",
                fontSize: "0.75rem", cursor: "pointer", padding: "0",
                display: "flex", alignItems: "center", gap: "4px",
                transition: "color 0.2s",
              }}
              onMouseOver={e => e.currentTarget.style.color = "#94a3b8"}
              onMouseOut={e => e.currentTarget.style.color = "#64748b"}
            >
              💡 {showWhy ? "Hide source" : "Why this?"}
            </button>
            {showWhy && (
              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px", padding: "0.75rem", marginTop: "6px",
                fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5,
              }}>
                <p style={{ margin: "0 0 4px" }}>Based on <strong style={{ color: "#e2e8f0" }}>Election Commission of India (ECI)</strong> official guidelines and verified voter education materials.</p>
                {msg.isQuickAnswer
                  ? <p style={{ margin: 0 }}>✅ This is a <strong style={{ color: "#e2e8f0" }}>verified quick fact</strong> from ECI public data.</p>
                  : <p style={{ margin: 0 }}>🧠 Answer generated by AI using the Nagarik AI civic knowledge system prompt.</p>
                }
              </div>
            )}
          </div>
        )}
        {!msg.isTyping && msg.actions && msg.actions.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px", paddingLeft: isUser ? 0 : "4px" }}>
            {msg.actions.map(a => (
              <button
                key={a}
                onClick={() => onAction(a)}
                style={{
                  background: "rgba(255,153,51,0.08)", border: "1px solid rgba(255,153,51,0.2)",
                  color: "#FF9933", borderRadius: "99px", padding: "0.35rem 0.85rem",
                  fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", transition: "all 0.18s",
                  whiteSpace: "nowrap",
                }}
                onMouseOver={e => { e.currentTarget.style.background = "rgba(255,153,51,0.18)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseOut={e => { e.currentTarget.style.background = "rgba(255,153,51,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {a}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

const GPSBanner = ({ onAllow }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
    padding: "1rem 1.5rem", borderRadius: "16px", marginBottom: "1.5rem",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    backdropFilter: "blur(10px)", animation: "slideUp 0.4s ease-out"
  }}>
    <div>
      <div style={{ color: "white", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
        📍 Enable precise location
      </div>
      <div style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "4px" }}>
        Get your exact city (not ISP location) for accurate booth & election data.
      </div>
    </div>
    <button
      onClick={onAllow}
      style={{
        background: "#FF9933", border: "none", color: "white",
        padding: "0.6rem 1.5rem", borderRadius: "12px", fontWeight: "800", cursor: "pointer"
      }}
    >
      Allow GPS
    </button>
  </div>
);

function LandingScreen({ onEnter }) {
  const [name, setName] = useState("");
  const [tagIdx, setTagIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => { setTagIdx((i) => (i + 1) % TAGLINES.length); setFade(true); }, 350);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const tag = TAGLINES[tagIdx];

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "linear-gradient(160deg, #0a0f1e 0%, #0d1520 50%, #0a0f1e 100%)",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <div style={{ width: "100%", padding: "1.5rem 2rem", flex: 1, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{
              width: "36px", height: "36px", background: "linear-gradient(135deg, #FF9933, #FFB347)",
              borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
            }}>🪬</div>
            <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "white", letterSpacing: "-0.02em" }}>Nagarik AI</span>
          </div>
          <IndiaFlag size={26} />
        </div>

        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "24px", padding: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "1.5rem",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-60px", right: "-60px", width: "240px", height: "240px",
            background: "radial-gradient(circle, rgba(255,153,51,0.08) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: "900", lineHeight: 1.1,
            color: "white", marginBottom: "1rem", letterSpacing: "-0.03em",
            opacity: fade ? 1 : 0, transition: "opacity 0.35s ease",
          }}>
            {tag.h}
          </h1>
          <p style={{
            fontSize: "clamp(0.95rem, 2vw, 1.1rem)", color: "#94a3b8",
            maxWidth: "640px", lineHeight: 1.6, margin: 0,
            opacity: fade ? 1 : 0, transition: "opacity 0.35s ease 0.05s",
          }}>
            {tag.s}
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "0.75rem", marginBottom: "auto",
        }}>
          {[
            { icon: "⏱️", title: "Fast & Clear", desc: "Under 60 seconds to understand how to vote." },
            { icon: "👋", title: "First Timers", desc: "New to voting? You're exactly who this is for." },
            { icon: "🔒", title: "Secure", desc: "Works offline. No personal data collected." },
            { icon: "✅", title: "Verified", desc: "Aligned with official ECI guidelines." },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px", padding: "1.25rem", transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
              onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,153,51,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>{icon}</div>
              <div style={{ fontWeight: "700", color: "white", fontSize: "0.95rem", marginBottom: "0.3rem" }}>{title}</div>
              <div style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: "2rem" }}>
          <div style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "99px", display: "flex", alignItems: "center",
            padding: "0.4rem 0.4rem 0.4rem 1.5rem", gap: "0.75rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}>
            <span style={{ color: "white", fontWeight: "700", whiteSpace: "nowrap", fontSize: "0.95rem" }}>
              What's your name?
            </span>
            <input
              ref={inputRef}
              type="text"
              spellCheck="false"
              autoComplete="off"
              placeholder="e.g. Priya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && onEnter(name.trim())}
              style={{
                flex: 1, padding: "0.6rem 0.5rem", border: "none", outline: "none",
                fontSize: "1rem", color: "white", background: "transparent", minWidth: 0,
              }}
            />
            <button
              disabled={!name.trim()}
              onClick={() => onEnter(name.trim())}
              style={{
                background: name.trim() ? "linear-gradient(135deg, #FF9933, #e07b00)" : "rgba(255,255,255,0.06)",
                color: name.trim() ? "white" : "#4b5563",
                border: "none", padding: "0.7rem 2rem", borderRadius: "99px",
                fontWeight: "700", fontSize: "0.95rem",
                cursor: name.trim() ? "pointer" : "not-allowed",
                transition: "all 0.25s", whiteSpace: "nowrap",
                boxShadow: name.trim() ? "0 4px 12px rgba(255,153,51,0.35)" : "none",
              }}
            >
              Begin →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const FactCard = memo(function FactCard() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % FACTS.length); setVisible(true); }, 400);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      background: "rgba(255,153,51,0.06)", border: "1px solid rgba(255,153,51,0.15)",
      borderRadius: "12px", padding: "0.875rem 1rem", marginBottom: "1.25rem",
      opacity: visible ? 1 : 0, transition: "opacity 0.4s ease",
      display: "flex", alignItems: "flex-start", gap: "0.5rem",
    }}>
      <span style={{ fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5 }}>{FACTS[idx]}</span>
    </div>
  );
});


const FEATURES = [
  { flow: "voting", icon: "🗳️", labelKey: "guideVote", descKey: "guideDesc", accent: "#FF9933" },
  { flow: "timeline", icon: "📅", labelKey: "journey", descKey: "journeyDesc", accent: "#3b82f6" },
  { flow: "eligibility", icon: "✅", labelKey: "eligible", descKey: "eligDesc", accent: "#22c55e" },
  { flow: "quiz", icon: "🧠", labelKey: "readiness", descKey: "readinessDesc", accent: "#a855f7" },
];

const FLOW_WEIGHTS = { eligibility: 30, voting: 30, quiz: 40 };

const CivicImpactMeter = memo(function CivicImpactMeter({ completed }) {
  const pct = useMemo(() => completed.reduce((s, f) => s + (FLOW_WEIGHTS[f] || 0), 0), [completed]);
  const color = pct >= 70 ? "#138808" : pct >= 40 ? "#e8650a" : "#94a3b8";
  const label = pct >= 70 ? "Election-Ready 🎉" : pct >= 40 ? "Getting There 💪" : "Just Starting 👋";

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "14px", padding: "1rem", marginBottom: "1.25rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#94a3b8" }}>
          🟢 Civic Readiness — <em style={{ color: "#e2e8f0" }}>{label}</em>
        </span>
        <span style={{ fontSize: "0.85rem", fontWeight: "800", color }}>{pct}%</span>
      </div>
      <div style={{ height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: color,
          borderRadius: "99px", transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
      {pct === 0 && (
        <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "6px 0 0", textAlign: "center" }}>
          Complete the flows below to build your civic score
        </p>
      )}
    </div>
  );
});

function HomeScreen({ name, onFlow, msgs, onSend, input, setInput, isHindi, setIsHindi, completedFlows, userLocation, setUserLocation }) {
  const inputRef = useRef(null);
  const endRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const s = STR[isHindi ? "hi" : "en"];

  useEffect(() => {
    if (msgs.length > 1) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(input);
    }
  }, [input, onSend]);

  const refineLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(() => {
        const precise = prompt("GPS active. Please refine your city/constituency:", "Nipani, Belgaum");
        if (precise) setUserLocation(precise);
      }, () => {
        const manual = prompt("Could not access GPS. Enter location manually:", "Nipani, Belgaum");
        if (manual) setUserLocation(manual);
      });
    }
  };

  return (
    <div style={{
      width: "100%", height: "100vh", display: "flex", flexDirection: "column",
      fontFamily: "'Inter', -apple-system, sans-serif",
      overflow: "hidden",
      background: "linear-gradient(160deg, #0a0f1e 0%, #0d1520 50%, #0a0f1e 100%)",
    }}>
      <div style={{
        flexShrink: 0,
        background: "rgba(10,15,30,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0.875rem 1.5rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: "30px", height: "30px", background: "linear-gradient(135deg, #FF9933, #FFB347)",
            borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem",
          }}>🪬</div>
          <div>
            <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "white", lineHeight: 1, display: "flex", alignItems: "center", gap: "6px" }}>
              {s.namaste}, <span style={{ color: "#FF9933" }}>{name}</span>! 🙏
              <button onClick={refineLocation} style={{ background: "rgba(255,153,51,0.1)", border: "1px solid rgba(255,153,51,0.2)", color: "#FF9933", fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", cursor: "pointer" }}>📍 Refine</button>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>{s.clearer}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <button
            onClick={() => setIsHindi(!isHindi)}
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0", borderRadius: "8px", padding: "0.3rem 0.7rem",
              fontSize: "0.78rem", fontWeight: "700", cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          >
            {s.toggle}
          </button>
          <IndiaFlag size={24} />
        </div>
      </div>

      <div
        ref={scrollAreaRef}
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "1.25rem 1.5rem 0.5rem",
          scrollBehavior: "smooth",
        }}
      >
        <CivicImpactMeter completed={completedFlows} />
        <FactCard />

        <div className="feature-grid" style={{ marginBottom: "1.25rem" }}>
          {FEATURES.map(f => (
            <button
              key={f.flow}
              onClick={() => onFlow(f.flow)}
              style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px", padding: "1rem 1.1rem",
                textAlign: "left", cursor: "pointer", transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                display: "flex", flexDirection: "column", gap: "4px",
                position: "relative", overflow: "hidden",
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = `rgba(${f.accent === "#FF9933" ? "255,153,51" : f.accent === "#3b82f6" ? "59,130,246" : f.accent === "#22c55e" ? "34,197,94" : "168,85,247"},0.1)`;
                e.currentTarget.style.borderColor = `${f.accent}44`;
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.2)`;
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span style={{ fontSize: "1.4rem" }}>{f.icon}</span>
              <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "white" }}>{s[f.labelKey]}</span>
              <span style={{ fontSize: "0.72rem", color: "#64748b", lineHeight: 1.4 }}>{s[f.descKey]}</span>
            </button>
          ))}
        </div>

        {msgs.map(m => (
          <ChatMessage key={m.id} msg={m} onAction={txt => onSend(txt)} userLocation={userLocation} />
        ))}
        <div ref={endRef} style={{ height: "0.5rem" }} />
      </div>

      <div style={{
        flexShrink: 0,
        background: "rgba(10,15,30,0.97)", backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "0.875rem 1.5rem",
        zIndex: 10,
      }}>
        <div style={{
          display: "flex", gap: "0.5rem", alignItems: "flex-end",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "14px", padding: "0.5rem 0.5rem 0.5rem 1rem",
          transition: "border-color 0.2s",
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(255,153,51,0.4)"}
          onBlurCapture={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
        >
          <input
            ref={inputRef}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "white", fontSize: "0.9rem", lineHeight: "1.5",
              minWidth: 0, padding: "0.25rem 0",
            }}
            value={input}
            placeholder={s.placeholder}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            disabled={!input.trim()}
            onClick={() => onSend(input)}
            aria-label="Send"
            style={{
              width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
              background: input.trim() ? "linear-gradient(135deg, #FF9933, #e07b00)" : "rgba(255,255,255,0.05)",
              border: "none", cursor: input.trim() ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
              boxShadow: input.trim() ? "0 2px 8px rgba(255,153,51,0.3)" : "none",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "white" : "#4b5563"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p style={{ fontSize: "0.72rem", color: "#4b5563", margin: "0.4rem 0 0", textAlign: "center" }}>{s.hint}</p>
        <p style={{ fontSize: "0.7rem", color: "#374151", margin: "0.25rem 0 0", textAlign: "center" }}>
          🔒 Your data is not stored. This app runs securely.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("loading");
  const [hasGPS, setHasGPS] = useState(false);
  const [userName, setUserName] = useState("");
  const [currentFlow, setCurrentFlow] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [isHindi, setIsHindi] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [completedFlows, setCompletedFlows] = useState([]);
  const [lastCompleted, setLastCompleted] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [pendingName, setPendingName] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://ipinfo.io/json", { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        const loc = (data?.city && data?.region) ? `${data.city}, ${data.region}` : "India";
        setUserLocation(loc);
      })
      .catch(() => {
        setUserLocation("India");
      })
      .finally(() => {
        setPhase(prev => prev === "loading" ? "landing" : prev);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (phase === "loading") {
      const fallbackTimer = setTimeout(() => {
        setUserLocation(loc => loc || "India");
        setPhase(prev => prev === "loading" ? "landing" : prev);
      }, 3000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [phase]);

  useEffect(() => {
    if (pendingName && userLocation !== null) {
      const loc = userLocation;
      setMsgs([{
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Hi ${pendingName}! 👋 I see you're accessing Nagarik AI from ${loc}. Pick a topic below or ask me anything about voting in India.`,
        actions: ["How do I vote?", "Am I eligible?", "What is EPIC?"],
      }]);
      setPendingName(null);
    }
  }, [pendingName, userLocation]);

  const handleEnter = useCallback((name) => {
    const formatted = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    setUserName(formatted);
    setPhase("home");

    if (userLocation !== null) {
      setMsgs([{
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Hi ${formatted}! 👋 I see you're accessing Nagarik AI from ${userLocation}. Pick a topic below or ask me anything about voting in India.`,
        actions: ["How do I vote?", "Am I eligible?", "What is EPIC?"],
      }]);
    } else {
      setPendingName(formatted);
      setMsgs([{
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Hi ${formatted}! 👋 Pick a topic below or ask me anything about voting in India.`,
        actions: ["How do I vote?", "Am I eligible?", "What is EPIC?"],
      }]);
    }
  }, [userLocation]);

  const handleFlow = useCallback((flow) => {
    setCurrentFlow(flow);
    setPhase("flow");
  }, []);

  const handleFlowDone = useCallback(() => {
    const followUps = {
      voting: { content: `You've completed the voting guide! 🎉 Your voice matters — go make it count.`, actions: ["Check my eligibility", "Show election timeline"] },
      timeline: { content: `You now know India's full election timeline! Want to check your eligibility next?`, actions: ["Am I eligible?", "Guide me to vote"] },
      eligibility: { content: `Eligibility check done! Shall I walk you through the voting process step by step?`, actions: ["Guide me to vote", "Show election timeline"] },
      quiz: { content: `Quiz complete! Let me walk you through the voting process to close any gaps.`, actions: ["Guide me to vote", "Check my eligibility"] },
    };
    const fu = followUps[currentFlow] || { content: `Done! What else would you like to explore?`, actions: [] };
    setMsgs(p => [...p, { id: crypto.randomUUID(), role: "assistant", ...fu }]);
    if (currentFlow) {
      setCompletedFlows(prev => prev.includes(currentFlow) ? prev : [...prev, currentFlow]);
      setLastCompleted(currentFlow);
    }
    setCurrentFlow(null);
    setPhase("home");
  }, [currentFlow]);

  const handleSend = useCallback(async (text) => {
    if (!text.trim() || isTyping) return;
    setInput("");

    const userMsg = { id: crypto.randomUUID(), role: "user", content: text };

    for (const { q, a } of QUICK_ANSWERS) {
      if (q.test(text)) {
        setMsgs(p => [
          ...p,
          userMsg,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: a,
            actions: ["Guide me to vote", "Check my eligibility"],
            isQuickAnswer: true,
            type: /booth|polling station|where.*vote|find.*booth/i.test(text) ? "location_card" : "text",
          },
        ]);
        return;
      }
    }

    const intent = getIntent(text);
    if (intent) {
      setMsgs(p => [...p, userMsg, {
        id: crypto.randomUUID(), role: "assistant",
        content: `Sure, ${userName}! Let me open that guide for you.`,
      }]);
      setTimeout(() => handleFlow(intent), 600);
      return;
    }

    const userContext = { name: userName, language: isHindi ? "Hindi" : "English", location: userLocation, lastIntent: currentFlow, lastFlowCompleted: lastCompleted, completedFlows };
    const typingId = crypto.randomUUID();
    setMsgs(p => [...p, userMsg, { id: typingId, role: "assistant", isTyping: true }]);
    setIsTyping(true);

    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${base}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, context: userContext, isHindi }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMsgs(p => p.map(m => m.id === typingId
        ? { ...m, isTyping: false, content: data.reply || "Sorry, I couldn't understand that.", type: data.type || "text", actions: data.actions || ["Guide me to vote", "Check my eligibility"] }
        : m
      ));
    } catch {
      const fallback = getOfflineResponse(text);
      setMsgs(p => p.map(m => m.id === typingId
        ? { ...m, isTyping: false, content: fallback.reply, type: fallback.type, actions: fallback.actions }
        : m
      ));
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, userName, isHindi, userLocation, currentFlow, lastCompleted, completedFlows, handleFlow]);

  if (phase === "loading") {
    return (
      <div style={{
        width: "100%", minHeight: "100vh",
        background: "linear-gradient(160deg, #0a0f1e 0%, #0d1520 50%, #0a0f1e 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "1rem",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}>
        <div style={{
          width: "48px", height: "48px", background: "linear-gradient(135deg, #FF9933, #FFB347)",
          borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.5rem", animation: "pulse 1.5s ease-in-out infinite",
        }}>🪬</div>
        <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Loading Nagarik AI…</span>
      </div>
    );
  }

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0f1e 0%, #0d1520 50%, #0a0f1e 100%)",
      color: "white",
    }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; }
        body { background: #0a0f1e; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        input::placeholder { color: #4b5563; }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }
        @media (max-width: 900px) {
          .feature-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .feature-grid { grid-template-columns: 1fr; }
        }

        .flow-container { padding: 1.5rem 2rem; width: 100%; animation: pageIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
        .flow-wrapper { width: 100%; padding: 1.5rem 2rem; }

        .btn-primary {
          background: linear-gradient(135deg, #FF9933, #e07b00);
          color: white; border: none; padding: 0.75rem 1.5rem;
          border-radius: 12px; font-weight: 700; cursor: pointer;
          font-size: 0.95rem; transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 4px 12px rgba(255,153,51,0.3);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,153,51,0.4); }
        .btn-primary:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(255,153,51,0.2); }
        .btn-primary.full-width { width: 100%; margin-top: 0.75rem; }
        .btn-primary.celebrate { animation: none; }
        .btn-secondary {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
          color: #94a3b8; padding: 0.65rem 1.25rem; border-radius: 12px;
          font-weight: 600; cursor: pointer; font-size: 0.9rem;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); color: #000000ff; transform: translateY(-1px); }
        .tl-item { display: flex; gap: 1rem; margin-bottom: 0; animation: slideUp 0.3s ease-out both; }
        .tl-left { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
        .tl-dot { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .tl-connector { width: 2px; flex: 1; min-height: 20px; background: rgba(255,255,255,0.08); margin: 4px 0; }
        .tl-right { padding-bottom: 1.25rem; flex: 1; min-width: 0; }
        .tl-badge { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 0.72rem; font-weight: 700; border: 1px solid; margin-bottom: 4px; }
        .tl-name { font-weight: 700; color: white; font-size: 0.95rem; margin-bottom: 3px; }
        .tl-desc { font-size: 0.82rem; color: #94a3b8; line-height: 1.5; }
        .step-content { margin-bottom: 1.25rem; }
        .step-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.625rem; }
        .step-item { display: flex; gap: 0.75rem; align-items: flex-start; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 0.75rem; font-size: 0.88rem; color: #e2e8f0; line-height: 1.5; transition: all 0.2s; }
        .step-item:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }
        .step-bullet { color: #FF9933; font-weight: 800; flex-shrink: 0; margin-top: 1px; }
        .wow-moment { background: linear-gradient(135deg, rgba(255,153,51,0.1), rgba(255,179,71,0.05)); border: 1px solid rgba(255,153,51,0.2); border-radius: 12px; padding: 1rem; display: flex; gap: 0.75rem; align-items: flex-start; margin-top: 0.75rem; }
        .wow-icon { font-size: 1.25rem; flex-shrink: 0; }
        .wow-moment p { font-size: 0.85rem; color: #94a3b8; line-height: 1.55; margin: 0; }
        .tip-box { background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); border-radius: 10px; padding: 0.75rem; display: flex; gap: 0.5rem; align-items: flex-start; margin-top: 0.75rem; font-size: 0.83rem; color: #93c5fd; line-height: 1.5; }
        .tip-icon { flex-shrink: 0; }
        .step-nav { display: flex; gap: 0.75rem; justify-content: flex-end; align-items: center; }
        .last-step-actions { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .cta-link-btn { display: block; text-align: center; background: rgba(255,153,51,0.1); border: 1px solid rgba(255,153,51,0.3); color: #FF9933; padding: 0.7rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; text-decoration: none; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
        .cta-link-btn:hover { background: rgba(255,153,51,0.18); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,153,51,0.2); }
        .result-items { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
        .result-item { display: flex; gap: 0.75rem; padding: 0.75rem; border-radius: 10px; font-size: 0.88rem; line-height: 1.5; }
        .item-pass { background: rgba(19,136,8,0.08); border: 1px solid rgba(19,136,8,0.2); color: #86efac; }
        .item-fail { background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2); color: #fca5a5; }
        .contact-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; font-size: 0.85rem; color: #94a3b8; margin-bottom: 1rem; line-height: 1.6; }
        .elig-question { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem; }
        .q-label { font-size: 1rem; font-weight: 700; color: white; margin-bottom: 1rem; line-height: 1.4; }
        .elig-opts { display: flex; flex-direction: column; gap: 0.625rem; }
        .elig-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; padding: 0.875rem 1rem; border-radius: 10px; text-align: left; cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
        .elig-btn:hover { background: rgba(255,153,51,0.1); border-color: rgba(255,153,51,0.3); color: white; transform: translateX(4px); }
        .elig-num-row { display: flex; gap: 0.625rem; }
        .age-input { flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: white; padding: 0.75rem 1rem; border-radius: 10px; font-size: 1rem; outline: none; transition: border-color 0.2s; }
        .age-input:focus { border-color: rgba(255,153,51,0.5); }
        .quiz-question { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; }
        .quiz-opts { display: flex; flex-direction: column; gap: 0.625rem; }
        .quiz-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; padding: 0.875rem 1rem; border-radius: 10px; text-align: left; cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
        .quiz-btn:hover { background: rgba(168,85,247,0.1); border-color: rgba(168,85,247,0.3); color: white; transform: translateX(4px); }
        .score-banner { text-align: center; padding: 1.5rem 1rem; }
        .score-ring { width: 120px; height: 120px; position: relative; margin: 0 auto 1rem; }
        .score-svg { width: 100%; height: 100%; }
        .score-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .score-num { font-size: 2rem; font-weight: 900; color: white; line-height: 1; }
        .score-denom { font-size: 0.85rem; color: #64748b; font-weight: 600; }
        .score-banner h2 { font-size: 1.4rem; font-weight: 800; color: white; margin-bottom: 0.4rem; }
        .score-banner p { font-size: 0.88rem; color: #94a3b8; }
        .score-insight-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1rem; margin-bottom: 1rem; }
        .insight-row { display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.625rem 0; }
        .insight-row + .insight-row { border-top: 1px solid rgba(255,255,255,0.06); }
        .insight-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; color: #FF9933; }
        .insight-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin-bottom: 3px; }
        .insight-text { font-size: 0.85rem; color: #000000ff; line-height: 1.5; }
        .score-breakdown { display: flex; flex-direction: column; gap: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; margin-bottom: 1rem; }
        .breakdown-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem; }
        .breakdown-item:last-child { border-bottom: none; }
        .breakdown-q { color: #000000ff; }
        .share-box { display: flex; justify-content: center; margin-bottom: 0.75rem; }
        .flow-back-row { margin-bottom: 0.75rem; }

        @media (max-width: 600px) {
          .flow-container { padding: 1rem; }
          .flow-wrapper { padding: 0.75rem 1rem; }
          .step-nav { flex-direction: column-reverse; }
          .step-nav .btn-primary, .step-nav .btn-secondary { width: 100%; }
          .last-step-actions { width: 100%; }
        }
      `}</style>

      {phase === "landing" && <LandingScreen onEnter={handleEnter} />}

      {phase === "home" && (
        <HomeScreen
          name={userName}
          onFlow={handleFlow}
          msgs={msgs}
          onSend={handleSend}
          input={input}
          setInput={setInput}
          isHindi={isHindi}
          setIsHindi={setIsHindi}
          completedFlows={completedFlows}
          userLocation={userLocation || "India"}
          setUserLocation={setUserLocation}
        />
      )}

      {phase === "flow" && (
        <div style={{ width: "100%", minHeight: "100vh", overflowY: "auto", background: "linear-gradient(160deg, #0a0f1e 0%, #0d1520 50%, #0a0f1e 100%)", animation: "pageIn 0.3s cubic-bezier(0.4,0,0.2,1) both" }}>
          <div className="flow-wrapper">
            <div className="flow-back-row">
              <button className="btn-secondary" onClick={() => setPhase("home")}>← Back to Home</button>
            </div>
            {currentFlow === "voting" && <VotingGuide onDone={handleFlowDone} onFlow={handleFlow} name={userName} />}
            {currentFlow === "timeline" && <TimelineView onDone={handleFlowDone} onFlow={handleFlow} name={userName} />}
            {currentFlow === "eligibility" && <ACEligibilityChecker onDone={handleFlowDone} onFlow={handleFlow} name={userName} />}
            {currentFlow === "quiz" && <ReadinessQuiz onDone={handleFlowDone} onFlow={handleFlow} name={userName} />}
          </div>
        </div>
      )}
    </div>
  );
}