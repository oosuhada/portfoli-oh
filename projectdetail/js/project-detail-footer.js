// project-detail-footer.js
function animateFooter(mainContent) {
    const footerSection = document.querySelector('.footer-section');
    if (!footerSection) {
        console.warn("Footer section not found, skipping footer animation.");
        return;
    }

    const navItems = footerSection.querySelectorAll('.nav-item');
    const initialNavX = window.innerWidth > 768 ? '10vw' : '0vw';

    // Immediately hide the .hidden-nav-text element using GSAP
    // This ensures it's not visible and not interactive from the start.
    gsap.set(footerSection.querySelectorAll('.nav-circle .hidden-nav-text'), {
        opacity: 0,
        pointerEvents: 'none'
    });

    const footerTimeline = gsap.timeline({
        scrollTrigger: {
            scroller: mainContent, // Ensures Locomotive Scroll is used as the scroller
            trigger: footerSection,
            start: 'top 80%', // Animation starts when the top of the footer hits 80% from the top of the viewport
            toggleActions: 'play reset play reset', // Play on scroll down, reset on exit, play on re-entry, reset on re-exit
            // markers: true, // Uncomment for debugging ScrollTrigger
        },
    });

    footerTimeline
        // 1. Logo (h3) appears first
        .from(footerSection.querySelector('.logo-container h3'), {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power2.out'
        }, 0) // Start at the beginning of the timeline

        // 2. Animate nav-items from a closer position to their spread-out position
        .from(navItems[0], { // Left nav item (PREV)
            x: `+${initialNavX}`, // Starts closer to the right
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        }, '<0.2') // Start 0.2 seconds after logo animation begins

        .from(navItems[1], { // Right nav item (NEXT)
            x: `-${initialNavX}`, // Starts closer to the left
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        }, '<') // Start at the same time as the left nav item

        // 3. Navigation circles (원 자체)와 화살표 등장 (개별 애니메이션)
        // Note: .hidden-nav-text is controlled by gsap.set at the top, not part of this timeline.
        .from(footerSection.querySelectorAll('.nav-circle'), {
            opacity: 0,
            y: 20,
            scale: 0.8, // Start slightly scaled down
            stagger: 0.2, // Stagger the two circles
            duration: 0.8,
            ease: 'back.out(1.7)' // A slightly bouncy ease for a playful feel
        }, '<0.2') // Start 0.2 seconds after nav-items start moving

        // 화살표 등장
        .from(footerSection.querySelectorAll('.nav-circle .arrow'), {
            opacity: 0,
            y: 10,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out'
        }, '<0.1') // Circle animation begins + 0.1s

        // 4. 프로젝트 이름 텍스트 (원 아래) 등장
        .from(footerSection.querySelectorAll('.project-title-under-circle'), {
            opacity: 0,
            y: 20,
            stagger: 0.2,
            duration: 0.8,
            ease: 'power2.out'
        }, '<0.2') // Circle animation begins + 0.2s

        // 5. 하단 크레딧 (저작권 및 디자이너 이름) 등장
        .from(footerSection.querySelector('.footer-bottom-credits'), {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: 'power2.out'
        }, '-=0.5'); // Start 0.5 seconds before the previous animation ends
}