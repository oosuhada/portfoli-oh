// project-detail.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. 초기 세팅
    const mainContent = document.querySelector('main.App');
    const loader = document.getElementById('loader');
    gsap.config({ force3D: true });
    gsap.registerPlugin(ScrollTrigger);

    // Get the scroll down indicator element
    const scrollDownIndicator = document.querySelector('.scroll-down-indicator');

    // **Initial scroll disable**: Add 'no-scroll' class to body immediately on DOMContentLoaded
    document.body.classList.add('no-scroll');

    // 2. Locomotive Scroll 세팅
    // This 'scroll' variable should be the only Locomotive Scroll instance on the page.
    const scroll = new LocomotiveScroll({
        el: mainContent,
        smooth: true,
        lerp: 0.08,
        multiplier: 0.9,
        smartphone: { smooth: true },
        tablet: { smooth: true },
    });

    // **Stop Locomotive Scroll immediately after initialization**
    scroll.stop();

    scroll.on('scroll', ScrollTrigger.update);
    ScrollTrigger.scrollerProxy(mainContent, {
        scrollTop(value) {
            return arguments.length
                ? scroll.scrollTo(value, { duration: 0, disableLerp: true })
                : scroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
            return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight,
            };
        },
        pinType: mainContent.style.transform ? 'transform' : 'fixed',
    });

    // 3. 스크롤 진행률 표시기 (SVG)
    const progressIndicator = document.getElementById('scroll-progress-indicator');
    const progressCircle = document.querySelector('.progress-circle-fill');
    if (progressIndicator && progressCircle) {
        const circleRadius = progressCircle.r.baseVal.value;
        const circumference = 2 * Math.PI * circleRadius;
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;

        scroll.on('scroll', (instance) => {
            const progress = Math.min(instance.scroll.y / instance.limit.y, 1);
            const offset = circumference * (1 - progress);
            progressCircle.style.strokeDashoffset = offset;

            if (instance.scroll.y > 10) {
                progressIndicator.style.opacity = 1;
            } else {
                progressIndicator.style.opacity = 0;
            }
        });
        progressIndicator.style.opacity = 0;
        progressIndicator.style.transition = 'opacity 0.3s ease-in-out';
    }

    // 4. 로더 애니메이션
    if (loader) {
        gsap.to(loader, {
            opacity: 0,
            duration: 1,
            delay: 1.5,
            onComplete: () => {
                loader.remove(); // 로더 요소 제거
                // 로딩 시작 시점부터 7초가 되는 시점에 스크롤 활성화 및 화살표 애니메이션 시작
                // (로더 애니메이션이 2.5초 걸리므로, 4.5초 추가 대기)
                const delayUntilScrollActive = 3000; // 4.5초 = 7000ms - 2500ms

                setTimeout(() => {
                    document.body.classList.remove('no-scroll'); // body에서 no-scroll 클래스 제거 (스크롤 활성화)
                    scroll.start(); // Locomotive Scroll 스크롤 다시 활성화

                    if (scrollDownIndicator) {
                        gsap.to(scrollDownIndicator, {
                            opacity: 1, // 0에서 1로 진해짐
                            duration: 4, // 3초 동안
                            ease: 'power2.out',
                            onComplete: () => {
                                scrollDownIndicator.classList.add('active'); // 활성화 클래스 추가 (pointer-events: auto)
                            }
                        });

                        // 화살표 클릭 시 다음 섹션으로 부드럽게 스크롤 (선택 사항)
                        scrollDownIndicator.addEventListener('click', () => {
                            const nextSection = document.getElementById('project-details'); // Hero 다음 섹션의 ID
                            if (nextSection) {
                                scroll.scrollTo(nextSection, { duration: 1200, easing: [0.65, 0.05, 0.36, 1] });
                            }
                        });
                    }
                }, delayUntilScrollActive);
            },
            ease: 'power2.out'
        });
    }

    const headerRightControls = document.querySelector('.header-right-controls');
    const topNavigation = document.querySelector('.top-navigation');


    // 5. Hero 영역 등장 애니메이션 & Top Navigation / Controls Visibility
    gsap.set(['.cover-head-vid-wrapper', '.small-text-load2', topNavigation, headerRightControls], { opacity: 0, y: 100 });

    gsap.to(['.cover-head-vid-wrapper', '.small-text-load2'], {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: 'power2.out',
        delay: 1.7
    });

    gsap.to(topNavigation, {
        opacity: 1,
        y: 0,
        duration: 1.3,
        ease: 'power2.out',
        delay: 1.9,
        onComplete: () => {
            gsap.set(topNavigation, { pointerEvents: 'auto' });
        }
    });

    ScrollTrigger.create({
        trigger: '#hero',
        scroller: mainContent,
        start: 'bottom top+=100',
        end: 'bottom top',
        scrub: true,
        onEnter: () => {
            gsap.to(headerRightControls, { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.5 });
        },
        onLeaveBack: () => {
            gsap.to(headerRightControls, { opacity: 0, y: 50, pointerEvents: 'none', duration: 0.5 });
        },
        immediateRender: true
    });

    // Language Toggle Logic (Simplified)
    const langButtons = document.querySelectorAll('.lang-button');
    const bodyElement = document.body;
    const defaultLanguage = 'ko';

    const setLanguage = (lang) => {
        langButtons.forEach(button => {
            if (button.dataset.lang === lang) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        bodyElement.classList.remove('lang-ko', 'lang-en');
        bodyElement.classList.add(`lang-${lang}`);
        localStorage.setItem('portfolioLang', lang);

        document.querySelectorAll('[data-lang-ko], [data-lang-en]').forEach(element => {
            const translatedText = element.getAttribute(`data-lang-${lang}`);
            if (translatedText !== null) {
                element.innerHTML = translatedText;
            }
        });

        console.log(`Language set to: ${lang}`);
    };

    const savedLanguage = localStorage.getItem('portfolioLang');
    setLanguage(savedLanguage || defaultLanguage);

    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.dataset.lang;
            setLanguage(lang);
        });
    });

    // Theme Toggle Integration (Leveraging Global Theme Manager)
    const themeToggleButton = document.querySelector('.theme-toggle-button');

    if (themeToggleButton && typeof window.themeManager !== 'undefined' && typeof window.themeManager.toggle === 'function') {
        themeToggleButton.addEventListener('click', window.themeManager.toggle);
        console.log("[project-detail.js] Theme toggle button integrated with global themeManager.toggle().");
        window.themeManager.initialize();
    } else {
        console.warn("[project-detail.js] Theme toggle button or global themeManager not found. Theme toggling will not work.");
    }

    // 6. Hero/프로젝트 소개/디스커버/디파인 섹션 개별 애니메이션 함수
    if (typeof animateHero === 'function') animateHero(mainContent); // This remains unchanged
    if (typeof animateProjectDetails === 'function') animateProjectDetails(mainContent);
    if (typeof animateDiscover === 'function') animateDiscover(mainContent);
    if (typeof animateDefine === 'function') animateDefine(mainContent);

    // 7. DESIGN & DELIVER 슬라이드 애니메이션 (design-1/deliver-1 pinned sections)
    // initializeAllSlideShowAnimations function passes the Locomotive Scroll instance (scroll).
    if (typeof initializeAllSlideShowAnimations === 'function') initializeAllSlideShowAnimations(scroll);

    // 8. design-2, deliver-2 캐러셀: Swiper.js로 교체
    if (window.matchMedia("(min-width: 769px)").matches) {
        console.log("Media query matched: min-width 769px. Initializing carousels with Swiper.js.");
        initializeSwiperCarousels(scroll); // Pass Locomotive Scroll instance to Swiper initialization function
    } else {
        console.log("Media query NOT matched: less than 769px. Setting carousel elements directly for mobile.");
        // For mobile, don't initialize Swiper, handle with CSS
        gsap.set('.design-section-2 .gallery-carousel', { width: '100%', x: 0, display: 'block' });
        gsap.set('.deliver-section-2 .gallery-carousel', { width: '100%', x: 0, display: 'block' });
        gsap.set('.design-section-2 .carousel-slide-content', { opacity: 1, x: 0, width: '100%', flex: 'none' });
        gsap.set('.deliver-section-2 .carousel-slide-content', { opacity: 1, x: 0, width: '100%', flex: 'none' });
        gsap.set('.design-section-2 .carousel-inner-slide', { opacity: 1, position: 'relative', transform: 'none', pointerEvents: 'auto' });
        gsap.set('.deliver-section-2 .carousel-inner-slide', { opacity: 1, position: 'relative', transform: 'none', pointerEvents: 'auto' });
    }

    // 9. Footer 애니메이션
    if (typeof animateFooter === 'function') animateFooter(mainContent);

    // 10. ScrollTrigger, Locomotive 연동 최종 Refresh
    ScrollTrigger.addEventListener('refresh', () => {
        scroll.update(); // Update existing 'scroll' instance
        console.log("ScrollTrigger refreshed and LocomotiveScroll updated.");
    });
    ScrollTrigger.refresh();
});

