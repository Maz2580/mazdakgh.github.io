// skills-space.js: "Interstellar" — a scroll-driven flight through the skill categories.
// Each category is a planet with its skills orbiting as labels; a black hole waits at the end.
// The skills list in the HTML stays the source of truth (and the fallback for reduced motion / no WebGL).

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall = window.matchMedia('(max-width: 760px)').matches;
let THREE;

const PALETTE = ['#3cd6f0', '#f5b84c', '#5fcf8f', '#9fb0ff', '#ff7a59', '#4fd1c5', '#e2c48d', '#d98cf0'];
const SPACING = 150;

function readSkills(section) {
    return Array.from(section.querySelectorAll('.skill-card')).map((card, i) => ({
        title: card.querySelector('.skill-title')?.textContent.trim() || `System ${i + 1}`,
        icon: card.querySelector('.skill-icon i')?.className || 'fas fa-circle',
        skills: Array.from(card.querySelectorAll('.skill-tag')).map(t => t.textContent.trim()),
        color: PALETTE[i % PALETTE.length]
    }));
}

function buildDom(section, systems) {
    const space = document.createElement('div');
    space.className = 'space';
    space.style.setProperty('--stops', systems.length + 1);
    space.innerHTML = `
        <div class="space-sticky">
            <canvas class="space-canvas" aria-hidden="true"></canvas>
            <div class="space-labels" aria-hidden="true"></div>
            <div class="space-vignette" aria-hidden="true"></div>
            <div class="space-hud">
                <p class="hud-index"><span class="hud-n">00</span> / ${String(systems.length).padStart(2, '0')} <span class="hud-kind">Departure</span></p>
                <h3 class="hud-title">${systems.length} systems, one journey</h3>
                <ul class="hud-skills"></ul>
                <a class="hud-cta" href="#contact">Plot a course together <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
            </div>
            <ol class="space-progress" aria-hidden="true">
                ${systems.map(s => `<li style="--c:${s.color}"></li>`).join('')}
                <li class="is-hole"></li>
            </ol>
            <p class="space-hint" aria-hidden="true"><i class="fas fa-rocket" aria-hidden="true"></i> Scroll to travel</p>
        </div>`;
    // Full-bleed: sits after the container, below the section header
    const container = section.querySelector('.container');
    container.insertAdjacentElement('afterend', space);
    return space;
}

/* ==========================================================================
   Shaders
   ========================================================================== */
const NOISE = `
    float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
    float noise(vec3 x){
        vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
    }
    float fbm(vec3 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
`;

function planetMaterial(color, seed) {
    return new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(color) }, uSeed: { value: seed }, uTime: { value: 0 }, uLight: { value: new THREE.Vector3(0.2, 0.3, -1).normalize() } },
        vertexShader: `
            varying vec3 vN; varying vec3 vP; varying vec3 vView;
            void main(){
                vN = normalize(normalMatrix * normal);
                vP = position;
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                vView = normalize(-mv.xyz);
                gl_Position = projectionMatrix * mv;
            }`,
        fragmentShader: `
            uniform vec3 uColor; uniform float uSeed; uniform float uTime; uniform vec3 uLight;
            varying vec3 vN; varying vec3 vP; varying vec3 vView;
            ${NOISE}
            void main(){
                vec3 p = normalize(vP);
                float bands = fbm(vec3(p.y * 6.0 + uSeed, p.x * 1.5 + uTime * 0.02, p.z * 1.5));
                float detail = fbm(p * 4.0 + uSeed * 3.1);
                vec3 base = mix(uColor * 0.25, uColor, smoothstep(0.25, 0.75, bands));
                base = mix(base, vec3(1.0), smoothstep(0.7, 0.95, detail) * 0.25);
                float light = clamp(dot(vN, normalize(uLight)) * 0.8 + 0.35, 0.08, 1.0);
                float rim = pow(1.0 - max(dot(vN, vView), 0.0), 3.0);
                gl_FragColor = vec4(base * light + uColor * rim * 0.9, 1.0);
            }`
    });
}

function glowMaterial(color, power = 2.5, strength = 1.0) {
    return new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(color) }, uPower: { value: power }, uStrength: { value: strength } },
        vertexShader: `
            varying vec3 vN; varying vec3 vView;
            void main(){
                vN = normalize(normalMatrix * normal);
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                vView = normalize(-mv.xyz);
                gl_Position = projectionMatrix * mv;
            }`,
        fragmentShader: `
            uniform vec3 uColor; uniform float uPower; uniform float uStrength;
            varying vec3 vN; varying vec3 vView;
            void main(){
                float f = pow(1.0 - abs(dot(vN, vView)), uPower);
                gl_FragColor = vec4(uColor * f * uStrength, f * uStrength);
            }`,
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
}

