// --- script.js (Complete, Consolidated, and Corrected for Session Persistence - Part 1 of 6) ---

// --- Utility Functions (Define these FIRST) ---
function toggleModal(modalElement, show) {
    if (!modalElement) {
        return;
    }
    modalElement.classList.toggle('visible', show);
}

// Function to save the current session state to localStorage
function saveSessionState() {
    if (typeof localStorage === 'undefined') {
        console.warn("localStorage is not available. Session persistence disabled.");
        return;
    }
    const sessionState = {
        studentEmailForSubmission: studentEmailForSubmission,
        currentInteractionMode: currentInteractionMode,
        currentTestFlow: currentTestFlow,
        currentModuleIndex: currentModuleIndex,
        currentQuestionNumber: currentQuestionNumber,
        userAnswers: userAnswers,
        currentModuleTimeLeft: currentModuleTimeLeft,
        practiceQuizTimeElapsed: practiceQuizTimeElapsed,
        isTimerHidden: isTimerHidden,
        globalOriginPageId: globalOriginPageId,
        globalQuizSource: globalQuizSource,
    };
    try {
        const serializedState = JSON.stringify(sessionState);
        localStorage.setItem(SESSION_STORAGE_KEY, serializedState);
        console.log("DEBUG saveSessionState: Session state saved.");
    } catch (error) {
        console.error("Error saving session state to localStorage:", error);
    }
}

// Function to clear the saved session state from localStorage
function clearSessionState() {
    if (typeof localStorage === 'undefined') {
        console.warn("localStorage is not available. Cannot clear session state.");
        return;
    }
    try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        console.log("DEBUG clearSessionState: Session state cleared from localStorage.");
    } catch (error) {
        console.error("Error clearing session state from localStorage:", error);
    }
}


// --- GLOBAL CONFIGURATION & STATE ---
let currentQuizQuestions = [];
let currentTestFlow = [];
let currentView = 'home';
let currentModuleIndex = 0;
let currentQuestionNumber = 1;
let userAnswers = {};
let isTimerHidden = false;
let isCrossOutToolActive = false;
let isHighlightingActive = false;
let questionStartTime = 0;
let moduleTimerInterval;
let currentModuleTimeLeft = 0;
let currentModuleTimeUp = false;
let studentEmailForSubmission = null;
let currentInteractionMode = 'full_test';
let practiceQuizTimerInterval;
let practiceQuizTimeElapsed = 0;
let globalOriginPageId = null;
let globalQuizSource = null;

const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwneCF0xq9X-F-9AIxAiHpYFmRTErCzCPXlsWRloLRDWBGqwLEZC4NldCCAuND0jxUL/exec';
const SESSION_STORAGE_KEY = 'bluebookQuizSession';

const fullTestDefinitions = {
    "DT-T0": {
        flow: ["DT-T0-RW-M1", "DT-T0-RW-M2", "DT-T0-MT-M1", "DT-T0-MT-M2"],
        name: "Digital SAT Practice Test 0 Preview"
    },
    "CBT-T4": { flow: ["CBT-T4-RW-M1", "CBT-T4-RW-M2", "CBT-T4-MT-M1", "CBT-T4-MT-M2"], name: "Digital SAT Practice Test 4" },
    // Add other test definitions here...
};

const moduleMetadata = {
    "DT-T0-RW-M1": { name: "Reading & Writing - Module 1 (Diagnostic)", type: "RW", directions: "R&W M1 Directions...", spr_directions: null, spr_examples_table: null },
    "DT-T0-RW-M2": { name: "Reading & Writing - Module 2 (Diagnostic)", type: "RW", directions: "R&W M2 Directions...", spr_directions: null, spr_examples_table: null },
    "DT-T0-MT-M1": { name: "Math - Module 1 (Diagnostic)", type: "Math", directions: "Math M1 Directions...", passageText: null, spr_directions: `<h3>Student-produced response directions</h3><ul><li>If you find <strong>more than one correct answer</strong>, enter only one answer.</li><li>You can enter up to 5 characters for a <strong>positive</strong> answer and up to 6 characters (including the negative sign) for a <strong>negative</strong> answer.</li><li>If your answer is a <strong>fraction</strong> that doesn’t fit in the provided space, enter the decimal equivalent.</li><li>If your answer is a <strong>decimal</strong> that doesn’t fit in the provided space, enter it by truncating or rounding at the fourth digit.</li><li>If your answer is a <strong>mixed number</strong> (such as 3 <span style="font-size: 0.7em; vertical-align: super;">1</span>/<span style="font-size: 0.7em; vertical-align: sub;">2</span>), enter it as an improper fraction (7/2) or its decimal equivalent (3.5).</li><li>Don’t enter <strong>symbols</strong> such as a percent sign, comma, or dollar sign.</li></ul>`, spr_examples_table: `<table class="spr-examples-table"><thead><tr><th>Answer</th><th>Acceptable ways to enter answer</th><th>Unacceptable: will NOT receive credit</th></tr></thead><tbody><tr><td>3.5</td><td>3.5<br/>7/2</td><td>3 1/2</td></tr><tr><td>2/3</td><td>2/3<br/>.666<br/>.667</td><td>0.66<br/>0.67</td></tr><tr><td>-15</td><td>-15</td><td></td></tr></tbody></table>` },
    "DT-T0-MT-M2": { name: "Math - Module 2 (Diagnostic)", type: "Math", directions: "Math M2 Directions...", passageText: null, spr_directions: `<h3>Student-produced response directions</h3><ul><li>If you find <strong>more than one correct answer</strong>, enter only one answer.</li><li>You can enter up to 5 characters for a <strong>positive</strong> answer and up to 6 characters (including the negative sign) for a <strong>negative</strong> answer.</li><li>If your answer is a <strong>fraction</strong> that doesn’t fit in the provided space, enter the decimal equivalent.</li><li>If your answer is a <strong>decimal</strong> that doesn’t fit in the provided space, enter it by truncating or rounding at the fourth digit.</li><li>If your answer is a <strong>mixed number</strong> (such as 3 <span style="font-size: 0.7em; vertical-align: super;">1</span>/<span style="font-size: 0.7em; vertical-align: sub;">2</span>), enter it as an improper fraction (7/2) or its decimal equivalent (3.5).</li><li>Don’t enter <strong>symbols</strong> such as a percent sign, comma, or dollar sign.</li></ul>`, spr_examples_table: `<table class="spr-examples-table"><thead><tr><th>Answer</th><th>Acceptable ways to enter answer</th><th>Unacceptable: will NOT receive credit</th></tr></thead><tbody><tr><td>3.5</td><td>3.5<br/>7/2</td><td>3 1/2</td></tr><tr><td>2/3</td><td>2/3<br/>.666<br/>.667</td><td>0.66<br/>0.67</td></tr><tr><td>-15</td><td>-15</td><td></td></tr></tbody></table>` },
    "CBT-T4-RW-M1": { name: "CBT Test 4: R&W Module 1", type: "RW", durationSeconds: 1920, directions: "Directions for CBT-T4 R&W M1..." },
    "CBT-T4-RW-M2": { name: "CBT Test 4: R&W Module 2", type: "RW", durationSeconds: 1920, directions: "Directions for CBT-T4 R&W M2..." },
    "CBT-T4-MT-M1": { name: "CBT Test 4: Math Module 1", type: "Math", durationSeconds: 2100, directions: "Directions for CBT-T4 Math M1...", spr_directions: `<h3>SPR Directions...</h3>`, spr_examples_table: `<table class="spr-examples-table">...</table>` },
    "CBT-T4-MT-M2": { name: "CBT Test 4: Math Module 2", type: "Math", durationSeconds: 2100, directions: "Directions for CBT-T4 Math M2...", spr_directions: `<h3>SPR Directions...</h3>`, spr_examples_table: `<table class="spr-examples-table">...</table>` },
    "SampleMathQuiz": { name: "Sample Math Practice", type: "Math", directions: "Solve these math problems.", spr_directions: `<h3>SPR Directions...</h3>`, spr_examples_table: `<table class="spr-examples-table">...</table>` }
};

const GITHUB_JSON_BASE_URL = 'https://raw.githubusercontent.com/ghiassabir/Bluebook-UI-UX-with-json-real-data-/main/data/json/';

