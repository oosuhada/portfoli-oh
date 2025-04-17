document.addEventListener('DOMContentLoaded', function() {
    /**
     * [개선된 버전] 슬라이드 배경 교차 페이드 효과 관리자
     */
    const slideBackgroundEffectManager = (function() {
        let imagePaths = [];
        let currentIndex = 0;
        let animationInterval = null;
        const slideLayers = new Map();
        let isLayerA_Active = true;

        const TOTAL_IMAGES = 50;
        const IMAGE_BASE_URL = '../lab/images/';
        const IMAGE_PREFIX = 'bgdark';
        const IMAGE_EXTENSION = 'png';
        const CYCLE_INTERVAL_MS = 300; // 이미지 순환 간격
        const FADE_DURATION_S = 0.4; // 교차 페이드 지속 시간
        const TARGET_OPACITY = 0.35; // 배경 이미지 목표 투명도

        function generatePaths() {
            if (imagePaths.length > 0) return;
            for (let i = 1; i <= TOTAL_IMAGES; i++) {
                imagePaths.push(`${IMAGE_BASE_URL}${IMAGE_PREFIX}${i}.${IMAGE_EXTENSION}`);
            }
        }

        function preloadImages() {
            console.log('[SlideBackgroundEffect] Preloading background images...');
            imagePaths.forEach(path => {
                const img = new Image();
                img.src = path;
            });
        }

        // 각 슬라이드에 배경 레이어를 동적으로 추가하는 함수
        function setupLayers() {
            document.querySelectorAll('.slide').forEach(slide => {
                const layerA = document.createElement('div');
                const layerB = document.createElement('div');
                layerA.className = 'slide-bg-layer';
                layerB.className = 'slide-bg-layer';

                // DOM의 맨 앞에 추가하여 다른 콘텐츠 뒤에 위치하도록 함
                slide.prepend(layerB);
                slide.prepend(layerA);

                slideLayers.set(slide, { layerA, layerB });
            });
        }

        function cycleImage(targetSlide) {
            const layers = slideLayers.get(targetSlide);
            if (!layers) return;

            const { layerA, layerB } = layers;
            const imagePathToLoad = imagePaths[currentIndex];
            currentIndex = (currentIndex + 1) % imagePaths.length;

            const activeLayer = isLayerA_Active ? layerA : layerB;
            const inactiveLayer = isLayerA_Active ? layerB : layerA;

            // 비활성 레이어에 다음 이미지를 설정
            inactiveLayer.style.backgroundImage = `url('${imagePathToLoad}')`;

            // 교차 페이드 애니메이션
            gsap.to(activeLayer, { opacity: 0, duration: FADE_DURATION_S, ease: 'power1.inOut' });
            gsap.to(inactiveLayer, { opacity: TARGET_OPACITY, duration: FADE_DURATION_S, ease: 'power1.inOut' });

            isLayerA_Active = !isLayerA_Active;
        }

        function start(targetSlide) {
            if (animationInterval || !targetSlide) return;
            const layers = slideLayers.get(targetSlide);
            if (!layers) return;

            // 그라데이션 레이어 숨기기
            gsap.to(targetSlide, { '--pseudo-opacity': 0, duration: 0.4, ease: 'power2.inOut' });

            // 첫 번째 이미지 설정 및 페이드 인
            const firstImagePath = imagePaths[currentIndex];
            currentIndex = (currentIndex + 1) % imagePaths.length;
            layers.layerA.style.backgroundImage = `url('${firstImagePath}')`;
            gsap.to(layers.layerA, { opacity: TARGET_OPACITY, duration: FADE_DURATION_S });
            isLayerA_Active = true;
            
            animationInterval = setInterval(() => cycleImage(targetSlide), CYCLE_INTERVAL_MS);
        }

        function stop(targetSlide) {
            if (!animationInterval) return;
            clearInterval(animationInterval);
            animationInterval = null;

            const layers = slideLayers.get(targetSlide);
            if (layers) {
                // 모든 배경 레이어 페이드 아웃
                gsap.to([layers.layerA, layers.layerB], { opacity: 0, duration: 0.5, ease: 'power2.out' });
            }

            // 그라데이션 레이어 다시 표시
            gsap.to(targetSlide, {
                '--pseudo-opacity': 1,
                duration: 0.5,
                ease: 'power2.out'
            });
        }
        
        function init() {
            setupLayers();
            generatePaths();
            preloadImages();
        }

        return { init, start, stop };
    })();

    slideBackgroundEffectManager.init();
    
    const fixedFilterID = 'classicWetInk';
    const inkSpreadFilterID = 'inkSpreadEffectFilter';

    const slideColors = [
        { balloon:['#333333','#4b4b4b','#666666','#808080'],confetti:['#000000','#181818','#282828','#0A0A0A','#111111','#202020'],fastText:['#4b4b4b','#666666','#808080']},
        { balloon:['#ff8c42','#ffaa6e','#ffdec2','#e07b39'],confetti:['#ff8c42','#ffaa6e','#e07b39','#d2691e','#ffbf80'],fastText:['#ff8c42','#e07b39','#d2691e']},
        { balloon:['#d279ee','#c45eda','#f8c390','#e89cd2'],confetti:['#d279ee','#c45eda','#e89cd2','#b54bc6','#f8c390'],fastText:['#d279ee','#c45eda','#b54bc6']},
        { balloon:['#f78fad','#fdeb82','#e43970','#fdd090'],confetti:['#f78fad','#e43970','#fdd090','#db0567','#c21d54'],fastText:['#f78fad','#e43970','#db0567']},
        { balloon:['#6de195','#2c5e1a','#c4e759','#4caf50'],confetti:['#6de195','#4caf50','#2c5e1a','#388e3c','#c4e759'],fastText:['#6de195','#4caf50','#388e3c']},
        { balloon:['#41c7af','#155d47','#54e38e','#26a69a'],confetti:['#41c7af','#26a69a','#155d47','#54e38e','#00796b'],fastText:['#41c7af','#26a69a','#00796b']},
        { balloon:['#5583ee','#41d8dd','#1976d2','#4fc3f7'],confetti:['#5583ee','#1976d2','#41d8dd','#0288d1','#4fc3f7'],fastText:['#5583ee','#41d8dd','#0288d1']},
        { balloon:['#6cacff','#8debff','#2196f3','#4fc3f7'],confetti:['#6cacff','#2196f3','#8debff','#0288d1','#4fc3f7'],fastText:['#6cacff','#2196f3','#0288d1']},
        { balloon:['#a16bfe','#deb0df','#7b1fa2','#ab47bc'],confetti:['#a16bfe','#7b1fa2','#deb0df','#8e24aa','#ab47bc'],fastText:['#a16bfe','#7b1fa2','#8e24aa']},
        { balloon:['#bc3d2f','#a16bfe','#d32f2f','#c2185b','#ab47bc'],confetti:['#bc3d2f','#a16bfe','#d32f2f','#c2185b','#ab47bc'],fastText:['#bc3d2f','#a16bfe','#c2185b']}
    ];

    function updateBalloonColors() {
        const balloons = document.querySelectorAll('.balloon:not(.fast-text-balloon)');
        const fastTextBalloons = document.querySelectorAll('.fast-text-balloon');
        const colors = slideColors[currentSlide];

        balloons.forEach(balloon => {
            const newColor = colors.balloon[Math.floor(Math.random() * colors.balloon.length)];
            gsap.to(balloon, {
                backgroundColor: newColor,
                duration: 0.5,
                ease: "power1.out"
            });
            balloon.dataset.confettiColors = JSON.stringify(colors.confetti);
            balloon.dataset.slideIndex = currentSlide;
        });

        fastTextBalloons.forEach(balloon => {
            const newColor = colors.fastText[Math.floor(Math.random() * colors.fastText.length)];
            gsap.to(balloon, {
                backgroundColor: newColor,
                duration: 0.5,
                ease: "power1.out"
            });
            balloon.dataset.confettiColors = JSON.stringify(colors.confetti);
            balloon.dataset.slideIndex = currentSlide;
        });
    }

    function createScreenInkSplash(targetElement, event, confettiColors = null) {
        const existingSplash = targetElement.querySelector('.ink-splash');
        if (existingSplash) existingSplash.remove();

        const internalSplash = document.createElement('span');
        internalSplash.classList.add('ink-splash');

        const rect = targetElement.getBoundingClientRect();
        const splashSize = Math.max(rect.width, rect.height) * 0.02;

        if (targetElement === document.body) {
            internalSplash.style.left = `${event.clientX - splashSize / 2}px`;
            internalSplash.style.top = `${event.clientY - splashSize / 2}px`;
        } else {
            internalSplash.style.left = `${event.clientX - rect.left - splashSize / 2}px`;
            internalSplash.style.top = `${event.clientY - rect.top - splashSize / 2}px`;
        }

        internalSplash.style.width = `${splashSize}px`;
        internalSplash.style.height = `${splashSize}px`;

        const borderRadii = [
            "47% 53% 50% 40% / 60% 37% 53% 40%", "65% 42% 70% 55% / 70% 68% 46% 51%", "60% 60% 45% 55% / 55% 60% 50% 60%", "59% 58% 65% 62% / 52% 68% 37% 59%", "60% 45% 46% 62% / 95% 62% 62% 58%", "55% 66% 33% 55% / 66% 68% 66% 62%", "54% 61% 67% 63% / 59% 27% 66% 65%", "30% 65% 60% 62% / 60% 39% 60% 68%", "61% 63% 35% 57% / 65% 26% 55% 62%",
        ];
        const randomRadius = borderRadii[Math.floor(Math.random() * borderRadii.length)];
        internalSplash.style.borderRadius = randomRadius;

        const colorsToUse = confettiColors || slideColors[currentSlide].confetti;
        const color = colorsToUse[Math.floor(Math.random() * colorsToUse.length)];
        internalSplash.style.backgroundColor = color;
        internalSplash.classList.add('splash-animate');
        targetElement.appendChild(internalSplash);

        setTimeout(() => {
            if (internalSplash.parentElement) internalSplash.remove();
        }, 700);
    }

    function createExternalInkParticles(originX, originY, confettiColors = null) {
        const particleCount = 5;
        const colors = confettiColors || slideColors[currentSlide].confetti;
        const irregularBorderRadii = [
            '45% 58% 62% 37% / 52% 38% 67% 49%', '62% 64% 58% 60% / 70% 50% 70% 50%', '54% 42% 62% 57% / 54% 42% 62% 47%', '62% 68% 60% 56% / 70% 60% 70% 50%', '63% 38% 70% 33% / 53% 62% 39% 46%', '65% 70% 65% 68% / 75% 54% 74% 50%', '48% 56% 35% 38% / 54% 42% 62% 47%', '66% 75% 65% 70% / 66% 55% 66% 60%', '30% 70% 70% 30% / 30% 30% 70% 70%', '50% 50% 30% 70% / 60% 40% 60% 40%', '35% 65% 45% 55% / 60% 30% 70% 40%', '70% 30% 80% 20% / 65% 35% 75% 25%'
        ];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('confetti-particle');
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.filter = 'url(#inkParticleSurface)';

            let width, height;
            const sizeMultiplier = 4;
            const randomFactor = Math.random();

            if (randomFactor < 0.6) {
                const baseSize = (Math.random() * 10 + 8) * sizeMultiplier;
                width = baseSize * (0.8 + Math.random() * 0.4);
                height = baseSize * (0.8 + Math.random() * 0.4);
            } else {
                const baseWidth = (Math.random() * 12 + 6) * sizeMultiplier;
                const baseHeight = (Math.random() * 8 + 4) * sizeMultiplier;
                width = baseWidth;
                height = baseHeight;
            }

            particle.style.width = `${width}px`;
            particle.style.height = `${height}px`;
            particle.style.borderRadius = irregularBorderRadii[Math.floor(Math.random() * irregularBorderRadii.length)];

            if (width < 15 && height < 15) {
                particle.style.opacity = (Math.random() * 0.2 + 0.7).toString();
            }

            document.body.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 60 + 40;
            const duration = Math.random() * 1.5 + 2.5;
            const initialRotation = Math.random() * 360;
            const finalRotation = initialRotation + (Math.random() * 30 - 90);
            const initialOpacity = parseFloat(particle.style.opacity || '0.6');
            const maxBlur = 5 + Math.random() * 5;

            particle.style.left = `${originX}px`;
            particle.style.top = `${originY}px`;
            particle.style.transform = `translate(-50%, -50%) scale(1) rotate(${initialRotation}deg)`;

            particle.animate([{
                transform: `translate(-50%, -50%) scale(1) rotate(${initialRotation}deg)`,
                opacity: initialOpacity,
                filter: 'blur(0.5px)'
            }, {
                transform: `translate(-50%, -50%) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0.05) rotate(${finalRotation}deg)`,
                opacity: 0,
                filter: `blur(${maxBlur}px)`
            }], {
                duration: duration * 1000,
                easing: 'cubic-bezier(0.1, 0.7, 0.3, 1)',
                fill: 'forwards'
            });

            setTimeout(() => {
                particle.remove();
            }, duration * 1000);
        }
    }

    function createInkSplashes(clickedElement, event) {
        let confettiColorsForSplash = null;
        const slideIndexForConfetti = parseInt(clickedElement.dataset.slideIndex || currentSlide);
        confettiColorsForSplash = slideColors[slideIndexForConfetti].confetti;

        createScreenInkSplash(clickedElement, event, confettiColorsForSplash);
        createExternalInkParticles(event.clientX, event.clientY, confettiColorsForSplash);

        if (window.gsap) {
            gsap.to(clickedElement, {
                duration: 2,
                scale: 1.5,
                opacity: 0,
                ease: "power2.out",
                onComplete: () => clickedElement.remove()
            });
        } else {
            clickedElement.animate([{
                transform: 'scale(1)',
                opacity: 1
            }, {
                transform: 'scale(1.5)',
                opacity: 0
            }], {
                duration: 600,
                easing: 'ease-out',
                fill: 'forwards'
            }).onfinish = () => clickedElement.remove();
        }
    }

    function createFastTextBalloon(text, minLeft = 20, maxLeft = 80) {
        if (!isTabActive) return;

        const balloon = document.createElement('div');
        balloon.className = 'balloon fast-text-balloon';
        balloon.textContent = text;

        const color = slideColors[currentSlide].fastText[Math.floor(Math.random() * slideColors[currentSlide].fastText.length)];
        balloon.style.backgroundColor = color;
        balloon.style.filter = 'none';

        balloon.style.display = 'flex';
        balloon.style.justifyContent = 'center';
        balloon.style.alignItems = 'center';
        balloon.style.textAlign = 'center';

        document.body.appendChild(balloon);

        const left = minLeft + Math.random() * (maxLeft - minLeft);
        balloon.style.left = `${left}vw`;

        balloon.dataset.confettiColors = JSON.stringify(slideColors[currentSlide].confetti);
        balloon.dataset.slideIndex = currentSlide;

        balloon.addEventListener('click', function(e) {
            this.style.pointerEvents = 'none';
            createInkSplashes(this, e);
        });

        const startY = -200;
        const endY = -window.innerHeight - 100;
        const duration = 8 + Math.random() * 8;

        if (window.gsap) {
            gsap.fromTo(balloon, {
                y: startY,
                opacity: 0.6
            }, {
                y: endY,
                opacity: 0.2,
                duration: duration,
                ease: "power1.inOut",
                onComplete: () => {
                    balloon.remove();
                }
            });
        } else {
            balloon.animate([{
                transform: `translateY(${startY}px)`,
                opacity: 0.6
            }, {
                transform: `translateY(${endY}px)`,
                opacity: 0.2
            }], {
                duration: duration * 1000,
                easing: 'ease-in-out',
                fill: 'forwards'
            }).onfinish = () => {
                balloon.remove();
            };
        }
    }

    function createBalloon() {
        if (!isTabActive) return;

        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        document.body.appendChild(balloon);

        const left = 10 + Math.random() * 80;
        const width = 22 + Math.random() * 32;
        const height = 30 + Math.random() * 42;
        const color = slideColors[currentSlide].balloon[Math.floor(Math.random() * slideColors[currentSlide].balloon.length)];

        balloon.style.backgroundColor = color;
        balloon.style.left = `${left}vw`;
        balloon.style.width = `${width}px`;
        balloon.style.height = `${height}px`;

        balloon.dataset.confettiColors = JSON.stringify(slideColors[currentSlide].confetti);
        balloon.dataset.slideIndex = currentSlide;

        balloon.addEventListener('click', function(e) {
            this.style.pointerEvents = 'none';
            createInkSplashes(this, e);
        });

        if (window.gsap) {
            const startY = -100;
            const duration = 8 + Math.random() * 8;
            gsap.fromTo(balloon, {
                y: startY,
                opacity: 0.8
            }, {
                y: -window.innerHeight - Math.random() * 200 - 50,
                opacity: 0,
                duration: duration,
                delay: Math.random() * 0.5,
                ease: "power1.inOut",
                onComplete: () => {
                    balloon.remove();
                }
            });
        } else {
            const startY = -100;
            const endY = -window.innerHeight - Math.random() * 200 - 50;
            const duration = 8 + Math.random() * 8;
            balloon.animate([{
                transform: `translateY(${startY}px)`,
                opacity: 0.8
            }, {
                transform: `translateY(${endY}px)`,
                opacity: 0
            }], {
                duration: duration * 1000,
                delay: Math.random() * 0.5 * 1000,
                easing: 'ease-in-out',
                fill: 'forwards'
            }).onfinish = () => {
                balloon.remove();
            };
        }
    }

    let balloonInterval = null;
    let isTabActive = true;
    let pendingTimeouts = [];

    function launchBalloonBatch() {
        if (!isTabActive) return;
        const numToLaunch = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numToLaunch; i++) {
            const timeoutId = setTimeout(createBalloon, Math.random() * 500);
            pendingTimeouts.push(timeoutId);
        }
    }

    window.startBalloonInterval = function() {
        if (!balloonInterval && isTabActive) {
            balloonInterval = setInterval(launchBalloonBatch, 2200);
            console.log("Balloon interval started.");
        }
    };

    window.stopBalloonInterval = function() {
        if (balloonInterval) {
            clearInterval(balloonInterval);
            balloonInterval = null;
        }
        pendingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        pendingTimeouts = [];
        document.querySelectorAll('.balloon, .fast-text-balloon').forEach(b => b.remove());
        console.log("Balloon interval stopped and cleaned.");
    };

    document.addEventListener('visibilitychange', () => {
        isTabActive = document.visibilityState === 'visible';
        if (isTabActive) {
            window.startBalloonInterval();
        } else {
            window.stopBalloonInterval();
        }
    });

    window.initializeMainPortfolio = function() {
        const preloaderElement = document.getElementById("preloader");
        const mainPortfolio = document.getElementById('mainPortfolio');
        const controls = document.getElementById('controls');
        const inboxIconContainer = document.getElementById('inboxIconContainer');
        const darkModeToggleContainer = document.getElementById('darkModeToggleContainer');

        if (preloaderElement) {
            gsap.set(preloaderElement, { opacity: 0, display: "none" });
        }
        gsap.set(mainPortfolio, { opacity: 1, display: 'block' });
        gsap.set(controls, { opacity: 0, display: 'none' });

        if (inboxIconContainer) {
            gsap.set(inboxIconContainer, { opacity: 1, display: 'block' });
        }
        if (darkModeToggleContainer) {
            gsap.set(darkModeToggleContainer, { opacity: 0, display: 'none' });
        }

        if (isTabActive) {
            createFastTextBalloon('click me', 20, 45);
            setTimeout(() => createFastTextBalloon('click me', 55, 80), 450);
            setTimeout(launchBalloonBatch, 800);
            window.startBalloonInterval();
        }

        window.initializeSlider();

        document.getElementById('mainPortfolio').style.display = 'block';
        document.getElementById('preloaderContainer').style.display = 'none';
        document.getElementById('controls').style.display = 'none';
    };

    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    const pageIndicator = document.querySelector('.page-indicator');

    let currentSlide = 0;
    let isTransitioning = false;

    if (slides.length === 0) {
        console.error("No slides found. Slider functionality disabled.");
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (pageIndicator) pageIndicator.style.display = 'none';
        return;
    }

    if (totalPagesEl) totalPagesEl.textContent = totalSlides;
    if (currentPageEl) currentPageEl.textContent = 1;

    if (prevBtn) prevBtn.addEventListener('click', function() { if (!isTransitioning) showPreviousSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', function() { if (!isTransitioning) showNextSlide(); });

    document.addEventListener('keydown', function(e) {
        if (isTransitioning) return;
        if (e.key === 'ArrowLeft') { showPreviousSlide(); }
        else if (e.key === 'ArrowRight') { showNextSlide(); }
    });

    window.initializeSlider = function() {
        slides.forEach(slide => {
            slide.style.visibility = 'hidden';
            slide.style.opacity = '0';
            slide.classList.remove('active');
        });

        if (slides.length > 0) {
            const firstSlide = slides[0];
            firstSlide.style.transition = 'none';
            firstSlide.style.visibility = 'visible';
            firstSlide.style.opacity = '1';
            firstSlide.classList.add('active');
            firstSlide.offsetHeight;
            setTimeout(() => { firstSlide.style.transition = ''; }, 50);
            if (currentPageEl) currentPageEl.textContent = 1;
        }

        if (prevBtn) gsap.to(prevBtn, { opacity: 1, duration: 0.5, ease: "power1.out", display: 'flex' });
        if (nextBtn) gsap.to(nextBtn, { opacity: 1, duration: 0.5, ease: "power1.out", display: 'flex' });
        if (pageIndicator) gsap.to(pageIndicator, { opacity: 1, duration: 0.5, ease: "power1.out", display: 'flex' });
        
        setupWelcomeBannerHover();
    };

    function showSlide(index) {
        if (isTransitioning || slides.length === 0) return;
        isTransitioning = true;
        const currentSlideElement = slides[currentSlide];
        const nextSlideElement = slides[index];
        nextSlideElement.style.visibility = 'visible';
        currentSlideElement.style.opacity = '0';
        nextSlideElement.style.opacity = '1';
        setTimeout(() => {
            currentSlideElement.style.visibility = 'hidden';
            currentSlideElement.classList.remove('active');
            nextSlideElement.classList.add('active');
            currentSlide = index;
            if (currentPageEl) currentPageEl.textContent = index + 1;
            isTransitioning = false;
            setupWelcomeBannerHover();
            updateBalloonColors();
        }, 600);
    }

    function showNextSlide() { if (slides.length > 0) showSlide((currentSlide + 1) % totalSlides); }
    function showPreviousSlide() { if (slides.length > 0) showSlide((currentSlide - 1 + totalSlides) % totalSlides); }

    let touchStartX = 0;
    let touchEndX = 0;
    const sliderElement = document.querySelector('.slider-container');
    if (sliderElement) {
        sliderElement.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        sliderElement.addEventListener('touchend', (e) => {
            if (isTransitioning) return;
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) showNextSlide();
        else if (touchEndX > touchStartX + swipeThreshold) showPreviousSlide();
    }

    const slide1Title = document.querySelector('#slide1 .slide-title');
    const inkSpreadFilterElement = document.getElementById(inkSpreadFilterID);

    if (slide1Title && inkSpreadFilterElement) {
        const feGaussianBlur = inkSpreadFilterElement.querySelector('feGaussianBlur');
        const feDisplacementMap = inkSpreadFilterElement.querySelector('feDisplacementMap');

        if (feGaussianBlur && feDisplacementMap) {
            const initialStdDeviation = parseFloat(feGaussianBlur.getAttribute('stdDeviation')) || 1.5;
            const initialScale = parseFloat(feDisplacementMap.getAttribute('scale')) || 6;
            let slide1HoverAnimation;
            slide1Title.addEventListener('mouseenter', () => {
                if (slide1HoverAnimation) slide1HoverAnimation.kill();
                slide1Title.style.filter = `url(#${inkSpreadFilterID})`;
                gsap.set(feGaussianBlur, { attr: { stdDeviation: initialStdDeviation } });
                gsap.set(feDisplacementMap, { attr: { scale: initialScale } });
                slide1HoverAnimation = gsap.timeline().to(feGaussianBlur, { attr: { stdDeviation: 3 }, duration: 1, ease: "power2.out" }, 0).to(feDisplacementMap, { attr: { scale: 1.6 }, duration: 1, ease: "power2.out" }, 0).to(slide1Title, { scale: 1.1, duration: 1, ease: "power2.out" }, 0);
            });
            slide1Title.addEventListener('mouseleave', () => {
                if (slide1HoverAnimation) slide1HoverAnimation.kill();
                slide1HoverAnimation = gsap.timeline({
                    onComplete: () => {
                        slide1Title.style.filter = '';
                        gsap.set(feGaussianBlur, { attr: { stdDeviation: initialStdDeviation } });
                        gsap.set(feDisplacementMap, { attr: { scale: initialScale } });
                        gsap.set(slide1Title, { scale: 1 });
                    }
                }).to(feGaussianBlur, { attr: { stdDeviation: initialStdDeviation }, duration: 0.2, ease: "power1.in" }, 0).to(feDisplacementMap, { attr: { scale: initialScale }, duration: 0.2, ease: "power1.in" }, 0).to(slide1Title, { scale: 1, duration: 0.2, ease: "power1.in" }, 0);
            });
        }
    }

    function setupWelcomeBannerHover() {
        document.querySelectorAll('.welcome-banner').forEach(banner => {
            const span = banner.querySelector('span');
            if (!span && banner.textContent.trim() !== '') {
                const originalText = banner.getAttribute('data-original-text') || banner.textContent;
                if (!banner.getAttribute('data-original-text')) banner.setAttribute('data-original-text', originalText);
                banner.innerHTML = `<span>${originalText}</span>`;
            } else if (span && !banner.getAttribute('data-original-text')) {
                banner.setAttribute('data-original-text', span.textContent);
            }
            banner.removeEventListener('mouseenter', handleBannerMouseEnter);
            banner.removeEventListener('mouseleave', handleBannerMouseLeave);
            banner.addEventListener('mouseenter', handleBannerMouseEnter);
            banner.addEventListener('mouseleave', handleBannerMouseLeave);
        });
    }
    function handleBannerMouseEnter() { this.setAttribute('data-hovered', 'true'); }
    function handleBannerMouseLeave() { this.removeAttribute('data-hovered'); }
    setupWelcomeBannerHover();

    document.addEventListener('click', function(e) {
        const isInteractiveElement = e.target.closest('.balloon, .fast-text-balloon, .slide-title, .nav-button, .welcome-banner-link, #inboxIconContainer, #darkModeToggleContainer');
        if (!isInteractiveElement) {
            createScreenInkSplash(document.body, e, slideColors[currentSlide].confetti);
        }
    });

    let inkInterval;
    let isMouseDownOnTitle = false;
    let currentMousedownEvent = null;
    let currentMousedownConfettiColors = null;
    const originalBalloonOpacities = new Map();
    const originalWelcomeBannerOpacities = new Map();

    document.querySelectorAll('.slide-title').forEach((title) => {
        title.addEventListener('mousedown', (e) => {
            if (e.button === 2) return;
            isMouseDownOnTitle = true;
            currentMousedownEvent = e;
            currentMousedownConfettiColors = slideColors[currentSlide].confetti;
            
            const activeSlide = title.closest('.slide');
            if (activeSlide) {
                slideBackgroundEffectManager.start(activeSlide);
            }

            gsap.to('.nav-button, .page-indicator', { opacity: 0, duration: 0.3, pointerEvents: 'none' });
            document.querySelectorAll('.welcome-banner').forEach(banner => {
                originalWelcomeBannerOpacities.set(banner, getComputedStyle(banner).opacity);
                gsap.to(banner, { opacity: 0.1, duration: 0.3 });
            });
            document.querySelectorAll('.balloon, .fast-text-balloon').forEach(balloon => {
                originalBalloonOpacities.set(balloon, getComputedStyle(balloon).opacity);
                gsap.to(balloon, { opacity: 0.05, duration: 0.3 });
            });
            clearInterval(inkInterval);
            inkInterval = setInterval(() => {
                if (currentMousedownEvent) {
                    createScreenInkSplash(document.body, currentMousedownEvent, currentMousedownConfettiColors);
                    createExternalInkParticles(currentMousedownEvent.clientX, currentMousedownEvent.clientY, currentMousedownConfettiColors);
                }
            }, 100);
        });
    });

    function resetInkBurstMode() {
        if (!isMouseDownOnTitle) return; // 이벤트 중복 방지

        isMouseDownOnTitle = false;
        currentMousedownEvent = null;
        currentMousedownConfettiColors = null;
        if (inkInterval) {
            clearInterval(inkInterval);
            inkInterval = null;
        }
        
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
            slideBackgroundEffectManager.stop(activeSlide);
        }

        gsap.to('.nav-button, .page-indicator', { opacity: 1, duration: 0.5, pointerEvents: 'auto' });
        originalWelcomeBannerOpacities.forEach((opacity, banner) => gsap.to(banner, { opacity, duration: 0.5 }));
        originalWelcomeBannerOpacities.clear();
        originalBalloonOpacities.forEach((opacity, balloon) => gsap.to(balloon, { opacity, duration: 0.5 }));
        originalBalloonOpacities.clear();
    }
    
    // 마우스 버튼을 놓았을 때 전역적으로 이벤트를 감지하여 효과를 초기화
    document.addEventListener('mouseup', (e) => {
        if (isMouseDownOnTitle) {
            resetInkBurstMode();
        }
    });


    window.initializeSlider();
    window.initializeMainPortfolio();
});
