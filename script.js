const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");
const langToggle = document.getElementById("lang-toggle");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = `panel-${tab.dataset.panel}`;

    tabs.forEach((item) => item.classList.remove("active"));
    panels.forEach((panel) => panel.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(target)?.classList.add("active");
  });
});

if (langToggle) {
  langToggle.addEventListener("click", () => {
    const pressed = langToggle.getAttribute("aria-pressed") === "true";
    langToggle.setAttribute("aria-pressed", String(!pressed));
    document.body.classList.toggle("lang-hindi");
  });
}

const liveCount = document.querySelector("[data-live-count]");

if (liveCount) {
  let count = Number(liveCount.dataset.liveCount || liveCount.textContent || 486);

  window.setInterval(() => {
    const delta = Math.random() > 0.35 ? 1 : -1;
    count = Math.min(492, Math.max(486, count + delta));
    liveCount.textContent = String(count);
  }, 1600);
}