async function loadQuizData(quizName) {
    let actualJsonFileToLoad = quizName;
    const url = `${GITHUB_JSON_BASE_URL}${actualJsonFileToLoad}.json`;
    console.log(`DEBUG loadQuizData: Fetching from: ${url} (for requested quizName: ${quizName})`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${actualJsonFileToLoad}.json`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error(`Data for ${actualJsonFileToLoad}.json is not an array. Check JSON structure.`);
        }
        currentQuizQuestions = data;
        if (data.length > 0) {
            console.log("DEBUG loadQuizData: First question object from fetched JSON:", JSON.stringify(data[0], null, 2));
        }
        console.log(`DEBUG loadQuizData: Loaded ${currentQuizQuestions.length}q for ${quizName} (from ${actualJsonFileToLoad}.json).`);
        return true;
    } catch (error) {
        console.error("Error loading quiz data for " + quizName + ":", error);
        alert(`Failed to load data for ${quizName} (tried ${actualJsonFileToLoad}.json): ${error.message}.`);
        currentQuizQuestions = [];
        return false;
    }
}

// --- DOM Elements ---
const allAppViews = document.querySelectorAll('.app-view');
const homeViewEl = document.getElementById('home-view');
const testInterfaceViewEl = document.getElementById('test-interface-view');
const moduleOverViewEl = document.getElementById('module-over-view');
const finishedViewEl = document.getElementById('finished-view');
const reviewPageViewEl = document.getElementById('review-page-view');
const confettiCanvas = document.getElementById('confetti-canvas');
const returnToHomeBtn = document.getElementById('return-to-home-btn');
const reviewPageSectionName = document.getElementById('review-page-section-name');
const reviewPageQNavGrid = document.getElementById('review-page-qnav-grid');
const reviewDirectionsBtn = document.getElementById('review-directions-btn');
const reviewTimerText = document.getElementById('review-timer-text');
const reviewTimerClockIcon = document.getElementById('review-timer-clock-icon');
const reviewTimerToggleBtn = document.getElementById('review-timer-toggle-btn');
const reviewBackBtnFooter = document.getElementById('review-back-btn-footer');
const reviewNextBtnFooter = document.getElementById('review-next-btn-footer');
const mainContentAreaDynamic = document.getElementById('main-content-area-dynamic');
const passagePane = document.getElementById('passage-pane');
const sprInstructionsPane = document.getElementById('spr-instructions-pane');
const sprInstructionsContent = document.getElementById('spr-instructions-content');
const paneDivider = document.getElementById('pane-divider-draggable');
const questionPane = document.getElementById('question-pane');
const highlightsNotesBtn = document.getElementById('highlights-notes-btn');
const calculatorBtnHeader = document.getElementById('calculator-btn');
const referenceBtnHeader = document.getElementById('reference-btn');
const answerOptionsMainEl = document.getElementById('answer-options-main');
const sprInputContainerMain = document.getElementById('spr-input-container-main');
const sprInputFieldMain = document.getElementById('spr-input-field-main');
const sprAnswerPreviewMain = document.getElementById('spr-answer-preview-main');
const calculatorOverlay = document.getElementById('calculator-overlay-main');
const calculatorHeaderDraggable = document.getElementById('calculator-header-draggable');
const calculatorCloseBtn = document.getElementById('calculator-overlay-close-btn');
const referenceSheetPanel = document.getElementById('reference-sheet-panel-main');
const referenceSheetCloseBtn = document.getElementById('reference-sheet-close-btn');
const crossOutToolBtnMain = document.getElementById('cross-out-tool-btn-main');
const sectionTitleHeader = document.getElementById('section-title-header');
const passageContentEl = document.getElementById('passage-content');
const questionTextMainEl = document.getElementById('question-text-main');
const questionNumberBoxMainEl = document.getElementById('question-number-box-main');
const markReviewCheckboxMain = document.getElementById('mark-review-checkbox-main');
const flagIconMain = document.getElementById('flag-icon-main');
const qNavBtnFooter = document.getElementById('qNavBtnFooter');
const currentQFooterEl = document.getElementById('current-q-footer');
const totalQFooterEl = document.getElementById('total-q-footer');
const backBtnFooter = document.getElementById('back-btn-footer');
const nextBtnFooter = document.getElementById('next-btn-footer');
const directionsBtn = document.getElementById('directions-btn');
const directionsModal = document.getElementById('directions-modal');
const directionsModalTitle = document.getElementById('directions-modal-title');
const directionsModalText = document.getElementById('directions-modal-text');
const directionsModalCloseBtn = document.getElementById('directions-modal-close-btn');
const qNavPopup = document.getElementById('qnav-popup');
const qNavTitle = document.getElementById('qnav-title');
const qNavGridMain = document.getElementById('qnav-grid-main');
const qNavCloseBtn = document.getElementById('qnav-close-btn');
const qNavGotoReviewBtn = document.getElementById('qnav-goto-review-btn');
const timerTextEl = document.getElementById('timer-text');
const timerClockIconEl = document.getElementById('timer-clock-icon');
const timerToggleBtn = document.getElementById('timer-toggle-btn');
const moreBtn = document.getElementById('more-btn');
const moreMenuDropdown = document.getElementById('more-menu-dropdown');
const moreUnscheduledBreakBtn = document.getElementById('more-unscheduled-break');
const moreExitExamBtn = document.getElementById('more-exit-exam');
const unscheduledBreakConfirmModal = document.getElementById('unscheduled-break-confirm-modal');
const understandLoseTimeCheckbox = document.getElementById('understand-lose-time-checkbox');
const unscheduledBreakConfirmBtn = document.getElementById('unscheduled-break-confirm-btn');
const unscheduledBreakCancelBtn = document.getElementById('unscheduled-break-cancel-btn');
const exitExamConfirmModal = document.getElementById('exit-exam-confirm-modal');
const exitExamConfirmBtn = document.getElementById('exit-exam-confirm-btn');
const exitExamCancelBtn = document.getElementById('exit-exam-cancel-btn');
const manualBreakViewEl = document.getElementById('manual-break-view');
const continueAfterBreakBtn = document.getElementById('continue-after-break-btn');
const emailInputViewEl = document.getElementById('email-input-view');
const studentEmailField = document.getElementById('student-email-field');
const submitEmailBtn = document.getElementById('submit-email-btn');

// --- Helper Functions ---
function initializeStudentIdentifier() {
    const storedEmail = localStorage.getItem('bluebookStudentEmail');
    if (storedEmail && storedEmail.trim() !== "" && storedEmail.includes('@')) {
        studentEmailForSubmission = storedEmail;
        console.log(`Student identifier initialized from localStorage: ${studentEmailForSubmission}`);
        return true;
    } else {
        studentEmailForSubmission = null;
        console.log(`No valid student identifier found in localStorage. Prompting for input.`);
        return false;
    }
}

function getCurrentModule() {
    if (currentTestFlow && currentTestFlow.length > 0 && currentModuleIndex < currentTestFlow.length) {
        const currentQuizName = currentTestFlow[currentModuleIndex];
        return moduleMetadata[currentQuizName] || null;
    }
    return null;
}

function getCurrentQuestionData() {
    if (currentQuizQuestions && currentQuizQuestions.length > 0 && currentQuestionNumber > 0 && currentQuestionNumber <= currentQuizQuestions.length) {
        return currentQuizQuestions[currentQuestionNumber - 1];
    }
    return null;
}

function getAnswerStateKey(moduleIdx = currentModuleIndex, qNum = currentQuestionNumber) {
    return `${moduleIdx}-${qNum}`;
}

function getAnswerState(moduleIdx = currentModuleIndex, qNum = currentQuestionNumber) {
    const key = getAnswerStateKey(moduleIdx, qNum);
    if (!userAnswers[key]) {
        const currentQuizNameForState = (currentTestFlow && currentTestFlow[moduleIdx]) ? currentTestFlow[moduleIdx] : "UNKNOWN_QUIZ";
        const questionDetails = (moduleIdx === currentModuleIndex && currentQuizQuestions && currentQuizQuestions[qNum - 1])
                               ? currentQuizQuestions[qNum - 1]
                               : null;
        userAnswers[key] = {
            selected: null, spr_answer: '', marked: false, crossedOut: [], timeSpent: 0,
            q_id: questionDetails ? questionDetails.question_id : `M${moduleIdx}-Q${qNum}-tmp`,
            correct_ans: questionDetails ? questionDetails.correct_answer : null,
            question_type_from_json: questionDetails ? questionDetails.question_type : null,
            quizName_from_flow: currentQuizNameForState,
            selectionChanges: 0
        };
    }
    // This ensures details are populated if they were missing at creation
    if (userAnswers[key]) {
        const answerState = userAnswers[key];
        if (answerState.q_id && answerState.q_id.endsWith('-tmp') || !answerState.correct_ans || (answerState.quizName_from_flow && answerState.quizName_from_flow.includes("UNKNOWN"))) {
            const questionDetails = (moduleIdx === currentModuleIndex && currentQuizQuestions && currentQuizQuestions[qNum - 1])
                                ? currentQuizQuestions[qNum - 1]
                                : null;
            if (questionDetails) {
                answerState.q_id = questionDetails.question_id;
                answerState.correct_ans = questionDetails.correct_answer;
                answerState.question_type_from_json = questionDetails.question_type;
            }
            if(currentTestFlow && currentTestFlow[moduleIdx]) {
                 answerState.quizName_from_flow = currentTestFlow[moduleIdx];
            }
        }
    }
    return userAnswers[key];
}

function recordTimeOnCurrentQuestion() {
    if (questionStartTime > 0 && currentQuizQuestions && currentQuizQuestions.length > 0 && currentQuestionNumber > 0 && currentQuestionNumber <= currentQuizQuestions.length) {
        if (currentQuizQuestions[currentQuestionNumber - 1]) {
            const endTime = Date.now();
            const timeSpentSeconds = (endTime - questionStartTime) / 1000;
            const answerState = getAnswerState(currentModuleIndex, currentQuestionNumber);
            if (answerState) {
                answerState.timeSpent = (parseFloat(answerState.timeSpent) || 0) + timeSpentSeconds;
            }
        }
    }
    questionStartTime = 0;
}

function updateModuleTimerDisplay(seconds) {
    if (!timerTextEl) return;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const displayString = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    timerTextEl.textContent = displayString;
    if (reviewTimerText) reviewTimerText.textContent = displayString;
}

function startModuleTimer(durationSeconds) {
    if (practiceQuizTimerInterval) clearInterval(practiceQuizTimerInterval);
    if (moduleTimerInterval) clearInterval(moduleTimerInterval);
    currentModuleTimeLeft = durationSeconds;
    currentModuleTimeUp = false;
    updateModuleTimerDisplay(currentModuleTimeLeft);
    updateNavigation();
    const currentQuizName = currentTestFlow[currentModuleIndex] || "Current Module";
    console.log(`Module timer (countdown) started for ${durationSeconds} seconds for module ${currentQuizName}.`);
    moduleTimerInterval = setInterval(() => {
        currentModuleTimeLeft--;
        updateModuleTimerDisplay(currentModuleTimeLeft);
        if (currentModuleTimeLeft <= 0) {
            clearInterval(moduleTimerInterval);
            currentModuleTimeLeft = 0;
            currentModuleTimeUp = true;
            updateModuleTimerDisplay(currentModuleTimeLeft);
            const completedModuleIndexForTimer = currentModuleIndex;
            recordTimeOnCurrentQuestion();
            submitCurrentModuleData(completedModuleIndexForTimer, (completedModuleIndexForTimer === currentTestFlow.length - 1 && currentInteractionMode === 'full_test'));
            alert("Time for this module is up! You will be taken to the review page.");
            if (currentView !== 'review-page-view') {
                showView('review-page-view');
            }
            updateNavigation();
        }
    }, 1000);
}

function updatePracticeQuizTimerDisplay(seconds) {
    if (!timerTextEl) return;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const displayString = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    timerTextEl.textContent = displayString;
    if (reviewTimerText && reviewTimerText !== timerTextEl) {
        reviewTimerText.textContent = displayString;
    }
}

function startPracticeQuizTimer() {
    if (moduleTimerInterval) clearInterval(moduleTimerInterval);
    if (practiceQuizTimerInterval) clearInterval(practiceQuizTimerInterval);
    practiceQuizTimeElapsed = 0;
    updatePracticeQuizTimerDisplay(practiceQuizTimeElapsed);
    console.log("Practice quiz timer (upward counting) started for quiz: " + (currentTestFlow[0] || "Unknown Quiz"));
    practiceQuizTimerInterval = setInterval(() => {
        practiceQuizTimeElapsed++;
        updatePracticeQuizTimerDisplay(practiceQuizTimeElapsed);
    }, 1000);
}

function populateQNavGrid() {
    if (!qNavGridMain || !qNavTitle) { console.error("QNav grid or title element not found for populating."); return; }
    qNavGridMain.innerHTML = '';
    const moduleInfo = getCurrentModule();
    if (!moduleInfo || !currentQuizQuestions || currentQuizQuestions.length === 0) {
        qNavTitle.textContent = "Questions";
        console.warn("populateQNavGrid: No module info or questions for current module.");
        return;
    }
    qNavTitle.textContent = `Section ${currentModuleIndex + 1}: ${moduleInfo.name} Questions`;
    const totalQuestionsInModule = currentQuizQuestions.length;
    for (let i = 1; i <= totalQuestionsInModule; i++) {
        const qState = getAnswerState(currentModuleIndex, i);
        const questionDataForButton = currentQuizQuestions[i - 1];
        const btn = document.createElement('button');
        btn.className = 'qnav-grid-btn';
        if (i === currentQuestionNumber) {
            btn.classList.add('current');
            btn.innerHTML = `<span class="q-num-current-dot"></span>`;
        } else {
            btn.textContent = questionDataForButton?.question_number || i;
        }
        let isUnanswered = true;
        if (questionDataForButton) {
            if (questionDataForButton.question_type === 'student_produced_response') {
                isUnanswered = !qState.spr_answer;
            } else {
                isUnanswered = !qState.selected;
            }
        }
        if (isUnanswered && i !== currentQuestionNumber) btn.classList.add('unanswered');
        if (qState.marked) btn.innerHTML += `<span class="review-flag-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg></span>`;
        btn.dataset.question = i;
        btn.addEventListener('click', () => {
            recordTimeOnCurrentQuestion();
            saveSessionState();
            currentQuestionNumber = parseInt(btn.dataset.question);
            isCrossOutToolActive = false;
            isHighlightingActive = false; if(highlightsNotesBtn) highlightsNotesBtn.classList.remove('active');
            loadQuestion();
            toggleModal(qNavPopup, false);
        });
        qNavGridMain.appendChild(btn);
    }
}

