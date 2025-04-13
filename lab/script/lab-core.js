(function() { // 파일 전체를 감싸는 즉시 실행 함수 시작

    // Prevent re-initialization
    if (window.hobbyScriptHasFullyInitialized) {
        return; // 이제 이 return은 함수 내부에 있습니다.
    }
    window.hobbyScriptHasFullyInitialized = true;

    // Global state for the lab
    const labGlobalState = {
        currentProjectMode: 'css', // Default to CSS
        isMobileView: window.matchMedia("(max-width: 768px)").matches // Initial mobile view state
    };

    // --- [1] Project Data Definitions ---
    // Pure CSS project categories
    const pureCssCategories = {
        'animation-art': [
            '024-waves', '036-solar-eclipse', '050-newtons-cradle', '083-a-ball-climbing-the-stairs',
            '093-lightning-cable', '094-polaroid-camera', '119-draught-beer', '122-apple-photos-icon',
            '124-origami-cranes', '134-sapling-loader', '149-polo-mints-animation', '166-safari-logo'
        ],
        'interactive-art': [
            '041-pencil', '076-hey-take-it-easy', '131-scissors', '145-power-switch',
            '153-emoji-tooltips', '156-airplane-window-toggle', '158-umbrella-toggle',
            '168-oo-words', '179-tear-calendar'
        ],
        'loading-effect': [
            '065-swaying-loader', '068-color-cards', '071-8-shaped-dancing-loader', '078-windows-boot-screen',
            '082-bouncing-letter-i', '097-swagger-dots', '118-hourglass-loader',
            '128-the-goddess-is-coming', '136-colorful-bar-loader'
        ],
        'text-effect': [
            '022-stripy-rainbow-text-effects', '033-milk-text-effect', '038-stairs-lettering-effect',
            '056-a-programmers-life', '059-rainbow-background-text', '100-shimmering-neon-text',
            '126-button-hover-effect'
        ],
        'button-effect': [
            '001-button-text-staggered-sliding-effects', '009-aimed-button-effects', '037-stroke-animation-button-effect',
            '072-bubble-coloring-button', '112-button-hover-effect', '148-button-hover-effect'
        ],
        'screensaver': [
            '081-swapping-colors-rotating-animation', '090-endless-hexagonal-space', '095-rotating-worm',
            '106-animation-with-no-dom', '139-glowing-particles-animation', '144-pattern-animation',
            '150-pattern-animation'
        ]
    };

    // JavaScript project categories
    const javascriptCategories = {
        '3d': ['3dBlob', '3dWeather', 'LegoView', 'MorphingKnot', 'Sphere', 'Stardust'],
        'ai-bot': ['Chatbot', 'DEEPOOSU', 'HeySarah', 'ImageGenerator'],
        'game': ['ColorSwitch', 'GALACTICGUARDIAN', 'MathBlitz', 'MemoryCard', 'PACMAN', 'Pokemon', 'Tetris'],
        'utility': ['Calculator', 'ColorPalette', 'DottedConverter', 'GradientGenerator', 'InkBlobGenerator', 'MinimalNotepad', 'PomodoroTimer', 'QRGenerator', 'UnitConverter'],
        'cursor-effects': ['ArrowGrid', 'CharacterScramble', 'CursorBlob', 'DessertCursor', 'FOLLOWCURSOR', 'FingerCursor', 'LighteningEffect', 'Magnet', 'MagneticCursor', 'MouseRepellant', 'StackedCards', 'etchCanvas'],
        'scroll-effects': ['BgColor', 'Horizontal', 'Hybrid', 'Nav', 'Parallax', 'Progress', 'Reveal', 'Split', 'Timeline', 'Trigger']
    };

    /**
     * Builds a structured list of projects from a category map.
     * @param {string} type - 'css' or 'js'
     * @returns {Array} A list of project objects.
     */
    function buildProjectListByType(type) {
        let acc = [];
        const categoriesMap = type === 'css' ? pureCssCategories : javascriptCategories;
        const basePath = type === 'css' ? 'pure-css' : 'javascript';

        Object.keys(categoriesMap).forEach(category => {
            categoriesMap[category].forEach((project) => {
                acc.push({
                    category,
                    type,
                    title: project.replace(/^\d+-/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    issueNum: String(acc.length + 1).padStart(2, '0'),
                    path: `${basePath}/${category}/${project}/index.html`,
                    screenshotPath: `./screenshot-automator/screenshots/${type}-${project}.jpg`
                });
            });
        });
        return acc;
    }

    // Expose data to the window object for access by other scripts
    window.allCategories = {
        css: pureCssCategories,
        js: javascriptCategories,
    };
    window.projectLists = {
        css: buildProjectListByType('css'),
        js: buildProjectListByType('js'),
    };

    // Set legacy properties for compatibility if other scripts use them
    window.pureCssCategories = pureCssCategories;
    window.jsCategories = javascriptCategories; // Expose JS categories for consistency

    // projectList will be dynamically updated on mode switch
    window.projectList = window.projectLists.css; // Initial project list

    // Calculate initial total images (for background slideshow)
    labGlobalState.totalImages = window.projectLists.css.length;
    console.log(`[Core] Total CSS projects mapped: ${labGlobalState.totalImages}`);

    // Expose global state
    window.labGlobalState = labGlobalState;

    // --- [2] DOM Manipulation Functions ---

    /**
     * Renders the category jump buttons in the .carousel-category-jump section.
     * @param {string} mode - 'css' or 'js' to determine which categories to render.
     */
    function renderCarouselCategoryJumpButtons(mode) {
        const categoriesMap = window.allCategories[mode];
        const carouselCategoryJump = document.getElementById('carousel-category-jump');
        if (!carouselCategoryJump) {
            console.error("'.carousel-category-jump' container not found.");
            return;
        }

        const categoryButtonsHTML = Object.keys(categoriesMap).map((category, index) => {
            const iconNumber = (index % 6) + 1;
            const iconPath = `images/jumpbutton${iconNumber}.png`;

            const displayCategory = category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const displayLabel = displayCategory.includes(' ') ? displayCategory.replace(' ', '<br>') : displayCategory;

            return `
                <div class="category-jump-item">
                    <button class="category-jump-btn" data-category="${category}" title="${displayCategory}">
                        <img src="${iconPath}" alt="${displayCategory} Icon">
                    </button>
                    <span class="category-jump-label">${displayLabel}</span>
                </div>
            `;
        }).join('');

        carouselCategoryJump.innerHTML = categoryButtonsHTML;
        console.log(`[Core] Category jump buttons rendered for mode: ${mode}.`);

        gsap.set(carouselCategoryJump, { opacity: 0, y: 20 });

        if (window.modernCarouselInstanceForHobby) {
            window.modernCarouselInstanceForHobby.setupCategoryJump();
        }
    }


    /**
     * Generates and injects the carousel poster cards into the DOM.
     * @param {string} mode - The project mode ('css' or 'js') to generate cards for.
     * @param {function} [onReady] - Optional callback to execute after cards are in the DOM.
     */
    function generatePosterCards(mode, onReady) {
        const currentProjectList = window.projectLists[mode];
        const carousel = document.getElementById('dynamic-carousel');
        if (!carousel) {
            console.error("Carousel container '#dynamic-carousel' not found.");
            if (onReady) onReady();
            return;
        }

        carousel.innerHTML = '';

        const isMobile = labGlobalState.isMobileView;

        const posterHTML = currentProjectList.map(project => {
            let previewContent = '';
            // Explicitly initialize to 'false' string
            let initialIframeLoaded = 'false';
            let initialImageLoaded = 'false';
            let posterClasses = '';

            if (isMobile) {
                previewContent = `<img src="${project.screenshotPath}" alt="${project.title} Preview" class="poster-screenshot-preview poster-image">`;
                initialImageLoaded = 'true'; // Set to 'true' only for mobile screenshots
                posterClasses = 'is-mobile-preview';
            } else {
                // For desktop, iframe src will be set dynamically by ModernCarousel
                previewContent = `<iframe src="about:blank" scrolling="no" frameborder="0" class="poster-iframe"></iframe>`;
                // initialIframeLoaded remains 'false' for desktop as it will load dynamically
                posterClasses = 'is-desktop-preview';
            }

            return `
                <div class="poster poster-${project.category} ${posterClasses}"
                    data-title="${project.title}"
                    data-num="${project.issueNum}"
                    data-path="${project.path}"
                    data-type="${project.type}"
                    data-iframe-loaded="${initialIframeLoaded}"
                    data-image-loaded="${initialImageLoaded}"
                    data-screenshot="${project.screenshotPath}"
                    >
                    <div class="poster-preview-container">
                        ${previewContent}
                    </div>
                    <div class="poster-paper-overlay"></div>
                    <div class="poster-dim-overlay"></div>
                    <div class="book-binding">
                        <div class="binding-line binding-main"></div>
                        <div class="binding-line binding-top"></div>
                        <div class="binding-line binding-front-1"></div>
                        <div class="binding-line binding-front-2"></div>
                        <div glines="binding-line binding-front-3"></div>
                        <div class="binding-line binding-side-1"></div>
                        <div class="binding-line binding-side-2"></div>
                        <div class="binding-line binding-side-3"></div>
                    </div>
                    <div class="poster-text-overlay">
                        ISSUE ${project.issueNum}<br>${project.title}
                    </div>
                </div>
            `;
        }).join('');

        carousel.innerHTML = posterHTML;
        console.log(`[Core] Dynamic poster cards generated for mode: ${mode} (isMobile: ${isMobile}).`);

        if (onReady) {
            requestAnimationFrame(onReady);
        }
    }

    // --- [3] Application Logic ---
    /**
     * Destroys the current carousel instance to prepare for a new one.
     */
    function destroyCarouselInstance() {
        if (window.modernCarouselInstanceForHobby) {
            if (window.modernCarouselInstanceForHobby.carousel) {
                gsap.killTweensOf(window.modernCarouselInstanceForHobby.carousel.querySelectorAll('.poster'));
            }
            if (window.modernCarouselInstanceForHobby.labels) {
                gsap.killTweensOf(window.modernCarouselInstanceForHobby.labels.querySelectorAll('.label'));
            }

            if (window.modernCarouselInstanceForHobby.carousel) {
                window.modernCarouselInstanceForHobby.carousel.innerHTML = '';
            }

            // Remove event listeners
            if (window.modernCarouselInstanceForHobby._wheelHandler) {
                window.modernCarouselInstanceForHobby.carousel.removeEventListener('wheel', window.modernCarouselInstanceForHobby._wheelHandler);
                document.removeEventListener('mousemove', window.modernCarouselInstanceForHobby._mouseMoveHandler);
                document.removeEventListener('mouseup', window.modernCarouselInstanceForHobby._mouseUpHandler);
                window.modernCarouselInstanceForHobby.carousel.removeEventListener('touchstart', window.modernCarouselInstanceForHobby._touchStartHandler);
                window.modernCarouselInstanceForHobby.carousel.removeEventListener('touchend', window.modernCarouselInstanceForHobby._touchEndHandler);
                window.modernCarouselInstanceForHobby.posters.forEach(poster => {
                    if (poster._carouselClickHandler) {
                        poster.removeEventListener('click', poster._carouselClickHandler);
                    }
                });
                document.querySelectorAll('.category-jump-btn').forEach(button => {
                    if (button._categoryJumpHandler) {
                        button.removeEventListener('click', button._categoryJumpHandler);
                    }
                });
            }


            window.modernCarouselInstanceForHobby = null;
            console.log('[Core] Previous carousel instance destroyed.');
        }
    }

    /**
     * Switches the project mode between CSS and JavaScript.
     * This function is also called when mobile/desktop view changes.
     * @param {string} newMode - The target mode, 'css' or 'js'.
     * @param {boolean} [forceRender=false] - Force re-render even if mode is the same (e.g., for responsive changes).
     */
    function switchProjectMode(newMode, forceRender = false) {
        const newIsMobileView = window.matchMedia("(max-width: 768px)").matches;
        const isModeChanged = (labGlobalState.currentProjectMode !== newMode);
        const isViewChanged = (labGlobalState.isMobileView !== newIsMobileView);

        if (!isModeChanged && !isViewChanged && !forceRender) {
            console.log("[Core] No mode or view change, and not forced. Skipping re-render.");
            return;
        }

        labGlobalState.isMobileView = newIsMobileView; // Update global state
        labGlobalState.currentProjectMode = newMode;
        console.log(`[Core] Switching project mode to: ${newMode} (forceRender: ${forceRender}, isMobileView: ${labGlobalState.isMobileView})`);

        document.querySelectorAll('.project-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === newMode);
        });

        window.projectList = window.projectLists[newMode];
        labGlobalState.totalImages = window.projectList.length;
        console.log(`[Core] Total projects mapped for ${newMode}: ${labGlobalState.totalImages}`);

        renderCarouselCategoryJumpButtons(newMode);

        destroyCarouselInstance();

        requestAnimationFrame(() => {
            generatePosterCards(newMode, () => {
                if (typeof ModernCarousel !== 'undefined') {
                    // Pass the current mobile view state to the ModernCarousel constructor
                    window.modernCarouselInstanceForHobby = new ModernCarousel(labGlobalState.isMobileView);
                    window.modernCarouselInstanceForHobby.setupDomReferences();
                    window.modernCarouselInstanceForHobby.setupCategoryJump();
                    window.modernCarouselInstanceForHobby.runCarousel(true);

                    if (window.appBackgroundChanger) {
                        const initialTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
                        window.appBackgroundChanger.refreshImagePaths(initialTheme);
                        const centerIndex = window.modernCarouselInstanceForHobby.center;
                        window.appBackgroundChanger.initializeCarouselModeBackground(centerIndex);
                    }
                } else {
                    console.error("[Core] ModernCarousel class is not defined during mode switch!");
                }
            });
        });
    }

    // --- [4] Initializers ---
    /**
     * Initializes header observers for scroll effects.
     */
    window.initHeaderObserver = function() {
        const navHeader = document.querySelector('.nav-header');
        const labHeader = document.querySelector('.lab-header');
        if (!navHeader || !labHeader) {
            console.warn("[Header] Header elements not found for IntersectionObserver.");
            return;
        }
        gsap.set(labHeader, { opacity: 0, visibility: 'hidden', zIndex: 99 });
        const sentinel = document.getElementById('top-sentinel');
        if (sentinel) {
            const observer = new window.IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        navHeader.classList.toggle('hide', !entry.isIntersecting);
                    });
                }, { root: null, threshold: 1.0 }
            );
            observer.observe(sentinel);
        }
        $(function () {
            const $menu = $('.nav-menu.nav-center');
            if (!$menu.length) return;
            let lastScroll = 0;
            const delta = 8;
            let ticking = false;
            function updateMenuVisibility() {
                const st = $(window).scrollTop();
                if (st === 0) { $menu.removeClass('hide'); }
                else if (st > lastScroll + delta && st > 60) { $menu.addClass('hide'); }
                else if (st < lastScroll - delta || st <= 0) { $menu.removeClass('hide'); }
                lastScroll = st;
                ticking = false;
            }
            function requestTick() {
                if (!ticking) {
                    window.requestAnimationFrame(updateMenuVisibility);
                    ticking = true;
                }
            }
            $(window).on('scroll', requestTick).on('resize', requestTick);
            updateMenuVisibility();
        });
    };

    /**
     * Initializes the background image slideshow and controls.
     */
    window.initBackgroundSlideshow = function() {
        let onBgIntroCompleteInternalCallback = null;
        let currentImagePaths = [];
        let currentIntroImagePaths = [];
        const imageBaseUrl = './images/';
        const totalAvailableBgImages = 50; // Max number of background images available

        const generateImagePaths = (themePrefix) => {
            const extension = themePrefix === 'bgdark' ? 'png' : 'jpg';
            return Array.from({ length: totalAvailableBgImages }, (_, i) => `${imageBaseUrl}${themePrefix}${i + 1}.${extension}`);
        };

        const generateIntroImagePaths = (allImagePaths) => {
            let introPaths = [];
            const numIntroImages = Math.min(30, allImagePaths.length);
            for (let i = 0; i < numIntroImages; i++) {
                if (allImagePaths[i]) introPaths.push(allImagePaths[i]);
            }
            return introPaths;
        };

        let initialTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        currentImagePaths = generateImagePaths(initialTheme === 'dark' ? 'bgdark' : 'bglight');
        currentIntroImagePaths = generateIntroImagePaths(currentImagePaths);

        const bgImageA = document.getElementById('bgImageA');
        const bgImageB = document.getElementById('bgImageB');
        let onBgIntroCallbackProcessed = false;

        function finalBgIntroCallback() {
            if (!onBgIntroCallbackProcessed && typeof onBgIntroCompleteInternalCallback === 'function') {
                onBgIntroCompleteInternalCallback();
                onBgIntroCallbackProcessed = true;
            }
        }

        if (!bgImageA || !bgImageB) { finalBgIntroCallback(); return; }

        let initialAnimationIndex = 0;
        let initialAnimationTimeoutId = null;
        let bgCurrentElement = bgImageA;
        let bgNextElement = bgImageB;

        const getTransitionDelay = (index) => {
            const totalIntroSteps = currentIntroImagePaths.length;
            if (totalIntroSteps === 0) return 0;
            const progress = index / (totalIntroSteps - 1);
            const startDelay = 100;
            const endDelay = 50; // Faster towards the end
            return startDelay - (startDelay - endDelay) * progress;
        };

        function runInitialAnimationInternal() {
            if (initialAnimationIndex >= currentIntroImagePaths.length) {
                initialAnimationTimeoutId = null;
                finalBgIntroCallback();
                return;
            }
            const imagePathToLoad = currentIntroImagePaths[initialAnimationIndex];
            if (!imagePathToLoad) {
                initialAnimationIndex++;
                initialAnimationTimeoutId = setTimeout(runInitialAnimationInternal, getTransitionDelay(initialAnimationIndex));
                return;
            }
            const imgChecker = new Image();
            imgChecker.onload = () => {
                bgNextElement.src = imagePathToLoad;
                const isDark = document.documentElement.classList.contains('dark');
                gsap.timeline()
                    .to(bgCurrentElement, { opacity: 0, duration: 0.5, ease: "power2.out" }, 0)
                    .to(bgNextElement, { opacity: isDark ? 0.2 : 0.5, duration: 0.5, ease: "power2.out" }, 0)
                    .call(() => { [bgCurrentElement, bgNextElement] = [bgNextElement, bgCurrentElement]; });
                initialAnimationIndex++;
                initialAnimationTimeoutId = setTimeout(runInitialAnimationInternal, getTransitionDelay(initialAnimationIndex));
            };
            imgChecker.onerror = () => {
                console.warn(`Failed to load image: ${imagePathToLoad}. Skipping.`);
                initialAnimationIndex++;
                if (initialAnimationIndex >= currentIntroImagePaths.length) { finalBgIntroCallback(); }
                else { initialAnimationTimeoutId = setTimeout(runInitialAnimationInternal, getTransitionDelay(initialAnimationIndex)); }
            };
            imgChecker.src = imagePathToLoad;
        }

        function triggerPlayVisualIntro(onBgIntroAnimationComplete) {
            onBgIntroCompleteInternalCallback = onBgIntroAnimationComplete;
            onBgIntroCallbackProcessed = false;
            const isDark = document.documentElement.classList.contains('dark');
            currentImagePaths = generateImagePaths(isDark ? 'bgdark' : 'bglight');
            currentIntroImagePaths = generateIntroImagePaths(currentImagePaths);

            const firstImagePath = currentIntroImagePaths[0];
            if (!firstImagePath) {
                console.error("No intro images generated. Skipping intro animation.");
                gsap.set(bgImageA, { opacity: 0 });
                gsap.set(bgImageB, { opacity: 0 });
                finalBgIntroCallback();
                return;
            }
            const tempImgCheck = new Image();
            tempImgCheck.onload = () => {
                bgCurrentElement.src = firstImagePath;
                gsap.set(bgCurrentElement, { opacity: isDark ? 0.2 : 0.5 });
                gsap.set(bgNextElement, { opacity: 0 });
                initialAnimationIndex = 1;
                initialAnimationTimeoutId = setTimeout(runInitialAnimationInternal, getTransitionDelay(initialAnimationIndex));
            };
            tempImgCheck.onerror = () => {
                console.error(`Failed to load first image for intro: ${firstImagePath}. Skipping intro animation.`);
                gsap.set(bgImageA, { opacity: 0 });
                gsap.set(bgImageB, { opacity: 0 });
                finalBgIntroCallback();
            };
            tempImgCheck.src = firstImagePath;
        }

        const preloadAllImages = () => {
            const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            const paths = generateImagePaths(theme === 'dark' ? 'bgdark' : 'bglight');
            let loaded = 0;
            const totalToPreload = paths.length;
            if (totalToPreload === 0) return;

            paths.forEach(path => {
                const img = new Image();
                img.onload = img.onerror = () => {
                    loaded++;
                    if (loaded === totalToPreload) console.log(`[Core] All ${theme} background images preloaded.`);
                };
                img.src = path;
            });
        };

        function _setSingleBackgroundImageForCarousel(visualIndex, duration = 0.5) {
            const safeVisualIndex = (visualIndex % totalAvailableBgImages + totalAvailableBgImages) % totalAvailableBgImages;
            const pathForCarousel = currentImagePaths[safeVisualIndex];

            if (!pathForCarousel) {
                console.warn(`Path for carousel background not found at index ${safeVisualIndex}. Skipping background update.`);
                return;
            }

            if (initialAnimationTimeoutId) { clearTimeout(initialAnimationTimeoutId); initialAnimationTimeoutId = null; }
            const imgChecker = new Image();
            imgChecker.onload = () => {
                bgNextElement.src = pathForCarousel;
                const isDark = document.documentElement.classList.contains('dark');
                gsap.timeline()
                    .to(bgCurrentElement, { opacity: 0, duration: duration, ease: "power2.out" }, 0)
                    .to(bgNextElement, { opacity: isDark ? 0.2 : 0.5, duration: duration, ease: "power2.out" }, 0)
                    .call(() => { [bgCurrentElement, bgNextElement] = [bgNextElement, bgCurrentElement]; });
            };
            imgChecker.onerror = () => {
                console.warn(`Failed to load background image for carousel: ${pathForCarousel}.`);
            };
            imgChecker.src = pathForCarousel;
        }

        window.appBackgroundChanger = {
            playVisualIntroAnimation: triggerPlayVisualIntro,
            initializeCarouselModeBackground: (index) => _setSingleBackgroundImageForCarousel(index, 0),
            _setSingleBackgroundImageForCarousel: _setSingleBackgroundImageForCarousel,
            totalImages: totalAvailableBgImages,
            refreshImagePaths: (theme) => {
                currentImagePaths = generateImagePaths(theme === 'dark' ? 'bgdark' : 'bglight');
                currentIntroImagePaths = generateIntroImagePaths(currentImagePaths);
                preloadAllImages();
            }
        };
        preloadAllImages();
    };

    /**
     * Main entry point for starting visuals after preloader.
     */
    window.startApplicationVisuals = () => {
        gsap.to(['main', '.carousel-hero'], { opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.1 });
        const backgroundSlideshow = document.getElementById('background-slideshow');
        if (backgroundSlideshow) {
            const isDark = document.documentElement.classList.contains('dark');
            backgroundSlideshow.style.backgroundColor = isDark ? 'rgba(0,0,0,0.8)' : '#ffffff';
            gsap.to(backgroundSlideshow, { opacity: 1, duration: 1.0, ease: "power2.out" });
        }

        if (typeof ModernCarousel !== 'undefined') {
            if (!window.modernCarouselInstanceForHobby) {
                // Pass the initial mobile view state
                window.modernCarouselInstanceForHobby = new ModernCarousel(labGlobalState.isMobileView);
                window.modernCarouselInstanceForHobby.setupDomReferences();
                window.modernCarouselInstanceForHobby.setupCategoryJump();
            }
        } else {
            console.error("[Core] ModernCarousel class is not defined! Cannot initialize main component.");
            return;
        }

        if (window.appBackgroundChanger && typeof window.appBackgroundChanger.playVisualIntroAnimation === 'function') {
            let isCarouselStartTriggered = false;
            window.appBackgroundChanger.playVisualIntroAnimation(() => {
                if (isCarouselStartTriggered) return;
                isCarouselStartTriggered = true;
                if (window.appBackgroundChanger.initializeCarouselModeBackground) {
                    const initialCenterIndex = window.modernCarouselInstanceForHobby.center;
                    window.appBackgroundChanger.initializeCarouselModeBackground(initialCenterIndex);
                }
                if (window.modernCarouselInstanceForHobby.runCarousel) {
                    window.modernCarouselInstanceForHobby.runCarousel(true);
                    gsap.to('.lab-header', { opacity: 1, visibility: 'visible', duration: 2, ease: "power2.out", delay: 1 });
                }
            });
        } else {
            console.warn("appBackgroundChanger not found. Starting carousel directly.");
            if (window.modernCarouselInstanceForHobby && typeof window.modernCarouselInstanceForHobby.runCarousel === 'function') {
                window.modernCarouselInstanceForHobby.runCarousel(true);
                gsap.to('.lab-header', { opacity: 1, visibility: 'visible', duration: 0.5, ease: "power2.out", delay: 0.5 });
            } else {
                console.error("ModernCarousel instance or runCarousel method not found for fallback!");
            }
        }
    };

    // --- [5] Event Listeners ---
    document.addEventListener('DOMContentLoaded', () => {
        if (window.appContentLoadedAndInitialized) {
            return;
        }
        window.appContentLoadedAndInitialized = true;

        // Initial render based on current state
        generatePosterCards(labGlobalState.currentProjectMode);
        renderCarouselCategoryJumpButtons(labGlobalState.currentProjectMode);

        document.getElementById('toggle-css')?.addEventListener('click', () => switchProjectMode('css'));
        document.getElementById('toggle-js')?.addEventListener('click', () => switchProjectMode('js'));

        // Media Query Listener for responsive changes
        const mediaQuery = window.matchMedia("(max-width: 768px)");

        function handleMediaQueryChange(event) {
            const newIsMobile = event.matches;
            // Only trigger re-render if the mobile view state has actually changed
            if (labGlobalState.isMobileView !== newIsMobile) {
                console.log(`[Core] Responsive breakpoint crossed! Mobile view changed from ${labGlobalState.isMobileView} to ${newIsMobile}. Re-rendering carousel.`);
                // Force re-render the current project mode to apply new poster types (iframe vs image)
                switchProjectMode(labGlobalState.currentProjectMode, true);
            }
        }

        mediaQuery.addEventListener('change', handleMediaQueryChange); // Use addEventListener

        window.initHeaderObserver();
        window.initBackgroundSlideshow();

        document.addEventListener('themeChanged', (event) => {
            const newTheme = event.detail.theme;
            console.log(`[Lab Core] Theme changed to ${newTheme}. Syncing visuals.`);

            if (window.appBackgroundChanger && window.modernCarouselInstanceForHobby) {
                gsap.to(['.carousel', '.carousel-hero'], {
                    opacity: 0,
                    duration: 0.4,
                    ease: 'power2.in',
                    onComplete: () => {
                        window.appBackgroundChanger.refreshImagePaths(newTheme);
                        const bgSlideshow = document.getElementById('background-slideshow');
                        if (bgSlideshow) {
                            gsap.to(bgSlideshow, {
                                backgroundColor: newTheme === 'dark' ? 'rgba(0,0,0,0.8)' : '#ffffff',
                                duration: 0.5
                            });
                        }
                        const centerIndex = window.modernCarouselInstanceForHobby.center;
                        window.appBackgroundChanger._setSingleBackgroundImageForCarousel(centerIndex, 0.8);
                        gsap.to(['.carousel', '.carousel-hero'], {
                            opacity: 1,
                            duration: 0.6,
                            delay: 0.2,
                            ease: 'power2.out'
                        });
                    }
                });
            }
        });

        document.addEventListener('preloaderHidden', () => {
            gsap.to(document.body, { opacity: 1, duration: 0.5, ease: "power2.out" });
        });
    });

})();