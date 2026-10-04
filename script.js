// ===== NAVIGATION =====
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navMenu = document.getElementById('nav-menu');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Update active nav link based on scroll position
    updateActiveNavLink();
});

// Update active navigation link
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Smooth scroll for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
        
        // Close mobile menu if open
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    });
});

// Mobile menu toggle
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenuToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// ===== THEME: Dark mode only =====

// ===== PROJECT FILTERING =====
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filter projects
        projectCards.forEach((card, index) => {
            const category = card.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s both`;
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// ===== PROJECT MODALS =====
const modal = document.getElementById('project-modal');
const modalBody = document.getElementById('modal-body');

// Project data
const projectData = {
    umami: {
        title: 'UMAMI - Urban Digital Twin & GeoAI Platform',
        category: 'Digital Twin Platform | University of Melbourne',
        tags: ['FastAPI', 'React 19', 'TypeScript', 'CesiumJS', 'PostGIS', 'TimescaleDB', 'pgvector', 'PyTorch', 'ONNX', 'Google Earth Engine', 'MCP', 'Ollama', 'Docker', 'GitLab CI/CD'],
        challenge: `Planners, councils and researchers need to ask "what if?" of a city — what happens to heat if we add trees, to flooding if rainfall changes, to biodiversity if we build a corridor — but the answers sit in specialist simulations, separate datasets and GIS tools that only experts can drive. Physics models like SOLWEIG and HEC-RAS take hours per run, and most users cannot write spatial SQL.`,
        solution: `
            <ul>
                <li><strong>Natural-language spatial analysis:</strong> plain-English questions over PostGIS and authoritative data, answered on a CesiumJS 3D globe through multi-agent text-to-SQL pipelines with schema grounding, critique and self-correction.</li>
                <li><strong>Urban Heat:</strong> a multi-task U-Net trained on SOLWEIG simulations predicts thermal comfort (UTCI) at 1 m across Melbourne — scenario and design editors, Cool Routes, hotspots and a fine-tuned advisor model, served on CPU via ONNX.</li>
                <li><strong>Flood prediction:</strong> U-Net surrogates of a calibrated HEC-RAS 2D model, from terrain-only to rainfall-driven inputs, with time-step progression on the globe, point queries and impact on buildings and roads.</li>
                <li><strong>Connected Corridors:</strong> green-corridor planning — 3D placement of planting elements, a 5 m surface grid from Earth Engine Dynamic World, key outcomes with confidence and evidence tiers, a benefit-per-dollar optimiser and a 0–30-year view.</li>
                <li><strong>AI change detection:</strong> fine-tuned object detectors find unpermitted construction between two aerial-imagery epochs, evaluated against human-confirmed labels.</li>
                <li><strong>CadastreAI:</strong> natural-language access to a unified 2D + 3D Victorian cadastre — millions of parcels, properties and easements plus 3D buildings and strata.</li>
                <li><strong>Smart Auditor:</strong> master-plan compliance checking against Victorian planning rule packs with what-if analysis.</li>
                <li><strong>ABS AI-readiness study:</strong> a benchmark for the Australian Bureau of Statistics measuring how well LLMs answer statistical questions, and how much a tool layer improves them.</li>
                <li><strong>Live World:</strong> live fires, earthquakes, satellite passes and wind on the globe, with a tool-using "Ask" assistant.</li>
                <li><strong>Also:</strong> MCP Flows visual workflow editor and MCP server management, IoT sensor and room-occupancy twin, Earth Engine console, 3D pipeline clash detection, projects and PDF reporting.</li>
            </ul>
        `,
        decisions: `
            <ul>
                <li><strong>Physics → surrogate:</strong> train on trusted simulations (SOLWEIG, HEC-RAS), then serve fast models — answers in seconds instead of hours.</li>
                <li><strong>Evaluation over vanity metrics:</strong> whole-domain evaluation exposed weaknesses that patch-level scores hid, and they were reported rather than buried; detector changes need an A/B scorecard before release.</li>
                <li><strong>Explainable by design:</strong> a deterministic benefit-per-dollar optimiser instead of a black box, and every outcome carries a confidence band and evidence tier.</li>
                <li><strong>Right model for each role:</strong> per-role LLM routing chosen from measured A/B tests, plus self-hosted models with complexity gating to keep costs and data in-house.</li>
                <li><strong>Efficient serving:</strong> ONNX CPU inference, cloud-optimised raster stitching, pre-rendered tiles and input hashing so only changed areas are recomputed.</li>
                <li><strong>Privacy by construction:</strong> read-only camera relay, in-memory frames and anonymised occupancy counts in the IoT twin.</li>
                <li><strong>Built to last:</strong> 1,400+ commits, ~2,000 automated tests, JWT auth with role-based access, Dockerised services and GitLab CI/CD deployment.</li>
            </ul>
        `,
        architecture: `FastAPI (Python 3.11) with ~57 routers, React 19 + TypeScript + Vite + CesiumJS front end, PostgreSQL/PostGIS, TimescaleDB and pgvector,
                       GeoServer and cloud-optimised GeoTIFFs, PyTorch U-Net surrogates served via ONNX, Google Earth Engine, multi-provider LLMs (OpenAI, Anthropic, Gemini)
                       plus self-hosted Ollama models, MCP servers, MQTT/WebSocket IoT, Redis, Docker and GitLab CI/CD on university cloud infrastructure.`,
        demoLink: 'https://geollm.idigitaltwin.org/UMAMI/',
        demoLabel: 'Visit the UMAMI platform',
        privateCode: true
    },
    terrascout: {
        title: 'Terrascout - Geospatial Data Scoping Platform',
        category: 'GeoAI Platform | Live',
        tags: ['FastAPI', 'Python 3.13', 'React 19', 'TypeScript', 'PostGIS', 'pgvector', 'FastMCP', 'Typer CLI', 'STAC', 'Redis', 'Docker'],
        challenge: `Choosing the right satellite, aerial or LiDAR data for a project takes specialist knowledge: which sensor can actually detect the target, at what resolution, how often it revisits, what cloud cover to expect and what it will cost. Sending every request straight to a language model would be slow, expensive and impossible to audit.`,
        solution: `
            <ul>
                <li><strong>Tiered brief parsing:</strong> rules and a gazetteer extract location, objective, resolution and timeframe first; embeddings handle fuzzier matches; the LLM is called only when confidence falls below a configurable threshold.</li>
                <li><strong>Weighted fit score</strong> ranks each sensor on resolution, cost, coverage, temporal fit and quality, with feasibility checked against published detection thresholds.</li>
                <li><strong>AI agents</strong> draft deliverables — methodology, procurement, QA and regulatory checks — on top of the scoped result.</li>
                <li><strong>One engine, four interfaces:</strong> web app, a CLI published on PyPI, an MCP server for AI assistants, and a REST API.</li>
                <li>GIS Copilot chat with a live map, a 3D data catalogue (CesiumJS), team workspaces and role-based access.</li>
            </ul>
        `,
        decisions: `
            <ul>
                <li><strong>Deterministic first:</strong> the LLM enhances the parse only when rules and embeddings are unsure, keeping cost low and decisions traceable.</li>
                <li><strong>Every agent has a deterministic fallback:</strong> named LLM failure modes (bad JSON, missing fields, provider outage) fall back to a rule-based result, labelled with how it was produced.</li>
                <li><strong>Multi-provider LLM failover</strong> through OpenAI-compatible clients, with users' own API keys encrypted at rest.</li>
                <li><strong>Natural-language-to-PostGIS with guard rails:</strong> SELECT-only validation, a keyword deny-list and a forced row limit.</li>
                <li><strong>Tested and gated deploys:</strong> backend, CLI and end-to-end test suites in CI; deploys are health-checked before going live.</li>
            </ul>
        `,
        architecture: `Async FastAPI backend, PostgreSQL + PostGIS + pgvector (Supabase), SQLAlchemy 2 / GeoAlchemy2 with Alembic migrations,
                       FastMCP server and MCP client, Typer + Rich CLI on PyPI, React 19 + TypeScript + Vite + Tailwind, CesiumJS / Leaflet / deck.gl,
                       Redis rate limiting, Docker Compose behind nginx and Cloudflare, GitHub Actions CI/CD.`,
        demoLink: 'https://terrascout.app',
        demoLabel: 'Visit terrascout.app',
        extraLink: 'https://pypi.org/project/terrascout/',
        extraLabel: 'Terrascout CLI on PyPI',
        privateCode: true
    },
    urbanmind: {
        title: 'UrbanMind - Urban Scenario Planning Toolkit',
        category: 'Urban Planning | Live',
        tags: ['QGIS Plugin', 'Python', 'FastAPI', 'PostGIS', 'React', 'TypeScript', 'MapLibre', 'deck.gl', 'PyTorch', 'Supabase'],
        challenge: `Planners need to test "what if" development scenarios against transport, housing, fiscal, heat and biodiversity outcomes — but those analyses live in separate tools, rely on dozens of government data sources, and physics-based heat simulation is far too slow to run interactively.`,
        solution: `
            <ul>
                <li><strong>Scenario painting:</strong> apply development types to parcels on a map; population, dwellings, jobs and density are calculated instantly.</li>
                <li><strong>Planning models</strong> for transport, fiscal impact, green infrastructure, housing, walkability, carbon, biodiversity and urban heat, parameterised to Plan Melbourne, Austroads and Victorian planning provisions.</li>
                <li><strong>Government data integration:</strong> ABS Census, Vicmap, PTV GTFS, building footprints and more, with a spatial cache for slow upstream APIs.</li>
                <li><strong>Urban heat surrogate:</strong> a U-Net trained on SOLWEIG simulation outputs gives near-instant heat estimates for greening and cool-roof scenarios.</li>
                <li><strong>Spatial AI agent</strong> that calls analysis tools to answer questions, with per-user memory.</li>
            </ul>
        `,
        decisions: `
            <ul>
                <li><strong>Physics → surrogate:</strong> train on the slow, trusted simulation, then serve the fast model — accuracy anchored to physics, speed suitable for interaction.</li>
                <li><strong>One model library, two clients:</strong> the same analysis code powers the QGIS plugin and the web platform, so results never drift between tools.</li>
                <li><strong>Safe query DSL for the agent</strong> instead of free-form SQL, with the most thorough test coverage in the codebase.</li>
                <li><strong>Production behind NAT with no open ports:</strong> Cloudflare Tunnel inbound, a self-hosted CI runner for deploys, and a written recovery runbook.</li>
                <li>Local-first LLM with fast fail-over to hosted providers.</li>
            </ul>
        `,
        architecture: `QGIS plugin (Python, PyQt). Web: FastAPI + SQLAlchemy 2 + GeoAlchemy2 + PostGIS with Alembic, React 18 + TypeScript + MapLibre + deck.gl + Zustand,
                       PyTorch U-Net heat surrogate, Supabase Auth, multi-provider LLMs (Ollama, OpenRouter, Groq), Docker + nginx, Cloudflare Tunnel, GitHub Actions.`,
        demoLink: 'https://urbanmind.terrascout.app',
        demoLabel: 'Visit urbanmind.terrascout.app',
        privateCode: true
    },
    geospark: {
        title: 'GeoSpark - Spatial Reasoning for Language Models',
        category: 'Open Source | Research',
        tags: ['Python', 'MCP', 'Shapely', 'pyproj', 'FastAPI', 'Pydantic', 'Ollama', 'Docker', 'Apache 2.0'],
        challenge: `Language models have no geometry engine. Asked for a distance or whether one place lies inside another, they answer from pattern-matching — confidently and often wrong — and different models disagree widely on the same question.`,
        solution: `
            <ul>
                <li><strong>GeoSpark Protocol (GSP):</strong> a typed JSON protocol for spatial operations — topology, geodesic measurement, CRS transforms, geocoding, terrain, routing and spectral indices.</li>
                <li><strong>MCP server, REST API, CLI and Python library</strong>, so any tool-capable model or application can call the same engine.</li>
                <li><strong>GeoSpark Bench:</strong> a 535-question benchmark across distance, topology, reasoning, change and multimodal suites, run on 9 models under bare, chain-of-thought and tool-augmented conditions.</li>
                <li>Published on PyPI as <code>geospark-ai</code>; manuscript under peer review.</li>
            </ul>
        `,
        decisions: `
            <ul>
                <li><strong>Compute, don't guess:</strong> the model decides <em>what</em> to ask; deterministic engines (geodesic distance, Shapely predicates) produce the answer, leaving an auditable tool trace.</li>
                <li><strong>Honest evaluation:</strong> confidence intervals on every score, per-predicate breakdowns that expose "yes-bias", and negative results reported — including cases where prompting or tools made a model worse.</li>
                <li><strong>Local-first:</strong> runs on open-weight models through Ollama, with hosted providers as fallback.</li>
                <li><strong>Production hygiene:</strong> rate limiting, audit logging, non-root multi-stage Docker images and CI across Python 3.10–3.12.</li>
            </ul>
        `,
        architecture: `Python package (hatchling, PyPI) with GSP schema (Pydantic v2), spatial engine (Shapely 2, pyproj), pluggable tools (Nominatim, OSRM, STAC, elevation with vertical datums),
                       MCP stdio server, FastAPI REST API, benchmark runner and scorer, Docker + PostGIS + Redis, GitHub Actions CI.`,
        repoLink: 'https://github.com/Maz2580/geospark',
        extraLink: 'https://pypi.org/project/geospark-ai/',
        extraLabel: 'geospark-ai on PyPI'
    },
    m1Pipeline: {
        title: 'Vicmap M1 Validation Pipeline',
        category: 'Council Automation | Open Source',
        tags: ['Python', 'Flask', 'FME', 'Pozi Connect', 'SQL Server', 'ArcSDE', 'OpenAI / Anthropic', 'IMAP'],
        challenge: `Every fortnight a Victorian council must review proposed property changes (M1s) before they update the state cadastre. Each row was checked by hand against the council's rates system and spatial layers — slow, repetitive, and easy to get wrong when the same few edge cases recur.`,
        solution: `
            <ul>
                <li><strong>End-to-end automation:</strong> watches the inbox for the Vicmap delivery, downloads and extracts it, runs the FME reload workspaces and Pozi Connect tasks, then validates every generated M1 row.</li>
                <li><strong>Rules before the model:</strong> spatial and database rules check each row against the rates system and Vicmap layers; only ambiguous rows go to a language model, with the rule findings as context.</li>
                <li><strong>Advisory output:</strong> KEEP / REJECT with a confidence score and a reason for every row, in a web dashboard with live logs.</li>
                <li>Built for Greater Shepparton Council, then released as an open-source pipeline any Victorian council can configure for its own LGA.</li>
            </ul>
        `,
        decisions: `
            <ul>
                <li><strong>Read-only by design:</strong> production database access allows SELECT only and opens connections read-only, so automation can never write to council data.</li>
                <li><strong>Strict-schema LLM output</strong> with separate system and user prompts, plus graceful fallback for providers without strict mode.</li>
                <li><strong>Provider abstraction</strong> across six LLM backends with fail-over, so councils can use local or low-cost models.</li>
                <li><strong>Self-audited:</strong> a published security audit, with critical and high findings (zip-slip, shell injection, missing auth) fixed before release; CI on Windows and Linux.</li>
                <li><strong>Fails loudly on config:</strong> no default council code, after learning how a silent wrong default can go unnoticed.</li>
            </ul>
        `,
        architecture: `Five-phase pipeline: IMAP email monitor → download/extract → FME workspaces → Pozi Connect → rule engine + LLM validator.
                       Three Flask services (app, validation API, preview API) with bearer-token auth and SSE log streaming; pyodbc to SQL Server / ArcSDE; GitHub Actions CI.`,
        repoLink: 'https://github.com/Maz2580/vicmap-m1-ai-pipeline'
    },
    changeDetection: {
        title: 'AI Building Change Detection',
        category: 'Remote Sensing | Research Prototype',
        tags: ['Python', 'OpenCV', 'Rasterio', 'GeoPandas', 'DINOv2', 'DINOv3', 'ONNX', 'Vision LLM'],
        challenge: `Finding unpermitted or unrecorded building work means comparing aerial imagery from two dates. Simple pixel differencing floods reviewers with false alarms from shadows, vegetation and misalignment, while real new buildings slip through.`,
        solution: `
            <ul>
                <li><strong>Registration and change scoring:</strong> aligns the two dates, then scores colour and edge change, deferring likely shadow regions to a separate output.</li>
                <li><strong>Zero-shot vision models:</strong> DINOv2 patch similarity for semantic change and a DINOv3 building-footprint model run on each date.</li>
                <li><strong>Footprint-led corroboration:</strong> the footprint model supplies the geometry, and change channels only confirm that something changed there — every candidate keeps a support tier.</li>
                <li><strong>Polygon regularisation</strong> snaps outlines to each building's dominant orientation, and an HTML review page shows before/after chips for each candidate.</li>
                <li>Optional vision-language model gives an advisory label per candidate (new building, extension, solar panels…).</li>
            </ul>
        `,
        decisions: `
            <ul>
                <li><strong>Candidates for human review, not automatic verdicts</strong> — the tool narrows the search; people confirm.</li>
                <li><strong>Diagnose before tuning:</strong> a resolution-ladder experiment ruled out image resolution and exposed a preprocessing bug in the footprint model; fixing it transformed detection.</li>
                <li><strong>LLM treated as untrusted:</strong> allow-listed labels, clamped confidence, and a test for prompt injection.</li>
                <li><strong>Measured, not assumed:</strong> each change is checked against a small human-labelled benchmark, with rejected approaches documented.</li>
            </ul>
        `,
        architecture: `Local CLI pipeline: imagery ingestion (tile API or local GeoTIFFs, optional DSM) → ECC registration → change scoring → DINOv2 / DINOv3 channels →
                       fusion and corroboration → regularisation → GeoJSON, raster masks, JSON run report and static HTML review page.`,
        repoLink: 'https://github.com/Maz2580/AI-Geospatial-Change-Detection'
    },
    disasterRecovery: {
        title: 'Disaster Recovery Field Data Collection',
        category: 'Enterprise GIS | Parks Victoria',
        tags: ['ArcGIS Field Maps', 'Survey123', 'ArcGIS Online', 'Dashboards', 'Power BI'],
        challenge: `After floods and bushfires, crews needed to assess damage to park assets in areas with little or no mobile coverage. Paper forms and ad-hoc spreadsheets meant inconsistent data and slow reporting to the people deciding where recovery effort should go.`,
        solution: `
            <ul>
                <li>Designed standardised Survey123 damage-assessment forms with photo capture.</li>
                <li>Configured offline-capable Field Maps that sync when crews reconnect.</li>
                <li>Built dashboards giving recovery leadership a current view of assessed damage.</li>
                <li>Set up ArcGIS Online groups and permissions, and trained field staff on the tools.</li>
            </ul>
        `,
        decisions: `
            <ul>
                <li><strong>Offline first:</strong> designed for the field conditions crews actually faced, not for the office.</li>
                <li><strong>One schema for every crew</strong> so assessments are comparable across regions from day one.</li>
                <li><strong>Training alongside rollout</strong> — adoption by field staff mattered as much as the configuration.</li>
            </ul>
        `,
        architecture: `ArcGIS Online, Survey123 forms, Field Maps with offline areas, ArcGIS Dashboards and Power BI for reporting.`
    },
    cmConnection: {
        title: 'Records-to-GIS Capital Works Link',
        category: 'System Integration | Council',
        tags: ['Python', 'Content Manager SDK', 'FME', 'ArcSDE', 'CustomTkinter'],
        challenge: `Capital works documents live in the council's records system (Content Manager), while the works themselves live as GIS layers. Linking the two meant searching records by hand and copying references between systems.`,
        solution: `
            <ul>
                <li>Search and bulk-download tool for Content Manager, with a GUI, a command-line mode and a batch mode.</li>
                <li>FME pipeline: project export → extract record numbers from free text → download documents → read the spreadsheets → join to capital works layers by asset ID.</li>
                <li>Fuzzy matching of record titles to capital works layers, gated by financial year and a confidence threshold.</li>
            </ul>
        `,
        decisions: `
            <ul>
                <li><strong>Precise extraction:</strong> record-number patterns are separated from look-alike financial years, avoiding false matches.</li>
                <li><strong>Bridging a 32-bit SDK:</strong> FME's 64-bit Python hands off to a separate 32-bit environment to call the records SDK.</li>
                <li><strong>Read-only</strong> access to both the records system and the spatial database.</li>
            </ul>
        `,
        architecture: `Python (Content Manager COM SDK in a 32-bit environment), FME PythonCallers, ArcSDE spatial layers, CustomTkinter GUI.`,
        repoLink: 'https://github.com/Maz2580/CM_connection'
    },
    veniceBiennale: {
        title: 'Song of the Cricket - Venice Lagoon Habitat Analysis',
        category: 'Remote Sensing | Research Collaboration',
        tags: ['Google Earth Engine', 'Landsat 5/7/8', 'NDVI / SAVI / NDMI / NDPI', 'Random Forest', 'K-Means', 'ArcGIS StoryMaps'],
        challenge: `A habitat restoration project for an endangered cricket species in the Venice Lagoon needed to understand how land cover and vegetation had changed over decades, to inform where habitat could be restored.`,
        solution: `
            <ul>
                <li>Built Landsat 5/7/8 composites for the lagoon from 1985 to 2020 in Google Earth Engine.</li>
                <li>Computed vegetation and moisture indices (NDVI, SAVI, NDMI, NDPI) with time series and exports.</li>
                <li>Ran supervised (Random Forest) and unsupervised (K-Means) land-cover classification, change detection and terrain analysis.</li>
                <li>Contributed to the project's ArcGIS StoryMap.</li>
            </ul>
        `,
        decisions: `
            <ul>
                <li><strong>Consistent long record:</strong> Landsat's multi-decade archive chosen over newer sensors to cover the full historical period.</li>
                <li><strong>Honest accuracy:</strong> classification accuracy reported with a note that class imbalance likely inflates it.</li>
            </ul>
        `,
        architecture: `Google Earth Engine (Python API) in Colab, geemap, Landsat Collection 2 Level-2, Random Forest and K-Means classifiers, Google Drive exports, ArcGIS StoryMaps.`,
        demoLink: 'https://storymaps.arcgis.com/stories/bb06dd4eb5164d7eb9fc0dc7ddf1e16c',
        demoLabel: 'View the StoryMap',
        repoLink: 'https://github.com/Maz2580/Venice_Data_Analysis'
    },
    ksaGrf17: {
        title: 'KSA-GRF17 WebODM Plugin',
        category: 'Drone Processing | Geodesy',
        tags: ['WebODM', 'Python', 'Django', 'React', 'EXIF', 'PROJ', 'Docker'],
        challenge: `Drone mapping in Saudi Arabia requires the KSA-GRF17 reference frame, with a 7-parameter Helmert transformation and the correct UTM zone. Setting this by hand for every processing task is error-prone and needs geodetic knowledge most drone operators don't have.`,
        solution: `
            <ul>
                <li>Reads GPS coordinates from drone image EXIF data and detects the correct zone across all five KSA UTM zones (36N–40N).</li>
                <li>Injects the matching KSA-GRF17 PROJ definition automatically when a processing task is created.</li>
                <li>Boundary check so the plugin only acts on imagery inside Saudi Arabia; UI panel and REST endpoints for zone detection.</li>
            </ul>
        `,
        decisions: `
            <ul>
                <li><strong>Zero configuration</strong> for operators — the geodesy is handled for them.</li>
                <li><strong>No external network calls:</strong> fully self-contained and auditable for secure environments.</li>
            </ul>
        `,
        architecture: `WebODM (Django) plugin with signal hooks at task creation, exifread for GPS extraction, PROJ string generation, React UI panel, REST API, Docker install.`,
        repoLink: 'https://github.com/Maz2580/ksa-grf17-webodm-plugin'
    },
    digitalTwinIoT: {
        title: 'IoT Environmental Monitoring',
        category: 'IoT | Master\'s Capstone',
        tags: ['IoT Sensors', 'MQTT', 'FastAPI', 'WebSocket', 'React', 'Plotly'],
        challenge: `Indoor environmental conditions (CO₂, temperature, humidity) were measured by sensors but not visible in one place in real time, making it hard to act on poor air quality or comfort issues.`,
        solution: `
            <ul>
                <li><strong>Capstone:</strong> designed a layered sensing → network → processing → application architecture, streaming sensor readings over MQTT into live dashboards.</li>
                <li><strong>Later rebuild:</strong> a reusable sensor module — MQTT over TLS into FastAPI, history and statistics endpoints, and live WebSocket streaming to a React / Plotly front end.</li>
            </ul>
        `,
        decisions: `
            <ul>
                <li><strong>Publish/subscribe (MQTT)</strong> decouples sensors from the dashboard, so devices can be added without changing the application.</li>
                <li><strong>Push, not poll:</strong> WebSocket streaming keeps dashboards current without hammering the API.</li>
            </ul>
        `,
        architecture: `IoT sensors → MQTT broker (TLS) → FastAPI ingestion with SQLAlchemy → REST + WebSocket → React front end with Plotly charts.`,
        demoLink: 'https://drive.google.com/file/d/189wQVBo0v57z9PZNVuZiXQuXRUWfj0RG/view?usp=sharing',
        demoLabel: 'Watch the capstone demo'
    }
};