function renderReviewPage() {
    if (!reviewPageViewEl || !reviewPageViewEl.classList.contains('active')) return;
    console.log("DEBUG renderReviewPage: Rendering for module index", currentModuleIndex);
    const moduleInfo = getCurrentModule();
    if(!moduleInfo || !currentQuizQuestions || currentQuizQuestions.length === 0) {
         if(reviewPageSectionName) reviewPageSectionName.textContent = "Section Review";
         if(reviewPageQNavGrid) reviewPageQNavGrid.innerHTML = '<p>No questions to review for this module.</p>';
         console.warn("renderReviewPage: No module info or questions for current module.");
        updateNavigation();
        return;
    }
    if(reviewPageSectionName) reviewPageSectionName.textContent = `Section ${currentModuleIndex + 1}: ${moduleInfo.name} Questions`;
    if (currentInteractionMode === 'full_test') {
        updateModuleTimerDisplay(currentModuleTimeLeft);
    } else {
        updatePracticeQuizTimerDisplay(practiceQuizTimeElapsed);
    }
    if(timerClockIconEl && reviewTimerClockIcon) reviewTimerClockIcon.className = timerClockIconEl.className;
    if(timerToggleBtn && reviewTimerToggleBtn) reviewTimerToggleBtn.textContent = timerToggleBtn.textContent;
    if(reviewPageQNavGrid) reviewPageQNavGrid.innerHTML = ''; else { console.error("Review page QNav grid not found."); return;}
    const totalQuestionsInModule = currentQuizQuestions.length;
    for (let i = 1; i <= totalQuestionsInModule; i++) {
        const qState = getAnswerState(currentModuleIndex, i);
        const qDataForBtn = currentQuizQuestions[i-1];
        const btn = document.createElement('button');
        btn.className = 'qnav-grid-btn';
        btn.textContent = qDataForBtn?.question_number || i;
        let isUnanswered = true;
        if (qDataForBtn) {
            if (qDataForBtn.question_type === 'student_produced_response') {
                isUnanswered = !qState.spr_answer;
            } else {
                isUnanswered = !qState.selected;
            }
        }
        if (isUnanswered) btn.classList.add('unanswered');
        if (qState.marked) {
            btn.innerHTML += `<span class="review-flag-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg></span>`;
        }
        btn.dataset.question = i;
        btn.addEventListener('click', () => {
            currentQuestionNumber = parseInt(btn.dataset.question);
            showView('test-interface-view');
        });
        reviewPageQNavGrid.appendChild(btn);
    }
    updateNavigation();
}

function startConfetti() {
    const canvas = confettiCanvas; if (!canvas) return;
    const ctx = canvas.getContext('2d'); canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const colors = ["#facc15", "#ef4444", "#2563eb", "#10b981", "#ec4899"];
    class Particle { constructor(x, y) { this.x = x; this.y = y; this.size = Math.random() * 7 + 3; this.weight = Math.random() * 1.5 + 0.5; this.directionX = (Math.random() * 2 - 1) * 2; this.color = colors[Math.floor(Math.random() * colors.length)]; } update() { this.y += this.weight; this.x += this.directionX; if (this.y > canvas.height) { this.y = 0 - this.size; this.x = Math.random() * canvas.width; } if (this.x > canvas.width) { this.x = 0 - this.size; } if (this.x < 0 - this.size ) { this.x = canvas.width; } } draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.rect(this.x, this.y, this.size, this.size * 1.5); ctx.closePath(); ctx.fill(); } }
    function initConfetti() { confettiParticles.length = 0; for (let i = 0; i < 150; i++) confettiParticles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height - canvas.height)); }
    function animateConfetti() { if(!finishedViewEl || !finishedViewEl.classList.contains('active')) return; ctx.clearRect(0,0,canvas.width, canvas.height); confettiParticles.forEach(p => { p.update(); p.draw(); }); confettiAnimationId = requestAnimationFrame(animateConfetti); }
    if (finishedViewEl && finishedViewEl.classList.contains('active')) { initConfetti(); animateConfetti(); }
}

function stopConfetti() { if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId); if (confettiCanvas && confettiCanvas.getContext('2d')) confettiCanvas.getContext('2d').clearRect(0,0,confettiCanvas.width, confettiCanvas.height); }

function handleTimerToggle(textEl, iconEl, btnEl) {
    if (!textEl || !iconEl || !btnEl) { return; }
    isTimerHidden = !isTimerHidden;
    textEl.classList.toggle('hidden', isTimerHidden);
    iconEl.classList.toggle('hidden', !isTimerHidden);
    btnEl.textContent = isTimerHidden ? '[Show]' : '[Hide]';
}

