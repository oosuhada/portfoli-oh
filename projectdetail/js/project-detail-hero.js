// project-detail-hero.js

// GSAP과 같은 라이브러리는 이 파일보다 먼저 HTML에서 로드되어야 합니다.

/**
 * 히어로 섹션의 모든 애니메이션 (캐러셀, 텍스트 등장 애니메이션)을 설정하고 실행하는 함수
 * @param {HTMLElement} mainContent Locomotive Scroll 스크롤러로 사용될 메인 콘텐츠 요소
 */
function animateHero(mainContent) {
    const carouselContainer = ".hero-carousel";
    const slides = gsap.utils.toArray(".hero-slide");
    // const images = slides.map(slide => slide.querySelector("img")); // 켄 번스 효과 제거로 더 이상 필요 없음
    const totalSlides = slides.length;
    const uniqueSlides = totalSlides - 1;

    // 슬라이드 개수에 따라 캐러셀 컨테이너와 각 슬라이드의 너비를 동적으로 설정
    gsap.set(carouselContainer, { width: totalSlides * 100 + "%" });
    gsap.set(slides, { width: 100 / totalSlides + "%" });

    // 1. 캐러셀 슬라이드 애니메이션 타임라인 (무한 반복)
    const slideTimeline = gsap.timeline({ repeat: -1 });
    slideTimeline.to(carouselContainer, {
        xPercent: -100 * (uniqueSlides / totalSlides),
        duration: uniqueSlides * 6,
        ease: "none",
    });

    // 2. 켄 번스(Ken Burns) 효과 제거됨

    // 3. Hero 섹션 텍스트 등장 애니메이션
    const tlHeroTextIntro = gsap.timeline({ delay: 0.5 }); // 페이지 로드 후 0.5초 뒤 시작

    tlHeroTextIntro.fromTo(
        ['.cover-head-vid', '.small-text-load2'], // Hero 섹션 내 텍스트 요소들
        { opacity: 0, y: 100 },
        {
            opacity: 1,
            y: 0,
            duration: 3,
            ease: 'power2.out',
            stagger: 0.1
        }
    );
}