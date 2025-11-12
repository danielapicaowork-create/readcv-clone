<script>
// Smoothly fade sections into view on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
  observer.observe(section);
});

// Fade-in animation CSS
const style = document.createElement('style');
style.innerHTML = `
  section {
    opacity: 0;
    transform: translateY(15px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  section.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);

// Collapsible sections (keep from previous version)
document.querySelectorAll(".toggle-btn").forEach(title => {
  title.addEventListener("click", () => {
    const section = title.parentElement;
    section.classList.toggle("collapsed");
    title.textContent = section.classList.contains("collapsed")
      ? title.textContent.replace("▾", "▸")
      : title.textContent.replace("▸", "▾");
  });
});

// PDF generation logic (keep if you want the button)
document.getElementById("download-btn")?.addEventListener("click", () => {
  const content = document.getElementById("profile-content").cloneNode(true);
  content.querySelectorAll("section").forEach(section => {
    const divs = section.querySelectorAll("div:not(:has(h2))");
    if (divs.length > 3) {
      divs.forEach((div, i) => i >= 3 && div.remove());
    }
    const lis = section.querySelectorAll("ul li");
    if (lis.length > 3) {
      lis.forEach((li, i) => i >= 3 && li.remove());
    }
  });

  const opt = {
    margin: 0.5,
    filename: "Daniela-Picao-Portfolio.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };
  html2pdf().from(content).set(opt).save();
});
</script>
