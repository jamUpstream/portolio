// ── Custom Cursor ──
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0, curX = 0, curY = 0;
document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px'; cursorDot.style.top = mouseY + 'px';
});
(function animateCursor() {
    curX += (mouseX - curX) * .15; curY += (mouseY - curY) * .15;
    cursor.style.left = curX + 'px'; cursor.style.top = curY + 'px';
    requestAnimationFrame(animateCursor);
})();
document.querySelectorAll('a,button,input,textarea').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.width = '32px'; cursor.style.height = '32px'; cursor.style.opacity = '1'; });
    el.addEventListener('mouseleave', () => { cursor.style.width = '18px'; cursor.style.height = '18px'; cursor.style.opacity = '.8'; });
});

// ── Header Height ──
const headerEl = document.querySelector('header');
function setHeaderH() { document.documentElement.style.setProperty('--header-h', `${headerEl.offsetHeight}px`); }
window.addEventListener('load', setHeaderH); window.addEventListener('resize', setHeaderH); setHeaderH();

// ── Back to Top ──
const backToTopButton = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) backToTopButton.classList.add('show');
    else backToTopButton.classList.remove('show');
});
backToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Scroll Reveal ──
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); revealObs.unobserve(e.target); } });
}, { threshold: .08 });
document.querySelectorAll('.scroll-reveal').forEach(el => revealObs.observe(el));

// ── Hover Glow on Cards ──
(function attachHoverGlow() {
    if (!window.matchMedia || !window.matchMedia('(hover:hover)').matches) return;
    document.querySelectorAll('.skill-category,.project-highlight').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%');
            el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%');
        }, { passive: true });
    });
})();

// ── Settings Panel ──
const settingsBtn = document.getElementById('settingsBtn');
const settingsOverlay = document.getElementById('settingsOverlay');
const settingsClose = document.getElementById('settingsClose');
const settingsPanel = document.getElementById('settingsPanel');
const settingsBackdrop = document.getElementById('settingsBackdrop');

let _scrollY = 0;
function lockScroll() {
    // Only lock body scroll on mobile — desktop settings is a dropdown, doesn't need it
    if (window.innerWidth <= 600) {
        _scrollY = window.scrollY;
        document.body.classList.add('scroll-locked');
    }
}
function unlockScroll() {
    if (document.body.classList.contains('scroll-locked')) {
        document.body.classList.remove('scroll-locked');
        window.scrollTo({ top: _scrollY, behavior: 'instant' });
    }
}
function closeSettings() { settingsOverlay.classList.remove('open'); unlockScroll(); }
function openSettings() { settingsOverlay.classList.add('open'); lockScroll(); }

settingsBtn.addEventListener('click', openSettings);
settingsClose.addEventListener('click', closeSettings);
settingsBackdrop.addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click', e => { if (e.target === settingsOverlay) closeSettings(); });

// Settings panel header frost — apply blur only when content scrolls under sticky header
const settingsHeader = settingsPanel.querySelector('.settings-header');
settingsPanel.addEventListener('scroll', () => {
    settingsHeader.classList.toggle('scrolled', settingsPanel.scrollTop > 4);
}, { passive: true });

// Swipe-down to dismiss on mobile
let touchStartY = 0, touchStartScrollTop = 0;
settingsPanel.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
    touchStartScrollTop = settingsPanel.scrollTop;
}, { passive: true });
settingsPanel.addEventListener('touchmove', e => {
    const dy = e.touches[0].clientY - touchStartY;
    // Only dismiss if at top of scroll and dragging down
    if (dy > 0 && touchStartScrollTop === 0) {
        settingsPanel.style.transform = `translateY(${Math.min(dy * 0.5, 120)}px)`;
        settingsPanel.style.transition = 'none';
    }
}, { passive: true });
settingsPanel.addEventListener('touchend', e => {
    const dy = e.changedTouches[0].clientY - touchStartY;
    settingsPanel.style.transition = '';
    settingsPanel.style.transform = '';
    if (dy > 80 && touchStartScrollTop === 0) closeSettings();
}, { passive: true });

// ── Helpers ──
const root = document.documentElement;
function saveSetting(key, val) {
    try { localStorage.setItem('pf_' + key, val); document.dispatchEvent(new Event('settingsChanged')); } catch (e) { }
}
function loadSetting(key) { try { return localStorage.getItem('pf_' + key); } catch (e) { return null; } }

// ── Visual Style (Default / Glass) ──
function updateGlassDepthLayer() {
    const layer = document.getElementById('glass-depth-layer');
    if (!layer) return;
    const accentHex = getComputedStyle(root).getPropertyValue('--accent').trim() || '#00F5A0';
    const aRgb = hexToRgb(accentHex);
    const [ar, ag, ab] = aRgb.split(',');
    layer.style.cssText = [
        'display:block',
        'position:fixed',
        'inset:0',
        'pointer-events:none',
        'z-index:0',
        'background:' + [
            `radial-gradient(ellipse 75% 55% at 12% 18%, rgba(${ar},${ag},${ab},0.13) 0%, transparent 55%)`,
            `radial-gradient(ellipse 60% 45% at 88% 80%, rgba(0,140,255,0.11) 0%, transparent 55%)`,
            `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,255,255,0.07) 0%, transparent 60%)`,
            `radial-gradient(ellipse 40% 35% at 25% 70%, rgba(${ar},${ag},${ab},0.08) 0%, transparent 50%)`,
            `radial-gradient(ellipse 50% 40% at 78% 20%, rgba(80,80,255,0.08) 0%, transparent 50%)`,
            `radial-gradient(ellipse 30% 25% at 60% 85%, rgba(255,255,255,0.05) 0%, transparent 45%)`
        ].join(',')
    ].join(';');
}

