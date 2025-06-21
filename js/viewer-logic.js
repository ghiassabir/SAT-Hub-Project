console.log("--- js/viewer-logic.js SCRIPT LOADED ---");

// ... rest of your viewer-logic.js code (async function loadDynamicViewerContent()... DOMContentLoaded listener...)

async function loadDynamicViewerContent() {
    const contentDisplayArea = document.getElementById('content-display-area');
    if (!contentDisplayArea) {
        console.error("Content display area not found in viewer.html!");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const fileType = params.get('type');
    const subject = params.get('subject');
    const chapterFile = params.get('file'); // This is the direct filename

    contentDisplayArea.innerHTML = '<p>Loading content...</p>'; // Clear previous and show loading

    if (!fileType || !subject || !chapterFile) {
        contentDisplayArea.innerHTML = '<p style="color: red;">Error: Missing parameters (type, subject, file) in URL. Example: ?type=notes&subject=grammar&file=G-C3-Sentences-Fragments-notes.md</p>';
        return;
    }

    let contentPath = '';
    if (fileType === 'videos') {
        contentPath = `../data/content/videos/${subject}/${chapterFile}`;
    } else { // notes, cheatsheet, chaptertext are assumed .md
        contentPath = `../data/content/reading-materials/${subject}/${chapterFile}`;
    }
    
    console.log("Viewer (js/viewer-logic.js) attempting to load:", contentPath);

    try {
        const response = await fetch(contentPath);
        if (!response.ok) {
            throw new Error(`File not found: ${response.status} (tried ${contentPath})`);
        }
        const data = await response.text();

        if (chapterFile.endsWith('.md')) {
            if (typeof marked !== 'undefined') {
                contentDisplayArea.innerHTML = marked.parse(data);
            } else {
                contentDisplayArea.innerHTML = '<p style="color:red;">Markdown library (marked.js) not loaded. Make sure it is linked in viewer.html.</p>';
            }
        } else if (chapterFile.endsWith('.json')) {
            const jsonData = JSON.parse(data);
            let videoHtml = '<div class="video-list" style="display: flex; flex-direction: column; gap: 20px;">'; // Added gap
            jsonData.forEach(video => {
                videoHtml += `
                    <div class="video-item" style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h3 style="font-size: 1.25rem; color: #2a5266; margin-top: 0; margin-bottom: 10px;">${video.title}</h3>
                        <div style="position: relative; padding-bottom: 56.25%; /* 16:9 Aspect Ratio */ height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 5px;">
                            <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                                src="https://www.youtube.com/embed/${video.youtubeId}"
                                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen>
                            </iframe>
                        </div>
                        ${video.description ? `<p style="font-size: 0.9em; color: #555; margin-top: 10px;">${video.description}</p>` : ''}
                    </div>
                `;
            });
            videoHtml += '</div>';
            contentDisplayArea.innerHTML = videoHtml;
        } else {
            contentDisplayArea.innerHTML = '<p style="color:red;">Unsupported file type specified in URL.</p>';
        }
    } catch (error) {
        console.error('Error fetching/rendering content:', error);
        contentDisplayArea.innerHTML = `<p style="color: red;">Error loading content from ${contentPath}. ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // This specifically targets viewer.html
    if (document.getElementById('content-display-area') && document.title.includes("SAT Hub Content Viewer")) {
        console.log("--- DOMContentLoaded in viewer-logic.js - about to call loadDynamicViewerContent ---"); // ADD THIS
        loadDynamicViewerContent();
        loadDynamicViewerContent();
    }

    // For the footer year in viewer.html
    const currentYearViewerEl = document.getElementById('currentYearViewer');
    if (currentYearViewerEl) {
        currentYearViewerEl.textContent = new Date().getFullYear();
    }
});
