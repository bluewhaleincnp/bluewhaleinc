"use strict";

/* ── PAGE LOADER ─────────────────────────────────────────── */
(function () {
  const loader = document.getElementById("page-loader");
  if (!loader) return;

  // After icons land, spin the gears continuously
  setTimeout(() => {
    const g1 = loader.querySelector(".li-gear-1");
    const g2 = loader.querySelector(".li-gear-2");
    if (g1) g1.classList.add("landed");
    if (g2) g2.classList.add("landed");
  }, 1300);

  function hideLoader() {
    loader.classList.add("loader-hidden");
    // Fully remove from DOM after transition so it never blocks interaction
    loader.addEventListener(
      "transitionend",
      () => {
        loader.style.display = "none";
      },
      { once: true },
    );
  }

  if (document.readyState === "complete") {
    // Already loaded (e.g. cached page) — short grace period so animation plays
    setTimeout(hideLoader, 1600);
  } else {
    window.addEventListener("load", () => {
      setTimeout(hideLoader, 600); // allow a beat after load
    });
    // Safety fallback — never hang for more than 4 s
    setTimeout(hideLoader, 4000);
  }
})();

const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;

// Determine initial theme: stored preference > system preference
function getInitialTheme() {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

applyTheme(getInitialTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

// Also react to system preference changes (if no stored preference)
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });

/* ── DOM REFERENCES ──────────────────────────────────────── */
const header = document.getElementById("site-header");
const hamburger = document.getElementById("hamburger");
const mainNav = document.getElementById("main-nav");
const navLinks = document.querySelectorAll(".nav-link");
const scrollBtn = document.getElementById("scrollTop");
const sections = document.querySelectorAll("section[id]");

/* ── STICKY HEADER + SCROLL EFFECTS ─────────────────────── */
function onScroll() {
  const y = window.scrollY;

  // Add shadow to header when scrolled
  if (header) header.classList.toggle("scrolled", y > 40);

  // Show/hide scroll-to-top button
  if (scrollBtn) scrollBtn.classList.toggle("visible", y > 400);

  // Active nav link highlighting
  highlightNav();
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll(); // run once on load

/* ── ACTIVE NAV LINK ─────────────────────────────────────── */
function highlightNav() {
  const scrollMid = window.scrollY + window.innerHeight / 2;

  sections.forEach((sec) => {
    const top = sec.offsetTop;
    const bot = top + sec.offsetHeight;
    const id = sec.getAttribute("id");
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!link) return;
    link.classList.toggle("active", scrollMid >= top && scrollMid < bot);
  });
}

/* ── MOBILE HAMBURGER MENU ───────────────────────────────── */
if (hamburger && mainNav) {
  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", isOpen);
    mainNav.classList.toggle("open", isOpen);
  });
}

// Close mobile menu when a nav link is clicked
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!hamburger || !mainNav) return;
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("open");
  });
});

// Close mobile menu on outside click
document.addEventListener("click", (e) => {
  if (!header.contains(e.target)) {
    if (!hamburger || !mainNav) return;
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("open");
  }
});

/* ── SMOOTH SCROLL (anchors) ─────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    e.preventDefault();

    const headerH = header ? header.offsetHeight : 0;
    const top =
      target.getBoundingClientRect().top + window.scrollY - headerH - 8;

    window.scrollTo({ top, behavior: "smooth" });
  });
});

/* ── SCROLL-TO-TOP BUTTON ────────────────────────────────── */
if (scrollBtn) {
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ── SCROLL REVEAL ────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Unobserve after first reveal for performance
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px",
  },
);

document.querySelectorAll(".reveal").forEach((el) => {
  revealObserver.observe(el);
});

