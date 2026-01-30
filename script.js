const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Cache for loaded content
const contentCache = {};

// Lightbox elements
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxVideo = document.getElementById('lightbox-video');
const lightboxClose = document.querySelector('.lightbox__close');

// Open lightbox for image
function openLightboxImage(src) {
  if (!lightbox || !lightboxImg || !lightboxVideo) return;
  lightboxImg.src = src;
  lightboxImg.style.display = 'block';
  lightboxVideo.style.display = 'none';
  lightboxVideo.pause();
  lightbox.classList.add('lightbox--open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

// Open lightbox for video
function openLightboxVideo(src) {
  if (!lightbox || !lightboxImg || !lightboxVideo) return;
  lightboxVideo.src = src;
  lightboxVideo.style.display = 'block';
  lightboxImg.style.display = 'none';
  lightboxVideo.play();
  lightbox.classList.add('lightbox--open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

// Close lightbox
function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('lightbox--open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lightboxVideo) {
    lightboxVideo.pause();
    lightboxVideo.src = '';
  }
}

// Lightbox event listeners
if (lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);
}
if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// Handle media clicks for lightbox (images and videos)
document.addEventListener('click', (e) => {
  const wrap = e.target.closest('.media__wrap');
  if (!wrap) return;
  
  e.preventDefault();
  
  const img = wrap.querySelector('img');
  const video = wrap.querySelector('video');
  
  if (img) {
    openLightboxImage(img.src);
  } else if (video) {
    openLightboxVideo(video.src);
  }
});

// Load content into main area with smooth transition
async function loadContent(path, updateHash = true) {
  const contentArea = document.getElementById('content-area');
  if (!contentArea) return;

  // Check cache first
  let html = contentCache[path];

  if (!html) {
    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) throw new Error(String(res.status));
      html = await res.text();
      contentCache[path] = html;
    } catch {
      return; // Fail silently
    }
  }

  // Fade out
  contentArea.style.opacity = '0';
  contentArea.style.transform = 'translateY(8px)';

  // Wait for fade out
  await new Promise((r) => setTimeout(r, 150));

  // Update content
  contentArea.innerHTML = html;

  // Scroll to top of content
  contentArea.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Fade in
  requestAnimationFrame(() => {
    contentArea.style.opacity = '1';
    contentArea.style.transform = 'translateY(0)';
  });

  // Update URL hash without triggering navigation
  if (updateHash) {
    const hashMatch = path.match(/partials\/(.+)-content\.html/);
    if (hashMatch) {
      const hash = hashMatch[1] === 'home' ? '' : `#${hashMatch[1]}`;
      history.pushState(null, '', hash || window.location.pathname);
    }
  }

  // Update active state in sidebar
  updateActiveItem(path);
}

// Update active sidebar item
function updateActiveItem(activePath) {
  const items = document.querySelectorAll('.sidebar .item');
  items.forEach((item) => {
    const itemPath = item.getAttribute('data-content');
    if (itemPath === activePath) {
      item.classList.add('item--active');
    } else {
      item.classList.remove('item--active');
    }
  });
}

// Set up click handlers for sidebar navigation
function setupNavigation() {
  const contentArea = document.getElementById('content-area');
  if (!contentArea) return;

  // Load default or hash-based content
  const hash = window.location.hash.slice(1);
  let initialPath = contentArea.getAttribute('data-default');

  if (hash) {
    // Find matching sidebar item
    const matchingItem = document.querySelector(`.sidebar .item[href="#${hash}"]`);
    if (matchingItem) {
      initialPath = matchingItem.getAttribute('data-content');
    }
  }

  loadContent(initialPath, false);

  // Handle sidebar clicks
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.sidebar .item[data-content]');
    if (!item) return;

    e.preventDefault();
    const path = item.getAttribute('data-content');
    if (path) loadContent(path);
  });

  // Handle topbar name click (go home)
  document.addEventListener('click', (e) => {
    const nameLink = e.target.closest('.topbar__name[data-content]');
    if (!nameLink) return;

    e.preventDefault();
    const path = nameLink.getAttribute('data-content');
    if (path) loadContent(path);
  });

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.slice(1);
    let path = contentArea.getAttribute('data-default');

    if (hash) {
      const matchingItem = document.querySelector(`.sidebar .item[href="#${hash}"]`);
      if (matchingItem) {
        path = matchingItem.getAttribute('data-content');
      }
    }

    loadContent(path, false);
  });
}

// Initialize navigation
setupNavigation();
