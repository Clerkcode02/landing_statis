const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');
const navLinks = document.querySelectorAll('[data-nav-link]');

if (navToggle && navMenu) {
    const closeMobileMenu = () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.dataset.open = 'false';

        if (window.innerWidth < 1024) {
            navMenu.classList.add('hidden');
            navMenu.classList.remove('flex');
        }
    };

    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';

        navToggle.setAttribute('aria-expanded', String(!isExpanded));
        navMenu.dataset.open = String(!isExpanded);

        if (window.innerWidth < 1024) {
            navMenu.classList.toggle('hidden');
            navMenu.classList.toggle('flex');
        }
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 1024) {
                closeMobileMenu();
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMobileMenu();
        }
    });

    document.addEventListener('click', (event) => {
        const clickedInsideMenu = navMenu.contains(event.target);
        const clickedToggle = navToggle.contains(event.target);

        if (!clickedInsideMenu && !clickedToggle && navMenu.dataset.open === 'true') {
            closeMobileMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            navMenu.classList.remove('hidden');
            navMenu.classList.add('flex');
            navMenu.dataset.open = 'false';
            navToggle.setAttribute('aria-expanded', 'false');
            return;
        }

        closeMobileMenu();
    });
}

const chatbotRoot = document.querySelector('[data-chatbot]');

