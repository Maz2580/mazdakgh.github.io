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

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('theme-toggle');
let currentTheme = localStorage.getItem('theme') || 'dark';

// Apply saved theme
if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const icon = themeToggle.querySelector('i');
    
    if (document.body.classList.contains('light-theme')) {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    }
});

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
        title: 'UMAMI - University of Melbourne AI for Mapping & Insights',
        category: 'GeoAI Platform | Enterprise Solution',
        tags: ['GeoAI', 'n8n', 'PostGIS', 'GPT-4', 'Gemini', 'Groq', 'CesiumJS', 'Google Earth Engine', 'React', 'JWT Auth'],
        challenge: `Research institutions and sustainability planners needed an intuitive way to query complex geospatial databases without SQL expertise. Traditional GIS tools required specialized training, creating bottlenecks when non-technical users needed spatial insights. The challenge was to build an enterprise-grade platform that could handle natural language queries while maintaining accuracy, security, and performance at scale.`,
        solution: `
            <ul>
                <li>Architected multi-agent "swarm" system with 7 specialized AI agents (Spatial Analyst, Data Validator, GIS Troubleshooter, Performance Optimizer, Quality Assurance, and more) orchestrated through n8n workflows</li>
                <li>Implemented multi-LLM strategy: Gemini for query decomposition, GPT-4 for code generation and execution, Groq for fast formatting with agents critiquing each other's outputs</li>
                <li>Built natural language to PostGIS SQL translation engine with automatic spatial analysis generation</li>
                <li>Integrated Google Earth Engine for NDVI, NDWI, elevation, land cover, and surface temperature analysis</li>
                <li>Developed CesiumJS-based 3D visualization with pipeline clearance analysis and elevation profiles</li>
                <li>Implemented full production stack: JWT authentication, role-based access control, personal API key management, admin dashboard</li>
                <li>Created VicMap services integration and real-time campus dataset connectivity</li>
                <li>Built interactive response system delivering GeoJSON, maps, tables, and charts</li>
            </ul>
        `,
        results: `
            <ul>
                <li>Currently deployed on <strong>University of Melbourne campus datasets</strong> supporting sustainability planners and research teams</li>
                <li>Processing <strong>200+ natural language queries weekly</strong> with 90% accuracy rate</li>
                <li><strong>70% reduction in support requests</strong> to GIS team from non-technical users</li>
                <li>Secured funding from <strong>Melbourne Climate Futures (Climate Research Accelerator)</strong> for scaling to precinct and city level</li>
                <li>Expanding to government and industry partners across Victoria</li>
                <li>Platform handles complex spatial operations that previously required GIS specialists</li>
            </ul>
        `,
        architecture: `Multi-agent swarm architecture: n8n workflow orchestration, Python backends with FastAPI,
                       PostgreSQL/PostGIS database, Multiple LLM integration (Gemini, GPT-4, Groq), React frontend,
                       CesiumJS for 3D visualization, Google Earth Engine API, JWT authentication, Role-based access control.`,
        codeAvailable: true,
        demoLink: 'https://drive.google.com/file/d/1jVf-fg_V63DQSixJDvxHTbm43zOMfo6x/view?usp=sharing'
    },
    veniceBiennale: {
        title: 'Song of the Cricket - Venice Biennale 2025',
        category: 'Research & Conservation | International Collaboration',
        tags: ['Earth Observation', 'AI Habitat Modeling', 'ArcGIS StoryMaps', 'Digital Twin', 'Land Use Analysis', 'Species Conservation'],
        challenge: `The endangered Zeuneriana marmorata cricket species faces extinction in the Venice Lagoon due to habitat loss and environmental change. The project required mapping historical land-use changes, analyzing vegetation dynamics, and developing an AI-based habitat suitability model to guide species translocation efforts. This interdisciplinary challenge brought together ecologists, designers, engineers, and geospatial scientists in an international collaboration.`,
        solution: `
            <ul>
                <li>Led geospatial analysis mapping historical land-use change and vegetation dynamics across Venice Lagoon using multi-temporal satellite imagery</li>
                <li>Developed AI-based habitat suitability modeling to identify optimal translocation sites for endangered cricket species</li>
                <li>Integrated Earth observation data with ecological field surveys to validate habitat quality indicators</li>
                <li>Created interactive ArcGIS StoryMap documenting the project's scientific approach, findings, and conservation strategy</li>
                <li>Designed spatial analysis workflows supporting floating ecological infrastructure placement</li>
                <li>Established foundation for future adaptive Digital Twin system monitoring habitat changes in real-time</li>
                <li>Collaborated with University of Melbourne (CSDILA), Arup, and international partners across Italy and Australia</li>
            </ul>
        `,
        results: `
            <ul>
                <li><strong>Featured at Venice Biennale 2025</strong> showcasing innovative intersection of technology, ecology, and design</li>
                <li>Identified <strong>priority translocation zones</strong> based on multi-criteria habitat suitability analysis</li>
                <li>Created comprehensive <strong>historical land-use change analysis</strong> spanning multiple decades</li>
                <li>Established <strong>international research collaboration</strong> between Australian and European institutions</li>
                <li>Developed replicable methodology for <strong>AI-driven species conservation</strong> applicable to other endangered species</li>
                <li>Foundation work for <strong>adaptive Digital Twin system</strong> for ongoing ecosystem monitoring</li>
            </ul>
        `,
        architecture: `Multi-temporal satellite imagery analysis, AI-based habitat suitability modeling,
                       ArcGIS Pro for spatial analysis, ArcGIS StoryMaps for communication,
                       Earth observation data integration, Field survey data fusion, Cloud-based geospatial processing.`,
        codeAvailable: false,
        demoLink: 'https://storymaps.arcgis.com/stories/bb06dd4eb5164d7eb9fc0dc7ddf1e16c'
    },
    digitalTwinIoT: {
        title: 'Digital Twin with IoT for Real-time Indoor Environmental Monitoring',
        category: 'Digital Twin | IoT | Smart Buildings',
        tags: ['Digital Twin', 'IoT', 'LoRaWAN', 'MQTT', 'Real-time Monitoring', 'CesiumJS', 'React', 'Environmental Sensors'],
        challenge: `University of Melbourne's D-Lab needed a comprehensive system to monitor and visualize indoor environmental conditions in real-time for climate control optimization and energy efficiency. The challenge involved integrating diverse IoT sensors, establishing reliable data transmission over LoRaWAN, overcoming data protocol compatibility issues, and creating spatially accurate interactive dashboards for proactive environmental management.`,
        solution: `
            <ul>
                <li>Developed four-layer Digital Twin architecture: sensing layer (IoT sensors), network layer (LoRaWAN), data processing layer (MQTT real-time sync), application layer (interactive dashboards)</li>
                <li>Deployed environmental sensor network tracking CO₂, temperature, humidity, and air quality across D-Lab facility</li>
                <li>Implemented LoRaWAN connectivity for low-power, long-range sensor communication</li>
                <li>Built MQTT-based real-time data synchronization pipeline ensuring sub-second latency</li>
                <li>Created interactive 3D visualization dashboard using CesiumJS and React for spatially accurate environmental monitoring</li>
                <li>Overcame data protocol challenges through custom middleware ensuring reliable sensor-to-platform communication</li>
                <li>Designed system architecture supporting future expansion to outdoor applications (flood, fire detection)</li>
                <li>Integrated climate control optimization algorithms based on real-time sensor data</li>
            </ul>
        `,
        results: `
            <ul>
                <li><strong>Stable real-time monitoring</strong> across entire D-Lab facility with 99.5% uptime</li>
                <li><strong>Enhanced climate control</strong> enabling data-driven HVAC optimization</li>
                <li><strong>Energy use optimization</strong> through intelligent environmental monitoring</li>
                <li><strong>Proactive environmental management</strong> with predictive alerts for temperature/air quality anomalies</li>
                <li><strong>Scalable architecture</strong> proven reliable for future expansion to outdoor monitoring</li>
                <li>Completed as <strong>Master's capstone project</strong> at University of Melbourne</li>
                <li>Foundation for future ML integration for predictive insights and AR/VR immersive interaction</li>
            </ul>
        `,
        architecture: `Four-layer Digital Twin architecture: IoT sensor network (CO₂, temperature, humidity sensors),
                       LoRaWAN network infrastructure, MQTT real-time data pipeline, React + CesiumJS visualization layer,
                       PostgreSQL time-series database, Custom middleware for protocol translation.`,
        codeAvailable: true,
        demoLink: 'https://drive.google.com/file/d/189wQVBo0v57z9PZNVuZiXQuXRUWfj0RG/view?usp=sharing'
    },
    project1: {
        title: 'Municipal Property Data Automation System',
        category: 'Automation | Data Engineering',
        tags: ['Python', 'FME', 'PostgreSQL', 'ArcGIS Enterprise', 'n8n'],
        challenge: `Local government required bi-weekly processing of 50,000+ property records from state cadastral system. 
                   Manual validation was taking 8+ hours per cycle with frequent data quality issues causing delays and errors 
                   in property addressing systems.`,
        solution: `
            <ul>
                <li>Engineered automated ETL pipeline using FME and Python for data extraction and transformation</li>
                <li>Implemented comprehensive data quality checks and validation rules to catch errors before database updates</li>
                <li>Created automated M1/M2 form generation and submission workflow to Victorian Edit System (VES)</li>
                <li>Built monitoring dashboard for real-time tracking of data processing status and error logging</li>
                <li>Integrated with Victorian Edit System (VES) API for seamless form submission</li>
            </ul>
        `,
        results: `
            <ul>
                <li><strong>90% reduction</strong> in processing time - from 8 hours to 45 minutes per cycle</li>
                <li>Improved data accuracy by implementing validation checkpoints that catch 95% of errors before submission</li>
                <li>Eliminated manual form submission errors completely</li>
                <li>Enabled real-time tracking of data updates across the organization</li>
            </ul>
        `,
        architecture: `System consists of: (1) FME Server workflow for data extraction, (2) Python validation engine, 
                       (3) PostgreSQL spatial database, (4) n8n automation for notifications and scheduling, 
                       (5) Custom monitoring dashboard built with React.`,
        codeAvailable: true
    },
    project2: {
        title: 'Enterprise Geospatial Dashboard Platform',
        category: 'Web Application | Visualization',
        tags: ['React', 'OpenLayers', 'Python FastAPI', 'PostGIS', 'Docker'],
        challenge: `Research organization needed interactive platform to visualize environmental monitoring data across 
                   200+ sensor locations with real-time updates and historical trend analysis. Existing tools were slow, 
                   not mobile-friendly, and couldn't handle concurrent users.`,
        solution: `
            <ul>
                <li>Built full-stack web application with React frontend for responsive, interactive user experience</li>
                <li>Implemented OpenLayers for advanced mapping with custom controls, measurement tools, and layer management</li>
                <li>Designed RESTful API using Python FastAPI serving GeoJSON features from PostGIS database</li>
                <li>Created responsive dashboard with real-time data visualization and historical trend charts</li>
                <li>Dockerized entire application with Docker Compose for consistent deployment</li>
                <li>Implemented CI/CD pipeline via GitLab for automated testing and deployment</li>
            </ul>
        `,
        results: `
            <ul>
                <li>Platform successfully serving <strong>50+ concurrent users</strong> across research teams</li>
                <li><strong>Sub-second query response times</strong> for spatial analyses even with large datasets</li>
                <li>Mobile-responsive design enabling field data access on tablets and smartphones</li>
                <li>Deployed on Google Cloud Platform with <strong>99.9% uptime</strong> over 6 months</li>
            </ul>
        `,
        architecture: `React SPA with TypeScript, OpenLayers for mapping, Python FastAPI backend, 
                       PostGIS database for spatial queries, Docker containerization, GitLab CI/CD pipeline.`,
        codeAvailable: true
    },
    project3: {
        title: 'Disaster Recovery Field Data Collection System',
        category: 'Enterprise GIS | Mobile Solutions',
        tags: ['ArcGIS Field Maps', 'Survey123', 'ArcGIS Online', 'Power BI'],
        challenge: `State agency needed rapid deployment of field data collection system for disaster recovery operations 
                   across flood and fire-affected regions. System had to work offline, sync when connected, and provide 
                   real-time dashboards for decision-makers.`,
        solution: `
            <ul>
                <li>Designed integrated field data collection workflows using ArcGIS Field Maps and Survey123</li>
                <li>Configured custom Survey123 forms for standardized asset damage assessments with photo capture</li>
                <li>Implemented offline-capable Field Maps with real-time sync when connectivity available</li>
                <li>Created Power BI dashboards for leadership with real-time damage assessment metrics</li>
                <li>Trained 30+ field staff on mobile GIS tools through hands-on workshops</li>
                <li>Set up ArcGIS Online organization with proper permissions and data management</li>
            </ul>
        `,
        results: `
            <ul>
                <li>Collected <strong>10,000+ damage assessments</strong> in first 3 months of operation</li>
                <li>Reduced reporting lag from <strong>days to hours</strong> with real-time data sync</li>
                <li>Enabled evidence-based resource allocation saving an estimated $2M in recovery operations</li>
                <li>Improved inter-agency coordination with shared situational awareness dashboards</li>
            </ul>
        `,
        architecture: `ArcGIS Online as backend, Field Maps for mobile data collection, Survey123 for structured forms, 
                       Power BI for dashboards, ArcGIS Enterprise for advanced analytics.`,
        codeAvailable: false
    },
    project4: {
        title: 'AI-Powered Spatial Query Platform',
        category: 'Machine Learning | Automation',
        tags: ['Python', 'n8n', 'PostGIS', 'OpenAI API', 'React'],
        challenge: `Research team required natural language interface to query complex geospatial database without requiring 
                   SQL expertise. Non-technical researchers were dependent on GIS team for even basic queries, creating 
                   bottlenecks and delays.`,
        solution: `
            <ul>
                <li>Developed multi-agent AI system for spatial query interpretation using OpenAI API</li>
                <li>Integrated n8n workflow automation with Python backends for query processing</li>
                <li>Created React frontend with conversational interface for natural language queries</li>
                <li>Implemented PostGIS spatial queries generated from natural language input</li>
                <li>Built context-aware response system that remembers previous queries</li>
                <li>Added query validation and error handling to prevent incorrect spatial operations</li>
            </ul>
        `,
        results: `
            <ul>
                <li><strong>70% reduction</strong> in support requests to GIS team</li>
                <li>Non-technical researchers can now query spatial database independently</li>
                <li>Enabled ad-hoc spatial analysis without coding knowledge</li>
                <li>Processing <strong>200+ queries per week</strong> with 90% accuracy rate</li>
            </ul>
        `,
        architecture: `React frontend, n8n workflow orchestration, Python backend with OpenAI integration, 
                       PostGIS database for spatial queries, Redis for session management.`,
        codeAvailable: true
    },
    project5: {
        title: 'Cloud-Based Asset Management Integration',
        category: 'Data Engineering | Cloud Infrastructure',
        tags: ['GCP', 'Docker', 'PostgreSQL', 'Python', 'GitLab CI/CD'],
        challenge: `Municipal asset management system required integration with spatial database, automated reporting, 
                   and secure cloud hosting. Legacy on-premise solution was expensive, difficult to maintain, and lacked 
                   scalability for future growth.`,
        solution: `
            <ul>
                <li>Architected cloud-based data pipeline on Google Cloud Platform (GCP)</li>
                <li>Dockerized microservices architecture for asset data processing and API endpoints</li>
                <li>Implemented automated data synchronization workflows between asset system and GIS database</li>
                <li>Built secure API endpoints with OAuth authentication for external integrations</li>
                <li>Created versioned releases via GitLab CI/CD with automated testing</li>
                <li>Set up monitoring and logging using GCP Cloud Operations</li>
            </ul>
        `,
        results: `
            <ul>
                <li>Real-time asset data synchronization between systems</li>
                <li><strong>40% reduction</strong> in infrastructure costs vs on-premise solution</li>
                <li>Automated daily reports and notifications for asset managers</li>
                <li>Scalable architecture supporting future growth without major rework</li>
            </ul>
        `,
        architecture: `Docker containers on GCP Cloud Run, PostgreSQL Cloud SQL database, Cloud Functions for 
                       event triggers, GitLab CI/CD pipeline, Cloud Storage for backups.`,
        codeAvailable: true
    },
    project6: {
        title: 'Interactive 3D Urban Digital Twin',
        category: 'Web Application | 3D Visualization',
        tags: ['Cesium', 'React', 'TypeScript', 'IoT', 'MQTT'],
        challenge: `University research project required 3D visualization platform for indoor/outdoor environmental 
                   monitoring with real-time sensor integration. Traditional 2D mapping was insufficient for understanding 
                   vertical air quality gradients in urban canyons.`,
        solution: `
            <ul>
                <li>Built React + TypeScript application with Cesium for 3D rendering and visualization</li>
                <li>Integrated IoT sensor data via MQTT protocol for real-time environmental monitoring</li>
                <li>Implemented real-time data streaming and 3D visualization with color-coded air quality indicators</li>
                <li>Created custom 3D building models and campus mapping from LiDAR data</li>
                <li>Designed responsive UI for multi-device access (desktop, tablet, mobile)</li>
                <li>Added temporal playback feature for historical data analysis</li>
            </ul>
        `,
        results: `
            <ul>
                <li>Live monitoring of <strong>50+ environmental sensors</strong> (temperature, humidity, PM2.5, CO2)</li>
                <li>Interactive 3D campus exploration with sensor data overlay</li>
                <li>Historical data playback and trend analysis capabilities</li>
                <li>Presented at <strong>Venice Biennale</strong> and multiple academic conferences</li>
            </ul>
        `,
        architecture: `React with TypeScript, Cesium for 3D rendering, MQTT broker for IoT data, 
                       Node.js backend for data processing, MongoDB for time-series data storage.`,
        codeAvailable: true
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
                <h3><i class="fas fa-lightbulb"></i> Solution</h3>
                ${project.solution}
            </div>
            
            <div class="project-modal-section">
                <h3><i class="fas fa-chart-line"></i> Results & Impact</h3>
                ${project.results}
            </div>
            
            <div class="project-modal-section">
                <h3><i class="fas fa-sitemap"></i> Architecture Overview</h3>
                <p>${project.architecture}</p>
            </div>
            
            ${project.codeAvailable || project.demoLink ? `
                <div class="project-modal-footer">
                    ${project.demoLink ? `
                        <p><i class="fas fa-external-link-alt"></i> <a href="${project.demoLink}" target="_blank" rel="noopener" style="color: var(--primary-color); text-decoration: underline;">View Project Demo/Documentation</a></p>
                    ` : ''}
                    ${project.codeAvailable ? `
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

// Update budget display
budgetInput.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    budgetDisplay.textContent = value.toLocaleString();
});

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

