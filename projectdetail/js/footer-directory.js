// js/footer-directory.js

document.addEventListener('DOMContentLoaded', () => {
    // Project file names and their display names for navigation
    const projectDisplayNames = {
        'portfoliOh.html': {
            ko: '포트폴리-오!',
            en: 'Portfoli-oh!'
        },
        'EZAir.html': {
            ko: 'EZ Air',
            en: 'EZ Air'
        },
        'Uncorked.html': {
            ko: '언코크드!',
            en: 'Uncorked!'
        },
        'Onjung.html': {
            ko: '온정',
            en: 'Onjung'
        },
        'NomadMarket.html': {
            ko: '노마드 마켓',
            en: 'Nomad Market'
        }
    };

    // Defines the circular order of projects
    const projectOrder = [
        'portfoliOh.html',
        'EZAir.html',
        'Uncorked.html',
        'Onjung.html',
        'NomadMarket.html'
    ];

    const currentPath = window.location.pathname;
    const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);

    // Elements to update
    const prevProjectNameElement = document.getElementById('prev-project-name'); // Span for previous project name
    const nextProjectNameElement = document.getElementById('next-project-name'); // Span for next project name
    
    // Copyright and Designer name elements at the very bottom
    const footerCopyrightTextElement = document.getElementById('footer-copyright-text'); 
    const footerDesignerNameElement = document.getElementById('footer-designer-name');

    // Language toggle buttons
    const langKoButton = document.getElementById('lang-ko');
    const langEnButton = document.getElementById('lang-en');

    // Function to update all footer content based on language
    function updateFooterContent(lang) {
        const currentIndex = projectOrder.indexOf(currentFile);

        if (currentIndex === -1) {
            console.warn(`Current file (${currentFile}) not found in projectOrder. Cannot update footer navigation names.`);
            // Fallback for prev/next names if current file is not in list
            if (prevProjectNameElement) prevProjectNameElement.textContent = lang === 'ko' ? '이전 프로젝트' : 'Previous Project';
            if (nextProjectNameElement) nextProjectNameElement.textContent = lang === 'ko' ? '다음 프로젝트' : 'Next Project';
        } else {
            // Get previous project's display name
            const prevIndex = (currentIndex - 1 + projectOrder.length) % projectOrder.length;
            const prevProjectFile = projectOrder[prevIndex];
            const prevProjectName = projectDisplayNames[prevProjectFile] ? projectDisplayNames[prevProjectFile][lang] : '';

            // Get next project's display name
            const nextIndex = (currentIndex + 1) % projectOrder.length;
            const nextProjectFile = projectOrder[nextIndex];
            const nextProjectName = projectDisplayNames[nextProjectFile] ? projectDisplayNames[nextProjectFile][lang] : '';

            // Update project names under the circles with "© 2025." prefix
            if (prevProjectNameElement) {
                prevProjectNameElement.textContent = `© 2025. ${prevProjectName}`;
            }
            if (nextProjectNameElement) {
                nextProjectNameElement.textContent = `© 2025. ${nextProjectName}`;
            }
        }

        // Update footer copyright and designer name using their data-lang attributes
        // These now contain the full desired text including "© 2025." and "Designed by: Oosu"
        if (footerCopyrightTextElement) {
            footerCopyrightTextElement.textContent = footerCopyrightTextElement.getAttribute(`data-lang-${lang}`);
        }
        if (footerDesignerNameElement) {
            footerDesignerNameElement.textContent = footerDesignerNameElement.getAttribute(`data-lang-${lang}`);
        }
    }

    // Initial load: set language based on saved preference or default
    let initialLang = localStorage.getItem('portfolioLang') || 'ko';
    updateFooterContent(initialLang);

    // Add event listeners for language toggle buttons
    if (langKoButton) {
        langKoButton.addEventListener('click', () => updateFooterContent('ko'));
    }
    if (langEnButton) {
        langEnButton.addEventListener('click', () => updateFooterContent('en'));
    }
});