if (chatbotRoot) {
    const storageKey = 'mnsy-chatbot-prompt-dismissed';
    const panel = chatbotRoot.querySelector('[data-chatbot-panel]');
    const toggleButton = chatbotRoot.querySelector('[data-chatbot-toggle]');
    const closeButton = chatbotRoot.querySelector('[data-chatbot-close]');
    const form = chatbotRoot.querySelector('[data-chatbot-form]');
    const input = chatbotRoot.querySelector('[data-chatbot-input]');
    const messages = chatbotRoot.querySelector('[data-chatbot-messages]');
    const quickReplies = chatbotRoot.querySelector('[data-chatbot-quick-replies]');
    const prompt = chatbotRoot.querySelector('[data-chatbot-prompt]');
    const badge = chatbotRoot.querySelector('[data-chatbot-badge]');
    const syncViewportHeight = () => {
        const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
        chatbotRoot.style.setProperty('--chatbot-viewport-height', `${Math.round(viewportHeight)}px`);
    };

    const company = {
        name: chatbotRoot.dataset.companyName || 'MNSY Construction',
        phone: chatbotRoot.dataset.companyPhone || '+63 927 389 4882',
        email: chatbotRoot.dataset.companyEmail || 'nida@mnsyconstruction.com',
        address: chatbotRoot.dataset.companyAddress || 'Sampaloc, Tanay, Rizal / Metro Manila, Philippines',
        hours: 'Monday – Saturday: 8:00 AM – 5:00 PM',
        social: 'Facebook: facebook.com/mnsyconstruction',
    };

    const suggestionLabels = ['Our Services', 'Selected Projects', 'Management Team', 'Contact Info'];

    /**
     * Maintainable Rule-Based Chatbot Intent Configuration
     * Add new intents easily by adding objects with name, keywords, pattern, and reply handler.
     */
    const responseRules = [
        {
            name: 'greeting',
            keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'howdy', 'sup'],
            pattern: /\b(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))\b/i,
            reply: () => 'Hello! How may I help you today?',
        },
        {
            name: 'contact',
            keywords: ['contact', 'phone', 'email', 'address', 'located', 'location', 'reach', 'number', 'where', 'call', 'write', 'social'],
            pattern: /\b(contact|phone|number|email|address|located|location|reach|where\s*are\s*you|where\s*is\s*your\s*office|call|write|social)\b/i,
            reply: () =>
                `Here is MNSY Construction's contact information:\n\n` +
                `• Phone: ${company.phone}\n` +
                `• Email: ${company.email}\n` +
                `• Office Location: ${company.address}\n` +
                `• Business Hours: ${company.hours}\n` +
                `• Social Media: ${company.social}`,
        },
        {
            name: 'services',
            keywords: ['service', 'services', 'build', 'construction', 'renovation', 'remodel', 'fit-out', 'civil', 'structural', 'industrial', 'land development', 'steelworks', 'glass'],
            pattern: /\b(service|services|build|construction|renovation|remodel|fit[- ]?out|civil|structural|industrial|land\s*development|steelworks|glass)\b/i,
            reply: () =>
                `MNSY Construction offers a comprehensive range of construction solutions:\n\n` +
                `• Civil Works & Structural Construction\n` +
                `• Industrial Facilities & Land Development\n` +
                `• Commercial Fit-Outs & Renovation\n` +
                `• Steelworks, Glass & Aluminum Solutions\n\n` +
                `For custom inquiries, reach out at ${company.phone} or ${company.email}.`,
        },
        {
            name: 'quotations',
            keywords: ['quote', 'quotation', 'pricing', 'price', 'estimate', 'budget', 'proposal', 'cost', 'rate'],
            pattern: /\b(quote|quotation|pricing|price|cost|estimate|budget|proposal|rate)\b/i,
            reply: () =>
                `To request a project estimate or custom quotation, please contact our team directly at ${company.email} or call ${company.phone}.`,
        },
        {
            name: 'projects',
            keywords: ['project', 'projects', 'portfolio', 'ongoing', 'residential', 'commercial', 'completed', 'builds'],
            pattern: /\b(project|projects|portfolio|ongoing|residential|commercial|completed|builds)\b/i,
            reply: () =>
                `MNSY Construction has delivered 30+ projects across the Philippines.\n\n` +
                `Featured Projects:\n` +
                `• Sampaloc, Tanay, Rizal (Residential)\n` +
                `• Tali Beach Subdivision, Nasugbu, Batangas (On-Going)\n` +
                `• San Juan, Laiya, Batangas (On-Going)\n` +
                `• 3-Storey Office with Roof Deck, Pililla, Rizal (Commercial)\n` +
                `• Baguio Cathedral Candle Station & Ossuary (Commercial)\n` +
                `• Ayala Heights Luxury Residence, Quezon City (Residential)`,
        },
        {
            name: 'business_hours',
            keywords: ['hours', 'business hours', 'open', 'schedule', 'operating hours', 'time'],
            pattern: /\b(hours|business\s*hours|operating\s*hours|schedule|open|time|days)\b/i,
            reply: () =>
                `Our business hours are ${company.hours}.\n\n` +
                `You can also reach us via email at ${company.email} or call ${company.phone}.`,
        },
        {
            name: 'location',
            keywords: ['location', 'located', 'where', 'address', 'city', 'province', 'area'],
            pattern: /\b(location|located|where|address|city|province|area|site)\b/i,
            reply: () =>
                `MNSY Construction operates across Metro Manila, Rizal, Batangas, Baguio, and nearby provinces. Our office is located in ${company.address}.`,
        },
        {
            name: 'management',
            keywords: ['management', 'team', 'owner', 'manager', 'leadership', 'who'],
            pattern: /\b(management|team|owner|manager|leadership|who)\b/i,
            reply: () =>
                `MNSY Construction Management Team:\n` +
                `• General Manager: Nicholas Adrian Y. Sy\n` +
                `• Finance & Procurement Manager: Madelyn Y. Sy\n` +
                `• HR & IT Manager: Gail Margarette D.A. Reyes-Sy\n` +
                `• Site Coordinator: Ramon S. Yao`,
        },
    ];

    const scrollMessagesToLatest = () => {
        if (messages) {
            messages.scrollTop = messages.scrollHeight;
        }
    };

    const createMessage = (content, type = 'bot') => {
        if (!messages) {
            return;
        }

        const message = document.createElement('article');
        message.className = `chatbot-message chatbot-message--${type}`;

        const paragraph = document.createElement('p');
        paragraph.style.whiteSpace = 'pre-wrap';
        paragraph.textContent = content;
        message.append(paragraph);
        messages.append(message);
        scrollMessagesToLatest();
    };

    const getBotReply = (message) => {
        const normalizedMessage = message.trim();

        if (!normalizedMessage) {
            return "I'm sorry, I didn't understand your question. Please contact MNSY Construction directly for further assistance.";
        }

        for (const rule of responseRules) {
            if (rule.pattern.test(normalizedMessage)) {
                return rule.reply();
            }
        }

        return "I'm sorry, I didn't understand your question. Please contact MNSY Construction directly for further assistance.";
    };

    const hidePrompt = () => {
        chatbotRoot.dataset.promptVisible = 'false';

        if (prompt) {
            prompt.setAttribute('aria-hidden', 'true');
        }

        if (badge) {
            badge.hidden = true;
        }

        try {
            window.localStorage.setItem(storageKey, 'true');
        } catch {
            // Ignore storage availability issues and keep behavior functional.
        }
    };

    const openChat = () => {
        chatbotRoot.dataset.state = 'open';
        toggleButton?.setAttribute('aria-expanded', 'true');
        if (panel) {
            panel.inert = false;
            panel.setAttribute('aria-hidden', 'false');
        }
        hidePrompt();
        window.setTimeout(() => input?.focus(), 160);
        scrollMessagesToLatest();
    };

    const closeChat = () => {
        if (document.activeElement && panel?.contains(document.activeElement)) {
            document.activeElement.blur();
        }
        chatbotRoot.dataset.state = 'closed';
        toggleButton?.setAttribute('aria-expanded', 'false');
        if (panel) {
            panel.setAttribute('aria-hidden', 'true');
            panel.inert = true;
        }
        toggleButton?.focus();
    };

    if (panel && chatbotRoot.dataset.state !== 'open') {
        panel.inert = true;
        panel.setAttribute('aria-hidden', 'true');
    }

    const submitMessage = (rawMessage) => {
        const userMessage = rawMessage.trim();

        if (!userMessage) {
            return;
        }

        createMessage(userMessage, 'user');
        input.value = '';

        window.setTimeout(() => {
            createMessage(getBotReply(userMessage), 'bot');
        }, 220);
    };

    const showPrompt = () => {
        chatbotRoot.dataset.promptVisible = 'true';
        prompt?.setAttribute('aria-hidden', 'false');
        if (badge) {
            badge.hidden = false;
        }
    };

    const dismissedPrompt = (() => {
        try {
            return window.localStorage.getItem(storageKey) === 'true';
        } catch {
            return false;
        }
    })();

    chatbotRoot.dataset.state = 'closed';
    chatbotRoot.dataset.promptVisible = 'false';
    syncViewportHeight();

    if (!dismissedPrompt) {
        window.setTimeout(showPrompt, 1200);
    } else if (badge) {
        badge.hidden = true;
    }

    toggleButton?.addEventListener('click', () => {
        const isOpen = chatbotRoot.dataset.state === 'open';
        if (isOpen) {
            closeChat();
            return;
        }

        openChat();
    });

    closeButton?.addEventListener('click', () => {
        closeChat();
        toggleButton?.focus();
    });

    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        submitMessage(input?.value ?? '');
    });

    input?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submitMessage(input.value);
        }
    });

    quickReplies?.addEventListener('click', (event) => {
        const suggestion = event.target.closest('[data-chatbot-suggestion]');

        if (!suggestion) {
            return;
        }

        openChat();
        submitMessage(suggestion.dataset.chatbotSuggestion ?? suggestion.textContent ?? '');
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && chatbotRoot.dataset.state === 'open') {
            closeChat();
            toggleButton?.focus();
        }
    });

    document.addEventListener('click', (event) => {
        if (chatbotRoot.dataset.state !== 'open') {
            return;
        }

        const clickedInsideChatbot = chatbotRoot.contains(event.target);

        if (!clickedInsideChatbot) {
            closeChat();
        }
    });

    window.addEventListener('resize', syncViewportHeight);
    window.visualViewport?.addEventListener('resize', syncViewportHeight);

    input?.addEventListener('focus', hidePrompt);

    if (messages) {
        suggestionLabels.forEach((label, index) => {
            const chip = quickReplies?.children[index];
            chip?.setAttribute('aria-label', `${label} quick reply`);
        });
    }
}