function ensureGlassDepthLayer(style) {
    const layer = document.getElementById('glass-depth-layer');
    if (!layer) return;
    if (style === 'glass') {
        updateGlassDepthLayer();
    } else {
        // Clear all inline styles so the element is invisible in default mode
        layer.style.cssText = '';
    }
}

function applyVisualStyle(style) {
    if (style === 'glass') {
        root.setAttribute('data-visual', 'glass');
    } else {
        root.removeAttribute('data-visual');
    }
    ensureGlassDepthLayer(style);
    document.querySelectorAll('.visual-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.visual === style)
    );
}

// Visual style buttons
document.querySelectorAll('.visual-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        applyVisualStyle(btn.dataset.visual);
        saveSetting('visual', btn.dataset.visual);
    });
});
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const n = parseInt(hex, 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

// ── Apply Accent ──
function applyAccent(accent, dim) {
    const rgb = hexToRgb(accent);
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-dim', dim || accent);
    root.style.setProperty('--accent-bg', `rgba(${rgb},.1)`);
    root.style.setProperty('--accent-bg-md', `rgba(${rgb},.25)`);
    root.style.setProperty('--accent-bg-xs', `rgba(${rgb},.05)`);
    root.style.setProperty('--accent-border', `rgba(${rgb},.2)`);
    root.style.setProperty('--accent-border-strong', `rgba(${rgb},.3)`);
    root.style.setProperty('--accent-glow', `rgba(${rgb},.4)`);
    root.style.setProperty('--accent-shadow', `rgba(${rgb},.1)`);
    root.style.setProperty('--accent-shadow-lg', `rgba(${rgb},.3)`);
    applyBgEffect(currentBgEffect, rgb);
    // Keep glass depth layer in sync with accent color changes
    try { updateGlassDepthLayer(); } catch(e) {}
}

// ── Background Effects ──
let currentBgEffect = 'grid';
function applyBgEffect(type, rgb) {
    currentBgEffect = type;
    // Remove the pre-apply style injected before first paint (no longer needed)
    var preApply = document.getElementById('_preApplyBg');
    if (preApply) preApply.parentNode.removeChild(preApply);
    let styleEl = document.getElementById('bg-effect-style');
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'bg-effect-style'; document.head.appendChild(styleEl); }
    const parts = (rgb || '0,245,160').split(',').map(n => parseInt(n, 10));
    const r = parts[0] || 0, g = parts[1] || 0, b = parts[2] || 0;
    const srgb = [r, g, b].map(v => { v = v / 255; return v <= 0.04045 ? (v / 12.92) : Math.pow((v + 0.055) / 1.055, 2.4); });
    const lum = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
    const ga = clamp(0.06 + (0.14 * (1 - lum)), 0.06, 0.18).toFixed(2);
    const da = clamp(0.18 + (0.30 * (1 - lum)), 0.18, 0.48).toFixed(2);
    const wa1 = clamp(0.04 + (0.10 * (1 - lum)), 0.04, 0.16).toFixed(2);
    const wa2 = clamp(0.02 + (0.08 * (1 - lum)), 0.02, 0.12).toFixed(2);
    const effects = {
        grid: `body::before { background-image:linear-gradient(90deg,rgba(${r},${g},${b},${ga}) 1px,transparent 1px),linear-gradient(rgba(${r},${g},${b},${ga}) 1px,transparent 1px) !important; background-size:50px 50px !important; opacity:1 !important; animation:none !important; }`,
        dots: `body::before { background-image:radial-gradient(circle,rgba(${r},${g},${b},${da}) 1px,transparent 1px) !important; background-size:28px 28px !important; opacity:1 !important; animation:none !important; }`,
        waves: `body::before { opacity: 0 !important; animation: none !important; }`,
        none: `body::before { opacity:0 !important; animation:none !important; }`,
        circuit: `@keyframes circuitPulse{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}} body::before { background-image:linear-gradient(90deg,rgba(${r},${g},${b},${ga}) 1px,transparent 1px),linear-gradient(rgba(${r},${g},${b},${ga}) 1px,transparent 1px),radial-gradient(circle,rgba(${r},${g},${b},0.35) 1.5px,transparent 1.5px) !important; background-size:40px 40px,40px 40px,40px 40px !important; background-position:0 0,0 0,20px 20px !important; opacity:1 !important; animation:circuitPulse 4s ease-in-out infinite !important; }`,
        hex: `body::before { opacity:0 !important; }`,
        scanlines: `body::before { background-image:repeating-linear-gradient(0deg,rgba(${r},${g},${b},0.04) 0px,rgba(${r},${g},${b},0.04) 1px,transparent 1px,transparent 4px) !important; background-size:100% 4px !important; opacity:1 !important; animation:none !important; }`,
        crosshatch: `@keyframes crosshatchMove{0%{background-position:0 0,0 0}100%{background-position:28px 28px,-28px 28px}} body::before { background-image:repeating-linear-gradient(45deg,rgba(${r},${g},${b},${wa1}) 0,rgba(${r},${g},${b},${wa1}) 1px,transparent 1px,transparent 14px),repeating-linear-gradient(-45deg,rgba(${r},${g},${b},${wa1}) 0,rgba(${r},${g},${b},${wa1}) 1px,transparent 1px,transparent 14px) !important; background-size:20px 20px !important; opacity:1 !important; animation:crosshatchMove 10s linear infinite !important; }`,
        stars: `
                /* Use canvas-based starfield for true random shimmer */
                body::before {
                    opacity: 0 !important;
                    animation: none !important;
                    background-image: none !important;
                }`,
        mesh: `@keyframes meshShift{0%{background-position:0% 0%,100% 100%,50% 50%}50%{background-position:100% 0%,0% 100%,50% 0%}100%{background-position:0% 0%,100% 100%,50% 50%}} body::before { background-image:radial-gradient(ellipse at 20% 20%,rgba(${r},${g},${b},0.12) 0%,transparent 60%),radial-gradient(ellipse at 80% 80%,rgba(${r},${g},${b},0.08) 0%,transparent 60%) !important; background-size:100% 100% !important; opacity:1 !important; animation:meshShift 8s ease-in-out infinite !important; }`,
        aurora: `@keyframes auroraMove{0%{background-position:0% 50%,100% 50%,50% 0%}33%{background-position:100% 0%,0% 100%,80% 50%}66%{background-position:50% 100%,50% 0%,20% 100%}100%{background-position:0% 50%,100% 50%,50% 0%}} body::before { background-image:radial-gradient(ellipse 80% 40% at 20% 60%,rgba(${r},${g},${b},0.14) 0%,transparent 70%),radial-gradient(ellipse 60% 50% at 80% 30%,rgba(${Math.floor(b * 0.5 + r * 0.5)},${Math.floor(g * 0.3)},${b},0.10) 0%,transparent 70%),radial-gradient(ellipse 50% 60% at 50% 80%,rgba(${r},${Math.floor(g * 0.6 + b * 0.4)},${b},0.08) 0%,transparent 60%) !important; background-size:200% 200%,200% 200%,200% 200% !important; opacity:1 !important; animation:auroraMove 12s ease-in-out infinite !important; }`,
        rain: `body::before { opacity:0 !important; }`,
        plasma: `@keyframes plasmaFlow{0%{filter:hue-rotate(0deg) brightness(1)}50%{filter:hue-rotate(30deg) brightness(1.1)}100%{filter:hue-rotate(0deg) brightness(1)}} body::before { background-image:radial-gradient(ellipse 120% 80% at 10% 90%,rgba(${r},${g},${b},0.18) 0%,transparent 50%),radial-gradient(ellipse 80% 120% at 90% 10%,rgba(${b},${r},${Math.floor(g * 0.5)},0.12) 0%,transparent 50%),radial-gradient(ellipse 60% 60% at 50% 50%,rgba(${Math.floor(r * 0.3)},${g},${b},0.08) 0%,transparent 70%),radial-gradient(ellipse 100% 40% at 80% 80%,rgba(${r},${Math.floor(g * 0.4)},${b},0.10) 0%,transparent 60%) !important; background-size:100% 100% !important; opacity:1 !important; animation:plasmaFlow 6s ease-in-out infinite !important; }`,
        matrix: `body::before { opacity:0 !important; }`,
        noise: `@keyframes noiseShimmer{0%{opacity:.8}50%{opacity:1}100%{opacity:.8}} body::before { background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E"),radial-gradient(circle at 20% 80%,rgba(${r},${g},${b},0.06) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(${r},${g},${b},0.04) 0%,transparent 50%) !important; background-size:200px 200px,100% 100%,100% 100% !important; opacity:1 !important; animation:noiseShimmer 4s ease-in-out infinite !important; }`
    };
    styleEl.textContent = effects[type] || effects.grid;

    // Canvas starfield (randomized shimmer)
    if (type === 'stars') {
        enableStars(rgb);
    } else {
        disableStars();
    }

    // Canvas waves (animated sine lines)
    if (type === 'waves') {
        enableWaves(rgb);
    } else {
        disableWaves();
    }

    // ── Canvas-based effects: Matrix, Rain & Hex ──
    let matrixCanvas = document.getElementById('matrix-canvas');
    let rainCanvas = document.getElementById('rain-canvas');
    let hexCanvas = document.getElementById('hex-canvas');

    if (type === 'matrix') {
        if (rainCanvas) { rainCanvas.style.display = 'none'; stopRainCanvas(); }
        if (hexCanvas) { hexCanvas.style.display = 'none'; stopHexCanvas(); }
        if (!matrixCanvas) {
            matrixCanvas = document.createElement('canvas');
            matrixCanvas.id = 'matrix-canvas';
            matrixCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.18;';
            document.body.prepend(matrixCanvas);
        }
        matrixCanvas.style.display = 'block';
        startMatrixCanvas(matrixCanvas);
    } else if (type === 'rain') {
        if (matrixCanvas) { matrixCanvas.style.display = 'none'; stopMatrixCanvas(); }
        if (hexCanvas) { hexCanvas.style.display = 'none'; stopHexCanvas(); }
        if (!rainCanvas) {
            rainCanvas = document.createElement('canvas');
            rainCanvas.id = 'rain-canvas';
            rainCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
            document.body.prepend(rainCanvas);
        }
        rainCanvas.style.display = 'block';
        startRainCanvas(rainCanvas);
    } else if (type === 'hex') {
        if (matrixCanvas) { matrixCanvas.style.display = 'none'; stopMatrixCanvas(); }
        if (rainCanvas) { rainCanvas.style.display = 'none'; stopRainCanvas(); }
        if (!hexCanvas) {
            hexCanvas = document.createElement('canvas');
            hexCanvas.id = 'hex-canvas';
            hexCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
            document.body.prepend(hexCanvas);
        }
        hexCanvas.style.display = 'block';
        startHexCanvas(hexCanvas, rgb);
    } else {
        if (matrixCanvas) { matrixCanvas.style.display = 'none'; stopMatrixCanvas(); }
        if (rainCanvas) { rainCanvas.style.display = 'none'; stopRainCanvas(); }
        if (hexCanvas) { hexCanvas.style.display = 'none'; stopHexCanvas(); }
    }
}