/**
 * Initializes all slideshow animations (design/deliver-1)
 * @param {LocomotiveScroll} scrollInstance Locomotive Scroll instance
 */
function initializeAllSlideShowAnimations(scrollInstance) {
    ScrollTrigger.matchMedia({
        "(min-width: 769px)": function() {
            console.log("initializeAllSlideShowAnimations: Matched min-width 769px. Setting up pinned slideshows.");
            createPinnedSlideshow('.design-section-1', scrollInstance); // Pass scrollInstance
            createPinnedSlideshow('.deliver-section-1', scrollInstance); // Pass scrollInstance
        }
    });
}

/**
 * Creates pinned slideshows with GSAP + ScrollTrigger (design-1/deliver-1)
 * @param {string} sectionSelector CSS selector for the section
 * @param {LocomotiveScroll} scrollerInstance Locomotive Scroll instance
 */
function createPinnedSlideshow(sectionSelector, scrollerInstance) {
    const section = document.querySelector(sectionSelector);
    if (!section) {
        console.warn(`createPinnedSlideshow: Section not found for selector: ${sectionSelector}`);
        return;
    }
    console.log(`createPinnedSlideshow: Initializing for section: ${sectionSelector}`);

    if (sectionSelector === '.design-section-2' || sectionSelector === '.deliver-section-2') {
        console.warn(`createPinnedSlideshow: Skipping section ${sectionSelector} as it's meant for carousel. Check function call logic.`);
        return;
    }

    const pinWrapper = section.querySelector('.pin-wrapper');
    if (!pinWrapper) {
        console.warn(`createPinnedSlideshow: Pin wrapper not found in section: ${sectionSelector}`);
        return;
    }

    const contentSlides = gsap.utils.toArray(pinWrapper.querySelectorAll('.content-slide:not(.carousel-inner-slide)'));

    if (contentSlides.length === 0) {
        console.warn(`createPinnedSlideshow: No relevant content slides found in section: ${sectionSelector}.`);
        return;
    }
    console.log(`createPinnedSlideshow: Found ${contentSlides.length} content slides for ${sectionSelector}.`);

    const durationPerSlide = 1.0;
    const holdTimePerSlide = 2.0;
    const emptySlideHoldMultiplier = 2.0;
    let totalTimelineDuration = 0;

    contentSlides.forEach((elem, idx) => {
        let hold = holdTimePerSlide;
        if (idx === contentSlides.length - 1 && elem.classList.contains('empty-slide')) {
            hold *= emptySlideHoldMultiplier;
        }
        totalTimelineDuration += durationPerSlide + hold + durationPerSlide;
    });
    console.log(`createPinnedSlideshow: Total timeline duration for ${sectionSelector}: ${totalTimelineDuration.toFixed(2)}s`);

    const scrollPxPerSecond = 160;
    const requiredScrollLength = totalTimelineDuration * scrollPxPerSecond;
    const endValue = () => {
        const val = `+=${requiredScrollLength}`;
        console.log(`createPinnedSlideshow: Required scroll length for ${sectionSelector}: ${requiredScrollLength.toFixed(2)}px. End value: ${val}`);
        return val;
    };

    const emptySlide = contentSlides.find(s => s.classList.contains('empty-slide'));

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            scroller: scrollerInstance.el, // Use instance's el instead of scrollerSelector
            pin: pinWrapper,
            scrub: 0.8,
            start: "top top",
            end: endValue,
            invalidateOnRefresh: true,
            onLeave: () => {
                console.log(`ScrollTrigger: onLeave for ${sectionSelector}`);
                if (emptySlide) {
                    gsap.to(emptySlide, { opacity: 0, pointerEvents: "none", display: "none", duration: 0.3 });
                }
            },
            onEnterBack: () => {
                console.log(`ScrollTrigger: onEnterBack for ${sectionSelector}`);
                if (emptySlide) {
                    gsap.to(emptySlide, { opacity: 1, pointerEvents: "auto", display: "flex", duration: 0.3 });
                }
            }
        }
    });
    console.log(`createPinnedSlideshow: GSAP timeline created for ${sectionSelector}.`);

    let currentTimelinePosition = 0;
    contentSlides.forEach((elem, index) => {
        const isLastEmptySlide = (index === contentSlides.length - 1) && elem.classList.contains('empty-slide');
        let currentSlideHoldTime = holdTimePerSlide;
        if (isLastEmptySlide) currentSlideHoldTime *= emptySlideHoldMultiplier;

        tl.addLabel(`slide${index}_intro_start`, currentTimelinePosition);
        tl.fromTo(elem,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: durationPerSlide, ease: 'power2.out', pointerEvents: 'auto' },
            currentTimelinePosition
        );
        currentTimelinePosition += durationPerSlide;

        if (index < contentSlides.length - 1) {
            currentTimelinePosition += currentSlideHoldTime;
            tl.addLabel(`slide${index}_outro_start`, currentTimelinePosition);
            tl.to(elem,
                { opacity: 0, scale: 0.95, duration: durationPerSlide, ease: 'power2.in', pointerEvents: 'none' },
                currentTimelinePosition
            );
            currentTimelinePosition += durationPerSlide;
        } else {
            tl.to(elem,
                { opacity: 0, scale: 0.95, duration: durationPerSlide, ease: 'power2.in', pointerEvents: 'none' },
                currentTimelinePosition + currentSlideHoldTime
            );
            currentTimelinePosition += currentSlideHoldTime + durationPerSlide;
        }
        console.log(`createPinnedSlideshow: Slide ${index} animation added to timeline. Current position: ${currentTimelinePosition.toFixed(2)}s`);
    });

    // DESIGN 헤더 애니메이션 (Specific to .design-section-1)
    if (sectionSelector === '.design-section-1') {
        const designHeaderContent = section.querySelector('.content-slide.combined-header-intro .design-header-1-content');
        if (designHeaderContent) {
            const designMain = designHeaderContent.querySelector('.design-main');
            const shadowElements = Array.from(designHeaderContent.querySelectorAll('.design-shadow'));
            const maxLen = 12;

            tl.to(designMain, {
                opacity: 1,
                duration: durationPerSlide,
                ease: 'power2.out',
            }, 0);
            tl.add("designHeaderShadows", 0);
            tl.to(shadowElements, {
                textShadow: function(i) {
                    const color = this.targets()[i].dataset.color;
                    let shadowStr = '';
                    for (let j = 1; j <= maxLen; j += 2) {
                        shadowStr += `${j}px 0px 0 ${color}, `;
                    }
                    return shadowStr ? shadowStr.slice(0, -2) : 'none';
                },
                duration: durationPerSlide * 2,
                ease: 'power2.out'
            }, "designHeaderShadows");

            ScrollTrigger.create({
                trigger: section,
                scroller: scrollerInstance.el, // Use instance's el instead of scrollerSelector
                start: "top top",
                end: "top-=150 top",
                scrub: true,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const len = gsap.utils.mapRange(0, 1, 0, maxLen, progress);
                    shadowElements.forEach((el, i) => {
                        const color = el.dataset.color;
                        let shadowStr = '';
                        for (let j = 1; j <= Math.floor(len); j += 2) {
                            shadowStr += `${j}px 0px 0 ${color}, `;
                        }
                        el.style.textShadow = shadowStr ? shadowStr.slice(0, -2) : 'none';
                    });
                    gsap.set(designMain, {
                        opacity: gsap.utils.mapRange(0, 0.5, 0, 1, progress),
                    });
                },
                onLeaveBack: () => {
                    console.log("Design header: onLeaveBack, resetting opacity and textShadow.");
                    gsap.set(designMain, { opacity: 0 });
                    shadowElements.forEach(el => el.style.textShadow = 'none');
                },
                onEnter: () => {
                    console.log("Design header: onEnter, resetting opacity and textShadow.");
                    gsap.set(designMain, { opacity: 0 });
                    shadowElements.forEach(el => el.style.textShadow = 'none');
                }
            });
            gsap.set(designMain, { opacity: 0 });
            shadowElements.forEach(el => el.style.textShadow = 'none');
            console.log("Design header animation setup complete.");
        }
    }
}