/* ── FOOTER YEAR ─────────────────────────────────────────── */
const yearEl = document.getElementById("footer-year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── CATEGORY CARDS — hover entrance stagger ─────────────── */
// Stagger reveal delay on category cards based on their grid position
document.querySelectorAll(".cat-card").forEach((card, i) => {
  card.style.transitionDelay = `${(i % 3) * 0.08}s`;
});

/* ── HERO STATS — count-up animation ─────────────────────── */
function animateCountUp(el, target, suffix = "") {
  const duration = 1400;
  const start = performance.now();
  const isDecimal = String(target).includes(".");

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(step);
}

// Observe hero stats
const statsObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const nums = entry.target.querySelectorAll(".stat-number");
      nums.forEach((el) => {
        const raw = el.textContent.trim(); // e.g. "10+"
        const suffix = raw.replace(/[\d.]/g, ""); // "+"
        const value = parseFloat(raw); // 10
        if (!isNaN(value)) animateCountUp(el, value, suffix);
      });
      statsObs.unobserve(entry.target);
    });
  },
  { threshold: 0.5 },
);

const heroStats = document.querySelector(".hero-stats");
if (heroStats) statsObs.observe(heroStats);

/* ── CARD TILT (subtle) on desktop ──────────────────────── */
function addTilt(selector) {
  // Only on non-touch devices
  if ("ontouchstart" in window) return;

  document.querySelectorAll(selector).forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.width;
      const y = (e.clientY - r.top - r.height / 2) / r.height;
      card.style.transform = `translateY(-4px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

addTilt(".cat-card");
addTilt(".why-card");

/* ── HEADER — add "transparent" class in hero, else solid ── */
// (already handled by .scrolled class — kept for reference)

/* ── HERO GRID — mouse parallax + autonomous drift ───────── */
(function () {
  const hero = document.getElementById("hero");
  const grid = hero && hero.querySelector(".hero-bg-grid");
  if (!hero || !grid) return;

  // ── Autonomous drift (sine-wave offset) ─────────────────
  // Two slow, phase-offset waves on X and Y create an organic feel
  let driftX = 0;
  let driftY = 0;
  let driftTime = 0;
  const DRIFT_SPEED = 0.0004; // radians per ms
  const DRIFT_AMP_X = 18; // px — horizontal range
  const DRIFT_AMP_Y = 12; // px — vertical range

  // ── Mouse parallax ──────────────────────────────────────
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  const MOUSE_STRENGTH = 0.022; // how strongly mouse pulls the grid
  const LERP_FACTOR = 0.06; // smoothing (lower = lazier)

  // Track mouse only inside hero
  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    // Normalise to -1 … +1 relative to hero centre
    mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
    mouseY = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });

  // Reset mouse on leave so drift resumes naturally
  hero.addEventListener("mouseleave", () => {
    mouseX = 0;
    mouseY = 0;
  });

  // ── Render loop ─────────────────────────────────────────
  let lastTs = null;

  function tick(ts) {
    if (lastTs !== null) {
      const dt = ts - lastTs;
      driftTime += dt;
    }
    lastTs = ts;

    // Autonomous drift
    driftX = Math.sin(driftTime * DRIFT_SPEED) * DRIFT_AMP_X;
    driftY = Math.sin(driftTime * DRIFT_SPEED * 0.7 + 1.2) * DRIFT_AMP_Y;

    // Mouse contribution (scales to ±24 px at hero edges)
    const targetX = driftX + mouseX * 24 * MOUSE_STRENGTH * 100;
    const targetY = driftY + mouseY * 16 * MOUSE_STRENGTH * 100;

    // Lerp for buttery smoothness
    currentX += (targetX - currentX) * LERP_FACTOR;
    currentY += (targetY - currentY) * LERP_FACTOR;

    grid.style.transform = `translate(${currentX}px, ${currentY}px)`;

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();

/* ── ACCESSIBILITY: keyboard nav close ──────────────────── */
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    mainNav &&
    hamburger &&
    mainNav.classList.contains("open")
  ) {
    if (!hamburger || !mainNav) return;
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("open");
    hamburger.focus();
  }
});
