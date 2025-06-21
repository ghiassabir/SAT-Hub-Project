// js/viewer-logic.js

document.addEventListener('DOMContentLoaded', async () => {
    const contentDisplayArea = document.getElementById('content-display-area');
    const viewerTitleElement = document.getElementById('viewer-title');
    const backButton = document.getElementById('viewer-back-button');
    document.body.classList.add('viewer-body');

    if (!contentDisplayArea || !viewerTitleElement || !backButton) {
        console.error('Essential viewer elements not found!');
        if (contentDisplayArea) {
            contentDisplayArea.innerHTML = '<p style="color: red;">Error: Page structure is missing. Cannot load content.</p>';
        }
        return;
    }

    backButton.addEventListener('click', () => {
        history.back();
    });

    const params = new URLSearchParams(window.location.search);
    const subject = params.get('subject');
    const chapter = params.get('chapter');
    const type = params.get('type');

    if (!subject || !chapter || !type) {
        contentDisplayArea.innerHTML = '<p style="color: red;">Error: Missing required parameters (subject, chapter, or type) to load content.</p>';
        viewerTitleElement.textContent = 'Error';
        return;
    }

    const chapterTitleFriendly = chapter.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    viewerTitleElement.textContent = `${chapterTitleFriendly} - ${type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ')}`;

    let filePath = '';
    let fileExtension = '';

    if (['notes', 'cheatsheet', 'hub', 'chapter-text'].includes(type)) {
        filePath = `../data/content/reading-materials/${subject}/${chapter}-${type}.md`;
        fileExtension = 'md';
    } else if (type === 'lesson-recording' || type === 'concept-videos') { // CORRECTED: Handle specific video types
        filePath = `../data/content/videos/${subject}/${chapter}-${type}.json`; // Filename uses type
        fileExtension = 'json';
    } else if (type.endsWith('-quiz-list') || type.endsWith('-resources')) {
        filePath = `../data/content/quizzes/${subject}/${chapter}-${type}.json`;
        fileExtension = 'json';
    } else {
        contentDisplayArea.innerHTML = `<p style="color: red;">Error: Unknown content type requested: ${type}.</p>`;
        viewerTitleElement.textContent = 'Unknown Content Type';
        return;
    }

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${filePath}`);
        }

        if (fileExtension === 'md') {
            const markdownText = await response.text();
            if (typeof marked !== 'undefined') {
                marked.setOptions({
                    gfm: true,
                    breaks: true,
                });
                contentDisplayArea.innerHTML = marked.parse(markdownText);
            } else {
                console.error('Marked.js library not loaded.');
                contentDisplayArea.textContent = 'Error: Markdown parser not available.\n\n' + markdownText;
            }
        } else if (fileExtension === 'json') {
            const jsonData = await response.json();
            renderJsonData(jsonData, type, contentDisplayArea);
        }

    } catch (error) {
        console.error('Error fetching or rendering content:', error);
        contentDisplayArea.innerHTML = `<p style="color: red;">Sorry, couldn't load the content for "${chapterTitleFriendly} - ${type.replace(/-/g, ' ')}".<br>Path: ${filePath}<br>Error: ${error.message}</p>`;
        viewerTitleElement.textContent = 'Content Load Error';
    }
});

function renderJsonData(jsonData, type, container) {
    let htmlContent = '';
    // CORRECTED: Check for lesson-recording and concept-videos to render video list
    if (type === 'lesson-recording' || type === 'concept-videos' || type === 'videos') {
        htmlContent = '<div class="video-list-container">';
        jsonData.forEach(video => {
            htmlContent += `
                <div class="video-item" id="${video.id || ''}">
                    <h3>${video.title || 'Untitled Video'}</h3>
                    <div class="video-embed">
                        <iframe 
                            src="https://www.youtube.com/embed/${video.youtubeId}" 
                            title="${video.title || 'YouTube video player'}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowfullscreen>
                        </iframe>
                    </div>
                    ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                </div>
            `;
        });
        htmlContent += '</div>';
    } else if (type.endsWith('-quiz-list') || type.endsWith('-resources')) {
        htmlContent = '<div class="quiz-list-container">';
        jsonData.forEach(categoryOrItem => {
            if (categoryOrItem.category && Array.isArray(categoryOrItem.items)) {
                htmlContent += `<div class="quiz-category"><h3>${categoryOrItem.category}</h3>`;
                categoryOrItem.items.forEach(item => {
                    htmlContent += renderQuizListItem(item);
                });
                htmlContent += `</div>`;
            } else {
                htmlContent += renderQuizListItem(categoryOrItem);
            }
        });
        htmlContent += '</div>';
    } else {
        htmlContent = `<p>JSON data rendering for this type ("${type}") is not yet implemented.</p><pre>${JSON.stringify(jsonData, null, 2)}</pre>`;
    }
    container.innerHTML = htmlContent;
}

function renderQuizListItem(item) {
    let itemHtml = `<div class="quiz-item"><h4>`;
    let linkTarget = '#';

    if (item.type === 'external_link') {
        linkTarget = item.target || '#';
        itemHtml += `<a href="${linkTarget}" target="_blank" rel="noopener noreferrer">${item.title || 'Untitled Resource'} 🔗</a>`;
    } else if (item.type === 'internal_quiz' || item.quizName) {
        // CORRECTED: Path to quiz.html using repository name for GitHub Pages
        linkTarget = `/SAT-Hub-Project/quiz.html?quiz_name=${item.quizName}`;
        if (item.source) linkTarget += `&source=${item.source}`;
        itemHtml += `<a href="${linkTarget}">${item.title || 'Untitled Quiz'}</a>`;
    } else {
        itemHtml += `${item.title || 'Untitled Item'}`;
    }
    itemHtml += `</h4>`;

    if (item.description) {
        itemHtml += `<p class="quiz-description">${item.description}</p>`;
    }
    if (item.status === 'unpublished') {
        itemHtml += `<p class="status-unpublished">(Currently unavailable)</p>`;
    }
    itemHtml += `</div>`;
    return itemHtml;
}