/* ==========================================================================
   Video Widget Interactive Controller (FLIP Transition)
   ========================================================================== */

const videoWidget = document.querySelector('[data-video-widget]');

if (videoWidget) {
    const storageKey = 'mnsy-video-intro-dismissed';
    const hiddenStorageKey = 'mnsy-video-intro-hidden';
    const container = videoWidget.querySelector('[data-video-container]');
    const video = videoWidget.querySelector('[data-video-element]');
    const backdrop = videoWidget.querySelector('[data-video-backdrop]');
    const skipBtn = videoWidget.querySelector('[data-video-skip]');
    const closeBtns = videoWidget.querySelectorAll('[data-video-close]');
    const expandBtn = videoWidget.querySelector('[data-video-expand]');
    const introUnmuteBtn = videoWidget.querySelector('[data-video-intro-unmute]');
    const playPauseBtn = videoWidget.querySelector('[data-video-play-pause]');
    const muteBtn = videoWidget.querySelector('[data-video-mute]');
    const progressWrapper = videoWidget.querySelector('[data-video-progress-wrapper]');
    const progressFill = videoWidget.querySelector('[data-video-progress-fill]');

    let introTimer = null;

    const updateMuteIcon = () => {
        if (!muteBtn) return;
        const volMuted = muteBtn.querySelector('.icon-volume-muted');
        const volHigh = muteBtn.querySelector('.icon-volume-high');

        if (video.muted) {
            if (volMuted) volMuted.style.display = 'block';
            if (volHigh) volHigh.style.display = 'none';
        } else {
            if (volMuted) volMuted.style.display = 'none';
            if (volHigh) volHigh.style.display = 'block';
        }
    };

    const updateIntroUnmuteVisibility = () => {
        if (!introUnmuteBtn) return;
        const isIntro = videoWidget.dataset.state === 'intro';
        if (isIntro && video.muted) {
            introUnmuteBtn.style.display = 'flex';
        } else {
            introUnmuteBtn.style.display = 'none';
        }
    };

    const transitionToState = (targetState) => {
        const currentState = videoWidget.dataset.state;
        if (currentState === targetState) return;

        // 1. First (Measure current bounds)
        const firstRect = container.getBoundingClientRect();

        // 2. Change State (Triggers CSS layout modifications)
        videoWidget.dataset.state = targetState;

        // Sync mute settings based on state requirements
        if (targetState === 'expanded' || targetState === 'intro') {
            video.muted = false;
            updateMuteIcon();
        } else if (targetState === 'collapsed' || targetState === 'hidden') {
            video.muted = true;
            updateMuteIcon();
        }
        updateIntroUnmuteVisibility();

        // Adjust backdrop pointer interaction
        if (backdrop) {
            if (targetState === 'intro' || targetState === 'expanded') {
                backdrop.style.pointerEvents = 'auto';
            } else {
                backdrop.style.pointerEvents = 'none';
            }
        }

        // 3. Last (Measure new bounds)
        const lastRect = container.getBoundingClientRect();

        // 4. Invert (Instantly apply translate and scale difference to make it look unchanged)
        const deltaX = firstRect.left - lastRect.left;
        const deltaY = firstRect.top - lastRect.top;
        const deltaW = firstRect.width / lastRect.width;
        const deltaH = firstRect.height / lastRect.height;

        container.style.transition = 'none';
        container.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
        container.style.transformOrigin = 'top left';

        // Trigger reflow to commit inline layout settings
        container.offsetHeight;

        // 5. Play (Enable animations and clear offsets)
        container.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), border-radius 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        container.style.transform = '';

        const cleanUpTransitions = (e) => {
            if (e.propertyName === 'transform') {
                container.style.transition = '';
                container.style.transform = '';
                container.style.transformOrigin = '';
                container.removeEventListener('transitionend', cleanUpTransitions);
            }
        };
        container.addEventListener('transitionend', cleanUpTransitions);
    };

    // Initialize State based on Session Cache
    const initializeWidget = () => {
        let isDismissed = false;
        let isHidden = false;
        try {
            isDismissed = window.sessionStorage.getItem(storageKey) === 'true';
            isHidden = window.sessionStorage.getItem(hiddenStorageKey) === 'true';
        } catch {
            isDismissed = false;
            isHidden = false;
        }

        if (isHidden) {
            videoWidget.dataset.state = 'hidden';
            video.muted = true;
            updateMuteIcon();
            videoWidget.style.display = 'flex';
            video.play().catch(() => {});
        } else if (isDismissed) {
            // Start collapsed if already viewed in this session
            videoWidget.dataset.state = 'collapsed';
            video.muted = true;
            updateMuteIcon();
            videoWidget.style.display = 'flex';
            video.play().catch(() => {});
        } else {
            // Play fullscreen intro on first load
            videoWidget.dataset.state = 'intro';
            video.muted = false;
            updateMuteIcon();
            updateIntroUnmuteVisibility();
            videoWidget.style.display = 'flex';
            video.play().catch((error) => {
                // If autoplay with sound is blocked, fallback to muted autoplay
                console.warn('Autoplay with sound blocked. Falling back to muted autoplay:', error);
                video.muted = true;
                updateMuteIcon();
                updateIntroUnmuteVisibility();
                video.play().catch(() => {});
            });

            // Auto collapse to corner after 6 seconds
            introTimer = window.setTimeout(() => {
                transitionToState('collapsed');
                try {
                    window.sessionStorage.setItem(storageKey, 'true');
                } catch {}
            }, 6000);
        }
    };

    // Container click transitions from collapsed to expanded
    container.addEventListener('click', (e) => {
        if (videoWidget.dataset.state === 'collapsed') {
            if (introTimer) window.clearTimeout(introTimer);
            transitionToState('expanded');
            try {
                window.sessionStorage.setItem(storageKey, 'true');
            } catch {}
        }
    });

    // Support keyboard activation (Enter/Space) on the widget wrapper when collapsed
    container.addEventListener('keydown', (e) => {
        if (videoWidget.dataset.state === 'collapsed' && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            if (introTimer) window.clearTimeout(introTimer);
            transitionToState('expanded');
            try {
                window.sessionStorage.setItem(storageKey, 'true');
            } catch {}
        }
    });

    // Close & Skip Buttons
    const handleCloseWidget = (e) => {
        e.stopPropagation();
        if (introTimer) window.clearTimeout(introTimer);
        
        const currentState = videoWidget.dataset.state;
        if (currentState === 'collapsed') {
            transitionToState('hidden');
            try {
                window.sessionStorage.setItem(hiddenStorageKey, 'true');
            } catch {}
        } else {
            transitionToState('collapsed');
            try {
                window.sessionStorage.setItem(storageKey, 'true');
            } catch {}
        }
    };

    closeBtns.forEach((btn) => btn.addEventListener('click', handleCloseWidget));
    skipBtn?.addEventListener('click', handleCloseWidget);
    backdrop?.addEventListener('click', handleCloseWidget);

    if (expandBtn) {
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            transitionToState('collapsed');
            try {
                window.sessionStorage.removeItem(hiddenStorageKey);
            } catch {}
        });
    }

    // Escape Key listener for dismissal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && (videoWidget.dataset.state === 'expanded' || videoWidget.dataset.state === 'intro')) {
            handleCloseWidget(e);
        }
    });

    // Mute/Unmute Logic
    muteBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        updateMuteIcon();
        updateIntroUnmuteVisibility();
    });

    if (introUnmuteBtn) {
        introUnmuteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.muted = false;
            updateMuteIcon();
            updateIntroUnmuteVisibility();
        });
    }

    // Play/Pause Logic
    const handlePlayPause = (e) => {
        e.stopPropagation();
        if (video.paused) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    };

    playPauseBtn?.addEventListener('click', handlePlayPause);

    video.addEventListener('play', () => {
        if (!playPauseBtn) return;
        const playIcon = playPauseBtn.querySelector('.icon-play');
        const pauseIcon = playPauseBtn.querySelector('.icon-pause');
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
    });

    video.addEventListener('pause', () => {
        if (!playPauseBtn) return;
        const playIcon = playPauseBtn.querySelector('.icon-play');
        const pauseIcon = playPauseBtn.querySelector('.icon-pause');
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
    });

    // Sync seek bar fill width
    video.addEventListener('timeupdate', () => {
        if (!progressFill || !video.duration) return;
        const percentage = (video.currentTime / video.duration) * 100;
        progressFill.style.width = `${percentage}%`;
    });

    // Click seek bar to advance video time
    progressWrapper?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!video.duration) return;
        const rect = progressWrapper.getBoundingClientRect();
        const progressX = e.clientX - rect.left;
        const relativePosition = progressX / rect.width;
        video.currentTime = relativePosition * video.duration;
    });

    // Run Initialization
    initializeWidget();
}