// ── STARFIELD (CANVAS) ──
const starsCanvas = document.getElementById('starsCanvas');
const starsCtx = starsCanvas ? starsCanvas.getContext('2d', { alpha: true }) : null;

let starsRAF = null;
let stars = [];
let starsDpr = 1;

function resizeStarsCanvas() {
    if (!starsCanvas || !starsCtx) return;
    starsDpr = 1;
    const w = Math.floor(window.innerWidth * starsDpr);
    const h = Math.floor(window.innerHeight * starsDpr);
    if (starsCanvas.width !== w || starsCanvas.height !== h) {
        starsCanvas.width = w;
        starsCanvas.height = h;
    }
}

function seededRand(seed) {
    let x = seed >>> 0;
    return function () {
        x ^= x << 13; x >>>= 0;
        x ^= x >> 17; x >>>= 0;
        x ^= x << 5; x >>>= 0;
        return (x >>> 0) / 4294967296;
    };
}

function buildStars(rgb) {
    if (!starsCanvas || !starsCtx) return;
    resizeStarsCanvas();
    const [r, g, b] = (rgb || '255,200,80').split(',').map(n => parseInt(n, 10));
    const w = starsCanvas.width;
    const h = starsCanvas.height;
    const area = (w * h) / (starsDpr * starsDpr);
    const count = Math.floor(Math.max(220, Math.min(950, area / 2600)));
    const rand = seededRand((Date.now() ^ (w << 1) ^ (h << 2)) >>> 0);
    stars = [];
    for (let i = 0; i < count; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const tier = rand();
        const radius = tier < 0.78 ? (0.55 + rand() * 0.85) : tier < 0.95 ? (1.2 + rand() * 1.6) : (2.0 + rand() * 2.8);
        const baseA = tier < 0.78 ? (0.18 + rand() * 0.28) : tier < 0.95 ? (0.25 + rand() * 0.35) : (0.18 + rand() * 0.22);
        const twSpeed = 0.35 + rand() * 1.35;
        const twPhase = rand() * Math.PI * 2;
        const drift = (rand() * 0.35 + 0.08) * (tier < 0.95 ? 1 : 1.6);
        const dx = (rand() < 0.5 ? -1 : 1) * drift;
        const dy = (-0.22 - rand() * 0.55) * drift;
        const isWhite = rand() < 0.28;
        const cr = isWhite ? 255 : (r || 255);
        const cg = isWhite ? 255 : (g || 200);
        const cb = isWhite ? 255 : (b || 80);
        stars.push({ x, y, radius, baseA, twSpeed, twPhase, dx, dy, cr, cg, cb });
    }
}

