
const particleContainer = document.getElementById('particle-container');
const NUM_PARTICLES = 50;

/**
 * Utility function to generate a random number within a range.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random number.
 */
const random = (min, max) => Math.random() * (max - min) + min;

// 1. Particle generation and continuous movement (unchanged from prior version)
for (let i = 0; i < NUM_PARTICLES; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Set initial randomized position
    gsap.set(particle, {
        x: random(0, window.innerWidth),
        y: random(0, window.innerHeight),
        scale: random(0.5, 2),
        opacity: 0,
    });

    particleContainer.appendChild(particle);
    
    createParticleAnimation(particle);
}

/**
 * Creates an infinitely looping, randomized animation for a single particle.
 * (The background drift effect)
 * @param {HTMLElement} particle - The particle element to animate.
 */
function createParticleAnimation(particle) {
    const duration = random(60, 120); 
    gsap.to(particle, {
        duration: duration,
        x: random(0, window.innerWidth),
        y: random(0, window.innerHeight),
        scale: random(1.5, 3), 
        opacity: random(0.2, 0.7), 
        repeat: -1, 
        yoyo: true, 
        ease: "none", 
        delay: random(0, duration) * -1, 
        onRepeat: function() {
            // Recalculate new destination on each loop iteration
            gsap.to(this.targets()[0], {
                duration: duration,
                x: random(0, window.innerWidth),
                y: random(0, window.innerHeight),
                scale: random(0.8, 2.5),
                opacity: random(0.2, 0.8),
            });
        }
    });
}


// --- 2. Mouse Interaction (Subtle Parallax) ---

// GSAP's quickTo is the highly performant way to repeatedly update a property.
// We set a duration and ease to make the element lag slightly behind the mouse.
const quickX = gsap.quickTo("#content", "x", { duration: 0.6, ease: "power3.out" });
const quickY = gsap.quickTo("#content", "y", { duration: 0.6, ease: "power3.out" });

window.addEventListener('mousemove', (e) => {
    // Get center coordinates of the viewport
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Calculate the mouse position relative to the center (normalized from -1 to 1)
    const xPercent = (e.clientX - centerX) / centerX;
    const yPercent = (e.clientY - centerY) / centerY;

    // Define the maximum shift amount for the content (e.g., 20 pixels max)
    const maxShift = 20;

    // Apply the shift in the opposite direction (parallax effect)
    const newX = -xPercent * maxShift;
    const newY = -yPercent * maxShift;
    
    // Use quickTo for the smooth, laggy update
    quickX(newX);
    quickY(newY);
});

