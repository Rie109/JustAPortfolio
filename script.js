/**
 * Quan (Harry) Nguyen — Portfolio Interactivity
 * Full-Screen 4-Column Flex Accordion with Hover Expansion & Nav Dynamics
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Header & Nav Elements ---
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const railBead = document.getElementById('railBead');
  const railLine = document.querySelector('.rail-line');
  const cursorAmbient = document.getElementById('cursorAmbient');
  const heroBgImg = document.querySelector('.hero-bg-img');
  const sections = document.querySelectorAll('section[id]');

  // --- Fullscreen Work Accordion Elements ---
  const workStrip = document.getElementById('workStrip');
  const expandCards = document.querySelectorAll('.expand-card');
  const cardCloseBtns = document.querySelectorAll('.card-close-btn');

  function lockCard(targetCard) {
    if (!workStrip || !targetCard) return;

    expandCards.forEach((c) => {
      if (c === targetCard) {
        c.classList.add('is-locked-card');
        c.setAttribute('aria-expanded', 'true');
      } else {
        c.classList.remove('is-locked-card');
        c.setAttribute('aria-expanded', 'false');
      }
    });

    workStrip.classList.add('is-locked');
  }

  function unlockAllCards() {
    if (!workStrip) return;
    workStrip.classList.remove('is-locked');
    expandCards.forEach((c) => {
      c.classList.remove('is-locked-card');
      c.setAttribute('aria-expanded', 'false');
    });
  }

  let hoverExpandTimeout = null;
  const HOVER_EXPAND_DELAY_MS = 350; // Snappy 350ms intentional hover delay to prevent jumping during scrolling

  function clearHoverExpansion() {
    if (hoverExpandTimeout) {
      clearTimeout(hoverExpandTimeout);
      hoverExpandTimeout = null;
    }
    expandCards.forEach(c => c.classList.remove('is-hover-expanded'));
    if (workStrip) workStrip.classList.remove('has-hover-expanded');
  }

  expandCards.forEach((card) => {
    // Intentional hover: only expands after hovering 1-2 seconds
    card.addEventListener('mouseenter', () => {
      if (!workStrip || workStrip.classList.contains('is-locked')) return;

      clearTimeout(hoverExpandTimeout);
      hoverExpandTimeout = setTimeout(() => {
        if (!workStrip.classList.contains('is-locked')) {
          expandCards.forEach(c => c.classList.remove('is-hover-expanded'));
          card.classList.add('is-hover-expanded');
          workStrip.classList.add('has-hover-expanded');
        }
      }, HOVER_EXPAND_DELAY_MS);
    });

    card.addEventListener('mouseleave', () => {
      if (hoverExpandTimeout) {
        clearTimeout(hoverExpandTimeout);
        hoverExpandTimeout = null;
      }
      card.classList.remove('is-hover-expanded');
      const anyHovered = Array.from(expandCards).some(c => c.classList.contains('is-hover-expanded'));
      if (!anyHovered && workStrip) {
        workStrip.classList.remove('has-hover-expanded');
      }
    });

    // Click on card to lock/pin it in place and display full info immediately
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-close-btn')) return;
      clearHoverExpansion();
      lockCard(card);
    });

    // Keyboard accessible Enter / Space
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clearHoverExpansion();
        lockCard(card);
        const closeBtn = card.querySelector('.card-close-btn');
        if (closeBtn) closeBtn.focus();
      }
    });
  });

  // Close buttons unlock the accordion
  cardCloseBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      unlockAllCards();
    });
  });

  // Global Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      unlockAllCards();
    }
  });

  // ==========================================================================
  // Header Nav Rail Tracking & Scrollspy
  // ==========================================================================
  let activeLink = document.querySelector('.nav-link.active') || navLinks[0];

  function positionBead(targetLink) {
    if (!targetLink || !railBead || !railLine) return;

    const linkRect = targetLink.getBoundingClientRect();
    const railRect = railLine.getBoundingClientRect();

    const linkCenter = linkRect.left + linkRect.width / 2;
    let targetX = linkCenter - railRect.left;

    targetX = Math.max(0, Math.min(targetX, railRect.width));
    railBead.style.left = `${targetX}px`;
  }

  requestAnimationFrame(() => {
    positionBead(activeLink);
  });

  window.addEventListener('resize', () => {
    positionBead(activeLink);
  });

  navLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      positionBead(link);
    });

    link.addEventListener('mouseleave', () => {
      positionBead(activeLink);
    });

    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
          setActiveNav(link);
        }
      }
    });
  });

  function setActiveNav(newActiveLink) {
    if (!newActiveLink || activeLink === newActiveLink) return;

    navLinks.forEach((l) => {
      l.classList.remove('active');
      l.removeAttribute('aria-current');
    });

    newActiveLink.classList.add('active');
    newActiveLink.setAttribute('aria-current', 'page');
    activeLink = newActiveLink;
    positionBead(activeLink);
  }

  // Scrollspy Observer
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -40% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        const matchingLink = document.querySelector(`.nav-link[href="#${id}"]`);
        if (matchingLink) {
          setActiveNav(matchingLink);
        }
      }
    });
  }, observerOptions);

  sections.forEach((sec) => sectionObserver.observe(sec));

  // Header Scrolled Class on Window Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Ambient Cursor Spotlight & Subtle Parallax
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (heroBgImg && window.scrollY < window.innerHeight) {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.015;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.015;
      heroBgImg.style.transform = `scale(1.04) translate(${moveX}px, ${moveY}px)`;
    }
  }, { passive: true });

  function animateAmbient() {
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;

    if (cursorAmbient) {
      cursorAmbient.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    }

    requestAnimationFrame(animateAmbient);
  }

  // ==========================================================================
  // WebGL Sine Wave Canvas for Card 02 (NYCU x Foxconn)
  // Sine wave logic with chromatic dispersion and tone of Kornblume
  // ==========================================================================
  function initNycuWaveCanvas() {
    const canvas = document.getElementById('nycuWaveCanvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) 
            || canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const vsTag = document.getElementById('js-vertex-shader');
    const fsTag = document.getElementById('js-fragment-shader');

    const vsSource = vsTag ? vsTag.textContent : `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fsSource = fsTag ? fsTag.textContent : `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        
        float d = length(p) * distortion;
        
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);

        vec3 kornblumeAzure = vec3(0.20, 0.55, 1.0);
        vec3 cyanHighlight  = vec3(0.38, 0.88, 1.0);
        vec3 coreWhite      = vec3(1.0, 1.0, 1.0);

        vec3 waveCol = r * vec3(0.32, 0.22, 0.85)
                     + g * cyanHighlight * 0.90
                     + b * kornblumeAzure * 1.55;

        float intensity = (r + g + b) * 0.333;
        if (intensity > 0.85) {
          waveCol = mix(waveCol, coreWhite, clamp((intensity - 0.85) * 0.75, 0.0, 1.0));
        }

        float alpha = clamp(max(max(r, g), b) * 1.5, 0.0, 0.95);

        gl_FragColor = vec4(waveCol, alpha);
      }
    `;

    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }

    const posAttr = gl.getAttribLocation(prog, 'position');
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0
      ]),
      gl.STATIC_DRAW
    );

    const resUni = gl.getUniformLocation(prog, 'resolution');
    const timeUni = gl.getUniformLocation(prog, 'time');
    const xScaleUni = gl.getUniformLocation(prog, 'xScale');
    const yScaleUni = gl.getUniformLocation(prog, 'yScale');
    const distUni = gl.getUniformLocation(prog, 'distortion');

    let timeVal = 0.0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function renderLoop() {
      resize();
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 3, gl.FLOAT, false, 0, 0);

      timeVal += 0.015;

      gl.uniform2f(resUni, canvas.width, canvas.height);
      gl.uniform1f(timeUni, timeVal);
      gl.uniform1f(xScaleUni, 1.0);
      gl.uniform1f(yScaleUni, 0.45);
      gl.uniform1f(distUni, 0.05);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      requestAnimationFrame(renderLoop);
    }

    renderLoop();

    const card2 = document.getElementById('cardCol2');
    if (window.ResizeObserver && card2) {
      new ResizeObserver(() => resize()).observe(card2);
    }
  }

  initNycuWaveCanvas();

  // ==========================================================================
  // ROADMAP SECTION INTERACTIVITY (Rotary Wheel + Details/Summary Viewer)
  // Milestones from 2024 to 2030+ with Kornblume Botanical Imagery
  // ==========================================================================
  // Generate Clock Dial Graduation Ticks (matching Image 1 mock)
  const clockSvg = document.getElementById('clockTicksSvg');
  if (clockSvg) {
    const totalTicks = 60;
    const rOuter = 240;
    let ticksHtml = '';

    for (let i = 0; i < totalTicks; i++) {
      const angle = (i * 360) / totalTicks;
      const isMajor = (i % 5 === 0);
      const tickLength = isMajor ? 14 : 7;
      const rInner = rOuter - tickLength;
      const strokeWidth = isMajor ? 2 : 1;
      const strokeColor = isMajor ? 'rgba(78, 137, 223, 0.75)' : 'rgba(255, 255, 255, 0.22)';

      ticksHtml += `<line x1="0" y1="${-rOuter}" x2="0" y2="${-rInner}" stroke="${strokeColor}" stroke-width="${strokeWidth}" transform="rotate(${angle})" />`;
    }
    // Outer dial circle
    ticksHtml += `<circle cx="0" cy="0" r="${rOuter}" fill="none" stroke="rgba(255, 255, 255, 0.35)" stroke-width="2" />`;
    // Inner accent dashed ring
    ticksHtml += `<circle cx="0" cy="0" r="${rOuter - 22}" fill="none" stroke="rgba(78, 137, 223, 0.18)" stroke-width="1" stroke-dasharray="3 4" />`;
    clockSvg.innerHTML = ticksHtml;
  }

  const roadmapData = [
    {
      year: '2024',
      badge: 'Foundational STEM',
      title: 'Nguyen Thuong Hien High School',
      subtitle: 'STEM Foundations & Advanced Physics Olympiad',
      summary: 'Advanced Physics & Mathematics curriculum at Nguyen Thuong Hien High School for the Gifted. Built deep foundational analytical rigor in semiconductor physics, electronic principles, and algorithmic problem-solving for national academic Olympiads.',
      project: 'High-School Physics Demonstrator & Automated Sensor Rig — designed analog sensor interfaces, automated relay circuits, and scientific calculation software that catalyzed entry into international engineering programs.',
      future: 'Transition to university-level solid-state physics, wide-bandgap materials, and high-frequency electronic device characterization in the United States.'
    },
    {
      year: '2025',
      badge: 'Higher Education',
      title: 'University of Cincinnati',
      subtitle: "B.S. Electrical Engineering ('30)",
      summary: 'College of Engineering and Applied Science (CEAS), University of Cincinnati. Comprehensive coursework in Solid-State Electronics, Semiconductor Device Physics, Signals & Systems, Linear Systems, and Microelectronic Fabrication.',
      project: 'Automated Benchtop Parameter Extraction Suite — developed Python (PyVISA) automation routines interfacing with Keysight SMUs and LCR meters for high-throughput Vth, subthreshold swing, and C-V profiling.',
      future: 'Enrollment in the accelerated dual B.S./M.S. ACCEND track and competitive selection for national embedded security initiatives.'
    },
    {
      year: '2026',
      badge: 'Wide-Bandgap Research',
      title: 'NYCU x Foxconn Research Institute',
      subtitle: 'Joint Semiconductor Research Program',
      summary: 'Collaborative research fellowship between National Yang Ming Chiao Tung University (NYCU) & Foxconn Semiconductor Research Center. Deep research into Wide-Bandgap Power Semiconductor Devices, GaN HEMT Breakdown Characterization, and High-Voltage SiC Power Modules.',
      project: 'Dynamic RDS(on) Trap Kinetics & Double-Pulse Testbench — built double-pulse inductive switching testbed for 1200V SiC MOSFETs; conducted Sentaurus TCAD multi-physics simulations to mitigate current collapse in AlGaN/GaN HEMTs.',
      future: 'Publication in IEEE power electronics journals and technical leadership in hardware-secure wide-bandgap applications.'
    },
    {
      year: '2027',
      badge: 'Hardware Security',
      title: 'eCTF MITRE Representative of UC + UC ACCEND',
      subtitle: "Embedded Hardware Security & Dual Master's Track",
      summary: 'Selected as University of Cincinnati Team Representative for the prestigious MITRE Embedded System Challenge (eCTF). Dual-degree enrollment in UC ACCEND (accelerated B.S. + M.S. in Electrical Engineering).',
      project: 'Cryptographic Hardware Root-of-Trust & Side-Channel Shielding — architected bare-metal secure bootloaders, cryptographic coprocessors on FPGA, and power-analysis countermeasures for resilient power grid microcontrollers.',
      future: 'Securing the DAAD RISE Germany Fellowship for international research in cutting-edge semiconductor physical analysis.'
    },
    {
      year: '2028',
      badge: 'International Fellowship',
      title: 'Germany DAAD RISE Planning',
      subtitle: 'International Semiconductor Research Fellowship',
      summary: 'DAAD RISE (Research Internships in Science and Engineering) Fellowship in Germany. Embedded at premier German semiconductor research institutions (Fraunhofer IAF / RWTH Aachen / TU Munich) exploring advanced compound semiconductor epitaxy and thermal dynamics.',
      project: 'High-Power GaN-on-Si Epitaxy & Thermal Profiling — conducted micro-Raman thermography, Hall-effect carrier mobility measurements, and high-temperature stress testing of next-generation power switches.',
      future: "Translating experimental European semiconductor datasets into master's thesis research and industrial co-op development."
    },
    {
      year: '2029',
      badge: 'Advanced Co-op',
      title: 'Coming Soon',
      subtitle: 'Advanced Co-op & High-Density Power Packaging',
      summary: 'Advanced Industry Co-op focusing on high-density power module integration, heterogeneous semiconductor packaging, and wide-bandgap gate-driver topologies for automotive EV traction inverters.',
      project: 'Monolithic Multi-Level GaN Converter Prototype — designed ultra-low parasitic inductance PCB layouts (< 1 nH loop inductance) achieving > 100 V/ns slew rates without spurious turn-on.',
      future: "Defending ACCEND master's thesis and transitioning directly into doctoral research in Ultra-Wide-Bandgap (UWBG) semiconductors."
    },
    {
      year: '2030+',
      badge: 'Frontier Research',
      title: 'UWBG / WBG Research',
      subtitle: 'Ultra-Wide-Bandgap Semiconductors & Next-Gen Power',
      summary: 'Pioneering the extreme frontiers of Ultra-Wide-Bandgap (UWBG) materials: Gallium Oxide (β-Ga2O3, 4.8 eV), Diamond (5.5 eV), and Aluminum Nitride (AlN, 6.2 eV) for high-efficiency grid infrastructure, aerospace, and megawatt converters.',
      project: 'Multi-Kilovolt Edge-Termination & Deep-Level Defect Spectroscopy — modeling field-limiting rings and superjunction concepts capable of exceeding 10 kV blocking voltage with record-low specific on-resistance.',
      future: 'Leading advanced semiconductor R&D laboratories, advancing national power infrastructure resilience, and shaping the future of global energy conversion.'
    }
  ];

  // Milestone and Topic State Controller
  let currentMilestoneIdx = 0;
  let currentTopicIdx = 0;

  const topicsMeta = [
    { name: 'Details & Summary', key: 'summary' },
    { name: 'Project Built', key: 'project' },
    { name: 'In future', key: 'future' }
  ];

  const wheelRadios = document.querySelectorAll('input[name="wheel-year"]');
  const wheelCardsUl = document.querySelector('.roadmap-section .cards');
  const activeBadge = document.getElementById('activeMilestoneBadge');
  const activeYear = document.getElementById('activeMilestoneYear');
  const activeTitle = document.getElementById('activeMilestoneTitle');
  const activeSubtitle = document.getElementById('activeMilestoneSubtitle');
  const activeTopicName = document.getElementById('activeTopicName');
  const roadmapTopicContent = document.getElementById('roadmapTopicContent');
  const topicTabs = document.querySelectorAll('.topic-pill-tab');
  const imgSlides = document.querySelectorAll('.picker-img-slide');
  const prevTopicBtn = document.getElementById('prevTopicBtn');
  const nextTopicBtn = document.getElementById('nextTopicBtn');

  function renderRoadmap() {
    const item = roadmapData[currentMilestoneIdx];
    if (!item) return;

    // Update Rotary Wheel Rotation
    if (wheelCardsUl) {
      wheelCardsUl.style.setProperty('--index', currentMilestoneIdx);
    }
    if (wheelRadios[currentMilestoneIdx]) {
      wheelRadios[currentMilestoneIdx].checked = true;
    }

    // Update Milestone Info Header
    if (activeBadge) activeBadge.textContent = item.badge;
    if (activeYear) activeYear.textContent = item.year;
    if (activeTitle) activeTitle.textContent = item.title;
    if (activeSubtitle) activeSubtitle.textContent = item.subtitle;

    // Update Active Topic Name
    const topicMeta = topicsMeta[currentTopicIdx];
    if (activeTopicName) activeTopicName.textContent = topicMeta.name;

    // Smoothly Fade & Update Active Topic Content
    if (roadmapTopicContent) {
      roadmapTopicContent.style.opacity = '0';
      setTimeout(() => {
        roadmapTopicContent.textContent = item[topicMeta.key];
        roadmapTopicContent.style.opacity = '1';
      }, 150);
    }

    // Update Topic Picker Tabs on Right Side
    topicTabs.forEach((tab, idx) => {
      if (idx === currentTopicIdx) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });

    // Update Visual Background Slide on Right Side
    imgSlides.forEach((slide, idx) => {
      if (idx === currentTopicIdx) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
  }

  // Topic Tab Click Handlers (Topic Picking on Right Side)
  topicTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.getAttribute('data-topic'), 10);
      if (!isNaN(idx)) {
        currentTopicIdx = idx;
        renderRoadmap();
      }
    });
  });

  // Topic Stepper Previous / Next Handlers
  prevTopicBtn?.addEventListener('click', () => {
    currentTopicIdx = (currentTopicIdx - 1 + topicsMeta.length) % topicsMeta.length;
    renderRoadmap();
  });

  nextTopicBtn?.addEventListener('click', () => {
    currentTopicIdx = (currentTopicIdx + 1) % topicsMeta.length;
    renderRoadmap();
  });

  // Wheel Year Change Handler
  wheelRadios.forEach((radio, idx) => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        currentMilestoneIdx = idx;
        renderRoadmap();
      }
    });
  });

  // Initialize Roadmap Display
  renderRoadmap();

  // ==========================================================================
  // PUBLICATIONS SECTION INTERACTIVITY (Category Filter & BibTeX Copy)
  // ==========================================================================
  const pubFilterPills = document.querySelectorAll('.pub-filter-pill');
  const pubCards = document.querySelectorAll('.pub-card');

  pubFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      pubFilterPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');

      const filterVal = pill.getAttribute('data-filter');
      pubCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filterVal === 'all' || cat === filterVal) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });

  // BibTeX Database
  const bibtexEntries = {
    nguyen2026dynamic: `@article{nguyen2026dynamic,
  title={Dynamic RDS(on) Trapping Kinetics and Gate-Lag Degradation in High-Voltage AlGaN/GaN HEMTs Under Severe Electric Field Stress},
  author={Nguyen, Quan and Joint Semiconductor Research Group},
  journal={IEEE Transactions on Electron Devices},
  year={2026},
  note={Under Peer Review}
}`,
    nguyen2026sic: `@inproceedings{nguyen2026sic,
  title={Switching Reliability and Body-Diode Degradation in 1.2 kV SiC Power MOSFETs Subjected to Repetitive Double-Pulse Stress},
  author={Nguyen, Quan},
  booktitle={IEEE Applied Power Electronics Conference and Exposition (APEC)},
  year={2026}
}`,
    nguyen2025tcad: `@inproceedings{nguyen2025tcad,
  title={Numerical Field-Plate Optimization and Edge-Termination for Nanoscale High-Breakdown GaN Power Diodes},
  author={Nguyen, Quan},
  booktitle={IEEE International Symposium on Power Semiconductor Devices and ICs (ISPSD)},
  year={2025}
}`,
    nguyen2027security: `@techreport{nguyen2027security,
  title={Hardware Security and Side-Channel Resilience for Microcontroller-Controlled Power Conversion Topologies},
  author={Nguyen, Quan},
  institution={MITRE Embedded System Challenge (eCTF)},
  year={2027}
}`
  };

  const bibtexBtns = document.querySelectorAll('.pub-btn-bibtex');
  let toastEl = document.querySelector('.bibtex-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'bibtex-toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  bibtexBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.getAttribute('data-bibtex');
      const entry = bibtexEntries[key];
      if (entry && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(entry);
          showToast('✓ BibTeX citation copied to clipboard!');
        } catch (err) {
          showToast('Citation ready to copy.');
        }
      }
    });
  });

  animateAmbient();
});