// --- View Management ---
function showView(viewId) {
    console.log(`DEBUG showView: Switching to view: ${viewId}. Mode: ${currentInteractionMode}, ModuleIdx: ${currentModuleIndex}, Q#: ${currentQuestionNumber}`);
    
    currentView = viewId;
    allAppViews.forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
    } else {
        console.error(`View not found for ID: ${viewId}`);
        return;
    }

    if (viewId !== 'test-interface-view' && viewId !== 'review-page-view' &&
        viewId !== 'module-over-view' && viewId !== 'manual-break-view') {

        if (currentView === 'test-interface-view' || currentView === 'review-page-view') {
            saveSessionState();
        }

        if (moduleTimerInterval) {
            clearInterval(moduleTimerInterval);
            console.log("Module countdown timer stopped: Navigating away from test context.");
        }
        if (practiceQuizTimerInterval) {
            clearInterval(practiceQuizTimerInterval);
            console.log("Practice quiz (upward) timer stopped: Navigating away from test context.");
        }
    }

    if (viewId === 'test-interface-view') {
        if(qNavBtnFooter) qNavBtnFooter.style.display = 'flex';
        if(backBtnFooter) backBtnFooter.style.display = 'inline-block';
        if(nextBtnFooter) nextBtnFooter.style.display = 'inline-block';
        console.log(`DEBUG showView (test-interface): About to call loadQuestion. CMI: ${currentModuleIndex}, CQN: ${currentQuestionNumber}, CQQ.length: ${currentQuizQuestions ? currentQuizQuestions.length : 'N/A'}`);
        loadQuestion();
    } else if (viewId === 'review-page-view') {
        if(qNavBtnFooter) qNavBtnFooter.style.display = 'none';
        renderReviewPage();
    } else if (viewId === 'finished-view') {
        startConfetti();
        if (moduleTimerInterval) clearInterval(moduleTimerInterval);
        if (practiceQuizTimerInterval) clearInterval(practiceQuizTimerInterval);
    } else if (viewId === 'home-view') {
        stopConfetti();
        currentTestFlow = []; currentQuizQuestions = [];
        currentModuleIndex = 0; currentQuestionNumber = 1;
        userAnswers = {};
        currentInteractionMode = 'full_test';
        if (moduleTimerInterval) clearInterval(moduleTimerInterval);
        if (practiceQuizTimerInterval) clearInterval(practiceQuizTimerInterval);
        updateModuleTimerDisplay(0);
        updatePracticeQuizTimerDisplay(0);
    } else if (viewId === 'manual-break-view') {
        console.log("DEBUG showView: Now in manual break view. Current module index for NEXT module is " + currentModuleIndex);
        if (moduleTimerInterval) clearInterval(moduleTimerInterval);
        if (practiceQuizTimerInterval) clearInterval(practiceQuizTimerInterval);
    } else if (viewId === 'email-input-view') {
        console.log("DEBUG showView: Displaying email input view.");
    }
    updateNavigation();
}


// --- Core UI Update `loadQuestion()` ---
function loadQuestion() {
    console.log(`DEBUG loadQuestion: CALLED. CMI: ${currentModuleIndex}, CQN: ${currentQuestionNumber}, Mode: ${currentInteractionMode}`);
    
    if (!testInterfaceViewEl.classList.contains('active')) {
        console.warn("DEBUG loadQuestion: Not in test-interface-view, exiting.");
        return;
    }
    
    const currentModuleInfo = getCurrentModule();
    const currentQuestionDetails = getCurrentQuestionData();

    if (!currentModuleInfo || !currentQuestionDetails) {
        console.error("loadQuestion: ModuleInfo or Question data is null/undefined. Aborting question load.");
        if (questionTextMainEl) questionTextMainEl.innerHTML = "<p>Error: Critical data missing.</p>";
        if (answerOptionsMainEl) answerOptionsMainEl.innerHTML = "";
        updateNavigation();
        return;
    }
    
    const answerState = getAnswerState();
    if (!answerState) {
        console.error("CRITICAL: answerState is null in loadQuestion. This should not happen.");
        if (questionTextMainEl) questionTextMainEl.innerHTML = "<p>Error: Internal state error.</p>";
        updateNavigation();
        return;
    }
    questionStartTime = Date.now();

    if(sectionTitleHeader) sectionTitleHeader.textContent = `Section ${currentModuleIndex + 1}: ${currentModuleInfo.name}`;
    if(questionNumberBoxMainEl) questionNumberBoxMainEl.textContent = currentQuestionDetails.question_number || currentQuestionNumber;
    
    const isMathTypeModule = currentModuleInfo.type === "Math";
    if(highlightsNotesBtn) highlightsNotesBtn.classList.toggle('hidden', isMathTypeModule);
    if(calculatorBtnHeader) calculatorBtnHeader.classList.toggle('hidden', !isMathTypeModule);
    if(referenceBtnHeader) referenceBtnHeader.classList.toggle('hidden', !isMathTypeModule);
    if(crossOutToolBtnMain) crossOutToolBtnMain.classList.toggle('hidden', currentQuestionDetails.question_type === 'student_produced_response');

    if(markReviewCheckboxMain) markReviewCheckboxMain.checked = answerState.marked;
    if(flagIconMain) {
        flagIconMain.style.fill = answerState.marked ? 'var(--bluebook-red-flag)' : 'none';
        flagIconMain.style.color = answerState.marked ? 'var(--bluebook-red-flag)' : '#9ca3af';
    }

    if(mainContentAreaDynamic) mainContentAreaDynamic.classList.toggle('cross-out-active', isCrossOutToolActive && currentQuestionDetails.question_type !== 'student_produced_response');
    if(crossOutToolBtnMain) crossOutToolBtnMain.classList.toggle('active', isCrossOutToolActive && currentQuestionDetails.question_type !== 'student_produced_response');

    passagePane.style.display = 'none';
    if (passageContentEl) passageContentEl.innerHTML = '';
    sprInstructionsPane.style.display = 'none';
    if (sprInstructionsContent) sprInstructionsContent.innerHTML = '';
    if (questionTextMainEl) questionTextMainEl.innerHTML = '';
    if (answerOptionsMainEl) answerOptionsMainEl.innerHTML = '';
    paneDivider.style.display = 'none';
    mainContentAreaDynamic.classList.remove('single-pane');
    answerOptionsMainEl.style.display = 'none';
    sprInputContainerMain.style.display = 'none';

    const passageTextFromJson = currentQuestionDetails.passage_content;
    const stemTextFromJson = currentQuestionDetails.question_stem;
    console.log("DEBUG loadQuestion: passageTextFromJson:", passageTextFromJson ? passageTextFromJson.substring(0,30)+"..." : "null/empty");
    console.log("DEBUG loadQuestion: stemTextFromJson:", stemTextFromJson ? stemTextFromJson.substring(0,30)+"..." : "null/empty");

    if (currentQuestionDetails.question_type === 'student_produced_response') {
        mainContentAreaDynamic.classList.remove('single-pane');
        sprInstructionsPane.style.display = 'flex';
        passagePane.style.display = 'none';
        paneDivider.style.display = 'block';
        if(sprInstructionsContent) {
            sprInstructionsContent.innerHTML = (currentModuleInfo.spr_directions || 'SPR Directions Missing') + (currentModuleInfo.spr_examples_table || '');
        }
        if(questionTextMainEl) {
            questionTextMainEl.innerHTML = stemTextFromJson ? `<p>${stemTextFromJson}</p>` : '<p>Question stem missing.</p>';
        }
        sprInputContainerMain.style.display = 'block';
        if(sprInputFieldMain) sprInputFieldMain.value = answerState.spr_answer || '';
        if(sprAnswerPreviewMain) sprAnswerPreviewMain.textContent = `Answer Preview: ${answerState.spr_answer || ''}`;
        answerOptionsMainEl.style.display = 'none';
    } else if (currentQuestionDetails.question_type && currentQuestionDetails.question_type.includes('multiple_choice')) {
        if (passageTextFromJson && passageTextFromJson.trim() !== "") {
            mainContentAreaDynamic.classList.remove('single-pane');
            passagePane.style.display = 'flex';
            paneDivider.style.display = 'block';
            if(passageContentEl) passageContentEl.innerHTML = passageTextFromJson;
            if(questionTextMainEl) questionTextMainEl.innerHTML = stemTextFromJson ? `<p>${stemTextFromJson}</p>` : '<p>Question stem missing.</p>';
        } else {
            mainContentAreaDynamic.classList.add('single-pane');
            passagePane.style.display = 'none';
            sprInstructionsPane.style.display = 'none';
            paneDivider.style.display = 'none';
            if(questionTextMainEl) questionTextMainEl.innerHTML = stemTextFromJson ? `<p>${stemTextFromJson}</p>` : '<p>Question content missing.</p>';
        }
        answerOptionsMainEl.style.display = 'flex';
        sprInputContainerMain.style.display = 'none';

        if (answerOptionsMainEl) answerOptionsMainEl.innerHTML = '';
        const options = {};
        if (currentQuestionDetails.option_a !== undefined && currentQuestionDetails.option_a !== null) options['A'] = currentQuestionDetails.option_a;
        if (currentQuestionDetails.option_b !== undefined && currentQuestionDetails.option_b !== null) options['B'] = currentQuestionDetails.option_b;
        if (currentQuestionDetails.option_c !== undefined && currentQuestionDetails.option_c !== null) options['C'] = currentQuestionDetails.option_c;
        if (currentQuestionDetails.option_d !== undefined && currentQuestionDetails.option_d !== null) options['D'] = currentQuestionDetails.option_d;
        if (currentQuestionDetails.option_e !== undefined && currentQuestionDetails.option_e !== null && String(currentQuestionDetails.option_e).trim() !== "") options['E'] = currentQuestionDetails.option_e;

        for (const [key, value] of Object.entries(options)) {
            const isSelected = (answerState.selected === value);
            const isCrossedOut = answerState.crossedOut.includes(key);
            const containerDiv = document.createElement('div');
            containerDiv.className = 'answer-option-container';
            containerDiv.dataset.optionKey = key;
            const optionDiv = document.createElement('div');
            optionDiv.className = 'answer-option';
            if (isSelected && !isCrossedOut) optionDiv.classList.add('selected');
            if (isCrossedOut) optionDiv.classList.add('crossed-out');
            const answerLetterDiv = document.createElement('div');
            answerLetterDiv.className = 'answer-letter';
            if (isSelected && !isCrossedOut) answerLetterDiv.classList.add('selected');
            answerLetterDiv.textContent = key;
            const answerTextSpan = document.createElement('span');
            answerTextSpan.className = 'answer-text';
            if (isCrossedOut) answerTextSpan.classList.add('text-dimmed-for-crossout');
            answerTextSpan.innerHTML = value;
            optionDiv.appendChild(answerLetterDiv);
            optionDiv.appendChild(answerTextSpan);
            containerDiv.appendChild(optionDiv);
            if (isCrossOutToolActive && !isCrossedOut) {
                const crossOutBtnIndividual = document.createElement('button');
                crossOutBtnIndividual.className = 'individual-cross-out-btn';
                crossOutBtnIndividual.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                crossOutBtnIndividual.title = `Cross out option ${key}`;
                crossOutBtnIndividual.dataset.action = 'cross-out-individual';
                containerDiv.appendChild(crossOutBtnIndividual);
            } else if (isCrossedOut) {
                const undoBtn = document.createElement('button');
                undoBtn.className = 'undo-cross-out-btn';
                undoBtn.textContent = 'Undo';
                undoBtn.title = `Undo cross out for option ${key}`;
                undoBtn.dataset.action = 'undo-cross-out';
                containerDiv.appendChild(undoBtn);
            }
            if (answerOptionsMainEl) answerOptionsMainEl.appendChild(containerDiv);
        }
    } else {
        console.warn("loadQuestion: Unhandled question type or configuration:", currentQuestionDetails.question_type);
        if(questionTextMainEl) questionTextMainEl.innerHTML = `<p>Error: Unknown question type.</p>`;
        mainContentAreaDynamic.classList.add('single-pane');
    }

    if (typeof MathJax !== "undefined") {
        if (MathJax.typesetPromise) {
            MathJax.typesetPromise([passageContentEl, questionTextMainEl, answerOptionsMainEl, sprInstructionsContent])
                .catch(function (err) { console.error('MathJax Typesetting Error:', err); });
        } else if (MathJax.startup && MathJax.startup.promise) {
            MathJax.startup.promise.then(() => {
                if (MathJax.typesetPromise) {
                     MathJax.typesetPromise([passageContentEl, questionTextMainEl, answerOptionsMainEl, sprInstructionsContent])
                        .catch(function (err) { console.error('MathJax Typesetting Error (after startup.promise):', err); });
                } else {
                    console.error("MathJax.typesetPromise still not available after startup.promise resolved.");
                }
            }).catch(err => console.error("Error waiting for MathJax startup:", err));
        } else {
            console.warn("MathJax is defined, but neither typesetPromise nor startup.promise is available. Typesetting may fail.");
            setTimeout(() => {
                if (typeof MathJax !== "undefined" && MathJax.typesetPromise) {
                    MathJax.typesetPromise([passageContentEl, questionTextMainEl, answerOptionsMainEl, sprInstructionsContent])
                        .catch(function (err) { console.error('MathJax Typesetting Error (after delay):', err); });
                } else {
                     console.warn("MathJax still not ready after delay for typesetting.");
                }
            }, 500);
        }
    } else {
        console.warn("MathJax object itself is not defined. Math content will not be rendered.");
    }
    updateNavigation();
}

