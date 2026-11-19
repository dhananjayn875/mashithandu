/**
 * MASHITHANDU (മഷിത്തണ്ട്) - GMHHS Punkunnam 1991 SSLC Batch
 * Interactive Core Application
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    allPhotos: [],
    filteredPhotos: [],
    currentCategory: 'all',
    currentReunionFilter: 'all',
    searchQuery: '',
    viewMode: 'grid', // 'grid' or 'masonry'
    activeLightboxIndex: 0,
    isPlayingAudio: false,
    audioContext: null,
    audioMelodyTimer: null,
    memories: []
  };

  // Initialize Data
  initPhotos();
  initMemories();

  // Initialize UI Components
  initHeader();
  initMagicSlate();
  initReunionsCarousel();
  initGallery();
  initLightbox();
  initThenNowSlider();
  initTeachers();
  initMemoryWall();
  initUploadModal();
  initAudioEngine();
  initWhatsAppShareButtons();

  /* ==========================================================================
     Data Initialization
     ========================================================================== */
  function initPhotos() {
    const savedCustomPhotos = JSON.parse(localStorage.getItem('mashithandu_custom_photos') || '[]');
    state.allPhotos = [...savedCustomPhotos, ...GALLERY_DATA];
    state.filteredPhotos = [...state.allPhotos];
  }

  function initMemories() {
    const savedMemories = JSON.parse(localStorage.getItem('mashithandu_memories') || '[]');
    state.memories = [...savedMemories, ...INITIAL_MEMORIES];
  }

  /* ==========================================================================
     Header & Navigation
     ========================================================================== */
  function initHeader() {
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Mobile nav active state tracking
    const sections = document.querySelectorAll('section[id]');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');

    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      const scrollPos = window.scrollY + 200;

      sections.forEach(sec => {
        if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      mobileNavLinks.forEach(link => {
        const href = link.getAttribute('href').replace('#', '');
        if (href === currentSectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    });
  }

  /* ==========================================================================
     Interactive Magic Slate & Mashithandu Wiping Canvas
     ========================================================================== */
  function initMagicSlate() {
    const canvas = document.getElementById('slateCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let hasWiped = false;

    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawSlateSurface();
    }

    function drawSlateSurface() {
      // Natural Slate texture base
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#222b25';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Slate subtle horizontal ruled lines (like old school slate)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 30; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(15, y);
        ctx.lineTo(canvas.width - 15, y);
        ctx.stroke();
      }

      // Slate chalk dust / speckle noise
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillStyle = `rgba(240, 240, 230, ${Math.random() * 0.08})`;
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      // Chalk written Malayalam text
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(250, 248, 240, 0.9)';
      
      // Title
      ctx.font = 'bold 36px "Noto Serif Malayalam", Georgia, serif';
      ctx.fillText('മഷിത്തണ്ട്', canvas.width / 2, canvas.height / 2 - 38);

      // Subtitle
      ctx.font = '600 16px "Gayathri", sans-serif';
      ctx.fillStyle = 'rgba(231, 173, 82, 0.95)';
      ctx.fillText('GMHHS Punkunnam • 1991 SSLC Batch', canvas.width / 2, canvas.height / 2 - 2);

      // Interactive Hint
      ctx.font = '14px "Outfit", sans-serif';
      ctx.fillStyle = 'rgba(240, 240, 230, 0.85)';
      ctx.fillText('✨ Drag finger to wipe slate & reveal photo...', canvas.width / 2, canvas.height / 2 + 42);

      // Small flower / Peperomia stem illustration in chalk
      drawChalkLeaf(ctx, canvas.width / 2, canvas.height / 2 + 75);
    }

    function drawChalkLeaf(c, x, y) {
      c.strokeStyle = 'rgba(162, 219, 169, 0.8)';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(x, y, 12, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.moveTo(x, y + 12);
      c.lineTo(x, y + 24);
      c.stroke();
    }

    function eraseAt(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      const radius = 28;
      const gradient = ctx.createRadialGradient(x, y, 5, x, y, radius);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(0.7, 'rgba(0,0,0,0.85)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (!hasWiped) {
        hasWiped = true;
        playWipeSound();
      }
    }

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      if (e.touches && e.touches.length > 0) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
      }
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }

    // Canvas Events (Mouse & Touch)
    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const { x, y } = getCoords(e);
      eraseAt(x, y);
    });

    window.addEventListener('mouseup', () => { isDrawing = false; });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const { x, y } = getCoords(e);
      eraseAt(x, y);
    });

    canvas.addEventListener('touchstart', (e) => {
      isDrawing = true;
      const { x, y } = getCoords(e);
      eraseAt(x, y);
    }, { passive: true });

    window.addEventListener('touchend', () => { isDrawing = false; });

    canvas.addEventListener('touchmove', (e) => {
      if (!isDrawing) return;
      const { x, y } = getCoords(e);
      eraseAt(x, y);
    }, { passive: true });

    // Reset button
    const btnReset = document.getElementById('btnResetSlate');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        hasWiped = false;
        drawSlateSurface();
        showToast('സ്ലേറ്റ് വീണ്ടും തയ്യാറായി!');
      });
    }

    // Wipe all button
    const btnWipeAll = document.getElementById('btnWipeAllSlate');
    if (btnWipeAll) {
      btnWipeAll.addEventListener('click', () => {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        playWipeSound();
        showToast('ഓർമ്മച്ചിത്രം വെളിച്ചത്തിലേക്ക്!');
      });
    }

    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 100);
  }

  /* ==========================================================================
     10 Reunions Milestone Carousel
     ========================================================================== */
  function initReunionsCarousel() {
    const track = document.getElementById('reunionsTrack');
    const prevBtn = document.getElementById('btnPrevReunion');
    const nextBtn = document.getElementById('btnNextReunion');
    const counterEl = document.getElementById('carouselCounter');

    if (!track) return;

    // Render Reunion Cards
    track.innerHTML = REUNIONS_DATA.map((r, index) => {
      const photosCount = state.allPhotos.filter(p => p.reunion === r.id).length;
      const ordinal = getOrdinalSuffix(r.edition);
      return `
        <article class="reunion-card" data-reunion-id="${r.id}">
          <div class="reunion-card-media">
            <img class="reunion-card-img" src="${r.cover}" alt="${r.title_ml}" loading="lazy" onerror="this.src=getSvgFallback('${r.title_ml}', '${r.year}')" />
            <span class="reunion-badge-edition">
              <span>★</span> ${r.edition}${ordinal} Reunion
            </span>
            <span class="reunion-badge-year">${r.year}</span>
          </div>
          <div class="reunion-card-body">
            <h3 class="reunion-card-title">${r.title_ml}</h3>
            <p class="reunion-card-theme">"${r.theme}"</p>
            <div class="reunion-card-meta">
              <div class="meta-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span><strong>Venue:</strong> ${r.venue_ml}</span>
              </div>
              <div class="meta-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span><strong>Date:</strong> ${r.date}</span>
              </div>
              <div class="meta-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span><strong>Attendees:</strong> ${r.attendees}</span>
              </div>
            </div>
            <div class="reunion-card-action">
              <button class="btn-filter-reunion" data-reunion="${r.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>View Photos (${photosCount > 0 ? photosCount : '5+'})</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Carousel buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -340, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: 340, behavior: 'smooth' });
      });
    }

    // Click "ചിത്രങ്ങൾ കാണുക" on any reunion card
    track.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-filter-reunion');
      if (!btn) return;
      const reunionId = btn.getAttribute('data-reunion');
      filterByReunion(reunionId);
    });
  }

  function filterByReunion(reunionId) {
    state.currentCategory = 'all';
    state.currentReunionFilter = reunionId;
    state.searchQuery = '';

    // Update Dropdown UI
    const dropdown = document.getElementById('reunionSelect');
    if (dropdown) dropdown.value = reunionId;

    // Update Filter Chips UI
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    const allChip = document.querySelector('.filter-chip[data-category="all"]');
    if (allChip) allChip.classList.add('active');

    applyFilters();

    // Scroll smoothly to gallery
    const gallerySec = document.getElementById('gallery');
    if (gallerySec) {
      gallerySec.scrollIntoView({ behavior: 'smooth' });
    }

    const rInfo = REUNIONS_DATA.find(r => r.id === reunionId);
    if (rInfo) {
      showToast(`${rInfo.edition}${getOrdinalSuffix(rInfo.edition)} Reunion (${rInfo.year}) selected!`);
    }
  }

  /* ==========================================================================
     50+ Photo Gallery Engine
     ========================================================================== */
  function initGallery() {
    // Populate Reunion Dropdown Options
    const select = document.getElementById('reunionSelect');
    if (select) {
      select.innerHTML = `
        <option value="all">All Reunions (1-10)</option>
        ${REUNIONS_DATA.map(r => `<option value="${r.id}">${r.edition}${getOrdinalSuffix(r.edition)} Reunion (${r.year}) - ${r.title_ml}</option>`).join('')}
      `;
      select.addEventListener('change', (e) => {
        state.currentReunionFilter = e.target.value;
        applyFilters();
      });
    }

    // Filter Chips
    const chipsContainer = document.getElementById('filterChips');
    if (chipsContainer) {
      chipsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.currentCategory = chip.getAttribute('data-category');
        applyFilters();
      });
    }

    // Live Search
    const searchInput = document.getElementById('gallerySearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        applyFilters();
      });
    }

    // View Mode Toggle (Grid vs Masonry)
    const btnGrid = document.getElementById('btnViewGrid');
    const btnMasonry = document.getElementById('btnViewMasonry');
    const galleryGrid = document.getElementById('galleryGrid');

    if (btnGrid && btnMasonry && galleryGrid) {
      btnGrid.addEventListener('click', () => {
        btnGrid.classList.add('active');
        btnMasonry.classList.remove('active');
        galleryGrid.classList.remove('masonry-view');
        state.viewMode = 'grid';
      });

      btnMasonry.addEventListener('click', () => {
        btnMasonry.classList.add('active');
        btnGrid.classList.remove('active');
        galleryGrid.classList.add('masonry-view');
        state.viewMode = 'masonry';
      });
    }

    // Initial render
    renderGallery();
  }

  function applyFilters() {
    state.filteredPhotos = state.allPhotos.filter(item => {
      // Category filter
      if (state.currentCategory !== 'all') {
        if (state.currentCategory === 'reunions' && item.category !== 'reunion') return false;
        if (state.currentCategory !== 'reunions' && item.category !== state.currentCategory) return false;
      }

      // Reunion filter
      if (state.currentReunionFilter !== 'all') {
        if (item.reunion !== state.currentReunionFilter) return false;
      }

      // Search query
      if (state.searchQuery) {
        const q = state.searchQuery;
        const matchTitleMl = (item.title_ml || '').toLowerCase().includes(q);
        const matchTitleEn = (item.title_en || '').toLowerCase().includes(q);
        const matchDesc = (item.desc_ml || '').toLowerCase().includes(q);
        const matchVenue = (item.venue_ml || '').toLowerCase().includes(q);
        const matchYear = String(item.year || '').includes(q);
        if (!matchTitleMl && !matchTitleEn && !matchDesc && !matchVenue && !matchYear) return false;
      }

      return true;
    });

    renderGallery();
  }

  function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    const countBadge = document.getElementById('galleryCountBadge');
    if (!grid) return;

    if (countBadge) {
      countBadge.textContent = `${state.filteredPhotos.length} Photos Available`;
    }

    if (state.filteredPhotos.length === 0) {
      grid.innerHTML = `
        <div class="gallery-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <h3 class="gallery-empty-title">No photos found</h3>
          <p class="gallery-empty-desc">Try searching with another word or reset filters.</p>
          <button id="btnResetFilters" style="margin-top: 1rem;" class="btn-primary">Reset Filters</button>
        </div>
      `;
      const btnReset = document.getElementById('btnResetFilters');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          state.currentCategory = 'all';
          state.currentReunionFilter = 'all';
          state.searchQuery = '';
          const searchInput = document.getElementById('gallerySearch');
          if (searchInput) searchInput.value = '';
          const select = document.getElementById('reunionSelect');
          if (select) select.value = 'all';
          document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
          const allChip = document.querySelector('.filter-chip[data-category="all"]');
          if (allChip) allChip.classList.add('active');
          applyFilters();
        });
      }
      return;
    }

    grid.innerHTML = state.filteredPhotos.map((photo, index) => {
      const aspectClass = photo.aspect === 'portrait' ? 'aspect-portrait' : (photo.aspect === 'square' ? 'aspect-square' : 'aspect-landscape');
      const catLabel = getCategoryDisplayName(photo.category);
      return `
        <div class="gallery-item ${aspectClass}" data-index="${index}">
          <div class="gallery-img-wrap">
            <img class="gallery-img" src="${photo.image}" alt="${photo.title_ml}" loading="lazy" onerror="this.src=getSvgFallback('${photo.title_ml}', '${photo.year}')" />
            <div class="gallery-item-badges">
              <span class="item-badge-year">${photo.year}</span>
              <span class="item-badge-cat">${catLabel}</span>
            </div>
            <div class="gallery-item-overlay">
              <span class="btn-item-expand" title="View Photo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              </span>
            </div>
          </div>
          <div class="gallery-item-content">
            <h4 class="gallery-item-title">${photo.title_ml}</h4>
            <div class="gallery-item-venue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${photo.venue_ml || 'Thrissur'}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click to open lightbox
    grid.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        openLightbox(idx);
      });
    });
  }

  function getCategoryDisplayName(cat) {
    switch (cat) {
      case 'reunion': return 'Reunion';
      case 'vintage': return 'Class 10';
      case 'teachers': return 'Teachers';
      case 'campus': return 'Campus';
      case 'candid': return 'Candid';
      default: return 'Memory';
    }
  }

  function getOrdinalSuffix(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  /* ==========================================================================
     Touch-Enabled Lightbox Modal
     ========================================================================== */
  function initLightbox() {
    const modal = document.getElementById('lightboxModal');
    const closeBtn = document.getElementById('btnCloseLightbox');
    const prevBtn = document.getElementById('btnLightboxPrev');
    const nextBtn = document.getElementById('btnLightboxNext');
    const shareBtn = document.getElementById('btnLightboxShare');
    const downloadBtn = document.getElementById('btnLightboxDownload');

    if (!modal) return;

    if (closeBtn) {
      closeBtn.addEventListener('click', closeLightbox);
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', prevLightboxPhoto);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', nextLightboxPhoto);
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevLightboxPhoto();
      if (e.key === 'ArrowRight') nextLightboxPhoto();
    });

    // Touch Swipe Navigation for Mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const lightboxMain = document.querySelector('.lightbox-main');

    if (lightboxMain) {
      lightboxMain.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      lightboxMain.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
    }

    function handleSwipe() {
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 45) {
        if (diff > 0) {
          prevLightboxPhoto(); // Swiped right -> prev
        } else {
          nextLightboxPhoto(); // Swiped left -> next
        }
      }
    }

    // Share via WhatsApp
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const photo = state.filteredPhotos[state.activeLightboxIndex];
        if (!photo) return;
        const text = encodeURIComponent(`*മഷിത്തണ്ട് - GMHHS പൂങ്കുന്നം 1991 ബാച്ച് ഓർമ്മച്ചിത്രം*\n"${photo.title_ml}" (${photo.year})\nവേദി: ${photo.venue_ml}\n\nകൂടുതൽ ചിത്രങ്ങൾ കാണാൻ മഷിത്തണ്ട് വെബ്സൈറ്റ് സന്ദർശിക്കുക!`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
      });
    }

    // Download photo
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const photo = state.filteredPhotos[state.activeLightboxIndex];
        if (!photo) return;
        const link = document.createElement('a');
        link.href = photo.image;
        link.download = `mashithandu-1991-photo-${photo.id}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Downloading photo...');
      });
    }
  }

  function openLightbox(index) {
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;
    state.activeLightboxIndex = index;
    updateLightboxContent();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function prevLightboxPhoto() {
    if (state.filteredPhotos.length <= 1) return;
    state.activeLightboxIndex = (state.activeLightboxIndex - 1 + state.filteredPhotos.length) % state.filteredPhotos.length;
    updateLightboxContent();
  }

  function nextLightboxPhoto() {
    if (state.filteredPhotos.length <= 1) return;
    state.activeLightboxIndex = (state.activeLightboxIndex + 1) % state.filteredPhotos.length;
    updateLightboxContent();
  }

  function updateLightboxContent() {
    const photo = state.filteredPhotos[state.activeLightboxIndex];
    if (!photo) return;

    const img = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');
    const title = document.getElementById('lightboxTitle');
    const venue = document.getElementById('lightboxVenue');
    const desc = document.getElementById('lightboxDesc');
    const yearBadge = document.getElementById('lightboxYearBadge');
    const catBadge = document.getElementById('lightboxCatBadge');

    if (img) {
      img.src = photo.image;
      img.alt = photo.title_ml;
      img.onerror = () => {
        img.src = getSvgFallback(photo.title_ml, photo.year);
      };
    }

    if (counter) {
      counter.textContent = `${state.activeLightboxIndex + 1} / ${state.filteredPhotos.length}`;
    }

    if (title) title.textContent = photo.title_ml;
    if (venue) venue.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> <span><strong>Venue:</strong> ${photo.venue_ml || 'Thrissur'}</span>`;
    if (desc) desc.textContent = photo.desc_ml || '';
    if (yearBadge) yearBadge.textContent = photo.year;
    if (catBadge) catBadge.textContent = getCategoryDisplayName(photo.category);
  }

  /* ==========================================================================
     Then & Now Interactive Comparison Slider (1991 vs 2024)
     ========================================================================== */
  function initThenNowSlider() {
    const container = document.getElementById('comparisonSlider');
    const handle = document.getElementById('sliderHandle');
    const afterImgWrapper = document.getElementById('afterImgWrapper');

    if (!container || !handle || !afterImgWrapper) return;

    let isSliding = false;

    function setSliderPos(x) {
      const rect = container.getBoundingClientRect();
      let pos = (x - rect.left) / rect.width;
      if (pos < 0.05) pos = 0.05;
      if (pos > 0.95) pos = 0.95;
      const pct = pos * 100;
      handle.style.left = `${pct}%`;
      afterImgWrapper.style.width = `${pct}%`;
    }

    container.addEventListener('mousedown', (e) => {
      isSliding = true;
      setSliderPos(e.clientX);
    });

    window.addEventListener('mouseup', () => { isSliding = false; });

    window.addEventListener('mousemove', (e) => {
      if (!isSliding) return;
      setSliderPos(e.clientX);
    });

    container.addEventListener('touchstart', (e) => {
      isSliding = true;
      setSliderPos(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => { isSliding = false; });

    container.addEventListener('touchmove', (e) => {
      if (!isSliding) return;
      setSliderPos(e.touches[0].clientX);
    }, { passive: true });
  }

  /* ==========================================================================
     Teachers Tribute Section (ഗുരുവന്ദനം)
     ========================================================================== */
  function initTeachers() {
    const grid = document.getElementById('teachersGrid');
    if (!grid) return;

    grid.innerHTML = TEACHERS_DATA.map(t => `
      <div class="teacher-card">
        <div class="teacher-photo-wrap">
          <img class="teacher-photo" src="${t.photo}" alt="${t.name_ml}" loading="lazy" />
        </div>
        <h4 class="teacher-name">${t.name_ml}</h4>
        <div class="teacher-role">${t.role_ml}</div>
        <p class="teacher-quote font-ml-hand">"${t.quote_ml}"</p>
      </div>
    `).join('');
  }

  /* ==========================================================================
     Memory Wall (സ്മൃതിത്താളുകൾ)
     ========================================================================== */
  function initMemoryWall() {
    const grid = document.getElementById('memoriesGrid');
    const openBtn = document.getElementById('btnOpenMemoryModal');
    const modal = document.getElementById('memoryModal');
    const closeBtn = document.getElementById('btnCloseMemoryModal');
    const form = document.getElementById('memoryForm');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        modal.classList.add('active');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const author = document.getElementById('memoryAuthor').value.trim();
        const role = document.getElementById('memoryRole').value.trim() || '1991 ബാച്ച്';
        const note = document.getElementById('memoryNote').value.trim();
        const avatar = document.getElementById('memoryAvatarSelect').value || 'slate';

        if (!author || !note) {
          alert('ദയവായി പേരും ഓർമ്മക്കുറിപ്പും നൽകുക');
          return;
        }

        const newMemory = {
          id: `custom_m_${Date.now()}`,
          author_ml: author,
          author_en: author,
          role: role,
          avatar: avatar,
          date: 'ഇന്ന്',
          note_ml: note,
          likes: 1
        };

        state.memories.unshift(newMemory);

        // Save custom memories
        const savedCustom = JSON.parse(localStorage.getItem('mashithandu_memories') || '[]');
        savedCustom.unshift(newMemory);
        localStorage.setItem('mashithandu_memories', JSON.stringify(savedCustom));

        form.reset();
        modal.classList.remove('active');
        renderMemories();
        showToast('Your memory has been posted to Memory Wall! ❤️');
      });
    }

    // Like buttons
    if (grid) {
      grid.addEventListener('click', (e) => {
        const likeBtn = e.target.closest('.btn-like-memory');
        if (!likeBtn) return;
        const memoryId = likeBtn.getAttribute('data-id');
        const memory = state.memories.find(m => m.id === memoryId);
        if (memory) {
          if (!likeBtn.classList.contains('liked')) {
            memory.likes += 1;
            likeBtn.classList.add('liked');
            likeBtn.querySelector('.like-count').textContent = memory.likes;
            showToast('Liked! ❤️');
          }
        }
      });
    }

    renderMemories();
  }

  function renderMemories() {
    const grid = document.getElementById('memoriesGrid');
    if (!grid) return;

    grid.innerHTML = state.memories.map(m => {
      const avatarSvg = getAvatarSvg(m.avatar);
      return `
        <article class="memory-card">
          <div class="memory-card-header">
            <div class="memory-author-wrap">
              <div class="memory-avatar">
                ${avatarSvg}
              </div>
              <div class="memory-author-info">
                <span class="memory-author-name">${m.author_ml}</span>
                <span class="memory-author-role">${m.role}</span>
              </div>
            </div>
            <span class="memory-date">${m.date}</span>
          </div>
          <p class="memory-text">"${m.note_ml}"</p>
          <div class="memory-card-footer">
            <button class="btn-like-memory" data-id="${m.id}">
              <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <span class="like-count">${m.likes}</span>
            </button>
            <span class="memory-tag">Punkunnam Memories</span>
          </div>
        </article>
      `;
    }).join('');
  }

  function getAvatarSvg(type) {
    switch (type) {
      case 'inkpot':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v6"/><path d="M5 8h14l-2 12H7L5 8z"/><circle cx="12" cy="14" r="2"/></svg>`;
      case 'cycle':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 9l3-3 3 5.5"/></svg>`;
      case 'bell':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
      case 'slate':
      default:
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>`;
    }
  }

  /* ==========================================================================
     Client-Side Photo Upload Modal (50+ Images Capacity)
     ========================================================================= */
  function initUploadModal() {
    const modal = document.getElementById('uploadModal');
    const openBtns = document.querySelectorAll('.btn-open-upload-modal');
    const closeBtn = document.getElementById('btnCloseUploadModal');
    const form = document.getElementById('uploadPhotoForm');
    const dropzone = document.getElementById('photoDropzone');
    const fileInput = document.getElementById('photoFileInput');
    let uploadedImageDataUrl = '';

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
      });
    });

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            uploadedImageDataUrl = event.target.result;
            dropzone.innerHTML = `
              <div style="font-weight:700; color:var(--mashi-green); font-family:var(--font-ml-sans);">
                ✓ Selected: ${file.name}
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">
                Click again if you wish to change
              </div>
            `;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleMl = document.getElementById('photoTitleMl').value.trim();
        const year = parseInt(document.getElementById('photoYear').value, 10);
        const category = document.getElementById('photoCategory').value;
        const reunionId = document.getElementById('photoReunionSelect').value;
        const venueMl = document.getElementById('photoVenueMl').value.trim() || 'Thrissur';
        const descMl = document.getElementById('photoDescMl').value.trim();

        if (!titleMl) {
          alert('Please enter a title for the photo');
          return;
        }

        const newPhoto = {
          id: `custom_${Date.now()}`,
          title_ml: titleMl,
          title_en: titleMl,
          reunion: reunionId,
          reunion_name_ml: 'New Reunion Photo',
          year: year || 2024,
          category: category,
          venue_ml: venueMl,
          desc_ml: descMl || '1991 batch nostalgic memory.',
          aspect: 'landscape',
          image: uploadedImageDataUrl || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80'
        };

        state.allPhotos.unshift(newPhoto);

        // Save to local storage
        const savedCustom = JSON.parse(localStorage.getItem('mashithandu_custom_photos') || '[]');
        savedCustom.unshift(newPhoto);
        localStorage.setItem('mashithandu_custom_photos', JSON.stringify(savedCustom));

        form.reset();
        modal.classList.remove('active');
        applyFilters();
        showToast('Photo added to gallery! 📸');
      });
    }
  }

  /* ==========================================================================
     Ambient Audio Engine & Nostalgic Bell Synthesizer (Web Audio API)
     ========================================================================== */
  function initAudioEngine() {
    const audioBtn = document.getElementById('btnAudioToggle');
    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
      if (state.isPlayingAudio) {
        stopAmbientAudio();
        audioBtn.classList.remove('playing');
        audioBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          <span>ഓർമ്മ ഈണം</span>
        `;
        showToast('Music paused');
      } else {
        startAmbientAudio();
        audioBtn.classList.add('playing');
        audioBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          <span>Playing</span>
        `;
        playSchoolBellSound();
        showToast('School bell & melody playing! 🔔');
      }
      state.isPlayingAudio = !state.isPlayingAudio;
    });
  }

  function getAudioContext() {
    if (!state.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.audioContext = new AudioCtx();
    }
    if (state.audioContext.state === 'suspended') {
      state.audioContext.resume();
    }
    return state.audioContext;
  }

  // Realistic Brass School Bell Resonance
  function playSchoolBellSound() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Bell fundamental and metallic overtones
      const frequencies = [880, 1175, 1760, 2350, 3135];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Exponential decay of brass bell
        gain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.12 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 3.0);
      });
    } catch (e) {
      console.log('Audio init prevented:', e);
    }
  }

  // Soft Slate Wipe Sound
  function playWipeSound() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.05;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } catch (e) {}
  }

  // Relaxing Pentatonic Flute Melody Loop
  function startAmbientAudio() {
    try {
      const ctx = getAudioContext();
      // Mohanam / Traditional Pentatonic notes: C4, D4, E4, G4, A4, C5
      const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00, 329.63];
      let step = 0;

      function playNote() {
        if (!state.isPlayingAudio) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[step % notes.length], now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 2.4);

        step++;
        state.audioMelodyTimer = setTimeout(playNote, 1600);
      }

      playNote();
    } catch (e) {
      console.log('Ambient audio error:', e);
    }
  }

  function stopAmbientAudio() {
    if (state.audioMelodyTimer) {
      clearTimeout(state.audioMelodyTimer);
      state.audioMelodyTimer = null;
    }
  }

  /* ==========================================================================
     WhatsApp Sharing
     ========================================================================== */
  function initWhatsAppShareButtons() {
    const shareBtns = document.querySelectorAll('.btn-share-whatsapp-general');
    shareBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const msg = encodeURIComponent(`*മഷിത്തണ്ട് (Mashithandu) - GMHHS പൂങ്കുന്നം 1991 ബാച്ച്*\nനമ്മുടെ പത്താം ക്ലാസ്സ് ഓർമ്മകളും കഴിഞ്ഞ 10 സംഗമങ്ങളിലെ 50-ലധികം ചിത്രങ്ങളും ഇവിടെ കാണാം!\n\nനമ്മുടെ വെബ്സൈറ്റ് സന്ദർശിക്കൂ, പഴയ ഓർമ്മകൾ പങ്കുവെക്കൂ!`);
        window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
      });
    });
  }

  /* ==========================================================================
     Toast Notifications Helper
     ========================================================================== */
  function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>🍃</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
});

// Resilient SVG Fallback for any photo taking time or offline
function getSvgFallback(title, year) {
  const safeTitle = (title || 'ഓർമ്മച്ചിത്രം').replace(/"/g, '&quot;');
  const safeYear = year || '1991';
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%231b4a32"/><rect x="20" y="20" width="560" height="410" fill="%23232c26" rx="12" stroke="%23c68a35" stroke-width="2"/><circle cx="300" cy="180" r="48" fill="%231b4a32" stroke="%2364b787" stroke-width="2"/><path d="M300 150 C290 170 300 190 300 210 M290 170 C310 175 315 190 300 200" stroke="%23a2dba9" stroke-width="3" fill="none"/><text x="300" y="260" font-family="sans-serif" font-size="20" font-weight="bold" fill="%23f7f7f2" text-anchor="middle">${safeTitle}</text><text x="300" y="295" font-family="sans-serif" font-size="14" fill="%23e7ad52" text-anchor="middle">GMHHS പൂങ്കുന്നം • ${safeYear}</text><text x="300" y="325" font-family="sans-serif" font-size="12" fill="%23a2dba9" text-anchor="middle">മഷിത്തണ്ട് സ്മൃതി ശേഖരം</text></svg>`;
}