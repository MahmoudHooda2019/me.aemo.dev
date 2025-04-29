import ExtensionsAPI from './extensions.js';

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
        this.init();
    }

    init() {
        this.renderExtensions();
        this.setupFilterButtons();
        this.setupSearch();
    }

    renderExtensions(extensions = ExtensionsAPI.getAllExtensions()) {
        this.container.innerHTML = extensions.map(ext => this.createExtensionCard(ext)).join('');
        AOS.refresh(); // Refresh AOS for new elements
    }

    createExtensionCard(extension) {
        const isPaid = extension.price !== 'Free';
        return `
            <article class="card" data-aos="fade-up" data-filter="${extension.filters.join(' ')}" data-href="${extension.href}">
                <div class="price-tag ${isPaid ? 'paid' : 'free'}">${extension.price}</div>
                <div class="card-content">
                    <h3 class="card-title">${extension.title}</h3>
                    <p class="card-subtitle">${extension.subtitle}</p>
                    <div class="card-footer">
                        <span class="card-category">${extension.category}</span>
                        <a href="${extension.href}" class="card-button" aria-label="Learn more about ${extension.title}">
                            Learn More
                        </a>
                    </div>
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

    setupSearch() {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search extensions...';
        searchInput.className = 'search-input';
        
        const filterButtons = document.querySelector('.filter-buttons');
        filterButtons.parentNode.insertBefore(searchInput, filterButtons.nextSibling);

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const allExtensions = ExtensionsAPI.getAllExtensions();
            const filteredExtensions = allExtensions.filter(ext => 
                ext.title.toLowerCase().includes(searchTerm) || 
                ext.subtitle.toLowerCase().includes(searchTerm)
            );
            this.renderExtensions(filteredExtensions);
        });
    }
}

// Initialize AOS
AOS.init({
    duration: 800,
    once: true
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

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize main components
        new CursorController();
        new ParticleSystem();
        new FilterController();

        // Initialize extensions controller
        new ExtensionsController();

        // Setup smooth scroll
        const scrollIndicator = document.querySelector('.scroll-indicator');
        const extensionsSection = document.querySelector('.extensions-section');
        
        if (scrollIndicator && extensionsSection) {
            scrollIndicator.addEventListener('click', () => {
                extensionsSection.scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Setup card navigation
        document.querySelectorAll('.card').forEach(card => {
            const href = card.getAttribute('data-href');
            if (!href) return;

            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('card-button')) {
                    window.location.href = href;
                }
            });

            const button = card.querySelector('.card-button');
            button?.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = href;
            });
        });

    } catch (error) {
        utils.handleError(error, 'Main initialization');
    }
});