// --- Event Listeners for Answer Interaction & Tools ---
if(answerOptionsMainEl) {
    answerOptionsMainEl.addEventListener('click', function(event) {
        const target = event.target;
        const answerContainer = target.closest('.answer-option-container');
        if (!answerContainer) { return; }
        const optionKey = answerContainer.dataset.optionKey;
        const actionElement = target.closest('[data-action]');
        const action = actionElement ? actionElement.dataset.action : null;
        
        if (!action && target.closest('.answer-option')) {
            recordTimeOnCurrentQuestion();
        }

        if (action === 'cross-out-individual') {
            handleAnswerCrossOut(optionKey);
        } else if (action === 'undo-cross-out') {
            handleAnswerUndoCrossOut(optionKey);
        } else if (target.closest('.answer-option')) {
            handleAnswerSelect(optionKey);
        }
    });
}

function handleAnswerSelect(optionKey) {
    const answerState = getAnswerState();
    if (!answerState) { console.error("handleAnswerSelect: No answer state found."); return; }

    if (isCrossOutToolActive) {
        console.log("handleAnswerSelect: Cross-out tool IS ACTIVE. Click on option body selects & un-crosses.");
    } else {
        console.log("handleAnswerSelect: Cross-out tool is INACTIVE. Proceeding with selection.");
    }
    
    const currentQDetails = getCurrentQuestionData();
    let newSelectedOptionText = optionKey;
    
    const jsonOptionKey = `option_${optionKey.toLowerCase()}`;
    if (currentQDetails && currentQDetails.hasOwnProperty(jsonOptionKey) && currentQDetails[jsonOptionKey] !== null) {
        newSelectedOptionText = currentQDetails[jsonOptionKey];
    } else {
        console.warn(`handleAnswerSelect: Could not find option text for key ${optionKey} (tried ${jsonOptionKey}). Storing key itself ('${optionKey}') as selected value.`);
    }

    if (answerState.selected !== null && answerState.selected !== newSelectedOptionText) {
        answerState.selectionChanges = (answerState.selectionChanges || 0) + 1;
        console.log(`Answer changed for QKey ${getAnswerStateKey()}. New count: ${answerState.selectionChanges}. Old: "${answerState.selected}", New: "${newSelectedOptionText}"`);
    }
    
    console.log(`handleAnswerSelect: Setting selected answer to: "${newSelectedOptionText}" (original key: ${optionKey})`);
    answerState.selected = newSelectedOptionText;

    if (answerState.crossedOut.includes(optionKey)) {
        console.log(`handleAnswerSelect: Option ${optionKey} was selected, removing it from crossedOut list.`);
        answerState.crossedOut = answerState.crossedOut.filter(opt => opt !== optionKey);
    }
    
    loadQuestion();
    saveSessionState();
}

function handleAnswerCrossOut(optionKey) {
     const answerState = getAnswerState();
     if (!answerState) return;
     if (!answerState.crossedOut.includes(optionKey)) {
         answerState.crossedOut.push(optionKey);
     }
     loadQuestion();
     saveSessionState();
}

function handleAnswerUndoCrossOut(optionKey) {
     const answerState = getAnswerState();
     if (!answerState) return;
     answerState.crossedOut = answerState.crossedOut.filter(opt => opt !== optionKey);
     loadQuestion();
     saveSessionState();
}

if(crossOutToolBtnMain) {
    crossOutToolBtnMain.addEventListener('click', () => {
        const currentQData = getCurrentQuestionData();
        if (currentQData && currentQData.question_type === 'student_produced_response') return;
        isCrossOutToolActive = !isCrossOutToolActive;
        loadQuestion();
    });
}

if(sprInputFieldMain) {
    sprInputFieldMain.addEventListener('input', (event) => {
        const answerState = getAnswerState();
        if (!answerState) return;
        answerState.spr_answer = event.target.value;
        if(sprAnswerPreviewMain) sprAnswerPreviewMain.textContent = `Answer Preview: ${event.target.value}`;
    });
    sprInputFieldMain.addEventListener('blur', () => {
        recordTimeOnCurrentQuestion();
        questionStartTime = Date.now();
        saveSessionState();
    });
}

async function submitCurrentModuleData(moduleIndexToSubmit, isFinalSubmission = false) {
    console.log(`DEBUG submitCurrentModuleData: Attempting to submit data for module index: ${moduleIndexToSubmit}. Is final: ${isFinalSubmission}`);
    if (moduleIndexToSubmit === currentModuleIndex) {
        recordTimeOnCurrentQuestion();
    }
    const submissions = [];
    const timestamp = new Date().toISOString();
    const quizNameForSubmission = (currentTestFlow && currentTestFlow[moduleIndexToSubmit]) ? currentTestFlow[moduleIndexToSubmit] : "UNKNOWN_MODULE_NAME";
    if (!quizNameForSubmission || quizNameForSubmission === "UNKNOWN_MODULE_NAME") {
        console.error(`DEBUG submitCurrentModuleData: Could not determine quizName for module index ${moduleIndexToSubmit}. Aborting submission for this module.`);
        return false;
    }
    console.log(`DEBUG submitCurrentModuleData: Submitting for quizName: ${quizNameForSubmission}`);
    for (const key in userAnswers) {
        if (userAnswers.hasOwnProperty(key)) {
            const keyModuleIndex = parseInt(key.split('-')[0]);
            if (keyModuleIndex === moduleIndexToSubmit) {
                const answerState = userAnswers[key];
                if (!answerState.q_id || answerState.q_id.endsWith('-tmp') || typeof answerState.correct_ans === 'undefined' || answerState.correct_ans === null || typeof answerState.question_type_from_json === 'undefined') {
                    console.warn(`DEBUG submitCurrentModuleData: Data incomplete for answer key ${key} in module ${quizNameForSubmission}. Skipping this answer.`);
                    continue;
                }
                let studentAnswerForSubmission = "";
                let isCorrect = false;
                if (answerState.question_type_from_json === 'student_produced_response') {
                    studentAnswerForSubmission = answerState.spr_answer || "NO_ANSWER";
                    if (answerState.correct_ans && studentAnswerForSubmission !== "NO_ANSWER") {
                        const correctSprAnswers = String(answerState.correct_ans).split('|').map(s => s.trim().toLowerCase());
                        if (correctSprAnswers.includes(studentAnswerForSubmission.trim().toLowerCase())) {
                            isCorrect = true;
                        }
                    }
                } else {
                    studentAnswerForSubmission = answerState.selected || "NO_ANSWER";
                    if (answerState.correct_ans && studentAnswerForSubmission !== "NO_ANSWER") {
                        isCorrect = (String(studentAnswerForSubmission).trim().toLowerCase() === String(answerState.correct_ans).trim().toLowerCase());
                    }
                }
                submissions.push({
                    timestamp: timestamp,
                    student_gmail_id: studentEmailForSubmission,
                    quiz_name: quizNameForSubmission,
                    question_id: answerState.q_id,
                    student_answer: studentAnswerForSubmission,
                    is_correct: isCorrect,
                    time_spent_seconds: parseFloat(answerState.timeSpent || 0).toFixed(2),
                    selection_changes: answerState.selectionChanges || 0,
                    source: globalQuizSource || ''
                });
            }
        }
    }
    if (submissions.length === 0) {
        console.log(`DEBUG submitCurrentModuleData: No answers recorded for module ${quizNameForSubmission}. Nothing to submit for this module.`);
        return true;
    }
    console.log(`DEBUG submitCurrentModuleData: Submitting for module ${quizNameForSubmission}:`, submissions);
    if (APPS_SCRIPT_WEB_APP_URL === 'YOUR_CORRECT_BLUEBOOK_APPS_SCRIPT_URL_HERE' || !APPS_SCRIPT_WEB_APP_URL.startsWith('https://script.google.com/')) {
        console.warn("APPS_SCRIPT_WEB_APP_URL not set or invalid. Submission will not proceed for module " + quizNameForSubmission);
        alert("Submission URL not configured. Data for module " + quizNameForSubmission + " logged to console.");
        return false;
    }
    try {
        fetch(APPS_SCRIPT_WEB_APP_URL, {
            method: 'POST', mode: 'no-cors', cache: 'no-cache',
            headers: {'Content-Type': 'text/plain'},
            redirect: 'follow', body: JSON.stringify(submissions)
        })
        .then(() => {
            console.log(`DEBUG submitCurrentModuleData: Submission attempt finished for module ${quizNameForSubmission} (no-cors mode).`);
        })
        .catch((error) => {
            console.error(`DEBUG submitCurrentModuleData: Error submitting data for module ${quizNameForSubmission}:`, error);
        });
        return true;
    } catch (error) {
        console.error('DEBUG submitCurrentModuleData: Synchronous error setting up fetch for module ' + quizNameForSubmission + ':', error);
        return false;
    }
}

