/**
 * JavaScript for Professional Business Website
 * Handles mobile menu toggling and form submission simulation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Select elements
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const contactForm = document.querySelector('#contact form');

    // 1. Mobile Menu Toggle Logic
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            // Toggles the 'hidden' class on the mobile menu
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 2. Hide mobile menu after clicking a link (for smooth scrolling)
    if (mobileMenu) {
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Check if the link target is an internal anchor
                if (link.getAttribute('href').startsWith('#')) {
                    // Hide the menu when a link is clicked
                    mobileMenu.classList.add('hidden');
                }
            });
        });
    }

    // 3. Simple Form Submission Handling (Prevents default submission for demo)
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            console.log('Form Submitted!');

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Temporary success state feedback on the button
            submitButton.textContent = 'Message Sent! (Demo)';
            submitButton.classList.remove('bg-primary-blue', 'hover:bg-indigo-800');
            submitButton.classList.add('bg-green-600');

            // Reset the button and form after 3 seconds
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.classList.add('bg-primary-blue', 'hover:bg-indigo-800');
                submitButton.classList.remove('bg-green-600');
                contactForm.reset();
            }, 3000);
        });
    }
});
