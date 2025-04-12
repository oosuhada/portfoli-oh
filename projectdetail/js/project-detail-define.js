function animateDefine(mainContent) {
    const section = document.querySelector('.define-section');
    if (!section) return;
    
    ScrollTrigger.matchMedia({
        "(min-width: 769px)": function() {
            const pinWrapper = section.querySelector('.pin-wrapper');
            const header = section.querySelector('.define-header');
            const content = section.querySelector('.section-main-content');
            if (!pinWrapper || !content) return;

            // paddingBottom은 섹션 자체의 공간을 늘리는 역할입니다. 필요시 조절.
            gsap.set(section, { paddingBottom: '20vh', marginBottom: 0 });

            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    scroller: mainContent,
                    pin: pinWrapper,
                    // 섹션의 상단이 뷰포트 상단에 닿을 때 애니메이션 시작 (나타날 때 기준)
                    start: "top top", 
                    // 섹션의 하단이 뷰포트 상단에 닿을 때 애니메이션 끝 (사라질 때 기준)
                    // 여기에 추가적인 스크롤 길이를 더해 다음 섹션 진입 타이밍을 늦춥니다.
                    end: () => `bottom top+=${window.innerHeight * 0.5}`, // 예시: 섹션 하단이 뷰포트 상단에 닿은 후 뷰포트 높이의 100% 더 스크롤
                    scrub: 4,
                    // markers: true, // 디버깅을 위해 활성화
                    onLeave: () => {
                        console.log("Define section onLeave - pin released, next section can come.");
                    },
                    onEnterBack: () => {
                        console.log("Define section onEnterBack - pin engaged again.");
                    }
                }
            });

            if (header) {
                // 헤더는 섹션 시작과 함께 나타나고, 섹션이 스크롤되면서 사라지게 합니다.
                // start: "top top" (0) ~ end: "top+=100 top" (0.1) 정도에서 사라지도록 조정
                tl.fromTo(header, { y: 40, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.4 }, 0)
                  .to(header, { y: -40, opacity: 0, ease: 'power1.in', duration: 0.4 }, 0.1);
            }

            // 내부 콘텐츠는 섹션이 핀된 동안 스크롤되어 사라지게 합니다.
            // end 지점까지 콘텐츠가 완전히 사라지도록 y 값을 조정합니다.
            tl.to(content, {
                y: () => -(content.offsetHeight + window.innerHeight * 0.5), // 콘텐츠 높이 + 뷰포트 높이의 절반 정도 위로 이동 (조절 필요)
                ease: "none"
            }, 0); // 0은 타임라인의 시작 지점
        }
    });
}