// --- Navigation ---
function updateNavigation() {
    console.log("DEBUG: updateNavigation CALLED. View:", currentView, "Q#:", currentQuestionNumber, "ModTimeUp:", currentModuleTimeUp, "Mode:", currentInteractionMode);
    
    if (!backBtnFooter || !nextBtnFooter || !currentQFooterEl || !totalQFooterEl) {
        console.error("Navigation elements missing for updateNavigation.");
        return;
    }

    const moduleIsLoaded = currentQuizQuestions && currentQuizQuestions.length > 0;
    const totalQuestionsInModule = moduleIsLoaded ? currentQuizQuestions.length : 0;
    currentQFooterEl.textContent = moduleIsLoaded ? currentQuestionNumber : '0';
    totalQFooterEl.textContent = totalQuestionsInModule;
    backBtnFooter.disabled = (currentQuestionNumber === 1);
    
    nextBtnFooter.style.display = 'none';
    backBtnFooter.style.display = 'none';
    if (reviewNextBtnFooter) reviewNextBtnFooter.style.display = 'none';
    if (reviewBackBtnFooter) reviewBackBtnFooter.style.display = 'none';

    const currentMod = getCurrentModule();
    const isDtT0Module = currentMod && currentMod.name && currentMod.name.includes("(Diagnostic)");

    if (currentView === 'test-interface-view') {
        nextBtnFooter.style.display = 'inline-block';
        backBtnFooter.style.display = 'inline-block';
        if (!moduleIsLoaded) {
            nextBtnFooter.textContent = "Next";
            nextBtnFooter.disabled = true;
        } else if (currentQuestionNumber < totalQuestionsInModule) {
            nextBtnFooter.textContent = "Next";
            nextBtnFooter.disabled = false;
        } else {
            nextBtnFooter.textContent = "Review Section";
            if (currentInteractionMode === 'full_test') {
                if (isDtT0Module) {
                    nextBtnFooter.disabled = false;
                } else {
                    nextBtnFooter.disabled = !currentModuleTimeUp && (currentMod && typeof currentMod.durationSeconds === 'number' && currentMod.durationSeconds > 0);
                }
            } else {
                nextBtnFooter.disabled = false;
            }
        }
    } else if (currentView === 'review-page-view') {
        if (reviewBackBtnFooter) reviewBackBtnFooter.style.display = 'inline-block';
        if (reviewNextBtnFooter) reviewNextBtnFooter.style.display = 'inline-block';
        if (reviewBackBtnFooter) reviewBackBtnFooter.disabled = false;
        if (reviewNextBtnFooter) {
            if (currentInteractionMode === 'single_quiz') {
                reviewNextBtnFooter.textContent = "Finish Quiz";
                reviewNextBtnFooter.disabled = false;
            } else {
                if (currentModuleIndex < currentTestFlow.length - 1) {
                    reviewNextBtnFooter.textContent = "Next Module";
                } else {
                    reviewNextBtnFooter.textContent = "Finish Test";
                }
                if (isDtT0Module) {
                    reviewNextBtnFooter.disabled = false;
                } else {
                    reviewNextBtnFooter.disabled = !currentModuleTimeUp && (currentMod && typeof currentMod.durationSeconds === 'number' && currentMod.durationSeconds > 0);
                }
            }
        }
    }
}

function nextButtonClickHandler() {
    if (currentView !== 'test-interface-view') return;
    console.log("DEBUG: nextButtonClickHandler CALLED");
    recordTimeOnCurrentQuestion();
    saveSessionState();

    const totalQuestionsInModule = currentQuizQuestions ? currentQuizQuestions.length : 0;
    if (currentQuestionNumber < totalQuestionsInModule) {
        currentQuestionNumber++;
        isCrossOutToolActive = false;
        isHighlightingActive = false; if(highlightsNotesBtn) highlightsNotesBtn.classList.remove('active');
        loadQuestion();
    } else if (currentQuestionNumber === totalQuestionsInModule && totalQuestionsInModule > 0) {
        showView('review-page-view');
    }
}

async function reviewNextButtonClickHandler() {
    if (currentView !== 'review-page-view') return;
    console.log(`DEBUG: reviewNextButtonClickHandler CALLED. Mode: ${currentInteractionMode}, CMI: ${currentModuleIndex}, FlowLength: ${currentTestFlow.length}`);
    saveSessionState();

    const moduleIndexJustCompleted = currentModuleIndex;

    if (currentInteractionMode === 'single_quiz') {
        console.log("DEBUG reviewNextBtnHandler: Single quiz finished. Submitting module data.");
        await submitCurrentModuleData(moduleIndexJustCompleted, true);
        if (practiceQuizTimerInterval) clearInterval(practiceQuizTimerInterval);
        showView('finished-view');
        return;
    }

    console.log(`DEBUG reviewNextBtnHandler: Submitting data for completed module: ${currentTestFlow[moduleIndexJustCompleted]} (index ${moduleIndexJustCompleted})`);
    await submitCurrentModuleData(moduleIndexJustCompleted, (moduleIndexJustCompleted === currentTestFlow.length - 1));

    currentModuleIndex++;
    console.log("DEBUG reviewNextBtn: Advanced currentModuleIndex to:", currentModuleIndex);

    if (currentModuleIndex < currentTestFlow.length) {
        const isEndOfRwSection = (currentTestFlow[moduleIndexJustCompleted].includes("-RW-M2"));
        const currentTestIsDtT0 = currentTestFlow.length > 0 && currentTestFlow[0].startsWith("DT-T0-");

        if (currentInteractionMode === 'full_test' && isEndOfRwSection && !currentTestIsDtT0) {
            console.log("DEBUG reviewNextBtnHandler: End of R&W section. Showing manual break view.");
            showView('manual-break-view');
            return;
        }

        showView('module-over-view');
        setTimeout(async () => {
            currentQuestionNumber = 1;
            currentModuleTimeUp = false;
            const nextQuizName = currentTestFlow[currentModuleIndex];
            const nextModuleInfo = moduleMetadata[nextQuizName];
            let jsonToLoadForNextModule = nextQuizName;

            console.log(`DEBUG reviewNextBtnHandler: Preparing to load module: ${nextQuizName} (resolved JSON file to load: ${jsonToLoadForNextModule})`);
            const success = await loadQuizData(jsonToLoadForNextModule);

            if (success && currentQuizQuestions.length > 0) {
                if (currentInteractionMode === 'full_test') {
                    const isNextModuleDtT0 = nextModuleInfo && nextModuleInfo.name && nextModuleInfo.name.includes("(Diagnostic)");
                    if (isNextModuleDtT0 || !(nextModuleInfo && typeof nextModuleInfo.durationSeconds === 'number' && nextModuleInfo.durationSeconds > 0)) {
                        console.log(`DEBUG reviewNextButton: Starting module ${nextQuizName} (untimed) with upward counting timer.`);
                        startPracticeQuizTimer();
                        currentModuleTimeUp = true;
                    } else {
                        console.log(`DEBUG reviewNextButton: Starting timed module ${nextQuizName} with duration ${nextModuleInfo.durationSeconds}.`);
                        startModuleTimer(nextModuleInfo.durationSeconds);
                    }
                }
                populateQNavGrid();
                showView('test-interface-view');
            } else {
                console.error("Failed to load next module or module has no questions.");
                alert("Error loading the next module. Returning to home.");
                showView('home-view');
            }
        }, 1000);
    } else {
        console.log("All modules finished (from review page). Transitioning to finished view.");
        if (moduleTimerInterval) clearInterval(moduleTimerInterval);
        if (practiceQuizTimerInterval) clearInterval(practiceQuizTimerInterval);
        showView('finished-view');
    }
}

