/**
 * SECOCI 2026 — Main JavaScript
 * Colégio Mater Christi
 * 
 * Modules:
 * 1. Sticky Header
 * 2. Mobile Menu
 * 3. Smooth Scroll
 * 4. Tabs (Programação)
 * 5. Accordion (Projetos)
 * 6. Search Filter
 * 7. Scroll Reveal
 * 8. Active Nav Tracking
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initSmoothScroll();
  initTabs();
  initScrollReveal();
  initActiveNav();
  loadProjects();
  initGallery();
});

/* ========================================
   1. Sticky Header
   ======================================== */
function initStickyHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 80);
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial check
  header.classList.toggle('scrolled', window.scrollY > 80);
}

/* ========================================
   2. Mobile Menu
   ======================================== */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('nav-mobile');
  const navOverlay = document.getElementById('nav-overlay');

  if (!hamburger || !navMobile) return;

  function toggleMenu() {
    const isOpen = navMobile.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    if (navOverlay) navOverlay.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    navMobile.classList.remove('open');
    hamburger.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', toggleMenu);
  if (navOverlay) navOverlay.addEventListener('click', closeMenu);

  // Close on nav link click
  navMobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ========================================
   3. Smooth Scroll
   ======================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ========================================
   4. Tabs (Programação)
   ======================================== */
function initTabs() {
  const tabsNav = document.getElementById('tabs-nav');
  if (!tabsNav) return;

  const buttons = tabsNav.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  function activateTab(tabId) {
    buttons.forEach(btn => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });

    contents.forEach(content => {
      content.classList.toggle('active', content.id === tabId);
    });
  }

  // Click handlers
  buttons.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });

  // Auto-detect today's tab using local timezone formatting
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  let activeTab = null;

  buttons.forEach(btn => {
    if (btn.dataset.date === todayStr) {
      activeTab = btn.dataset.tab;

      // Add "Acontecendo Agora" badge
      const badge = document.createElement('span');
      badge.className = 'badge-live';
      badge.textContent = '🔴 Hoje';
      btn.style.position = 'relative';
      btn.appendChild(badge);
    }
  });

  // If no match for today, default to first tab
  activateTab(activeTab || 'dia1');
}

/* ========================================
   5. Accordion (Projetos)
   ======================================== */
function initAccordion() {
  const headers = document.querySelectorAll('.accordion-header');

  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isOpen = item.classList.contains('open');

      // Close all other items (optional: remove this for multi-open)
      // item.parentElement.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));

      item.classList.toggle('open', !isOpen);
    });
  });
}

/* ========================================
   6. Search Filter
   ======================================== */
let allProjects = [];
let searchTimeout = null;

function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filterProjects(input.value.trim());
    }, 300); // debounce 300ms
  });
}

function filterProjects(query) {
  const normalized = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const filtered = allProjects.filter(project => {
    const searchable = [
      project.titulo,
      project.orientador,
      ...(project.componentes || [])
    ]
      .join(' ')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return searchable.includes(normalized);
  });

  renderProjects(filtered, query);
}

/* ========================================
   7. Load and Render Projects
   ======================================== */
async function loadProjects() {
  const container = document.getElementById('accordion-group');
  const loading = document.getElementById('loading-projects');

  try {
    const response = await fetch('data/projetos.json');
    if (!response.ok) throw new Error('Falha ao carregar projetos');

    allProjects = await response.json();

    if (loading) loading.remove();

    renderProjects(allProjects);
    initSearch();
  } catch (err) {
    console.error('Erro ao carregar projetos:', err);
    if (loading) {
      loading.innerHTML = `
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><circle cx="32" cy="32" r="24"/><line x1="32" y1="24" x2="32" y2="36"/><circle cx="32" cy="44" r="2" fill="currentColor"/></svg>
        <p><strong>Erro ao carregar projetos</strong></p>
        <p style="font-size: 0.85rem; margin-top: 0.5rem;">Tente recarregar a página.</p>
      `;
    }
  }
}

