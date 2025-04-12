// project-detail-project-details.js

// Wrap the entire animation logic in a function to be called from project-detail.js
// This ensures 'mainContent' (the locomotive scroll instance) is passed correctly.
function animateProjectDetails(mainContent) {
    const section = document.querySelector('.project-details-section');
    if (!section) return;

    const content = section.querySelector('.details-content');
    if (!content) return;

    // 1. 새로운 등장 애니메이션 추가
    // 섹션이 화면에 보이기 시작하면 콘텐츠가 아래에서 위로 떠오릅니다.
    gsap.from(content, {
        y: 50,      // 50px 아래에서 시작
        opacity: 0, // 투명한 상태에서 시작
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: section,
            scroller: mainContent,
            // 시작 기준점: 섹션의 상단이 화면의 80% 지점에 닿았을 때
            start: 'top 50%',
            // 애니메이션 재생/역재생 설정
            toggleActions: 'play none none reverse',
        }
    });

    // 2. 기존의 화면 고정(pin) 기능은 그대로 유지
    ScrollTrigger.matchMedia({
        "(min-width: 769px)": function() {
            const pinWrapper = section.querySelector('.pin-wrapper');
            if (!pinWrapper) return;

            // 1. Pinned Section에 큰 하단 여백(margin-bottom)을 추가하여 빈 스크롤 공간을 만듭니다.
            // '100vh'는 화면 높이의 100%를 의미하며, 이 값만큼의 빈 공간이 생깁니다.
            // 이 값을 조절하여 '멈춰있는' 시간(스크롤 거리)을 조절할 수 있습니다.
            gsap.set(section, { marginBottom: '100vh' });


            // 2. 기존의 pin 기능은 그대로 유지합니다.
            ScrollTrigger.create({
                trigger: section,
                scroller: mainContent,
                pin: pinWrapper,
                start: "top top",
                end: "+=300%", // 이 값은 원래 의도대로 '현재 섹션이 고정될 시간'입니다.
                // markers: true,
            });
        }
    });
}

// --- Dynamic Footer Text Logic ---
// This part is the logic you wanted to embed.
// It's wrapped in its own DOMContentLoaded listener for clarity,
// but since the entire file is likely loaded after DOMContentLoaded by project-detail.js,
// it might not be strictly necessary, but it's good practice for standalone script parts.

document.addEventListener('DOMContentLoaded', () => {
    const projectCredits = {
        'portfoliOh.html': {
            ko: '© 2025. 포트폴리-오! 사례 연구. (이전: 노마드 마켓, 다음: EZ Air)',
            en: '© 2025. Portfoli-oh! Case Study. (Prev: Nomad Market, Next: EZ Air)'
        },
        'EZAir.html': {
            ko: '© 2025. EZ Air! 사례 연구. (이전: 포트폴리-오!, 다음: 언코크드!)',
            en: '© 2025. EZ Air! Case Study. (Prev: Portfoli-oh!, Next: Uncorked!)'
        },
        'Uncorked.html': {
            ko: '© 2025. 언코크드! 사례 연구. (이전: EZ Air, 다음: 온정)',
            en: '© 2025. Uncorked! Case Study. (Prev: EZ Air, Next: Onjung)'
        },
        'Onjung.html': {
            ko: '© 2025. 온정 사례 연구. (이전: 언코크드!, 다음: 노마드 마켓)',
            en: '© 2025. Onjung Case Study. (Prev: Uncorked!, Next: Nomad Market)'
        },
        'NomadMarket.html': {
            ko: '© 2025. 노마드 마켓 사례 연구. (이전: 온정, 다음: 포트폴리-오!)',
            en: '© 2025. Nomad Market Case Study. (Prev: Onjung, Next: Portfoli-oh!)'
        }
    };

    const currentPath = window.location.pathname;
    const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    const creditSpan = document.getElementById('project-credit-text');
    const langKoButton = document.getElementById('lang-ko');
    const langEnButton = document.getElementById('lang-en');

    function updateCreditText(lang) {
        if (projectCredits[currentFile] && creditSpan) {
            creditSpan.textContent = projectCredits[currentFile][lang];
        }
    }

    // Initial load based on active language button or default
    let initialLang = 'ko'; // Default language
    if (langEnButton && langEnButton.classList.contains('active')) {
        initialLang = 'en';
    }
    updateCreditText(initialLang);

    // Event listeners for language toggle
    if (langKoButton) {
        langKoButton.addEventListener('click', () => updateCreditText('ko'));
    }
    if (langEnButton) {
        langEnButton.addEventListener('click', () => updateCreditText('en'));
    }
});