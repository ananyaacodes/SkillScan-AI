/* ==========================================
   SkillScan AI — app.js
   Handles: Home, Interview, Result logic
   ========================================== */

/* ─── DATA ─────────────────────────────────── */

const QUESTIONS = [
  {
    category: "Technical Skills",
    text: "Can you walk us through how you would debug a critical bug found in production on a Friday evening?",
    tip: "Focus on systematic approach: reproduce → isolate → fix → verify → monitor.",
  },
  {
    category: "Communication",
    text: "Describe a time you had to explain a complex technical concept to a non-technical stakeholder.",
    tip: "Use the STAR method: Situation, Task, Action, Result.",
  },
  {
    category: "Problem Solving",
    text: "You're given an ambiguous project with no clear requirements. How do you get started?",
    tip: "Show initiative: ask clarifying questions, define scope, break into small deliverables.",
  },
  {
    category: "Collaboration",
    text: "Tell me about a conflict you had with a teammate and how you resolved it.",
    tip: "Stay professional, focus on outcome — not blame.",
  },
  {
    category: "Leadership",
    text: "How do you prioritize tasks when everything feels equally urgent?",
    tip: "Frameworks like Eisenhower matrix or MoSCoW show structured thinking.",
  },
];

const FEEDBACK_POOL = {
  "Job Ready": [
    "Outstanding performance across all dimensions. Your responses show depth of experience, clarity of thought, and strong situational awareness. You communicate with confidence and structure — exactly what interviewers look for. You're ready to walk into any interview and perform.",
    "Excellent work. You demonstrated both technical competence and soft skills with precision. Your answers were structured, insightful, and backed by strong reasoning. Continue refining edge cases and you'll be a top candidate in any process.",
  ],
  "Needs Training": [
    "Solid foundation, but there's room to grow. Some answers lacked concrete examples and your responses occasionally went off-track. Focus on the STAR method, practice explaining your thought process more clearly, and work on tightening your communication under pressure.",
    "You showed promise in some areas but inconsistency held you back. Revisit your weak categories, practice structured storytelling, and revisit common interview frameworks. A few weeks of deliberate prep will make a big difference.",
  ],
  "Low Confidence": [
    "Your responses suggest you're still building your foundation. That's okay — every expert started here. Focus on learning core concepts thoroughly, practicing mock interviews weekly, and building a portfolio of real work to reference in answers.",
    "There are gaps to close, but they're all addressable with effort. Start with the fundamentals in your weaker areas, document your learnings from projects, and practice speaking about your work out loud. Consistency beats intensity.",
  ],
};

const CATEGORIES = {
  "Job Ready":        { min: 7.5, class: "badge-job-ready",      desc: "You demonstrate strong readiness for professional roles. Your responses reflect clarity, experience, and confidence that hiring managers actively look for." },
  "Needs Training":   { min: 4.5, class: "badge-needs-training",  desc: "You have a solid base but would benefit from targeted practice. Focus on structuring your answers and deepening your domain knowledge." },
  "Low Confidence":   { min: 0,   class: "badge-low-confidence",  desc: "Your current responses suggest you'd benefit significantly from preparation before interviewing. Start with fundamentals and build from there." },
};

const BREAKDOWN_LABELS = [
  "Clarity of Communication",
  "Technical Accuracy",
  "Problem Structuring",
  "Confidence",
  "Relevance of Examples",
];

/* ─── STORAGE HELPERS ──────────────────────── */

function saveSession(data) {
  sessionStorage.setItem("skillscan_session", JSON.stringify(data));
}

function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem("skillscan_session")) || null;
  } catch { return null; }
}

/* ─── DETECT PAGE & INIT ────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.endsWith("interview.html")) {
    initInterview();
  } else if (path.endsWith("result.html")) {
    initResult();
  } else {
    // Home — nothing dynamic needed beyond CSS
    initHome();
  }
});

/* ─── HOME ──────────────────────────────────── */

function initHome() {
  // Clear any previous session when landing back on home
  sessionStorage.removeItem("skillscan_session");
}

/* ─── INTERVIEW ─────────────────────────────── */