function drawStar(s, t) {
    const tw = 0.5 + 0.5 * Math.sin(t * s.twSpeed + s.twPhase);
    const shimmer = 0.85 + 0.15 * Math.sin(t * (s.twSpeed * 2.2) + s.twPhase * 1.7);
    const a = Math.max(0, Math.min(1, s.baseA + tw * 0.55 * s.baseA));
    const ctx = starsCtx;
    const x = s.x, y = s.y, r = s.radius;
    const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
    grd.addColorStop(0, `rgba(${s.cr},${s.cg},${s.cb},${a * shimmer})`);
    grd.addColorStop(0.35, `rgba(${s.cr},${s.cg},${s.cb},${a * 0.35})`);
    grd.addColorStop(1, `rgba(${s.cr},${s.cg},${s.cb},0)`);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(${s.cr},${s.cg},${s.cb},${Math.min(1, a + 0.15)})`;
    ctx.fillRect(x, y, 1.2 * starsDpr, 1.2 * starsDpr);
}

function stepStars(ts) {
    if (!starsCanvas || !starsCtx) return;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = ts / 1000;
    const w = starsCanvas.width, h = starsCanvas.height;
    starsCtx.clearRect(0, 0, w, h);
    starsCtx.globalCompositeOperation = 'lighter';
    for (const s of stars) {
        drawStar(s, t);
        if (!reduced) {
            s.x += s.dx * starsDpr;
            s.y += s.dy * starsDpr;
            if (s.x < -20) s.x = w + 20;
            if (s.x > w + 20) s.x = -20;
            if (s.y < -30) s.y = h + 30;
            if (s.y > h + 30) s.y = -30;
        }
    }
    starsCtx.globalCompositeOperation = 'source-over';
    starsRAF = requestAnimationFrame(stepStars);
}

function enableStars(rgb) {
    if (!starsCanvas || !starsCtx) return;
    starsCanvas.style.display = 'block';
    document.body.classList.add('stars-on');
    buildStars(rgb);
    if (!starsRAF) starsRAF = requestAnimationFrame(stepStars);
}

function disableStars() {
    if (!starsCanvas || !starsCtx) return;
    starsCanvas.style.display = 'none';
    document.body.classList.remove('stars-on');
    if (starsRAF) { cancelAnimationFrame(starsRAF); starsRAF = null; }
    starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
}

window.addEventListener('resize', () => {
    if (!document.body.classList.contains('stars-on')) return;
    resizeStarsCanvas();
    buildStars(localStorage.getItem('pf_dim_rgb') || '255,200,80');
}, { passive: true });

// ── WAVES (CANVAS) ──
const wavesCanvas = document.getElementById('wavesCanvas');
const wavesCtx = wavesCanvas ? wavesCanvas.getContext('2d', { alpha: true }) : null;

let wavesRAF = null;
let wavesDpr = 1;
let waveLines = [];
let waveSeed = 0;
let wavesLastTs = 0;
const WAVES_FRAME_MS = 80; // ~12.5fps cap to reduce lag

function resizeWavesCanvas() {
    if (!wavesCanvas || !wavesCtx) return;
    wavesDpr = 1;
    const w = Math.floor(window.innerWidth * wavesDpr);
    const h = Math.floor(window.innerHeight * wavesDpr);
    if (wavesCanvas.width !== w || wavesCanvas.height !== h) {
        wavesCanvas.width = w;
        wavesCanvas.height = h;
    }
}

function buildWaves(rgb) {
    if (!wavesCanvas || !wavesCtx) return;
    resizeWavesCanvas();
    const w = wavesCanvas.width, h = wavesCanvas.height;
    waveSeed = (Date.now() ^ (w << 1) ^ (h << 2)) >>> 0;
    const rand = seededRand(waveSeed);
    const parts = (rgb || '0,245,160').split(',').map(n => parseInt(n, 10));
    const cr = parts[0] || 0, cg = parts[1] || 245, cb = parts[2] || 160;
    const logicalH = h / wavesDpr;

    // Spread lines out but guarantee full vertical coverage (no top/bottom gaps)
    const gap = Math.max(70, Math.min(120, Math.round(logicalH / 10))); // larger spacing = "spread"
    const buffer = gap; // render past edges so waves cover screen during motion
    const count = Math.max(6, Math.ceil((logicalH + buffer * 2) / gap) + 1);
    const startY = -buffer;

    waveLines = [];
    for (let i = 0; i < count; i++) {
        const center = logicalH * 0.5;
        const y = startY + (i * gap) + rand() * 6;
        const centerBias = 1 - Math.min(1, Math.abs(y - center) / (logicalH * 0.55));
        const amp = (4.5 + rand() * 12.0) * (0.6 + centerBias * 0.8);
        const freq = 0.0035 + rand() * 0.0045; // longer wavelength (more "spread")
        const freq2 = freq * (1.6 + rand() * 1.2);
        const speed = 0.25 + rand() * 0.65;
        const speed2 = speed * (0.7 + rand() * 0.9);
        const phase = rand() * Math.PI * 2;
        const phase2 = rand() * Math.PI * 2;
        const baseA = 0.04 + rand() * 0.08;
        const thick = rand() < 0.18 ? (1.4 + rand() * 1.2) : (0.8 + rand() * 0.7);
        const twSpeed = 0.6 + rand() * 1.8;
        const twPhase = rand() * Math.PI * 2;
        waveLines.push({ y, amp, freq, freq2, speed, speed2, phase, phase2, baseA, thick, twSpeed, twPhase, cr, cg, cb });
    }
}

function stepWaves(ts) {
    if (!wavesCanvas || !wavesCtx) return;

    // FPS cap (big performance win on canvas animations)
    if (ts - wavesLastTs < WAVES_FRAME_MS) {
        wavesRAF = requestAnimationFrame(stepWaves);
        return;
    }
    wavesLastTs = ts;

    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = ts / 1000;
    const w = wavesCanvas.width, h = wavesCanvas.height;

    wavesCtx.clearRect(0, 0, w, h);
    wavesCtx.globalCompositeOperation = 'source-over';

    const logicalW = w / wavesDpr;
    for (const ln of waveLines) {
        const tw = 0.55 + 0.45 * Math.sin(t * ln.twSpeed + ln.twPhase);
        const alpha = Math.max(0.02, Math.min(0.22, ln.baseA * (0.7 + tw * 1.2)));
        wavesCtx.lineWidth = ln.thick * wavesDpr;
        wavesCtx.strokeStyle = `rgba(${ln.cr},${ln.cg},${ln.cb},${alpha})`;
        wavesCtx.shadowBlur = 0;
        const step = 52;
        wavesCtx.beginPath();
        for (let x = -40; x <= logicalW + 40; x += step) {
            const xx = x * wavesDpr;
            const yWave = ln.y
                + ln.amp * Math.sin((x * ln.freq) + (reduced ? ln.phase : (ln.phase + t * ln.speed)))
                + (ln.amp * 0.35) * Math.sin((x * ln.freq2) + (reduced ? ln.phase2 : (ln.phase2 + t * ln.speed2)));
            const yy = yWave * wavesDpr;
            if (x === -40) wavesCtx.moveTo(xx, yy);
            else wavesCtx.lineTo(xx, yy);
        }
        wavesCtx.stroke();
    }
    wavesRAF = requestAnimationFrame(stepWaves);
}

function enableWaves(rgb) {
    if (!wavesCanvas || !wavesCtx) return;
    wavesCanvas.style.display = 'block';
    document.body.classList.add('waves-on');
    buildWaves(rgb);
    if (!wavesRAF) wavesRAF = requestAnimationFrame(stepWaves);
}

function disableWaves() {
    if (!wavesCanvas || !wavesCtx) return;
    wavesCanvas.style.display = 'none';
    document.body.classList.remove('waves-on');
    if (wavesRAF) { cancelAnimationFrame(wavesRAF); wavesRAF = null; }
    wavesCtx.clearRect(0, 0, wavesCanvas.width, wavesCanvas.height);
}


document.addEventListener('visibilitychange', () => {
    if (!wavesCanvas || !wavesCtx) return;
    const on = document.body.classList.contains('waves-on');
    if (!on) return;
    if (document.hidden) {
        if (wavesRAF) { cancelAnimationFrame(wavesRAF); wavesRAF = null; }
    } else {
        wavesLastTs = 0;
        if (!wavesRAF) wavesRAF = requestAnimationFrame(stepWaves);
    }
}, { passive: true });

window.addEventListener('resize', () => {
    if (!document.body.classList.contains('waves-on')) return;
    resizeWavesCanvas();
    buildWaves(localStorage.getItem('pf_dim_rgb') || '0,245,160');
}, { passive: true });

// ── Matrix Canvas ──
let _matrixRaf = null;
function stopMatrixCanvas() { if (_matrixRaf) { cancelAnimationFrame(_matrixRaf); _matrixRaf = null; } }
function startMatrixCanvas(canvas) {
    stopMatrixCanvas();
    const ctx = canvas.getContext('2d');
    const chars = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF';
    const fontSize = 14;
    let cols, drops;
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        cols = Math.floor(canvas.width / fontSize);
        drops = Array.from({ length: cols }, () => Math.random() * -canvas.height / fontSize);
    }
    resize();
    window.addEventListener('resize', resize);
    let lastTime = 0;
    function draw(ts) {
        _matrixRaf = requestAnimationFrame(draw);
        if (ts - lastTime < 50) return;
        lastTime = ts;
        const acRgb = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00F5A0');
        const pRgb = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#0A0E27');
        ctx.fillStyle = `rgba(${pRgb},0.05)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < cols; i++) {
            const y = drops[i] * fontSize;
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = `${fontSize}px monospace`;
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, y);
            ctx.fillStyle = `rgba(${acRgb},0.85)`;
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, y - fontSize);
            if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
            else drops[i] += 0.5;
        }
    }
    _matrixRaf = requestAnimationFrame(draw);
}

