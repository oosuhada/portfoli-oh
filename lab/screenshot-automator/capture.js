const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 스크린샷을 저장할 폴더 이름
const outputDir = 'screenshots';

// --- 중요 ---
// 아래 baseUrl은 "portfolio" 폴더를 루트로 서빙하는 로컬 서버의 주소입니다.
// VSCode의 Live Server를 사용하신다면 보통 "http://127.0.0.1:5500" 또는 유사한 주소입니다.
// 환경에 맞게 수정해주세요.
const baseUrl = 'http://127.0.0.1:5500';

// 스크린샷을 찍을 프로젝트 목록
// 제공해주신 디렉토리 구조를 기반으로 98개 프로젝트 경로를 모두 추가했습니다.
// 각 프로젝트 폴더 내에 'index.html' 파일이 있다고 가정합니다.
const projects = [
  // =======================================================
  // CSS Projects (50개)
  // =======================================================

  // animation-art (12개)
  { url: `${baseUrl}/lab/pure-css/animation-art/024-waves/index.html`, filename: 'css-024-waves.jpg' },
  { url: `${baseUrl}/lab/pure-css/animation-art/036-solar-eclipse/index.html`, filename: 'css-036-solar-eclipse.jpg' },
  { url: `${baseUrl}/lab/pure-css/animation-art/050-newtons-cradle/index.html`, filename: 'css-050-newtons-cradle.jpg' },
  { url: `${baseUrl}/lab/pure-css/animation-art/083-a-ball-climbing-the-stairs/index.html`, filename: 'css-083-a-ball-climbing-the-stairs.jpg' },
  { url: `${baseUrl}/lab/pure-css/animation-art/093-lightning-cable/index.html`, filename: 'css-093-lightning-cable.jpg' },
  { url: `${baseUrl}/lab/pure-css/animation-art/094-polaroid-camera/index.html`, filename: 'css-094-polaroid-camera.jpg' },
  { url: `${baseUrl}/lab/pure-css/animation-art/119-draught-beer/index.html`, filename: 'css-119-draught-beer.jpg' },
  { url: `${baseUrl}/lab/pure-css/animation-art/122-apple-photos-icon/index.html`, filename: 'css-122-apple-photos-icon.jpg' },
  { url: `${baseUrl}/lab/pure-css/animation-art/124-origami-cranes/index.html`, filename: 'css-124-origami-cranes.jpg' },
  { url: `${baseUrl}/lab/pure-css/animation-art/134-sapling-loader/index.html`, filename: 'css-134-sapling-loader.jpg' },
  { url: `${baseUrl}/lab/pure-css/animation-art/149-polo-mints-animation/index.html`, filename: 'css-149-polo-mints-animation.jpg' },
  { url: `${baseUrl}/lab/pure-css/animation-art/166-safari-logo/index.html`, filename: 'css-166-safari-logo.jpg' },

  // button-effect (6개)
  { url: `${baseUrl}/lab/pure-css/button-effect/001-button-text-staggered-sliding-effects/index.html`, filename: 'css-001-button-text-staggered-sliding-effects.jpg' },
  { url: `${baseUrl}/lab/pure-css/button-effect/009-aimed-button-effects/index.html`, filename: 'css-009-aimed-button-effects.jpg' },
  { url: `${baseUrl}/lab/pure-css/button-effect/037-stroke-animation-button-effect/index.html`, filename: 'css-037-stroke-animation-button-effect.jpg' },
  { url: `${baseUrl}/lab/pure-css/button-effect/072-bubble-coloring-button/index.html`, filename: 'css-072-bubble-coloring-button.jpg' },
  { url: `${baseUrl}/lab/pure-css/button-effect/112-button-hover-effect/index.html`, filename: 'css-112-button-hover-effect.jpg' },
  { url: `${baseUrl}/lab/pure-css/button-effect/148-button-hover-effect/index.html`, filename: 'css-148-button-hover-effect.jpg' },

  // interactive-art (9개)
  { url: `${baseUrl}/lab/pure-css/interactive-art/041-pencil/index.html`, filename: 'css-041-pencil.jpg' },
  { url: `${baseUrl}/lab/pure-css/interactive-art/076-hey-take-it-easy/index.html`, filename: 'css-076-hey-take-it-easy.jpg' },
  { url: `${baseUrl}/lab/pure-css/interactive-art/131-scissors/index.html`, filename: 'css-131-scissors.jpg' },
  { url: `${baseUrl}/lab/pure-css/interactive-art/145-power-switch/index.html`, filename: 'css-145-power-switch.jpg' },
  { url: `${baseUrl}/lab/pure-css/interactive-art/153-emoji-tooltips/index.html`, filename: 'css-153-emoji-tooltips.jpg' },
  { url: `${baseUrl}/lab/pure-css/interactive-art/156-airplane-window-toggle/index.html`, filename: 'css-156-airplane-window-toggle.jpg' },
  { url: `${baseUrl}/lab/pure-css/interactive-art/158-umbrella-toggle/index.html`, filename: 'css-158-umbrella-toggle.jpg' },
  { url: `${baseUrl}/lab/pure-css/interactive-art/168-oo-words/index.html`, filename: 'css-168-oo-words.jpg' },
  { url: `${baseUrl}/lab/pure-css/interactive-art/179-tear-calendar/index.html`, filename: 'css-179-tear-calendar.jpg' },

  // loading-effect (9개)
  { url: `${baseUrl}/lab/pure-css/loading-effect/065-swaying-loader/index.html`, filename: 'css-065-swaying-loader.jpg' },
  { url: `${baseUrl}/lab/pure-css/loading-effect/068-color-cards/index.html`, filename: 'css-068-color-cards.jpg' },
  { url: `${baseUrl}/lab/pure-css/loading-effect/071-8-shaped-dancing-loader/index.html`, filename: 'css-071-8-shaped-dancing-loader.jpg' },
  { url: `${baseUrl}/lab/pure-css/loading-effect/078-windows-boot-screen/index.html`, filename: 'css-078-windows-boot-screen.jpg' },
  { url: `${baseUrl}/lab/pure-css/loading-effect/082-bouncing-letter-i/index.html`, filename: 'css-082-bouncing-letter-i.jpg' },
  { url: `${baseUrl}/lab/pure-css/loading-effect/097-swagger-dots/index.html`, filename: 'css-097-swagger-dots.jpg' },
  { url: `${baseUrl}/lab/pure-css/loading-effect/118-hourglass-loader/index.html`, filename: 'css-118-hourglass-loader.jpg' },
  { url: `${baseUrl}/lab/pure-css/loading-effect/128-the-goddess-is-coming/index.html`, filename: 'css-128-the-goddess-is-coming.jpg' },
  { url: `${baseUrl}/lab/pure-css/loading-effect/136-colorful-bar-loader/index.html`, filename: 'css-136-colorful-bar-loader.jpg' },
  
  // screensaver (7개)
  { url: `${baseUrl}/lab/pure-css/screensaver/081-swapping-colors-rotating-animation/index.html`, filename: 'css-081-swapping-colors-rotating-animation.jpg' },
  { url: `${baseUrl}/lab/pure-css/screensaver/090-endless-hexagonal-space/index.html`, filename: 'css-090-endless-hexagonal-space.jpg' },
  { url: `${baseUrl}/lab/pure-css/screensaver/095-rotating-worm/index.html`, filename: 'css-095-rotating-worm.jpg' },
  { url: `${baseUrl}/lab/pure-css/screensaver/106-animation-with-no-dom/index.html`, filename: 'css-106-animation-with-no-dom.jpg' },
  { url: `${baseUrl}/lab/pure-css/screensaver/139-glowing-particles-animation/index.html`, filename: 'css-139-glowing-particles-animation.jpg' },
  { url: `${baseUrl}/lab/pure-css/screensaver/144-pattern-animation/index.html`, filename: 'css-144-pattern-animation.jpg' },
  { url: `${baseUrl}/lab/pure-css/screensaver/150-pattern-animation/index.html`, filename: 'css-150-pattern-animation.jpg' },

  // text-effect (7개)
  { url: `${baseUrl}/lab/pure-css/text-effect/022-stripy-rainbow-text-effects/index.html`, filename: 'css-022-stripy-rainbow-text-effects.jpg' },
  { url: `${baseUrl}/lab/pure-css/text-effect/033-milk-text-effect/index.html`, filename: 'css-033-milk-text-effect.jpg' },
  { url: `${baseUrl}/lab/pure-css/text-effect/038-stairs-lettering-effect/index.html`, filename: 'css-038-stairs-lettering-effect.jpg' },
  { url: `${baseUrl}/lab/pure-css/text-effect/056-a-programmers-life/index.html`, filename: 'css-056-a-programmers-life.jpg' },
  { url: `${baseUrl}/lab/pure-css/text-effect/059-rainbow-background-text/index.html`, filename: 'css-059-rainbow-background-text.jpg' },
  { url: `${baseUrl}/lab/pure-css/text-effect/100-shimmering-neon-text/index.html`, filename: 'css-100-shimmering-neon-text.jpg' },
  { url: `${baseUrl}/lab/pure-css/text-effect/126-button-hover-effect/index.html`, filename: 'css-126-button-hover-effect.jpg' },


  // =======================================================
  // JavaScript Projects (48개)
  // =======================================================
  
  // 3d (6개)
  { url: `${baseUrl}/lab/javascript/3d/3dBlob/index.html`, filename: 'js-3dBlob.jpg' },
  { url: `${baseUrl}/lab/javascript/3d/3dWeather/index.html`, filename: 'js-3dWeather.jpg' },
  { url: `${baseUrl}/lab/javascript/3d/LegoView/index.html`, filename: 'js-LegoView.jpg' },
  { url: `${baseUrl}/lab/javascript/3d/MorphingKnot/index.html`, filename: 'js-MorphingKnot.jpg' },
  { url: `${baseUrl}/lab/javascript/3d/Sphere/index.html`, filename: 'js-Sphere.jpg' },
  { url: `${baseUrl}/lab/javascript/3d/Stardust/index.html`, filename: 'js-Stardust.jpg' },

  // ai-bot (4개)
  { url: `${baseUrl}/lab/javascript/ai-bot/Chatbot/index.html`, filename: 'js-Chatbot.jpg' },
  { url: `${baseUrl}/lab/javascript/ai-bot/DEEPOOSU/index.html`, filename: 'js-DEEPOOSU.jpg' },
  { url: `${baseUrl}/lab/javascript/ai-bot/HeySarah/index.html`, filename: 'js-HeySarah.jpg' },
  { url: `${baseUrl}/lab/javascript/ai-bot/ImageGenerator/index.html`, filename: 'js-ImageGenerator.jpg' },

  // cursor-effects (12개)
  { url: `${baseUrl}/lab/javascript/cursor-effects/ArrowGrid/index.html`, filename: 'js-ArrowGrid.jpg' },
  { url: `${baseUrl}/lab/javascript/cursor-effects/CharacterScramble/index.html`, filename: 'js-CharacterScramble.jpg' },
  { url: `${baseUrl}/lab/javascript/cursor-effects/CursorBlob/index.html`, filename: 'js-CursorBlob.jpg' },
  { url: `${baseUrl}/lab/javascript/cursor-effects/DessertCursor/index.html`, filename: 'js-DessertCursor.jpg' },
  { url: `${baseUrl}/lab/javascript/cursor-effects/FOLLOWCURSOR/index.html`, filename: 'js-FOLLOWCURSOR.jpg' },
  { url: `${baseUrl}/lab/javascript/cursor-effects/FingerCursor/index.html`, filename: 'js-FingerCursor.jpg' },
  { url: `${baseUrl}/lab/javascript/cursor-effects/LighteningEffect/index.html`, filename: 'js-LighteningEffect.jpg' },
  { url: `${baseUrl}/lab/javascript/cursor-effects/Magnet/index.html`, filename: 'js-Magnet.jpg' },
  { url: `${baseUrl}/lab/javascript/cursor-effects/MagneticCursor/index.html`, filename: 'js-MagneticCursor.jpg' },
  { url: `${baseUrl}/lab/javascript/cursor-effects/MouseRepellant/index.html`, filename: 'js-MouseRepellant.jpg' },
  { url: `${baseUrl}/lab/javascript/cursor-effects/StackedCards/index.html`, filename: 'js-StackedCards.jpg' },
  { url: `${baseUrl}/lab/javascript/cursor-effects/etchCanvas/index.html`, filename: 'js-etchCanvas.jpg' },
  
  // game (7개)
  { url: `${baseUrl}/lab/javascript/game/ColorSwitch/index.html`, filename: 'js-ColorSwitch.jpg' },
  { url: `${baseUrl}/lab/javascript/game/GALACTICGUARDIAN/index.html`, filename: 'js-GALACTICGUARDIAN.jpg' },
  { url: `${baseUrl}/lab/javascript/game/MathBlitz/index.html`, filename: 'js-MathBlitz.jpg' },
  { url: `${baseUrl}/lab/javascript/game/MemoryCard/index.html`, filename: 'js-MemoryCard.jpg' },
  { url: `${baseUrl}/lab/javascript/game/PACMAN/index.html`, filename: 'js-PACMAN.jpg' },
  { url: `${baseUrl}/lab/javascript/game/Pokemon/index.html`, filename: 'js-Pokemon.jpg' },
  { url: `${baseUrl}/lab/javascript/game/Tetris/index.html`, filename: 'js-Tetris.jpg' },
  
  // scroll-effects (10개)
  { url: `${baseUrl}/lab/javascript/scroll-effects/BgColor/index.html`, filename: 'js-BgColor.jpg' },
  { url: `${baseUrl}/lab/javascript/scroll-effects/Horizontal/index.html`, filename: 'js-Horizontal.jpg' },
  { url: `${baseUrl}/lab/javascript/scroll-effects/Hybrid/index.html`, filename: 'js-Hybrid.jpg' },
  { url: `${baseUrl}/lab/javascript/scroll-effects/Nav/index.html`, filename: 'js-Nav.jpg' },
  { url: `${baseUrl}/lab/javascript/scroll-effects/Parallax/index.html`, filename: 'js-Parallax.jpg' },
  { url: `${baseUrl}/lab/javascript/scroll-effects/Progress/index.html`, filename: 'js-Progress.jpg' },
  { url: `${baseUrl}/lab/javascript/scroll-effects/Reveal/index.html`, filename: 'js-Reveal.jpg' },
  { url: `${baseUrl}/lab/javascript/scroll-effects/Split/index.html`, filename: 'js-Split.jpg' },
  { url: `${baseUrl}/lab/javascript/scroll-effects/Timeline/index.html`, filename: 'js-Timeline.jpg' },
  { url: `${baseUrl}/lab/javascript/scroll-effects/Trigger/index.html`, filename: 'js-Trigger.jpg' },

  // utility (9개)
  { url: `${baseUrl}/lab/javascript/utility/Calculator/index.html`, filename: 'js-Calculator.jpg' },
  { url: `${baseUrl}/lab/javascript/utility/ColorPalette/index.html`, filename: 'js-ColorPalette.jpg' },
  { url: `${baseUrl}/lab/javascript/utility/DottedConverter/index.html`, filename: 'js-DottedConverter.jpg' },
  { url: `${baseUrl}/lab/javascript/utility/GradientGenerator/index.html`, filename: 'js-GradientGenerator.jpg' },
  { url: `${baseUrl}/lab/javascript/utility/InkBlobGenerator/index.html`, filename: 'js-InkBlobGenerator.jpg' },
  { url: `${baseUrl}/lab/javascript/utility/MinimalNotepad/index.html`, filename: 'js-MinimalNotepad.jpg' },
  { url: `${baseUrl}/lab/javascript/utility/PomodoroTimer/index.html`, filename: 'js-PomodoroTimer.jpg' },
  { url: `${baseUrl}/lab/javascript/utility/QRGenerator/index.html`, filename: 'js-QRGenerator.jpg' },
  { url: `${baseUrl}/lab/javascript/utility/UnitConverter/index.html`, filename: 'js-UnitConverter.jpg' },
];

