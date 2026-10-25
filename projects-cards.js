// projects-cards.js: one bespoke, living visual per project card.
// Each visual is plain SVG driven by a small tick() function; a shared loop only runs the ones on screen.

const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS = 'http://www.w3.org/2000/svg';
const C = { cyan: '#3cd6f0', amber: '#f5b84c', coral: '#ff7a59', green: '#5fcf8f', water: '#1f5f8f', muted: '#97abc6', line: '#1d2f50', text: '#e8eef6' };

function el(tag, attrs = {}, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
}
function rng(seed) {
    return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const smooth = t => t * t * (3 - 2 * t);
function noise1(x) {
    const i = Math.floor(x), f = x - i;
    const h = n => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
    return lerp(h(i), h(i + 1), smooth(f));
}
function label(parent, x, y, text, opts = {}) {
    const t = el('text', {
        x, y,
        'font-family': 'JetBrains Mono, monospace',
        'font-size': opts.size || 9,
        fill: opts.fill || C.muted,
        'text-anchor': opts.anchor || 'start',
        'letter-spacing': opts.ls || 0.5
    }, parent);
    t.textContent = text;
    return t;
}

/* --------------------------------------------------------------------------
   1. Building change detection: before/after swipe
   -------------------------------------------------------------------------- */
function vizChange(svg, id) {
    const W = 800, H = 260;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const defs = el('defs', {}, svg);
    const clip = el('clipPath', { id: `after-${id}` }, defs);
    const clipRect = el('rect', { x: 400, y: 0, width: 400, height: H }, clip);

    // Shared ground: parcels, roads and vegetation
    function ground(g, tint) {
        // Same seed for both dates so trees and roads line up; only the buildings change
        const gr = rng(42);
        el('rect', { width: W, height: H, fill: tint }, g);
        for (let i = 0; i < 9; i++) el('circle', { cx: gr() * W, cy: gr() * H, r: 18 + gr() * 26, fill: '#12302a', opacity: 0.55 }, g);
        el('path', { d: `M0 92 L${W} 70`, stroke: '#2a3a4f', 'stroke-width': 14 }, g);
        el('path', { d: `M0 196 L${W} 182`, stroke: '#2a3a4f', 'stroke-width': 10 }, g);
        el('path', { d: `M240 0 L262 ${H}`, stroke: '#2a3a4f', 'stroke-width': 12 }, g);
        el('path', { d: `M560 0 L548 ${H}`, stroke: '#2a3a4f', 'stroke-width': 10 }, g);
    }
    const lots = [];
    const rr = rng(7);
    for (let i = 0; i < 26; i++) {
        const x = 20 + rr() * 740, y = 14 + rr() * 220, w = 22 + rr() * 26, h = 18 + rr() * 22;
        const nearRoad = [80, 188].some(ry => Math.abs(y + h / 2 - ry) < 18) || [251, 554].some(rx => Math.abs(x + w / 2 - rx) < 20);
        if (!nearRoad) lots.push({ x, y, w, h, shade: 0.5 + rr() * 0.5 });
    }
    const demolished = 3, extended = 8;
    const fresh = [{ x: 300, y: 120, w: 46, h: 34 }, { x: 640, y: 110, w: 38, h: 40 }, { x: 470, y: 26, w: 52, h: 30 }];

    const before = el('g', {}, svg);
    ground(before, '#0c1a22');
    lots.forEach(l => el('rect', { x: l.x, y: l.y, width: l.w, height: l.h, rx: 2, fill: `rgba(151,171,198,${0.25 + l.shade * 0.3})` }, before));

    const after = el('g', { 'clip-path': `url(#after-${id})` }, svg);
    ground(after, '#0e1d26');
    lots.forEach((l, i) => {
        if (i === demolished) return;
        const w = i === extended ? l.w + 18 : l.w;
        el('rect', { x: l.x, y: l.y, width: w, height: l.h, rx: 2, fill: `rgba(151,171,198,${0.28 + l.shade * 0.3})` }, after);
    });
    fresh.forEach(f => el('rect', { x: f.x, y: f.y, width: f.w, height: f.h, rx: 2, fill: 'rgba(200,210,225,0.7)' }, after));

    // Detections, only visible on the "after" side
    const det = el('g', { 'clip-path': `url(#after-${id})` }, svg);
    const box = (x, y, w, h, color, text) => {
        el('rect', { x: x - 4, y: y - 4, width: w + 8, height: h + 8, fill: 'none', stroke: color, 'stroke-width': 2, rx: 3 }, det);
        el('rect', { x: x - 4, y: y - 17, width: text.length * 6.2 + 8, height: 12, fill: color, rx: 2 }, det);
        label(det, x, y - 8, text, { fill: '#04202a', size: 8.5 });
    };
    fresh.forEach(f => box(f.x, f.y, f.w, f.h, C.coral, 'NEW'));
    const ex = lots[extended];
    box(ex.x + ex.w, ex.y, 18, ex.h, C.amber, 'EXTENSION');
    const dm = lots[demolished];
    el('rect', { x: dm.x, y: dm.y, width: dm.w, height: dm.h, fill: 'none', stroke: C.cyan, 'stroke-dasharray': '4 3', 'stroke-width': 1.5 }, det);
    label(det, dm.x, dm.y + dm.h + 12, 'DEMOLISHED', { fill: C.cyan, size: 8.5 });

    // Swipe handle
    const handle = el('g', {}, svg);
    el('line', { x1: 0, y1: 0, x2: 0, y2: H, stroke: C.text, 'stroke-width': 1.5 }, handle);
    el('circle', { cx: 0, cy: H / 2, r: 14, fill: '#070d1a', stroke: C.text, 'stroke-width': 1.5 }, handle);
    el('path', { d: `M-5 ${H / 2 - 4} l-4 4 l4 4 M5 ${H / 2 - 4} l4 4 l-4 4`, stroke: C.text, fill: 'none', 'stroke-width': 1.5 }, handle);
    label(svg, 14, 20, 'BEFORE · 2021', { fill: C.text });
    label(svg, W - 14, 20, '2024 · AFTER', { fill: C.text, anchor: 'end' });

    let split = 400, target = 400, idle = true, idleT = 0;
    svg.addEventListener('pointermove', e => {
        const b = svg.getBoundingClientRect();
        // Account for the letterboxing when the card is not the same shape as the drawing
        const scale = Math.min(b.width / W, b.height / H);
        const offsetX = (b.width - W * scale) / 2;
        target = clamp((e.clientX - b.left - offsetX) / scale, 20, W - 20);
        idle = false;
    });
    svg.addEventListener('pointerleave', () => { idle = true; });
    svg.style.cursor = 'ew-resize';

    return {
        tick(t, dt) {
            if (idle) { idleT += dt; target = 400 + Math.sin(idleT * 0.6) * 260; }
            split += (target - split) * 0.12;
            clipRect.setAttribute('x', split);
            clipRect.setAttribute('width', W - split);
            handle.setAttribute('transform', `translate(${split} 0)`);
        }
    };
}

/* --------------------------------------------------------------------------
   2. Vicmap M1: records flow through a rules gate into keep / reject / review
   -------------------------------------------------------------------------- */
function vizM1(svg) {
    const W = 400, H = 260;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    el('rect', { width: W, height: H, fill: '#081222' }, svg);
    const LANES = { keep: 62, review: 130, reject: 198 };
    const COL = { keep: C.cyan, review: C.amber, reject: C.coral };

    // Lanes
    Object.entries(LANES).forEach(([k, y]) => {
        el('line', { x1: 210, y1: y, x2: 370, y2: y, stroke: COL[k], 'stroke-opacity': 0.25, 'stroke-dasharray': '2 4' }, svg);
    });
    el('line', { x1: 0, y1: 130, x2: 150, y2: 130, stroke: C.line, 'stroke-width': 18, 'stroke-linecap': 'round' }, svg);
    // Gate
    el('rect', { x: 150, y: 36, width: 8, height: 188, rx: 4, fill: C.cyan, opacity: 0.85 }, svg);
    label(svg, 154, 26, 'RULES', { anchor: 'middle', fill: C.cyan });
    // LLM check and officer on the review lane
    const llm = el('rect', { x: 262, y: 118, width: 24, height: 24, transform: 'rotate(45 274 130)', fill: 'none', stroke: C.amber, 'stroke-width': 1.5 }, svg);
    label(svg, 274, 106, 'LLM', { anchor: 'middle', fill: C.amber });
    const officer = el('g', { transform: 'translate(330 130)' }, svg);
    el('circle', { cx: 0, cy: -8, r: 5, fill: 'none', stroke: C.text, 'stroke-width': 1.4 }, officer);
    el('path', { d: 'M-9 10 q9 -14 18 0', fill: 'none', stroke: C.text, 'stroke-width': 1.4 }, officer);
    label(svg, 330, 158, 'OFFICER', { anchor: 'middle', fill: C.text });

    const tallies = {};
    Object.entries(LANES).forEach(([k, y]) => {
        tallies[k] = { n: 0, node: label(svg, 392, y + 22, `${k.toUpperCase()} 0`, { anchor: 'end', fill: COL[k], size: 8.5 }) };
    });
    label(svg, 12, 248, 'demo flow', { size: 8, fill: '#4c6383' });

    const r = rng(3);
    const pick = () => { const v = r(); return v < 0.58 ? 'keep' : v < 0.82 ? 'reject' : 'review'; };
    const rows = Array.from({ length: 11 }, (_, i) => {
        const g = el('g', {}, svg);
        const rect = el('rect', { x: -17, y: -5, width: 34, height: 10, rx: 2.5 }, g);
        el('line', { x1: -12, y1: 0, x2: 4, y2: 0, stroke: '#070d1a', 'stroke-width': 1.5, opacity: 0.6 }, g);
        return { g, rect, s: i / 11, lane: pick() };
    });

    let fast = false;
    svg.addEventListener('pointerenter', () => { fast = true; });
    svg.addEventListener('pointerleave', () => { fast = false; });

    return {
        tick(t, dt) {
            let llmHot = false, officerHot = false;
            rows.forEach(row => {
                const x0 = -20 + row.s * 430;
                let sp = (fast ? 0.26 : 0.1);
                if (row.lane === 'review' && x0 > 245 && x0 < 300) { sp *= 0.3; llmHot = true; }
                if (row.lane === 'review' && x0 > 310 && x0 < 345) { sp *= 0.45; officerHot = true; }
                row.s += sp * dt;
                if (row.s > 1) {
                    tallies[row.lane].n++;
                    tallies[row.lane].node.textContent = `${row.lane.toUpperCase()} ${tallies[row.lane].n}`;
                    row.s -= 1;
                    row.lane = pick();
                }
                const x = -20 + row.s * 430;
                const k = smooth(clamp((x - 158) / 60, 0, 1));
                const y = lerp(130, LANES[row.lane], k);
                row.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
                row.rect.setAttribute('fill', x < 156 ? '#4c6383' : COL[row.lane]);
            });
            llm.setAttribute('fill', llmHot ? 'rgba(245,184,76,0.35)' : 'none');
            officer.setAttribute('opacity', officerHot ? 1 : 0.55);
        }
    };
}

/* --------------------------------------------------------------------------
   3. Disaster recovery: offline crews capture points, then sync to a dashboard
   -------------------------------------------------------------------------- */
function vizDisaster(svg) {
    const W = 400, H = 260;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    el('rect', { width: W, height: H, fill: '#081222' }, svg);
    const park = 'M40 60 C70 20 170 24 230 40 C300 58 330 40 352 84 C372 126 340 170 300 196 C250 228 160 236 104 214 C52 194 24 150 30 112 Z';
    el('path', { d: park, fill: '#0d2230', stroke: C.cyan, 'stroke-opacity': 0.5, 'stroke-width': 1.2 }, svg);
    for (let k = 1; k <= 3; k++) {
        el('path', { d: park, fill: 'none', stroke: C.cyan, 'stroke-opacity': 0.12, transform: `translate(${200 * (1 - (1 - k * 0.18))} ${130 * (1 - (1 - k * 0.18))}) scale(${1 - k * 0.18})` }, svg);
    }
    el('path', { d: 'M180 52 C230 44 290 70 296 110 C300 140 262 150 236 140 C206 128 170 96 180 52 Z', fill: 'rgba(255,122,89,0.22)', stroke: C.coral, 'stroke-width': 1.2 }, svg);
    label(svg, 238, 98, 'BURN AREA', { fill: C.coral, size: 8 });
    el('path', { d: 'M60 150 C90 130 140 150 160 176 C176 198 130 214 100 206 C70 198 48 176 60 150 Z', fill: 'rgba(60,150,240,0.22)', stroke: '#5aa9ff', 'stroke-width': 1.2 }, svg);
    label(svg, 70, 182, 'FLOOD', { fill: '#5aa9ff', size: 8 });

    // Dashboard
    const dash = el('g', { transform: 'translate(318 14)' }, svg);
    el('rect', { width: 70, height: 46, rx: 4, fill: '#0f1d36', stroke: C.line }, dash);
    const bars = [0, 1, 2, 3].map(i => el('rect', { x: 8 + i * 15, y: 38, width: 10, height: 2, rx: 1, fill: C.cyan }, dash));
    label(dash, 35, 58, 'DASHBOARD', { anchor: 'middle', size: 7.5 });
    const status = label(svg, 14, 248, '', { size: 8.5 });

    const spots = [[90, 90], [130, 70], [210, 70], [250, 120], [280, 90], [120, 120], [180, 150], [230, 180], [290, 160], [96, 170], [150, 196], [320, 120]];
    const pts = spots.map(([x, y]) => {
        const g = el('g', { transform: `translate(${x} ${y})`, opacity: 0 }, svg);
        const ring = el('circle', { r: 4, fill: 'none', stroke: C.cyan, 'stroke-width': 1 }, g);
        const dot = el('circle', { r: 3.4, fill: C.muted }, g);
        const link = el('line', { x1: 0, y1: 0, x2: 353 - x, y2: 37 - y, stroke: C.cyan, 'stroke-width': 0.8, opacity: 0 }, g);
        return { g, ring, dot, link, shown: false, synced: false, flash: 0 };
    });

    let clock = 0, next = 0, synced = 0, forced = false;
    svg.addEventListener('pointerenter', () => { forced = true; });

    function sync() {
        pts.forEach(p => { if (p.shown && !p.synced) { p.synced = true; p.flash = 1; synced++; } });
        bars.forEach((b, i) => { const h = 4 + ((synced * (i + 2)) % 26); b.setAttribute('height', h); b.setAttribute('y', 40 - h); });
    }

    return {
        tick(t, dt) {
            clock += dt;
            if (clock > next) {
                const p = pts.find(q => !q.shown);
                if (p) { p.shown = true; p.age = 0; }
                else { pts.forEach(q => { q.shown = q.synced = false; q.g.setAttribute('opacity', 0); }); synced = 0; }
                next = clock + 0.7;
            }
            if (forced || (clock % 4.2) < dt) { sync(); forced = false; }
            let queued = 0;
            pts.forEach(p => {
                if (!p.shown) return;
                p.age = (p.age || 0) + dt;
                p.g.setAttribute('opacity', Math.min(p.age * 3, 1));
                const ring = 4 + ((t * 1.2 + p.age) % 1) * 10;
                p.ring.setAttribute('r', ring);
                p.ring.setAttribute('opacity', p.synced ? 0 : 1 - (ring - 4) / 10);
                p.dot.setAttribute('fill', p.synced ? C.cyan : C.muted);
                p.flash = Math.max(0, p.flash - dt * 1.5);
                p.link.setAttribute('opacity', p.flash * 0.8);
                if (!p.synced) queued++;
            });
            status.textContent = queued ? `${queued} captured offline · waiting for signal` : 'all records synced';
            status.setAttribute('fill', queued ? C.muted : C.cyan);
        }
    };
}

/* --------------------------------------------------------------------------
   4. Venice Lagoon: scrub through the Landsat years
   -------------------------------------------------------------------------- */
function vizVenice(svg, id) {
    const W = 800, H = 260;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    el('rect', { width: W, height: H, fill: '#0b1a14' }, svg);
    const defs = el('defs', {}, svg);
    const grad = el('linearGradient', { id: `ndvi-${id}` }, defs);
    [['0', '#7a5a3a'], ['0.5', '#c9b56a'], ['1', C.green]].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, grad));

    // Sea, lagoon and barrier islands (stylised, not to scale)
    el('rect', { x: 0, y: 190, width: W, height: 70, fill: '#0a2238' }, svg);
    const lagoon = 'M60 60 C160 30 300 40 420 52 C540 64 660 48 740 80 C770 110 740 160 700 178 C600 200 480 190 380 196 C260 202 140 196 80 168 C40 140 30 90 60 60 Z';
    el('path', { d: lagoon, fill: C.water, opacity: 0.55 }, svg);
    el('path', { d: 'M40 186 C200 200 400 204 560 198 C660 194 740 186 790 176', stroke: '#c9b56a', 'stroke-width': 4, fill: 'none', opacity: 0.6 }, svg);
    el('path', { d: 'M470 120 c18 -10 44 -8 56 4 c10 12 -6 26 -28 26 c-24 0 -42 -16 -28 -30 Z', fill: '#4c6383', opacity: 0.85 }, svg);
    label(svg, 498, 164, 'VENICE', { anchor: 'middle', size: 8, fill: C.text });

    const r = rng(19);
    const marsh = Array.from({ length: 16 }, (_, i) => {
        const x = 110 + r() * 560, y = 70 + r() * 100;
        if (x > 440 && x < 560 && y > 100) return null;
        const rx = 14 + r() * 26, ry = 8 + r() * 12;
        return { node: el('ellipse', { cx: x, cy: y, rx, ry, fill: C.green }, svg), seed: i * 3.7 };
    }).filter(Boolean);

    // Timeline
    const y0 = 1985, y1 = 2020;
    const tx = yr => 60 + (yr - y0) / (y1 - y0) * 680;
    el('line', { x1: 60, y1: 236, x2: 740, y2: 236, stroke: '#4c6383' }, svg);
    for (let yr = y0; yr <= y1; yr += 5) {
        el('line', { x1: tx(yr), y1: 231, x2: tx(yr), y2: 241, stroke: '#4c6383' }, svg);
        label(svg, tx(yr), 254, String(yr), { anchor: 'middle', size: 8 });
    }
    const knob = el('circle', { cy: 236, r: 6, fill: C.amber }, svg);
    const yearText = label(svg, W - 20, 34, '', { anchor: 'end', size: 26, fill: C.text, ls: 1 });
    const sensorText = label(svg, W - 20, 52, '', { anchor: 'end', size: 9, fill: C.amber });
    el('rect', { x: 20, y: 20, width: 90, height: 6, rx: 3, fill: `url(#ndvi-${id})` }, svg);
    label(svg, 20, 40, 'NDVI  low → high', { size: 8 });

    let year = y0, target = null;
    svg.addEventListener('pointermove', e => {
        const b = svg.getBoundingClientRect();
        const scale = Math.min(b.width / W, b.height / H);
        const offsetX = (b.width - W * scale) / 2;
        const x = (e.clientX - b.left - offsetX) / scale;
        target = clamp(y0 + (x - 60) / 680 * (y1 - y0), y0, y1);
    });
    svg.addEventListener('pointerleave', () => { target = null; });
    svg.style.cursor = 'col-resize';

    return {
        tick(t, dt) {
            if (target === null) { year += dt * 3.2; if (year > y1) year = y0; }
            else year += (target - year) * 0.15;
            const yi = Math.round(year);
            yearText.textContent = yi;
            sensorText.textContent = yi < 1999 ? 'LANDSAT 5 TM' : yi < 2013 ? 'LANDSAT 5 / 7' : 'LANDSAT 8 OLI';
            knob.setAttribute('cx', tx(year));
            marsh.forEach(m => {
                const v = noise1(m.seed + year * 0.09);
                m.node.setAttribute('opacity', (0.25 + v * 0.6).toFixed(2));
                m.node.setAttribute('fill', v > 0.55 ? C.green : v > 0.35 ? '#c9b56a' : '#7a5a3a');
            });
        }
    };
}

