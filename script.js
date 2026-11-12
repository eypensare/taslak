/* ==========================================================================
   NyxLabs Portfolio — script.js
   Vanilla JS: i18n (TR/EN), GitHub REST API, scroll-reveal, avatar/favicon
   ========================================================================== */

(function () {
    'use strict';

    /* ----------------------------------------------------------------------
       Config
       ---------------------------------------------------------------------- */
    const GITHUB_USER = 'eypensare';
    const API_URL = 'https://api.github.com/users/' + GITHUB_USER + '/repos?sort=updated&per_page=100';
    const AVATAR_URL = 'https://github.com/' + GITHUB_USER + '.png';
    const PROFILE_URL = 'https://github.com/' + GITHUB_USER;

    const LANG_KEY = 'nyxlabs:lang';
    const CACHE_KEY = 'nyxlabs:repos:v1';
    const CACHE_TTL = 10 * 60 * 1000; // 10 dk — API hız limitini korumak için
    const FETCH_TIMEOUT = 8000;
    const MAX_PROJECTS = 12;
    const SKELETON_COUNT = 6;

    /* Portfolyo sitesinin kendisi ve taslak repo listede gösterilmez */
    const EXCLUDED_REPOS = ['eypensare.github.io', 'taslak'];

    /* Öne çıkan projeler: normalize edilmiş repo adı bu anahtarları içeriyorsa listenin başına alınır */
    const FEATURED = [
        {
            key: 'iyilikkoprusu',
            name: 'İyilik Köprüsü',
            desc: {
                tr: 'İyiliği yayan, insanları ve toplulukları bir araya getiren web projesi.',
                en: 'A web project that spreads kindness and brings people and communities together.'
            }
        },
        {
            key: 'hazirlikc',
            name: 'Hazırlık C Sınıf Portalı',
            desc: {
                tr: 'Hazırlık C sınıfı için geliştirilmiş sade ve hızlı sınıf portalı.',
                en: 'A clean and fast class portal built for the Preparatory C class.'
            }
        },
        {
            key: 'nyxconverter',
            name: 'Nyx Converter',
            desc: {
                tr: 'NyxLabs imzalı, hızlı ve minimal dönüştürme aracı.',
                en: 'A fast and minimal converter tool by NyxLabs.'
            }
        }
    ];

    /* API erişilemezse gösterilecek yedek veri (gerçek projeler) */
    const FALLBACK_REPOS = [
        { name: 'İyilik Köprüsü', html_url: PROFILE_URL + '?tab=repositories&q=iyilik', description: null, language: 'HTML', stargazers_count: 0 },
        { name: 'Hazırlık C Sınıf Portalı', html_url: PROFILE_URL + '?tab=repositories&q=haz%C4%B1rl%C4%B1k', description: null, language: 'HTML', stargazers_count: 0 },
        { name: 'Nyx Converter', html_url: PROFILE_URL + '?tab=repositories&q=nyx', description: null, language: 'HTML', stargazers_count: 0 },
        { name: 'dashboard', html_url: PROFILE_URL + '/dashboard', description: null, language: 'HTML', stargazers_count: 0 },
        { name: 'draft1', html_url: PROFILE_URL + '/draft1', description: null, language: 'HTML', stargazers_count: 0 },
        { name: 'bf1-info', html_url: PROFILE_URL + '/bf1-info', description: null, language: 'HTML', stargazers_count: 0 },
        { name: 'zikirmatik', html_url: PROFILE_URL + '/zikirmatik', description: null, language: 'HTML', stargazers_count: 0 },
        { name: 'osymsaati', html_url: PROFILE_URL + '/osymsaati', description: null, language: 'HTML', stargazers_count: 0 },
        { name: 'saat', html_url: PROFILE_URL + '/saat', description: null, language: 'HTML', stargazers_count: 0 }
    ];

    /* Mat, göz yormayan dil renkleri */
    const LANG_COLORS = {
        HTML: '#b8826c',
        CSS: '#7d7ea8',
        JavaScript: '#b5a671',
        TypeScript: '#6f8fb0',
        Python: '#6f93ad',
        Java: '#a98068',
        Kotlin: '#9a85b3',
        C: '#8a8f98',
        'C++': '#a07a90',
        'C#': '#79a083',
        Go: '#78a4b0',
        Rust: '#a58a7a',
        Shell: '#85a58b',
        PHP: '#8d90b3',
        Lua: '#7480a8'
    };

    /* ----------------------------------------------------------------------
       i18n
       ---------------------------------------------------------------------- */
    const I18N = {
        tr: {
            'meta.title': 'Eyüp Ensar Erkul — NyxLabs',
            'meta.description': 'Eyüp Ensar Erkul — NyxLabs çatısı altında yüksek performanslı ve yenilikçi yazılımlar geliştiren yazılım geliştirici ve beyaz şapkalı hacker.',
            'nav.skip': 'Ana içeriğe geç',
            'nav.about': 'Hakkımda',
            'nav.projects': 'Projeler',
            'nav.contact': 'İletişim',
            'hero.badge': 'NyxLabs • Yazılım & Güvenlik',
            'hero.title': 'Yazılım Geliştirici & Beyaz Şapkalı Hacker',
            'hero.sub': 'NyxLabs çatısı altında yüksek performanslı ve yenilikçi yazılımlar geliştiriyorum.',
            'hero.cta1': 'Projeleri İncele',
            'hero.cta2': 'GitHub Profili',
            'about.eyebrow': 'Hakkımda',
            'about.title': 'Performans ve sadelik üzerine.',
            'about.mainLabel': 'Biyografi',
            'about.bio': 'YTÜ Maçka MTAL Bilişim Teknolojileri hazırlık sınıfı öğrencisiyim. Aynı zamanda Maçka VEX Robotics takımının yazılım ekibinde yer alıyorum. Arch Linux (CachyOS) kullanıcısıyım ve performans/optimizasyon benim için bir tutku.',
            'about.focusLabel': 'Odak Alanı',
            'about.focusTitle': 'Sistem & Performans',
            'about.focus1': 'Arch Linux / CachyOS',
            'about.focus2': 'Düşük Seviye Optimizasyon & Web Mimarisi',
            'about.communityLabel': 'Topluluk & Robotik',
            'about.communityTitle': 'Maçka VEX Robotics',
            'about.community1': 'Maçka VEX Robotics Yazılım Ekibi',
            'about.community2': 'Açık Kaynak Geliştirme',
            'projects.eyebrow': 'Projelerim',
            'projects.title': 'Seçili çalışmalar.',
            'projects.lead': 'GitHub üzerinden canlı olarak listelenen açık kaynak projelerim.',
            'projects.view': 'İncele',
            'projects.noDesc': 'Açıklama bulunmuyor',
            'projects.stars': 'yıldız',
            'projects.noLang': 'Diğer',
            'projects.open': 'GitHub\'da aç',
            'contact.eyebrow': 'İletişim',
            'contact.title': 'Birlikte bir şey inşa edelim.',
            'contact.lead': 'Proje fikirleri, iş birlikleri veya sadece merhaba demek için bana sosyal hesaplarımdan ulaşabilirsin.'
        },
        en: {
            'meta.title': 'Eyüp Ensar Erkul — NyxLabs',
            'meta.description': 'Eyüp Ensar Erkul — a software developer and white-hat hacker building high-performance and innovative software under NyxLabs.',
            'nav.skip': 'Skip to main content',
            'nav.about': 'About',
            'nav.projects': 'Projects',
            'nav.contact': 'Contact',
            'hero.badge': 'NyxLabs • Software & Security',
            'hero.title': 'Software Developer & White-Hat Hacker',
            'hero.sub': 'Building high-performance and innovative software under NyxLabs.',
            'hero.cta1': 'View Projects',
            'hero.cta2': 'GitHub Profile',
            'about.eyebrow': 'About',
            'about.title': 'Focused on performance and simplicity.',
            'about.mainLabel': 'Biography',
            'about.bio': 'I am a preparatory-year student in Information Technologies at YTÜ Maçka MTAL. I am also part of the software team of the Maçka VEX Robotics team. I am an Arch Linux (CachyOS) user, and performance and optimization are a passion of mine.',
            'about.focusLabel': 'Focus Area',
            'about.focusTitle': 'Systems & Performance',
            'about.focus1': 'Arch Linux / CachyOS',
            'about.focus2': 'Low-Level Optimization & Web Architecture',
            'about.communityLabel': 'Community & Robotics',
            'about.communityTitle': 'Maçka VEX Robotics',
            'about.community1': 'Maçka VEX Robotics Software Team',
            'about.community2': 'Open Source Development',
            'projects.eyebrow': 'Projects',
            'projects.title': 'Selected work.',
            'projects.lead': 'My open-source projects, listed live from GitHub.',
            'projects.view': 'View Repo',
            'projects.noDesc': 'No description provided',
            'projects.stars': 'stars',
            'projects.noLang': 'Other',
            'projects.open': 'Open on GitHub',
            'contact.eyebrow': 'Contact',
            'contact.title': 'Let\'s build something together.',
            'contact.lead': 'For project ideas, collaborations, or just to say hello, reach out to me through my social accounts.'
        }
    };

    const root = document.documentElement;
    const grid = document.getElementById('projectGrid');
    let currentLang = 'tr';
    let repos = null; // null → henüz yüklenmedi (skeleton gösterilir)
    let projectsRevealed = false;

    const t = function (key) {
        return (I18N[currentLang] && I18N[currentLang][key]) || I18N.tr[key] || key;
    };

    const storage = {
        get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
        set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* depolama kapalı */ } }
    };

    function detectInitialLang() {
        const saved = storage.get(LANG_KEY);
        return saved === 'en' || saved === 'tr' ? saved : 'tr';
    }

    function applyLang(lang, persist) {
        currentLang = lang === 'en' ? 'en' : 'tr';
        root.lang = currentLang;
        root.setAttribute('data-lang', currentLang);
        if (persist) storage.set(LANG_KEY, currentLang);

        document.querySelectorAll('[data-i18n]').forEach(function (node) {
            node.textContent = t(node.getAttribute('data-i18n'));
        });

        document.title = t('meta.title');
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', t('meta.description'));

        document.querySelectorAll('.lang__btn').forEach(function (btn) {
            btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === currentLang));
        });

        renderProjects();
    }

    function initLangSwitch() {
        document.querySelectorAll('.lang__btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const lang = btn.getAttribute('data-lang');
                if (lang !== currentLang) applyLang(lang, true);
            });
        });
    }

    /* ----------------------------------------------------------------------
       Scroll reveal
       ---------------------------------------------------------------------- */
    let revealObserver = null;

    function markVisible(node) {
        node.classList.add('is-visible');
        // Giriş animasyonu bittikten sonra hover geçişlerinin gecikmesiz olması için
        window.setTimeout(function () { node.classList.add('is-settled'); }, 1400);
    }

    function observeReveal(node) {
        if (!revealObserver) {
            markVisible(node);
            return;
        }
        revealObserver.observe(node);
    }

    function initReveal() {
        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if ('IntersectionObserver' in window && !reduced) {
            revealObserver = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        markVisible(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        }

        document.querySelectorAll('.reveal').forEach(observeReveal);
    }

    /* ----------------------------------------------------------------------
       Active nav link
       ---------------------------------------------------------------------- */
    function initActiveNav() {
        if (!('IntersectionObserver' in window)) return;

        const links = {};
        document.querySelectorAll('[data-nav]').forEach(function (a) {
            links[a.getAttribute('data-nav')] = a;
        });

        const spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                Object.keys(links).forEach(function (id) {
                    links[id].classList.toggle('is-active', id === entry.target.id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        ['about', 'projects', 'contact'].forEach(function (id) {
            const section = document.getElementById(id);
            if (section) spy.observe(section);
        });

        const hero = document.getElementById('top');
        if (hero) {
            new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) {
                    Object.keys(links).forEach(function (id) { links[id].classList.remove('is-active'); });
                }
            }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
        }
    }

    /* ----------------------------------------------------------------------
       Dynamic avatar + favicon
       ---------------------------------------------------------------------- */
    function initAvatar() {
        const wrap = document.getElementById('brandAvatar');
        const img = document.getElementById('brandImg');
        const favicon = document.getElementById('favicon');

        function showAvatar() { if (wrap) wrap.classList.add('is-loaded'); }
        function showFallback() { if (wrap) wrap.classList.remove('is-loaded'); }

        if (img) {
            img.addEventListener('load', showAvatar);
            img.addEventListener('error', showFallback);
            if (img.complete && img.naturalWidth > 0) showAvatar();
        }

        // Favicon: GitHub avatarı yüklenebiliyorsa onu kullan, aksi halde "N" monogramı kalır
        if (favicon) {
            const probe = new Image();
            probe.onload = function () {
                favicon.type = 'image/png';
                favicon.href = AVATAR_URL + '?size=64';
            };
            probe.src = AVATAR_URL + '?size=64';
        }
    }

    /* ----------------------------------------------------------------------
       GitHub repos
       ---------------------------------------------------------------------- */
    function normalize(str) {
        return String(str || '')
            .toLocaleLowerCase('tr')
            .replace(/ı/g, 'i')
            .replace(/ç/g, 'c')
            .replace(/ğ/g, 'g')
            .replace(/ö/g, 'o')
            .replace(/ş/g, 's')
            .replace(/ü/g, 'u')
            .replace(/[^a-z0-9]/g, '');
    }

    function featuredOf(repo) {
        const n = normalize(repo.name);
        for (let i = 0; i < FEATURED.length; i++) {
            if (n.indexOf(FEATURED[i].key) !== -1) return { index: i, meta: FEATURED[i] };
        }
        return null;
    }

    function prepareRepos(list) {
        const clean = list
            .filter(function (r) {
                return r && !r.fork && r.name && r.html_url && EXCLUDED_REPOS.indexOf(r.name.toLowerCase()) === -1;
            })
            .map(function (r, order) {
                const f = featuredOf(r);
                return {
                    name: r.name,
                    url: r.html_url,
                    description: r.description || null,
                    language: r.language || null,
                    stars: r.stargazers_count || 0,
                    featured: f,
                    order: order
                };
            });

        clean.sort(function (a, b) {
            if (a.featured && b.featured) return a.featured.index - b.featured.index;
            if (a.featured) return -1;
            if (b.featured) return 1;
            return a.order - b.order;
        });

        return clean.slice(0, MAX_PROJECTS);
    }

    function readCache() {
        try {
            const raw = window.sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (parsed && Date.now() - parsed.time < CACHE_TTL && Array.isArray(parsed.data)) return parsed.data;
        } catch (e) { /* önbellek okunamadı */ }
        return null;
    }

    function writeCache(data) {
        try {
            window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data: data }));
        } catch (e) { /* önbellek yazılamadı */ }
    }

    async function fetchRepos() {
        const cached = readCache();
        if (cached) return cached;

        const controller = typeof AbortController === 'function' ? new AbortController() : null;
        const timer = controller ? window.setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT) : null;

        try {
            const res = await fetch(API_URL, {
                headers: { Accept: 'application/vnd.github+json' },
                signal: controller ? controller.signal : undefined
            });
            if (!res.ok) throw new Error('GitHub API ' + res.status);
            const json = await res.json();
            if (!Array.isArray(json)) throw new Error('Unexpected response');
            writeCache(json);
            return json;
        } finally {
            if (timer) window.clearTimeout(timer);
        }
    }

    async function loadRepos() {
        let list;
        try {
            const raw = await fetchRepos();
            list = prepareRepos(raw);
            if (!list.length) throw new Error('Empty list');
        } catch (err) {
            list = prepareRepos(FALLBACK_REPOS);
        }
        repos = list;
        renderProjects();
    }

    /* ----------------------------------------------------------------------
       Rendering (DOM API — API verisi innerHTML ile basılmaz)
       ---------------------------------------------------------------------- */
    const SVG_NS = 'http://www.w3.org/2000/svg';

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = text;
        return node;
    }

    function starIcon() {
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', '0 0 16 16');
        svg.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('fill', 'currentColor');
        path.setAttribute('d', 'M8 .8l2.1 4.5 4.9.6-3.6 3.4.9 4.9L8 11.7 3.7 14.2l.9-4.9L1 5.9l4.9-.6L8 .8z');
        svg.appendChild(path);
        return svg;
    }

    function skeletonCard() {
        const card = el('div', 'card project skeleton');
        card.setAttribute('aria-hidden', 'true');
        const top = el('div', 'project__top');
        top.appendChild(el('span', 'sk sk--title'));
        card.appendChild(top);
        card.appendChild(el('span', 'sk sk--line'));
        card.appendChild(el('span', 'sk sk--line'));
        card.appendChild(el('span', 'sk sk--line short'));
        card.appendChild(el('span', 'sk sk--pill'));
        return card;
    }

    function projectCard(repo, index) {
        const link = el('a', 'card project reveal');
        link.href = repo.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.setProperty('--d', (index % 3) * 90 + 'ms');
        link.setAttribute('aria-label', repo.name + ' — ' + t('projects.open'));

        const top = el('div', 'project__top');
        top.appendChild(el('h3', 'project__name', repo.name));
        top.appendChild(el('span', 'project__arrow', '↗'));
        top.lastChild.setAttribute('aria-hidden', 'true');
        link.appendChild(top);

        const description = repo.description || (repo.featured && repo.featured.meta.desc[currentLang]) || null;
        const desc = el('p', 'project__desc' + (description ? '' : ' is-empty'), description || t('projects.noDesc'));
        link.appendChild(desc);

        const meta = el('div', 'project__meta');

        const badge = el('span', 'lang-badge');
        const dot = document.createElement('i');
        dot.style.setProperty('--dot', LANG_COLORS[repo.language] || '#71717a');
        badge.appendChild(dot);
        badge.appendChild(document.createTextNode(repo.language || t('projects.noLang')));
        meta.appendChild(badge);

        if (repo.stars > 0) {
            const stars = el('span', 'stars');
            stars.setAttribute('title', repo.stars + ' ' + t('projects.stars'));
            stars.appendChild(starIcon());
            stars.appendChild(document.createTextNode(String(repo.stars)));
            meta.appendChild(stars);
        }

        meta.appendChild(el('span', 'project__cta', t('projects.view') + ' →'));
        link.appendChild(meta);

        return link;
    }

    function renderProjects() {
        if (!grid) return;
        grid.textContent = '';

        if (!repos) {
            grid.setAttribute('aria-busy', 'true');
            for (let i = 0; i < SKELETON_COUNT; i++) grid.appendChild(skeletonCard());
            return;
        }

        const frag = document.createDocumentFragment();
        repos.forEach(function (repo, i) {
            const card = projectCard(repo, i);
            if (projectsRevealed) card.classList.add('is-visible', 'is-settled');
            frag.appendChild(card);
        });
        grid.appendChild(frag);
        grid.setAttribute('aria-busy', 'false');

        if (!projectsRevealed) {
            projectsRevealed = true;
            grid.querySelectorAll('.reveal').forEach(observeReveal);
        }
    }

    /* ----------------------------------------------------------------------
       Init
       ---------------------------------------------------------------------- */
    function init() {
        initLangSwitch();
        initReveal();
        initActiveNav();
        initAvatar();
        applyLang(detectInitialLang(), false); // skeleton'ları da çizer
        loadRepos();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
