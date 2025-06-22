// js/viewer-logic.js - V2.1 (Corrected for chapter-based content folders and 'container' error)

document.addEventListener('DOMContentLoaded', async () => {
    const contentDisplayArea = document.getElementById('content-display-area'); // Defined here
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
    const chapterSlug = params.get('chapter');
    const type = params.get('type');

    if (!subject || !chapterSlug || !type) {
        contentDisplayArea.innerHTML = '<p style="color: red;">Error: Missing required parameters (subject, chapter, or type) to load content.</p>';
        viewerTitleElement.textContent = 'Error';
        return;
    }

    const chapterTitleFriendly = chapterSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const typeFriendly = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    viewerTitleElement.textContent = `${chapterTitleFriendly} - ${typeFriendly}`;

    const chapterFolderPath = `../data/content/${subject}/${chapterSlug}/`;
    let filePath = '';
    let fileExtensionOrHandler = '';

    if (['hub', 'notes', 'cheatsheet'].includes(type)) {
        filePath = `${chapterFolderPath}${type}.md`;
        fileExtensionOrHandler = 'md';
    } else if (type === 'lesson-recording' || type === 'concept-videos') {
        filePath = `${chapterFolderPath}${type}.json`;
        fileExtensionOrHandler = 'json_video_list';
    } else if (type === 'cb-quiz-list' || type === 'khan-resources' || type === 'eoc-quiz' || type.endsWith('-quiz-list')) {
        filePath = `${chapterFolderPath}${type}.json`;
        fileExtensionOrHandler = 'json_quiz_resource_list';
    } else if (type === 'chapter-text') {
        filePath = `${chapterFolderPath}text.pdf`;
        fileExtensionOrHandler = 'pdf';
    } else {
        contentDisplayArea.innerHTML = `<p style="color: red;">Error: Unknown content type requested: "${type}".</p>`;
        viewerTitleElement.textContent = 'Unknown Content Type';
        return;
    }

    try {
        if (fileExtensionOrHandler === 'pdf') {
            contentDisplayArea.innerHTML = `
                <h2>Chapter Text: ${chapterTitleFriendly}</h2>
                <p>Please view the chapter text PDF below.</p>
                <div class="pdf-embed-container">
                    <iframe title="Chapter Text PDF: ${chapterTitleFriendly}" src="${filePath}" loading="lazy"></iframe>
                </div>
                <p><em>If the PDF does not load, you can try accessing it directly: <a href="${filePath}" target="_blank" rel="noopener noreferrer">Download PDF</a></em></p>
            `;
        } else {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${filePath}`);
            }

            if (fileExtensionOrHandler === 'md') {
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
            } else if (fileExtensionOrHandler === 'json_video_list') {
                const jsonData = await response.json();
                renderVideoList(jsonData, contentDisplayArea); // CORRECTED: Pass contentDisplayArea
            } else if (fileExtensionOrHandler === 'json_quiz_resource_list') {
                const jsonData = await response.json();
                renderQuizOrResourceList(jsonData, contentDisplayArea); // CORRECTED: Pass contentDisplayArea
            }
        }
    } catch (error) {
        console.error('Error fetching or rendering content:', error);
        contentDisplayArea.innerHTML = `<p style="color: red;">Sorry, couldn't load the content for "${chapterTitleFriendly} - ${typeFriendly}".<br>Attempted Path: ${filePath}<br>Error: ${error.message}</p>`;
        viewerTitleElement.textContent = 'Content Load Error';
    }
});

// 'container' parameter is added here
function renderVideoList(videoArray, container) {
    let htmlContent = '<div class="video-list-container">';
    videoArray.forEach(video => {
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
    if (container) { // Added check for safety
        container.innerHTML = htmlContent;
    } else {
        console.error("Video list render function called without a valid container.");
    }
}

// 'container' parameter is added here
function renderQuizOrResourceList(listData, container) {
    let htmlContent = '<div class="quiz-list-container">';
    if (Array.isArray(listData)) {
        listData.forEach(categoryOrItem => {
            if (categoryOrItem.category && Array.isArray(categoryOrItem.items)) {
                htmlContent += `<div class="quiz-category"><h3>${categoryOrItem.category}</h3>`;
                categoryOrItem.items.forEach(item => {
                    htmlContent += renderListItemDetail(item);
                });
                htmlContent += `</div>`;
            } else {
                if (Array.isArray(categoryOrItem)) {
                     categoryOrItem.forEach(item => htmlContent += renderListItemDetail(item));
                } else {
                     htmlContent += renderListItemDetail(categoryOrItem);
                }
            }
        });
    } else if (typeof listData === 'object' && listData !== null && listData.quizName) {
        htmlContent += renderListItemDetail(listData);
    } else {
         htmlContent += '<p>Unsupported list format or empty list.</p>'; // Updated message for empty list
    }
    htmlContent += '</div>';
    if (container) { // Added check for safety
        container.innerHTML = htmlContent;
    } else {
        console.error("Quiz/Resource list render function called without a valid container.");
    }
}

function renderListItemDetail(item) {
    let itemHtml = `<div class="quiz-item"><h4>`;
    let linkTarget = '#';

    if (item.type === 'external_link') {
        linkTarget = item.target || '#';
        itemHtml += `<a href="${linkTarget}" target="_blank" rel="noopener noreferrer">${item.title || 'Untitled Resource'} 🔗</a>`;
    } else if (item.type === 'internal_quiz' || item.quizName) {
        linkTarget = `../quiz.html?quiz_name=${item.quizName}`;
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