/* --------------------------------------------------------------------------
   5. Records to GIS: each document threaded to its capital works feature
   -------------------------------------------------------------------------- */
function vizRecords(svg) {
    const W = 400, H = 260;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    el('rect', { width: W, height: H, fill: '#081222' }, svg);
    // Map side
    el('rect', { x: 200, y: 16, width: 186, height: 228, rx: 8, fill: '#0b1a2c', stroke: C.line }, svg);
    for (let i = 0; i < 5; i++) el('line', { x1: 200, y1: 40 + i * 46, x2: 386, y2: 30 + i * 50, stroke: '#1a2b46', 'stroke-width': 6 }, svg);
    label(svg, 293, 236, 'CAPITAL WORKS', { anchor: 'middle', size: 8 });

    const features = [
        { d: 'M226 34 h52 v34 h-52 Z', c: [252, 51] },
        { d: 'M300 70 L372 92', c: [336, 81], line: true },
        { d: 'M236 112 l30 -10 l22 24 l-24 22 l-30 -8 Z', c: [256, 126] },
        { d: 'M320 150 a10 10 0 1 0 0.1 0', c: [320, 160] },
        { d: 'M224 186 h46 l12 30 h-58 Z', c: [246, 201] }
    ];
    const ids = ['CM-24/0193', 'CM-24/0207', 'CM-23/1184', 'CM-24/0051', 'CM-22/0942'];
    const items = ids.map((id, i) => {
        const y = 26 + i * 46;
        const doc = el('g', { transform: `translate(14 ${y})` }, svg);
        const page = el('path', { d: 'M0 0 h22 l8 8 v26 h-30 Z', fill: '#0f1d36', stroke: C.muted, 'stroke-width': 1 }, doc);
        el('path', { d: 'M22 0 v8 h8', fill: 'none', stroke: C.muted, 'stroke-width': 1 }, doc);
        [14, 20, 26].forEach(ly => el('line', { x1: 5, y1: ly, x2: 24, y2: ly, stroke: C.muted, 'stroke-width': 1, opacity: 0.5 }, doc));
        const txt = label(doc, 38, 21, id, { size: 9 });
        const f = features[i];
        const shape = el('path', { d: f.d, fill: f.line ? 'none' : 'rgba(60,214,240,0.12)', stroke: C.cyan, 'stroke-width': f.line ? 5 : 1.2, 'stroke-linecap': 'round' }, svg);
        const thread = el('path', { d: `M110 ${y + 17} C160 ${y + 17} 170 ${f.c[1]} ${f.c[0]} ${f.c[1]}`, fill: 'none', stroke: C.cyan, 'stroke-width': 1, 'stroke-dasharray': '3 4', opacity: 0.25 }, svg);
        return { y, page, txt, shape, thread, f };
    });

    let active = 0, hover = null, clock = 0;
    svg.addEventListener('pointermove', e => {
        const b = svg.getBoundingClientRect();
        const scale = Math.min(b.width / W, b.height / H);
        const offsetY = (b.height - H * scale) / 2;
        const y = (e.clientY - b.top - offsetY) / scale;
        hover = clamp(Math.floor((y - 16) / 46), 0, 4);
    });
    svg.addEventListener('pointerleave', () => { hover = null; });

    return {
        tick(t, dt) {
            clock += dt;
            if (hover === null && clock > 1.6) { active = (active + 1) % items.length; clock = 0; }
            const a = hover === null ? active : hover;
            items.forEach((it, i) => {
                const on = i === a;
                it.thread.setAttribute('stroke', on ? C.amber : C.cyan);
                it.thread.setAttribute('opacity', on ? 1 : 0.22);
                it.thread.setAttribute('stroke-dashoffset', (-t * 18).toFixed(1));
                it.page.setAttribute('stroke', on ? C.amber : C.muted);
                it.txt.setAttribute('fill', on ? C.amber : C.muted);
                it.shape.setAttribute('stroke', on ? C.amber : C.cyan);
                if (!it.f.line) it.shape.setAttribute('fill', on ? 'rgba(245,184,76,0.25)' : 'rgba(60,214,240,0.12)');
            });
        }
    };
}