function initInterview() {
  let currentQ = 0;
  let scores = [];
  let isRecording = false;
  let recordTimer = null;

  const counterEl  = document.getElementById("question-counter");
  const pctEl      = document.getElementById("progress-pct");
  const fillEl     = document.getElementById("progress-fill");
  const categoryEl = document.getElementById("q-category");
  const textEl     = document.getElementById("q-text");
  const waveEl     = document.getElementById("waveform");
  const statusEl   = document.getElementById("recording-status");
  const recordBtn  = document.getElementById("record-btn");
  const recordLbl  = document.getElementById("record-label");
  const recordIcon = document.getElementById("record-icon");
  const nextBtn    = document.getElementById("next-btn");
  const tipEl      = document.getElementById("tip-text");

  function renderQuestion(index) {
    const q = QUESTIONS[index];
    const pct = Math.round(((index + 1) / QUESTIONS.length) * 100);

    counterEl.textContent = `Question ${index + 1} of ${QUESTIONS.length}`;
    pctEl.textContent     = `${pct}%`;
    fillEl.style.width    = `${pct}%`;
    categoryEl.textContent = q.category;
    tipEl.textContent      = q.tip;

    // Animate card in
    const card = document.getElementById("question-card");
    card.style.animation = "none";
    card.offsetHeight; // reflow
    card.style.animation = "card-in 0.4s ease";

    textEl.textContent  = q.text;
    waveEl.className    = "waveform";
    statusEl.textContent = "Press the button to simulate your answer";
    recordBtn.className = "btn-record";
    recordBtn.disabled  = false;
    recordLbl.textContent = "Record Answer";
    recordIcon.textContent = "●";
    nextBtn.disabled    = true;
    isRecording         = false;
    clearTimeout(recordTimer);
  }

  function simulateRecording() {
    if (isRecording) return; // prevent double-tap

    // Start recording
    isRecording = true;
    recordBtn.className   = "btn-record recording";
    recordLbl.textContent = "Recording…";
    recordIcon.textContent = "◼";
    waveEl.className      = "waveform active";
    statusEl.textContent  = "Listening to your response…";

    // Simulate 3-second recording
    recordTimer = setTimeout(() => {
      stopRecording();
    }, 3000);
  }

  function stopRecording() {
    isRecording = false;
    clearTimeout(recordTimer);

    // Generate a score for this question (weighted random, feels realistic)
    const base = 5 + Math.random() * 5;
    const score = Math.min(10, Math.max(1, +(base.toFixed(1))));
    scores.push(score);

    // Update UI
    recordBtn.className   = "btn-record done";
    recordBtn.disabled    = true;
    recordLbl.textContent = "Answer Recorded ✓";
    recordIcon.textContent = "✓";
    waveEl.className      = "waveform done";
    statusEl.textContent  = "Great! Your answer has been captured.";
    nextBtn.disabled      = false;
  }

  function goNext() {
    currentQ++;
    if (currentQ >= QUESTIONS.length) {
      finishInterview(scores);
    } else {
      renderQuestion(currentQ);
    }
  }

  function finishInterview(scores) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    saveSession({ scores, avg: +avg.toFixed(1) });
    window.location.href = "result.html";
  }

  // Wire buttons
  recordBtn.addEventListener("click", simulateRecording);
  nextBtn.addEventListener("click", goNext);

  // Init first question
  renderQuestion(0);
}

/* ─── RESULT ────────────────────────────────── */

function initResult() {
  const session = loadSession();

  // Fallback demo data if user lands directly
  const scores = session ? session.scores : [7.2, 6.8, 8.1, 7.5, 6.9];
  const avg    = session ? session.avg    : 7.3;

  // Determine category
  let categoryKey = "Low Confidence";
  for (const [key, val] of Object.entries(CATEGORIES)) {
    if (avg >= val.min) { categoryKey = key; break; }
  }
  const catInfo = CATEGORIES[categoryKey];

  // -- Score display --
  const scoreEl = document.getElementById("score-display");
  const dialEl  = document.getElementById("dial-circle");

  // Inject gradient def
  const dialSvg = dialEl.closest("svg");
  dialSvg.insertAdjacentHTML("afterbegin", `
    <defs>
      <linearGradient id="dialGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stop-color="#00e5c3"/>
        <stop offset="100%" stop-color="#6c63ff"/>
      </linearGradient>
    </defs>
  `);

  // Animate score number
  animateNumber(scoreEl, 0, avg, 1200);

  // Animate dial (circumference = 2π × 80 ≈ 502)
  setTimeout(() => {
    const circumference = 502;
    const offset = circumference - (avg / 10) * circumference;
    dialEl.style.strokeDashoffset = offset;
  }, 100);

  // -- Category badge --
  const badgeEl = document.getElementById("category-badge");
  const descEl  = document.getElementById("category-desc");
  badgeEl.textContent = categoryKey;
  badgeEl.className   = `category-badge ${catInfo.class}`;
  descEl.textContent  = catInfo.desc;

  // -- Breakdown bars --
  buildBreakdown(scores);

  // -- Feedback --
  const pool   = FEEDBACK_POOL[categoryKey];
  const pick   = pool[Math.floor(Math.random() * pool.length)];
  document.getElementById("feedback-text").textContent = pick;
}

function buildBreakdown(scores) {
  const container = document.getElementById("breakdown-grid");
  container.innerHTML = "";

  BREAKDOWN_LABELS.forEach((label, i) => {
    const val = scores[i] !== undefined ? scores[i] : (5 + Math.random() * 5);
    const pct = (val / 10) * 100;

    const item = document.createElement("div");
    item.className = "breakdown-item";
    item.innerHTML = `
      <div class="breakdown-label-row">
        <strong>${label}</strong>
        <span>${val.toFixed(1)}</span>
      </div>
      <div class="breakdown-bar-bg">
        <div class="breakdown-bar-fill" style="width: 0%;" data-target="${pct}%"></div>
      </div>
    `;
    container.appendChild(item);
  });

  // Animate bars after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.querySelectorAll(".breakdown-bar-fill").forEach((bar, i) => {
        setTimeout(() => {
          bar.style.width = bar.dataset.target;
        }, i * 120);
      });
    });
  });
}

function animateNumber(el, from, to, duration) {
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const current = from + (to - from) * ease;
    el.textContent = current.toFixed(1);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}