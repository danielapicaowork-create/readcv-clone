/* Daniela Picao – Portfolio Script
   Features:
   - Section fade-in on scroll
   - Responsive thumbnail gallery
   - Modal image viewer with keyboard & touch nav
   - Compact PDF generation (fits one A4)
*/

// -------------------- Section Fade-in Animation --------------------
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, observerOptions);

document.querySelectorAll('section').forEach(section => observer.observe(section));

// Add fade-in CSS dynamically (avoids needing extra stylesheet edits)
const fadeStyle = document.createElement('style');
fadeStyle.innerHTML = `
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
document.head.appendChild(fadeStyle);

// -------------------- Gallery Layout (≤2 = static, ≥3 = scrollable) --------------------
document.addEventListener('DOMContentLoaded', () => {
  const galleries = document.querySelectorAll('.thumbnails');
  galleries.forEach(gallery => {
    const imgs = gallery.querySelectorAll('img');
    if (imgs.length <= 2) {
      gallery.classList.remove('scrollable');
      gallery.style.overflowX = 'visible';
      gallery.style.gap = '16px';
    } else {
      gallery.classList.add('scrollable');
      gallery.style.overflowX = 'auto';
      gallery.setAttribute('tabindex', '0');
    }
  });

  // Staggered fade for experience items
  document.querySelectorAll('.experience-item').forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), i * 80);
  });
});

// -------------------- Modal Image Viewer --------------------
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-image');
const btnClose = document.getElementById('modal-close');
const btnNext = document.getElementById('modal-next');
const btnPrev = document.getElementById('modal-prev');

let galleryImages = [];
let currentIndex = 0;

function openModal(img) {
  const gallery = img.closest('.thumbnails');
  galleryImages = Array.from(gallery.querySelectorAll('img'));
  currentIndex = parseInt(img.dataset.index) || galleryImages.indexOf(img);

  updateModalImage();
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function updateModalImage() {
  const src = galleryImages[currentIndex]?.src;
  if (!src) return;

  modalImg.style.opacity = '0';
  modalImg.style.transform = 'scale(0.96)';
  setTimeout(() => {
    modalImg.src = src;
    modalImg.onload = () => {
      modalImg.style.opacity = '1';
      modalImg.style.transform = 'scale(1)';
    };
  }, 150);
}

// Event listeners
document.addEventListener('click', e => {
  if (e.target.tagName === 'IMG' && e.target.closest('.thumbnails')) openModal(e.target);
  if (e.target.id === 'image-modal') closeModal();
});
btnClose?.addEventListener('click', closeModal);
btnNext?.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  updateModalImage();
});
btnPrev?.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  updateModalImage();
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (!modal.classList.contains('open')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowRight') {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    updateModalImage();
  }
  if (e.key === 'ArrowLeft') {
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    updateModalImage();
  }
});

// Touch navigation for mobile
let touchStartX = 0;
modalImg?.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

modalImg?.addEventListener('touchend', e => {
  const touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 40) {
    if (diff > 0) currentIndex = (currentIndex + 1) % galleryImages.length;
    else currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    updateModalImage();
  }
}, { passive: true });

// Disable dragging thumbnails
document.querySelectorAll('.thumbnails img').forEach(img => img.setAttribute('draggable', 'false'));

// -------------------- PDF Generation (Compact Fit) --------------------
document.getElementById('download-btn')?.addEventListener('click', () => {
  const content = document.getElementById('profile-content').cloneNode(true);

  // Trim galleries to 3 images per section
  content.querySelectorAll('.thumbnails').forEach(gallery => {
    const imgs = Array.from(gallery.querySelectorAll('img'));
    if (imgs.length > 3) imgs.slice(3).forEach(i => i.remove());
  });

  // Compact scaling
  content.style.fontSize = '12px';
  content.style.lineHeight = '1.3';
  content.querySelectorAll('h2').forEach(h => {
    h.style.fontSize = '0.9rem';
    h.style.marginBottom = '0.4rem';
  });
  content.querySelectorAll('section').forEach(s => {
    s.style.marginBottom = '0.9rem';
    s.style.paddingBottom = '0.9rem';
  });

  const opt = {
    margin: 0.25,
    filename: 'Daniela-Picao-Portfolio.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all'] }
  };

  html2pdf().set(opt).from(content).save();
});
