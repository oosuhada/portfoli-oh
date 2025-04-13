(function() {
  class ModernCarousel {
    constructor(isMobileView = false) {
      this.carousel = null; this.posters = []; this.labels = null;
      this.n = 0; this.center = 0; this.lastCenter = 0;
      this.backgroundImageIndex = 0;
      this.maxVisible = 6;
      this.isEntranceAnimation = false;
      this.isEntranceAnimationComplete = false;
      this.isMoving = false; this.pendingMoveQueue = []; this.isDragging = false;
      this.startX = 0; this.startTouchX = 0; this.dragThreshold = 50;

      // Pass isMobileView from lab-core.js to determine animParams and loading logic
      this.isMobile = isMobileView;

      if (this.isMobile) {
        this.animParams = {
          R: 380, verticalOffset: 160, cardAngle: 32, scaleStep: 0.1,
          angleStep: 28, curveRadius: 600, labelVerticalOffset: 220
        };
        this.maxVisible = 4;
      } else {
        this.animParams = {
          R: 550, verticalOffset: 190, cardAngle: 28, scaleStep: 0.085,
          angleStep: 26, curveRadius: 700, labelVerticalOffset: 250
        };
      }
    }

    setupDomReferences() {
      this.carousel = document.querySelector('.carousel');
      this.labels = document.querySelector('.carousel-labels');
      this.posters = Array.from(this.carousel?.querySelectorAll('.poster') || []);
      this.n = this.posters.length;
      this.center = this.lastCenter = 0; // Reset center on setup
    }

    // Consolidated image/iframe loading logic
    loadPosterImage(poster) {
      if (!poster) {
          console.warn("[Carousel] loadPosterImage received a null poster.");
          return;
      }

      const previewContainer = poster.querySelector('.poster-preview-container');
      if (!previewContainer) {
          console.error(`[Carousel] Poster preview container not found for: ${poster.dataset.title}`);
          return;
      }

      if (this.isMobile) {
        const imgElement = previewContainer.querySelector('.poster-screenshot-preview'); // Changed selector for clarity
        if (!imgElement) {
          console.warn(`[Carousel] No .poster-screenshot-preview found for poster: ${poster.dataset.title}. This is expected if it's a desktop view.`);
          return;
        }

        if (poster.dataset.imageLoaded === 'true') {
          // Ensure it's visible if already loaded
          if (gsap.getProperty(imgElement, "opacity") < 1) {
             gsap.set(imgElement, { opacity: 1 });
          }
          return;
        }

        // Set src if not already set or broken (though generatePosterCards sets it initially)
        if (!imgElement.src || imgElement.src === 'about:blank') {
            imgElement.src = poster.dataset.screenshot;
        }

        if (imgElement.complete) {
          // If image is already in cache/loaded, handle it immediately
          this._handleImageLoad(poster, imgElement);
        } else {
          // Only attach listeners if not already complete to avoid multiple listeners
          imgElement.onload = () => this._handleImageLoad(poster, imgElement);
          imgElement.onerror = () => console.error(`[Carousel] Failed to load screenshot for: ${imgElement.src}`);
        }

      } else { // Desktop mode: iframe
        const iframe = previewContainer.querySelector('.poster-iframe');
        if (!iframe) {
            console.warn(`[Carousel] No .poster-iframe found for poster: ${poster.dataset.title}. This is expected if it's a mobile view.`);
            return; // Exit if iframe element is not found
        }

        if (poster.dataset.iframeLoaded === 'true') {
            // If iframe is already loaded, ensure it's visible and overlay is hidden
            if (gsap.getProperty(iframe, "opacity") < 1) {
                gsap.set(iframe, { opacity: 1 });
            }
            const overlay = poster.querySelector('.poster-paper-overlay');
            if (overlay) {
                gsap.set(overlay, { opacity: 0, display: 'none', pointerEvents: 'none' });
            }
            return;
        }
        
        // Ensure iframe src is set only if it's not already pointing to the correct path
        // Using about:blank initially allows for dynamic loading and proper onload event
        if (iframe.src === 'about:blank' || iframe.src !== window.location.origin + poster.dataset.path) {
             iframe.src = poster.dataset.path;
        }

        iframe.onload = () => {
          poster.dataset.iframeLoaded = 'true';
          gsap.to(iframe, { opacity: 1, duration: 0.8, ease: 'power2.out' });
          
          const overlay = poster.querySelector('.poster-paper-overlay');
          if (overlay) {
            // Capture the overlay element in a local variable for the callback's scope
            const overlayToAnimate = overlay; 
            gsap.to(overlayToAnimate, {
                opacity: 0,
                duration: 1.0,
                ease: "power2.inOut",
                onComplete: () => {
                    // **CRITICAL FIX**: Check if the element still exists before accessing its style.
                    // This prevents the TypeError if the element somehow becomes null/undefined
                    // (e.g., if the carousel is destroyed and rebuilt very quickly).
                    if (overlayToAnimate) {
                        overlayToAnimate.style.pointerEvents = 'none';
                        overlayToAnimate.style.display = 'none';
                    }
                }
            });
          }
        };
        iframe.onerror = () => {
            console.error(`[Carousel] Failed to load iframe for: ${poster.dataset.path}`);
            // Potentially show a fallback image or error state for the poster
        };
      }
    }

    _handleImageLoad(poster, imgElement) {
        poster.dataset.imageLoaded = 'true';
        gsap.to(imgElement, { opacity: 1, duration: 0.8, ease: 'power2.out' });
        // For mobile, if it's an image, fade the overlay immediately
        const overlay = poster.querySelector('.poster-paper-overlay');
        if (overlay) {
            gsap.to(overlay, { opacity: 0, duration: 1.0, ease: "power2.inOut", onComplete: () => {
                if (overlay) { // Defensive check
                    overlay.style.pointerEvents = 'none';
                    overlay.style.display = 'none';
                }
            }});
        }
    }

    checkAndLoadVisibleImages(centerIdx) {
      const halfVisible = Math.floor(this.maxVisible / 2);
      for (let i = -halfVisible; i <= halfVisible; i++) {
        const posterIndex = (centerIdx + i + this.n) % this.n;
        if (this.posters[posterIndex]) {
          this.loadPosterImage(this.posters[posterIndex]);
        }
      }
    }

    renderLabels(centerIdx, visibleCount = 5) {
      if (!this.labels) return;
      this.labels.innerHTML = '';
      const half = Math.floor(visibleCount / 2);
      const { angleStep, curveRadius, labelVerticalOffset } = this.animParams;
      for (let i = 0; i < this.n; i++) {
        let rel = ((i - centerIdx + this.n + Math.floor(this.n / 2)) % this.n) - Math.floor(this.n / 2);
        let opacity = Math.abs(rel) <= half ? 1 : 0;
        const rad = rel * angleStep * Math.PI / 180;
        const x = Math.sin(rad) * curveRadius;
        let y = labelVerticalOffset - Math.cos(rad) * (curveRadius * 0.38);
        if (rel === -2 || rel === 2) { y += 40; } else if (rel === -1 || rel === 1) { y += 20; }
        const rotate = rad * (180 / Math.PI) * 0.55;
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = this.posters[i]?.dataset.title || '';
        label.style.cssText = `opacity: ${opacity}; transform: translate(-50%, 0) translate(${x}px, ${y}px) rotate(${rotate}deg); z-index: ${100 - Math.abs(rel)};`;
        this.labels.appendChild(label);
      }
    }

    renderCarousel(centerIdx = this.center, animate = true) {
      const { R, verticalOffset, cardAngle, scaleStep } = this.animParams;
      // Only load visible images/iframes after entrance animation is complete or if not animating
      if (!this.isEntranceAnimation || this.isEntranceAnimationComplete) {
        this.checkAndLoadVisibleImages(centerIdx);
      }
      this.posters.forEach((poster, i) => {
        let rel = ((i - centerIdx + this.n + Math.floor(this.n / 2)) % this.n) - Math.floor(this.n / 2);
        const distance = Math.abs(rel);
        const visible = distance <= this.maxVisible;
        const blurValue = Math.max(0, distance - 2) * 1.5;
        const angle = rel * cardAngle * (Math.PI / 180);
        const x = Math.sin(angle) * R;
        const y = verticalOffset - Math.cos(angle) * (R * 0.38);
        const rotation = angle * (180 / Math.PI) * 0.55;
        const scale = 1 - distance * scaleStep;
        const z = 1000 - distance * 60;
        const opacity = visible ? 1 : 0;
        const animationProps = {
          x, y, rotation, scale, zIndex: z, opacity,
          filter: `blur(${blurValue}px)`,
          ease: this.isEntranceAnimation ? "power2.out" : "expo.out"
        };
        if (animate) {
          gsap.to(poster, { ...animationProps, duration: this.isEntranceAnimation ? 0.6 : 0.8 });
        } else {
          gsap.set(poster, animationProps);
        }

        // Ensure correct class for styling based on mobile/desktop view
        if (this.isMobile) {
            poster.classList.add('is-mobile-preview');
            poster.classList.remove('is-desktop-preview');
        } else {
            poster.classList.remove('is-mobile-preview');
            poster.classList.add('is-desktop-preview');
        }
      });
      if (this.labels) this.renderLabels(centerIdx, 5);
      this.updateActiveCategoryButton(centerIdx);
    }

    runCarousel(isFirst = false) {
      this.setupDomReferences();
      if (isFirst && !this.isEntranceAnimationComplete) {
          this.isEntranceAnimation = true;
          this.playEntranceAnimation();
      } else {
          this.isEntranceAnimation = false;
          this.renderCarousel(this.center, false); // Render immediately without animation
          this.isEntranceAnimationComplete = true; // Mark as complete
          this.setupEvents(); // Setup events after initial render
          // Ensure immediate loading of visible posters if not animating
          this.checkAndLoadVisibleImages(this.center);
      }
    }

    playEntranceAnimation() {
      // If already complete or no posters, just finalize and setup events
      if (this.isEntranceAnimationComplete || this.n === 0 || !this.carousel) {
        this.isEntranceAnimation = false;
        this.isEntranceAnimationComplete = true;
        this.setupEvents();
        return;
      }

      // Simplified entrance for mobile view
      if (this.isMobile) {
        this.renderCarousel(this.center, false); // Render initial state without animation
        gsap.fromTo(this.carousel, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.out" });
        gsap.to('.carousel-category-jump', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.5 });
        
        setTimeout(() => {
          this.isEntranceAnimation = false;
          this.isEntranceAnimationComplete = true;
          this.lastCenter = this.center;
          this.setupEvents();
          // Load visible images after the initial fade in
          this.checkAndLoadVisibleImages(this.center); 
          if (window.appBackgroundChanger) window.appBackgroundChanger.initializeCarouselModeBackground(0);
        }, 1300); // Give enough time for the initial fade-in
        return;
      }
      
      // Desktop entrance animation (original complex animation)
      this.carousel.style.opacity = '0';
      const entranceOffset = Math.min(6, Math.max(0, Math.floor(this.n / 2) - 1));
      let startCenter = (this.center - entranceOffset + this.n) % this.n;
      this.lastCenter = startCenter;
      this.renderCarousel(startCenter, false); // Set initial positions without animating them
      this.posters.forEach(poster => gsap.set(poster, { opacity: 0 })); // Ensure posters are initially hidden for this entrance animation
      gsap.to(this.carousel, { opacity: 1, duration: 0.3, ease: "power2.out" });
      this.posters.forEach((poster, i) => {
        let relToStart = ((i - startCenter + this.n + Math.floor(this.n / 2)) % this.n) - Math.floor(this.n / 2);
        gsap.to(poster, { opacity: 1, duration: 0.3, delay: Math.abs(relToStart) * 0.05 + 0.2, ease: "power2.out" });
      });

      setTimeout(() => {
        let currentAnimatedCenter = startCenter;
        let rotationStep = 0;
        const totalSteps = (this.center - startCenter + this.n) % this.n;
        if (totalSteps === 0) { // Edge case: if startCenter is already the target center
          this.renderCarousel(this.center, false);
          this.isEntranceAnimation = false;
          this.isEntranceAnimationComplete = true;
          this.lastCenter = this.center;
          this.setupEvents();
          this.checkAndLoadVisibleImages(this.center);
          if (window.appBackgroundChanger) window.appBackgroundChanger.initializeCarouselModeBackground(0);
          gsap.to('.carousel-category-jump', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.3 });
          return;
        }

        const initialDelay = 50, finalDelay = 200;
        const delayIncrement = (finalDelay - initialDelay) / totalSteps;
        const rotateFn = () => {
          this.lastCenter = currentAnimatedCenter;
          currentAnimatedCenter = (currentAnimatedCenter + 1) % this.n;
          this.renderCarousel(currentAnimatedCenter, true); // Animate movement
          rotationStep++;
          if (rotationStep < totalSteps) {
            setTimeout(rotateFn, initialDelay + (rotationStep * delayIncrement));
          } else {
            setTimeout(() => {
              // Final state adjustment after rotation animation
              this.isEntranceAnimation = false;
              this.isEntranceAnimationComplete = true;
              this.lastCenter = this.center;
              this.setupEvents();
              this.checkAndLoadVisibleImages(this.center);
              // Ensure background image matches final center
              if (window.appBackgroundChanger && window.appBackgroundChanger.totalImages > 0) {
                  this.backgroundImageIndex = (this.center * 3) % window.appBackgroundChanger.totalImages;
                  window.appBackgroundChanger.initializeCarouselModeBackground(this.backgroundImageIndex);
              }
              gsap.to('.carousel-category-jump', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.3 });
            }, 850); // Delay before setting final state and showing category jump
          }
        };
        rotateFn();
      }, 800); // Initial delay before rotation starts
    }
    
    moveTo(newCenter, userDirection = null) {
      if (!this.isEntranceAnimationComplete || this.isMoving) return;
      const targetCenter = (newCenter + this.n) % this.n;
      if (this.center === targetCenter) return;

      this.isMoving = true;
      this.lastCenter = this.center;
      this.center = targetCenter;

      if (userDirection && window.appBackgroundChanger && window.appBackgroundChanger.totalImages > 0) {
        const totalImages = window.appBackgroundChanger.totalImages;
        this.backgroundImageIndex = (this.backgroundImageIndex + (userDirection * 3) + totalImages) % totalImages;
        window.appBackgroundChanger._setSingleBackgroundImageForCarousel(this.backgroundImageIndex, 0.8);
      }

      this.renderCarousel(this.center, true);
      // Duration of regular slide animation should be consistent with this timeout
      setTimeout(() => { this.isMoving = false; }, 900);
    }

    setupEvents() {
      if (!this.carousel) return;
      // Remove all previously attached listeners to prevent duplicates
      if (this._wheelHandler) this.carousel.removeEventListener('wheel', this._wheelHandler);
      if (this._mouseDownHandler) this.carousel.removeEventListener('mousedown', this._mouseDownHandler); // Added null check
      document.removeEventListener('mousemove', this._mouseMoveHandler);
      document.removeEventListener('mouseup', this._mouseUpHandler);
      if (this._touchStartHandler) this.carousel.removeEventListener('touchstart', this._touchStartHandler); // Added null check
      if (this._touchEndHandler) this.carousel.removeEventListener('touchend', this._touchEndHandler); // Added null check

      this.posters = Array.from(this.carousel.querySelectorAll('.poster'));

      this._wheelHandler = (e) => { e.preventDefault(); if (this.isMoving) return; this.moveTo(this.center + (e.deltaY > 0 ? 1 : -1), e.deltaY > 0 ? 1 : -1); };
      this.carousel.addEventListener('wheel', this._wheelHandler, { passive: false });

      this._mouseDownHandler = (e) => { e.preventDefault(); this.isDragging = true; this.startX = e.pageX; this.carousel.style.cursor = 'grabbing'; };
      this.carousel.addEventListener('mousedown', this._mouseDownHandler);

      this._mouseMoveHandler = (e) => { if (!this.isDragging) return; e.preventDefault(); };
      document.addEventListener('mousemove', this._mouseMoveHandler);

      this._mouseUpHandler = (e) => {
        if (!this.isDragging) return;
        const deltaX = e.pageX - this.startX;
        this.carousel.style.cursor = 'grab';
        this.isDragging = false;
        if (Math.abs(deltaX) > this.dragThreshold) { this.moveTo(this.center + (deltaX > 0 ? -1 : 1), deltaX > 0 ? -1 : 1); }
      };
      document.addEventListener('mouseup', this._mouseUpHandler);

      this._touchStartHandler = (e) => { this.startTouchX = e.touches[0].pageX; };
      this.carousel.addEventListener('touchstart', this._touchStartHandler, { passive: true });

      this._touchEndHandler = (e) => {
        const endTouchX = e.changedTouches[0].pageX;
        const deltaX = endTouchX - this.startTouchX;
        if (Math.abs(deltaX) > this.dragThreshold) { this.moveTo(this.center + (deltaX > 0 ? -1 : 1), deltaX > 0 ? -1 : 1); }
      };
      this.carousel.addEventListener('touchend', this._touchEndHandler, { passive: true });

      this.posters.forEach((poster, idx) => {
        // Ensure old event listener is removed before adding a new one
        if(poster._carouselClickHandler) poster.removeEventListener('click', poster._carouselClickHandler);
        poster._carouselClickHandler = () => {
          if (this.isMoving) return;
          if (idx === this.center) {
            if (typeof window.appShowModal === 'function') {
              window.appShowModal(poster, idx);
            }
          } else {
            this.performFastScroll(idx);
          }
        };
        poster.addEventListener('click', poster._carouselClickHandler);
      });
      this.carousel.style.cursor = 'grab';
    }

    setupCategoryJump() {
      const jumpButtons = document.querySelectorAll('.category-jump-btn');
      jumpButtons.forEach(button => {
        // Remove existing listener to prevent duplicates after re-rendering
        if (button._categoryJumpHandler) button.removeEventListener('click', button._categoryJumpHandler);
        button._categoryJumpHandler = () => {
          const category = button.dataset.category;
          if (!category) return;
          const targetIndex = window.projectList.findIndex(p => p.category === category);
          if (targetIndex !== -1 && targetIndex !== this.center) {
            this.performFastScroll(targetIndex);
          }
        };
        button.addEventListener('click', button._categoryJumpHandler);
      });
    }

    updateActiveCategoryButton(centerIdx) {
      const centerPoster = this.posters[centerIdx];
      if (!centerPoster) return;
      let currentCategory = '';
      for (const cls of centerPoster.classList) {
        if (cls.startsWith('poster-')) {
          currentCategory = cls.replace('poster-', '');
          break;
        }
      }
      const jumpItems = document.querySelectorAll('.carousel-category-jump .category-jump-item');
      jumpItems.forEach(item => {
        const button = item.querySelector('.category-jump-btn');
        const label = item.querySelector('.category-jump-label');
        const isActive = button && button.dataset.category === currentCategory;
        item.classList.toggle('active', isActive);
        if (button) button.classList.toggle('active', isActive);
        if (label) label.classList.toggle('active', isActive);
      });
    }

    renderFastScrollFrame(currentCenterFloat) {
      const fastScrollVisibleRange = 7;
      this.posters.forEach((poster, i) => {
        let rel = i - currentCenterFloat;
        if (Math.abs(rel) > this.n / 2) { rel = rel < 0 ? rel + this.n : rel - this.n; }
        const distance = Math.abs(rel);
        if (distance > fastScrollVisibleRange) {
          gsap.set(poster, { opacity: 0 });
          return;
        }
        const blur = Math.min(8, Math.pow(distance, 2) * 0.5);
        const opacity = Math.max(0, 1 - (distance / fastScrollVisibleRange));
        const { R, verticalOffset, cardAngle, scaleStep } = this.animParams;
        const angle = rel * cardAngle * Math.PI / 180;
        const x = Math.sin(angle) * R;
        const y = verticalOffset - Math.cos(angle) * (R * 0.38);
        const rotation = angle * (180 / Math.PI) * 0.55;
        const scale = 1 - distance * scaleStep;
        const z = 1000 - distance * 60;
        gsap.set(poster, { x, y, rotation, scale, zIndex: z, opacity, filter: `blur(${blur}px)` });
      });
    }
    
    performFastScroll(targetCenter) {
      if (!this.isEntranceAnimationComplete || this.isMoving) return;
      this.isMoving = true;
      // Load the target poster's content immediately
      this.loadPosterImage(this.posters[targetCenter]); 

      const oldCenter = this.center;
      const startImageIndex = this.backgroundImageIndex;
      const totalImages = window.appBackgroundChanger?.totalImages || 0;
      const distForward = (targetCenter - oldCenter + this.n) % this.n;
      const distBackward = (oldCenter - targetCenter + this.n) % this.n;
      const isForward = distForward <= distBackward;
      const steps = isForward ? distForward : distBackward;
      const direction = isForward ? 1 : -1;
      const endValue = oldCenter + (steps * direction);
      const animationDuration = Math.max(0.5, steps * 0.1);
      const dummy = { value: oldCenter };
      let lastRenderedBgIndex = startImageIndex;

      const combinedTimeline = gsap.timeline({
        onUpdate: () => {
          this.renderFastScrollFrame(dummy.value);
          if (window.appBackgroundChanger && totalImages > 0) {
            const postersMoved = dummy.value - oldCenter;
            const currentBgImageIndex = Math.round(startImageIndex + (postersMoved * 3));
            if (currentBgImageIndex !== lastRenderedBgIndex) {
              const wrappedIndex = (currentBgImageIndex % totalImages + totalImages) % totalImages;
              window.appBackgroundChanger._setSingleBackgroundImageForCarousel(wrappedIndex, 0.2);
              lastRenderedBgIndex = currentBgImageIndex;
            }
          }
        },
        onComplete: () => {
          this.center = targetCenter;
          const postersMovedTotal = endValue - oldCenter;
          if (totalImages > 0) { this.backgroundImageIndex = (startImageIndex + (postersMovedTotal * 3) % totalImages + totalImages) % totalImages; }
          this.updateActiveCategoryButton(this.center);
          if (this.labels) this.renderLabels(this.center, 5);
          this.checkAndLoadVisibleImages(this.center); // Load surrounding posters after landing
          
          // Re-animate all posters to their final stable positions
          const { R, verticalOffset, cardAngle, scaleStep } = this.animParams;
          this.posters.forEach((poster, i) => {
            let rel = ((i - this.center + this.n + Math.floor(this.n / 2)) % this.n) - Math.floor(this.n / 2);
            const distance = Math.abs(rel);
            const visible = distance <= this.maxVisible;
            const blurValue = Math.max(0, distance - 2) * 1.5;
            const angle = rel * cardAngle * Math.PI / 180;
            const x = Math.sin(angle) * R;
            const y = verticalOffset - Math.cos(angle) * (R * 0.38);
            const rotation = angle * (180 / Math.PI) * 0.55;
            const scale = 1 - distance * scaleStep;
            const z = 1000 - distance * 60;
            const opacity = visible ? 1 : 0;
            gsap.to(poster, { x, y, rotation, scale, zIndex: z, opacity, filter: `blur(${blurValue}px)`, duration: 0.5, ease: "power2.out" });
          });
          this.isMoving = false;
        }
      });
      combinedTimeline.to(dummy, { value: endValue, duration: animationDuration, ease: "power2.inOut" }, 0);
    }
  }
  window.ModernCarousel = ModernCarousel;
})();