function renderProjects(projects, query = '') {
  const container = document.getElementById('accordion-group');
  const countEl = document.getElementById('search-count');

  // Group by serie
  const serieOrder = [
    '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano',
    '6º Ano', '7º Ano', '8º Ano', '9º Ano',
    '1ª Série', '2ª Série',
  ];

  const grouped = {};
  projects.forEach(p => {
    if (!grouped[p.serie]) grouped[p.serie] = [];
    grouped[p.serie].push(p);
  });

  // Update count
  if (countEl) {
    if (query) {
      countEl.textContent = `${projects.length} projeto${projects.length !== 1 ? 's' : ''} encontrado${projects.length !== 1 ? 's' : ''} para "${query}"`;
    } else {
      countEl.textContent = `${projects.length} projetos inscritos`;
    }
  }

  // No results
  if (projects.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><circle cx="26" cy="26" r="16"/><line x1="38" y1="38" x2="56" y2="56" stroke-linecap="round"/><line x1="20" y1="20" x2="32" y2="32"/><line x1="32" y1="20" x2="20" y2="32"/></svg>
        <p><strong>Nenhum projeto encontrado</strong></p>
        <p style="font-size: 0.85rem; margin-top: 0.5rem;">Tente buscar por outro termo.</p>
      </div>
    `;
    return;
  }

  // Build accordion HTML
  let html = '';

  serieOrder.forEach(serie => {
    if (!grouped[serie]) return;

    const serieProjects = grouped[serie];
    const isOpen = query ? 'open' : ''; // Auto-open when filtering

    html += `
      <div class="accordion-item ${isOpen}">
        <button class="accordion-header" aria-expanded="${!!query}">
          <div class="accordion-header-left">
            <span class="accordion-serie-badge">${serie}</span>
            <span class="accordion-count">${serieProjects.length} projeto${serieProjects.length !== 1 ? 's' : ''}</span>
          </div>
          <i class="fa-solid fa-chevron-down accordion-chevron"></i>
        </button>
        <div class="accordion-body" ${query ? 'style="max-height: 5000px;"' : ''}>
          <div class="accordion-body-inner">
            ${serieProjects.map(p => `
              <div class="project-card" data-id="${p.id}">
                <div class="project-number">${p.id}</div>
                <div class="project-info">
                  <h4>${highlightMatch(p.titulo, query)}</h4>
                  <div class="project-meta">
                    <span>
                      <span class="label"><i class="fa-solid fa-users icon-blue mr-1"></i> Componentes:</span>
                      ${highlightMatch((p.componentes || []).join(', '), query)}
                    </span>
                  </div>
                  <div class="project-meta" style="margin-top: 0.25rem;">
                    <span>
                      <span class="label"><i class="fa-solid fa-user-tie icon-teal mr-1"></i> Orientador:</span>
                      ${highlightMatch(p.orientador || '—', query)}
                    </span>
                    ${p.turma ? `<span><span class="label"><i class="fa-solid fa-tag icon-primary mr-1"></i> Turma:</span> ${p.turma}</span>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  initAccordion();
}

/**
 * Highlight matching text in search results
 */
function highlightMatch(text, query) {
  if (!query || !text) return text;

  const normalizedQuery = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const normalizedText = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const idx = normalizedText.indexOf(normalizedQuery);
  if (idx === -1) return text;

  // Map back to original text positions
  const before = text.substring(0, idx);
  const match = text.substring(idx, idx + query.length);
  const after = text.substring(idx + query.length);

  return `${before}<mark style="background: rgba(0, 150, 58, 0.2); padding: 0.1em 0.2em; border-radius: 3px;">${match}</mark>${after}`;
}

/* ========================================
   8. Scroll Reveal (IntersectionObserver)
   ======================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  reveals.forEach(el => observer.observe(el));
}

/* ========================================
   9. Active Nav Tracking
   ======================================== */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-desktop a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' }
  );

  sections.forEach(section => observer.observe(section));
}

/* ========================================
   10. Galeria de Fotos Dinâmica
   ======================================== */
function initGallery() {
  const grid = document.getElementById('gallery-grid');
  const btn = document.getElementById('btn-load-more-gallery');
  if (!grid || !btn) return;

  const galleryImages = [
    'SnapInsta.to_728772130_18594891124047243_3902573671833998378_n.jpg',
    'SnapInsta.to_728794676_18594891049047243_3480686230149191898_n.jpg',
    'SnapInsta.to_728809617_18594891007047243_1695856227023226024_n.jpg',
    'SnapInsta.to_729664062_18594891025047243_2444620037782084908_n.jpg',
    'SnapInsta.to_729674338_18594891076047243_5502408200515941570_n.jpg',
    'SnapInsta.to_729681006_18594891136047243_5031541896866167654_n.jpg',
    'SnapInsta.to_729688064_18594891088047243_1671584942105060337_n.jpg',
    'SnapInsta.to_729692130_18594891037047243_7308046122286967806_n.jpg',
    'SnapInsta.to_729714019_18594891067047243_1739030468384391202_n.jpg',
    'SnapInsta.to_729731516_18594890662047243_5715021709529405476_n.jpg',
    'SnapInsta.to_729981410_18594891427047243_8399535962183502439_n.jpg',
    'SnapInsta.to_730163291_18594891058047243_5407852764766192110_n.jpg',
    'SnapInsta.to_730331526_18594890998047243_2868830404561879146_n.jpg',
    'SnapInsta.to_730356287_18594890653047243_575093060593219156_n.jpg',
    'SnapInsta.to_730373426_18594890983047243_2262211121382236342_n.jpg',
    'SnapInsta.to_730420813_18594890629047243_6176222282291795478_n.jpg',
    'SnapInsta.to_735206179_18594890641047243_2890702109915970070_n.jpg'
  ];

  // Shuffle array using Fisher-Yates
  for (let i = galleryImages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [galleryImages[i], galleryImages[j]] = [galleryImages[j], galleryImages[i]];
  }

  let currentIndex = 0;

  function loadMore(count = 5) {
    const limit = Math.min(currentIndex + count, galleryImages.length);
    let html = '';

    for (let i = currentIndex; i < limit; i++) {
      const isFeatured = i === currentIndex; // Make first item of each batch "featured" for grid variation
      const featuredClass = isFeatured ? 'featured' : '';
      const imagePath = `assets/galeria/${galleryImages[i]}`;

      html += `
        <div class="gallery-item ${featuredClass} reveal">
          <img src="${imagePath}" alt="Momento SECOCI" loading="lazy">
        </div>
      `;
    }

    grid.insertAdjacentHTML('beforeend', html);
    currentIndex = limit;

    // Trigger ScrollReveal for new elements
    if (typeof initScrollReveal === 'function') {
      initScrollReveal();
    }

    if (currentIndex >= galleryImages.length) {
      btn.style.display = 'none';
    }
  }

  // Load first batch with 9 images
  loadMore(9);

  // Button handler loads 5 images at a time
  btn.addEventListener('click', () => loadMore(5));
}
