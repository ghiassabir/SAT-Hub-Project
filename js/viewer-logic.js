document.addEventListener('DOMContentLoaded', async () => {
    const contentDisplayArea = document.getElementById('content-display-area');
    const viewerTitleElement = document.getElementById('viewer-title');
    const backButton = document.getElementById('viewer-back-button');
    document.body.classList.add('viewer-body'); // Add class for specific viewer styling

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
    const chapter = params.get('chapter'); // This is the chapter slug, e.g., G-C3-Sentences-Fragments
    const type = params.get('type');

    if (!subject || !chapter || !type) {
        contentDisplayArea.innerHTML = '<p style="color: red;">Error: Missing required parameters (subject, chapter, or type) to load content.</p>';
        viewerTitleElement.textContent = 'Error';
        return;
    }

    // Construct a user-friendly title
    const chapterTitleFriendly = chapter.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Basic slug to title
    viewerTitleElement.textContent = `${chapterTitleFriendly} - ${type.charAt(0).toUpperCase() + type.slice(1)}`;

    let filePath = '';
    let fileExtension = '';

    // Determine file path and extension based on type
    if (['notes', 'cheatsheet', 'hub', 'chapter-text'].includes(type)) {
        // For Markdown files, chapter slug usually forms the base filename
        // e.g. G-C3-Sentences-Fragments-notes.md
        filePath = `../data/content/reading-materials/${subject}/${chapter}-${type}.md`;
        fileExtension = 'md';
        } else if (type === 'lesson-recording' || type === 'concept-videos') { // Changed this line
    filePath = `../data/content/videos/${subject}/${chapter}-${type}.json`; // Now uses the specific type in filename
    fileExtension = 'json';
} else if (type.endsWith('-quiz-list') || type.endsWith('-resources')) {
    // Inside js/viewer-logic.js, in the filePath construction logic:
// ...
} else if (type === 'videos' || type === 'lesson-recording' || type === 'concept-videos') {
    // For G-C3-Sentences-Fragments-lesson-recording.json or G-C3-Sentences-Fragments-concept-videos.json
    // The filename becomes [chapter]-[type].json
    filePath = `../data/content/videos/${subject}/${chapter}-${type}.json`;
    fileExtension = 'json';
// ...
    } else if (type.endsWith('-quiz-list') || type.endsWith('-resources')) { // For quiz lists or resource lists
        // e.g. G-C3-Sentences-Fragments-cb-quiz-list.json
        // e.g. G-C3-Sentences-Fragments-khan-resources.json
        filePath = `../data/content/quizzes/${subject}/${chapter}-${type}.json`; 
        // Note: For Khan resources, if they are not quiz lists, they might be in a different folder.
        // This current structure assumes quiz/resource lists are under data/content/quizzes/
        // Adjust if Khan resources have a different path structure for their JSON lists.
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
                // Configure marked to allow HTML if you kept spans with styles in MD
                // For a stricter approach, you'd sanitize or rely purely on CSS for styling MD elements
                marked.setOptions({
                    gfm: true,
                    breaks: true, // Convert single line breaks to <br>
                    // sanitize: false, // Be cautious with this if MD source is untrusted. Default is false.
                                   // If true, it will strip HTML.
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
        contentDisplayArea.innerHTML = `<p style="color: red;">Sorry, couldn't load the content for "${chapterTitleFriendly} - ${type}".<br>Path: ${filePath}<br>Error: ${error.message}</p>`;
        viewerTitleElement.textContent = 'Content Load Error';
    }
});

function renderJsonData(jsonData, type, container) {
    let htmlContent = '';
    if (type === 'videos') {
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
        // Handles JSON like G-C3-Sentences-Fragments-cb-quiz-list.json or -khan-resources.json
        htmlContent = '<div class="quiz-list-container">';
        jsonData.forEach(categoryOrItem => {
            // Check if the jsonData is an array of categories or directly an array of items
            if (categoryOrItem.category && Array.isArray(categoryOrItem.items)) { // Categorized list (like Khan resources)
                htmlContent += `<div class="quiz-category"><h3>${categoryOrItem.category}</h3>`;
                categoryOrItem.items.forEach(item => {
                    htmlContent += renderQuizListItem(item);
                });
                htmlContent += `</div>`;
            } else { // Direct list of items (like CB quiz list)
                htmlContent += renderQuizListItem(categoryOrItem);
            }
        });
        htmlContent += '</div>';
    }
    // Add more 'else if' blocks here for other JSON types as needed
    else {
        htmlContent = '<p>JSON data rendering for this type is not yet implemented.</p><pre>' + JSON.stringify(jsonData, null, 2) + '</pre>';
    }
    container.innerHTML = htmlContent;
}

function renderQuizListItem(item) {
    let itemHtml = `<div class="quiz-item"><h4>`;
    let linkTarget = '#'; // Default if no proper target

    if (item.type === 'external_link') {
        linkTarget = item.target || '#';
        itemHtml += `<a href="${linkTarget}" target="_blank" rel="noopener noreferrer">${item.title || 'Untitled Resource'} 🔗</a>`;
    } else if (item.type === 'internal_quiz' || item.quizName) { // Handles internal quizzes
        // Construct link to quiz.html. Path is relative from /content/viewer.html to /quiz.html
       // linkTarget = `../../quiz.html?quiz_name=${item.quizName}`;//old
        linkTarget = `/SAT-Hub-Project/quiz.html?quiz_name=${item.quizName}`; // NEW
        if (item.source) linkTarget += `&source=${item.source}`; // Optional source param
        itemHtml += `<a href="${linkTarget}">${item.title || 'Untitled Quiz'}</a>`;
    } else { // Fallback for other types or if structure is different
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