// ── Rain Canvas ──
let _rainRaf = null;
function stopRainCanvas() { if (_rainRaf) { cancelAnimationFrame(_rainRaf); _rainRaf = null; } }
function startRainCanvas(canvas) {
    stopRainCanvas();
    const ctx = canvas.getContext('2d');
    let drops = [];
    function mkDrop(randomY) {
        const len = 40 + Math.random() * 120;
        const speed = 0.8 + Math.random() * 1.6;  // slowed down
        return {
            x: Math.random() * canvas.width,
            y: randomY ? Math.random() * canvas.height : -len - Math.random() * 200,
            len, speed,
            alpha: 0.25 + Math.random() * 0.55,
            width: 0.5 + Math.random() * 1
        };
    }
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drops = Array.from({ length: Math.floor(canvas.width / 14) }, () => mkDrop(true));
    }
    resize();
    window.addEventListener('resize', resize);
    let _rainLastTime = 0;
    function draw(ts) {
        _rainRaf = requestAnimationFrame(draw);
        if (ts - _rainLastTime < 33) return; // ~30fps cap
        _rainLastTime = ts;
        const acRgb = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00F5A0');
        const pRgb = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#0A0E27');
        ctx.fillStyle = `rgba(${pRgb},0.35)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < drops.length; i++) {
            const d = drops[i];
            const grad = ctx.createLinearGradient(d.x, d.y - d.len, d.x, d.y);
            grad.addColorStop(0, `rgba(${acRgb},0)`);
            grad.addColorStop(0.6, `rgba(${acRgb},${(d.alpha * 0.4).toFixed(2)})`);
            grad.addColorStop(0.92, `rgba(${acRgb},${d.alpha.toFixed(2)})`);
            grad.addColorStop(1, `rgba(255,255,255,${Math.min(d.alpha + 0.3, 1).toFixed(2)})`);
            ctx.beginPath(); ctx.moveTo(d.x, d.y - d.len); ctx.lineTo(d.x, d.y);
            ctx.strokeStyle = grad; ctx.lineWidth = d.width; ctx.stroke();
            ctx.beginPath(); ctx.arc(d.x, d.y, d.width * 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${Math.min(d.alpha + 0.2, 0.95).toFixed(2)})`; ctx.fill();
            d.y += d.speed;
            if (d.y - d.len > canvas.height) drops[i] = mkDrop(false);
        }
    }
    _rainRaf = requestAnimationFrame(draw);
}