function openProjectModal(projectId) {
    const project = projectData[projectId];
    if (!project) return;
    
    modalBody.innerHTML = `
        <div class="project-modal-content">
            <div class="project-modal-header">
                <span class="project-modal-category">${project.category}</span>
                <h2 class="project-modal-title">${project.title}</h2>
                <div class="project-modal-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            
            <div class="project-modal-section">
                <h3><i class="fas fa-exclamation-circle"></i> Challenge</h3>
                <p>${project.challenge}</p>
            </div>
            
            <div class="project-modal-section">
                <h3><i class="fas fa-lightbulb"></i> Approach</h3>
                ${project.solution}
            </div>
            
            <div class="project-modal-section">
                <h3><i class="fas ${project.decisions ? 'fa-scale-balanced' : 'fa-chart-line'}"></i> ${project.decisions ? 'Key Design Decisions' : 'Results & Impact'}</h3>
                ${project.decisions || project.results}
            </div>
            
            <div class="project-modal-section">
                <h3><i class="fas fa-sitemap"></i> Architecture Overview</h3>
                <p>${project.architecture}</p>
            </div>
            
            ${project.demoLink || project.repoLink || project.extraLink || project.privateCode || project.codeAvailable ? `
                <div class="project-modal-footer">
                    ${project.demoLink ? `
                        <p><i class="fas fa-external-link-alt"></i> <a href="${project.demoLink}" target="_blank" rel="noopener" style="color: var(--primary-color); text-decoration: underline;">${project.demoLabel || 'View Project Demo/Documentation'}</a></p>
                    ` : ''}
                    ${project.repoLink ? `
                        <p><i class="fab fa-github"></i> <a href="${project.repoLink}" target="_blank" rel="noopener" style="color: var(--primary-color); text-decoration: underline;">View source on GitHub</a></p>
                    ` : ''}
                    ${project.extraLink ? `
                        <p><i class="fas fa-box-open"></i> <a href="${project.extraLink}" target="_blank" rel="noopener" style="color: var(--primary-color); text-decoration: underline;">${project.extraLabel}</a></p>
                    ` : ''}
                    ${project.privateCode ? `
                        <p><i class="fas fa-lock"></i> Private repository — happy to walk through the code and architecture on request</p>
                    ` : project.codeAvailable ? `
                        <p><i class="fas fa-code"></i> Sanitized code samples and architecture diagrams available upon request</p>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeProjectModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeProjectModal();
    }
});

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contact-form');
const budgetInput = document.getElementById('budget');
const budgetDisplay = document.getElementById('budget-display');
const formMessage = document.getElementById('form-message');

// Update budget display (the budget field is optional — the current form has none)
if (budgetInput && budgetDisplay) {
    budgetInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        budgetDisplay.textContent = value.toLocaleString();
    });
}

// Form submission with Formspree
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Show loading state
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;

    try {
        // Submit form to Formspree
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            // Success message
            formMessage.className = 'form-message success';
            formMessage.textContent = 'Thank you for your message! I will get back to you within 48 hours.';

            // Reset form
            contactForm.reset();

            // Hide message after 7 seconds
            setTimeout(() => {
                formMessage.className = 'form-message';
                formMessage.textContent = '';
            }, 7000);
        } else {
            // Error message
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Oops! There was a problem submitting your form. Please try again or email me directly.';
        }
    } catch (error) {
        // Network error
        formMessage.className = 'form-message error';
        formMessage.textContent = 'Network error. Please check your connection and try again, or email me directly at Mazdak.gh1995@gmail.com';
    } finally {
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.project-card, .skill-card, .service-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// ===== ANIMATED COUNTER FOR METRICS =====
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = Math.ceil(target);
            clearInterval(timer);
        } else {
            element.textContent = Math.ceil(start);
        }
    }, 16);
}

// Intersection Observer for metrics animation
const metricsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const metricValues = entry.target.querySelectorAll('.metric-value[data-target]');
            metricValues.forEach(value => {
                const target = parseInt(value.getAttribute('data-target'));
                animateCounter(value, target);
                value.removeAttribute('data-target'); // Prevent re-animation
            });
            metricsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    // Set initial active nav link
    updateActiveNavLink();

    // Add animation delays to project cards
    document.querySelectorAll('.project-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Add animation delays to skill cards
    document.querySelectorAll('.skill-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.15}s`;
    });

    // Hero highlights are now static badges - no animation needed
    // Achievement badges will animate on page load via CSS

    // Observe GitHub stats for counter animation
    const githubStats = document.querySelector('.github-stats');
    if (githubStats) {
        metricsObserver.observe(githubStats);
    }

    // Add stagger animation to testimonials
    document.querySelectorAll('.testimonial-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });

    // Animate tech bars on scroll
    const techBarsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.tech-bar-fill').forEach((bar, index) => {
                    setTimeout(() => {
                        bar.style.animation = 'fillBar 1.5s ease-out forwards';
                    }, index * 100);
                });
                techBarsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const techGrid = document.querySelector('.tech-grid');
    if (techGrid) {
        techBarsObserver.observe(techGrid);
    }

    console.log('Portfolio initialized successfully!');
});

