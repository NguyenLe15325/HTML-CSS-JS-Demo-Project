// JavaScript for Mobile Menu Toggle
// This script provides simple functionality for hiding/showing the mobile navigation menu.

document.getElementById('mobile-menu-button').addEventListener('click', function() {
    const menu = document.getElementById('mobile-menu');
    // Toggles the 'hidden' class on the menu element
    menu.classList.toggle('hidden');
});

// Hide mobile menu after clicking a link
// This improves the user experience by closing the menu when a section link is selected.
document.querySelectorAll('#mobile-menu a').forEach(item => {
    item.addEventListener('click', event => {
        document.getElementById('mobile-menu').classList.add('hidden');
    });
});