// ── Hex Canvas Animation ──
let _hexRaf = null;
function stopHexCanvas() {
    if (_hexRaf) { cancelAnimationFrame(_hexRaf); _hexRaf = null; }
}
function startHexCanvas(canvas, rgb) {
    stopHexCanvas();
    const ctx = canvas.getContext('2d');

    const HEX_SIZE = 32;
    const HEX_W = HEX_SIZE * 2;
    const HEX_H = Math.sqrt(3) * HEX_SIZE;
    const COL_W = HEX_W * 0.75;

    let cols, rows, hexes, W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        cols = Math.ceil(W / COL_W) + 2;
        rows = Math.ceil(H / HEX_H) + 2;
        hexes = [];
        for (let c = 0; c < cols; c++) {
            for (let rr = 0; rr < rows; rr++) {
                const x = c * COL_W;
                const y = rr * HEX_H + (c % 2 === 1 ? HEX_H / 2 : 0);
                hexes.push({
                    x, y,
                    phase: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.0008 + Math.random() * 0.0018,
                    glowPhase: Math.random() * Math.PI * 2,
                    lit: Math.random() < 0.02,
                    litTimer: Math.random() * 500,
                    litDuration: 120 + Math.random() * 220,
                    edgeBright: Math.random() < 0.06,
                });
            }
        }
    }
    resize();
    window.addEventListener('resize', resize);

    function hexPath(cx, cy, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 180) * (60 * i);
            const px = cx + size * Math.cos(angle);
            const py = cy + size * Math.sin(angle);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
    }

    let frame = 0;
    let _hexLastTime = 0;
    function draw(ts) {
        _hexRaf = requestAnimationFrame(draw);
        if (ts - _hexLastTime < 33) return; // ~30fps cap
        _hexLastTime = ts;
        frame++;

        const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00F5A0';
        const acRgb = hexToRgb(accentHex);
        const [ar, ag, ab] = acRgb.split(',').map(Number);

        ctx.clearRect(0, 0, W, H);

        for (let i = 0; i < hexes.length; i++) {
            const h = hexes[i];
            h.phase += h.pulseSpeed;

            h.litTimer++;
            if (h.lit && h.litTimer > h.litDuration) {
                h.lit = false;
                h.litTimer = 0;
                h.litDuration = 400 + Math.random() * 600;
            } else if (!h.lit && h.litTimer > h.litDuration) {
                if (Math.random() < 0.0005) {
                    h.lit = true;
                    h.litTimer = 0;
                    h.litDuration = 80 + Math.random() * 160;
                } else {
                    h.litTimer = h.litDuration - 10;
                }
            }

            const baseGlow = (Math.sin(h.phase) * 0.5 + 0.5);
            const litGlow = h.lit ? (Math.sin(h.litTimer / h.litDuration * Math.PI)) : 0;
            const totalGlow = Math.max(baseGlow * 0.35, litGlow);

            if (litGlow > 0.05) {
                hexPath(h.x, h.y, HEX_SIZE - 1);
                ctx.fillStyle = `rgba(${ar},${ag},${ab},${(litGlow * 0.06).toFixed(3)})`;
                ctx.fill();
            }

            hexPath(h.x, h.y, HEX_SIZE - 0.5);
            const edgeAlpha = h.edgeBright
                ? (0.12 + totalGlow * 0.45).toFixed(3)
                : (0.04 + totalGlow * 0.12).toFixed(3);

            if (h.lit) {
                ctx.strokeStyle = `rgba(${ar},${ag},${ab},${(0.2 + litGlow * 0.6).toFixed(3)})`;
                ctx.lineWidth = 1 + litGlow * 1.5;
                ctx.shadowColor = `rgba(${ar},${ag},${ab},${(litGlow * 0.8).toFixed(2)})`;
                ctx.shadowBlur = 8 + litGlow * 12;
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else {
                ctx.strokeStyle = `rgba(${ar},${ag},${ab},${edgeAlpha})`;
                ctx.lineWidth = 0.6 + baseGlow * 0.3;
                ctx.stroke();
            }

            if (h.edgeBright && baseGlow > 0.7) {
                for (let v = 0; v < 6; v++) {
                    const angle = (Math.PI / 180) * (60 * v);
                    const vx = h.x + HEX_SIZE * Math.cos(angle);
                    const vy = h.y + HEX_SIZE * Math.sin(angle);
                    ctx.beginPath();
                    ctx.arc(vx, vy, 1, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${ar},${ag},${ab},${(baseGlow * 0.5).toFixed(2)})`;
                    ctx.fill();
                }
            }
        }

        // Travelling pulse wave
        const waveX = (frame * 0.4) % (W + 200) - 100;
        const waveY = (frame * 0.18) % (H + 200) - 100;
        for (let i = 0; i < hexes.length; i++) {
            const h = hexes[i];
            const dx = h.x - waveX;
            const dy = h.y - waveY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const waveR = 180;
            if (dist < waveR) {
                const intensity = (1 - dist / waveR) * 0.18;
                hexPath(h.x, h.y, HEX_SIZE - 0.5);
                ctx.strokeStyle = `rgba(${ar},${ag},${ab},${intensity.toFixed(3)})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
    }
    _hexRaf = requestAnimationFrame(draw);
}

// ── Color Swatches ──
document.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
        document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        applyAccent(sw.dataset.accent, sw.dataset.dim);
        document.getElementById('customAccent').value = sw.dataset.accent;
        saveSetting('accent', sw.dataset.accent); saveSetting('dim', sw.dataset.dim);
    });
});