// ===== UTILITY FUNCTIONS =====
// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Get viewport dimensions
function getViewport() {
    return {
        width: window.innerWidth || document.documentElement.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ===== CERTIFICATE FILTERING =====
function initCertificateFilters() {
    const filterButtons = document.querySelectorAll('.cert-filter-btn');
    const certificateCards = Array.from(document.querySelectorAll('.cert-card'));
    const shownCountElement = document.getElementById('shown-count');
    const totalCountElement = document.getElementById('total-count');
    const toggle = document.getElementById('cert-toggle');
    const FOLDED_LIMIT = 9;

    if (!filterButtons.length || !certificateCards.length) {
        return; // Exit if elements don't exist
    }

    let category = 'all';
    let expanded = false;

    const matches = (card, cat) =>
        cat === 'all' || card.getAttribute('data-category').split(' ').includes(cat);

    // Keep the counts on the filter buttons in step with the real cards
    filterButtons.forEach(button => {
        const cat = button.getAttribute('data-category');
        const countEl = button.querySelector('.cert-count');
        if (countEl) countEl.textContent = `(${certificateCards.filter(c => matches(c, cat)).length})`;
    });
    if (totalCountElement) totalCountElement.textContent = certificateCards.length;

    // Folded: "All" shows the featured credentials, a category shows its first few
    function render() {
        const inCategory = certificateCards.filter(card => matches(card, category));
        let visible = inCategory;
        if (!expanded) {
            const featured = inCategory.filter(card => card.dataset.featured === 'true');
            visible = category === 'all' && featured.length ? featured : inCategory.slice(0, FOLDED_LIMIT);
        }
        certificateCards.forEach(card => card.classList.toggle('hidden', !visible.includes(card)));

        if (shownCountElement) shownCountElement.textContent = visible.length;
        if (toggle) {
            const canExpand = inCategory.length > visible.length || expanded;
            toggle.hidden = !canExpand;
            toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            toggle.textContent = expanded ? 'Show fewer' : `Show all ${inCategory.length} certificates`;
        }
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            category = button.getAttribute('data-category');
            expanded = false;
            render();
        });
    });

    toggle?.addEventListener('click', () => {
        const wasExpanded = expanded;
        expanded = !expanded;
        render();
        // When folding back, return the reader to the top of the section
        if (wasExpanded) document.getElementById('certifications')?.scrollIntoView({ block: 'start' });
    });

    render();
}

