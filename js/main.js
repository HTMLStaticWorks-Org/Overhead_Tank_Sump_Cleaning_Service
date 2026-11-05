/* ==========================================================================
   AQUAGUARD — Main Frontend Application Script
   Handles Theme, Navbar, Search, Process Tabs, Before/After Slider,
   Pricing Filter, FAQ Accordions, Enquiry Validation & Auth Demos
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. THEME SYSTEM (Light / Dark with localStorage persistence)
     ------------------------------------------------------------------------ */
  const THEME_STORAGE_KEY = 'aquaguard_theme';

  function getPreferredTheme() {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      // Ignore storage access errors
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggleBtns = document.querySelectorAll('[data-theme-toggle]');
    toggleBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    });
  }

  function initTheme() {
    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme);

    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch (e) {
          // Ignore storage errors
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     1B. RTL SYSTEM (Directional Toggle & localStorage persistence)
     ------------------------------------------------------------------------ */
  const DIR_STORAGE_KEY = 'aquaguard_dir';

  function applyDir(dir) {
    document.documentElement.setAttribute('dir', dir);
    const rtlBtns = document.querySelectorAll('[data-rtl-toggle]');
    rtlBtns.forEach((btn) => {
      const isRtl = dir === 'rtl';
      btn.setAttribute('aria-pressed', isRtl ? 'true' : 'false');
      btn.classList.toggle('is-active', isRtl);
      btn.setAttribute('title', isRtl ? 'Switch to Left-to-Right layout' : 'Switch to Right-to-Left layout');
    });
  }

  function initRtl() {
    let savedDir = 'ltr';
    try {
      savedDir = localStorage.getItem(DIR_STORAGE_KEY) || 'ltr';
    } catch (e) {}
    applyDir(savedDir);

    document.querySelectorAll('[data-rtl-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('dir') || 'ltr';
        const next = current === 'rtl' ? 'ltr' : 'rtl';
        applyDir(next);
        try {
          localStorage.setItem(DIR_STORAGE_KEY, next);
        } catch (e) {}
      });
    });
  }

  /* ------------------------------------------------------------------------
     2. STICKY NAVBAR, DESKTOP DROPDOWNS & MOBILE HAMBURGER DRAWER
     ------------------------------------------------------------------------ */
  function initNavigation() {
    const header = document.querySelector('.site-header');
    const dropdownItems = document.querySelectorAll('.nav-item--dropdown');
    const hamburgerBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileBackdrop = document.getElementById('mobileBackdrop');
    const mobileAccordions = document.querySelectorAll('[data-mobile-dropdown]');

    // Scroll shadow
    function handleScroll() {
      if (!header) return;
      if (window.scrollY > 12) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Desktop dropdown toggle on click + keyboard
    function closeAllDesktopDropdowns(exceptItem) {
      dropdownItems.forEach((item) => {
        if (item !== exceptItem) {
          item.classList.remove('is-open');
          const trigger = item.querySelector('[data-dropdown-trigger]');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    dropdownItems.forEach((item) => {
      const trigger = item.querySelector('[data-dropdown-trigger]');
      if (!trigger) return;

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = item.classList.contains('is-open');
        closeAllDesktopDropdowns(item);
        item.classList.toggle('is-open', !isOpen);
        trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-item--dropdown')) {
        closeAllDesktopDropdowns(null);
      }
    });

    // Mobile drawer open/close
    function setMobileMenuOpen(open) {
      if (!hamburgerBtn || !mobileDrawer || !mobileBackdrop) return;
      hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileDrawer.classList.toggle('is-open', open);
      mobileBackdrop.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
    }

    if (hamburgerBtn && mobileDrawer && mobileBackdrop) {
      hamburgerBtn.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.contains('is-open');
        setMobileMenuOpen(!isOpen);
      });

      mobileBackdrop.addEventListener('click', () => {
        setMobileMenuOpen(false);
      });

      const drawerCloseBtn = document.getElementById('mobileDrawerClose');
      if (drawerCloseBtn) {
        drawerCloseBtn.addEventListener('click', () => {
          setMobileMenuOpen(false);
        });
      }

      // Close mobile menu when clicking any navigation link inside it
      mobileDrawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          setMobileMenuOpen(false);
        });
      });
    }

    // Mobile accordion dropdowns (Home ▾ and Services ▾)
    mobileAccordions.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const parentItem = trigger.closest('.mobile-nav-item');
        if (!parentItem) return;
        const isOpen = parentItem.classList.contains('is-open');
        parentItem.classList.toggle('is-open', !isOpen);
        trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });
    });

    // Close mobile menu on desktop resize & Escape key
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1120) {
        setMobileMenuOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllDesktopDropdowns(null);
        setMobileMenuOpen(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. WORKING INTERACTIVE SITE SEARCH MODAL
     ------------------------------------------------------------------------ */
  const SEARCH_INDEX = [
    {
      title: 'Overhead Water Tank Cleaning',
      desc: 'Mechanised dewatering, sludge removal, rotary jet scrubbing & disinfection for rooftop tanks.',
      tag: 'Service',
      url: 'services.html#overhead-tank'
    },
    {
      title: 'Underground Sump Cleaning',
      desc: 'Submersible pump dewatering, bottom silt vacuum extraction & wall sanitization for underground sumps.',
      tag: 'Service',
      url: 'services.html#underground-sump'
    },
    {
      title: 'Combined Tank & Sump Cleaning',
      desc: 'Synchronized full-loop cleaning of both underground sump and rooftop overhead tanks.',
      tag: 'Service',
      url: 'services.html#combined-cleaning'
    },
    {
      title: 'Residential & Independent House Tank Cleaning',
      desc: 'Tailored hygiene service for domestic polymer, loft, and concrete water tanks.',
      tag: 'Service',
      url: 'services.html#residential-cleaning'
    },
    {
      title: 'Apartment & Commercial Water Tank Cleaning',
      desc: 'Phased multi-compartment cleaning for apartment societies, offices, clinics & institutions.',
      tag: 'Service',
      url: 'services.html#commercial-cleaning'
    },
    {
      title: 'Water Tank Disinfection Service',
      desc: 'Controlled food-grade antibacterial mist sanitization and final rinse protocol.',
      tag: 'Service',
      url: 'services.html#tank-disinfection'
    },
    {
      title: 'Residential & Commercial Pricing Packages',
      desc: 'Transparent indicative pricing for small, medium, and large overhead tanks and sumps.',
      tag: 'Pricing',
      url: 'pricing.html'
    },
    {
      title: '6-Stage Professional Cleaning Process',
      desc: 'Inspection, dewatering, sludge extraction, high-pressure cleaning, disinfection & final rinse.',
      tag: 'Process',
      url: 'services.html#cleaning-process'
    },
    {
      title: 'Before & After Tank Interior Comparison',
      desc: 'Interactive visual comparison of water storage tanks before and after AQUAGUARD cleaning.',
      tag: 'Comparison',
      url: 'index.html#before-after'
    },
    {
      title: 'Frequently Asked Questions (FAQ)',
      desc: 'Cleaning frequency, duration, water preparation, and supported tank sizes.',
      tag: 'FAQ',
      url: 'services.html#faq'
    },
    {
      title: 'About AQUAGUARD',
      desc: 'Dedicated to overhead water tank and underground sump hygiene standards, equipment & trained crew.',
      tag: 'About',
      url: 'about.html'
    },
    {
      title: 'Contact AQUAGUARD & Enquiry Form',
      desc: 'Submit your tank type, approximate capacity, and preferred date for a service enquiry.',
      tag: 'Contact',
      url: 'contact.html#enquiry-form'
    },
    {
      title: 'Customer Dashboard',
      desc: 'Book cleaning visits, view tank inspection reports, manage recurring 6-month reminders & download invoices.',
      tag: 'Dashboard',
      url: 'dashboard.html'
    },
    {
      title: 'Home-2 — Hygiene Standards & Process Experience',
      desc: 'Explore our alternative homepage focused on technical cleaning protocols and hygiene standards.',
      tag: 'Page',
      url: 'home-2.html'
    }
  ];

  function initSearchModal() {
    const searchBtns = document.querySelectorAll('[data-search-open]');
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchModalInput');
    const searchCloseBtn = document.getElementById('searchModalClose');
    const searchResultsContainer = document.getElementById('searchModalResults');

    if (!searchModal || !searchInput || !searchResultsContainer) return;

    function renderResults(query) {
      const normalized = (query || '').trim().toLowerCase();
      const matches = !normalized
        ? SEARCH_INDEX
        : SEARCH_INDEX.filter(
            (item) =>
              item.title.toLowerCase().includes(normalized) ||
              item.desc.toLowerCase().includes(normalized) ||
              item.tag.toLowerCase().includes(normalized)
          );

      if (matches.length === 0) {
        searchResultsContainer.innerHTML = `
          <div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
            No matching services or sections found for "<strong>${normalized.replace(/[<>&"']/g, '')}</strong>".
            <div style="margin-top: 0.75rem;">
              <a href="contact.html#enquiry-form" class="btn btn--primary btn--sm">Ask Our Team Directly</a>
            </div>
          </div>
        `;
        return;
      }

      searchResultsContainer.innerHTML = matches
        .map(
          (item) => `
          <a href="${item.url}" class="search-result-item">
            <div>
              <div style="font-weight: 700; color: var(--text-heading); font-size: 0.925rem;">${item.title}</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">${item.desc}</div>
            </div>
            <span class="search-result-item__tag">${item.tag}</span>
          </a>
        `
        )
        .join('');

      searchResultsContainer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => closeSearch());
      });
    }

    function openSearch() {
      searchModal.classList.add('is-open');
      searchModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      renderResults(searchInput.value);
      setTimeout(() => searchInput.focus(), 50);
    }

    function closeSearch() {
      searchModal.classList.remove('is-open');
      searchModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }

    searchBtns.forEach((btn) => btn.addEventListener('click', openSearch));
    if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);

    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });

    searchInput.addEventListener('input', (e) => {
      renderResults(e.target.value);
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchModal.classList.contains('is-open')) {
          closeSearch();
        } else {
          openSearch();
        }
      } else if (e.key === 'Escape' && searchModal.classList.contains('is-open')) {
        closeSearch();
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. INTERACTIVE SERVICE-ADAPTIVE 6-STEP CLEANING PROCESS
     ------------------------------------------------------------------------ */
  const PROCESS_DATA = {
    overhead: [
      {
        num: '01',
        badge: 'Rooftop Assessment',
        title: 'Initial Inspection & Setup',
        desc: 'Technicians inspect rooftop tank structure, manhole covers, float valves, and inlet/outlet connections, then isolate supply valves to prevent sediment from entering household plumbing lines.'
      },
      {
        num: '02',
        badge: 'Controlled Drainage',
        title: 'Water Removal & Drainage',
        desc: 'Remaining standing water above the outlet level is drained using a portable submersible pump down to the bottom silt layer, routing discharge safely to the terrace storm drain.'
      },
      {
        num: '03',
        badge: 'Silt & Scale Extraction',
        title: 'Sludge & Silt Removal',
        desc: 'Accumulated borehole silt, rust flakes, and settled floor sludge are agitated and extracted using an industrial wet-vacuum extractor so heavy residue is never flushed into domestic pipes.'
      },
      {
        num: '04',
        badge: 'Surface Scrubbing',
        title: 'Interior Surface Cleaning',
        desc: 'For polymer/polyethylene tanks, non-abrasive rotary brushes and controlled-pressure water jets remove biofilm from ribbed rings; for RCC tanks, high-pressure rotary jets clean concrete walls.'
      },
      {
        num: '05',
        badge: 'Sanitization',
        title: 'Appropriate Disinfection',
        desc: 'Interior walls, ceiling underside, and floor surfaces receive a fine-mist application of measured food-grade antibacterial solution suited to the tank material (polymer or masonry).'
      },
      {
        num: '06',
        badge: 'Handover Check',
        title: 'Final Rinse & Inspection',
        desc: 'The tank is thoroughly rinsed with clean water, vacuumed dry of rinse residue, and visually inspected with the property owner or caretaker before re-opening the inlet valve.'
      }
    ],
    sump: [
      {
        num: '01',
        badge: 'Subterranean Check',
        title: 'Access & Valve Check',
        desc: 'Technicians inspect the underground sump manhole, check ventilation and lighting, inspect the pump suction foot-valve strainer, and turn off automated transfer pumps.'
      },
      {
        num: '02',
        badge: 'High-Flow Dewatering',
        title: 'Submersible Dewatering',
        desc: 'Heavy-duty submersible dewatering pumps rapidly empty standing water down to the bottom floor level through dedicated discharge hoses routed to an approved surface drainage point.'
      },
      {
        num: '03',
        badge: 'Heavy Sludge Vacuuming',
        title: 'Sludge & Silt Extraction',
        desc: 'Dense municipal silt, sand, and organic mud accumulated across the sump floor and corners are extracted using high-suction industrial sludge vacuum equipment.'
      },
      {
        num: '04',
        badge: 'High-Pressure Jetting',
        title: 'Wall & Floor Jet Cleaning',
        desc: 'High-pressure water jets remove stubborn mineral calcifications, damp algae streaks, and slimy biofilm from underground concrete walls, columns, and floor joints.'
      },
      {
        num: '05',
        badge: 'Masonry Sanitization',
        title: 'Targeted Disinfection',
        desc: 'Sanitizing mist is applied evenly across all concrete walls, sump floor, ladder rungs, and suction piping to address microbial surface contamination.'
      },
      {
        num: '06',
        badge: 'Clear Refill Readiness',
        title: 'Final Flush & Verification',
        desc: 'All loosened residue and disinfection rinse water are vacuumed out completely, the foot-valve strainer is cleaned, and the sump is verified ready for fresh water inflow.'
      }
    ],
    commercial: [
      {
        num: '01',
        badge: 'Site & Safety Briefing',
        title: 'Audit & Bypass Planning',
        desc: 'For apartments and commercial facilities with dual-compartment tanks, our crew coordinates with facility managers to isolate one compartment at a time to minimize water supply interruption.'
      },
      {
        num: '02',
        badge: 'Industrial Dewatering',
        title: 'High-Capacity Dewatering',
        desc: 'Multiple high-head submersible pumps empty large-volume concrete chambers while protecting pump room manifolds, pressure boosters, and sensor probes.'
      },
      {
        num: '03',
        badge: 'Mechanised Desilting',
        title: 'Sediment & Scale Removal',
        desc: 'Heavy sediment cakes, scale deposits, and rust buildup around baffle walls and sumps are mechanically loosened and extracted via industrial wet-vacuum units.'
      },
      {
        num: '04',
        badge: 'Rotary Jet Wash',
        title: 'Wall & Floor Rotary Jetting',
        desc: 'High-pressure rotary jet lances clean internal partition walls, structural columns, access ladders, and concrete floors across the entire compartment.'
      },
      {
        num: '05',
        badge: 'Contact-Time Sanitization',
        title: 'Disinfection Protocol',
        desc: 'Food-grade disinfectant mist is applied across all internal surfaces with appropriate contact time and ventilation before thorough clean-water rinsing.'
      },
      {
        num: '06',
        badge: 'Facility Sign-Off',
        title: 'Visual Log & Handover',
        desc: 'A joint visual inspection is conducted with the building supervisor or society representative, accompanied by a service completion record for facility maintenance logs.'
      }
    ]
  };

  function initProcessTabs() {
    const tabContainers = document.querySelectorAll('[data-process-Interactive]');
    tabContainers.forEach((container) => {
      const tabs = container.querySelectorAll('[data-process-type]');
      const grid = container.querySelector('[data-process-grid]');
      if (!tabs.length || !grid) return;

      function renderProcess(type) {
        const steps = PROCESS_DATA[type] || PROCESS_DATA.overhead;
        grid.innerHTML = steps
          .map(
            (s) => `
            <article class="process-step-card">
              <div class="process-step-card__header">
                <span class="process-step-card__num">${s.num}</span>
                <span class="process-step-card__badge">${s.badge}</span>
              </div>
              <h3>${s.title}</h3>
              <p>${s.desc}</p>
            </article>
          `
          )
          .join('');
      }

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          tabs.forEach((t) => {
            t.classList.remove('is-active');
            t.setAttribute('aria-selected', 'false');
          });
          tab.classList.add('is-active');
          tab.setAttribute('aria-selected', 'true');
          renderProcess(tab.getAttribute('data-process-type'));
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. INTERACTIVE BEFORE & AFTER COMPARISON SLIDER
     ------------------------------------------------------------------------ */
  const BA_SCENES = {
    sump: {
      beforeImg: 'assets/images/tank-before.svg',
      afterImg: 'assets/images/tank-after.svg',
      beforeAlt: 'Underground concrete water sump interior before cleaning showing settled bottom sludge and wall biofilm',
      afterAlt: 'Underground concrete water sump interior after AQUAGUARD cleaning showing sanitized walls and sludge-free floor',
      beforeTitle: 'Before Cleaning: Underground Concrete Sump',
      beforeDesc: 'Accumulated municipal silt, brownish floor sludge cake, calcified water-line rings, and damp greenish algae biofilm along lower concrete walls.',
      afterTitle: 'After Cleaning: Sanitized Sump Chamber',
      afterDesc: '100% dewatered, vacuum-desilted, high-pressure rotary jet scrubbed, and mist-disinfected concrete walls and floor ready for clean water storage.'
    },
    rooftop: {
      beforeImg: 'assets/images/tank-rooftop-before.svg',
      afterImg: 'assets/images/tank-rooftop-after.svg',
      beforeAlt: 'Cylindrical overhead rooftop tank interior before cleaning showing borehole iron silt and rib-ring biofilm',
      afterAlt: 'Cylindrical overhead rooftop tank interior after cleaning showing spotless food-grade lining',
      beforeTitle: 'Before Cleaning: Overhead Rooftop Tank',
      beforeDesc: 'Reddish-brown borehole iron sediment settled in the molded bottom ribs and slimy biofilm buildup along corrugated wall rings.',
      afterTitle: 'After Cleaning: Sanitized Overhead Tank',
      afterDesc: 'Non-abrasive rotary scrubbing and vacuum extraction leave the food-grade polymer lining spotless without scratching interior walls.'
    }
  };

  function initBeforeAfterSliders() {
    const widgets = document.querySelectorAll('[data-ba-widget]');

    widgets.forEach((widget) => {
      const stage = widget.querySelector('[data-ba-stage]');
      const rangeInput = widget.querySelector('[data-ba-range]');
      const presetBtns = widget.querySelectorAll('[data-ba-preset]');
      const sceneBtns = widget.querySelectorAll('[data-ba-scene]');
      const beforeImg = widget.querySelector('[data-ba-before-img]');
      const afterImg = widget.querySelector('[data-ba-after-img]');
      const beforeTitleEl = widget.querySelector('[data-ba-before-title]');
      const beforeDescEl = widget.querySelector('[data-ba-before-desc]');
      const afterTitleEl = widget.querySelector('[data-ba-after-title]');
      const afterDescEl = widget.querySelector('[data-ba-after-desc]');

      if (!stage || !rangeInput) return;

      function updatePosition(value) {
        const clamped = Math.max(2, Math.min(98, Number(value)));
        stage.style.setProperty('--ba-pos', `${clamped}%`);
        rangeInput.value = String(clamped);
      }

      rangeInput.addEventListener('input', (e) => {
        updatePosition(e.target.value);
        presetBtns.forEach((b) => b.classList.remove('is-active'));
      });

      presetBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-ba-preset');
          presetBtns.forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          updatePosition(val);
        });
      });

      sceneBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-ba-scene');
          const scene = BA_SCENES[key];
          if (!scene) return;
          sceneBtns.forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');

          if (beforeImg) {
            beforeImg.src = scene.beforeImg;
            beforeImg.alt = scene.beforeAlt;
          }
          if (afterImg) {
            afterImg.src = scene.afterImg;
            afterImg.alt = scene.afterAlt;
          }
          if (beforeTitleEl) beforeTitleEl.textContent = scene.beforeTitle;
          if (beforeDescEl) beforeDescEl.textContent = scene.beforeDesc;
          if (afterTitleEl) afterTitleEl.textContent = scene.afterTitle;
          if (afterDescEl) afterDescEl.textContent = scene.afterDesc;
          updatePosition(50);
        });
      });

      updatePosition(rangeInput.value || 50);
    });
  }

  /* ------------------------------------------------------------------------
     6. PRICING CATEGORY FILTER & URL QUERY PARAMETER PRE-FILL
     ------------------------------------------------------------------------ */
  function initPricingFilter() {
    const filterBtns = document.querySelectorAll('[data-pricing-filter]');
    const categoryBlocks = document.querySelectorAll('[data-pricing-category]');
    if (!filterBtns.length || !categoryBlocks.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-pricing-filter');
        filterBtns.forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');

        categoryBlocks.forEach((block) => {
          const cat = block.getAttribute('data-pricing-category');
          if (target === 'all' || cat === target) {
            block.style.display = '';
          } else {
            block.style.display = 'none';
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     7. FAQ ACCORDION
     ------------------------------------------------------------------------ */
  function initFaqAccordions() {
    const triggers = document.querySelectorAll('[data-faq-trigger]');
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.faq-item');
        if (!item) return;
        const isOpen = item.classList.contains('is-open');
        item.classList.toggle('is-open', !isOpen);
        trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });
    });
  }

  /* ------------------------------------------------------------------------
     8. ENQUIRY FORM PRE-FILL & VALIDATION (contact.html)
     ------------------------------------------------------------------------ */
  function initEnquiryForm() {
    const form = document.getElementById('enquiryForm');
    if (!form) return;

    // Set minimum date on Preferred Service Date to today
    const dateInput = form.querySelector('#preferredDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    // Pre-fill from URL parameters if navigated from Services or Pricing page
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service');
    const tankTypeParam = params.get('tankType');
    const capacityParam = params.get('capacity');
    const propertyParam = params.get('property');
    const packageParam = params.get('package');

    if (serviceParam && form.elements.requiredService) {
      form.elements.requiredService.value = serviceParam;
    }
    if (tankTypeParam && form.elements.tankType) {
      form.elements.tankType.value = tankTypeParam;
    }
    if (capacityParam && form.elements.tankCapacity) {
      form.elements.tankCapacity.value = capacityParam;
    }
    if (propertyParam && form.elements.propertyType) {
      form.elements.propertyType.value = propertyParam;
    }
    if (packageParam && form.elements.additionalMessage) {
      form.elements.additionalMessage.value = `Enquiring about package: ${packageParam}. Please share availability and an exact quote.`;
    }

    const demoAlert = document.getElementById('enquiryDemoSuccess');

    function validateField(input) {
      const group = input.closest('.form-group');
      if (!group) return true;

      let valid = true;
      const val = input.value.trim();

      if (input.hasAttribute('required') && !val) {
        valid = false;
      } else if (input.type === 'email' && val) {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      } else if (input.name === 'phoneNumber' && val) {
        valid = /^[+\d][\d\s\-()]{7,18}$/.test(val);
      }

      input.classList.toggle('is-invalid', !valid);
      group.classList.toggle('has-error', !valid);
      return valid;
    }

    form.querySelectorAll('.form-control').forEach((input) => {
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          validateField(input);
        }
      });
      input.addEventListener('blur', () => {
        if (input.value.trim() !== '') {
          validateField(input);
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const requiredInputs = form.querySelectorAll('.form-control[required]');
      let allValid = true;
      let firstInvalid = null;

      requiredInputs.forEach((input) => {
        const isFieldValid = validateField(input);
        if (!isFieldValid) {
          allValid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (!allValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const fullName = form.elements.fullName.value.trim();
      const serviceName =
        form.elements.requiredService.options[form.elements.requiredService.selectedIndex].text;
      const tankType =
        form.elements.tankType.options[form.elements.tankType.selectedIndex].text;
      const capacity =
        form.elements.tankCapacity.options[form.elements.tankCapacity.selectedIndex].text;
      const preferredDate = form.elements.preferredDate.value;

      if (demoAlert) {
        demoAlert.innerHTML = `
          <div style="display:flex; align-items:flex-start; gap:12px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--color-success); flex-shrink:0; margin-top:2px;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="22 4 12 14.01 9 11.01" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div>
              <h4 style="margin-bottom:4px; color:var(--text-heading);">Enquiry Validation Complete (Frontend Demonstration)</h4>
              <p style="font-size:0.9rem; color:var(--text-primary); margin-bottom:8px;">
                Thank you, <strong>${fullName.replace(/[<>&"']/g, '')}</strong>. Your enquiry details for <strong>${serviceName}</strong> (${tankType}, ${capacity}) on <strong>${preferredDate}</strong> have been validated on the client side.
              </p>
              <p style="font-size:0.8rem; color:var(--text-secondary);">
                <em>Note: This form is a frontend interface demonstration. No live booking or backend submission has been confirmed until connected to your business email/CRM endpoint.</em>
              </p>
            </div>
          </div>
        `;
        demoAlert.classList.add('is-visible');
        demoAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  /* ------------------------------------------------------------------------
     9. AUTHENTICATION PAGES: PASSWORD TOGGLE, LOGIN & SIGNUP VALIDATION
     ------------------------------------------------------------------------ */
  function initAuthPages() {
    // Password Show/Hide Controls
    document.querySelectorAll('[data-password-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-password-toggle');
        const input = document.getElementById(targetId);
        if (!input) return;

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        btn.setAttribute('aria-pressed', isPassword ? 'true' : 'false');

        const eyeOpen = btn.querySelector('.icon-eye-open');
        const eyeClosed = btn.querySelector('.icon-eye-closed');
        if (eyeOpen && eyeClosed) {
          eyeOpen.style.display = isPassword ? 'none' : 'block';
          eyeClosed.style.display = isPassword ? 'block' : 'none';
        }
      });
    });

    // Forgot Password Demo Trigger on Login Page
    const forgotLink = document.getElementById('forgotPasswordTrigger');
    const forgotBox = document.getElementById('forgotPasswordDemoBox');
    if (forgotLink && forgotBox) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        const isHidden = forgotBox.style.display === 'none' || !forgotBox.style.display;
        forgotBox.style.display = isHidden ? 'block' : 'none';
      });
    }

    // Login Form Validation (Frontend Demo)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      const loginAlert = document.getElementById('loginDemoStatus');
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const identifierInput = loginForm.elements.loginIdentifier;
        const passwordInput = loginForm.elements.loginPassword;

        const idVal = identifierInput.value.trim();
        const passVal = passwordInput.value;

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(idVal);
        const isPhone = /^[+\d][\d\s\-()]{7,18}$/.test(idVal);
        const idValid = isEmail || isPhone;
        const passValid = passVal.length >= 6;

        identifierInput.classList.toggle('is-invalid', !idValid);
        identifierInput.closest('.form-group').classList.toggle('has-error', !idValid);

        passwordInput.classList.toggle('is-invalid', !passValid);
        passwordInput.closest('.form-group').classList.toggle('has-error', !passValid);

        if (!idValid) {
          identifierInput.focus();
          return;
        }
        if (!passValid) {
          passwordInput.focus();
          return;
        }

        if (loginAlert) {
          loginAlert.innerHTML = `
            <strong>Frontend Login Demo Verified:</strong> Credentials for <code>${idVal.replace(/[<>&"']/g, '')}</code> passed client-side validation. Because this template is a frontend UI demonstration without a connected authentication server, no live customer account session or dashboard redirect is initiated.
          `;
          loginAlert.classList.add('is-visible');
        }
      });
    }

    // Signup Form Validation & Password Strength Meter (Frontend Demo)
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      const passwordInput = signupForm.elements.signupPassword;
      const confirmInput = signupForm.elements.signupConfirmPassword;
      const strengthBar = document.getElementById('passwordStrengthBar');
      const strengthText = document.getElementById('passwordStrengthText');
      const signupAlert = document.getElementById('signupDemoStatus');

      function evaluatePasswordStrength(val) {
        let score = 0;
        if (val.length >= 8) score += 1;
        if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 1;
        if (/\d/.test(val)) score += 1;
        if (/[^A-Za-z0-9]/.test(val)) score += 1;
        return score;
      }

      if (passwordInput && strengthBar && strengthText) {
        passwordInput.addEventListener('input', () => {
          const val = passwordInput.value;
          const score = evaluatePasswordStrength(val);
          const widths = ['0%', '25%', '50%', '75%', '100%'];
          const colors = ['#DC2626', '#DC2626', '#D97706', '#00A8E8', '#0D9488'];
          const labels = [
            'Enter at least 8 characters',
            'Weak — add numbers & mixed case',
            'Fair — add a symbol or uppercase letter',
            'Good password strength',
            'Strong password'
          ];
          strengthBar.style.width = val.length === 0 ? '0%' : widths[score];
          strengthBar.style.backgroundColor = colors[score];
          strengthText.textContent = val.length === 0 ? 'Minimum 8 characters with letters & numbers' : labels[score];
        });
      }

      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = signupForm.elements.fullName;
        const emailInput = signupForm.elements.emailAddress;
        const phoneInput = signupForm.elements.phoneNumber;
        const termsInput = signupForm.elements.acceptTerms;

        const nameValid = nameInput.value.trim().length >= 2;
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
        const phoneValid = /^[+\d][\d\s\-()]{7,18}$/.test(phoneInput.value.trim());
        const passValid =
          passwordInput.value.length >= 8 &&
          /[A-Za-z]/.test(passwordInput.value) &&
          /\d/.test(passwordInput.value);
        const confirmValid =
          confirmInput.value.length > 0 && confirmInput.value === passwordInput.value;
        const termsValid = termsInput.checked;

        function markGroup(input, isValid) {
          input.classList.toggle('is-invalid', !isValid);
          const group = input.closest('.form-group');
          if (group) group.classList.toggle('has-error', !isValid);
        }

        markGroup(nameInput, nameValid);
        markGroup(emailInput, emailValid);
        markGroup(phoneInput, phoneValid);
        markGroup(passwordInput, passValid);
        markGroup(confirmInput, confirmValid);
        markGroup(termsInput, termsValid);

        if (!nameValid || !emailValid || !phoneValid || !passValid || !confirmValid || !termsValid) {
          const firstBad = signupForm.querySelector('.is-invalid');
          if (firstBad) firstBad.focus();
          return;
        }

        if (signupAlert) {
          signupAlert.innerHTML = `
            <strong>Registration Interface Demo Complete:</strong> All fields for <strong>${nameInput.value.trim().replace(/[<>&"']/g, '')}</strong> passed validation. This signup page is a frontend authentication interface demonstration; connect an authentication backend to persist customer accounts.
          `;
          signupAlert.classList.add('is-visible');
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     10. CUSTOMER DASHBOARD (Booking, Reports, Reminders & Invoices)
     ------------------------------------------------------------------------ */
  function initDashboard() {
    const tabButtons = document.querySelectorAll('[data-dash-tab]');
    const panels = document.querySelectorAll('[data-dash-panel]');
    if (!tabButtons.length || !panels.length) return;

    // Dashboard Mobile Sidebar Toggle & Close
    const dashSidebar = document.getElementById('dashSidebar');
    const dashMobileToggle = document.getElementById('dashMobileToggle');
    const dashSidebarClose = document.getElementById('dashSidebarClose');
    const dashBackdrop = document.getElementById('dashBackdrop');

    function toggleDashSidebar(open) {
      if (!dashSidebar) return;
      dashSidebar.classList.toggle('is-open', open);
      if (dashBackdrop) dashBackdrop.classList.toggle('is-visible', open);
      if (dashMobileToggle) dashMobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    if (dashMobileToggle) {
      dashMobileToggle.addEventListener('click', () => {
        const isOpen = dashSidebar && dashSidebar.classList.contains('is-open');
        toggleDashSidebar(!isOpen);
      });
    }

    if (dashSidebarClose) {
      dashSidebarClose.addEventListener('click', () => toggleDashSidebar(false));
    }

    if (dashBackdrop) {
      dashBackdrop.addEventListener('click', () => toggleDashSidebar(false));
    }

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-dash-tab');
        tabButtons.forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        panels.forEach((p) => {
          p.classList.remove('is-active');
        });

        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        const activePanel = document.querySelector(`[data-dash-panel="${target}"]`);
        if (activePanel) {
          activePanel.classList.add('is-active');
        }

        // Close mobile sidebar on selection
        toggleDashSidebar(false);
      });
    });

    // Dashboard Logout Button
    const dashLogoutBtn = document.getElementById('dashLogoutBtn');
    if (dashLogoutBtn) {
      dashLogoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to sign out of your AQUAGUARD customer session?')) {
          window.location.href = 'login.html';
        }
      });
    }

    // Dashboard Booking Visit Form
    const dashBookingForm = document.getElementById('dashBookingForm');
    const dashBookingAlert = document.getElementById('dashBookingAlert');
    if (dashBookingForm) {
      dashBookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tank = dashBookingForm.elements.dashTankSelect ? dashBookingForm.elements.dashTankSelect.value : 'Combined Tank & Sump';
        const date = dashBookingForm.elements.dashDateSelect ? dashBookingForm.elements.dashDateSelect.value : 'Preferred Date';
        const slot = dashBookingForm.elements.dashSlotSelect ? dashBookingForm.elements.dashSlotSelect.value : 'Morning Slot';

        if (dashBookingAlert) {
          dashBookingAlert.innerHTML = `
            <strong>Visit Scheduled (Frontend Demo):</strong> Your cleaning visit for <strong>${tank}</strong> on <strong>${date}</strong> (${slot}) has been booked. A technician dispatch confirmation will be simulated in this demo portal.
          `;
          dashBookingAlert.classList.add('is-visible');
        }
      });
    }

    // Dashboard Reminder Settings Form
    const dashReminderForm = document.getElementById('dashReminderForm');
    const dashReminderAlert = document.getElementById('dashReminderAlert');
    if (dashReminderForm) {
      dashReminderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (dashReminderAlert) {
          dashReminderAlert.innerHTML = `
            <strong>Preferences Saved:</strong> Your recurring water hygiene reminders have been updated successfully. Next automated alert is set 7 days prior to your 6-month due date.
          `;
          dashReminderAlert.classList.add('is-visible');
        }
      });
    }

    // Invoice Download Demo Buttons
    document.querySelectorAll('[data-download-invoice]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const invoiceNum = btn.getAttribute('data-download-invoice') || 'INV-2026';
        alert(`Demonstration: Download initiated for invoice #${invoiceNum}. (In production, this generates a stamped PDF service voucher).`);
      });
    });

    // Report View Demo Buttons
    document.querySelectorAll('[data-view-report]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const reportTitle = btn.getAttribute('data-view-report') || 'Water Hygiene Report';
        alert(`Demonstration: Opening detailed inspection checklist and certificate for "${reportTitle}".`);
      });
    });
  }

  /* ------------------------------------------------------------------------
     INITIALIZE ALL MODULES ON DOM READY
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initRtl();
    initNavigation();
    initSearchModal();
    initProcessTabs();
    initBeforeAfterSliders();
    initPricingFilter();
    initFaqAccordions();
    initEnquiryForm();
    initAuthPages();
    initDashboard();
  });
})();

