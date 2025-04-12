// project-detail-deliver.js
// This file is dedicated to deliver-specific animations, particularly the carousel.
/**
 * Deliver 섹션 전용 애니메이션 함수들
 * project-detail.js의 공통 함수들과 중복되지 않도록 합니다.
 */

/**
 * Deliver 섹션의 슬라이드쇼 애니메이션을 초기화합니다.
 * @param {string} scrollerSelector - Locomotive Scroll의 스크롤 컨테이너 선택자
 */
function initializeDeliverSlideShow(scrollerSelector) {
    ScrollTrigger.matchMedia({
        "(min-width: 769px)": function() {
            createDeliverPinnedSlideshow('.deliver-section-1', scrollerSelector);
        }
    });
}

/**
 * Deliver 섹션 전용 슬라이드쇼 애니메이션을 생성합니다.
 * @param {string} sectionSelector - 애니메이션을 적용할 섹션의 선택자
 * @param {string} scrollerSelector - Locomotive Scroll의 스크롤 컨테이너 선택자
 */
function createDeliverPinnedSlideshow(sectionSelector, scrollerSelector) {
    const section = document.querySelector(sectionSelector);
    if (!section) {
        console.warn(`Deliver slideshow section not found: ${sectionSelector}`);
        return;
    }

    const pinWrapper = section.querySelector('.pin-wrapper');
    if (!pinWrapper) {
        console.warn(`Pin wrapper not found in ${sectionSelector}`);
        return;
    }

    // Get all content slides within the pinWrapper.
    const contentSlides = gsap.utils.toArray(pinWrapper.querySelectorAll('.content-slide'));

    if (contentSlides.length === 0) {
        console.warn(`No content slides found in ${sectionSelector} .pin-wrapper`);
        return;
    }

    const durationPerSlide = 1.0; // Time for one slide to animate in and out
    const holdTimePerSlide = 2.0; // Time a slide stays fully visible
    const totalScrollDuration = (contentSlides.length * (durationPerSlide + holdTimePerSlide + durationPerSlide)) + (window.innerHeight / 200);

    // Dynamic end value based on the total scroll needed for all slides
    const endValue = () => `+=${window.innerHeight * (contentSlides.length + 1.5)}`;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            scroller: scrollerSelector,
            pin: pinWrapper,
            scrub: 1.5,
            start: "top top",
            end: endValue,
            invalidateOnRefresh: true
        }
    });

    let currentTimelinePosition = 0;

    // Animate each content slide sequentially
    contentSlides.forEach((elem, index) => {
        const slideId = `slide${index}`;

        tl.addLabel(`${slideId}_intro_start`, currentTimelinePosition);
        tl.fromTo(elem,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: durationPerSlide, ease: 'power2.out' },
            currentTimelinePosition
        );
        currentTimelinePosition += durationPerSlide;

        currentTimelinePosition += holdTimePerSlide;

        if (index < contentSlides.length - 1) {
            tl.addLabel(`${slideId}_outro_start`, currentTimelinePosition);
            tl.to(elem,
                { opacity: 0, scale: 0.95, duration: durationPerSlide, ease: 'power2.in' },
                currentTimelinePosition
            );
            currentTimelinePosition += durationPerSlide;
        } else {
            // Keep the last slide visible for a bit longer before fading out
            tl.to(elem,
                { opacity: 0, scale: 0.95, duration: durationPerSlide, ease: 'power2.in' },
                currentTimelinePosition + 0.5
            );
        }
    });
}

/**
 * Deliver 섹션 전용 캐러셀을 초기화합니다.
 * @param {string} sectionSelector - 캐러셀을 포함하는 섹션의 선택자
 */
function initializeDeliverCarousel(sectionSelector) {
    const section = document.querySelector(sectionSelector);
    if (!section) {
        console.warn(`Deliver carousel section not found: ${sectionSelector}`);
        return;
    }

    const carouselContainer = section.querySelector('.gallery-carousel-container');
    const carousel = section.querySelector('.gallery-carousel');
    const slides = gsap.utils.toArray(carousel.querySelectorAll('.carousel-slide-content'));
    const prevButton = section.querySelector('.prev-button');
    const nextButton = section.querySelector('.next-button');

    if (!carousel || slides.length === 0 || !prevButton || !nextButton) {
        console.warn(`Missing carousel elements in ${sectionSelector}. Carousel initialization skipped.`);
        return;
    }

    let currentIndex = 0;
    let slideWidth = 0;

    const updateSlideWidth = () => {
        // Only run carousel logic if on desktop (or larger screen)
        if (window.matchMedia("(min-width: 769px)").matches) {
            if (carouselContainer.clientWidth === 0) {
                console.warn(`Carousel container clientWidth is 0 for ${sectionSelector}. Cannot calculate slide width.`);
                return;
            }
            slideWidth = carouselContainer.clientWidth;
            gsap.set(slides, { width: slideWidth });
            gsap.set(carousel, { width: slideWidth * slides.length, x: -currentIndex * slideWidth });

            // Ensure content within slides adjusts
            slides.forEach(slide => {
                const img = slide.querySelector('img');
                const textBlock = slide.querySelector('.text-block');
                if (img) {
                    gsap.set(img, { maxHeight: '60vh', width: 'auto' });
                }
                if (textBlock) {
                    gsap.set(textBlock, { maxHeight: 'calc(100% - 200px)', overflowY: 'auto' });
                }
            });

        } else {
            // Reset styles for mobile to allow stacking
            gsap.set(slides, { width: 'auto' });
            gsap.set(carousel, { width: 'auto', x: 0 });

            // Remove any specific height/overflow settings for mobile to let content flow naturally
            slides.forEach(slide => {
                const img = slide.querySelector('img');
                const textBlock = slide.querySelector('.text-block');
                if (img) {
                    gsap.set(img, { maxHeight: 'none', width: '100%' });
                }
                if (textBlock) {
                    gsap.set(textBlock, { maxHeight: 'none', overflowY: 'visible' });
                }
            });
        }
    };

    const showSlide = (index, animate = true) => {
        // Only attempt to animate if on desktop
        if (window.matchMedia("(min-width: 769px)").matches) {
            currentIndex = index;
            if (currentIndex < 0) {
                currentIndex = slides.length - 1;
            } else if (currentIndex >= slides.length) {
                currentIndex = 0;
            }

            const offset = -currentIndex * slideWidth;
            if (animate) {
                gsap.to(carousel, { x: offset, duration: 0.5, ease: 'power2.inOut' });
            } else {
                gsap.set(carousel, { x: offset });
            }
        }
    };

    prevButton.addEventListener('click', () => showSlide(currentIndex - 1));
    nextButton.addEventListener('click', () => showSlide(currentIndex + 1));

    // Initial setup and resize handling
    window.addEventListener('load', updateSlideWidth);
    window.addEventListener('resize', updateSlideWidth);
    updateSlideWidth(); // Call once initially
    showSlide(0, false); // Initialize to first slide
}