/* ==========================================================================
   Scene
   ========================================================================== */
function init(section, systems, space) {
    const canvas = space.querySelector('.space-canvas');
    const labelLayer = space.querySelector('.space-labels');
    const hudN = space.querySelector('.hud-n');
    const hudKind = space.querySelector('.hud-kind');
    const hudTitle = space.querySelector('.hud-title');
    const hudSkills = space.querySelector('.hud-skills');
    const hud = space.querySelector('.space-hud');
    const ticks = Array.from(space.querySelectorAll('.space-progress li'));

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSmall, powerPreference: 'high-performance' });
    } catch (e) {
        return false;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.25 : 1.75));
    renderer.setClearColor(0x03060d, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 3000);

    const N = systems.length;
    const HOLE_Z = -(N + 1) * SPACING - 240;

    // ---- Nebula sky ----
    const sky = new THREE.Mesh(
        new THREE.SphereGeometry(1400, 48, 24),
        new THREE.ShaderMaterial({
            side: THREE.BackSide,
            depthWrite: false,
            uniforms: { uTime: { value: 0 } },
            vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `
                uniform float uTime; varying vec3 vDir;
                ${NOISE}
                void main(){
                    vec3 d = normalize(vDir);
                    float n = fbm(d * 2.2 + vec3(0.0, 0.0, uTime * 0.004));
                    float m = fbm(d * 4.5 - 7.0);
                    vec3 col = vec3(0.012, 0.024, 0.05);
                    col += vec3(0.07, 0.25, 0.32) * smoothstep(0.5, 0.85, n) * 0.55;
                    col += vec3(0.35, 0.18, 0.06) * smoothstep(0.62, 0.9, m) * 0.35;
                    col += vec3(0.25, 0.2, 0.45) * smoothstep(0.66, 0.92, n * m * 1.6) * 0.25;
                    gl_FragColor = vec4(col, 1.0);
                }`
        })
    );
    scene.add(sky);

    // ---- Star field along the whole journey ----
    const starCount = isSmall ? 2500 : 6000;
    const starPos = new Float32Array(starCount * 3);
    const starSeed = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
        const r = 25 + Math.random() * 260;
        const a = Math.random() * Math.PI * 2;
        starPos[i * 3] = Math.cos(a) * r;
        starPos[i * 3 + 1] = Math.sin(a) * r * 0.7;
        starPos[i * 3 + 2] = 120 - Math.random() * (Math.abs(HOLE_Z) + 600);
        starSeed[i] = Math.random();
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('aSeed', new THREE.BufferAttribute(starSeed, 1));
    const starMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() } },
        vertexShader: `
            attribute float aSeed; uniform float uTime; uniform float uPx; varying float vA; varying float vSeed;
            void main(){
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = (1.2 + aSeed * 2.4) * uPx * (220.0 / -mv.z);
                gl_PointSize = clamp(gl_PointSize, 1.0, 7.0 * uPx);
                vA = 0.55 + 0.45 * sin(uTime * (1.0 + aSeed * 3.0) + aSeed * 40.0);
                vSeed = aSeed;
                gl_Position = projectionMatrix * mv;
            }`,
        fragmentShader: `
            varying float vA; varying float vSeed;
            void main(){
                float d = length(gl_PointCoord - 0.5);
                float a = smoothstep(0.5, 0.0, d) * vA;
                vec3 col = mix(vec3(0.75, 0.88, 1.0), vec3(1.0, 0.82, 0.55), step(0.86, vSeed));
                gl_FragColor = vec4(col * a, a);
            }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // ---- Warp streaks that stretch with scroll speed ----
    const streakCount = isSmall ? 260 : 700;
    const sPos = new Float32Array(streakCount * 6);
    const sEnd = new Float32Array(streakCount * 2);
    for (let i = 0; i < streakCount; i++) {
        const r = 8 + Math.random() * 70;
        const a = Math.random() * Math.PI * 2;
        const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.75;
        const z = 100 - Math.random() * (Math.abs(HOLE_Z) + 300);
        sPos.set([x, y, z, x, y, z], i * 6);
        sEnd[i * 2 + 1] = 1;
    }
    const streakGeo = new THREE.BufferGeometry();
    streakGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    streakGeo.setAttribute('aEnd', new THREE.BufferAttribute(sEnd, 1));
    const streakMat = new THREE.ShaderMaterial({
        uniforms: { uStretch: { value: 0 } },
        vertexShader: `
            attribute float aEnd; uniform float uStretch; varying float vEnd;
            void main(){
                vec3 p = position; p.z += aEnd * uStretch;
                vEnd = aEnd;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            }`,
        fragmentShader: `
            uniform float uStretch; varying float vEnd;
            void main(){
                float a = clamp(uStretch / 30.0, 0.0, 1.0) * (1.0 - vEnd * 0.9);
                gl_FragColor = vec4(vec3(0.55, 0.9, 1.0) * a, a);
            }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    scene.add(new THREE.LineSegments(streakGeo, streakMat));

    // ---- Planets: one per skill category ----
    const planets = systems.map((sys, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        const pos = new THREE.Vector3(side * 17, (i % 3 - 1) * 5, -(i + 1) * SPACING);
        const radius = 6 + (i % 3) * 1.2;
        const g = new THREE.Group();
        g.position.copy(pos);
        const body = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 48), planetMaterial(sys.color, i * 1.7 + 0.3));
        g.add(body);
        g.add(new THREE.Mesh(new THREE.SphereGeometry(radius * 1.25, 48, 32), glowMaterial(sys.color, 2.2, 0.9)));
        if (i % 2 === 1 || i === 0) {
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(radius * 1.5, radius * 2.3, 128),
                new THREE.ShaderMaterial({
                    uniforms: { uColor: { value: new THREE.Color(sys.color) }, uIn: { value: radius * 1.5 }, uOut: { value: radius * 2.3 } },
                    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
                    fragmentShader: `
                        uniform vec3 uColor; uniform float uIn; uniform float uOut; varying vec3 vP;
                        void main(){
                            float r = (length(vP.xy) - uIn) / (uOut - uIn);
                            float bands = 0.5 + 0.5 * sin(r * 60.0) * sin(r * 13.0);
                            float a = smoothstep(0.0, 0.08, r) * smoothstep(1.0, 0.85, r) * (0.25 + bands * 0.35);
                            gl_FragColor = vec4(uColor * a, a);
                        }`,
                    side: THREE.DoubleSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
                })
            );
            ring.rotation.x = -Math.PI / 2 + 0.35;
            ring.rotation.y = 0.2 * side;
            g.add(ring);
        }
        scene.add(g);
        return { group: g, body, pos, radius, side };
    });

    // ---- Gargantua: black hole, accretion disk and lensed halo ----
    const hole = new THREE.Group();
    hole.position.set(0, 0, HOLE_Z);
    const diskMat = (inner, outer, tilt) => new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uIn: { value: inner }, uOut: { value: outer } },
        vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
            uniform float uTime; uniform float uIn; uniform float uOut; varying vec3 vP;
            ${NOISE}
            void main(){
                float r = (length(vP.xy) - uIn) / (uOut - uIn);
                float ang = atan(vP.y, vP.x);
                float swirl = fbm(vec3(cos(ang - uTime * 0.25 + r * 6.0) * 3.0, sin(ang - uTime * 0.25 + r * 6.0) * 3.0, r * 4.0));
                float heat = pow(1.0 - r, 2.2);
                vec3 col = mix(vec3(0.9, 0.35, 0.08), vec3(1.0, 0.85, 0.6), heat);
                col = mix(col, vec3(1.0), pow(heat, 4.0));
                float doppler = 0.65 + 0.55 * cos(ang);
                float a = smoothstep(0.0, 0.04, r) * smoothstep(1.0, 0.55, r) * (0.35 + swirl * 0.9) * doppler;
                gl_FragColor = vec4(col * a * 1.6, a);
            }`,
        side: THREE.DoubleSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const disk = new THREE.Mesh(new THREE.RingGeometry(34, 120, 256, 4), diskMat(34, 120));
    disk.rotation.x = -Math.PI / 2 + 0.12;
    hole.add(disk);
    const halo = new THREE.Mesh(new THREE.RingGeometry(27, 52, 256, 2), diskMat(27, 52));
    hole.add(halo); // turned to face the camera every frame: the lensed top and bottom of the disk
    const horizon = new THREE.Mesh(new THREE.SphereGeometry(26, 64, 48), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    hole.add(horizon);
    hole.add(new THREE.Mesh(new THREE.SphereGeometry(29, 48, 32), glowMaterial('#f5b84c', 4.0, 0.9)));
    scene.add(hole);

    // ---- Skill labels orbiting each planet (DOM, so text stays crisp) ----
    const labels = [];
    systems.forEach((sys, si) => {
        const p = planets[si];
        const n = sys.skills.length;
        sys.skills.forEach((name, k) => {
            const el = document.createElement('span');
            el.className = 'space-label';
            el.textContent = name;
            el.style.setProperty('--c', sys.color);
            labelLayer.appendChild(el);
            labels.push({ el, si, angle: (k / n) * Math.PI * 2, r: p.radius * 2.6 + (k % 3) * 2.2, tilt: (k % 2 ? 1 : -1) * (1 + (k % 4)) });
        });
        const title = document.createElement('span');
        title.className = 'space-label space-label--system';
        title.textContent = sys.title;
        title.style.setProperty('--c', sys.color);
        labelLayer.appendChild(title);
        labels.push({ el: title, si, system: true });
    });

    // ---- Camera path ----
    // Frame each planet right of centre (the readout lives on the left); on phones, centre it above the readout
    const lead = isSmall ? 0 : 13;
    const stops = planets.map(p => ({
        cam: new THREE.Vector3(p.pos.x - lead - p.side * 6, p.pos.y * 0.4 + (isSmall ? 10 : 3), p.pos.z + (isSmall ? 58 : 46)),
        look: new THREE.Vector3(p.pos.x - lead, p.pos.y * 0.6 - (isSmall ? 6 : 0), p.pos.z - 6)
    }));
    stops.unshift({ cam: new THREE.Vector3(0, 4, 90), look: new THREE.Vector3(0, 0, -80) });
    stops.push({ cam: new THREE.Vector3(0, 22, HOLE_Z + 210), look: new THREE.Vector3(0, 0, HOLE_Z) });
    // stops: [approach, planet 1..N, black hole]

    const camPos = stops[0].cam.clone();
    const camLook = stops[0].look.clone();
    const wantPos = new THREE.Vector3();
    const wantLook = new THREE.Vector3();
    let progress = 0, lastProgress = 0, velocity = 0, roll = 0, active = -2;

    function pathAt(p) {
        const f = p * (stops.length - 1);
        const i = Math.min(Math.floor(f), stops.length - 2);
        const t = f - i;
        let e = Math.min(Math.max((t - 0.18) / 0.64, 0), 1);
        e = e * e * (3 - 2 * e);
        wantPos.lerpVectors(stops[i].cam, stops[i + 1].cam, e);
        wantLook.lerpVectors(stops[i].look, stops[i + 1].look, e);
        // Bank while travelling between systems: the ship rolls over and back
        const bank = Math.sin(e * Math.PI) * 0.55 * (i % 2 ? -1 : 1);
        return { idx: Math.round(f), bank };
    }

    function setActive(idx) {
        if (idx === active) return;
        active = idx;
        const si = idx - 1; // stop 0 is the approach
        hud.classList.remove('is-in');
        void hud.offsetWidth;
        hud.classList.add('is-in');
        hud.classList.toggle('is-hole', idx >= stops.length - 1);
        if (si < 0) {
            hudN.textContent = '00';
            hudKind.textContent = 'Departure';
            hudTitle.textContent = `${N} systems, one journey`;
            hudSkills.innerHTML = '';
            hud.style.setProperty('--c', '#3cd6f0');
        } else if (si >= N) {
            hudN.textContent = '∞';
            hudKind.textContent = 'Event horizon';
            hudTitle.textContent = 'Your project is next';
            hudSkills.innerHTML = '';
            hud.style.setProperty('--c', '#f5b84c');
        } else {
            const sys = systems[si];
            hudN.textContent = String(si + 1).padStart(2, '0');
            hudKind.textContent = 'System';
            hudTitle.textContent = sys.title;
            hudSkills.innerHTML = sys.skills.map(s => `<li>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`).join('');
            hud.style.setProperty('--c', sys.color);
        }
        ticks.forEach((t, k) => {
            t.classList.toggle('is-active', k === si || (si >= N && t.classList.contains('is-hole')));
            t.classList.toggle('is-past', k < si);
        });
    }

    function readScroll() {
        const r = space.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        progress = span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 0;
    }

    function resize() {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.fov = w < 760 ? 72 : 58;
        camera.updateProjectionMatrix();
    }

    const tmp = new THREE.Vector3();
    const clock = new THREE.Clock();
    function frame() {
        const t = clock.getElapsedTime();
        const { idx, bank } = pathAt(progress);
        setActive(idx);

        // Scroll speed drives the warp streaks
        velocity += ((progress - lastProgress) * 4000 - velocity) * 0.15;
        lastProgress = progress;
        streakMat.uniforms.uStretch.value += (Math.min(Math.abs(velocity) * 6, 60) - streakMat.uniforms.uStretch.value) * 0.12;

        camPos.lerp(wantPos, 0.07);
        camLook.lerp(wantLook, 0.08);
        camera.position.copy(camPos);
        camera.position.x += Math.sin(t * 0.3) * 0.6;
        camera.position.y += Math.cos(t * 0.25) * 0.4;
        camera.lookAt(camLook);
        roll += ((bank + progress * 0.6) - roll) * 0.05;
        camera.rotateZ(roll);

        sky.position.copy(camera.position);
        starMat.uniforms.uTime.value = t;
        sky.material.uniforms.uTime.value = t;
        planets.forEach((p, k) => { p.body.rotation.y = t * 0.08 + k; p.body.material.uniforms.uTime.value = t; });
        disk.material.uniforms.uTime.value = t;
        halo.material.uniforms.uTime.value = t;
        halo.lookAt(camera.position);

        renderer.render(scene, camera);

        // Project the skill labels, fading any that drift over the readout
        const w = canvas.clientWidth, h = canvas.clientHeight;
        const si = active - 1;
        const hudBox = hud.getBoundingClientRect();
        const canvasBox = canvas.getBoundingClientRect();
        const hudRight = hudBox.right - canvasBox.left;
        const hudTop = hudBox.top - canvasBox.top;
        labels.forEach(l => {
            const p = planets[l.si];
            if (l.system) {
                tmp.set(p.pos.x, p.pos.y + p.radius * 1.9, p.pos.z);
            } else {
                const a = l.angle + t * 0.06;
                tmp.set(p.pos.x + Math.cos(a) * l.r, p.pos.y + Math.sin(a * 2) * 1.5 + l.tilt, p.pos.z + Math.sin(a) * l.r);
            }
            const dist = tmp.distanceTo(camera.position);
            tmp.project(camera);
            const behind = tmp.z > 1 || dist > 260;
            if (behind) { l.el.style.opacity = '0'; return; }
            const x = (tmp.x * 0.5 + 0.5) * w;
            const y = (-tmp.y * 0.5 + 0.5) * h;
            const near = Math.min(Math.max((dist - 6) / 14, 0), 1);
            const far = 1 - Math.min(Math.max((dist - 120) / 140, 0), 1);
            const focus = l.si === si ? 1 : 0.35;
            const scale = Math.min(Math.max(46 / dist, 0.45), 1.7);
            const clear = isSmall
                ? Math.min(Math.max((hudTop - 20 - y) / 60, 0), 1)
                : Math.min(Math.max((x - hudRight - 30) / 90, 0), 1);
            l.el.style.opacity = (near * far * focus * clear).toFixed(3);
            l.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
            l.el.style.zIndex = String(1000 - Math.round(dist));
        });
    }

    let running = false;
    function loop() {
        if (!running) return;
        frame();
        requestAnimationFrame(loop);
    }
    const setRunning = on => {
        if (on && !running) { running = true; requestAnimationFrame(loop); }
        if (!on) running = false;
    };

    resize();
    readScroll();
    window.addEventListener('resize', () => { resize(); readScroll(); });
    window.addEventListener('scroll', readScroll, { passive: true });

    let visible = false;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; setRunning(visible && !document.hidden); }).observe(space);
    document.addEventListener('visibilitychange', () => setRunning(visible && !document.hidden));
    frame();
    return true;
}

/* ==========================================================================
   Boot: only for motion-friendly visitors, and only when they get close
   ========================================================================== */
(function boot() {
    const section = document.getElementById('skills');
    if (!section || reduceMotion) return;
    const systems = readSkills(section);
    if (!systems.length) return;

    // Reserve the journey's scroll length now, so nothing jumps when the 3D scene arrives later
    const space = buildDom(section, systems);
    section.classList.add('is-space');
    const fallBack = () => { space.remove(); section.classList.remove('is-space'); };

    let started = false;
    const start = async () => {
        if (started) return;
        started = true;
        try {
            THREE = await import(THREE_URL);
        } catch (e) {
            fallBack(); // keep the plain skills list
            return;
        }
        if (!init(section, systems, space)) fallBack();
    };
    if (!('IntersectionObserver' in window)) { start(); return; }
    const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { io.disconnect(); start(); }
    }, { rootMargin: '1500px 0px' });
    io.observe(section);
})();
