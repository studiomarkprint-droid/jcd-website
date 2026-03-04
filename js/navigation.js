/**
 * JCD Navigation System
 * Handles mobile menu robustly by moving .nav to body and managing states.
 */
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
});

function initMobileMenu() {
    const toggle = document.getElementById('mobileNavToggle');
    const nav = document.querySelector('.nav');

    if (toggle && nav) {
        // Robust move: remove 'reveal' class and move to body level
        // This prevents stacking context issues and reveal animations from interfering
        nav.classList.remove('reveal');
        if (nav.parentNode !== document.body) {
            document.body.appendChild(nav);
        }

        // Ensure backdrop exists
        let backdrop = document.querySelector('.nav-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'nav-backdrop';
            document.body.appendChild(backdrop);
        }

        const openMenu = () => {
            nav.classList.add('active');
            backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
            const icon = toggle.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-xmark';
        };
        const closeMenu = () => {
            nav.classList.remove('active');
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
            const icon = toggle.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-bars';
        };

        toggle.onclick = () => nav.classList.contains('active') ? closeMenu() : openMenu();
        backdrop.onclick = closeMenu;

        // Close menu only on navigation links, NOT on dropdown parent toggles
        nav.querySelectorAll('a').forEach(link => {
            if (!link.parentElement.classList.contains('dropdown-item')) {
                link.addEventListener('click', () => {
                    closeMenu();
                    window.scrollTo({ top: 0, behavior: 'instant' });
                });
            }
        });

        // Dropdown parent links toggle submenu, they don't navigate
        document.querySelectorAll('.nav .dropdown-item').forEach(item => {
            const link = item.querySelector(':scope > a');
            if (link) {
                link.onclick = (e) => {
                    if (window.matchMedia('(max-width: 768px)').matches) {
                        e.preventDefault();
                        item.classList.toggle('active');
                    }
                };
            }
            // Also handle submenu link click closing menu
            item.querySelectorAll('.sub-menu a').forEach(subLink => {
                subLink.addEventListener('click', () => {
                    closeMenu();
                    window.scrollTo({ top: 0, behavior: 'instant' });
                });
            });
        });
    }
}
