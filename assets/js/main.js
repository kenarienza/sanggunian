/* Shared site behavior: mobile nav, back-to-top, newsletter, contact form */

document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav drawer
  const hamburger = document.querySelector(".hamburger");
  const mobileNav = document.querySelector(".mobile-nav");
  const mobileNavClose = document.querySelector(".mobile-nav-close");

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => mobileNav.classList.add("open"));
  }
  if (mobileNavClose && mobileNav) {
    mobileNavClose.addEventListener("click", () => mobileNav.classList.remove("open"));
  }
  if (mobileNav) {
    mobileNav.addEventListener("click", (e) => {
      if (e.target === mobileNav) mobileNav.classList.remove("open");
    });
  }

  // Back to top
  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("show", window.scrollY > 400);
    });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // Newsletter (placeholder — no backend wired up yet)
  document.querySelectorAll(".newsletter-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type=email]");
      if (input && input.value) {
        alert("Thank you for subscribing! You will receive updates on new ordinances and resolutions at " + input.value);
        form.reset();
      }
    });
  });

  // Contact form (placeholder)
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Thank you for reaching out to the Sangguniang Bayan ng Carmen. Your message has been noted (demo only — connect this form to a backend to receive submissions).");
      contactForm.reset();
    });
  }
});