// ==================================================
// Swiper.js 통합 캐러셀 초기화 함수
// 기존 initializeDesignCarousel, initializeDeliverCarousel 대체
// ==================================================
/**
 * Swiper 캐러셀 초기화 함수
 * @param {LocomotiveScroll} scrollInstance Locomotive Scroll 인스턴스
 */
function initializeSwiperCarousels(scrollInstance) {
    console.log("Initializing Swiper carousels.");

    // Design Carousel
    const designSwiper = new Swiper('.design-section-2 .gallery-carousel-container', {
        loop: true,
        slidesPerView: 1,
        centeredSlides: true,
        spaceBetween: 20,
        navigation: {
            nextEl: '.design-section-2 .swiper-button-next',
            prevEl: '.design-section-2 .swiper-button-prev',
        },
        pagination: {
            el: '.design-section-2 .swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            769: {
                slidesPerView: 1,
                spaceBetween: 20,
            },
        },
        on: {
            init: function () {
                console.log("[Design Swiper] Initialized.");
                // 기존 'scrollInstance'를 사용하여 Locomotive Scroll 업데이트
                if (scrollInstance && typeof scrollInstance.update === 'function') {
                    scrollInstance.update();
                }
            },
            resize: function() {
                // 기존 'scrollInstance'를 사용하여 Locomotive Scroll 업데이트
                if (scrollInstance && typeof scrollInstance.update === 'function') {
                    scrollInstance.update();
                }
            }
        }
    });

    // Deliver Carousel
    const deliverSwiper = new Swiper('.deliver-section-2 .gallery-carousel-container', {
        loop: true,
        slidesPerView: 1,
        centeredSlides: true,
        spaceBetween: 20,
        navigation: {
            nextEl: '.deliver-section-2 .swiper-button-next',
            prevEl: '.deliver-section-2 .swiper-button-prev',
        },
        pagination: {
            el: '.deliver-section-2 .swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            769: {
                slidesPerView: 1,
                spaceBetween: 20,
            },
        },
        on: {
            init: function () {
                console.log("[Deliver Swiper] Initialized.");
                // 기존 'scrollInstance'를 사용하여 Locomotive Scroll 업데이트
                if (scrollInstance && typeof scrollInstance.update === 'function') {
                    scrollInstance.update();
                }
            },
            resize: function() {
                // 기존 'scrollInstance'를 사용하여 Locomotive Scroll 업데이트
                if (scrollInstance && typeof scrollInstance.update === 'function') {
                    scrollInstance.update();
                }
            }
        }
    });
}