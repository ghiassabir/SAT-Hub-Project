// js/viewer-logic.js - V2.2 (Enhanced logging and checks)

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Viewer DOMContentLoaded: Script starting.');

    const contentDisplayArea = document.getElementById('content-display-area');
    const viewerTitleElement = document.getElementById('viewer-title');
    const backButton = document.getElementById('viewer-back-button');
    
    if (document.body) { // Check if body exists before adding class
        document.body.classList.add('viewer-body');
    } else {
        console.error('Viewer DOMContentLoaded: document.body is null at classList.add time.');
    }

    if (!contentDisplayArea) {
        console.error('FATAL: contentDisplayArea element NOT FOUND in viewer.html!');
        // Try to write to body if contentDisplayArea is missing
        document.body.innerHTML = '<p style="color: red; font-size: 20px; padding: 20px;">FATAL ERROR: Essential page element "content-display-area" is missing. Check viewer.html.</p>';
        return;
    }
    if (!viewerTitleElement) console.warn('viewerTitleElement not found.');
    if (!backButton) console.warn('viewer-back-button not found.');

    console.log('Viewer DOMContentLoaded: Essential elements checked. contentDisplayArea:', contentDisplayArea ? 'Found' : 'MISSING');

    if (backButton) {
        backButton.addEventListener('click', () => {
            history.back();
        });
    }

    const params = new URLSearchParams(window.location.search);
    const subject = params.get('subject');
    const chapterSlug = params.get('chapter');
    const type = params.get('type');

    console.log(`Viewer: Loading content for subject='${subject}', chapter='${chapterSlug}', type='${type}'`);

    if (!subject || !chapterSlug || !type) {
        contentDisplayArea.innerHTML = '<p style="color: red;">Error: Missing required parameters (subject, chapter, or type) to load content.</p>';
        if (viewerTitleElement) viewerTitleElement.textContent = 'Error';
        return;
    }

    const chapterTitleFriendly = chapterSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const typeFriendly = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (viewerTitleElement) viewerTitleElement.textContent = `${chapterTitleFriendly} - ${typeFriendly}`;

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
        if (viewerTitleElement) viewerTitleElement.textContent = 'Unknown Content Type';
        return;
    }

    console.log(`Viewer: Determined filePath='${filePath}', handler='${fileExtensionOrHandler}'`);

    try {
        if (fileExtensionOrHandler === 'pdf') {
            console.log('Viewer: Handling PDF directly.');
            contentDisplayArea.innerHTML = `
                <h2>Chapter Text: ${chapterTitleFriendly}</h2>
                <p>Please view the chapter text PDF below.</p>
                <div class="pdf-embed-container">
                    <iframe title="Chapter Text PDF: ${chapterTitleFriendly}" src="${filePath}" loading="lazy"></iframe>
                </div>
                <p><em>If the PDF does not load, you can try accessing it directly: <a href="${filePath}" target="_blank" rel="noopener noreferrer">Download PDF</a></em></p>
            `;
        } else {
            console.log(`Viewer: Fetching ${filePath}`);
            const response = await fetch(filePath);
            console.log(`Viewer: Fetch response for ${filePath}:`, response.status, response.ok);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${filePath}`);
            }

            if (fileExtensionOrHandler === 'md') {
                const markdownText = await response.text();
                console.log(`Viewer: Fetched MD content (length: ${markdownText.length}). Parsing with marked.js.`);
                if (typeof marked !== 'undefined') {
                    marked.setOptions({ gfm: true, breaks: true });
                    contentDisplayArea.innerHTML = marked.parse(markdownText);
                    console.log('Viewer: MD content parsed and injected.');
                } else {
                    console.error('Marked.js library not loaded.');
                    contentDisplayArea.textContent = 'Error: Markdown parser not available.\n\n' + markdownText;
                }
            } else if (fileExtensionOrHandler === 'json_video_list') {
                const jsonData = await response.json();
                console.log('Viewer: Fetched JSON for video list. Data:', jsonData);
                if (!contentDisplayArea) console.error("CRITICAL: contentDisplayArea is null before calling renderVideoList");
                renderVideoList(jsonData, contentDisplayArea);
            } else if (fileExtensionOrHandler === 'json_quiz_resource_list') {
                const jsonData = await response.json();
                console.log('Viewer: Fetched JSON for quiz/resource list. Data:', jsonData);
                if (!contentDisplayArea) console.error("CRITICAL: contentDisplayArea is null before calling renderQuizOrResourceList");
                renderQuizOrResourceList(jsonData, contentDisplayArea);
            }
        }
    } catch (error) {
        console.error(`Viewer: Error fetching or rendering content for ${filePath}:`, error);
        contentDisplayArea.innerHTML = `<p style="color: red;">Sorry, couldn't load the content for "${chapterTitleFriendly} - ${typeFriendly}".<br>Attempted Path: ${filePath}<br>Error: ${error.message}</p>`;
        if (viewerTitleElement) viewerTitleElement.textContent = 'Content Load Error';
    }
});

function renderVideoList(videoArray, container) {
    console.log('renderVideoList called. Container:', container ? 'Exists' : 'MISSING', 'Data:', videoArray);
    if (!container) {
        console.error("renderVideoList: container is null or undefined.");
        return;
    }
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
    container.innerHTML = htmlContent;
    console.log('renderVideoList: HTML injected into container.');
}

function renderQuizOrResourceList(listData, container) {
    console.log('renderQuizOrResourceList called. Container:', container ? 'Exists' : 'MISSING', 'Data:', listData);
    if (!container) {
        console.error("renderQuizOrResourceList: container is null or undefined.");
        return;
    }
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
         htmlContent += '<p>Unsupported list format or empty list.</p>';
    }
    htmlContent += '</div>';
    container.innerHTML = htmlContent;
    console.log('renderQuizOrResourceList: HTML injected into container.');
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
