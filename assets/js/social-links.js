/*
 * Single place to update social URLs across every page.
 * Leave a value empty to hide that link automatically.
 */
const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/leemcilwraith",
  youtube: "https://www.youtube.com/@leemousemac",
  github: "https://github.com/leenatterbox",
  x: "",
  instagram: "",
};

const SOCIAL_LABELS = {
  linkedin: "LinkedIn",
  youtube: "YouTube",
  github: "GitHub",
  x: "X",
  instagram: "Instagram",
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-social]").forEach((el) => {
    const key = el.getAttribute("data-social");
    const url = SOCIAL_LINKS[key];

    if (!url) {
      el.hidden = true;
      return;
    }

    el.href = url;
    el.textContent = SOCIAL_LABELS[key] || key;
    el.target = "_blank";
    el.rel = "noopener";
  });
});
