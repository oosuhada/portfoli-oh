document.addEventListener('DOMContentLoaded', () => {
    /**
     * 캐러셀 내의 모든 캡션 높이를 가장 긴 캡션에 맞춰 동기화하는 함수
     * @param {HTMLElement} slideElement - 현재 활성화된 슬라이드 요소
     */
    function equalizeCaptionHeights(slideElement) {
        if (!slideElement) return;

        // horizontal-two 또는 horizontal-three 클래스를 가진 슬라이드에만 적용
        const isMultiImageSlide = slideElement.querySelector('.horizontal-two, .horizontal-three');
        if (!isMultiImageSlide) return;

        const captions = slideElement.querySelectorAll('.image-caption');
        if (captions.length <= 1) return;

        // 1. 높이 초기화
        let maxHeight = 0;
        captions.forEach(caption => {
            caption.style.minHeight = '0';
        });

        // 2. 가장 큰 높이 계산 (DOM 렌더링을 기다리기 위해 약간의 지연 추가)
        setTimeout(() => {
            captions.forEach(caption => {
                if (caption.offsetHeight > maxHeight) {
                    maxHeight = caption.offsetHeight;
                }
            });

            // 3. 모든 캡션에 최대 높이 적용
            if (maxHeight > 0) {
                captions.forEach(caption => {
                    caption.style.minHeight = `${maxHeight}px`;
                });
            }
        }, 50); // 50ms 지연
    }

    /**
     * Swiper 캐러셀을 초기화하고 캡션 높이 동기화 로직을 연결하는 함수
     * @param {string} sectionSelector - 캐러셀이 포함된 섹션의 선택자 (e.g., '#design-2')
     */
    function initializeCarouselWithCaptionSync(sectionSelector) {
        const section = document.querySelector(sectionSelector);
        if (!section) return;

        const swiperContainer = section.querySelector('.gallery-carousel-container.swiper');
        if (!swiperContainer) return;

        const swiper = new Swiper(swiperContainer, {
            // Swiper 옵션 설정
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            pagination: {
                el: section.querySelector('.swiper-pagination'),
                clickable: true,
            },
            navigation: {
                nextEl: section.querySelector('.swiper-button-next'),
                prevEl: section.querySelector('.swiper-button-prev'),
            },
            // Swiper 이벤트 리스너
            on: {
                // 초기화 시, 슬라이드 변경 시, 창 크기 조절 시 캡션 높이 동기화
                init: (swiper) => {
                    equalizeCaptionHeights(swiper.slides[swiper.activeIndex]);
                },
                slideChange: (swiper) => {
                    equalizeCaptionHeights(swiper.slides[swiper.activeIndex]);
                },
                resize: (swiper) => {
                    // 모든 슬라이드의 캡션 높이를 다시 계산
                    swiper.slides.forEach(slide => equalizeCaptionHeights(slide));
                },
            },
        });
    }

    // design-2와 deliver-2 섹션의 캐러셀을 각각 초기화
    initializeCarouselWithCaptionSync('#design-2');
    initializeCarouselWithCaptionSync('#deliver-2');
});