/* ==========================================================================
   Accordion Controller — About Section (Mission / Vision)
   ========================================================================== */

const accordionRoot = document.querySelector('[data-accordion]');

if (accordionRoot) {
    const items = accordionRoot.querySelectorAll('[data-accordion-item]');

    const collapseItem = (item) => {
        item.classList.remove('accordion__item--active');
        const trigger = item.querySelector('[data-accordion-trigger]');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
    };

    const expandItem = (item) => {
        item.classList.add('accordion__item--active');
        const trigger = item.querySelector('[data-accordion-trigger]');
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
    };

    items.forEach((item) => {
        const trigger = item.querySelector('[data-accordion-trigger]');

        if (!trigger) return;

        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('accordion__item--active');

            // Collapse all items first (exclusive accordion)
            items.forEach((sibling) => collapseItem(sibling));

            // If the clicked item was not active, expand it
            if (!isActive) {
                expandItem(item);
            }
        });
    });
}

/* ==========================================================================
   Project Gallery Modal Controller
   ========================================================================== */

const projectModal = document.querySelector('[data-project-modal]');

if (projectModal) {
    const backdrop = projectModal.querySelector('[data-project-modal-backdrop]');
    const closeBtn = projectModal.querySelector('[data-project-modal-close]');
    const modalLabel = projectModal.querySelector('[data-project-modal-label]');
    const modalTitle = projectModal.querySelector('[data-project-modal-title]');
    const modalGallery = projectModal.querySelector('[data-project-modal-gallery]');
    let projectModalLastTrigger = null;

    // Set initial inert state if modal is not open
    if (!projectModal.classList.contains('project-modal--open')) {
        projectModal.inert = true;
        projectModal.setAttribute('aria-hidden', 'true');
    }

    const openModal = (trigger) => {
        projectModalLastTrigger = trigger || document.activeElement;
        const title = trigger.dataset.projectTitle || '';
        const label = trigger.dataset.projectLabel || '';
        let gallery = [];

        try {
            gallery = JSON.parse(trigger.dataset.projectGallery || '[]');
        } catch {
            gallery = [];
        }

        // Populate modal header
        if (modalLabel) modalLabel.textContent = label;
        if (modalTitle) modalTitle.textContent = title;

        // Populate gallery grid
        if (modalGallery) {
            modalGallery.innerHTML = '';
            gallery.forEach((src, index) => {
                const img = document.createElement('img');
                img.className = 'project-modal__gallery-image';
                img.src = src;
                img.alt = `${title} — Gallery image ${index + 1}`;
                img.loading = 'lazy';
                img.decoding = 'async';
                modalGallery.appendChild(img);
            });
        }

        // Show modal & enable interactions
        projectModal.inert = false;
        projectModal.setAttribute('aria-hidden', 'false');
        projectModal.classList.add('project-modal--open');
        document.body.classList.add('modal-open');

        // Focus the close button for accessibility
        window.setTimeout(() => closeBtn?.focus(), 80);
    };

    const closeModal = () => {
        // Blur active element inside modal BEFORE hiding or setting aria-hidden
        if (document.activeElement && projectModal.contains(document.activeElement)) {
            document.activeElement.blur();
        }

        projectModal.classList.remove('project-modal--open');
        projectModal.setAttribute('aria-hidden', 'true');
        projectModal.inert = true;
        document.body.classList.remove('modal-open');

        // Restore focus to original trigger element
        if (projectModalLastTrigger && typeof projectModalLastTrigger.focus === 'function') {
            projectModalLastTrigger.focus();
        }
    };

    // Delegate trigger clicks from all project cards
    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-project-modal-trigger]');
        if (trigger) {
            event.preventDefault();
            openModal(trigger);
        }
    });

    // Keyboard support for project cards (Enter / Space)
    document.addEventListener('keydown', (event) => {
        const trigger = event.target.closest('[data-project-modal-trigger]');
        if (trigger && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            openModal(trigger);
        }

        if (event.key === 'Escape' && projectModal.classList.contains('project-modal--open')) {
            closeModal();
        }
    });

    // Close via button
    closeBtn?.addEventListener('click', () => closeModal());

    // Close via backdrop
    backdrop?.addEventListener('click', () => closeModal());
}