function backButtonClickHandler() {
    if (currentView !== 'test-interface-view') return;
    console.log("DEBUG: backButtonClickHandler CALLED");
    recordTimeOnCurrentQuestion();
    saveSessionState();
    if (currentQuestionNumber > 1) {
        currentQuestionNumber--;
        isCrossOutToolActive = false;
        isHighlightingActive = false; if(highlightsNotesBtn) highlightsNotesBtn.classList.remove('active');
        loadQuestion();
    }
}

if(nextBtnFooter) {
    nextBtnFooter.removeEventListener('click', nextButtonClickHandler);
    nextBtnFooter.addEventListener('click', nextButtonClickHandler);
}
if(reviewNextBtnFooter) {
    reviewNextBtnFooter.removeEventListener('click', reviewNextButtonClickHandler);
    reviewNextBtnFooter.addEventListener('click', reviewNextButtonClickHandler);
}
if(backBtnFooter) {
    backBtnFooter.removeEventListener('click', backButtonClickHandler);
    backBtnFooter.addEventListener('click', backButtonClickHandler);
}

// --- Event Listeners for other UI elements ---
if(returnToHomeBtn) {
    returnToHomeBtn.addEventListener('click', () => {
        console.log(`DEBUG returnToHomeBtn: Clicked. globalOriginPageId: '${globalOriginPageId}'`);
        clearSessionState();
        if (globalOriginPageId && globalOriginPageId.trim() !== "") {
            let returnUrl = "";
            if (window.location.pathname.includes("/quiz-player/")) {
                 returnUrl = `../${globalOriginPageId}.html`;
            } else {
                 returnUrl = `${globalOriginPageId}.html`;
            }
            console.log(`DEBUG returnToHomeBtn: Navigating to origin: ${returnUrl}`);
            window.location.href = returnUrl;
        } else {
            console.log("DEBUG returnToHomeBtn: No originPageId found, showing internal home-view.");
            showView('home-view');
        }
    });
}
if(calculatorBtnHeader) calculatorBtnHeader.addEventListener('click', () => toggleModal(calculatorOverlay, true));
if(calculatorCloseBtn) calculatorCloseBtn.addEventListener('click', () => toggleModal(calculatorOverlay, false));
if(referenceBtnHeader) referenceBtnHeader.addEventListener('click', () => toggleModal(referenceSheetPanel, true));
if(referenceSheetCloseBtn) referenceSheetCloseBtn.addEventListener('click', () => toggleModal(referenceSheetPanel, false));

let isCalcDragging = false;
let currentX_calc_drag, currentY_calc_drag, initialX_calc_drag, initialY_calc_drag, xOffset_calc_drag = 0, yOffset_calc_drag = 0;
if(calculatorHeaderDraggable) {
    calculatorHeaderDraggable.addEventListener('mousedown', (e) => {
        initialX_calc_drag = e.clientX - xOffset_calc_drag;
        initialY_calc_drag = e.clientY - yOffset_calc_drag;
        if (e.target === calculatorHeaderDraggable || e.target.tagName === 'STRONG') isCalcDragging = true;
    });
    document.addEventListener('mousemove', (e) => {
        if (isCalcDragging) {
            e.preventDefault();
            currentX_calc_drag = e.clientX - initialX_calc_drag;
            currentY_calc_drag = e.clientY - initialY_calc_drag;
            xOffset_calc_drag = currentX_calc_drag;
            yOffset_calc_drag = currentY_calc_drag;
            if(calculatorOverlay) calculatorOverlay.style.transform = `translate3d(${currentX_calc_drag}px, ${currentY_calc_drag}px, 0)`;
        }
    });
    document.addEventListener('mouseup', () => isCalcDragging = false );
}

if(highlightsNotesBtn && (passageContentEl || questionTextMainEl || sprInstructionsContent) ) {
    highlightsNotesBtn.addEventListener('click', () => {
        isHighlightingActive = !isHighlightingActive;
        highlightsNotesBtn.classList.toggle('active', isHighlightingActive);
        if (isHighlightingActive) {
            document.addEventListener('mouseup', handleTextSelection);
            if(mainContentAreaDynamic) mainContentAreaDynamic.classList.add('highlight-active');
        } else {
            document.removeEventListener('mouseup', handleTextSelection);
            if(mainContentAreaDynamic) mainContentAreaDynamic.classList.remove('highlight-active');
        }
    });
}
function handleTextSelection() {
    if (!isHighlightingActive) return;
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const isWithinPassagePane = passagePane && passagePane.style.display !== 'none' && passagePane.contains(container);
    const isWithinQuestionTextPane = questionPane && questionPane.contains(container) && questionTextMainEl.contains(container);
    const isWithinSprInstructions = sprInstructionsPane && sprInstructionsPane.style.display !== 'none' && sprInstructionsPane.contains(container);
    if (!isWithinPassagePane && !isWithinQuestionTextPane && !isWithinSprInstructions) return;
    const span = document.createElement('span');
    span.className = 'text-highlight';
    try { range.surroundContents(span); }
    catch (e) { span.appendChild(range.extractContents()); range.insertNode(span); console.warn("Highlighting fallback.", e); }
    selection.removeAllRanges();
}

if(directionsBtn) {
    directionsBtn.addEventListener('click', () => {
        const moduleInfo = getCurrentModule();
        if(moduleInfo && directionsModalTitle) directionsModalTitle.textContent = `Section ${currentModuleIndex + 1}: ${moduleInfo.name} Directions`;
        if(moduleInfo && directionsModalText) directionsModalText.innerHTML = moduleInfo.directions || "General directions";
        toggleModal(directionsModal, true);
    });
}
if(directionsModalCloseBtn) directionsModalCloseBtn.addEventListener('click', () => toggleModal(directionsModal, false));
if(directionsModal) directionsModal.addEventListener('click', (e) => { if (e.target === directionsModal) toggleModal(directionsModal, false); });

if(qNavBtnFooter) {
    qNavBtnFooter.addEventListener('click', () => {
        if (currentQuizQuestions && currentQuizQuestions.length > 0) { populateQNavGrid(); toggleModal(qNavPopup, true); }
        else { console.warn("QNav: no questions loaded."); }
    });
}
if(qNavCloseBtn) qNavCloseBtn.addEventListener('click', () => toggleModal(qNavPopup, false));
if(qNavGotoReviewBtn) {
    qNavGotoReviewBtn.addEventListener('click', () => {
        toggleModal(qNavPopup, false);
        if (currentQuizQuestions && currentQuizQuestions.length > 0) { showView('review-page-view'); }
    });
}

if(markReviewCheckboxMain) {
    markReviewCheckboxMain.addEventListener('change', () => {
        const answerState = getAnswerState();
        if (!answerState) return;
        answerState.marked = markReviewCheckboxMain.checked;
        if(flagIconMain) {
            flagIconMain.style.fill = answerState.marked ? 'var(--bluebook-red-flag)' : 'none';
            flagIconMain.style.color = answerState.marked ? 'var(--bluebook-red-flag)' : '#9ca3af';
        }
        if (qNavPopup && qNavPopup.classList.contains('visible')) populateQNavGrid();
        if (reviewPageViewEl && reviewPageViewEl.classList.contains('active')) renderReviewPage();
        saveSessionState();
    });
}

if(timerToggleBtn) timerToggleBtn.addEventListener('click', () => handleTimerToggle(timerTextEl, timerClockIconEl, timerToggleBtn));
if(reviewDirectionsBtn) {
    reviewDirectionsBtn.addEventListener('click', () => {
        const moduleInfo = getCurrentModule();
        if (moduleInfo && directionsModalTitle) directionsModalTitle.textContent = `Section ${currentModuleIndex + 1}: ${moduleInfo.name} Directions`;
        if (moduleInfo && directionsModalText) directionsModalText.innerHTML = moduleInfo.directions || "General directions for review.";
        toggleModal(directionsModal, true);
    });
}
if(reviewTimerToggleBtn && reviewTimerText && reviewTimerClockIcon) reviewTimerToggleBtn.addEventListener('click', () => handleTimerToggle(reviewTimerText, reviewTimerClockIcon, reviewTimerToggleBtn));
if(reviewBackBtnFooter) {
    reviewBackBtnFooter.addEventListener('click', () => {
        if (currentView !== 'review-page-view') return;
        showView('test-interface-view');
    });
}

if(moreBtn) {
    moreBtn.addEventListener('click', (e) => { e.stopPropagation(); if(moreMenuDropdown) moreMenuDropdown.classList.toggle('visible'); });
}
document.body.addEventListener('click', (e) => {
    if (moreMenuDropdown && moreBtn && !moreBtn.contains(e.target) && !moreMenuDropdown.contains(e.target) && moreMenuDropdown.classList.contains('visible')) {
        moreMenuDropdown.classList.remove('visible');
    }
});
if(moreMenuDropdown) moreMenuDropdown.addEventListener('click', (e) => e.stopPropagation());

if(moreUnscheduledBreakBtn) {
    moreUnscheduledBreakBtn.addEventListener('click', () => { toggleModal(unscheduledBreakConfirmModal, true); if(moreMenuDropdown) moreMenuDropdown.classList.remove('visible'); if(understandLoseTimeCheckbox) understandLoseTimeCheckbox.checked = false; if(unscheduledBreakConfirmBtn) unscheduledBreakConfirmBtn.disabled = true; });
}
if(understandLoseTimeCheckbox) {
    understandLoseTimeCheckbox.addEventListener('change', () => { if(unscheduledBreakConfirmBtn) unscheduledBreakConfirmBtn.disabled = !understandLoseTimeCheckbox.checked; });
}
if(unscheduledBreakCancelBtn) unscheduledBreakCancelBtn.addEventListener('click', () => toggleModal(unscheduledBreakConfirmModal, false));
if(unscheduledBreakConfirmBtn) {
    unscheduledBreakConfirmBtn.addEventListener('click', () => { alert("Unscheduled Break screen: Future"); toggleModal(unscheduledBreakConfirmModal, false); });
}

