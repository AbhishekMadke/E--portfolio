const body = document.body;
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const themeToggle = document.querySelector(".theme-toggle");
const typingTarget = document.querySelector(".typing");
const revealItems = document.querySelectorAll(".reveal");
const rippleItems = document.querySelectorAll(".ripple");
const progressBar = document.querySelector(".progress-bar");
const cursorGlow = document.querySelector(".cursor-glow");
const filterButtons = document.querySelectorAll(".filter-pill");
const projectCards = document.querySelectorAll(".project-card");
const contactForm = document.querySelector(".contact-form");
const yearTarget = document.getElementById("year");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const roles = typingTarget?.dataset.roles.split(",") ?? [];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

const setTheme = (theme) => {
  body.classList.toggle("light-theme", theme === "light");
  localStorage.setItem("theme", theme);
};

const initializeTheme = () => {
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme) {
    setTheme(storedTheme);
    return;
  }

  const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(systemPrefersLight ? "light" : "dark");
};

const typeRoles = () => {
  if (!typingTarget || !roles.length || prefersReducedMotion.matches) {
    if (typingTarget && roles[0]) {
      typingTarget.textContent = roles[0];
    }
    return;
  }

  const currentRole = roles[roleIndex];
  const nextText = isDeleting
    ? currentRole.slice(0, charIndex - 1)
    : currentRole.slice(0, charIndex + 1);

  typingTarget.textContent = nextText;
  charIndex = nextText.length;

  let delay = isDeleting ? 45 : 85;

  if (!isDeleting && nextText === currentRole) {
    delay = 1300;
    isDeleting = true;
  } else if (isDeleting && nextText === "") {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 250;
  }

  window.setTimeout(typeRoles, delay);
};

const updateProgress = () => {
  const scrollTop = window.scrollY;
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? scrollTop / scrollableHeight : 0;
  progressBar.style.transform = `scaleX(${progress})`;
};

const revealOnScroll = () => {
  if (prefersReducedMotion.matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -5% 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
};

const createRipple = (event) => {
  const circle = document.createElement("span");
  const rect = event.currentTarget.getBoundingClientRect();

  circle.className = "ripple-circle";
  circle.style.left = `${event.clientX - rect.left}px`;
  circle.style.top = `${event.clientY - rect.top}px`;

  event.currentTarget.appendChild(circle);
  window.setTimeout(() => circle.remove(), 650);
};

const handleFilter = (event) => {
  const selectedFilter = event.currentTarget.dataset.filter;

  filterButtons.forEach((button) => button.classList.toggle("is-active", button === event.currentTarget));

  projectCards.forEach((card) => {
    const matches =
      selectedFilter === "all" || card.dataset.category.split(" ").includes(selectedFilter);
    card.classList.toggle("is-hidden", !matches);
  });
};

const handleCursorGlow = (event) => {
  if (!cursorGlow || window.innerWidth < 760) return;

  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
};

const handleFormSubmit = (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;

  submitButton.textContent = "Message Drafted";
  submitButton.disabled = true;

  window.setTimeout(() => {
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    contactForm.reset();
  }, 1800);
};

const closeMenu = () => {
  if (!navMenu || !navToggle) return;

  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

const setupNavigation = () => {
  if (!navToggle || !navMenu) return;

  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
};

initializeTheme();
setupNavigation();
revealOnScroll();
typeRoles();
updateProgress();

if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear());
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = body.classList.contains("light-theme") ? "dark" : "light";
  setTheme(nextTheme);
});

rippleItems.forEach((item) => item.addEventListener("click", createRipple));
filterButtons.forEach((button) => button.addEventListener("click", handleFilter));
contactForm?.addEventListener("submit", handleFormSubmit);

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("mousemove", handleCursorGlow);
window.addEventListener("resize", closeMenu);
