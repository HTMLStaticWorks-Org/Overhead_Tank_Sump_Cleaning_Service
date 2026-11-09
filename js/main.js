/* ==========================================================================
   AQUAGUARD  -  Main Frontend Application Script
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

    // Mobile accordion dropdowns (Home v and Services v)
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
      title: 'Home-2  -  Hygiene Standards & Process Experience',
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
     4. INTERACTIVE SERVICE-ADAPTIVE 6-STEP CLEANING PROCESS (Differentiated per page)
     ------------------------------------------------------------------------ */
  const PROCESS_DATA = {
    home1: {
      overhead: [
        {
          num: '01',
          badge: 'Pre-Service Safety',
          title: 'Inlet Isolation & Pre-Check',
          desc: 'Technicians inspect the rooftop tank or sump surroundings, isolate the municipal and booster supply lines, and install temporary safety covers to protect domestic pipes.'
        },
        {
          num: '02',
          badge: 'Rapid Water Removal',
          title: 'Controlled Submersible Dewatering',
          desc: 'High-capacity submersible pumps evacuate standing water down to the floor silt line through dedicated drainage hoses, preserving terrace stormwater drains.'
        },
        {
          num: '03',
          badge: 'Floor Desilting',
          title: 'Heavy Sludge & Silt Vacuuming',
          desc: 'Settled clay particles, borehole iron silt, and organic sediment are agitated and extracted using an industrial high-suction slurry vacuum without clogging house drains.'
        },
        {
          num: '04',
          badge: 'Surface Cleansing',
          title: 'High-Pressure Wall & Rib Jet Washing',
          desc: '360-degree rotary pressure jet lances scour inner tank surfaces, corrugation rings, and corner crevices to dislodge adhered biofilm, algae, and scale buildup.'
        },
        {
          num: '05',
          badge: 'Microbial Protection',
          title: 'Food-Grade Antibacterial Sanitization',
          desc: 'Technicians apply a fine-mist spray of certified, food-grade antimicrobial solution across all ceiling, wall, and floor surfaces with monitored contact time.'
        },
        {
          num: '06',
          badge: 'Clean Water Refill',
          title: 'Final Purity Rinse & Handover',
          desc: 'The chamber is thoroughly rinsed with fresh water, vacuumed dry of residue, and visually verified with the property owner before refilling is initiated.'
        }
      ],
      sump: [
        {
          num: '01',
          badge: 'Domestic Sump Safety',
          title: 'Sump Access & Pump Isolation',
          desc: 'Technicians inspect subterranean manholes, verify ventilation, and isolate automatic level controllers to ensure zero risk to domestic booster pumps.'
        },
        {
          num: '02',
          badge: 'High-Volume Drain',
          title: 'Fast Sump Dewatering',
          desc: 'High-volume submersible dewatering pumps discharge old standing water cleanly to municipal storm lines without yard overflow.'
        },
        {
          num: '03',
          badge: 'Silt Slurry Extraction',
          title: 'Heavy Floor Sludge Desilting',
          desc: 'Dense municipal silt and settled mud cake are sucked out from the sump floor and corners using high-suction slurry extractors.'
        },
        {
          num: '04',
          badge: 'Concrete Pressure Wash',
          title: 'Masonry Jet Wall Scouring',
          desc: 'High-velocity water jets blast mineral calcifications and slippery biofilm off masonry walls and floor corners.'
        },
        {
          num: '05',
          badge: 'Deep Sanitization',
          title: 'Antimicrobial Sump Fogging',
          desc: 'A food-safe sanitizing mist is atomized throughout the sump chamber to eliminate subterranean bacteria and odor.'
        },
        {
          num: '06',
          badge: 'Household Restoration',
          title: 'Foot-Valve Clear & Refill Handover',
          desc: 'Technicians inspect and scrub the foot-valve strainer, verify zero rinse residue, and invite homeowner sign-off before reopening inlet valves.'
        }
      ],
      commercial: [
        {
          num: '01',
          badge: 'Community Water Notice',
          title: 'Society Dual-Supply Planning',
          desc: 'Crew leads coordinate with resident welfare associations to clean one storage compartment at a time, ensuring residents face zero tap dry-out.'
        },
        {
          num: '02',
          badge: 'Continuous Domestic Supply',
          title: 'Staged Dual-Chamber Dewatering',
          desc: 'Submersible pumps evacuate one compartment at a time while the facility header continues drawing from the alternate chamber.'
        },
        {
          num: '03',
          badge: 'Heavy Sediment Clearance',
          title: 'Baffle Wall Sludge Vacuuming',
          desc: 'Industrial slurry vacuums extract heavy mud piles and settled mineral scale gathered along partition baffle walls and floor depressions.'
        },
        {
          num: '04',
          badge: 'RCC Structural Cleansing',
          title: 'Rotary Industrial Jet Washing',
          desc: 'Heavy-duty rotary pressure cleaners strip slime, mineral crust, and algae off structural columns, ceiling slabs, and partition walls.'
        },
        {
          num: '05',
          badge: 'Safe Resident Water',
          title: 'Potable Mist Surface Sanitization',
          desc: 'Food-grade sanitizing fog is applied to all internal structural concrete surfaces with controlled dwell time before thorough flushing.'
        },
        {
          num: '06',
          badge: 'Society Handover',
          title: 'Joint RWA Verification & Sign-Off',
          desc: 'Joint visual sign-off with the RWA estate manager or facility supervisor, followed by a formal service completion report.'
        }
      ]
    },
    home2: {
      overhead: [
        {
          num: '01',
          badge: 'Fall Protection & Rigging',
          title: 'Structural Roof Anchor & Rigging',
          desc: 'Technicians establish rooftop fall-arrest anchor points, inspect ladder tie-offs, and isolate manifold balance valves across header tanks.'
        },
        {
          num: '02',
          badge: 'Fast Polymer Drainage',
          title: 'High-Head Evacuation Pumping',
          desc: 'Compact, non-marking submersible pumps rapidly evacuate standing volume down to the bottom sediment sump trough.'
        },
        {
          num: '03',
          badge: 'Polymer Rib Descaling',
          title: 'Corrugated Ring Silt Extraction',
          desc: 'Targeted wet-vacuum extraction strips settled borehole iron flakes and sediment from molded polymer reinforcement rings.'
        },
        {
          num: '04',
          badge: 'Food-Grade Liner Protection',
          title: 'Non-Abrasive Rotary Scrubbing',
          desc: 'Custom soft-bristle rotary scrubbers remove internal biofilm without scratching or degrading the antibacterial polyethylene inner layer.'
        },
        {
          num: '05',
          badge: 'Oxidative Sterilization',
          title: 'Measured Hydrogen Peroxide Fogging',
          desc: 'Precision aerosol fogging sanitizes internal air space, overflow vents, and corrugated ceilings without chemical aftertastes.'
        },
        {
          num: '06',
          badge: 'Refill Commissioning',
          title: 'Turbidity & Pressure Test Sign-Off',
          desc: 'After vacuuming rinse residue, inlet float valves are tested and water clarity is verified below 1.5 NTU before crew demobilisation.'
        }
      ],
      sump: [
        {
          num: '01',
          badge: 'Confined Space Safety',
          title: 'Multi-Gas Audit & Ventilation',
          desc: 'Certified technicians conduct pre-entry atmospheric gas monitoring (H2S, CO, O2 levels), establish forced-air positive ventilation, and deploy explosion-proof LED work lamps.'
        },
        {
          num: '02',
          badge: 'High-Head Evacuation',
          title: 'Industrial Submersible Dewatering',
          desc: 'High-flow submersible trash pumps with vortex impellers rapidly drain thousands of litres of subterranean sump water directly to designated municipal disposal outlets.'
        },
        {
          num: '03',
          badge: 'Industrial Desilting',
          title: 'Deep-Chamber Sludge Extraction',
          desc: 'Compact hydro-vacuum units extract heavy gravel, decomposed silt cakes, and mineral slurry from deep sump sumps and suction pit troughs.'
        },
        {
          num: '04',
          badge: 'High-Pressure Scouring',
          title: 'Rotary Jet Mechanical Wall Scrubbing',
          desc: 'Heavy-duty 150-bar rotary surface cleaners scour concrete baffle partitions, internal support pillars, suction manifolds, and RCC floors to bare masonry.'
        },
        {
          num: '05',
          badge: 'EPA-Compliant Disinfection',
          title: 'Dual-Action Disinfection & Fogging',
          desc: 'Hospital-grade, non-residual disinfectant is atomized across all interior concrete surfaces and access ladder rungs to eliminate bacterial spore clusters and fungal biofilm.'
        },
        {
          num: '06',
          badge: 'Engineering Handover',
          title: 'Turbidity Audit & Refill Sign-Off',
          desc: 'Technicians clean the foot-valve strainer, verify water clarity parameters below 1.5 NTU, and provide a signed digital service checklist for facility maintenance records.'
        }
      ],
      commercial: [
        {
          num: '01',
          badge: 'Industrial Isolation',
          title: 'Lockout-Tagout & Bypass Engineering',
          desc: 'LOTO procedures lock automated pump starters while temporary suction bypasses maintain uninterrupted pressure booster feeds to upper floors.'
        },
        {
          num: '02',
          badge: 'High-Volume Pumping',
          title: 'High-Capacity Vortex Dewatering',
          desc: 'Multiple 3-phase submersible trash pumps discharge large-scale commercial reservoirs swiftly to designated drainage manifolds.'
        },
        {
          num: '03',
          badge: 'Bulk Desilting',
          title: 'Heavy Silt Solid Scraping & Slurry Pumping',
          desc: 'Industrial slurry pumps extract dense borehole mud, mineral scales, and calcified crusts accumulated around pump sump pits.'
        },
        {
          num: '04',
          badge: 'Industrial Masonry Jetting',
          title: '180-Bar Hydro-Blasting Partition Walls',
          desc: 'High-velocity 180-bar rotary nozzles scour concrete columns, roof slabs, and baffle partitions to pristine masonry.'
        },
        {
          num: '05',
          badge: 'Heavy Microbial Knockdown',
          title: 'Certified Chlorine-Dioxide Atomization',
          desc: 'Engineered broad-spectrum disinfectant mist is atomized with measured ppm contact time across all compartment surfaces.'
        },
        {
          num: '06',
          badge: 'Audit Compliance',
          title: 'Turbidimetric Log & Handover Certificate',
          desc: 'Final NTU turbidity logs, photo-documented checklists, and formal sign-offs are submitted to facility managers.'
        }
      ]
    },
    services: {
      overhead: [
        {
          num: '01',
          badge: 'Technical Site Assessment',
          title: 'Site Survey & Supply Lockout',
          desc: 'Crew leads document baseline water levels, test structural integrity of manhole copings and access ladders, and apply Lockout-Tagout (LOTO) protocols on automatic booster pumps.'
        },
        {
          num: '02',
          badge: 'Managed Effluent Drainage',
          title: 'Multi-Stage Residual Evacuation',
          desc: 'Controlled evacuation separates reusable top-level water where practical, while bottom water is routed through inline sediment filters to prevent storm line obstruction.'
        },
        {
          num: '03',
          badge: 'Mechanical Descaling',
          title: 'Bottom Sediment & Scale Scraping',
          desc: 'Specialized scrapers and high-suction slurry vacuums strip settled borehole minerals, calcium scale, and rust flakes from tank joints, corners, and floor gullies.'
        },
        {
          num: '04',
          badge: '360-Degree Pressure Lance',
          title: 'Controlled Surface Pressure Hydro-Scrub',
          desc: 'Pressure-regulated hydro-lances (calibrated to material: 80 bar for HDPE/FRP; 140 bar for RCC) eradicate biofilm without micro-abrasion or structural liner degradation.'
        },
        {
          num: '05',
          badge: 'Biofilm Neutralization',
          title: 'Antimicrobial Mist Contact Application',
          desc: 'Surface disinfection is carried out using calibrated sodium hypochlorite or hydrogen peroxide-based food-safe solutions, observing exact regulatory contact times.'
        },
        {
          num: '06',
          badge: 'Digital Hygiene Audit',
          title: 'Post-Clean Quality Assurance Sign-Off',
          desc: 'Comprehensive inspection covers sediment clearance, water clarity, seal condition, and float valve functioning, documented in a formal digital hygiene report.'
        }
      ],
      sump: [
        {
          num: '01',
          badge: 'Pre-Service Sump Protocol',
          title: 'Chamber Structural Audit & Inflow Lock',
          desc: 'Technicians inspect underground concrete sumps for hairline leakage, check suction foot-valves, and lock inlet supply lines.'
        },
        {
          num: '02',
          badge: 'Managed Slurry Extraction',
          title: 'Vortex Slurry Evacuation Dewatering',
          desc: 'High-head submersible dewatering pumps evacuate residual standing water through discharge hoses routed directly to authorized gullies.'
        },
        {
          num: '03',
          badge: 'Hydro-Vacuum Extraction',
          title: 'Heavy Silt & Rust Crust Extraction',
          desc: 'Heavy wet-vacuum extractors pull thick silt layers and iron sediment out of sump corners, ladder bases, and suction troughs.'
        },
        {
          num: '04',
          badge: 'High-Impact Pressure Lance',
          title: 'Masonry Rotary Jet Wall Eradication',
          desc: 'Rotary pressure jet lances scour underground RCC walls, removing algae biofilm, mineral deposits, and damp discoloration.'
        },
        {
          num: '05',
          badge: 'Surface Decontamination',
          title: 'Certified Broad-Spectrum Disinfection Mist',
          desc: 'Food-safe antibacterial mist is applied across all walls, floor surfaces, and ladder rungs to neutralize microbial reservoirs.'
        },
        {
          num: '06',
          badge: 'Certified Quality Handover',
          title: 'Clear Water Inflow Audit & Handover',
          desc: 'The sump is thoroughly flushed, remaining rinse water is vacuumed dry, and the foot-valve strainer is tested before refilling.'
        }
      ],
      commercial: [
        {
          num: '01',
          badge: 'Site Isolation Protocol',
          title: 'Multi-Compartment Isolation & Supply Bypass',
          desc: 'Technical consultation with facility teams isolates individual storage bays while preserving fire-fighting reserves and continuous booster feeds.'
        },
        {
          num: '02',
          badge: 'Parallel Pumping Grid',
          title: 'High-Capacity Industrial Dewatering Lines',
          desc: 'Industrial 3-phase submersible pumps evacuate high-volume concrete reservoirs swiftly through dedicated heavy-duty hoses.'
        },
        {
          num: '03',
          badge: 'Industrial Desilting',
          title: 'Heavy Cake Desilting & Sump Gutter Clean',
          desc: 'Mechanical scrapers and high-flow vacuum tankers remove heavy sediment cakes, sand deposits, and pipe rust flakes.'
        },
        {
          num: '04',
          badge: 'Structural Surface Cleaning',
          title: 'High-Pressure Concrete Rotary Hydro-Wash',
          desc: 'High-pressure rotary hydro-cleaning sanitizes baffle walls, internal concrete pillars, and high ceiling vaults.'
        },
        {
          num: '05',
          badge: 'Microbial Compliance',
          title: 'Controlled Contact Antimicrobial Treatment',
          desc: 'Approved sanitization mist is atomized throughout large commercial compartments to meet municipal water storage hygiene norms.'
        },
        {
          num: '06',
          badge: 'Compliance Certification',
          title: 'Formal Technical Hygiene Report & Photos',
          desc: 'Comprehensive before-and-after digital photography, turbidity measurements, and signed audit sheets delivered for society records.'
        }
      ]
    }
  };

  function initProcessTabs() {
    const tabContainers = document.querySelectorAll('[data-process-Interactive]');
    tabContainers.forEach((container) => {
      const tabs = container.querySelectorAll('[data-process-type]');
      const grid = container.querySelector('[data-process-grid]');
      if (!tabs.length || !grid) return;

      // Determine page context for distinct step sets
      let pageKey = 'home1';
      const path = window.location.pathname.toLowerCase();
      if (path.includes('home-2')) {
        pageKey = 'home2';
      } else if (path.includes('services')) {
        pageKey = 'services';
      }

      function renderProcess(type) {
        const pageGroup = PROCESS_DATA[pageKey] || PROCESS_DATA.home1;
        const steps = pageGroup[type] || pageGroup.overhead;
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
      beforeImg: 'assets/images/sump-before.jpg',
      afterImg: 'assets/images/sump-after.jpg',
      beforeAlt: 'Underground concrete water sump interior before cleaning showing settled bottom sludge and wall biofilm',
      afterAlt: 'Underground concrete water sump interior after AQUAGUARD cleaning showing sanitized walls and sludge-free floor',
      beforeTitle: 'Before Cleaning: Underground Concrete Sump',
      beforeDesc: 'Accumulated municipal silt, brownish floor sludge cake, calcified water-line rings, and damp greenish algae biofilm along lower concrete walls.',
      afterTitle: 'After Cleaning: Sanitized Sump Chamber',
      afterDesc: '100% dewatered, vacuum-desilted, high-pressure rotary jet scrubbed, and mist-disinfected concrete walls and floor ready for clean water storage.'
    },
    rooftop: {
      beforeImg: 'assets/images/tank-before.jpg',
      afterImg: 'assets/images/tank-after.jpg',
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
            'Weak  -  add numbers & mixed case',
            'Fair  -  add a symbol or uppercase letter',
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

