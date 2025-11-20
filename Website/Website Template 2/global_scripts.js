// --- Translations Data ---
const translations = {
    en: {
        title: "Global Tech Solutions",
        nav_solutions: "Solutions",
        nav_studies: "Case Studies",
        nav_pricing: "Pricing",
        nav_about: "About Us",
        nav_cta: "Contact Sales",
        hero_headline: "Seamless Global Integration",
        hero_subtext: "Providing scalable cloud solutions and multilingual support for international businesses.",
        section_solutions: "Our Solutions",
        section_studies: "Recent Case Studies",
        section_pricing: "Transparent Pricing",
        section_about: "About Our Company",
        footer_copyright: "© 2025 Global Tech Solutions. All Rights Reserved."
    },
    es: {
        title: "Soluciones Tecnológicas Globales",
        nav_solutions: "Soluciones",
        nav_studies: "Casos de Estudio",
        nav_pricing: "Precios",
        nav_about: "Sobre Nosotros",
        nav_cta: "Contactar Ventas",
        hero_headline: "Integración Global Sin Fisuras",
        hero_subtext: "Ofrecemos soluciones en la nube escalables y soporte multilingüe para empresas internacionales.",
        section_solutions: "Nuestras Soluciones",
        section_studies: "Casos de Estudio Recientes",
        section_pricing: "Precios Transparentes",
        section_about: "Sobre Nuestra Empresa",
        footer_copyright: "© 2025 Soluciones Tecnológicas Globales. Todos los derechos reservados."
    }
};

// --- DOM Elements ---
const themeToggleBtn = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const html = document.documentElement;

const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('#mobile-menu a');

const langToggleSelect = document.getElementById('language-toggle');
const langToggleSelectMobile = document.getElementById('language-toggle-mobile');

// --- Theme Toggle Logic ---
function initTheme() {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let currentTheme = 'light';
    if (storedTheme) {
        currentTheme = storedTheme;
    } else if (prefersDark) {
        currentTheme = 'dark';
    }

    if (currentTheme === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
    updateThemeIcons();
}

function toggleTheme() {
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
    updateThemeIcons();
}

function updateThemeIcons() {
    const isDark = html.classList.contains('dark');
    moonIcon.classList.toggle('hidden', !isDark);
    sunIcon.classList.toggle('hidden', isDark);
}

// --- Language Toggle Logic ---
function applyLanguage(lang) {
    localStorage.setItem('language', lang);
    
    // Sync both dropdowns
    if (langToggleSelect) langToggleSelect.value = lang;
    if (langToggleSelectMobile) langToggleSelectMobile.value = lang;

    // Update all content based on data-key
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
            if (key === 'title') {
                document.title = translations[lang][key];
            }
        }
    });
}

function initLanguage() {
    const storedLang = localStorage.getItem('language') || 'en';
    applyLanguage(storedLang);
}

// --- Event Listeners ---
themeToggleBtn.addEventListener('click', toggleTheme);

if (langToggleSelect) {
     langToggleSelect.addEventListener('change', (event) => applyLanguage(event.target.value));
}
if (langToggleSelectMobile) {
    langToggleSelectMobile.addEventListener('change', (event) => applyLanguage(event.target.value));
}

mobileMenuButton.addEventListener('click', function() {
    mobileMenu.classList.toggle('hidden');
});

// Hide mobile menu after clicking a link
mobileLinks.forEach(item => {
    item.addEventListener('click', event => {
        mobileMenu.classList.add('hidden');
    });
});

// Initialize all features on load
window.onload = function() {
    initTheme();
    initLanguage();
};