/* ==========================================================================
   Scroll-triggered Entrance Animations System
   ========================================================================== */
const scrollAnimElements = document.querySelectorAll('.scroll-anim, .service-card-anim');

if (scrollAnimElements.length > 0) {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    scrollAnimElements.forEach(el => {
        observer.observe(el);
    });
}

/* ==========================================================================
   Other Services - Slider Controller
   ========================================================================== */
const container = document.querySelector('.services-row-container');
const thumb = document.getElementById('services-scroll-thumb');
const prevBtn = document.getElementById('services-prev-btn');
const nextBtn = document.getElementById('services-next-btn');

if (container && thumb) {
    const updateScrollIndicator = () => {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        const maxScroll = scrollWidth - clientWidth;
        
        // Update indicator thumb position and width dynamically
        if (maxScroll > 0) {
            const scrollPercent = scrollLeft / maxScroll;
            const visibleRatio = clientWidth / scrollWidth;
            const thumbWidthPercent = Math.max(visibleRatio * 100, 15); // min 15% width
            
            thumb.style.width = `${thumbWidthPercent}%`;
            thumb.style.left = `${scrollPercent * (100 - thumbWidthPercent)}%`;
        } else {
            thumb.style.width = '100%';
            thumb.style.left = '0%';
        }

        // Update nav buttons disabled state
        if (prevBtn) {
            if (scrollLeft <= 5) {
                prevBtn.setAttribute('disabled', 'true');
                prevBtn.classList.add('disabled');
            } else {
                prevBtn.removeAttribute('disabled');
                prevBtn.classList.remove('disabled');
            }
        }
        if (nextBtn) {
            if (scrollLeft + clientWidth >= scrollWidth - 5) {
                nextBtn.setAttribute('disabled', 'true');
                nextBtn.classList.add('disabled');
            } else {
                nextBtn.removeAttribute('disabled');
                nextBtn.classList.remove('disabled');
            }
        }
    };

    // Scroll listener
    container.addEventListener('scroll', updateScrollIndicator, { passive: true });
    
    // Resize observer to recalculate when screen size changes
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(updateScrollIndicator);
        ro.observe(container);
    } else {
        window.addEventListener('resize', updateScrollIndicator, { passive: true });
    }

    // Button navigation click handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const cardWidth = container.querySelector('.services-row-item')?.clientWidth || 320;
            const gap = 24; // 1.5rem gap
            container.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const cardWidth = container.querySelector('.services-row-item')?.clientWidth || 320;
            const gap = 24; // 1.5rem gap
            container.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
        });
    }

    // Initial run
    updateScrollIndicator();
}

