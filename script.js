// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Smooth scroll functionality
document.querySelector('.scroll-indicator').addEventListener('click', () => {
    document.querySelector('.extensions-section').scrollIntoView({
        behavior: 'smooth'
    });
});

// Add hover effect for cards
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Add click effect for buttons
document.querySelectorAll('.card-button').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
    });
});
