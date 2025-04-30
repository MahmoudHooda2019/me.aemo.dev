import ExtensionsAPI from './extensions/extensions.js';

// Constants and Config
const CONFIG = {
    PARTICLE: {
        SIZE: '2px',
        COLOR: '#00ffcc',
        INTERVAL: 100,
        LIFETIME: 3000,
        TRANSITION: 3000
    },
    ANIMATION: {
        DURATION: 1000,
        OFFSET: 100
    },
    FILTER: {
        TRANSITION_DELAY: 300
    }
};

// Utility functions
const utils = {
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    getRandomPosition: () => ({
        x: Math.random() * 100,
        y: Math.random() * 100
    }),
    
    handleError: (error, context) => {
        console.error(`Error in ${context}:`, error);
    }
};

// Cursor Controller
class CursorController {
    constructor() {
        this.cursor = document.querySelector('.cursor');
        this.links = document.querySelectorAll('a, button, .card');
        this.isVisible = true;
        this.init();
    }

    init() {
        try {
            this.handleMouseMove();
            this.handleLinkInteractions();
            this.handleVisibilityChange();
        } catch (error) {
            utils.handleError(error, 'CursorController initialization');
        }
    }

    handleMouseMove() {
        document.addEventListener('mousemove', utils.debounce((e) => {
            if (this.cursor && this.isVisible) {
                const { clientX, clientY } = e;
                this.cursor.style.transform = `translate(${clientX}px, ${clientY}px)`;
            }
        }, 5));
    }

    handleLinkInteractions() {
        this.links.forEach(link => {
            link.addEventListener('mouseenter', () => this.cursor?.classList.add('grow'));
            link.addEventListener('mouseleave', () => this.cursor?.classList.remove('grow'));
        });
    }

    handleVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
        });
    }
}

// Particle System
class ParticleSystem {
    constructor() {
        this.container = document.querySelector('.particles');
        this.particles = new Set();
        this.isActive = true;
        this.init();
    }

    init() {
        if (!this.container) return;
        
        document.addEventListener('visibilitychange', () => {
            this.isActive = !document.hidden;
            if (!this.isActive) this.clearParticles();
        });

        this.startParticleGeneration();
    }

    createParticle() {
        try {
            const particle = document.createElement('div');
            const { x, y } = utils.getRandomPosition();
            
            Object.assign(particle.style, {
                position: 'absolute',
                width: CONFIG.PARTICLE.SIZE,
                height: CONFIG.PARTICLE.SIZE,
                background: CONFIG.PARTICLE.COLOR,
                left: `${x}%`,
                top: `${y}%`,
                opacity: Math.random().toString(),
                transition: `all ${CONFIG.PARTICLE.TRANSITION}ms ease`,
                transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`
            });

            this.container.appendChild(particle);
            this.particles.add(particle);

            setTimeout(() => {
                particle.style.opacity = '0';
                setTimeout(() => {
                    this.particles.delete(particle);
                    particle.remove();
                }, CONFIG.PARTICLE.LIFETIME);
            }, 100);

        } catch (error) {
            utils.handleError(error, 'Particle creation');
        }
    }

    startParticleGeneration() {
        setInterval(() => {
            if (this.isActive && document.visibilityState === 'visible') {
                this.createParticle();
            }
        }, CONFIG.PARTICLE.INTERVAL);
    }

    clearParticles() {
        this.particles.forEach(particle => particle.remove());
        this.particles.clear();
    }
}

// Filter Controller
class FilterController {
    constructor() {
        this.buttons = document.querySelectorAll('.filter-btn');
        this.cards = document.querySelectorAll('.card');
        this.init();
    }

    init() {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
    }

    handleFilter(e) {
        try {
            const btn = e.currentTarget;
            const filter = btn.getAttribute('data-filter');

            this.updateActiveButton(btn);
            this.filterCards(filter);
        } catch (error) {
            utils.handleError(error, 'Filter handling');
        }
    }

    updateActiveButton(activeBtn) {
        this.buttons.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    filterCards(filter) {
        this.cards.forEach(card => {
            const isVisible = filter === 'all' || card.getAttribute('data-filter').includes(filter);
            this.toggleCardVisibility(card, isVisible);
        });
    }

    toggleCardVisibility(card, isVisible) {
        if (isVisible) {
            card.style.display = 'block';
            requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            });
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            setTimeout(() => {
                card.style.display = 'none';
            }, CONFIG.FILTER.TRANSITION_DELAY);
        }
    }
}

// Extensions Section Controller
class ExtensionsController {
    constructor() {
        this.container = document.querySelector('.card-container');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.currentFilter = 'all';
    }

    async init() {
        try {
            await this.renderExtensions();
            this.setupFilterButtons();
        } catch (error) {
            console.error('Error initializing extensions:', error);
        }
    }

    async renderExtensions(extensions = ExtensionsAPI.getAllExtensions()) {
        if (!this.container) return;
        
        try {
            // Clear existing content
            this.container.innerHTML = '';
            
            // Create and append cards
            const cards = extensions.map(ext => this.createExtensionCard(ext));
            this.container.innerHTML = cards.join('');
        } catch (error) {
            console.error('Error rendering extensions:', error);
        }
    }

    createExtensionCard(extension) {
        const isPaid = extension.price !== 'Free';
        return `
            <article class="card" data-filter="${extension.filters.join(' ')}" onclick="window.location.href='extensions/template.html?id=${extension.id}'" style="cursor: pointer;">
                <div class="price-tag ${isPaid ? 'paid' : 'free'}">${extension.price}</div>
                <div class="card-content">
                    <h3 class="card-title">${extension.title}</h3>
                    <p class="card-subtitle">${extension.subtitle}</p>
                </div>
            </article>
        `;
    }

    setupFilterButtons() {
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.filterExtensions(filter);
                this.updateActiveButton(btn);
            });
        });
    }

    filterExtensions(filter) {
        this.currentFilter = filter;
        const filteredExtensions = ExtensionsAPI.getExtensionsByFilter(filter);
        this.renderExtensions(filteredExtensions);
    }

    updateActiveButton(activeBtn) {
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }
}

// Initialize AOS
AOS.init({
    duration: 800,
    once: true,
    offset: 100,
    delay: 100
});

// Loading screen functionality
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    
    // Wait for all images to load
    const images = document.querySelectorAll('img');
    let loadedImages = 0;
    
    if (images.length === 0) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 1000);
        return;
    }
    
    images.forEach(img => {
        if (img.complete) {
            loadedImages++;
            checkLoadingComplete();
        } else {
            img.addEventListener('load', () => {
                loadedImages++;
                checkLoadingComplete();
            });
        }
    });
    
    function checkLoadingComplete() {
        if (loadedImages === images.length) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 1000);
        }
    }
});

// Simplified initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Update year in footer
        document.getElementById('current-year').textContent = new Date().getFullYear();

        // Initialize extensions controller
        const extensionsController = new ExtensionsController();
        await extensionsController.init();

        // Setup floating button
        const floatingBtn = document.querySelector('.floating-btn');
        floatingBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

    } catch (error) {
        console.error('Error initializing website:', error);
    }
});

// Remove all other initialization code and animation-related code
