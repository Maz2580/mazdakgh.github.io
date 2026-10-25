// projects-flight.js: scroll-driven 3D flight over the four flagship projects.
// three.js is fetched only when the visitor scrolls near the Projects section.
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
let THREE;

const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall = window.matchMedia('(max-width: 760px)').matches;

/* ==========================================================================
   Small seeded noise helpers (shared by the terrain and the layer art)
   ========================================================================== */
function mulberry32(seed) {
    return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function hash2(x, y) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
}
function valueNoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
    return (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * v;
}
function fbm(x, y) {
    let v = 0, amp = 0.5, f = 1;
    for (let i = 0; i < 5; i++) { v += amp * valueNoise(x * f, y * f); f *= 2.02; amp *= 0.5; }
    return v;
}

/* ==========================================================================
   Part 1: the flight
   ========================================================================== */
const STOPS = [
    { x: -62, z: -18, cam: [30, 26, 30] },   // UMAMI: heat-coloured city
    { x: 12, z: -72, cam: [-32, 30, 24] },   // Terrascout: satellite scanning footprints
    { x: 64, z: 8, cam: [30, 24, -28] },     // UrbanMind: parcels and rising massing models
    { x: -6, z: 62, cam: [-28, 26, -30] }    // GeoSpark: isochrones and a computed route
];

function terrainHeight(x, z) {
    let h = (fbm(x * 0.018 + 3.1, z * 0.018 - 1.7) - 0.45) * 26;
    // Flatten a pad around each stop so the scene sits on level ground
    for (const s of STOPS) {
        const d = Math.hypot(x - s.x, z - s.z);
        const k = Math.min(Math.max((d - 14) / 22, 0), 1);
        const smooth = k * k * (3 - 2 * k);
        h = h * smooth;
    }
    return h;
}

