// script.js
// Handles: lazy-loading thumbnails, non-breaking-space helper, gallery modal logic, and link target handling

/* -------------------------
   Non-breaking-space helper
   (only between last two words)
   ------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const selector = "p, h1, h2, h3, li";
  document.querySelectorAll(selector).forEach(el => {
    // skip if contains interactive elements (links/buttons) to avoid breaking markup
    if (el.querySelector("a, button")) return;
    const text = el.innerHTML.trim();
    el.innerHTML = text.replace(/ (\S+)([.,;!?"]*)\s*$/, "&nbsp;$1$2");
  });
});

/* -------------------------
   Lazy-load thumbnails via IntersectionObserver
   ------------------------- */
(function initLazyImages() {
  const lazyClass = "lazy-img";
  const imgs = Array.from(document.querySelectorAll(`img.${lazyClass}`));

  if (!imgs.length) return;

  // onload handler to mark loaded and remove blur
  function markLoaded(img) {
    img.classList.add("img-loaded");
  }

  // If IntersectionObserver available, use it; otherwise load all
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const src = img.dataset.src || img.getAttribute("data-src");
        if (src) {
          img.src = src;
          img.removeAttribute("data-src");
        }
        // Ensure we still run onload handler if image is cached
        if (img.complete) markLoaded(img);
        else img.addEventListener("load", () => markLoaded(img), { once: true });
        observer.unobserve(img);
      });
    }, {
      root: null,
      rootMargin: "200px 0px", // preload before entering viewport
      threshold: 0.01
    });

    imgs.forEach(img => {
      // If a small inline src exists (unlikely), prefer data-src, otherwise observer will still set src.
      obs.observe(img);
    });
  } else {
    // fallback: load all immediately
    imgs.forEach(img => {
      const src = img.dataset.src || img.getAttribute("data-src");
      if (src) img.src = src;
      if (img.complete) img.classList.add("img-loaded");
      else img.addEventListener("load", () => img.classList.add("img-loaded"), { once: true });
    });
  }
})();

/* -------------------------
   Gallery / Modal logic
   ------------------------- */
(function setupGalleries(){
  const strips = Array.from(document.querySelectorAll('.gallery-strip'));
  const galleries = {};

  strips.forEach(strip => {
    const id = strip.dataset.gallery || Math.random().toString(36).slice(2);
    const thumbs = Array.from(strip.querySelectorAll('.thumb'));
    galleries[id] = thumbs.map(t => ({
      // prefer the thumb's data-src attribute (set on the parent), fallback to img.dataset.src
      src: t.dataset.src || t.querySelector('img')?.dataset?.src || t.querySelector('img')?.src || '',
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
    // clear modal image src to allow browser to free memory if needed
    modalImg.src = "";
    modalImg.alt = "";
  }

  function updateModalImage() {
    const gallery = galleries[activeGalleryId];
    if (!gallery) return;
    const item = gallery[activeIndex];
    // Load the full-size image only when needed
    modalImg.src = item.src;
    modalImg.alt = item.alt || "";
  }

  function showNext() {
    const gallery = galleries[activeGalleryId];
    if (!gallery) return;
    activeIndex = (activeIndex + 1) % gallery.length;
    updateModalImage();
  }

  function showPrev() {
    const gallery = galleries[activeGalleryId];
    if (!gallery) return;
    activeIndex = (activeIndex - 1 + gallery.length) % gallery.length;
    updateModalImage();
  }

  Object.keys(galleries).forEach(gid => {
    galleries[gid].forEach((item, idx) => {
      const el = item.thumbEl;
      // clicking/tapping opens modal
      el.addEventListener('click', () => openModal(gid, idx));
      // keyboard accessibility (Enter / Space)
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

/* -------------------------
   Make anchor links open in new tab (keeps original behaviour)
   ------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("a[href]").forEach(a => {
    // preserve mailto and same-origin links if you prefer — but original code set all to open in new tab
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });
});