/* --------------------------------------------------------------------------
   6. KSA-GRF17: a drone survey across Saudi UTM zones
   -------------------------------------------------------------------------- */
function vizKSA(svg) {
    const W = 400, H = 260;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    el('rect', { width: W, height: H, fill: '#120f0a' }, svg);
    // Longitude 36°E to 54°E across the frame: zones 37N (36–42), 38N (42–48), 39N (48–54)
    const X0 = 20, X1 = 380, lon = x => 36 + (x - X0) / (X1 - X0) * 18;
    const zoneX = z => X0 + ((z - 37) * 6) / 18 * (X1 - X0);
    const zones = [37, 38, 39].map(z => {
        const x = zoneX(z), w = (X1 - X0) / 3;
        const band = el('rect', { x, y: 30, width: w, height: 170, fill: C.amber, opacity: 0.04 }, svg);
        el('line', { x1: x, y1: 30, x2: x, y2: 200, stroke: '#4a3a22', 'stroke-dasharray': '3 3' }, svg);
        const t = label(svg, x + w / 2, 22, `UTM ${z}N`, { anchor: 'middle', size: 9 });
        return { z, band, t };
    });
    el('line', { x1: X1, y1: 30, x2: X1, y2: 200, stroke: '#4a3a22', 'stroke-dasharray': '3 3' }, svg);
    // Dunes
    for (let k = 0; k < 6; k++) {
        el('path', { d: `M20 ${60 + k * 26} q60 -14 120 0 t120 0 t120 0`, fill: 'none', stroke: '#5a4628', opacity: 0.6 }, svg);
    }
    const shots = el('g', {}, svg);
    const drone = el('g', {}, svg);
    el('path', { d: 'M-8 -8 L8 8 M8 -8 L-8 8', stroke: C.text, 'stroke-width': 1.6 }, drone);
    [[-8, -8], [8, 8], [8, -8], [-8, 8]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 3.6, fill: 'none', stroke: C.cyan, 'stroke-width': 1.2 }, drone));
    const l1 = label(svg, 20, 224, '', { size: 9, fill: C.text });
    const l2 = label(svg, 20, 244, '', { size: 9, fill: C.amber });

    // Lawnmower survey path
    const lines = 5;
    let s = 0, shotClock = 0;
    function pathAt(u) {
        const seg = u * lines;
        const i = Math.floor(seg) % lines;
        const f = seg - Math.floor(seg);
        const x = i % 2 === 0 ? lerp(40, 360, f) : lerp(360, 40, f);
        return [x, 50 + i * 34];
    }
    return {
        tick(t, dt) {
            s = (s + dt * 0.035) % 1;
            const [x, y] = pathAt(s);
            drone.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(t * 40) % 360})`);
            shotClock += dt;
            if (shotClock > 0.35) {
                shotClock = 0;
                const f = el('rect', { x: x - 7, y: y - 5, width: 14, height: 10, fill: 'rgba(60,214,240,0.10)', stroke: C.cyan, 'stroke-width': 0.6, opacity: 0.9 }, shots);
                f.dataset.age = 0;
                if (shots.childNodes.length > 60) shots.removeChild(shots.firstChild);
            }
            shots.childNodes.forEach(n => { const a = (+n.dataset.age || 0) + dt; n.dataset.age = a; n.setAttribute('opacity', Math.max(0.15, 0.9 - a * 0.08)); });
            const lo = lon(x), la = 30 - (y - 30) / 170 * 12;
            const z = Math.floor((lo + 180) / 6) + 1;
            zones.forEach(zz => {
                const on = zz.z === z;
                zz.band.setAttribute('opacity', on ? 0.14 : 0.04);
                zz.t.setAttribute('fill', on ? C.amber : C.muted);
            });
            l1.textContent = `EXIF  ${la.toFixed(3)}°N  ${lo.toFixed(3)}°E`;
            l2.textContent = `→ KSA-GRF17 / UTM zone ${z}N`;
        }
    };
}

/* --------------------------------------------------------------------------
   7. IoT: a room of sensors streaming live readings
   -------------------------------------------------------------------------- */
function vizIoT(svg) {
    const W = 400, H = 260;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    el('rect', { width: W, height: H, fill: '#081222' }, svg);
    // Floor plan
    const plan = el('g', { transform: 'translate(16 20)' }, svg);
    el('path', { d: 'M0 0 H180 V150 H110 M80 150 H0 Z', fill: '#0b1a2c', stroke: C.muted, 'stroke-width': 1.5 }, plan);
    el('path', { d: 'M110 0 V60 M110 90 V150', stroke: C.muted, 'stroke-width': 1.2 }, plan);
    el('rect', { x: 20, y: 30, width: 60, height: 34, rx: 3, fill: 'none', stroke: '#2a3a4f' }, plan);
    el('rect', { x: 20, y: 96, width: 60, height: 34, rx: 3, fill: 'none', stroke: '#2a3a4f' }, plan);
    const sensors = [[50, 80], [146, 40], [146, 120]].map(([x, y]) => {
        const g = el('g', { transform: `translate(${x} ${y})` }, plan);
        const ring = el('circle', { r: 4, fill: 'none', stroke: C.cyan }, g);
        el('circle', { r: 3.5, fill: C.cyan }, g);
        return ring;
    });
    label(svg, 16, 190, 'MQTT → FastAPI → WebSocket', { size: 8 });

    // Readouts
    const rd = (y, name, unit) => {
        label(svg, 220, y, name, { size: 8.5 });
        const v = label(svg, 386, y, '', { anchor: 'end', size: 12, fill: C.text });
        label(svg, 386, y + 12, unit, { anchor: 'end', size: 7.5 });
        return v;
    };
    const vCo2 = rd(34, 'CO₂', 'ppm'), vT = rd(70, 'TEMP', '°C'), vRh = rd(106, 'HUMIDITY', '%RH');
    el('rect', { x: 214, y: 132, width: 172, height: 74, rx: 6, fill: '#0b1a2c', stroke: C.line }, svg);
    el('line', { x1: 220, y1: 170, x2: 380, y2: 170, stroke: C.coral, 'stroke-dasharray': '2 3', opacity: 0.6 }, svg);
    label(svg, 380, 166, '1000 ppm', { anchor: 'end', size: 7, fill: C.coral });
    const spark = el('polyline', { fill: 'none', stroke: C.amber, 'stroke-width': 1.6 }, svg);
    label(svg, 214, 246, 'demo data', { size: 8, fill: '#4c6383' });

    const hist = Array.from({ length: 40 }, (_, i) => 640 + Math.sin(i * 0.3) * 60);
    let co2 = 660, temp = 22.4, rh = 48, clock = 0;
    return {
        tick(t, dt) {
            sensors.forEach((ring, i) => {
                const p = (t * 0.8 + i * 0.33) % 1;
                ring.setAttribute('r', 4 + p * 12);
                ring.setAttribute('opacity', 1 - p);
            });
            clock += dt;
            if (clock > 0.5) {
                clock = 0;
                co2 = clamp(co2 + (Math.random() - 0.45) * 40, 480, 1150);
                temp = clamp(temp + (Math.random() - 0.5) * 0.2, 20.5, 25);
                rh = clamp(rh + (Math.random() - 0.5) * 1.2, 38, 60);
                hist.push(co2); hist.shift();
                vCo2.textContent = Math.round(co2);
                vCo2.setAttribute('fill', co2 > 1000 ? C.coral : C.text);
                vT.textContent = temp.toFixed(1);
                vRh.textContent = Math.round(rh);
                spark.setAttribute('points', hist.map((v, i) => `${(220 + i * 4.1).toFixed(1)},${(200 - (v - 450) / 750 * 62).toFixed(1)}`).join(' '));
            }
        }
    };
}

/* --------------------------------------------------------------------------
   Attach a visual to every card already in the HTML (data-viz="...")
   -------------------------------------------------------------------------- */
const VIZ = { change: vizChange, m1: vizM1, disaster: vizDisaster, venice: vizVenice, records: vizRecords, ksa: vizKSA, iot: vizIoT };

function initCards() {
    const cards = Array.from(document.querySelectorAll('.viz-card[data-viz]'));
    if (!cards.length) return;

    const live = [];
    cards.forEach((card, i) => {
        const make = VIZ[card.dataset.viz];
        const svg = card.querySelector('.viz svg');
        if (!make || !svg) return;
        live.push({ card, anim: make(svg, i), visible: false });
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
    });

    // Draw one settled frame for every card first (this is also the reduced-motion view)
    live.forEach(v => { for (let k = 0; k < 40; k++) v.anim.tick(2 + k * 0.05, 0.05); });
    if (reduceMotion || !('IntersectionObserver' in window)) {
        live.forEach(v => v.card.classList.add('is-in'));
        return;
    }

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const v = live.find(x => x.card === entry.target);
            v.visible = entry.isIntersecting;
            if (entry.isIntersecting) v.card.classList.add('is-in');
        });
    }, { threshold: 0.1 });
    live.forEach(v => io.observe(v.card));

    let last = performance.now();
    function loop(now) {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        if (!document.hidden) live.forEach(v => { if (v.visible) v.anim.tick(now / 1000, dt); });
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

// Case-study buttons open the existing project pop-ups from script.js
document.addEventListener('click', e => {
    const btn = e.target.closest('[data-modal]');
    if (btn && typeof window.openProjectModal === 'function') window.openProjectModal(btn.dataset.modal);
});

initCards();