function initFlight() {
    const section = document.getElementById('flight');
    const canvas = section && section.querySelector('.flight-canvas');
    const panels = section ? Array.from(section.querySelectorAll('.flight-panel')) : [];
    const dots = section ? Array.from(section.querySelectorAll('.flight-progress li')) : [];
    if (!section || !canvas) return;

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSmall, powerPreference: 'high-performance' });
    } catch (e) {
        section.classList.add('is-static');
        return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.25 : 1.75));
    renderer.setClearColor(0x0b1629, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b1629, 70, 210);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 600);

    scene.add(new THREE.AmbientLight(0x9fb4d6, 0.55));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(40, 80, 30);
    scene.add(sun);

    // ---- Terrain with contour-line shader ----
    const seg = isSmall ? 110 : 220;
    const geo = new THREE.PlaneGeometry(360, 360, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, terrainHeight(pos.getX(i), pos.getZ(i)));
    geo.computeVertexNormals();

    const terrainUniforms = {
        uFocus: { value: new THREE.Vector2(STOPS[0].x, STOPS[0].z) },
        uTime: { value: 0 },
        uFogNear: { value: 70 },
        uFogFar: { value: 210 }
    };
    const terrainMat = new THREE.ShaderMaterial({
        uniforms: terrainUniforms,
        vertexShader: `
            varying float vH;
            varying vec3 vW;
            varying float vDepth;
            void main() {
                vec4 w = modelMatrix * vec4(position, 1.0);
                vW = w.xyz;
                vH = position.y;
                vec4 mv = viewMatrix * w;
                vDepth = -mv.z;
                gl_Position = projectionMatrix * mv;
            }`,
        fragmentShader: `
            uniform vec2 uFocus;
            uniform float uTime;
            uniform float uFogNear;
            uniform float uFogFar;
            varying float vH;
            varying vec3 vW;
            varying float vDepth;
            float lineAt(float v, float width) {
                float f = fract(v);
                float d = min(f, 1.0 - f);
                return 1.0 - smoothstep(0.0, fwidth(v) * width, d);
            }
            void main() {
                vec3 base = vec3(0.045, 0.085, 0.155) + vec3(0.02, 0.04, 0.07) * smoothstep(-8.0, 12.0, vH);
                // Offset by half a step so the flat pads (height 0) sit between contour lines, not on one
                float v = vH * 0.55 + 0.5;
                float minor = lineAt(v, 1.2);
                float major = lineAt(v / 5.0 + 0.25, 1.4);
                float grid = max(lineAt(vW.x / 20.0, 1.0), lineAt(vW.z / 20.0, 1.0)) * 0.25;
                float dist = length(vW.xz - uFocus);
                float glow = exp(-dist * dist / 900.0);
                float pulse = smoothstep(2.0, 0.0, abs(dist - mod(uTime * 14.0, 60.0))) * (1.0 - smoothstep(20.0, 60.0, dist));
                vec3 cyan = vec3(0.235, 0.839, 0.941);
                vec3 amber = vec3(0.961, 0.722, 0.298);
                vec3 lineCol = mix(cyan, amber, smoothstep(6.0, 13.0, vH));
                float a = minor * 0.22 + major * 0.45 + grid * 0.35;
                a *= 0.55 + glow * 0.9;
                vec3 col = base + lineCol * a + cyan * pulse * 0.35;
                float fog = smoothstep(uFogNear, uFogFar, vDepth);
                gl_FragColor = vec4(mix(col, vec3(0.043, 0.086, 0.161), fog), 1.0);
            }`,
        extensions: { derivatives: true }
    });
    scene.add(new THREE.Mesh(geo, terrainMat));

    const CYAN = new THREE.Color(0x3cd6f0);
    const AMBER = new THREE.Color(0xf5b84c);
    const CORAL = new THREE.Color(0xff7a59);
    const lineMat = (color, opacity = 0.9) => new THREE.LineBasicMaterial({ color, transparent: true, opacity });

    // ---- Beacons at every stop ----
    const beacons = STOPS.map(s => {
        const g = new THREE.Group();
        g.position.set(s.x, 0.05, s.z);
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(15.5, 16, 96),
            new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })
        );
        ring.rotation.x = -Math.PI / 2;
        g.add(ring);
        const beam = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 40, 0)]),
            lineMat(CYAN, 0.25)
        );
        beam.position.set(16, 0, 0);
        g.add(beam);
        scene.add(g);
        return { group: g, ring, beam };
    });

    // ---- Stop 0: UMAMI, a city block coloured by modelled heat ----
    const umami = new THREE.Group();
    umami.position.set(STOPS[0].x, 0, STOPS[0].z);
    {
        const n = 13, size = 1.6, gap = 0.75;
        const box = new THREE.BoxGeometry(1, 1, 1);
        box.translate(0, 0.5, 0);
        const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const mesh = new THREE.InstancedMesh(box, mat, n * n);
        const rnd = mulberry32(7);
        const m = new THREE.Matrix4();
        const c = new THREE.Color();
        let k = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i === 4 || j === 6 || i === 9) continue; // streets
                const x = (i - n / 2) * (size + gap);
                const z = (j - n / 2) * (size + gap);
                const d = Math.hypot(x, z) / 14;
                const h = 0.6 + rnd() * 7.5 * Math.max(0.15, 1 - d);
                m.compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion(), new THREE.Vector3(size, h, size));
                mesh.setMatrixAt(k, m);
                const t = Math.min(h / 7, 1);
                c.copy(CYAN).lerp(AMBER, Math.min(t * 1.6, 1));
                if (t > 0.62) c.lerp(CORAL, (t - 0.62) / 0.38);
                mesh.setColorAt(k, c);
                k++;
            }
        }
        mesh.count = k;
        umami.add(mesh);
        // Heat haze dome
        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(13, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.06, depthWrite: false })
        );
        umami.add(dome);
        umami.userData.dome = dome;
    }
    scene.add(umami);

    // ---- Stop 1: Terrascout, a satellite sweeping scene footprints ----
    const terra = new THREE.Group();
    terra.position.set(STOPS[1].x, 0, STOPS[1].z);
    {
        const sat = new THREE.Mesh(new THREE.OctahedronGeometry(1.1), new THREE.MeshBasicMaterial({ color: CYAN }));
        const panelsGeo = new THREE.BoxGeometry(5, 0.08, 1.2);
        const wings = new THREE.Mesh(panelsGeo, new THREE.MeshBasicMaterial({ color: 0x1b6f86 }));
        const satGroup = new THREE.Group();
        satGroup.add(sat, wings);
        satGroup.position.y = 30;
        terra.add(satGroup);
        const cone = new THREE.Mesh(
            new THREE.ConeGeometry(7, 30, 4, 1, true),
            new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false })
        );
        cone.position.y = 15;
        cone.rotation.y = Math.PI / 4;
        terra.add(cone);
        const footprints = [];
        const rnd = mulberry32(21);
        for (let i = 0; i < 7; i++) {
            const w = 6 + rnd() * 5, h = 6 + rnd() * 5;
            const pts = [[-w, -h], [w, -h], [w, h], [-w, h], [-w, -h]].map(([a, b]) => new THREE.Vector3(a / 2, 0.15, b / 2));
            const loop = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(i < 2 ? AMBER : CYAN, 0.35));
            loop.position.set((rnd() - 0.5) * 24, 0, (rnd() - 0.5) * 24);
            loop.rotation.y = (rnd() - 0.5) * 0.6;
            terra.add(loop);
            footprints.push(loop);
        }
        terra.userData = { satGroup, cone, footprints };
    }
    scene.add(terra);

    // ---- Stop 2: UrbanMind, parcels and massing models rising ----
    const urban = new THREE.Group();
    urban.position.set(STOPS[2].x, 0, STOPS[2].z);
    {
        const pts = [];
        const n = 9, cell = 3.2;
        const rnd = mulberry32(5);
        for (let i = 0; i <= n; i++) {
            const o = (i - n / 2) * cell;
            pts.push(new THREE.Vector3(o + (rnd() - 0.5), 0.12, -n / 2 * cell), new THREE.Vector3(o + (rnd() - 0.5), 0.12, n / 2 * cell));
            pts.push(new THREE.Vector3(-n / 2 * cell, 0.12, o + (rnd() - 0.5)), new THREE.Vector3(n / 2 * cell, 0.12, o + (rnd() - 0.5)));
        }
        urban.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), lineMat(CYAN, 0.4)));
        const massing = [];
        const sites = [[-1, -2, 5], [1, -2, 8], [-2, 1, 4], [0, 1, 11], [2, 1, 6], [1, 3, 3.5], [-3, -3, 7]];
        sites.forEach(([i, j, h], idx) => {
            const g = new THREE.BoxGeometry(cell * 0.8, 1, cell * 0.8);
            g.translate(0, 0.5, 0);
            const solid = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: idx === 3 ? AMBER : 0x8fe9f7, transparent: true, opacity: 0.85 }));
            const edges = new THREE.LineSegments(new THREE.EdgesGeometry(g), lineMat(idx === 3 ? AMBER : CYAN, 1));
            const b = new THREE.Group();
            b.add(solid, edges);
            b.position.set(i * cell, 0, j * cell);
            b.userData.h = h;
            b.scale.y = 0.05;
            urban.add(b);
            massing.push(b);
        });
        // Planning envelope around the tallest proposal
        const env = new THREE.BoxGeometry(cell * 1.1, 13, cell * 1.1);
        env.translate(0, 6.5, 0);
        const envLines = new THREE.LineSegments(new THREE.EdgesGeometry(env), new THREE.LineDashedMaterial({ color: AMBER, dashSize: 0.6, gapSize: 0.4, transparent: true, opacity: 0.6 }));
        envLines.computeLineDistances();
        envLines.position.set(0, 0, cell);
        urban.add(envLines);
        urban.userData = { massing };
    }
    scene.add(urban);

    // ---- Stop 3: GeoSpark, isochrones and a computed route ----
    const spark = new THREE.Group();
    spark.position.set(STOPS[3].x, 0, STOPS[3].z);
    {
        const rings = [];
        for (let r = 0; r < 4; r++) {
            const pts = [];
            const base = 4 + r * 4;
            for (let a = 0; a <= 96; a++) {
                const t = (a / 96) * Math.PI * 2;
                const rr = base * (1 + 0.22 * Math.sin(t * 3 + r) + 0.12 * Math.sin(t * 5 - r * 2));
                pts.push(new THREE.Vector3(Math.cos(t) * rr, 0.2, Math.sin(t) * rr));
            }
            const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(r === 0 ? AMBER : CYAN, 0.75 - r * 0.15));
            spark.add(ring);
            rings.push(ring);
        }
        const route = [];
        let p = new THREE.Vector3(0, 0.35, 0);
        const rnd = mulberry32(11);
        for (let i = 0; i < 9; i++) {
            route.push(p.clone());
            p = p.clone().add(new THREE.Vector3(2 + rnd() * 1.5, 0, (rnd() - 0.4) * 3));
        }
        const routeLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(route), lineMat(AMBER, 1));
        spark.add(routeLine);
        const nodeGeo = new THREE.BufferGeometry().setFromPoints(route);
        spark.add(new THREE.Points(nodeGeo, new THREE.PointsMaterial({ color: AMBER, size: 0.9 })));
        const origin = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), new THREE.MeshBasicMaterial({ color: AMBER }));
        origin.position.y = 0.6;
        spark.add(origin);
        spark.userData = { rings };
    }
    scene.add(spark);

    // ---- Camera path driven by scroll ----
    const stopTargets = STOPS.map(s => new THREE.Vector3(s.x, 3, s.z));
    const stopCams = STOPS.map(s => new THREE.Vector3(s.x + s.cam[0], s.cam[1], s.z + s.cam[2]));
    const camPos = stopCams[0].clone();
    const camLook = stopTargets[0].clone();
    const wantPos = new THREE.Vector3();
    const wantLook = new THREE.Vector3();
    const mouse = { x: 0, y: 0 };
    let progress = 0;
    let active = -1;

    function readScroll() {
        const r = section.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        progress = span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 0;
    }

    function setActive(i) {
        if (i === active) return;
        active = i;
        panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
        dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
        terrainUniforms.uFocus.value.set(STOPS[i].x, STOPS[i].z);
    }

    function pathAt(p, outPos, outLook) {
        const f = p * (STOPS.length - 1);
        const i = Math.min(Math.floor(f), STOPS.length - 2);
        const t = f - i;
        // Dwell at each stop, travel in the middle of the segment
        let e = Math.min(Math.max((t - 0.22) / 0.56, 0), 1);
        e = e * e * (3 - 2 * e);
        outPos.lerpVectors(stopCams[i], stopCams[i + 1], e);
        outPos.y += Math.sin(e * Math.PI) * 26; // lift up and over between stops
        outLook.lerpVectors(stopTargets[i], stopTargets[i + 1], e);
        return Math.round(f);
    }

    function resize() {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.fov = w < 760 ? 55 : 42;
        camera.updateProjectionMatrix();
    }

    const clock = new THREE.Clock();
    function frame() {
        const t = clock.getElapsedTime();
        terrainUniforms.uTime.value = t;
        const idx = pathAt(progress, wantPos, wantLook);
        setActive(idx);

        // Gentle idle orbit and pointer parallax on top of the scroll path
        wantPos.x += Math.sin(t * 0.25) * 2 + mouse.x * 3;
        wantPos.y += mouse.y * -2;
        camPos.lerp(wantPos, reduceMotion ? 1 : 0.06);
        camLook.lerp(wantLook, reduceMotion ? 1 : 0.08);
        camera.position.copy(camPos);
        camera.lookAt(camLook);

        // Per-stop motion
        beacons.forEach((b, k) => {
            const on = k === active;
            b.ring.material.opacity += ((on ? 0.7 : 0.18) - b.ring.material.opacity) * 0.08;
            const s = 1 + (on ? Math.sin(t * 2) * 0.03 : 0);
            b.ring.scale.set(s, s, s);
            b.beam.material.opacity += ((on ? 0.6 : 0.15) - b.beam.material.opacity) * 0.08;
        });
        umami.userData.dome.material.opacity = 0.05 + Math.sin(t * 1.5) * 0.02 + (active === 0 ? 0.03 : 0);
        const ts = terra.userData;
        const ang = t * 0.5;
        const sx = Math.cos(ang) * 10, sz = Math.sin(ang * 1.3) * 10;
        ts.satGroup.position.set(sx, 30, sz);
        ts.satGroup.rotation.y = ang;
        ts.cone.position.set(sx, 15, sz);
        ts.footprints.forEach(f => {
            const d = Math.hypot(f.position.x - sx, f.position.z - sz);
            f.material.opacity += ((d < 8 ? 1 : 0.3) - f.material.opacity) * 0.1;
        });
        urban.userData.massing.forEach((b, k) => {
            const target = active === 2 ? b.userData.h : 0.05;
            b.scale.y += (target - b.scale.y) * (0.03 + k * 0.004);
        });
        spark.userData.rings.forEach((r, k) => {
            const s = 1 + ((t * 0.25 + k * 0.25) % 1) * 0.18;
            r.scale.set(s, 1, s);
        });

        renderer.render(scene, camera);
    }

    // ---- Run only while visible ----
    let running = false;
    function loop() {
        if (!running) return;
        frame();
        requestAnimationFrame(loop);
    }
    function setRunning(on) {
        if (on && !running) { running = true; requestAnimationFrame(loop); }
        if (!on) running = false;
    }

    resize();
    readScroll();
    window.addEventListener('resize', () => { resize(); readScroll(); if (!running) frame(); });
    window.addEventListener('scroll', readScroll, { passive: true });
    if (window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
        window.addEventListener('pointermove', e => {
            mouse.x = e.clientX / window.innerWidth - 0.5;
            mouse.y = e.clientY / window.innerHeight - 0.5;
        });
    }

    if (reduceMotion) {
        // No flight: show the four panels as a list over one still frame
        section.classList.add('is-static');
        panels.forEach(p => p.classList.add('is-active'));
        resize();
        frame();
        return;
    }

    let visible = false;
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        setRunning(visible && !document.hidden);
    }).observe(section);
    document.addEventListener('visibilitychange', () => setRunning(visible && !document.hidden));
    frame();
}

// Load three.js and start the flight shortly before the section scrolls into view
(function boot() {
    const section = document.getElementById('flight');
    if (!section) return;
    let started = false;
    const start = async () => {
        if (started) return;
        started = true;
        try {
            THREE = await import(THREE_URL);
            initFlight();
        } catch (e) {
            section.classList.add('is-static');
        }
    };
    if (!('IntersectionObserver' in window)) { start(); return; }
    const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { io.disconnect(); start(); }
    }, { rootMargin: '1200px 0px' });
    io.observe(section);
})();