// ── Custom Color Picker ──
document.getElementById('customAccent').addEventListener('input', function () {
    applyAccent(this.value, this.value);
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    saveSetting('accent', this.value); saveSetting('dim', this.value);
});

// ── Background Themes ──
const themes = {
    dark: { primary: '#0A0E27', secondary: '#1A1F3A', border: '#27273A' },
    black: { primary: '#000000', secondary: '#0D0D0D', border: '#1A1A1A' },
    navy: { primary: '#0F172A', secondary: '#1E293B', border: '#334155' },
    slate: { primary: '#1E1E2E', secondary: '#2A2A3E', border: '#3A3A52' },
    forest: { primary: '#0D1F0D', secondary: '#162616', border: '#243824' },
    midnight: { primary: '#0D0D1F', secondary: '#16163A', border: '#252550' },
    volcano: { primary: '#1A0A00', secondary: '#2D1200', border: '#3D1500' },
    abyss: { primary: '#020C10', secondary: '#071A24', border: '#0A2535' },
    obsidian: { primary: '#13111C', secondary: '#1E1B2E', border: '#2D2840' },
    dusk: { primary: '#1C0F22', secondary: '#2E1A38', border: '#3A1F4A' },
};
document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const t = themes[btn.dataset.theme];
        root.style.setProperty('--primary', t.primary);
        root.style.setProperty('--secondary', t.secondary);
        root.style.setProperty('--border', t.border);
        saveSetting('theme', btn.dataset.theme);
    });
});

// ── Background Effects Buttons ──
document.querySelectorAll('[data-bg]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-bg]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const accentNow = getComputedStyle(root).getPropertyValue('--accent').trim() || '#00F5A0';
        applyBgEffect(btn.dataset.bg, hexToRgb(accentNow));
        saveSetting('bgEffect', btn.dataset.bg);
    });
});