// ===== TYPING EFFECT FOR HERO (Optional) =====
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    heroTitle.style.opacity = '1';
    
    let index = 0;
    function typeWriter() {
        if (index < text.length) {
            heroTitle.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 50);
        }
    }
    
    // Uncomment to enable typing effect
    // setTimeout(typeWriter, 500);
}

// ===== SKILLS CARD HOVER EFFECT =====
document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('mouseenter', () => {
        tag.style.transform = 'scale(1.1)';
    });
    
    tag.addEventListener('mouseleave', () => {
        tag.style.transform = 'scale(1)';
    });
});

// ===== PARALLAX EFFECT FOR HERO =====
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroVisual && scrolled < window.innerHeight) {
        heroVisual.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
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
    const certificateCards = document.querySelectorAll('.cert-card');
    const shownCountElement = document.getElementById('shown-count');

    if (!filterButtons.length || !certificateCards.length) {
        return; // Exit if elements don't exist
    }

    // Filter certificates by category
    function filterCertificates(category) {
        let visibleCount = 0;

        certificateCards.forEach(card => {
            const cardCategories = card.getAttribute('data-category').split(' ');

            if (category === 'all' || cardCategories.includes(category)) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Update the shown count
        if (shownCountElement) {
            shownCountElement.textContent = visibleCount;
        }
    }

    // Add click event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Get category and filter
            const category = button.getAttribute('data-category');
            filterCertificates(category);
        });
    });

    // Initialize with all certificates visible
    filterCertificates('all');
}

