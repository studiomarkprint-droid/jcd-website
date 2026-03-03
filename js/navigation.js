/**
 * JCD Navigation
 * Handles AJAX-based page transitions with prefetching for faster FPS.
 */

const JCDNav = {
    containerId: 'page-container',
    cache: new Map(),

    init() {
        this.interceptLinks();
        this.handlePopState();
        this.initPrefetch();
        console.log("JCD Navigation (v2 Prefetch) Initialized");
    },

    interceptLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            // Only intercept internal relative links that aren't anchors or external
            if (this.isInternal(href)) {
                e.preventDefault();
                this.navigateTo(href);
            }
        });
    },

    initPrefetch() {
        // Prefetch on mouseover for desktop
        document.addEventListener('mouseover', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            const href = link.getAttribute('href');
            if (this.isInternal(href)) {
                this.prefetch(href);
            }
        }, { passive: true });
    },

    isInternal(href) {
        return href &&
            !href.startsWith('http') &&
            !href.startsWith('tel:') &&
            !href.startsWith('mailto:') &&
            !href.startsWith('#') &&
            href.endsWith('.html');
    },

    async prefetch(url) {
        if (this.cache.has(url)) return;
        try {
            const response = await fetch(url);
            const html = await response.text();
            this.cache.set(url, html);
        } catch (err) {
            console.warn('Prefetch failed', err);
        }
    },

    async navigateTo(url) {
        try {
            let html;
            if (this.cache.has(url)) {
                html = this.cache.get(url);
            } else {
                const response = await fetch(url);
                html = await response.text();
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newContent = doc.getElementById(this.containerId);

            if (newContent) {
                const container = document.getElementById(this.containerId);
                container.innerHTML = newContent.innerHTML;

                document.title = doc.title;
                window.history.pushState({ url }, doc.title, url);

                this.reinitializePage();

                const hash = url.split('#')[1];
                if (hash) {
                    const el = document.getElementById(hash);
                    if (el) el.scrollIntoView();
                } else {
                    window.scrollTo(0, 0);
                }
            }
        } catch (err) {
            console.error('Navigation failed', err);
            window.location.href = url;
        }
    },

    handlePopState(e) {
        const url = (e.state && e.state.url) ? e.state.url : window.location.pathname;
        this.navigateTo(url);
    },

    reinitializePage() {
        if (window.JCD && typeof window.JCD.init === 'function') {
            window.JCD.init();
        }
    }
};

window.addEventListener('DOMContentLoaded', () => JCDNav.init());
window.JCDNav = JCDNav;