// Initialize certificate filters when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initCertificateFilters();
});

// Export functions for external use
window.portfolioUtils = {
    openProjectModal,
    closeProjectModal,
    scrollToTop,
    getViewport,
    isInViewport,
    initCertificateFilters
};

// ===== COLLAPSIBLE SECTIONS =====
function initCollapsibleSections() {
    const expandButtons = document.querySelectorAll('.expand-btn');

    expandButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            const preview = document.querySelector(`[data-preview="${targetId}"]`);

            if (targetSection) {
                // Toggle active state
                const isActive = targetSection.classList.contains('active');

                if (isActive) {
                    // Collapse
                    targetSection.classList.remove('active');
                    button.classList.remove('active');
                    button.innerHTML = '<i class="fas fa-chevron-down"></i> <span>View All</span>';
                    if (preview) preview.classList.remove('expanded');

                    // Scroll to section top
                    const sectionTop = targetSection.closest('section');
                    if (sectionTop) {
                        sectionTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                } else {
                    // Expand
                    targetSection.classList.add('active');
                    button.classList.add('active');
                    button.innerHTML = '<i class="fas fa-chevron-up"></i> <span>Show Less</span>';
                    if (preview) preview.classList.add('expanded');
                }
            }
        });
    });
}

// Initialize collapsible sections
document.addEventListener('DOMContentLoaded', () => {
    initCollapsibleSections();
});

