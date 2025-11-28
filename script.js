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
            
            ${project.codeAvailable ? `
                <div class="project-modal-footer">
                    <p><i class="fas fa-code"></i> Sanitized code samples and architecture diagrams available upon request</p>
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

// Form submission
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading state
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        // Success message
        formMessage.className = 'form-message success';
        formMessage.textContent = 'Thank you for your message! I will get back to you within 48 hours.';
        
        // Reset form
        contactForm.reset();
        budgetDisplay.textContent = '15,000';
        
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
        
        // Log form data (in production, send to backend)
        console.log('Form submitted:', data);
    }, 1500);
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

// Export functions for external use
window.portfolioUtils = {
    openProjectModal,
    closeProjectModal,
    scrollToTop,
    getViewport,
    isInViewport
};