// ── Reset ──
document.getElementById('settingsReset').addEventListener('click', () => {
    ['accent', 'dim', 'theme', 'bgEffect', 'visual'].forEach(k => { try { localStorage.removeItem('pf_' + k); } catch (e) { } });
    // Store reset signal so buildPortfolioUrl encodes it after reload
    try { localStorage.setItem('pf_resetPending', '1'); } catch (e) { }
    try { location.reload(); } catch (e) { }
});

// ── Back-to-Portfolio link: encode current settings into URL ──
(function () {
    const PORTFOLIO = 'https://james-tercenio-portfolio.vercel.app/';
    const backLink = document.getElementById('backToPortfolio');
    if (!backLink) return;

    function buildPortfolioUrl() {
        // If a reset was just triggered, signal portfolio to reset too
        try {
            if (localStorage.getItem('pf_resetPending') === '1') {
                localStorage.removeItem('pf_resetPending');
                backLink.href = PORTFOLIO + '?reset=1';
                return;
            }
        } catch (e) { }

        const p = new URLSearchParams();
        const a = loadSetting('accent');
        const d = loadSetting('dim');
        const t = loadSetting('theme');
        const b = loadSetting('bgEffect');
        const v = loadSetting('visual') || 'default'; // always send visual so portfolio syncs correctly
        if (a) p.set('accent', a);
        if (d) p.set('dim', d);
        if (t) p.set('theme', t);
        if (b) p.set('bg', b);
        p.set('visual', v); // always include — portfolio needs this to turn glass OFF
        const qs = p.toString();
        backLink.href = qs ? PORTFOLIO + '?' + qs : PORTFOLIO;
    }

    buildPortfolioUrl();

    // Rebuild whenever settings change
    document.addEventListener('settingsChanged', buildPortfolioUrl);
})();

// ── Load Saved Settings ──
(function loadSaved() {
    const accent = loadSetting('accent');
    const dim = loadSetting('dim');
    const theme = loadSetting('theme');
    const bgEffect = loadSetting('bgEffect');
    const visual = loadSetting('visual');
    if (accent) {
        applyAccent(accent, dim || accent);
        document.getElementById('customAccent').value = accent;
        document.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s.dataset.accent === accent));
    }
    if (theme && themes[theme]) {
        const t = themes[theme];
        root.style.setProperty('--primary', t.primary);
        root.style.setProperty('--secondary', t.secondary);
        root.style.setProperty('--border', t.border);
        document.querySelectorAll('[data-theme]').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
    }
    if (bgEffect) {
        currentBgEffect = bgEffect;
        const accentNow = accent || '#00F5A0';
        applyBgEffect(bgEffect, hexToRgb(accentNow));
        document.querySelectorAll('[data-bg]').forEach(b => b.classList.toggle('active', b.dataset.bg === bgEffect));
    }
    if (visual) {
        applyVisualStyle(visual);
    }
})();

// ── Hover Glow on Cards ──
(function attachHoverGlow() {
    if (!window.matchMedia || !window.matchMedia('(hover:hover)').matches) return;
    document.querySelectorAll('.skill-category,.project-highlight').forEach(el => {
        el.addEventListener('mousemove', e => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100).toFixed(2) + '%');
            el.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100).toFixed(2) + '%');
        }, { passive: true });
    });
})();


// ── Print Fix: disable canvas background effects while printing ──
(function () {
    const _printState = {
        canvasDisplays: new Map(),
        bgEffect: null
    };

    function hideAllCanvases() {
        document.querySelectorAll('canvas').forEach(c => {
            if (!_printState.canvasDisplays.has(c)) {
                _printState.canvasDisplays.set(c, c.style.display || '');
            }
            c.style.display = 'none';
        });
    }

    function restoreAllCanvases() {
        _printState.canvasDisplays.forEach((disp, c) => {
            if (c && c.style) c.style.display = disp;
        });
        _printState.canvasDisplays.clear();
    }

    function beforePrint() {
        try {
            // close settings if open to avoid fixed overlays in print
            if (typeof closeSettings === 'function') closeSettings();
        } catch (e) { }

        try { _printState.bgEffect = (typeof currentBgEffect !== 'undefined') ? currentBgEffect : null; } catch (e) { _printState.bgEffect = null; }

        // Stop any running canvas loops/effects
        try { if (typeof disableWaves === 'function') disableWaves(); } catch (e) { }
        try { if (typeof disableStars === 'function') disableStars(); } catch (e) { }
        try { if (typeof stopMatrixCanvas === 'function') stopMatrixCanvas(); } catch (e) { }
        try { if (typeof stopRainCanvas === 'function') stopRainCanvas(); } catch (e) { }

        // Force-hide any canvases (including dynamically created ones)
        hideAllCanvases();
    }

    function afterPrint() {
        // Restore canvases and re-apply the saved background effect if needed
        restoreAllCanvases();
        try {
            const accent = (typeof loadSetting === 'function' && loadSetting('accent')) ? loadSetting('accent') : (getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#00F5A0').trim();
            const rgb = (typeof hexToRgb === 'function') ? hexToRgb(accent) : '0,245,160';
            const bg = (typeof loadSetting === 'function' && loadSetting('bgEffect')) ? loadSetting('bgEffect') : (_printState.bgEffect || 'grid');
            if (typeof applyBgEffect === 'function') applyBgEffect(bg, rgb);
        } catch (e) { }
    }

    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);

    // Use this for the button to ensure the state toggles even if browser skips beforeprint in preview.
    window.handlePrint = function () {
        beforePrint();
        window.print();
        // afterPrint fires via the event listener, but call it here too as a fallback
        setTimeout(afterPrint, 500);
    };
})();