/* ==========================================================================
   Full-Screen Image Viewer Modal Controller
   ========================================================================== */
const imageViewerModal = document.querySelector('[data-image-viewer-modal]');

if (imageViewerModal) {
    const backdrop = imageViewerModal.querySelector('[data-image-viewer-backdrop]');
    const closeBtn = imageViewerModal.querySelector('[data-image-viewer-close]');
    const viewerImg = imageViewerModal.querySelector('[data-image-viewer-img]');
    const caption = imageViewerModal.querySelector('[data-image-viewer-caption]');
    let imageViewerLastTrigger = null;

    // Set initial inert state if modal is not open
    if (!imageViewerModal.classList.contains('image-viewer-modal--open')) {
        imageViewerModal.inert = true;
        imageViewerModal.setAttribute('aria-hidden', 'true');
    }

    const openViewer = (src, title, trigger) => {
        imageViewerLastTrigger = trigger || document.activeElement;

        if (viewerImg) {
            viewerImg.src = src;
            viewerImg.alt = title || 'Full size image viewer';
        }
        if (caption) {
            if (title) {
                caption.textContent = title;
                caption.style.display = 'inline-block';
            } else {
                caption.style.display = 'none';
            }
        }

        imageViewerModal.inert = false;
        imageViewerModal.setAttribute('aria-hidden', 'false');
        imageViewerModal.classList.add('image-viewer-modal--open');
        document.body.classList.add('modal-open');

        // Focus close button for accessibility
        window.setTimeout(() => closeBtn?.focus(), 80);
    };

    const closeViewer = () => {
        // Blur active element inside modal BEFORE setting aria-hidden="true" / inert
        if (document.activeElement && imageViewerModal.contains(document.activeElement)) {
            document.activeElement.blur();
        }

        imageViewerModal.classList.remove('image-viewer-modal--open');
        imageViewerModal.setAttribute('aria-hidden', 'true');
        imageViewerModal.inert = true;
        document.body.classList.remove('modal-open');

        if (viewerImg) {
            setTimeout(() => {
                viewerImg.src = '';
            }, 300);
        }

        // Restore focus to original trigger element
        if (imageViewerLastTrigger && typeof imageViewerLastTrigger.focus === 'function') {
            imageViewerLastTrigger.focus();
        }
    };

    // Event listener for click triggers
    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-image-viewer-trigger]');
        if (trigger) {
            event.preventDefault();
            const src = trigger.getAttribute('data-image-src') || trigger.querySelector('img')?.src;
            const title = trigger.getAttribute('data-image-title') || trigger.querySelector('img')?.alt;
            if (src) {
                openViewer(src, title, trigger);
            }
        }
    });

    // Keyboard support for focused triggers & Escape key close
    document.addEventListener('keydown', (event) => {
        const trigger = event.target.closest('[data-image-viewer-trigger]');
        if (trigger && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            const src = trigger.getAttribute('data-image-src') || trigger.querySelector('img')?.src;
            const title = trigger.getAttribute('data-image-title') || trigger.querySelector('img')?.alt;
            if (src) {
                openViewer(src, title, trigger);
            }
        }

        if (event.key === 'Escape' && imageViewerModal.classList.contains('image-viewer-modal--open')) {
            closeViewer();
        }
    });

    closeBtn?.addEventListener('click', closeViewer);
    backdrop?.addEventListener('click', closeViewer);
}

