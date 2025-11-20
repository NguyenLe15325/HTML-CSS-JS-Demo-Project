// script.js

// --- 1. Load and Inject Navbar Content ---
function loadNavbar() {
    const sidebarElement = document.getElementById('sidebar');
    // We assume the root-relative path is correct for Live Server now.
    const navbarPath = '/navbar.html'; 

    fetch(navbarPath) 
        .then(response => {
            if (!response.ok) {
                // Fallback attempt for file path issues, as discussed previously.
                console.warn(`Root-relative fetch failed (${navbarPath}). Trying '../navbar.html' as fallback.`);
                return fetch('../navbar.html'); 
            }
            return response.text();
        })
        .then(html => {
            // Inject the loaded HTML into the sidebar div
            sidebarElement.innerHTML = html;
            
            // AFTER injection, run functions to activate the correct link/topic
            activateCurrentLink();
            addTopicToggleListeners();
        })
        .catch(error => {
            console.error("Error loading navbar:", error);
            sidebarElement.innerHTML = '<p style="color: red; padding: 20px;">Navigation failed to load.</p>';
        });
}

// --- 2. Inject Favicon Link into the <head> ---
function injectFavicon() {
    const head = document.head;
    const faviconLink = document.createElement('link');

    faviconLink.rel = 'icon';
    faviconLink.type = 'image/png';
    // FIX APPLIED HERE: Using the correct file name and root-relative path
    faviconLink.href = '/favicon-32x32.png'; 

    // Check if a favicon already exists to prevent duplicates
    if (!document.querySelector('link[rel="icon"]')) {
        head.appendChild(faviconLink);
    }
}

// --- 3. Highlight Active Link and Open Topic ---
function activateCurrentLink() {
    const currentPath = window.location.pathname; 
    const links = document.querySelectorAll('.subtopic-link, .home-link');
    
    links.forEach(link => {
        const linkPath = link.getAttribute('href'); 
        
        // Check if the current URL ends with the link's href
        if (currentPath.endsWith(linkPath) || (currentPath.endsWith('/') && linkPath === '/index.html')) {
            // 1. Highlight the link
            link.classList.add('active-link');
            
            // 2. Open the containing topic list
            const subtopicList = link.closest('.subtopic-list');
            if (subtopicList) {
                subtopicList.classList.add('active');
            }
        }
    });
}

// --- 4. Topic Collapse/Expand (Attached after content is loaded) ---
function addTopicToggleListeners() {
    document.querySelectorAll('.topic-header').forEach(header => {
        header.addEventListener('click', function() {
            const subtopicList = this.nextElementSibling;
            if (subtopicList && subtopicList.classList.contains('subtopic-list')) {
                subtopicList.classList.toggle('active');
            }
        });
    });
}

// --- 5. Sidebar Collapse/Expand ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');

    // Reset all topic menus to collapsed when the whole sidebar is toggled
    const allSubtopicLists = document.querySelectorAll('.subtopic-list');
    if (sidebar.classList.contains('collapsed')) {
        allSubtopicLists.forEach(list => {
            list.classList.remove('active');
        });
    }
}

// Initial action: Start loading the navbar and injecting the favicon when the page is ready
document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    injectFavicon();
});