if(moreExitExamBtn) {
    moreExitExamBtn.addEventListener('click', () => { toggleModal(exitExamConfirmModal, true); if(moreMenuDropdown) moreMenuDropdown.classList.remove('visible'); });
}
if(exitExamCancelBtn) exitExamCancelBtn.addEventListener('click', () => toggleModal(exitExamConfirmModal, false));
if(exitExamConfirmBtn) {
    exitExamConfirmBtn.addEventListener('click', () => {
        recordTimeOnCurrentQuestion();
        if (moduleTimerInterval) clearInterval(moduleTimerInterval);
        if (practiceQuizTimerInterval) clearInterval(practiceQuizTimerInterval);
        clearSessionState();
        toggleModal(exitExamConfirmModal, false);
        showView('home-view');
    });
}

if (submitEmailBtn) {
    submitEmailBtn.addEventListener('click', async () => { /* ... existing email logic ... */ });
}

// --- DOMContentLoaded ---
//document.addEventListener('DOMContentLoaded', async () => {
    // Paste your full, corrected DOMContentLoaded listener from the previous step here.
    // It should contain the session resume prompt and logic.
    // This is the version from my previous message that you confirmed worked.
// --- script.js (Final and Correct DOMContentLoaded Listener) ---

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DEBUG DOMContentLoaded: Initializing application.");
    const emailIsValid = initializeStudentIdentifier();
    const urlParams = new URLSearchParams(window.location.search);
    const quizNameFromUrl = urlParams.get('quiz_name');
    const testIdFromUrl = urlParams.get('test_id');
    const sourceFromUrl = urlParams.get('source');
    globalOriginPageId = urlParams.get('originPageId');

    if (sourceFromUrl) {
        globalQuizSource = sourceFromUrl;
        console.log(`DEBUG DOMContentLoaded: URL 'source' parameter found: ${globalQuizSource}`);
    }
    if (globalOriginPageId) {
        console.log(`DEBUG DOMContentLoaded: URL 'originPageId' parameter found: ${globalOriginPageId}`);
    }

    const savedSessionJSON = localStorage.getItem(SESSION_STORAGE_KEY);
    let sessionResumed = false;

    if (savedSessionJSON) {
        console.log("DEBUG DOMContentLoaded: Found saved session data.");
        try {
            const savedSession = JSON.parse(savedSessionJSON);
            if (savedSession && typeof savedSession.currentModuleIndex === 'number' && savedSession.currentTestFlow && savedSession.currentTestFlow.length > 0) {
                const resumeConfirmation = confirm("An unfinished session was found. Would you like to resume it?");
                if (resumeConfirmation) {
                    console.log("DEBUG DOMContentLoaded: User chose to RESUME session.");
                    sessionResumed = true;

                    if (savedSession.studentEmailForSubmission) {
                        studentEmailForSubmission = savedSession.studentEmailForSubmission;
                        localStorage.setItem('bluebookStudentEmail', studentEmailForSubmission);
                        const homeUserNameEl = document.getElementById('home-user-name');
                        if(homeUserNameEl && studentEmailForSubmission) homeUserNameEl.textContent = studentEmailForSubmission.split('@')[0];
                    }

                    currentInteractionMode = savedSession.currentInteractionMode || 'full_test';
                    currentTestFlow = savedSession.currentTestFlow;
                    currentModuleIndex = savedSession.currentModuleIndex;
                    currentQuestionNumber = savedSession.currentQuestionNumber;
                    userAnswers = savedSession.userAnswers || {};
                    currentModuleTimeLeft = savedSession.currentModuleTimeLeft || 0;
                    practiceQuizTimeElapsed = savedSession.practiceQuizTimeElapsed || 0;
                    isTimerHidden = savedSession.isTimerHidden || false;
                    globalOriginPageId = savedSession.globalOriginPageId || globalOriginPageId;
                    globalQuizSource = savedSession.globalQuizSource || globalQuizSource;

                    // Restore timer visibility
                    if (timerTextEl && timerClockIconEl && timerToggleBtn) {
                        timerTextEl.classList.toggle('hidden', isTimerHidden);
                        timerClockIconEl.classList.toggle('hidden', !isTimerHidden);
                        timerToggleBtn.textContent = isTimerHidden ? '[Show]' : '[Hide]';
                    }

                    const quizNameToLoadForResume = currentTestFlow[currentModuleIndex];
                    if (quizNameToLoadForResume) {
                        const success = await loadQuizData(quizNameToLoadForResume);
                        if (success && currentQuizQuestions.length > 0) {
                            const currentModInfoForResume = getCurrentModule();
                            const isResumedDtT0Module = currentModInfoForResume && currentModInfoForResume.name && currentModInfoForResume.name.includes("(Diagnostic)");

                            if (currentInteractionMode === 'full_test') {
                                if (isResumedDtT0Module) {
                                    startPracticeQuizTimer();
                                    practiceQuizTimeElapsed = savedSession.practiceQuizTimeElapsed || 0;
                                    updatePracticeQuizTimerDisplay(practiceQuizTimeElapsed);
                                    currentModuleTimeUp = true;
                                } else {
                                    startModuleTimer(currentModuleTimeLeft);
                                }
                            } else if (currentInteractionMode === 'single_quiz') {
                                startPracticeQuizTimer();
                                practiceQuizTimeElapsed = savedSession.practiceQuizTimeElapsed || 0;
                                updatePracticeQuizTimerDisplay(practiceQuizTimeElapsed);
                            }
                            populateQNavGrid();
                            showView('test-interface-view');
                        } else {
                            alert("Could not resume session: error loading quiz data. Starting fresh.");
                            clearSessionState();
                            sessionResumed = false;
                        }
                    } else {
                        alert("Could not resume session: invalid session data. Starting fresh.");
                        clearSessionState();
                        sessionResumed = false;
                    }
                } else {
                    console.log("DEBUG DOMContentLoaded: User chose NOT to resume. Clearing saved session.");
                    clearSessionState();
                }
            } else {
                console.warn("DEBUG DOMContentLoaded: Saved session data is invalid or incomplete. Clearing it.");
                clearSessionState();
            }
        } catch (parseError) {
            console.error("DEBUG DOMContentLoaded: Error parsing saved session JSON. Clearing it.", parseError);
            clearSessionState();
        }
    } else {
        console.log("DEBUG DOMContentLoaded: No saved session found.");
    }

    if (!sessionResumed) {
        console.log("DEBUG DOMContentLoaded: No session resumed. Proceeding with standard launch checks (email/URL).");
        if (!emailIsValid) {
            showView('email-input-view');
        } else {
            if (testIdFromUrl) {
                console.log(`DEBUG DOMContentLoaded: Launching NEW full test from URL: ${testIdFromUrl}`);
                if (fullTestDefinitions[testIdFromUrl]) {
                    currentInteractionMode = 'full_test';
                    currentTestFlow = fullTestDefinitions[testIdFromUrl].flow;
                    currentModuleIndex = 0; currentQuestionNumber = 1; userAnswers = {};
                    isTimerHidden = false; isCrossOutToolActive = false; isHighlightingActive = false;
                    currentModuleTimeUp = false; questionStartTime = 0;

                    if (currentTestFlow && currentTestFlow.length > 0) {
                        const firstQuizName = currentTestFlow[currentModuleIndex];
                        const moduleInfo = moduleMetadata[firstQuizName];
                        const isDtT0Module = firstQuizName.startsWith("DT-T0-");
                        const success = await loadQuizData(firstQuizName);
                        if (success && currentQuizQuestions.length > 0) {
                            if (isDtT0Module) {
                                startPracticeQuizTimer(); currentModuleTimeUp = true;
                            } else if (moduleInfo && typeof moduleInfo.durationSeconds === 'number' && moduleInfo.durationSeconds > 0) {
                                startModuleTimer(moduleInfo.durationSeconds);
                            } else {
                                updateModuleTimerDisplay(0); currentModuleTimeUp = true;
                            }
                            populateQNavGrid();
                            showView('test-interface-view');
                        } else { alert(`Could not load initial module for test: ${testIdFromUrl}.`); showView('home-view'); }
                    } else { alert(`Test ID '${testIdFromUrl}' has no defined flow.`); showView('home-view'); }
                } else { alert(`Unknown Test ID: ${testIdFromUrl}.`); showView('home-view'); }
            } else if (quizNameFromUrl) {
                console.log(`DEBUG DOMContentLoaded: Launching NEW single quiz from URL: ${quizNameFromUrl}`);
                currentInteractionMode = 'single_quiz';
                currentTestFlow = [quizNameFromUrl];
                currentModuleIndex = 0; currentQuestionNumber = 1; userAnswers = {};
                isTimerHidden = false; isCrossOutToolActive = false; isHighlightingActive = false;
                currentModuleTimeUp = false; questionStartTime = 0;

                const success = await loadQuizData(quizNameFromUrl);
                if (success && currentQuizQuestions.length > 0) {
                    startPracticeQuizTimer();
                    populateQNavGrid();
                    showView('test-interface-view');
                } else { alert(`Could not load quiz: ${quizNameFromUrl}.`); showView('home-view'); }
            } else {
                console.log("DEBUG DOMContentLoaded: Email valid, no direct launch params, no session resumed. Displaying home screen (informational message).");
                showView('home-view');
            }
        }
    }
});