/* ==========================================================================
   Service Details Modal Controller (Option 1)
   ========================================================================== */

const serviceModal = document.querySelector('[data-service-modal]');

if (serviceModal) {
    const backdrop = serviceModal.querySelector('[data-service-modal-backdrop]');
    const closeBtn = serviceModal.querySelector('[data-service-modal-close]');
    const modalTitle = serviceModal.querySelector('[data-service-modal-title]');
    const modalDescription = serviceModal.querySelector('[data-service-modal-description]');
    const modalDeliverables = serviceModal.querySelector('[data-service-modal-deliverables]');
    const modalStandards = serviceModal.querySelector('[data-service-modal-standards]');
    const modalCta = serviceModal.querySelector('[data-service-modal-cta]');
    let serviceModalLastTrigger = null;

    if (!serviceModal.classList.contains('service-modal--open')) {
        serviceModal.inert = true;
        serviceModal.setAttribute('aria-hidden', 'true');
    }

    const openServiceModal = (trigger) => {
        serviceModalLastTrigger = trigger || document.activeElement;
        const title = trigger.dataset.serviceTitle || '';
        const description = trigger.dataset.serviceDescription || '';
        let deliverables = [];
        let standards = [];

        try {
            deliverables = JSON.parse(trigger.dataset.serviceDeliverables || '[]');
        } catch {
            deliverables = [];
        }

        try {
            standards = JSON.parse(trigger.dataset.serviceStandards || '[]');
        } catch {
            standards = [];
        }

        if (modalTitle) modalTitle.textContent = title;
        if (modalDescription) modalDescription.textContent = description;

        if (modalDeliverables) {
            modalDeliverables.innerHTML = '';
            deliverables.forEach((item) => {
                const li = document.createElement('li');
                li.className = 'flex items-start gap-2.5';
                li.innerHTML = `<span class="service-modal__item-bullet"></span><span>${item}</span>`;
                modalDeliverables.appendChild(li);
            });
        }

        if (modalStandards) {
            modalStandards.innerHTML = '';
            standards.forEach((item) => {
                const li = document.createElement('li');
                li.className = 'flex items-start gap-2.5';
                li.innerHTML = `<span class="service-modal__item-bullet" style="background-color: var(--color-primary);"></span><span>${item}</span>`;
                modalStandards.appendChild(li);
            });
        }

        if (modalCta) {
            modalCta.href = `#contact`;
        }

        serviceModal.inert = false;
        serviceModal.setAttribute('aria-hidden', 'false');
        serviceModal.classList.add('service-modal--open');
        document.body.classList.add('modal-open');

        window.setTimeout(() => closeBtn?.focus(), 80);
    };

    const closeServiceModal = () => {
        serviceModal.classList.remove('service-modal--open');
        serviceModal.inert = true;
        serviceModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        if (serviceModalLastTrigger && typeof serviceModalLastTrigger.focus === 'function') {
            serviceModalLastTrigger.focus();
        }
    };

    backdrop?.addEventListener('click', closeServiceModal);
    closeBtn?.addEventListener('click', closeServiceModal);
    modalCta?.addEventListener('click', () => {
        closeServiceModal();
    });

    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-service-modal-trigger]');
        if (trigger) {
            event.preventDefault();
            openServiceModal(trigger);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && serviceModal.classList.contains('service-modal--open')) {
            closeServiceModal();
        }
        if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('[data-service-modal-trigger]')) {
            event.preventDefault();
            openServiceModal(event.target.closest('[data-service-modal-trigger]'));
        }
    });
}
