// script.js
// Handles: intersection observer, non-breaking-space helper, and gallery modal logic

// ------------------ Intersection observer (fade-in) ------------------
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, observerOptions);
document.querySelectorAll('section').forEach(section => observer.observe(section));

// Inject fade CSS for sections
(function injectFadeCSS(){
  const style = document.createElement('style');
  style.innerHTML = `
    section { opacity: 0; transform: translateY(15px); transition: opacity 0.6s ease, transform 0.6s ease; }
    section.visible { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);
})();

// ------------------ non-breaking space helper (only between last two words) ------------------
document.addEventListener("DOMContentLoaded", () => {
  const selector = "p, h1, h2, h3, li";
  document.querySelectorAll(selector).forEach(el => {
    if (el.querySelector("a, button")) return;
    const text = el.innerHTML.trim();
    el.innerHTML = text.replace(/ (\S+)([.,;!?"]*)\s*$/, "&nbsp;$1$2");
  });
});

// ------------------ Gallery / Modal logic ------------------
(function setupGalleries(){
  const strips = Array.from(document.querySelectorAll('.gallery-strip'));
  const galleries = {};

  strips.forEach(strip => {
    const id = strip.dataset.gallery;
    const thumbs = Array.from(strip.querySelectorAll('.thumb'));
    galleries[id] = thumbs.map(t => ({
      src: t.dataset.src || t.querySelector('img')?.src,
      alt: t.querySelector('img')?.alt || '',
      thumbEl: t
    }));
  });

  const modal = document.getElementById('gallery-modal');
  const modalImg = document.getElementById('gallery-modal-img');
  const btnClose = document.getElementById('modal-close');
  const btnPrev = document.getElementById('modal-prev');
  const btnNext = document.getElementById('modal-next');

  let activeGalleryId = null;
  let activeIndex = 0;

  function openModal(galleryId, index) {
    const gallery = galleries[galleryId];
    if (!gallery) return;
    activeGalleryId = galleryId;
    activeIndex = index;
    updateModalImage();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    activeGalleryId = null;
    activeIndex = 0;
    document.body.style.overflow = '';
  }

  function updateModalImage() {
    const gallery = galleries[activeGalleryId];
    if (!gallery) return;
    const item = gallery[activeIndex];
    modalImg.src = item.src;
    modalImg.alt = item.alt;
  }

  function showNext() {
    const gallery = galleries[activeGalleryId];
    activeIndex = (activeIndex + 1) % gallery.length;
    updateModalImage();
  }

  function showPrev() {
    const gallery = galleries[activeGalleryId];
    activeIndex = (activeIndex - 1 + gallery.length) % gallery.length;
    updateModalImage();
  }

  Object.keys(galleries).forEach(gid => {
    galleries[gid].forEach((item, idx) => {
      const el = item.thumbEl;
      el.addEventListener('click', () => openModal(gid, idx));
      el.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          openModal(gid, idx);
        }
      });
    });
  });

  btnClose.addEventListener('click', closeModal);
  btnPrev.addEventListener('click', showPrev);
  btnNext.addEventListener('click', showNext);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (!activeGalleryId) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
})();

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("a[href]").forEach(a => {
      // Skip anchors that should NOT open new tabs (optional)
      // if (a.getAttribute("href").startsWith("#")) return;

      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
  });
