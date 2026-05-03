/**
 * data/electionData.js
 * Static content: timeline phases + voting steps.
 * Fully offline — no API dependency.
 */

export const TIMELINE = [
  {
    phase: 1,
    name: "Election Announcement",
    icon: "📢",
    desc: "ECI announces the election schedule. The Model Code of Conduct (MCC) comes into effect immediately, restricting government spending and policy announcements.",
    color: "#dbeafe",
    border: "#3b82f6",
    text: "#1e40af",
  },
  {
    phase: 2,
    name: "Nomination Filing",
    icon: "📝",
    desc: "Candidates file nomination papers with the Returning Officer (RO) and pay a security deposit (₹25,000 for Lok Sabha). Independents and recognized parties file differently.",
    color: "#fef9c3",
    border: "#ca8a04",
    text: "#854d0e",
  },
  {
    phase: 3,
    name: "Scrutiny of Nominations",
    icon: "🔍",
    desc: "The Returning Officer reviews all filed nominations. Defective, fraudulent, or ineligible nominations are rejected. Candidates can challenge rejections before the RO.",
    color: "#ffe4e6",
    border: "#e11d48",
    text: "#9f1239",
  },
  {
    phase: 4,
    name: "Withdrawal Deadline",
    icon: "↩️",
    desc: "Candidates have a 2-day window after scrutiny to withdraw without penalty. After this, their name is locked on the ballot. This strategic phase often sees alliances form.",
    color: "#fae8ff",
    border: "#a855f7",
    text: "#6b21a8",
  },
  {
    phase: 5,
    name: "Campaign Period",
    icon: "📣",
    desc: "Parties and candidates campaign across constituencies. All activity must cease 48 hours before polling begins — the 'Silent Period' enforced strictly by ECI.",
    color: "#ffedd5",
    border: "#ea580c",
    text: "#9a3412",
  },
  {
    phase: 6,
    name: "Polling Day",
    icon: "🗳️",
    desc: "Voters cast ballots on EVMs from 7:00 AM to 6:00 PM (hours may vary by region). Indelible ink is applied to the left index finger. VVPAT confirms each vote for 7 seconds.",
    color: "#dcfce7",
    border: "#16a34a",
    text: "#14532d",
  },
  {
    phase: 7,
    name: "Vote Counting & Results",
    icon: "📊",
    desc: "Votes are tallied under ECI supervision. Agents from all parties observe counting. Winners are declared and results published on the official ECI results portal.",
    color: "#e0f2fe",
    border: "#0284c7",
    text: "#0c4a6e",
  },
];

export const VOTE_STEPS = [
  {
    step: 1,
    emoji: "📋",
    title: "Register on the Voter Roll",
    details: [
      "Visit voters.eci.gov.in → click 'Register as New Voter' → fill Form 6 online",
      "Upload scanned age proof (birth certificate / school certificate / Aadhaar), address proof, and a passport-size photo",
      "Note your Acknowledgement Reference Number to track your application",
      "Processing takes 4–6 weeks; verify your status at electoralsearch.eci.gov.in",
    ],
    tip: "You can also register offline by visiting your local Booth Level Officer (BLO) — find them via the Voter Helpline App.",
  },
  {
    step: 2,
    emoji: "🪪",
    title: "Get Your EPIC (Voter ID)",
    details: [
      "EPIC = Elector Photo Identity Card — your official government-issued Voter ID",
      "Collect the physical card from your local ERO (Electoral Registration Officer) office, OR",
      "Download an instant e-EPIC (digital Voter ID) from the ECI Voter Helpline App or voters.eci.gov.in",
      "No card yet? 12 alternate documents are accepted on election day — Aadhaar, Passport, PAN, Driving Licence, and more",
    ],
    tip: "Lost your EPIC? Apply for a duplicate at your ERO office or online. The e-EPIC works just as well on polling day.",
  },
  {
    step: 3,
    emoji: "📍",
    title: "Find Your Polling Booth",
    details: [
      "Visit electoralsearch.eci.gov.in or open the Voter Helpline App",
      "Search by name, EPIC number, or registered mobile number",
      "Note your Part Number, Serial Number, and the exact booth address",
      "Booths are typically within 2 km of your registered residential address",
    ],
    tip: "Plan your route the day before. Morning queues (7–9 AM) tend to be lighter in rural areas; urban booths may peak midday.",
  },
  {
    step: 4,
    emoji: "🌅",
    title: "Prepare for Polling Day",
    details: [
      "Carry your Voter ID card OR any 1 of the 12 ECI-approved alternate identity documents",
      "Check your booth's polling hours — usually 7:00 AM to 6:00 PM (varies by region and security level)",
      "Have a light meal before you go; wait times can be 30–90 minutes at peak hours",
      "Persons with disabilities have priority access — approach any polling officer for assistance",
    ],
    tip: "The Voter Helpline App shows real-time estimated queue lengths at many booths. ECI also arranges free transport in some states.",
  },
  {
    step: 5,
    emoji: "🗳️",
    title: "Cast Your Vote",
    details: [
      "Show your ID to the polling officer at the registration table — they verify against the voter roll",
      "Sign the register or give your thumb impression, then receive a voter slip",
      "Indelible ink is applied to your left index finger — a mark that means your vote has been counted and cannot be cast again",
      "Enter the voting compartment: press the blue button next to your candidate's name and symbol on the EVM",
      "A VVPAT slip appears for 7 seconds in the glass window — confirm your choice, then it drops into a sealed box",
    ],
    tip: "When that ink touches your finger, you become part of a 640-million-person act of democracy — a tradition that has continued unbroken since 1962, made right here in Mysore, Karnataka.",
  },
  {
    step: 6,
    emoji: "🏆",
    title: "You Voted — Now What?",
    details: [
      "Keep your Voter Slip as a record of participation (some states provide additional receipts)",
      "Follow results live at results.eci.gov.in or the ECI Results app on counting day",
      "Spot any violations on polling day? Report instantly via the cVIGIL app with geo-tagged evidence",
      "Encourage your family, friends, and community to vote — every single vote changes outcomes",
    ],
    tip: "India is the world's largest democracy. In the 2024 Lok Sabha elections, over 640 million people voted. You are part of that story.",
  },
];
