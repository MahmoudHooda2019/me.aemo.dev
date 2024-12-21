// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Custom cursor
const cursor = document.querySelector('.cursor');
const links = document.querySelectorAll('a, button, .card');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursor.classList.add('grow');
    });
    
    link.addEventListener('mouseleave', () => {
        cursor.classList.remove('grow');
    });
});

function createParticle() {
    const particles = document.querySelector('.particles');
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = '5px';  // Bigger size for visibility
    particle.style.height = '5px';
    particle.style.background = '#00ffcc';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.opacity = 0.8;  // Fix opacity to make particles visible
    particle.style.transition = 'transform 3s ease, opacity 3s ease';  // Smooth transition
    
    particles.appendChild(particle);
    
    setTimeout(() => {
        particle.style.transform = `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`;
        particle.style.opacity = 0;
    }, 100);
    
    setTimeout(() => {
        particle.remove();
    }, 3000);
}


setInterval(createParticle, 100);

// Logo animation control
const logo = document.querySelector('.logo');
logo.addEventListener('mouseenter', () => {
    logo.style.animation = 'glow 0.5s ease-in-out infinite alternate';
});

logo.addEventListener('mouseleave', () => {
    logo.style.animation = 'glow 1s ease-in-out infinite alternate';
});

// Filter functionality
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        // Filter cards
        cards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-filter').includes(filter)) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Handle card and button clicks
cards.forEach(card => {
    const href = card.getAttribute('data-href');
    
    // Handle entire card click
    card.addEventListener('click', (e) => {
        // Don't navigate if clicking the button
        if (!e.target.classList.contains('card-button')) {
            window.location.href = href;
        }
    });
    
    // Handle Learn More button click
    const button = card.querySelector('.card-button');
    button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click event
        window.location.href = href;
    });
});

// Smooth scroll functionality
document.querySelector('.scroll-indicator').addEventListener('click', () => {
    document.querySelector('.extensions-section').scrollIntoView({
        behavior: 'smooth'
    });
});
