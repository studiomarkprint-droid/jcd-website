/**
 * JCD Common Scripts
 * Contains shared logic for reveal animations, carousels, and other UI elements.
 */

window.JCD = {
    revealObserver: null,

    init() {
        this.removePreloader();
        this.updateYear();
        this.initSmoothScroll();
        this.initRevealObservers();
        this.initSideActions();
        this.initCarousels();
        this.initInstagramModal();
        this.initQuickActions();
    },

    removePreloader() {
        if (!window.gsap) {
            const preloader = document.getElementById('gsap-preloader');
            if (preloader) preloader.remove();
            document.body.style.overflow = 'auto';
            return;
        }

        const preloader = document.getElementById('gsap-preloader');
        const heroBrand = document.querySelector('.brand');

        if (!preloader) {
            document.body.style.overflow = 'auto';
            return;
        }

        // If no hero brand (e.g. thank you page or unexpected structure), just fade out
        if (!heroBrand) {
            gsap.to('#gsap-preloader', {
                opacity: 0,
                duration: 0.45,
                ease: 'power2.out',
                onComplete: () => {
                    preloader.remove();
                    document.body.style.overflow = 'auto';
                }
            });
            return;
        }

        let brandClone = heroBrand.cloneNode(true);
        brandClone.id = 'preloader-branding';
        brandClone.classList.remove('reveal', 'in', 'left', 'right');
        Object.assign(brandClone.style, {
            position: 'fixed',
            margin: '0',
            transform: 'none',
            transformOrigin: '50% 50%',
            willChange: 'transform, opacity',
            pointerEvents: 'none',
            zIndex: '100000'
        });

        const cloneLogoLink = brandClone.querySelector('.logo');
        let overlay, textOverlay;

        if (cloneLogoLink) {
            cloneLogoLink.style.position = 'relative';
            cloneLogoLink.style.pointerEvents = 'none';

            overlay = document.createElement('div');
            Object.assign(overlay.style, {
                backgroundColor: '#000',
                opacity: '0.8',
                transformOrigin: '100% 50%',
                width: '100%',
                height: '100%',
                marginLeft: 'auto',
                position: 'absolute',
                inset: '0'
            });
            cloneLogoLink.appendChild(overlay);
        }

        const cloneBrandText = brandClone.querySelector('.name');
        if (cloneBrandText) {
            cloneBrandText.style.position = 'relative';
            textOverlay = document.createElement('div');
            Object.assign(textOverlay.style, {
                backgroundColor: '#000',
                opacity: '0.8',
                transformOrigin: '100% 50%',
                width: '100%',
                height: '100%',
                marginLeft: 'auto',
                position: 'absolute',
                inset: '0'
            });
            cloneBrandText.appendChild(textOverlay);
        }

        preloader.appendChild(brandClone);

        let centerOffsetX = 0, centerOffsetY = 0;
        const syncPreloaderBrandPosition = () => {
            // Get the final, visually rendered position of the hero brand
            // EXACTLY as the browser paints it, including all CSS transforms
            const rect = heroBrand.getBoundingClientRect();

            brandClone.style.left = `${rect.left}px`;
            brandClone.style.top = `${rect.top}px`;
            brandClone.style.width = `${rect.width}px`;
            brandClone.style.height = `${rect.height}px`;

            // For CSS transforms to not ruin our calculations, strip margin/transform from the clone
            brandClone.style.margin = "0";
            brandClone.style.transform = "none";

            // Calculate the true visual center of the logo graphic + text to perfect horizontal AND vertical centering
            const cloneCenterX = rect.left + (rect.width / 2);
            let visualCenterY = rect.top + (rect.height / 2);

            const logoEl = brandClone.querySelector('.logo');
            const nameEl = brandClone.querySelector('.name');
            if (logoEl && nameEl) {
                const logoRect = logoEl.getBoundingClientRect();
                const nameRect = nameEl.getBoundingClientRect();
                // Find vertical midpoint between the top of the icon and bottom of the text
                visualCenterY = logoRect.top + ((nameRect.bottom - logoRect.top) / 2);
            }

            const screenCenterX = window.innerWidth / 2;
            const screenCenterY = window.innerHeight / 2;

            centerOffsetX = screenCenterX - cloneCenterX;
            centerOffsetY = screenCenterY - visualCenterY;
        };

        syncPreloaderBrandPosition();
        window.addEventListener('resize', syncPreloaderBrandPosition);

        const tl = gsap.timeline({
            onComplete: () => {
                document.body.style.overflow = 'auto';
                preloader.remove();
                window.removeEventListener('resize', syncPreloaderBrandPosition);
            }
        });

        if (overlay && textOverlay) {
            // Start centered, slightly larger
            tl.set('#preloader-branding', { x: centerOffsetX, y: centerOffsetY, scale: 1.15 })
                .fromTo(overlay, { scaleX: 1 }, { scaleX: 0, duration: 0.8, ease: 'power4.out', delay: 0.1 })
                .fromTo(textOverlay, { scaleX: 1 }, { scaleX: 0, duration: 0.8, ease: 'power4.out' }, '<0.1')
                // Move perfectly to x:0, y:0 (which is its natural layout position over the real hero text)
                .to('#preloader-branding', { x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power3.inOut' }, '>-0.05')
                .to('#gsap-preloader', { opacity: 0, duration: 0.35, ease: 'power2.inOut' }, '>-0.1');
        } else {
            tl.to('#gsap-preloader', { opacity: 0, duration: 0.35, ease: 'power2.inOut' });
        }
    },

    updateYear() {
        const yearEl = document.getElementById('year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    },

    initSmoothScroll() {
        // No specific cleanup needed for simple click listeners as they are replaced if inside page-container
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href');
                if (!id || id === "#" || id === "#contact" || id === "#about") return;
                const el = document.querySelector(id);
                if (!el) return;
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    },

    initRevealObservers() {
        if (this.revealObserver) {
            this.revealObserver.disconnect();
        }

        const sectionTargets = document.querySelectorAll('header:not(.site-header), section, footer');
        this.revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(ent => {
                if (!ent.isIntersecting) return;
                const reveals = Array.from(ent.target.querySelectorAll('.reveal'));
                reveals.sort((a, b) => {
                    const aMedia = a.classList.contains('media');
                    const bMedia = b.classList.contains('media');
                    if (aMedia === bMedia) return 0;
                    return aMedia ? 1 : -1;
                });
                reveals.forEach((el, index) => {
                    el.style.transitionDelay = `${index * 80}ms`; // Reduced from 160ms for snappier feel
                    el.style.willChange = 'transform, opacity'; // Hardware acceleration hint
                    el.classList.add('in');
                });
                this.revealObserver.unobserve(ent.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -12% 0px' });

        sectionTargets.forEach(section => {
            if (section.querySelector('.reveal')) this.revealObserver.observe(section);
        });
        window.revealObserver = this.revealObserver;
    },

    initSideActions() {
        const sideActions = document.querySelector('.side-actions');
        const reviewsSection = document.querySelector('#reviews');
        const bigGreenSection = document.querySelector('.big-green-section');

        // Remove old listeners to avoid stacking
        window.removeEventListener('scroll', this._sideActionsHandler);
        window.removeEventListener('resize', this._sideActionsHandler);

        const updateVisibility = () => {
            if (!sideActions || !reviewsSection || !bigGreenSection) return;
            const markerY = window.scrollY + window.innerHeight * 0.2;
            const start = bigGreenSection.offsetTop + (bigGreenSection.offsetHeight / 2);
            const end = reviewsSection.offsetTop;
            if (markerY >= start && markerY < end) {
                sideActions.classList.add('is-hidden');
            } else {
                sideActions.classList.remove('is-hidden');
            }
        };

        if (sideActions) {
            this._sideActionsHandler = updateVisibility;
            updateVisibility();
            window.addEventListener('scroll', this._sideActionsHandler, { passive: true });
            window.addEventListener('resize', this._sideActionsHandler);
        }
    },

    initCarousels() {
        document.querySelectorAll('.carousel').forEach((carousel) => {
            const track = carousel.querySelector('.carousel-track');
            const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
            const prev = carousel.querySelector('.carousel-btn.prev');
            const next = carousel.querySelector('.carousel-btn.next');
            if (!track || slides.length === 0 || !prev || !next) return;

            let index = 0;
            const update = () => {
                track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
            };
            const prevSlide = () => {
                index = (index - 1 + slides.length) % slides.length;
                update();
            };
            const nextSlide = () => {
                index = (index + 1) % slides.length;
                update();
            };
            update();

            // Replace listeners by replacing elements or using onclick
            prev.onclick = prevSlide;
            next.onclick = nextSlide;
        });
    },

    initInstagramModal() {
        const igWrapper = document.querySelector('.instagram-embed-wrapper');
        const igModal = document.getElementById('ig-modal');
        const igClose = document.querySelector('.ig-close');

        if (!igModal) return;

        const openIgModal = () => {
            igModal.style.display = 'flex';
            igModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        };
        const closeIgModal = () => {
            igModal.style.display = 'none';
            igModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        if (igWrapper) igWrapper.onclick = openIgModal;
        if (igClose) igClose.onclick = closeIgModal;

        // Global window click for modal closure
        window.onclick = (e) => {
            if (e.target === igModal) closeIgModal();
        };

        document.onkeydown = (e) => {
            if (e.key === 'Escape') closeIgModal();
        };
    },

    initQuickActions() {
        // Add to Favorites
        const favBtn = document.getElementById('addToFavorites');
        if (favBtn) {
            favBtn.onclick = (e) => {
                e.preventDefault();
                alert('Para agregar a favoritos:\n\n• Mac: Presiona Cmd+D\n• PC: Presiona Ctrl+D');
            };
        }

        // Copy Link
        const copyBtn = document.getElementById('copyLink');
        if (copyBtn) {
            copyBtn.onclick = async (e) => {
                e.preventDefault();
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    const icon = copyBtn.querySelector('i');
                    const originalClass = icon.className;
                    icon.className = 'fa-solid fa-check';
                    copyBtn.style.background = '#a8c77a';
                    setTimeout(() => {
                        icon.className = originalClass;
                        copyBtn.style.background = '';
                    }, 1500);
                } catch (err) {
                    alert('¡Link copiado!');
                }
            };
        }

        // Share Menu Logic
        const shareBtn = document.getElementById('shareBtn');
        const shareMenu = document.getElementById('shareMenu');
        if (shareBtn && shareMenu) {
            const shareContainer = shareBtn.closest('.share-container');
            if (shareContainer) {
                shareContainer.onmouseenter = () => {
                    shareMenu.classList.add('active');
                };
                shareContainer.onmouseleave = () => {
                    shareMenu.classList.remove('active');
                };
            }
        }
    }
};

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => window.JCD.init());

// Global hooks for navigation to call
window.initRevealObservers = () => window.JCD.initRevealObservers();
window.initCarousels = () => window.JCD.initCarousels();
