// js/viewer-logic.js - V2 (for chapter-based content folders)

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
    const chapterSlug = params.get('chapter'); // e.g., G-C3-Sentences-Fragments
    const type = params.get('type'); // e.g., notes, hub, lesson-recording, chapter-text

    if (!subject || !chapterSlug || !type) {
        contentDisplayArea.innerHTML = '<p style="color: red;">Error: Missing required parameters (subject, chapter, or type) to load content.</p>';
        viewerTitleElement.textContent = 'Error';
        return;
    }

    const chapterTitleFriendly = chapterSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const typeFriendly = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    viewerTitleElement.textContent = `${chapterTitleFriendly} - ${typeFriendly}`;

    // Base path to the specific chapter's folder
    // Relative from /content/viewer.html to /data/content/[subject]/[chapterSlug]/
    const chapterFolderPath = `../data/content/${subject}/${chapterSlug}/`;
    let filePath = '';
    let fileExtensionOrHandler = ''; // Can be 'md', 'json', or a special handler like 'pdf'

    // Determine file path and how to handle it based on type
    if (['hub', 'notes', 'cheatsheet'].includes(type)) {
        filePath = `${chapterFolderPath}${type}.md`;
        fileExtensionOrHandler = 'md';
    } else if (type === 'lesson-recording' || type === 'concept-videos') {
        filePath = `${chapterFolderPath}${type}.json`;
        fileExtensionOrHandler = 'json_video_list'; // Specific handler for video lists
    } else if (type === 'cb-quiz-list' || type === 'khan-resources' || type === 'eoc-quiz' || type.endsWith('-quiz-list')) {
        // For eoc-quiz, it directly loads eoc-quiz.json. For lists, it's [type].json
        filePath = `${chapterFolderPath}${type}.json`;
        fileExtensionOrHandler = 'json_quiz_resource_list'; // Specific handler for quiz/resource lists
    } else if (type === 'chapter-text') {
        // PDF handling: we'll directly construct the iframe, no separate .md needed.
        // The actual PDF file is assumed to be named 'text.pdf' within the chapter folder.
        filePath = `${chapterFolderPath}text.pdf`;
        fileExtensionOrHandler = 'pdf';
    } else {
        contentDisplayArea.innerHTML = `<p style="color: red;">Error: Unknown content type requested: "${type}".</p>`;
        viewerTitleElement.textContent = 'Unknown Content Type';
        return;
    }

    try {
        if (fileExtensionOrHandler === 'pdf') {
            // Directly render PDF embed
            contentDisplayArea.innerHTML = `
                <h2>Chapter Text: ${chapterTitleFriendly}</h2>
                <p>Please view the chapter text PDF below.</p>
                <div class="pdf-embed-container">
                    <iframe title="Chapter Text PDF: ${chapterTitleFriendly}" src="${filePath}" loading="lazy"></iframe>
                </div>
                <p><em>If the PDF does not load, you can try accessing it directly: <a href="${filePath}" target="_blank" rel="noopener noreferrer">Download PDF</a></em></p>
            `;
        } else {
            // Fetch MD or JSON files
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
                        // To allow HTML like <span style="color:..."> within Markdown:
                        // sanitize: false, // Default is false, but explicitly stating if needed.
                                         // Or use a more robust sanitizer configuration if MD comes from varied sources.
                    });
                    contentDisplayArea.innerHTML = marked.parse(markdownText);
                } else {
                    console.error('Marked.js library not loaded.');
                    contentDisplayArea.textContent = 'Error: Markdown parser not available.\n\n' + markdownText;
                }
            } else if (fileExtensionOrHandler === 'json_video_list') {
                const jsonData = await response.json();
                renderVideoList(jsonData, container); // Renamed for clarity
            } else if (fileExtensionOrHandler === 'json_quiz_resource_list') {
                const jsonData = await response.json();
                renderQuizOrResourceList(jsonData, container); // Renamed for clarity
            }
        }
    } catch (error) {
        console.error('Error fetching or rendering content:', error);
        contentDisplayArea.innerHTML = `<p style="color: red;">Sorry, couldn't load the content for "${chapterTitleFriendly} - ${typeFriendly}".<br>Attempted Path: ${filePath}<br>Error: ${error.message}</p>`;
        viewerTitleElement.textContent = 'Content Load Error';
    }
});

function renderVideoList(videoArray, container) { // Specifically for arrays of video objects
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
}

function renderQuizOrResourceList(listData, container) { // Handles categorized or flat lists of quizzes/resources
    let htmlContent = '<div class="quiz-list-container">';
    // Check if listData is an array (flat list) or an object (potentially categorized - though current JSONs are arrays)
    // For now, assuming listData is always an array, either of items or categories.
    if (Array.isArray(listData)) {
        listData.forEach(categoryOrItem => {
            if (categoryOrItem.category && Array.isArray(categoryOrItem.items)) { // Categorized list (like Khan resources)
                htmlContent += `<div class="quiz-category"><h3>${categoryOrItem.category}</h3>`;
                categoryOrItem.items.forEach(item => {
                    htmlContent += renderListItemDetail(item); // Changed to a more generic item renderer
                });
                htmlContent += `</div>`;
            } else { // Direct list of items (like CB quiz list or a single EOC quiz JSON if it's an array)
                     // Or if eoc-quiz.json is a single object, not an array
                if (Array.isArray(categoryOrItem)) { // Should not happen if JSON is just one quiz object
                     categoryOrItem.forEach(item => htmlContent += renderListItemDetail(item));
                } else { // Assumes categoryOrItem is a single quiz/resource item object
                     htmlContent += renderListItemDetail(categoryOrItem);
                }
            }
        });
    } else if (typeof listData === 'object' && listData !== null && listData.quizName) {
        // Handle the case where eoc-quiz.json is a single object, not an array
        htmlContent += renderListItemDetail(listData);
    } else {
         htmlContent += '<p>Unsupported list format.</p>';
    }
    htmlContent += '</div>';
    container.innerHTML = htmlContent;
}

function renderListItemDetail(item) { // Renders a single quiz or resource link item
    let itemHtml = `<div class="quiz-item"><h4>`; // Using "quiz-item" class for general list items for now
    let linkTarget = '#';

    if (item.type === 'external_link') {
        linkTarget = item.target || '#';
        itemHtml += `<a href="${linkTarget}" target="_blank" rel="noopener noreferrer">${item.title || 'Untitled Resource'} 🔗</a>`;
    } else if (item.type === 'internal_quiz' || item.quizName) {
        // Path to quiz.html using repository name for GitHub Pages
        // This link is relative from /content/viewer.html to /quiz.html which is one level up.
        linkTarget = `../quiz.html?quiz_name=${item.quizName}`; // CORRECTED to ../ for root quiz.html
        if (item.source) linkTarget += `&source=${item.source}`;
        itemHtml += `<a href="${linkTarget}">${item.title || 'Untitled Quiz'}</a>`;
    } else { // Fallback for items without a clear type but having a title
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