// 자동 캡처 실행 함수
async function captureScreenshots() {
  console.log(`총 ${projects.length}개의 프로젝트 스크린샷 생성을 시작합니다...`);

  // 스크린샷 저장 폴더가 없으면 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 스크린샷 해상도 설정 (카드 사이즈 200x280 비율에 맞춰 고화질로 캡처)
  // 예: 4배수 크기인 800x1120 으로 캡처하면 레티나 디스플레이에서도 선명합니다.
  await page.setViewport({ width: 400, height: 560 });

  for (const project of projects) {
    try {
      console.log(`[처리 중] ${project.url}`);
      
      // 해당 URL로 이동 (networkidle0는 페이지의 네트워크 활동이 잠잠해질 때까지 기다리는 옵션)
      await page.goto(project.url, { waitUntil: 'networkidle0' });

      // 페이지 로딩 후 애니메이션 등을 기다리기 위해 추가 대기 시간 (2초)
      // 대부분의 프로젝트에 애니메이션이 있으므로, 2초 정도 기다리는 것이 안정적입니다.
      await new Promise(resolve => setTimeout(resolve, 4000));

      // 스크린샷 촬영
      await page.screenshot({
        path: path.join(outputDir, project.filename), // 저장 경로
        type: 'jpeg', // 파일 형식 (jpeg가 png보다 용량이 작음)
        quality: 80,  // 이미지 품질 (1-100)
      });
      
      console.log(`[성공] ${project.filename} 파일이 저장되었습니다.`);

    } catch (error) {
      console.error(`[실패] ${project.url} 처리 중 오류 발생:`, error.message);
    }
  }

  await browser.close();
  console.log('모든 스크린샷 생성이 완료되었습니다!');
}

// 스크립트 실행
captureScreenshots();