// Initialize certificate filters when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initCertificateFilters();
});

// ===== 3D PARTICLE NETWORK CANVAS =====
class ParticleNetwork {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 80;
        this.maxDistance = 150;
        this.mouse = { x: null, y: null, radius: 150 };

        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = document.documentElement.scrollHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
    }

    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY + window.scrollY;
    }

    drawParticles() {
        this.particles.forEach(particle => {
            // Mouse interaction
            if (this.mouse.x && this.mouse.y) {
                const dx = particle.x - this.mouse.x;
                const dy = particle.y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    particle.vx += Math.cos(angle) * force * 0.2;
                    particle.vy += Math.sin(angle) * force * 0.2;
                }
            }

            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Boundary check
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            // Friction
            particle.vx *= 0.99;
            particle.vy *= 0.99;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(14, 165, 233, 0.8)';
            this.ctx.fill();
        });
    }

    connectParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.maxDistance) {
                    const opacity = 1 - (distance / this.maxDistance);
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(14, 165, 233, ${opacity * 0.3})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawParticles();
        this.connectParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// ===== 3D CARD TILT EFFECT =====
function init3DCardTilt() {
    const cards = document.querySelectorAll('.project-card, .cert-card, .experience-card, .testimonial-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * 5;
            const rotateY = ((x - centerX) / centerX) * -5;

            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(10px)
                scale(1.02)
            `;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)';
        });
    });
}

// ===== SCROLL-BASED PARALLAX =====
function initScrollParallax() {
    const hero = document.querySelector('.hero-visual');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;

        // Parallax effect for hero
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.4}px)`;
        }
    });
}

// Initialize all 3D effects
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle network
    new ParticleNetwork();

    // Initialize 3D card tilts
    init3DCardTilt();

    // Initialize parallax
    initScrollParallax();

    console.log('3D interactive effects initialized!');
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
