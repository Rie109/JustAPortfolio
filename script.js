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

  let crtStaticAnimId = null;
  function startStaticNoise() {
    const canvas = document.getElementById('crtStaticCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (crtStaticAnimId) cancelAnimationFrame(crtStaticAnimId);

    // 480x270 buffer for authentic VHS / CRT TV tracking static
    const w = 480;
    const h = 270;
    canvas.width = w;
    canvas.height = h;
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    function renderStatic() {
      // Clear to deep black (#000000)
      data.fill(0);
      for (let i = 3; i < data.length; i += 4) {
        data[i] = 255;
      }

      // 1. Very subtle random baseline flecks (0 to 10 brightness)
      const numBase = (w * h * 0.012) | 0;
      for (let n = 0; n < numBase; n++) {
        const idx = ((Math.random() * (w * h)) | 0) * 4;
        const v = (Math.random() * 10 + 2) | 0;
        data[idx] = v;
        data[idx + 1] = v;
        data[idx + 2] = v;
      }

      // 2. Sparse horizontal tracking glitch clusters (matching user reference image)
      const numClusters = (Math.random() * 10 + 14) | 0;
      for (let c = 0; c < numClusters; c++) {
        const cy = (Math.random() * h) | 0;
        const cx = (Math.random() * (w - 35)) | 0;
        const clusterWidth = (Math.random() * 28 + 6) | 0;
        const clusterHeight = Math.random() < 0.76 ? 1 : 2;
        const baseV = Math.random() < 0.82 ? ((Math.random() * 45 + 20) | 0) : ((Math.random() * 85 + 60) | 0);

        for (let dy = 0; dy < clusterHeight; dy++) {
          const y = cy + dy;
          if (y >= h) break;
          for (let dx = 0; dx < clusterWidth; dx++) {
            const x = cx + dx;
            if (x >= w) break;
            if (Math.random() < 0.68) {
              const idx = (y * w + x) * 4;
              const v = Math.min(255, Math.max(0, baseV + ((Math.random() * 20 - 10) | 0)));
              data[idx] = v;
              data[idx + 1] = v;
              data[idx + 2] = v;
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      crtStaticAnimId = requestAnimationFrame(renderStatic);
    }
    renderStatic();
  }

  function stopStaticNoise() {
    if (crtStaticAnimId) {
      cancelAnimationFrame(crtStaticAnimId);
      crtStaticAnimId = null;
    }
  }

  let crtBootTimer = null;
  let crtTurnOnTimer = null;
  let crtRevealTimer = null;

  function playCard2BootSequence() {
    const card2 = document.getElementById('cardCol2');
    const bootScreen = document.getElementById('crtBootScreen');
    const tvOverlay = document.getElementById('crtTvTurnOn');
    const shellLayout = document.getElementById('scrollyShellLayout');

    // Clear any previous running sequence
    if (crtBootTimer) clearTimeout(crtBootTimer);
    if (crtTurnOnTimer) clearTimeout(crtTurnOnTimer);
    if (crtRevealTimer) clearTimeout(crtRevealTimer);

    if (tvOverlay) tvOverlay.classList.remove('is-tv-on');

    // Step 1: Make Card 02 empty inside while expanding
    if (shellLayout) {
      shellLayout.classList.add('is-pre-ignition');
    }

    // Trigger TV static screen & white/grey blinking "NYCU x HHRI" (Arcade Boot Style)
    if (bootScreen) {
      bootScreen.classList.remove('is-booting', 'is-fading');
      void bootScreen.offsetWidth; // Force CSS animation restart
      bootScreen.classList.add('is-booting');
      startStaticNoise();
    }

    // Step 2: After blinking ~2-3 times across 1.25s, stop static & play CRT ignition
    crtTurnOnTimer = setTimeout(() => {
      if (!card2 || !card2.classList.contains('is-locked-card')) {
        stopStaticNoise();
        return;
      }

      stopStaticNoise();

      if (bootScreen) {
        bootScreen.classList.remove('is-booting');
        bootScreen.classList.add('is-fading');
      }

      if (tvOverlay) {
        tvOverlay.classList.remove('is-tv-on');
        void tvOverlay.offsetWidth; // Force reflow
        tvOverlay.classList.add('is-tv-on');
      }

      // Step 3: Reveal card content as CRT beam flashes across
      crtRevealTimer = setTimeout(() => {
        if (shellLayout) {
          shellLayout.classList.remove('is-pre-ignition');
        }
        if (bootScreen) {
          bootScreen.classList.remove('is-fading');
        }
      }, 180);

      if (typeof window.resizeNycuCanvas === 'function') {
        window.resizeNycuCanvas();
      }
    }, 1250);
  }

  function resetCard2BootSequence() {
    stopStaticNoise();
    if (crtBootTimer) { clearTimeout(crtBootTimer); crtBootTimer = null; }
    if (crtTurnOnTimer) { clearTimeout(crtTurnOnTimer); crtTurnOnTimer = null; }
    if (crtRevealTimer) { clearTimeout(crtRevealTimer); crtRevealTimer = null; }
    const bootScreen = document.getElementById('crtBootScreen');
    const tvOverlay = document.getElementById('crtTvTurnOn');
    const shellLayout = document.getElementById('scrollyShellLayout');
    if (bootScreen) bootScreen.classList.remove('is-booting', 'is-fading');
    if (tvOverlay) tvOverlay.classList.remove('is-tv-on');
    if (shellLayout) shellLayout.classList.remove('is-pre-ignition');
  }

  function lockCard(targetCard) {
    if (!workStrip || !targetCard) return;
    if (targetCard.classList.contains('is-locked-card')) return; // Run ONLY ONCE when selecting a card

    expandCards.forEach((c) => {
      const badges = c.querySelectorAll('.gold-shine-badge');
      if (c === targetCard) {
        c.classList.add('is-locked-card');
        c.setAttribute('aria-expanded', 'true');
        // Trigger the LED/neon turning on animation when card expands
        badges.forEach((badge) => {
          badge.classList.remove('is-neon-on');
          requestAnimationFrame(() => badge.classList.add('is-neon-on'));
        });

        // Trigger CRT Pre-Ignition & Power-On Sequence for Card 02 (NYCU x Foxconn)
        if (c.id === 'cardCol2') {
          playCard2BootSequence();
        }
      } else {
        c.classList.remove('is-locked-card');
        c.setAttribute('aria-expanded', 'false');
        badges.forEach((badge) => {
          badge.classList.remove('is-neon-on');
        });
        if (c.id === 'cardCol2') {
          resetCard2BootSequence();
        }
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
      const badges = c.querySelectorAll('.gold-shine-badge');
      badges.forEach((badge) => {
        badge.classList.remove('is-neon-on');
      });
    });
    resetCard2BootSequence();
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

  // Safe zone protection: The header height + generous safety margin so navigation
  // and cursor movements across the top of the viewport NEVER trigger cards underneath
  function isInHeaderSafeZone(e) {
    if (!e) return false;
    const headerBottom = header ? header.getBoundingClientRect().bottom : 80;
    return e.clientY <= Math.max(headerBottom + 45, 125);
  }

  // Ensure header interactions never trigger or maintain card expansions
  if (header) {
    header.addEventListener('mouseenter', clearHoverExpansion);
    header.addEventListener('mousemove', clearHoverExpansion);
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      clearHoverExpansion();
    });
  }

  // Global protection: whenever pointer is within header safe zone, cancel card hover expansion
  window.addEventListener('mousemove', (e) => {
    if (isInHeaderSafeZone(e) && workStrip && !workStrip.classList.contains('is-locked')) {
      clearHoverExpansion();
    }
  }, { passive: true });

  expandCards.forEach((card) => {
    // Intentional hover: only expands after hovering outside header safe zone
    card.addEventListener('mouseenter', (e) => {
      if (!workStrip || workStrip.classList.contains('is-locked')) return;
      if (isInHeaderSafeZone(e)) {
        clearHoverExpansion();
        return;
      }

      clearTimeout(hoverExpandTimeout);
      hoverExpandTimeout = setTimeout(() => {
        if (!workStrip.classList.contains('is-locked')) {
          expandCards.forEach(c => c.classList.remove('is-hover-expanded'));
          card.classList.add('is-hover-expanded');
          workStrip.classList.add('has-hover-expanded');
        }
      }, HOVER_EXPAND_DELAY_MS);
    });

    // Continuously monitor mousemove inside the card: if cursor moves up towards the header, cancel immediately
    card.addEventListener('mousemove', (e) => {
      if (!workStrip || workStrip.classList.contains('is-locked')) return;
      if (isInHeaderSafeZone(e)) {
        clearHoverExpansion();
      }
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
      if (isInHeaderSafeZone(e)) {
        return;
      }
      if (card.classList.contains('is-locked-card')) return; // Already locked, do not re-run!
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
  // Gold Award Badge Neon Strike / Replay on Click
  // ==========================================================================
  const goldBadges = document.querySelectorAll('.gold-shine-badge');
  goldBadges.forEach((badge) => {
    badge.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent accordion card interaction
      // Re-trigger the LED/neon strike animation
      badge.classList.remove('is-neon-on');
      void badge.offsetWidth;
      badge.classList.add('is-neon-on');
    });
  });

  // Prevent Git Keycap button click from bubbling into card lock handlers
  const gitKeyBtns = document.querySelectorAll('.git-key-button');
  gitKeyBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
    });
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

    const gl = canvas.getContext('webgl', { alpha: true, preserveDrawingBuffer: true, premultipliedAlpha: false }) 
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

        // =========================================================================
        // 1. ANALOG TV STATIC / CRT GRAIN (shader.se 80s business tech aesthetic)
        // =========================================================================
        vec2 staticCoord = floor(gl_FragCoord.xy * 0.65) + vec2(sin(time * 31.4) * 100.0, cos(time * 47.1) * 100.0);
        float tvNoise = fract(sin(dot(staticCoord, vec2(12.9898, 78.233))) * 43758.5453);

        // CRT scanlines: horizontal raster lines across the canvas
        float scanline = sin(gl_FragCoord.y * 1.8) * 0.055;

        // Subtle analog CRT vertical roll / sync flicker
        float syncRoll = sin(gl_FragCoord.y * 0.012 - time * 2.8) * 0.03;

        // CRT vignette: soft falloff towards edges
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
        vignette = clamp(pow(16.0 * vignette, 0.25), 0.0, 1.0);

        // Deep retro monitor base color (dark navy/charcoal)
        vec3 crtDarkBase = vec3(0.022, 0.028, 0.042);

        // Composite TV static noise (snow/grain)
        float staticDelta = (tvNoise - 0.5) * 0.28 + scanline + syncRoll;
        vec3 tvStaticColor = clamp(crtDarkBase + vec3(staticDelta * 1.1, staticDelta * 1.05, staticDelta * 1.4), 0.0, 1.0);
        tvStaticColor *= (0.65 + 0.35 * vignette);

        // =========================================================================
        // 2. DUAL GLOWING SINE WAVES (Blue NYCU Azure + Red Foxconn Crimson)
        // Soft diffused ambient light ribbons blurred underneath static grain
        // =========================================================================
        // WAVE 1: BLUE SINE WAVE (NYCU Azure)
        float y1 = sin((p.x + time * 0.85) * xScale) * (yScale * 0.52) + 0.12;
        float d1 = abs(p.y - y1);
        float blueGlow = 0.045 / (d1 * 1.5 + 0.05) + 0.035 / (d1 * 3.5 + 0.16);
        vec3 colBlue = blueGlow * vec3(0.12, 0.65, 1.00);

        // WAVE 2: RED SINE WAVE (Foxconn Crimson)
        float y2 = sin((p.x - time * 0.85) * (xScale * 0.92) + 2.2) * (yScale * 0.52) - 0.20;
        float d2 = abs(p.y - y2);
        float redGlow = 0.055 / (d2 * 1.5 + 0.05) + 0.040 / (d2 * 3.5 + 0.16);
        vec3 colRed = redGlow * vec3(1.00, 0.14, 0.30);

        // Combine both waves
        vec3 waveCol = colBlue + colRed;

        // Add waves on top of TV static background
        vec3 finalColor = tvStaticColor + waveCol;

        // Full opacity so TV static background is continuously active and visible
        float maxGlow = max(blueGlow, redGlow);
        float alpha = clamp(0.94 + maxGlow * 0.5, 0.0, 1.0);

        gl_FragColor = vec4(finalColor, alpha);
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

    window.resizeNycuCanvas = resize;
    window.addEventListener('resize', resize, { passive: true });

    const card2 = document.getElementById('cardCol2');
    if (window.ResizeObserver && card2) {
      new ResizeObserver(() => resize()).observe(card2);
    }

    // Initial sizing without layout thrashing inside renderLoop
    resize();

    function renderLoop() {
      // Zero-lag optimization: Only render WebGL when Card 02 is active or hovered
      const isCard2Visible = card2 && (card2.classList.contains('is-locked-card') || card2.classList.contains('is-hover-expanded'));
      if (!isCard2Visible) {
        requestAnimationFrame(renderLoop);
        return;
      }

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
  }


  // ==========================================================================
  // Project Result Sliders for Card 02 (NYCU x Foxconn)
  // Individual result scrollers for each of the 3 projects
  // ==========================================================================
  function initProjectSliders() {
    const sliderCards = document.querySelectorAll('.project-slider-card');
    sliderCards.forEach((card) => {
      const slides = card.querySelectorAll('.project-slide');
      const dots = card.querySelectorAll('.slider-dot');
      const prevBtn = card.querySelector('.slider-btn--prev');
      const nextBtn = card.querySelector('.slider-btn--next');
      if (!slides.length) return;

      let currentIndex = 0;

      function goToSlide(index) {
        currentIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
          if (i === currentIndex) {
            slide.classList.add('is-active');
          } else {
            slide.classList.remove('is-active');
          }
        });
        dots.forEach((dot, i) => {
          if (i === currentIndex) {
            dot.classList.add('is-active');
          } else {
            dot.classList.remove('is-active');
          }
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          goToSlide(currentIndex - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          goToSlide(currentIndex + 1);
        });
      }

      dots.forEach((dot, i) => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          goToSlide(i);
        });
      });

      // Swipe support for touch devices
      let touchStartX = 0;
      card.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });

      card.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diffX = touchEndX - touchStartX;
        if (Math.abs(diffX) > 40) {
          if (diffX < 0) {
            goToSlide(currentIndex + 1);
          } else {
            goToSlide(currentIndex - 1);
          }
        }
      }, { passive: true });
    });
  }


  // ==========================================================================
  // SCROLLYTELLING EXHIBITION (Picture 1 & Picture 2 Reference)
  // Card 02: NYCU × Foxconn Joint Semiconductor Research Pipeline
  // ==========================================================================
  function initScrollytellingExhibition() {
    const dossier = document.getElementById('dossier2');
    const mainCanvas = document.getElementById('scrollyMainCanvas');
    const railNavProgress = document.getElementById('railNavProgress');
    const railChapterBtns = Array.from(document.querySelectorAll('.rail-chapter-btn'));
    const categoryPillBtns = Array.from(document.querySelectorAll('.category-pill'));
    const chapterSections = Array.from(document.querySelectorAll('.scrolly-chapter-section'));
    const cardCol2 = document.getElementById('cardCol2');

    if (!dossier || !mainCanvas) return;

    // 1. Scrollytelling Scroll Progress & Chapter Auto-Highlighting (Picture 1)
    function updateScrollProgress() {
      const isMobile = window.innerWidth <= 1024;
      const scroller = isMobile ? window : mainCanvas;

      let scrollTop = 0;
      let scrollHeight = 0;
      let clientHeight = 0;

      if (isMobile) {
        scrollTop = window.scrollY || window.pageYOffset;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      } else {
        scrollTop = mainCanvas.scrollTop;
        scrollHeight = mainCanvas.scrollHeight;
        clientHeight = mainCanvas.clientHeight;
      }

      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

      if (railNavProgress) {
        railNavProgress.style.height = `${Math.min(100, Math.max(0, progress))}%`;
      }

      // Determine active chapter based on viewport position
      let activeIdx = 0;
      chapterSections.forEach((section, idx) => {
        const rect = section.getBoundingClientRect();
        const triggerPoint = isMobile ? window.innerHeight * 0.45 : mainCanvas.getBoundingClientRect().top + mainCanvas.clientHeight * 0.35;
        if (rect.top <= triggerPoint) {
          activeIdx = idx;
        }
      });

      railChapterBtns.forEach((btn, idx) => {
        const isActive = idx === activeIdx;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      categoryPillBtns.forEach((pill, idx) => {
        const isActive = idx === activeIdx;
        pill.classList.toggle('is-active', isActive);
        pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    // Scroll listeners
    mainCanvas.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('scroll', () => {
      if (window.innerWidth <= 1024) updateScrollProgress();
    }, { passive: true });

    // Chapter button click smooth scroll
    railChapterBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = btn.dataset.target;
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        const isMobile = window.innerWidth <= 1024;
        if (isMobile) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          const topPos = targetEl.offsetTop - mainCanvas.offsetTop;
          mainCanvas.scrollTo({ top: topPos, behavior: 'smooth' });
        }

        railChapterBtns.forEach(b => b.classList.toggle('is-active', b === btn));
      });
    });

    // Category pills click smooth scroll (Image 1)
    categoryPillBtns.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = pill.dataset.target;
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        const isMobile = window.innerWidth <= 1024;
        if (isMobile) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          const topPos = targetEl.offsetTop - mainCanvas.offsetTop;
          mainCanvas.scrollTo({ top: topPos, behavior: 'smooth' });
        }

        categoryPillBtns.forEach(p => p.classList.toggle('is-active', p === pill));
      });
    });

    // 2. User's Interactive Details & Summary Component Logic
    const disclosureContainers = Array.from(document.querySelectorAll('.feature-disclosure-container'));

    disclosureContainers.forEach((container) => {
      const section = container.querySelector('.disclosure-section');
      if (!section) return;

      const detailsElements = Array.from(section.querySelectorAll('details[name^="feature"]'));
      const nextButton = section.querySelector('button[data-action="next"]');
      const previousButton = section.querySelector('button[data-action="previous"]');
      const exitButton = section.querySelector('button[data-action="exit"]');

      const getOpenDetails = () => {
        return detailsElements.findIndex(details => details.open);
      };

      // Toggle state synchronization
      const syncState = async () => {
        if (!section.matches(':has([open])')) {
          section.dataset.checkingDetails = 'false';
        } else {
          try {
            await Promise.allSettled(section.getAnimations({ subtree: true }).map(a => a.finished));
          } catch (err) {
            // fallback if getAnimations isn't available
          }
          section.dataset.checkingDetails = 'true';
        }
      };

      section.addEventListener('toggle', syncState, true);

      // Next Details Button
      nextButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentIndex = getOpenDetails();
        if (currentIndex !== -1) {
          detailsElements[currentIndex].open = false;
          const nextIndex = (currentIndex + 1) % detailsElements.length;
          detailsElements[nextIndex].open = true;
        } else {
          detailsElements[0].open = true;
        }
      });

      // Previous Details Button
      previousButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentIndex = getOpenDetails();
        if (currentIndex !== -1) {
          detailsElements[currentIndex].open = false;
          const prevIndex = (currentIndex - 1 + detailsElements.length) % detailsElements.length;
          detailsElements[prevIndex].open = true;
        } else {
          detailsElements[detailsElements.length - 1].open = true;
        }
      });

      // Exit Details Button
      exitButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentIndex = getOpenDetails();
        if (currentIndex !== -1) {
          detailsElements[currentIndex].open = false;
        }
      });
    });

    // 3. Hot-Swap 48V vs 400V Architecture Switcher & Comparison Slider
    function initHotswapVoltageOptions() {
      const chHotswap = document.getElementById('ch-hotswap');
      if (!chHotswap) return;

      const voltBtns = Array.from(chHotswap.querySelectorAll('.voltage-pill-btn'));
      const compareCard = document.getElementById('pcbCompareCard');
      const compareSlider = document.getElementById('pcbCompareSlider');
      
      // Squircles elements
      const metric1 = document.getElementById('hsSquircleVal1');
      const desc1 = document.getElementById('hsSquircleDesc1');
      const desc2 = document.getElementById('hsSquircleDesc2');
      const metric3 = document.getElementById('hsSquircleVal3');
      const desc3 = document.getElementById('hsSquircleDesc3');

      // Disclosure content containers
      const contentSchematic = document.getElementById('hsContentSchematic');
      const contentPrototype = document.getElementById('hsContentPrototype');
      const contentCalculation = document.getElementById('hsContentCalculation');

      // Disclosure images
      const imgPrototype = document.getElementById('hsImgPrototype');
      const imgCalculation = document.getElementById('hsImgCalculation');

      let currentVoltage = '48v';

      const dataStore = {
        '48v': {
          metric1: 'x3~',
          desc1: 'Tune to startup 3 times faster',
          desc2: 'Active Safe Operating Area (SOA)',
          metric3: '92.4%',
          desc3: 'Thermal',
          schematic: '<p><strong>48V Si Hot-Swap Architecture</strong> Designed and bench-validated 48V architectures (KiCad), achieving ~95% current-limit spec agreement via rigorous pin-by-pin bring-up.</p>',
          prototype: '<p><strong>48V Bench Safe-Boot Validation</strong> Achieved ~3x faster safe-boot and ~93% lower thermal stress versus stock EVMs on bench load banks with zero inrush damage.</p>',
          calculation: '<p><strong>Safe-Boot Timing Optimization</strong> Derived slew-rate formulas for dual-slope start timing, reducing inrush thermal stress while maintaining FET operation strictly within Safe Operating Area (SOA).</p>',
          imgProto: 'Hot Swap/48V Proto.jpg',
          imgCalc: 'Hot Swap/48V Test.png'
        },
        '400v': {
          metric1: '400V',
          desc1: 'Foxconn AI Data Center Racks',
          desc2: 'Signal-Looping ~64x Fault Resolved',
          metric3: '6 kW',
          desc3: 'SiC Hot-Swap Deployment',
          schematic: '<p><strong>400V SiC Hot-Swap Architecture</strong> Multi-layer schematic for 400V/800V servers utilizing SiC MOSFETs, featuring isolated gate drives and transient snubbers to survive severe inductive kickback.</p>',
          prototype: '<p><strong>400V SiC Prototype Resolution</strong> Diagnosed and resolved a critical 400V signal-looping fault via an optimized RC suppression network, enabling zero-damage safe-boot for Foxconn\'s HHTD26 showcase.</p>',
          calculation: '<p><strong>Inrush Energy Derivations</strong> Calculated inrush energy and optimized gate damping criteria to quench high-frequency oscillations, ensuring power dissipation remains strictly within the SiC pulsed Safe Operating Area.</p>',
          imgProto: 'Hot Swap/400V Proto.jpg',
          imgCalc: 'Hot Swap/400V_Test_Final.png'
        }
      };

      function setVoltage(voltage, moveSlider = true) {
        const v = dataStore[voltage] ? voltage : '48v';
        if (currentVoltage === v && !moveSlider) return;
        currentVoltage = v;
        const d = dataStore[v];

        // Update active toggle buttons
        voltBtns.forEach(btn => {
          const isActive = btn.dataset.voltage === v;
          btn.classList.toggle('is-active', isActive);
          btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Move comparison slider if requested by button click
        if (moveSlider && compareSlider && compareCard) {
          const targetVal = v === '48v' ? 88 : 12;
          compareSlider.value = targetVal;
          compareCard.style.setProperty('--compare', targetVal);
        }

        // Update Squircles
        if (metric1) metric1.textContent = d.metric1;
        if (desc1) desc1.textContent = d.desc1;
        if (desc2) desc2.textContent = d.desc2;
        if (metric3) metric3.textContent = d.metric3;
        if (desc3) desc3.textContent = d.desc3;

        // Update Disclosures content
        if (contentSchematic) contentSchematic.innerHTML = d.schematic;
        if (contentPrototype) contentPrototype.innerHTML = d.prototype;
        if (contentCalculation) contentCalculation.innerHTML = d.calculation;

        // Update Synchronized Images
        if (imgPrototype) imgPrototype.src = d.imgProto;
        if (imgCalculation) imgCalculation.src = d.imgCalc;
      }

      // Comparison slider interactive drag
      if (compareSlider && compareCard) {
        const syncCompare = () => {
          const val = parseFloat(compareSlider.value);
          compareCard.style.setProperty('--compare', val);
          // Seamlessly update architecture info as slider crosses 50%
          if (val >= 50 && currentVoltage !== '48v') {
            setVoltage('48v', false);
          } else if (val < 50 && currentVoltage !== '400v') {
            setVoltage('400v', false);
          }
        };

        compareSlider.addEventListener('input', syncCompare);
        compareSlider.addEventListener('change', syncCompare);
      }

      // Toggle button clicks
      voltBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          setVoltage(btn.dataset.voltage, true);
        });
      });

      // Default state: 50% slider, 48V active
      if (compareSlider && compareCard) {
        compareSlider.value = 50;
        compareCard.style.setProperty('--compare', 50);
      }
      setVoltage('48v', false);
    }

    // Interactive Zoom and Pan for PCB Comparison Card (Picture 1)
    function initPcbZoom() {
      const card = document.getElementById('pcbCompareCard');
      if (!card) return;

      let zoom = 1.0;
      let panX = 0;
      let panY = 0;
      let isPanning = false;
      let startX = 0;
      let startY = 0;

      const zoomInBtn = document.getElementById('pcbZoomInBtn');
      const zoomOutBtn = document.getElementById('pcbZoomOutBtn');
      const zoomResetBtn = document.getElementById('pcbZoomResetBtn');
      const zoomLevelText = document.getElementById('pcbZoomLevelText');

      function applyTransform(smooth = true) {
        if (smooth) {
          card.classList.remove('no-transition');
        } else {
          card.classList.add('no-transition');
        }
        card.style.setProperty('--pcb-zoom', zoom.toFixed(2));
        card.style.setProperty('--pcb-pan-x', `${panX.toFixed(1)}px`);
        card.style.setProperty('--pcb-pan-y', `${panY.toFixed(1)}px`);

        if (zoomLevelText) {
          if (Math.abs(zoom - 1.0) < 0.05 && panX === 0 && panY === 0) {
            zoomLevelText.textContent = 'FIT';
          } else {
            zoomLevelText.textContent = `${Math.round(zoom * 100)}%`;
          }
        }
      }

      function setZoom(newZoom) {
        zoom = Math.min(3.0, Math.max(0.75, newZoom));
        if (zoom <= 1.0) {
          panX = 0;
          panY = 0;
        }
        applyTransform(true);
      }

      if (zoomInBtn) {
        zoomInBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          setZoom(zoom + 0.25);
        });
      }

      if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          setZoom(zoom - 0.25);
        });
      }

      if (zoomResetBtn) {
        zoomResetBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          zoom = 1.0;
          panX = 0;
          panY = 0;
          applyTransform(true);
        });
      }

      // Wheel zoom inside card
      card.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = -e.deltaY;
        const factor = delta > 0 ? 1.15 : 0.85;
        setZoom(zoom * factor);
      }, { passive: false });

      // Drag to pan when zoomed
      card.addEventListener('mousedown', (e) => {
        if (e.target.closest('.pcb-zoom-dock')) return;

        const rect = card.getBoundingClientRect();
        const comparePercent = parseFloat(card.style.getPropertyValue('--compare') || '50');
        const dividerX = rect.left + (comparePercent / 100) * rect.width;

        // If clicked near the slider divider line (within 28px) and not zoomed in, let slider handle it
        if (Math.abs(e.clientX - dividerX) < 28 && zoom <= 1.05) {
          return;
        }

        // Otherwise pan the PCB
        isPanning = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        card.classList.add('is-panning', 'no-transition');
      });

      window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        applyTransform(false);
      });

      window.addEventListener('mouseup', () => {
        if (isPanning) {
          isPanning = false;
          card.classList.remove('is-panning', 'no-transition');
        }
      });
    }

    initHotswapVoltageOptions();
    initPcbZoom();

    // Refresh on expand and resize
    if (cardCol2) {
      cardCol2.addEventListener('click', () => {
        setTimeout(updateScrollProgress, 120);
        setTimeout(updateScrollProgress, 400);
      });
    }

    window.addEventListener('resize', updateScrollProgress);
    setTimeout(updateScrollProgress, 100);
  }

  initNycuWaveCanvas();
  initProjectSliders();
  initScrollytellingExhibition();

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

  // ==========================================================================
  // HERO ROTATING TEXT COMPONENT
  // Cycles between "Quan" and "Harry" inside the blue highlight rectangle box
  // Replicating shadcn/ui @/components/ui/rotating-text reel transition
  // ==========================================================================
  function initRotatingText() {
    const box = document.getElementById('heroRotatingBox');
    const viewport = document.getElementById('rotatingTextViewport');
    const heroHeading = document.getElementById('heroNameHeading');
    if (!box || !viewport) return;

    const words = ['Quan', 'Harry'];
    let currentIndex = 0;
    let isTransitioning = false;
    let intervalId = null;
    const DURATION = 2800; // 2.8s per word

    function createWordElement(word, stateClass = '') {
      const span = document.createElement('span');
      span.className = `rotating-word ${stateClass}`.trim();
      span.innerHTML = word
        .split('')
        .map((char, i) => `<span class="rot-char" style="--i: ${i}">${char}</span>`)
        .join('');
      return span;
    }

    function lockStableBoxProportion() {
      // Temporarily clear inline width to measure true unconstrained dimensions
      box.style.width = 'auto';

      let maxWordWidth = 0;
      words.forEach(word => {
        const testEl = createWordElement(word, 'is-active');
        testEl.style.visibility = 'hidden';
        testEl.style.position = 'absolute';
        testEl.style.width = 'max-content';
        testEl.style.pointerEvents = 'none';
        viewport.appendChild(testEl);
        const rect = testEl.getBoundingClientRect();
        if (rect.width > maxWordWidth) {
          maxWordWidth = rect.width;
        }
        testEl.remove();
      });

      if (maxWordWidth > 0) {
        const style = window.getComputedStyle(box);
        const padLeft = parseFloat(style.paddingLeft) || 0;
        const padRight = parseFloat(style.paddingRight) || 0;
        // Lock box to max word width + padding + safety margin for subpixel rendering
        box.style.width = `${Math.ceil(maxWordWidth + padLeft + padRight + 6)}px`;
      }
    }

    // Set initial word
    viewport.innerHTML = '';
    const initialWord = createWordElement(words[0], 'is-active');
    viewport.appendChild(initialWord);

    // Lock fixed proportional width so it never expands and closes
    requestAnimationFrame(() => {
      lockStableBoxProportion();
    });

    function rotateToNext() {
      if (isTransitioning) return;
      isTransitioning = true;

      const nextIndex = (currentIndex + 1) % words.length;
      const currentWordEl = viewport.querySelector('.rotating-word.is-active');
      const nextWordEl = createWordElement(words[nextIndex], 'is-animating is-entering');

      viewport.appendChild(nextWordEl);

      // Update accessibility label
      if (heroHeading) {
        heroHeading.setAttribute('aria-label', `${words[nextIndex]} Nguyen`);
      }

      // Trigger exit on current word
      if (currentWordEl) {
        currentWordEl.classList.remove('is-active');
        currentWordEl.classList.add('is-exiting');
      }

      // Double rAF ensures CSS transition triggers from translateY(130%) to translateY(0)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          nextWordEl.classList.remove('is-entering');
          nextWordEl.classList.add('is-entered');
        });
      });

      // Once transition finishes, clean up DOM and finalize state
      setTimeout(() => {
        if (currentWordEl && currentWordEl.parentNode) {
          currentWordEl.remove();
        }
        nextWordEl.className = 'rotating-word is-active';
        currentIndex = nextIndex;
        isTransitioning = false;
      }, 520);
    }

    function startTimer() {
      stopTimer();
      intervalId = setInterval(rotateToNext, DURATION);
    }

    function stopTimer() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    // Start auto cycle
    startTimer();

    // Pause on hover
    box.addEventListener('mouseenter', stopTimer);
    box.addEventListener('mouseleave', startTimer);

    // Click to immediately cycle
    box.addEventListener('click', () => {
      rotateToNext();
      startTimer();
    });

    // Keyboard support
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        rotateToNext();
        startTimer();
      }
    });

    // Recalculate on window resize / font load
    window.addEventListener('resize', () => {
      lockStableBoxProportion();
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        lockStableBoxProportion();
      });
    }
  }

  // ==========================================================================
  // Interactive Project Showcase (Details & Summary Smooth Height Disclosure)
  // ==========================================================================
  function initProjectFeatureShowcase() {
    const section = document.getElementById('projectFeatureSection');
    if (!section) return;

    const detailsElements = Array.from(section.querySelectorAll('details[name="feature"]'));
    const nextBtn = section.querySelector('button[data-action="next"]');
    const prevBtn = section.querySelector('button[data-action="previous"]');
    const exitBtn = section.querySelector('button[data-action="exit"]');

    const getOpenDetails = () => {
      return detailsElements.findIndex((details) => details.open);
    };

    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentIndex = getOpenDetails();
      if (currentIndex !== -1) {
        detailsElements[currentIndex].open = false;
        const nextIndex = (currentIndex + 1) % detailsElements.length;
        detailsElements[nextIndex].open = true;
      } else if (detailsElements.length > 0) {
        detailsElements[0].open = true;
      }
    });

    prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentIndex = getOpenDetails();
      if (currentIndex !== -1) {
        detailsElements[currentIndex].open = false;
        const prevIndex = (currentIndex - 1 + detailsElements.length) % detailsElements.length;
        detailsElements[prevIndex].open = true;
      } else if (detailsElements.length > 0) {
        detailsElements[detailsElements.length - 1].open = true;
      }
    });

    exitBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentIndex = getOpenDetails();
      if (currentIndex !== -1) {
        detailsElements[currentIndex].open = false;
      }
    });

    const syncState = async () => {
      if (!section.matches(':has([open])')) {
        section.dataset.checkingDetails = 'false';
      } else {
        if (typeof section.getAnimations === 'function') {
          const anims = section.getAnimations({ subtree: true });
          if (anims && anims.length > 0) {
            await Promise.allSettled(anims.map((a) => a.finished));
          }
        }
        section.dataset.checkingDetails = 'true';
      }
    };

    section.addEventListener('toggle', syncState, true);
  }

  // ==========================================================================
  // Custom Curved Scrollbars (Following Container Border-Radius)
  // ==========================================================================
  function initCurvedScrollbars() {
    const OFFSET = 6;
    const EXTRA_INSET = 2;
    const MIN_START_RATIO = 0.8;
    const MIN_THUMB = 24;
    const SEGMENTS = 50;

    function initCurvedScrollbar(container) {
      if (!container || container._hasCurvedScrollbar) return;
      container._hasCurvedScrollbar = true;

      const content = container.querySelector('.scroll-content');
      if (!content) return;

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('scrollbar-svg');
      svg.setAttribute('aria-hidden', 'true');

      const trackPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      trackPath.classList.add('scrollbar-track');

      const thumbPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      thumbPath.classList.add('scrollbar-thumb');

      svg.appendChild(trackPath);
      svg.appendChild(thumbPath);
      container.appendChild(svg);

      let pathLength = 0;
      let thumbLength = 50;
      let dragging = false;
      let pointerId = null;

      function updatePath() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w <= 0 || h <= 0) return;

        const r = parseFloat(getComputedStyle(container).borderRadius) || 16;
        const effectiveRadius = Math.max(r - OFFSET, 2);
        const trackX = w - OFFSET;
        const topY = OFFSET;
        const bottomY = h - OFFSET;
        const cornerX = trackX - effectiveRadius;

        const minStartX = w * MIN_START_RATIO;
        let startX = trackX - effectiveRadius * EXTRA_INSET;
        if (startX < minStartX) startX = minStartX;
        if (startX > cornerX) startX = cornerX;

        const d = `
          M ${startX} ${topY}
          L ${cornerX} ${topY}                     
          A ${effectiveRadius} ${effectiveRadius} 0 0 1 ${trackX} ${topY + effectiveRadius} 
          L ${trackX} ${bottomY - effectiveRadius} 
          A ${effectiveRadius} ${effectiveRadius} 0 0 1 ${cornerX} ${bottomY} 
          L ${startX} ${bottomY}
        `;
        trackPath.setAttribute('d', d);

        pathLength = trackPath.getTotalLength();
        const ratio = content.clientHeight / content.scrollHeight;
        thumbLength = Math.max(MIN_THUMB, Math.min(pathLength * 0.9, pathLength * ratio));

        if (content.scrollHeight <= content.clientHeight + 2) {
          svg.style.opacity = '0';
        } else {
          svg.style.opacity = '1';
        }

        updateThumb();
      }

      function updateThumb() {
        const scrollableHeight = content.scrollHeight - content.clientHeight || 1;
        const scrollRatio = Math.max(0, Math.min(1, content.scrollTop / scrollableHeight));
        const startOffset = (pathLength - thumbLength) * scrollRatio;
        const endOffset = startOffset + thumbLength;

        const points = [];
        for (let i = 0; i <= SEGMENTS; i++) {
          const t = startOffset + ((endOffset - startOffset) / SEGMENTS) * i;
          const p = trackPath.getPointAtLength(t);
          points.push(`${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
        }

        const segmentD = `M ${points[0]} ${points.slice(1).map((pt) => `L ${pt}`).join(' ')}`;
        thumbPath.setAttribute('d', segmentD);
      }

      thumbPath.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragging = true;
        pointerId = e.pointerId;
        try { thumbPath.setPointerCapture(pointerId); } catch {}
      });

      window.addEventListener('pointermove', (e) => {
        if (!dragging || e.pointerId !== pointerId) return;
        const rect = container.getBoundingClientRect();
        let ratio = (e.clientY - rect.top) / rect.height;
        ratio = Math.max(0, Math.min(1, ratio));
        content.scrollTop = ratio * (content.scrollHeight - content.clientHeight);
        updateThumb();
      });

      window.addEventListener('pointerup', (e) => {
        if (!dragging || e.pointerId !== pointerId) return;
        dragging = false;
        try { thumbPath.releasePointerCapture(pointerId); } catch {}
        pointerId = null;
      });

      content.addEventListener('scroll', updateThumb);
      window.addEventListener('resize', updatePath);

      container._updateCurvedScrollbar = updatePath;
      updatePath();
    }

    document.querySelectorAll('[data-scrollbar]').forEach((container) => {
      initCurvedScrollbar(container);
    });
  }

  initCurvedScrollbars();
  initProjectFeatureShowcase();
  initRotatingText();
  animateAmbient();
});