// ===== How I Optimise carousel =====
(function initOptimiseCarousel() {
    const track = document.getElementById('optimise-track');
    const dotsWrap = document.getElementById('optimise-dots');
    if (!track || !dotsWrap) return;

    const slides = Array.from(track.querySelectorAll('.result-card'));
    const prev = track.parentElement.querySelector('.carousel-prev');
    const next = track.parentElement.querySelector('.carousel-next');

    const dots = slides.map((slide, i) => {
        const title = slide.querySelector('.result-headline')?.textContent.trim() || `Project ${i + 1}`;
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.textContent = slide.dataset.short || title;
        dot.setAttribute('role', 'tab');
        dot.setAttribute('title', title);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
        return dot;
    });

    // Slide positions relative to the track (accounts for the gap between slides)
    function slideLeft(i) {
        return slides[i].offsetLeft - slides[0].offsetLeft;
    }

    function currentIndex() {
        let best = 0;
        slides.forEach((_, i) => {
            if (Math.abs(slideLeft(i) - track.scrollLeft) < Math.abs(slideLeft(best) - track.scrollLeft)) best = i;
        });
        return best;
    }

    function goTo(i) {
        const index = Math.max(0, Math.min(slides.length - 1, i));
        track.scrollTo({ left: slideLeft(index) });
    }

    let lastIndex = -1;
    function update() {
        const index = currentIndex();
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
            dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
        });
        // Keep the active tab visible when the tab row scrolls (phones)
        if (index !== lastIndex && dotsWrap.scrollWidth > dotsWrap.clientWidth) {
            const dot = dots[index];
            dotsWrap.scrollTo({ left: dot.offsetLeft - (dotsWrap.clientWidth - dot.offsetWidth) / 2 });
        }
        lastIndex = index;
        // Fit the gallery to the slide being shown, so short slides leave no gap
        track.style.height = slides[index].offsetHeight + 'px';
        if (prev) prev.disabled = index === 0;
        if (next) next.disabled = index === slides.length - 1;
    }

    prev?.addEventListener('click', () => goTo(currentIndex() - 1));
    next?.addEventListener('click', () => goTo(currentIndex() + 1));
    track.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentIndex() - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex() + 1); }
    });

    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load', update); // re-measure once web fonts have loaded
    update();
})();
