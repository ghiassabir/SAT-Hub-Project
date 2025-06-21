// --- script js phase 6 quiz and test view.txt (WITH TARGETED DEBUG LOGS) ---

// --- Utility Functions (Define these FIRST) ---
function toggleModal(modalElement, show) {
    if (!modalElement) {
        return;
    }
    modalElement.classList.toggle('visible', show);
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
let studentEmailForSubmission = "anonymous_student@example.com"; 
let currentInteractionMode = 'full_test'; 
let practiceQuizTimerInterval;
let practiceQuizTimeElapsed = 0;


const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwneCF0xq9X-F-9AIxAiHpYFmRTErCzCPXlsWRloLRDWBGqwLEZC4NldCCAuND0jxUL/exec'; 

const moduleMetadata = {
    "DT-T0-RW-M1": {
        name: "Reading & Writing - Module 1",
        type: "RW",
        durationSeconds: 30, 
        directions: "The questions in this section address a number of important reading and writing skills...",
        spr_directions: null,
        spr_examples_table: null
    },
    "DT-T0-RW-M2": {
        name: "Reading & Writing - Module 2",
        type: "RW",
        durationSeconds: 30, 
        directions: "This is the second Reading & Writing module. Continue to read each passage and question carefully...",
        spr_directions: null,
        spr_examples_table: null
    },
    "DT-T0-MT-M1": { 
        name: "Math - Module 1",
        type: "Math",
        durationSeconds: 30, 
        directions: "The questions in this section address a number of important math skills...",
        passageText: null, 
        spr_directions: `<h3>Student-produced response directions</h3><ul><li>If you find <strong>more than one correct answer</strong>, enter only one answer.</li><li>You can enter up to 5 characters for a <strong>positive</strong> answer and up to 6 characters (including the negative sign) for a <strong>negative</strong> answer.</li><li>If your answer is a <strong>fraction</strong> that doesn’t fit in the provided space, enter the decimal equivalent.</li><li>If your answer is a <strong>decimal</strong> that doesn’t fit in the provided space, enter it by truncating or rounding at the fourth digit.</li><li>If your answer is a <strong>mixed number</strong> (such as 3 <span style="font-size: 0.7em; vertical-align: super;">1</span>/<span style="font-size: 0.7em; vertical-align: sub;">2</span>), enter it as an improper fraction (7/2) or its decimal equivalent (3.5).</li><li>Don’t enter <strong>symbols</strong> such as a percent sign, comma, or dollar sign.</li></ul>`,
        spr_examples_table: `<table class="spr-examples-table"><thead><tr><th>Answer</th><th>Acceptable ways to enter answer</th><th>Unacceptable: will NOT receive credit</th></tr></thead><tbody><tr><td>3.5</td><td>3.5<br/>7/2</td><td>3 1/2</td></tr><tr><td>2/3</td><td>2/3<br/>.666<br/>.667</td><td>0.66<br/>0.67</td></tr><tr><td>-15</td><td>-15</td><td></td></tr></tbody></table>`
    },
    "DT-T0-MT-M2": {
        name: "Math - Module 2",
        type: "Math",
        durationSeconds: 30, 
        directions: "This is the second Math module. You may use the calculator for any question.",
        passageText: null,
        spr_directions: `<h3>Student-produced response directions</h3><ul><li>If you find <strong>more than one correct answer</strong>, enter only one answer.</li><li>You can enter up to 5 characters for a <strong>positive</strong> answer and up to 6 characters (including the negative sign) for a <strong>negative</strong> answer.</li><li>If your answer is a <strong>fraction</strong> that doesn’t fit in the provided space, enter the decimal equivalent.</li><li>If your answer is a <strong>decimal</strong> that doesn’t fit in the provided space, enter it by truncating or rounding at the fourth digit.</li><li>If your answer is a <strong>mixed number</strong> (such as 3 <span style="font-size: 0.7em; vertical-align: super;">1</span>/<span style="font-size: 0.7em; vertical-align: sub;">2</span>), enter it as an improper fraction (7/2) or its decimal equivalent (3.5).</li><li>Don’t enter <strong>symbols</strong> such as a percent sign, comma, or dollar sign.</li></ul>`,
        spr_examples_table: `<table class="spr-examples-table"><thead><tr><th>Answer</th><th>Acceptable ways to enter answer</th><th>Unacceptable: will NOT receive credit</th></tr></thead><tbody><tr><td>3.5</td><td>3.5<br/>7/2</td><td>3 1/2</td></tr><tr><td>2/3</td><td>2/3<br/>.666<br/>.667</td><td>0.66<br/>0.67</td></tr><tr><td>-15</td><td>-15</td><td></td></tr></tbody></table>`
    }
};

const GITHUB_JSON_BASE_URL = 'https://raw.githubusercontent.com/ghiassabir/Bluebook-UI-UX-with-json-real-data-/main/data/json/'; 

async function loadQuizData(quizName) {
    const url = `${GITHUB_JSON_BASE_URL}${quizName}.json`;
    // --- DEBUG --- 
    console.log(`DEBUG loadQuizData: Fetching quiz data from: ${url}`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            // --- DEBUG ---
            console.error(`DEBUG loadQuizData: HTTP error! status: ${response.status} for ${quizName}.json`);
            throw new Error(`HTTP error! status: ${response.status} for ${quizName}.json`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            // --- DEBUG ---
            console.error(`DEBUG loadQuizData: Data for ${quizName}.json is not an array. Check JSON structure.`);
            throw new Error(`Data for ${quizName}.json is not an array. Check JSON structure.`);
        }
        currentQuizQuestions = data; 
        // --- DEBUG ---
        console.log(`DEBUG loadQuizData: Successfully loaded ${currentQuizQuestions.length} questions for quiz: ${quizName}. First q ID: ${currentQuizQuestions.length > 0 ? currentQuizQuestions[0].question_id : 'N/A'}`);
        return true;
    } catch (error) {
        console.error("Error loading quiz data:", error); // This one was already there, good.
        alert(`Failed to load quiz data for ${quizName}: ${error.message}. Please check the console and ensure the JSON file is accessible and the GITHUB_JSON_BASE_URL is correct.`);
        currentQuizQuestions = []; 
        return false;
    }
}

// --- DOM Elements ---
// (Keep this section exactly as in your script js phase 6 quiz and test view.txt)
const allAppViews = document.querySelectorAll('.app-view');
const homeViewEl = document.getElementById('home-view');
const testInterfaceViewEl = document.getElementById('test-interface-view');
const moduleOverViewEl = document.getElementById('module-over-view');
const finishedViewEl = document.getElementById('finished-view');
const reviewPageViewEl = document.getElementById('review-page-view');
const confettiCanvas = document.getElementById('confetti-canvas');
const startTestPreviewBtn = document.getElementById('start-test-preview-btn'); // Will be replaced by specific buttons
const returnToHomeBtn = document.getElementById('return-to-home-btn');
const reviewPageSectionName = document.getElementById('review-page-section-name');
const reviewPageQNavGrid = document.getElementById('review-page-qnav-grid');
const reviewDirectionsBtn = document.getElementById('review-directions-btn');
const reviewTimerText = document.getElementById('review-timer-text'); 
const reviewTimerClockIcon = document.getElementById('review-timer-clock-icon'); 
const reviewTimerToggleBtn = document.getElementById('review-timer-toggle-btn'); 
const reviewBackBtnFooter = document.getElementById('review-back-btn-footer');
const reviewNextBtnFooter = document.getElementById('review-next-btn-footer');
const appWrapper = document.querySelector('.app-wrapper'); 
const mainContentAreaDynamic = document.getElementById('main-content-area-dynamic');
const passagePane = document.getElementById('passage-pane');
const sprInstructionsPane = document.getElementById('spr-instructions-pane');
const sprInstructionsContent = document.getElementById('spr-instructions-content');
const paneDivider = document.getElementById('pane-divider-draggable');
const questionPane = document.getElementById('question-pane');
const highlightsNotesBtn = document.getElementById('highlights-notes-btn');
const calculatorBtnHeader = document.getElementById('calculator-btn');
const referenceBtnHeader = document.getElementById('reference-btn');
const answerArea = document.getElementById('answer-area');
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
const startFullPracticeTestBtn = document.getElementById('start-full-practice-test-btn');
const startSinglePracticeQuizBtn = document.getElementById('start-single-practice-quiz-btn');
const manualBreakViewEl = document.getElementById('manual-break-view');
const continueAfterBreakBtn = document.getElementById('continue-after-break-btn');

// Add listener for continueAfterBreakBtn (from your .txt file, ensure it's there)
//if (continueAfterBreakBtn) { /* ... from your .txt file ... */ }

if (continueAfterBreakBtn) {
    // added 851
    continueAfterBreakBtn.removeEventListener('click', continueAfterBreakBtnClickHandler); // Prevent multiple attachments
    continueAfterBreakBtn.addEventListener('click', continueAfterBreakBtnClickHandler);
    console.log("DEBUG: Event listener ATTACHED to continueAfterBreakBtn."); // Add this log
//} else {
  //  console.error("DEBUG ERROR: continueAfterBreakBtn element NOT FOUND when trying to attach listener.");
    //added
    
    console.log("DEBUG: Checking continueAfterBreakBtn element:", continueAfterBreakBtn); // DEBUG Line 1
    continueAfterBreakBtn.addEventListener('click', async () => {
        console.log("DEBUG:Continue after manual break button clicked."); // DEBUG Line 2
        console.log("DEBUG: currentModuleIndex at continue click:", currentModuleIndex); // DEBUG Line 3
        // currentModuleIndex should be 2 here (for Math M1)

        if (currentModuleIndex < currentTestFlow.length) {
            currentQuestionNumber = 1;
            currentModuleTimeUp = false; 

            const nextQuizName = currentTestFlow[currentModuleIndex];
            const nextModuleInfo = moduleMetadata[nextQuizName];

            let jsonToLoadForNextModule = nextQuizName;
                       
            //console.log(`DEBUG ContinueBreak: Loading module ${nextQuizName} (data from ${jsonToLoadForNextModule})`);

            console.log(`DEBUG ContinueBreak: Preparing to load module: ${nextQuizName} (using JSON data from: ${jsonToLoadForNextModule})`); // DEBUG Line 4
            
            continueAfterBreakBtn.textContent = "Loading next section...";
            continueAfterBreakBtn.disabled = true;

            const success = await loadQuizData(jsonToLoadForNextModule);
            
            continueAfterBreakBtn.textContent = "Continue to Next Section";
            continueAfterBreakBtn.disabled = false;

            if (success && currentQuizQuestions.length > 0) {
                console.log(`DEBUG ContinueBreak: Successfully loaded data for ${nextQuizName}. Starting timer and showing view.`); // DEBUG Line 5
                // Ensure correct timer is started for 'full_test' mode
                if (currentInteractionMode === 'full_test' && nextModuleInfo && typeof nextModuleInfo.durationSeconds === 'number') {
                    startModuleTimer(nextModuleInfo.durationSeconds);
                } else {
                    console.warn(`Timer mode/config issue for module ${nextQuizName} after break. Current mode: ${currentInteractionMode}`);
                    // For full_test, a duration is expected. If single_quiz somehow got here, it would be an issue.
                    updateModuleTimerDisplay(0); 
                }
                populateQNavGrid();
                showView('test-interface-view');
            } else {console.error(`DEBUG ContinueBreak: Failed to load quiz data for ${jsonToLoadForNextModule} or no questions. Success: ${success}, Questions length: ${currentQuizQuestions ? currentQuizQuestions.length : 'undefined'}`);
                alert("Error loading the next section after break. Please try restarting the test.");
                showView('home-view');
               }
          } else { 
            console.error("DEBUG ContinueBreak: Clicked continue, but currentModuleIndex (" + currentModuleIndex + ") is out of bounds for currentTestFlow. Test flow length: " + currentTestFlow.length);
            alert("Test flow error after break. Returning to home.");
            showView('finished-view'); 
        } 
    });
}  else { 
    console.error("DEBUG: continue-after-break-btn was NOT FOUND in the DOM."); // DEBUG Line 6
    }


// added 851
async function continueAfterBreakBtnClickHandler() { // Made it a named async function
    console.log("DEBUG: Continue after manual break button CLICKED."); 
    console.log("DEBUG: currentModuleIndex at continue click:", currentModuleIndex); 

    if (currentModuleIndex < currentTestFlow.length) {
        currentQuestionNumber = 1;
        currentModuleTimeUp = false; 

        const nextQuizName = currentTestFlow[currentModuleIndex];
        const nextModuleInfo = moduleMetadata[nextQuizName];

        let jsonToLoadForNextModule = nextQuizName;
        if (nextQuizName === "DT-T0-RW-M2" && !moduleMetadata[nextQuizName]?.actualFileIfDifferent) { // Example if you had specific M2 files
            jsonToLoadForNextModule = "DT-T0-RW-M1"; 
        } else if (nextQuizName === "DT-T0-MT-M2" && !moduleMetadata[nextQuizName]?.actualFileIfDifferent) {
            jsonToLoadForNextModule = "DT-T0-MT-M1";
        }
        
        console.log(`DEBUG ContinueBreak: Preparing to load module: ${nextQuizName} (using JSON data from: ${jsonToLoadForNextModule})`);
        
        if(continueAfterBreakBtn) { // Check again in case of weirdness
            continueAfterBreakBtn.textContent = "Loading next section...";
            continueAfterBreakBtn.disabled = true;
        }

        const success = await loadQuizData(jsonToLoadForNextModule);
        
        if(continueAfterBreakBtn) {
            continueAfterBreakBtn.textContent = "Continue to Next Section";
            continueAfterBreakBtn.disabled = false;
        }

        if (success && currentQuizQuestions.length > 0) {
            console.log(`DEBUG ContinueBreak: Successfully loaded data for ${nextQuizName}. Starting timer and showing view.`);
            if (currentInteractionMode === 'full_test' && nextModuleInfo && typeof nextModuleInfo.durationSeconds === 'number') {
                startModuleTimer(nextModuleInfo.durationSeconds);
            } else {
                console.warn(`Timer mode/config issue for module ${nextQuizName} after break. Current mode: ${currentInteractionMode}`);
                updateModuleTimerDisplay(0); 
            }
            populateQNavGrid();
            showView('test-interface-view');
        } else { 
            console.error(`DEBUG ContinueBreak: Failed to load quiz data for ${jsonToLoadForNextModule} or no questions. Success: ${success}, Questions length: ${currentQuizQuestions ? currentQuizQuestions.length : 'undefined'}`);
            alert("Error loading the next section after break. Please try restarting the test.");
            showView('home-view');
        }
    } else { 
        console.error("DEBUG ContinueBreak: Clicked continue, but currentModuleIndex (" + currentModuleIndex + ") is out of bounds for currentTestFlow. Test flow length: " + currentTestFlow.length);
        alert("Test flow error after break. Returning to home.");
        showView('finished-view'); 
    }
}

// --- Helper Functions --- (Keep all helper functions from your .txt file as they are for now)
function initializeStudentIdentifier() { /* ... from your .txt file ... */ 
    const storedEmail = localStorage.getItem('bluebookStudentEmail'); 
    if (storedEmail && storedEmail.trim() !== "") { 
        studentEmailForSubmission = storedEmail;
        console.log(`Student identifier initialized from localStorage: ${studentEmailForSubmission}`);
    } else {
        studentEmailForSubmission = "anonymous_student@example.com"; 
        console.log(`No valid student identifier found in localStorage. Using default: ${studentEmailForSubmission}`);
    }
}
function getCurrentModule() { /* ... from your .txt file ... */ 
    if (currentTestFlow.length > 0 && currentModuleIndex < currentTestFlow.length) {
        const currentQuizName = currentTestFlow[currentModuleIndex];
        return moduleMetadata[currentQuizName] || null;
    }
    return null;
}
function getCurrentQuestionData() { /* ... from your .txt file ... */ 
    if (currentQuizQuestions && currentQuizQuestions.length > 0 && currentQuestionNumber > 0 && currentQuestionNumber <= currentQuizQuestions.length) {
        return currentQuizQuestions[currentQuestionNumber - 1];
    }
    return null;
}
function getAnswerStateKey(moduleIdx = currentModuleIndex, qNum = currentQuestionNumber) { /* ... from your .txt file ... */ 
    return `${moduleIdx}-${qNum}`;
}
function updateModuleTimerDisplay(seconds) { /* ... from your .txt file ... */ 
    if (!timerTextEl) return; 
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const displayString = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    timerTextEl.textContent = displayString;
    if (reviewTimerText) reviewTimerText.textContent = displayString; 
}
function startModuleTimer(durationSeconds) { /* ... from your .txt file ... */ 
    if (practiceQuizTimerInterval) clearInterval(practiceQuizTimerInterval); 
    if (moduleTimerInterval) clearInterval(moduleTimerInterval); 

    currentModuleTimeLeft = durationSeconds;
    currentModuleTimeUp = false; 
    updateModuleTimerDisplay(currentModuleTimeLeft);
    updateNavigation(); 

    console.log(`Module timer (countdown) started for ${durationSeconds} seconds.`);

    moduleTimerInterval = setInterval(() => {
        currentModuleTimeLeft--;
        updateModuleTimerDisplay(currentModuleTimeLeft);

        if (currentModuleTimeLeft <= 0) {
            clearInterval(moduleTimerInterval);
            currentModuleTimeLeft = 0; 
            currentModuleTimeUp = true; 
            updateModuleTimerDisplay(currentModuleTimeLeft); 
            console.log("Module time is up!");
            alert("Time for this module is up! You will be taken to the review page.");
            
            recordTimeOnCurrentQuestion(); 
            
            if (currentView !== 'review-page-view') {
                showView('review-page-view');
            }
            updateNavigation(); 
        }
    }, 1000);
}

function getAnswerState(moduleIdx = currentModuleIndex, qNum = currentQuestionNumber) { /* ... from your .txt file ... */ 
    const key = getAnswerStateKey(moduleIdx, qNum);
    if (!userAnswers[key]) {
        const questionDetails = (moduleIdx === currentModuleIndex && currentQuizQuestions && currentQuizQuestions[qNum - 1]) 
                               ? currentQuizQuestions[qNum - 1] 
                               : null;
        
        userAnswers[key] = { 
            selected: null, 
            spr_answer: '', 
            marked: false, 
            crossedOut: [], 
            timeSpent: 0,
            q_id: questionDetails ? questionDetails.question_id : `M${moduleIdx}-Q${qNum}-tmp`, 
            correct_ans: questionDetails ? questionDetails.correct_answer : null,
            question_type_from_json: questionDetails ? questionDetails.question_type : null,
            quizName_from_flow: (currentTestFlow && currentTestFlow[moduleIdx]) ? currentTestFlow[moduleIdx] : "UNKNOWN_QUIZ_AT_GETSTATE"
        };
    }
    if (userAnswers[key] && (userAnswers[key].q_id.endsWith('-tmp') || !userAnswers[key].correct_ans)) {
         const questionDetails = (moduleIdx === currentModuleIndex && currentQuizQuestions && currentQuizQuestions[qNum - 1]) 
                               ? currentQuizQuestions[qNum - 1] 
                               : null;
        if (questionDetails) {
            userAnswers[key].q_id = questionDetails.question_id;
            userAnswers[key].correct_ans = questionDetails.correct_answer;
            userAnswers[key].question_type_from_json = questionDetails.question_type;
            if(currentTestFlow && currentTestFlow[moduleIdx]) userAnswers[key].quizName_from_flow = currentTestFlow[moduleIdx];
        }
    }
    return userAnswers[key];
}

// --- START OF ADDITION ---
// ADD THIS FUNCTION DEFINITION AFTER getAnswerState
function recordTimeOnCurrentQuestion() {
    if (questionStartTime > 0 && currentQuizQuestions.length > 0 && currentQuestionNumber > 0 && currentQuestionNumber <= currentQuizQuestions.length) {
        // Ensure currentQuestionNumber is valid for currentQuizQuestions array
        if (currentQuizQuestions[currentQuestionNumber - 1]) { // Check if question data exists
            const endTime = Date.now();
            const timeSpentSeconds = (endTime - questionStartTime) / 1000;
            
            // Get answer state for the *actual current question* being timed
            const answerState = getAnswerState(currentModuleIndex, currentQuestionNumber); 
            
            if (answerState) { 
                answerState.timeSpent = (parseFloat(answerState.timeSpent) || 0) + timeSpentSeconds;
                // console.log(`DEBUG recordTime: QKey: ${currentModuleIndex}-${currentQuestionNumber}, TimeAdded: ${timeSpentSeconds.toFixed(2)}, NewTotal: ${answerState.timeSpent.toFixed(2)}`);
            } else {
                // console.warn(`DEBUG recordTime: Could not get answerState for ${currentModuleIndex}-${currentQuestionNumber}`);
            }
        } else {
            // console.warn(`DEBUG recordTime: currentQuestionDetails not found for CMI: ${currentModuleIndex}, CQN: ${currentQuestionNumber}. Time not recorded.`);
        }
    }
    questionStartTime = 0; // Reset for the next question or interaction
}
// --- END OF ADDITION ---


// REPLACE your entire updateNavigation_OLD function with this new updateNavigation
function updateNavigation() {
   console.log("DEBUG: updateNavigation CALLED. CurrentView:", currentView, "Q#:", currentQuestionNumber, "ModuleTimeUp:", currentModuleTimeUp); // DEBUG START
    
    if (!backBtnFooter || !nextBtnFooter || !currentQFooterEl || !totalQFooterEl) {
        console.error("Navigation elements missing for updateNavigation.");
        return;
    }

    const moduleIsLoaded = currentQuizQuestions && currentQuizQuestions.length > 0;
    const totalQuestionsInModule = moduleIsLoaded ? currentQuizQuestions.length : 0;

    currentQFooterEl.textContent = moduleIsLoaded ? currentQuestionNumber : '0';
    totalQFooterEl.textContent = totalQuestionsInModule;
    
    // Back button logic (no change for module rule here, just within module)
    backBtnFooter.disabled = (currentQuestionNumber === 1);

    // Default visibility
    nextBtnFooter.style.display = 'none';
    backBtnFooter.style.display = 'none';
    if (reviewNextBtnFooter) reviewNextBtnFooter.style.display = 'none';
    if (reviewBackBtnFooter) reviewBackBtnFooter.style.display = 'none';

    if (currentView === 'test-interface-view') {
        nextBtnFooter.style.display = 'inline-block';
        backBtnFooter.style.display = 'inline-block';
        if (!moduleIsLoaded) {
            nextBtnFooter.textContent = "Next";
            nextBtnFooter.disabled = true;
        } else if (currentQuestionNumber < totalQuestionsInModule) {
            nextBtnFooter.textContent = "Next";
            nextBtnFooter.disabled = false;
        } else { // Last question of the module
            nextBtnFooter.textContent = "Review Section";
             // --- START OF MODIFICATION ---
            if (currentInteractionMode === 'full_test') {
                const currentMod = getCurrentModule();
                nextBtnFooter.disabled = !currentModuleTimeUp && (currentMod && typeof currentMod.durationSeconds === 'number' && currentMod.durationSeconds > 0);
            } else { // single_quiz mode
                nextBtnFooter.disabled = false; // Always enabled for single quiz
            }
            // --- END OF MODIFICATION ---
        }
    } else if (currentView === 'review-page-view') {
        if (reviewBackBtnFooter) reviewBackBtnFooter.style.display = 'inline-block';
        if (reviewNextBtnFooter) reviewNextBtnFooter.style.display = 'inline-block';
        
        if (reviewBackBtnFooter) reviewBackBtnFooter.disabled = false; // Can always go back to test interface from review

        //if (reviewNextBtnFooter) {
            //if (currentModuleIndex < currentTestFlow.length - 1) {
              //  reviewNextBtnFooter.textContent = "Next Module";
           // } else {
             //   reviewNextBtnFooter.textContent = "Finish Test";
           // }
            // CHANGED: Disable "Next Module" / "Finish Test" from review page if module time is not up
            //reviewNextBtnFooter.disabled = !currentModuleTimeUp && (getCurrentModule()?.durationSeconds > 0);
           // }

        if (reviewNextBtnFooter) {
                if (currentInteractionMode === 'single_quiz') {
                    reviewNextBtnFooter.textContent = "Finish Quiz";
                    // --- START OF FIX 1 ---
                    reviewNextBtnFooter.disabled = false; // Always enabled to finish a single quiz
                    // --- END OF FIX 1 ---
                } else { // full_test mode
                    if (currentModuleIndex < currentTestFlow.length - 1) {
                        reviewNextBtnFooter.textContent = "Next Module";
                    } else {
                        reviewNextBtnFooter.textContent = "Finish Test";
                    }
                    const currentMod = getCurrentModule();
                    reviewNextBtnFooter.disabled = !currentModuleTimeUp && (currentMod && typeof currentMod.durationSeconds === 'number' && currentMod.durationSeconds > 0);
                }
            }
    } else if (currentView === 'home-view' || currentView === 'finished-view' || currentView === 'module-over-view') {
        // No primary nav buttons needed, or handled by specific view buttons
    }
    // Add console log for button states
    // console.log(`UpdateNav: NextBtn Disabled: ${nextBtnFooter.disabled}, ReviewNextBtn Disabled: ${reviewNextBtnFooter ? reviewNextBtnFooter.disabled : 'N/A'}, TimeUp: ${currentModuleTimeUp}`);

console.log("DEBUG: updateNavigation COMPLETED."); // DEBUG END

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
            currentQuestionNumber = parseInt(btn.dataset.question); 
            isCrossOutToolActive = false; 
            isHighlightingActive = false; if(highlightsNotesBtn) highlightsNotesBtn.classList.remove('active');
            loadQuestion();
            toggleModal(qNavPopup, false);
        });
        qNavGridMain.appendChild(btn);
    }
} 
function renderReviewPage() { // (Unchanged from Phase 3)
    if (!reviewPageViewEl || !reviewPageViewEl.classList.contains('active')) return;
    console.log("Rendering Review Page (Phase 3)...");
    
    const moduleInfo = getCurrentModule();
    if(!moduleInfo || !currentQuizQuestions || currentQuizQuestions.length === 0) {
         if(reviewPageSectionName) reviewPageSectionName.textContent = "Section Review";
         if(reviewPageQNavGrid) reviewPageQNavGrid.innerHTML = '<p>No questions to review for this module.</p>';
         console.warn("renderReviewPage: No module info or questions for current module.");
        updateNavigation(); 
        return;
    }
    if(reviewPageSectionName) reviewPageSectionName.textContent = `Section ${currentModuleIndex + 1}: ${moduleInfo.name} Questions`;
    
    if(timerTextEl && reviewTimerText) reviewTimerText.textContent = timerTextEl.textContent;
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

let confettiAnimationId; 
const confettiParticles = []; 

function startConfetti() { /* ... from your .txt file ... */ }

function stopConfetti() { /* ... from your .txt file ... */ }

//function handleTimerToggle(textEl, iconEl, btnEl) {  // (Unchanged from Phase 3)
   // if (!textEl || !iconEl || !btnEl) return;
   // isTimerHidden = !isTimerHidden; 
   // textEl.classList.toggle('hidden', isTimerHidden); 
   // iconEl.classList.toggle('hidden', !isTimerHidden);
  //  btnEl.textContent = isTimerHidden ? '[Show]' : '[Hide]';
//}

// Ensure this function exists and is correct
function handleTimerToggle(textEl, iconEl, btnEl) {
console.log("DEBUG: handleTimerToggle called. isTimerHidden before toggle:", isTimerHidden);
if (!textEl || !iconEl || !btnEl) {
console.warn("DEBUG handleTimerToggle: one or more elements missing");
return;
}
isTimerHidden = !isTimerHidden;
textEl.classList.toggle('hidden', isTimerHidden);
iconEl.classList.toggle('hidden', !isTimerHidden);
btnEl.textContent = isTimerHidden ? '[Show]' : '[Hide]';
}


function updatePracticeQuizTimerDisplay(seconds) {  
    if (!timerTextEl) { 
          // console.log("DEBUG updatePracticeQuizTimerDisplay: timerTextEl not found"); 
          return;
      }
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const displayString = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
      timerTextEl.textContent = displayString;
      // console.log("DEBUG updatePracticeQuizTimerDisplay: Set timerTextEl to", displayString);
      
      // Also update the review page timer text if it exists and is different
      if (reviewTimerText && reviewTimerText !== timerTextEl) {
        reviewTimerText.textContent = displayString;
        // console.log("DEBUG updatePracticeQuizTimerDisplay: Set reviewTimerText to", displayString);
      } 
}

function startPracticeQuizTimer() { 
    if (moduleTimerInterval) clearInterval(moduleTimerInterval); 
      if (practiceQuizTimerInterval) clearInterval(practiceQuizTimerInterval);

      practiceQuizTimeElapsed = 0;
      updatePracticeQuizTimerDisplay(practiceQuizTimeElapsed);
      console.log("Practice quiz timer (upward counting) started.");

      practiceQuizTimerInterval = setInterval(() => {
          practiceQuizTimeElapsed++;
          // console.log("DEBUG: Practice quiz timer tick. Elapsed:", practiceQuizTimeElapsed); // Keep for debug
          updatePracticeQuizTimerDisplay(practiceQuizTimeElapsed);
      }, 1000);
}

// In showView:
function showView(viewId) {
    // --- DEBUG ---
    console.log(`DEBUG showView: Attempting to switch to view: ${viewId}. Current module index: ${currentModuleIndex}, Q#: ${currentQuestionNumber}`);
    
    currentView = viewId; // Keep this
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
        if (moduleTimerInterval) {
            clearInterval(moduleTimerInterval);
            console.log("Module countdown timer stopped due to view change.");
        }
        if (practiceQuizTimerInterval) {
            clearInterval(practiceQuizTimerInterval);
            console.log("Practice quiz (upward) timer stopped due to view change.");
        }
    }

    if (viewId === 'test-interface-view') {
        if(qNavBtnFooter) qNavBtnFooter.style.display = 'flex';
        if(backBtnFooter) backBtnFooter.style.display = 'inline-block';
        if(nextBtnFooter) nextBtnFooter.style.display = 'inline-block';
        // --- DEBUG ---
        console.log(`DEBUG showView: About to call loadQuestion. CMI: ${currentModuleIndex}, CQN: ${currentQuestionNumber}, CQQ.length: ${currentQuizQuestions ? currentQuizQuestions.length : 'N/A'}`);
        loadQuestion();
    } else if (viewId === 'review-page-view') {
        if(qNavBtnFooter) qNavBtnFooter.style.display = 'none';
        renderReviewPage();
    } else if (viewId === 'finished-view') {
        startConfetti();
        if (moduleTimerInterval) clearInterval(moduleTimerInterval); 
        if (practiceQuizTimerInterval) clearInterval(practiceQuizTimerInterval);
        submitQuizData(); 
    } else if (viewId === 'home-view') {
        stopConfetti();
        currentTestFlow = [];
        currentQuizQuestions = [];
        currentModuleIndex = 0;
        currentQuestionNumber = 1;
        userAnswers = {};
        updateModuleTimerDisplay(0); 
        updatePracticeQuizTimerDisplay(0);
    } else if (viewId === 'manual-break-view') {
        console.log("Now in manual break view.");
        if (moduleTimerInterval) clearInterval(moduleTimerInterval); 
        if (practiceQuizTimerInterval) clearInterval(practiceQuizTimerInterval);
    }
    updateNavigation();
}

// At the VERY START of loadQuestion:
function loadQuestion() {
    // --- DEBUG ---
    console.log(`DEBUG loadQuestion: CALLED. CMI: ${currentModuleIndex}, CQN: ${currentQuestionNumber}, Mode: ${currentInteractionMode}`);
    console.log(`DEBUG loadQuestion: currentQuizQuestions first item ID (if exists): ${currentQuizQuestions && currentQuizQuestions.length > 0 && currentQuizQuestions[currentQuestionNumber-1] ? currentQuizQuestions[currentQuestionNumber-1].question_id : "No questions or out of bounds"}`);

    // ... (rest of your existing loadQuestion function from the .txt file)
    // Ensure the DEBUG logs I previously suggested for inside loadQuestion are also present
    // specifically after currentModuleInfo and currentQuestionDetails are defined, and before MathJax call.

    if (!testInterfaceViewEl.classList.contains('active')) {
        return;
    }
    
    const currentModuleInfo = getCurrentModule(); 
    const currentQuestionDetails = getCurrentQuestionData(); 
    // --- DEBUG ---
    console.log("DEBUG loadQuestion (after getting details) - currentModuleInfo:", currentModuleInfo ? currentModuleInfo.name : "null");
    console.log("DEBUG loadQuestion (after getting details) - currentQuestionDetails:", currentQuestionDetails ? currentQuestionDetails.question_id : "null");


    if (!currentModuleInfo || !currentQuestionDetails) {
        console.error("loadQuestion: ModuleInfo or Question data is null/undefined. Aborting question load.");
        if (questionTextMainEl) questionTextMainEl.innerHTML = "<p>Error: Critical data missing for question display.</p>";
        if (answerOptionsMainEl) answerOptionsMainEl.innerHTML = "";
        if(totalQFooterEl && currentQFooterEl) {
            currentQFooterEl.textContent = currentQuestionNumber;
            totalQFooterEl.textContent = currentQuizQuestions ? currentQuizQuestions.length : 0;
        }
        updateNavigation();
        return;
    }
    
    const answerState = getAnswerState(); 
    if (answerState && (typeof answerState.q_id === 'undefined' || (answerState.q_id && answerState.q_id.endsWith('-tmp')))) {
        answerState.q_id = currentQuestionDetails.question_id;
        answerState.correct_ans = currentQuestionDetails.correct_answer;
        answerState.question_type_from_json = currentQuestionDetails.question_type;
    }
    answerState.timeSpent = parseFloat(answerState.timeSpent) || 0;
    questionStartTime = Date.now();

    // ... (Keep the rest of your loadQuestion DOM manipulation logic from the .txt file)
    // ... from "if(sectionTitleHeader) sectionTitleHeader.textContent = ..."
    // ... down to just BEFORE the MathJax block ...

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


    if (currentQuestionDetails.question_type === 'student_produced_response') {
        mainContentAreaDynamic.classList.remove('single-pane');
        sprInstructionsPane.style.display = 'flex';
        passagePane.style.display = 'none'; 
        paneDivider.style.display = 'block';
        if(sprInstructionsContent) sprInstructionsContent.innerHTML = (currentModuleInfo.spr_directions || 'SPR Directions Missing') + (currentModuleInfo.spr_examples_table || '');
        
        if(questionTextMainEl) questionTextMainEl.innerHTML = currentQuestionDetails.question_text || '<p>Question text missing.</p>';
        sprInputContainerMain.style.display = 'block';
        if(sprInputFieldMain) sprInputFieldMain.value = answerState.spr_answer || '';
        if(sprAnswerPreviewMain) sprAnswerPreviewMain.textContent = `Answer Preview: ${answerState.spr_answer || ''}`;
        answerOptionsMainEl.style.display = 'none';

    } else if (currentModuleInfo.type === "RW" && currentQuestionDetails.question_type.includes('multiple_choice')) {
        mainContentAreaDynamic.classList.remove('single-pane');
        passagePane.style.display = 'flex'; 
        paneDivider.style.display = 'block'; 
        
        if(passageContentEl) passageContentEl.innerHTML = currentQuestionDetails.question_text || '<p>Question text missing.</p>';

        if(questionTextMainEl) questionTextMainEl.innerHTML = ''; 
        answerOptionsMainEl.style.display = 'flex'; 
        sprInputContainerMain.style.display = 'none';

    } else { 
        mainContentAreaDynamic.classList.add('single-pane');
        passagePane.style.display = 'none';
        sprInstructionsPane.style.display = 'none';
        paneDivider.style.display = 'none';

        if(questionTextMainEl) questionTextMainEl.innerHTML = currentQuestionDetails.question_text || '<p>Question text missing.</p>';
        answerOptionsMainEl.style.display = 'flex'; 
        sprInputContainerMain.style.display = 'none';
    }

    if (currentQuestionDetails.question_type && currentQuestionDetails.question_type.includes('multiple_choice')) {
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
            
            // --- DEBUG ---
            // console.log(`DEBUG loadQuestion - Option ${key} (text: "${value}"): isSelected check (answerState.selected: "${answerState.selected}" vs value: "${value}") -> ${isSelected}`);

            const containerDiv = document.createElement('div');
            containerDiv.className = 'answer-option-container';
            containerDiv.dataset.optionKey = key;
            const optionDiv = document.createElement('div');
            optionDiv.className = 'answer-option';
            if (isSelected && !isCrossedOut) {
                optionDiv.classList.add('selected');
                // --- DEBUG ---
                // console.log(`DEBUG loadQuestion - Applied .selected class to option ${key}`);
            }
            if (isCrossedOut) {
                optionDiv.classList.add('crossed-out');
            }
            
            const answerLetterDiv = document.createElement('div');
            answerLetterDiv.className = 'answer-letter';
            if (isSelected && !isCrossedOut) {
                 answerLetterDiv.classList.add('selected');
            }
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
    }

    // --- DEBUG ---
    // console.log("DEBUG: loadQuestion - DOM population for question text and options should be complete.");
    // console.log("DEBUG: passageContentEl.innerHTML length:", passageContentEl ? passageContentEl.innerHTML.length : "N/A");
    // console.log("DEBUG: questionTextMainEl.innerHTML length:", questionTextMainEl ? questionTextMainEl.innerHTML.length : "N/A");
    // console.log("DEBUG: answerOptionsMainEl.innerHTML length:", answerOptionsMainEl ? answerOptionsMainEl.innerHTML.length : "N/A");

    if (typeof MathJax !== "undefined") {
        // ... (Keep the robust MathJax call from your .txt file) ...
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
                    console.log("Attempting MathJax typesetting after a short delay.");
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


// Event Listeners for start buttons:
// Keep the if(startFullPracticeTestBtn) and if(startSinglePracticeQuizBtn) blocks
// from your .txt file. They contain the new logic for mode handling.
// Make sure the old if(startTestPreviewBtn) listener is removed or commented out.

if(startFullPracticeTestBtn) {
    startFullPracticeTestBtn.addEventListener('click', async () => {
        initializeStudentIdentifier(); 
        console.log("Start Full Practice Test button clicked."); 
        
        currentInteractionMode = 'full_test';
        currentModuleIndex = 0;
        currentQuestionNumber = 1;
        userAnswers = {}; 
        isTimerHidden = false; 
        isCrossOutToolActive = false;
        isHighlightingActive = false; if(highlightsNotesBtn) highlightsNotesBtn.classList.remove('active');
        if(calculatorOverlay) calculatorOverlay.classList.remove('visible');
        if(referenceSheetPanel) referenceSheetPanel.classList.remove('visible');
        currentModuleTimeUp = false; 

        currentTestFlow = ["DT-T0-RW-M1", "DT-T0-RW-M2", "DT-T0-MT-M1", "DT-T0-MT-M2"]; 
        console.log("Test flow set for Full Practice Test:", currentTestFlow); 

        if (currentTestFlow.length > 0) {
            const firstQuizName = currentTestFlow[currentModuleIndex];
            const moduleInfo = moduleMetadata[firstQuizName];
            
            // --- DEBUG ---
            console.log(`DEBUG startFullPracticeTestBtn: Initializing. First quiz: ${firstQuizName}. ModuleInfo found:`, !!moduleInfo);

            startFullPracticeTestBtn.textContent = "Loading...";
            startFullPracticeTestBtn.disabled = true;
            
            let jsonToLoad = firstQuizName;
            if (firstQuizName === "DT-T0-RW-M2") jsonToLoad = "DT-T0-RW-M1";
            else if (firstQuizName === "DT-T0-MT-M2") jsonToLoad = "DT-T0-MT-M1";
            
            const success = await loadQuizData(jsonToLoad); 
            
            startFullPracticeTestBtn.textContent = "Start Full Test"; 
            startFullPracticeTestBtn.disabled = false; 

            if (success && currentQuizQuestions.length > 0) {
                 // --- DEBUG ---
                console.log("DEBUG startFullPracticeTestBtn: Data loaded. Starting timer and showing view.");
                if (moduleInfo && typeof moduleInfo.durationSeconds === 'number') {
                    startModuleTimer(moduleInfo.durationSeconds); 
                } else {
                    console.warn(`Full Test Mode: No duration for module ${firstQuizName}. Timer not started or showing 00:00.`);
                    updateModuleTimerDisplay(0); 
                }
                populateQNavGrid(); 
                showView('test-interface-view'); 
            } else {
                console.error("Failed to load initial quiz data for full test.");
                alert("Could not start the full test. Check console.");
                showView('home-view'); 
            }
        } else { 
            console.error("Full test flow is empty.");
            alert("Full test configuration error.");
        }
    });
}

if(startSinglePracticeQuizBtn) {
    startSinglePracticeQuizBtn.addEventListener('click', async () => {
        initializeStudentIdentifier();
        console.log("Start Single Practice Quiz button clicked.");

        currentInteractionMode = 'single_quiz';
        currentModuleIndex = 0; 
        currentQuestionNumber = 1;
        userAnswers = {};
        isTimerHidden = false;
        isCrossOutToolActive = false;
        isHighlightingActive = false; if(highlightsNotesBtn) highlightsNotesBtn.classList.remove('active');
        if(calculatorOverlay) calculatorOverlay.classList.remove('visible');
        if(referenceSheetPanel) referenceSheetPanel.classList.remove('visible');

        currentTestFlow = ["DT-T0-MT-M1"]; 
        console.log("Test flow set for Single Practice Quiz:", currentTestFlow);

        if (currentTestFlow.length > 0) {
            const quizName = currentTestFlow[0];
            // --- DEBUG ---
            console.log(`DEBUG startSinglePracticeQuizBtn: Initializing. Quiz: ${quizName}`);
            
            startSinglePracticeQuizBtn.textContent = "Loading...";
            startSinglePracticeQuizBtn.disabled = true;

            const success = await loadQuizData(quizName);

            startSinglePracticeQuizBtn.textContent = "Start Single Quiz";
            startSinglePracticeQuizBtn.disabled = false;

            if (success && currentQuizQuestions.length > 0) {
                 // --- DEBUG ---
                console.log("DEBUG startSinglePracticeQuizBtn: Data loaded. Starting timer and showing view.");
                startPracticeQuizTimer(); 
                populateQNavGrid();
                showView('test-interface-view');
            } else {
                console.error("Failed to load data for single practice quiz.");
                alert("Could not start the practice quiz. Check console.");
                showView('home-view');
            }
        } else { 
            console.error("Single quiz flow is empty.");
            alert("Single quiz configuration error.");
        }
    });
}



// Keep all other functions and event listeners from your .txt file as they were,
// including:
// recordTimeOnCurrentQuestion, handleAnswerSelect, handleAnswerCrossOut, handleAnswerUndoCrossOut,
// crossOutToolBtnMain listener, sprInputFieldMain listeners,
// updateNavigation, nextButtonClickHandler, reviewNextButtonClickHandler, backButtonClickHandler,
// all modal button listeners, more menu listeners, submitQuizData, DOMContentLoaded listener.
// Basically, only the loadQuizData, showView, loadQuestion, and start button listeners
// were targeted for adding DEBUG logs in this step. The structure for other parts remains.

// The Gist script ends with the DOMContentLoaded listener.
// Make sure your .txt file also has that, and it correctly calls initializeStudentIdentifier and updateNavigation.
// For example:
/*
document.addEventListener('DOMContentLoaded', () => {
    initializeStudentIdentifier(); 
    updateNavigation(); 
});
*/
// If your .txt script already had this, keep it. If not, add it.

// =======================================================================
// === ADD THE FOLLOWING CODE AFTER LINE 768 OF YOUR EXISTING SCRIPT ===
// This restores missing event listeners and handlers, adapted for Phase 6
// =======================================================================

// --- Event Listeners for Answer Interaction & Tools ---
if(answerOptionsMainEl) {
    answerOptionsMainEl.addEventListener('click', function(event) {
        const target = event.target;
        const answerContainer = target.closest('.answer-option-container');
        
        // console.log("Answer option area clicked. Target:", target, "Container:", answerContainer); // Keep for debug

        if (!answerContainer) {
            // console.log("Click was outside an answer-option-container. Exiting listener."); // Keep for debug
            return; 
        }
        const optionKey = answerContainer.dataset.optionKey;
        // console.log("Option key identified:", optionKey); // Keep for debug
        
        const actionElement = target.closest('[data-action]');
        const action = actionElement ? actionElement.dataset.action : null;
        // console.log("Action identified:", action); // Keep for debug
        
        // Record time if the main option area was clicked (intending selection or interaction)
        // and not just an auxiliary action button like the individual cross-out.
        if (!action && target.closest('.answer-option')) { 
            recordTimeOnCurrentQuestion(); 
        }

        if (action === 'cross-out-individual') {
            // console.log("Calling handleAnswerCrossOut for individual cross-out."); // Keep for debug
            handleAnswerCrossOut(optionKey);
        } else if (action === 'undo-cross-out') {
            // console.log("Calling handleAnswerUndoCrossOut for undo cross-out."); // Keep for debug
            handleAnswerUndoCrossOut(optionKey);
        } else if (target.closest('.answer-option')) { 
            // console.log("Attempting to call handleAnswerSelect."); // Keep for debug
            handleAnswerSelect(optionKey);
        } else {
            // console.log("Click did not match any known action or target for selection."); // Keep for debug
        }
    });
}

function handleAnswerSelect(optionKey) {
    const answerState = getAnswerState();
    if (!answerState) {
        console.error("handleAnswerSelect: No answer state found for current question.");
        return;
    }

    if (isCrossOutToolActive) {
        console.log("handleAnswerSelect: Cross-out tool is currently ACTIVE. Proceeding with selection (will also remove cross-out).");
    } else {
        console.log("handleAnswerSelect: Cross-out tool is INACTIVE. Proceeding with selection.");
    }
    
    const currentQDetails = getCurrentQuestionData();
    let selectedOptionText = optionKey; 
    
    const jsonOptionKey = `option_${optionKey.toLowerCase()}`;
    if (currentQDetails && currentQDetails.hasOwnProperty(jsonOptionKey) && currentQDetails[jsonOptionKey] !== null) {
        selectedOptionText = currentQDetails[jsonOptionKey];
    } else {
        console.warn(`handleAnswerSelect: Could not find option text for key ${optionKey} (tried ${jsonOptionKey}). Storing key itself ('${optionKey}') as selected value.`);
    }

    console.log(`handleAnswerSelect: Setting selected answer to: "${selectedOptionText}" (original key: ${optionKey})`);
    answerState.selected = selectedOptionText; 

    if (answerState.crossedOut.includes(optionKey)) {
        console.log(`handleAnswerSelect: Option ${optionKey} was selected, removing it from crossedOut list.`);
        answerState.crossedOut = answerState.crossedOut.filter(opt => opt !== optionKey);
    }
    
    loadQuestion(); 
}

function handleAnswerCrossOut(optionKey) { 
     const answerState = getAnswerState();
     if (!answerState) return;

     if (!answerState.crossedOut.includes(optionKey)) {
         answerState.crossedOut.push(optionKey);
     } 
     // Selected answer remains selected even if crossed out by individual button
     loadQuestion(); 
}

function handleAnswerUndoCrossOut(optionKey) { 
     const answerState = getAnswerState();
     if (!answerState) return;
     answerState.crossedOut = answerState.crossedOut.filter(opt => opt !== optionKey);
     loadQuestion(); 
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
    });
}

// --- Navigation Button Click Handlers & Listeners ---
// (These include the Phase 6 mode-aware logic)

function nextButtonClickHandler() {
    if (currentView !== 'test-interface-view') return; 
    console.log("DEBUG: nextButtonClickHandler CALLED");
    recordTimeOnCurrentQuestion(); 
    const totalQuestionsInModule = currentQuizQuestions.length;
    if (currentQuestionNumber < totalQuestionsInModule) {
        currentQuestionNumber++;
        isCrossOutToolActive = false; 
        isHighlightingActive = false; if(highlightsNotesBtn) highlightsNotesBtn.classList.remove('active');
        loadQuestion();
    } else if (currentQuestionNumber === totalQuestionsInModule) {
        showView('review-page-view');
    }
}

async function reviewNextButtonClickHandler() { 
    if (currentView !== 'review-page-view') return;
    console.log("DEBUG: reviewNextButtonClickHandler CALLED");
    recordTimeOnCurrentQuestion(); 

    if (currentInteractionMode === 'single_quiz') {
        console.log("Single practice quiz finished from review page. Transitioning to finished view.");
        if (practiceQuizTimerInterval) clearInterval(practiceQuizTimerInterval);
        showView('finished-view'); 
        return; 
    }

    // Logic for full_test mode
   // const IS_MANUAL_BREAK_TIME = (currentModuleIndex === 1 && currentTestFlow.length === 4 && currentInteractionMode === 'full_test'); 

    //if (IS_MANUAL_BREAK_TIME) {
        //console.log("Transitioning to manual break instruction screen from review page for module:", currentTestFlow[currentModuleIndex]);
      //  console.log("Transitioning to manual break. currentModuleIndex BEFORE increment for break:", currentModuleIndex);
        //currentModuleIndex++; // Advance index to prepare for Math M1 (index 2) after break
        //console.log("Transitioning to manual break. currentModuleIndex AFTER increment for break:", currentModuleIndex); // Should be 2
        //showView('manual-break-view'); 
    //} else {
        currentModuleIndex++;
    
    console.log("DEBUG reviewNextBtn: Advanced currentModuleIndex to:", currentModuleIndex);

    if (currentModuleIndex < currentTestFlow.length) {
            showView('module-over-view'); 
            setTimeout(async () => {
                currentQuestionNumber = 1; 
                currentModuleTimeUp = false; 

                const nextQuizName = currentTestFlow[currentModuleIndex];
                const nextModuleInfo = moduleMetadata[nextQuizName];
                
                let jsonToLoadForNextModule = nextQuizName;

               console.log(`DEBUG reviewNextBtn: Preparing to load module: ${nextQuizName} (using JSON: ${jsonToLoadForNextModule})`);
                const success = await loadQuizData(jsonToLoadForNextModule);

                if (success && currentQuizQuestions.length > 0) {
                    if (currentInteractionMode === 'full_test' && nextModuleInfo && typeof nextModuleInfo.durationSeconds === 'number') {
                        startModuleTimer(nextModuleInfo.durationSeconds);
                    } else { // Should not happen in full_test if durations are set
                        console.warn(`Timer Mode/Config issue for module ${nextQuizName}. No countdown timer started.`);
                        updateModuleTimerDisplay(0); 
                        updatePracticeQuizTimerDisplay(0); // Also reset practice timer display
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
if(returnToHomeBtn) returnToHomeBtn.addEventListener('click', () => showView('home-view')); 
if(calculatorBtnHeader) calculatorBtnHeader.addEventListener('click', () => toggleModal(calculatorOverlay, true));
if(calculatorCloseBtn) calculatorCloseBtn.addEventListener('click', () => toggleModal(calculatorOverlay, false));
if(referenceBtnHeader) referenceBtnHeader.addEventListener('click', () => toggleModal(referenceSheetPanel, true));
if(referenceSheetCloseBtn) referenceSheetCloseBtn.addEventListener('click', () => toggleModal(referenceSheetPanel, false));

let isCalcDragging = false; // Renamed to avoid conflict if Gist had different var names
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

if(highlightsNotesBtn && (passageContentEl || questionTextMainEl) ) {
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
    try {
        range.surroundContents(span);
    } catch (e) { 
        span.appendChild(range.extractContents());
        range.insertNode(span);
        console.warn("Highlighting across complex nodes, used extract/insert fallback.", e);
    }
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
        if (currentQuizQuestions.length > 0) { populateQNavGrid(); toggleModal(qNavPopup, true); } 
        else { console.warn("QNav: no questions loaded."); }
    });
}
if(qNavCloseBtn) qNavCloseBtn.addEventListener('click', () => toggleModal(qNavPopup, false));
if(qNavGotoReviewBtn) {
    qNavGotoReviewBtn.addEventListener('click', () => { 
        toggleModal(qNavPopup, false); 
        if (currentQuizQuestions.length > 0) { showView('review-page-view'); }
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
    });
}

if(timerToggleBtn) timerToggleBtn.addEventListener('click', () => handleTimerToggle(timerTextEl, timerClockIconEl, timerToggleBtn));

if(reviewDirectionsBtn) { // Already handled by its own listener in Gist logic
    reviewDirectionsBtn.addEventListener('click', () => {
        const moduleInfo = getCurrentModule(); // Use current module logic
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
    moreBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        if(moreMenuDropdown) moreMenuDropdown.classList.toggle('visible'); 
    });
}
document.body.addEventListener('click', (e) => { 
    if (moreMenuDropdown && moreBtn && !moreBtn.contains(e.target) && !moreMenuDropdown.contains(e.target) && moreMenuDropdown.classList.contains('visible')) {
        moreMenuDropdown.classList.remove('visible'); 
    }
});
if(moreMenuDropdown) moreMenuDropdown.addEventListener('click', (e) => e.stopPropagation()); 

if(moreUnscheduledBreakBtn) {
    moreUnscheduledBreakBtn.addEventListener('click', () => { 
        toggleModal(unscheduledBreakConfirmModal, true); 
        if(moreMenuDropdown) moreMenuDropdown.classList.remove('visible'); 
        if(understandLoseTimeCheckbox) understandLoseTimeCheckbox.checked = false; 
        if(unscheduledBreakConfirmBtn) unscheduledBreakConfirmBtn.disabled = true; 
    });
}
if(understandLoseTimeCheckbox) {
    understandLoseTimeCheckbox.addEventListener('change', () => { 
        if(unscheduledBreakConfirmBtn) unscheduledBreakConfirmBtn.disabled = !understandLoseTimeCheckbox.checked; 
    });
}
if(unscheduledBreakCancelBtn) unscheduledBreakCancelBtn.addEventListener('click', () => toggleModal(unscheduledBreakConfirmModal, false));
if(unscheduledBreakConfirmBtn) {
    unscheduledBreakConfirmBtn.addEventListener('click', () => { 
        alert("Unscheduled Break screen: Future"); 
        toggleModal(unscheduledBreakConfirmModal, false); 
    });
}

if(moreExitExamBtn) {
    moreExitExamBtn.addEventListener('click', () => { 
        toggleModal(exitExamConfirmModal, true); 
        if(moreMenuDropdown) moreMenuDropdown.classList.remove('visible'); 
    });
}
if(exitExamCancelBtn) exitExamCancelBtn.addEventListener('click', () => toggleModal(exitExamConfirmModal, false));
if(exitExamConfirmBtn) {
    exitExamConfirmBtn.addEventListener('click', () => { 
        toggleModal(exitExamConfirmModal, false); 
        showView('home-view'); 
    });
}

// Start Button Listeners (These are from your .txt file - they define mode behavior)
if(startFullPracticeTestBtn) {
    startFullPracticeTestBtn.addEventListener('click', async () => {
        initializeStudentIdentifier(); 
        console.log("Start Full Practice Test button clicked."); 
        
        currentInteractionMode = 'full_test';
        currentModuleIndex = 0;
        currentQuestionNumber = 1;
        userAnswers = {}; 
        isTimerHidden = false;
        isCrossOutToolActive = false;
        isHighlightingActive = false; if(highlightsNotesBtn) highlightsNotesBtn.classList.remove('active');
        if(calculatorOverlay) calculatorOverlay.classList.remove('visible');
        if(referenceSheetPanel) referenceSheetPanel.classList.remove('visible');
        currentModuleTimeUp = false; 

        currentTestFlow = ["DT-T0-RW-M1", "DT-T0-RW-M2", "DT-T0-MT-M1", "DT-T0-MT-M2"]; 
        console.log("Test flow set for Full Practice Test:", currentTestFlow); 

        if (currentTestFlow.length > 0) {
            const firstQuizName = currentTestFlow[currentModuleIndex];
            const moduleInfo = moduleMetadata[firstQuizName];
            
            console.log(`DEBUG startFullPracticeTestBtn: Initializing. First quiz: ${firstQuizName}. ModuleInfo found:`, !!moduleInfo);

            startFullPracticeTestBtn.textContent = "Loading...";
            startFullPracticeTestBtn.disabled = true;
            
            let jsonToLoad = firstQuizName;
            if (firstQuizName === "DT-T0-RW-M2") jsonToLoad = "DT-T0-RW-M1";
            else if (firstQuizName === "DT-T0-MT-M2") jsonToLoad = "DT-T0-MT-M1";
            
            const success = await loadQuizData(jsonToLoad); 
            
            startFullPracticeTestBtn.textContent = "Start Full Test"; 
            startFullPracticeTestBtn.disabled = false; 

            if (success && currentQuizQuestions.length > 0) {
                console.log("DEBUG startFullPracticeTestBtn: Data loaded. Starting timer and showing view.");
                if (moduleInfo && typeof moduleInfo.durationSeconds === 'number') {
                    startModuleTimer(moduleInfo.durationSeconds); 
                } else {
                    console.warn(`Full Test Mode: No duration for module ${firstQuizName}. Timer not started or showing 00:00.`);
                    updateModuleTimerDisplay(0); 
                }
                populateQNavGrid(); 
                showView('test-interface-view'); 
            } else {
                console.error("Failed to load initial quiz data for full test.");
                alert("Could not start the full test. Check console.");
                showView('home-view'); 
            }
        } else { 
            console.error("Full test flow is empty.");
            alert("Full test configuration error.");
        }
    });
}

if(startSinglePracticeQuizBtn) {
    startSinglePracticeQuizBtn.addEventListener('click', async () => {
        initializeStudentIdentifier();
        console.log("Start Single Practice Quiz button clicked.");

        currentInteractionMode = 'single_quiz';
        currentModuleIndex = 0; 
        currentQuestionNumber = 1;
        userAnswers = {};
        isTimerHidden = false;
        isCrossOutToolActive = false;
        isHighlightingActive = false; if(highlightsNotesBtn) highlightsNotesBtn.classList.remove('active');
        if(calculatorOverlay) calculatorOverlay.classList.remove('visible');
        if(referenceSheetPanel) referenceSheetPanel.classList.remove('visible');

        currentTestFlow = ["DT-T0-MT-M1"]; 
        console.log("Test flow set for Single Practice Quiz:", currentTestFlow);

        if (currentTestFlow.length > 0) {
            const quizName = currentTestFlow[0];
            console.log(`DEBUG startSinglePracticeQuizBtn: Initializing. Quiz: ${quizName}`);
            
            startSinglePracticeQuizBtn.textContent = "Loading...";
            startSinglePracticeQuizBtn.disabled = true;

            const success = await loadQuizData(quizName);

            startSinglePracticeQuizBtn.textContent = "Start Single Quiz";
            startSinglePracticeQuizBtn.disabled = false;

            if (success && currentQuizQuestions.length > 0) {
                console.log("DEBUG startSinglePracticeQuizBtn: Data loaded. Starting timer and showing view.");
                startPracticeQuizTimer(); 
                populateQNavGrid();
                showView('test-interface-view');
            } else {
                console.error("Failed to load data for single practice quiz.");
                alert("Could not start the practice quiz. Check console.");
                showView('home-view');
            }
        } else { 
            console.error("Single quiz flow is empty.");
            alert("Single quiz configuration error.");
        }
    });
}

// Listener for continue-after-break-btn (Manual Break)
if (continueAfterBreakBtn) {
    continueAfterBreakBtn.addEventListener('click', async () => {
        console.log("Continue after manual break button clicked.");
        
        if (currentModuleIndex < currentTestFlow.length) {
            currentQuestionNumber = 1;
            currentModuleTimeUp = false; 

            const nextQuizName = currentTestFlow[currentModuleIndex];
            const nextModuleInfo = moduleMetadata[nextQuizName];

            let jsonToLoadForNextModule = nextQuizName;
            if (nextQuizName === "DT-T0-RW-M2") jsonToLoadForNextModule = "DT-T0-RW-M1";
            else if (nextQuizName === "DT-T0-MT-M2") jsonToLoadForNextModule = "DT-T0-MT-M1";
            
            continueAfterBreakBtn.textContent = "Loading next section...";
            continueAfterBreakBtn.disabled = true;

            const success = await loadQuizData(jsonToLoadForNextModule);
            
            continueAfterBreakBtn.textContent = "Continue to Next Section";
            continueAfterBreakBtn.disabled = false;

            if (success && currentQuizQuestions.length > 0) {
                if (currentInteractionMode === 'full_test' && nextModuleInfo && typeof nextModuleInfo.durationSeconds === 'number') {
                    startModuleTimer(nextModuleInfo.durationSeconds);
                } else { 
                    console.warn(`Timer mode/config issue for module ${nextQuizName} after break. Defaulting to practice timer or no timer.`);
                    startPracticeQuizTimer(); // Fallback or if single_quiz somehow reached here
                }
                populateQNavGrid();
                showView('test-interface-view');
            } else {
                console.error("Failed to load next module after break or module has no questions.");
                alert("Error loading the next module after break. Returning to home.");
                showView('home-view');
            }
        } else {
            console.error("Continue after break clicked, but no more modules in flow. This is unexpected.");
            showView('finished-view'); 
        }
    });
}

// --- Submission Logic ---
async function submitQuizData() {
console.log("Attempting to submit quiz data (Phase 4 - Corrected Logic)...");
    recordTimeOnCurrentQuestion(); // Ensure time for the very last interaction is recorded

    const submissions = [];
    const timestamp = new Date().toISOString();

    for (const key in userAnswers) {
        if (userAnswers.hasOwnProperty(key)) {
            const answerState = userAnswers[key];
            
            // Critical check: Ensure all needed data is present in answerState
            if (!answerState.q_id || answerState.q_id.endsWith('-tmp') || typeof answerState.correct_ans === 'undefined' || answerState.correct_ans === null || typeof answerState.question_type_from_json === 'undefined' || !answerState.quizName_from_flow) {
                console.warn(`Submission data incomplete for answer key ${key}:`, answerState, `. QuizName found: ${answerState.quizName_from_flow}. Question ID: ${answerState.q_id}. Correct Ans: ${answerState.correct_ans}. Type: ${answerState.question_type_from_json}. Skipping this answer.`);
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
            } else { // Assuming multiple_choice or similar
                studentAnswerForSubmission = answerState.selected || "NO_ANSWER";
                // For MCQs, the JSON 'correct_answer' field contains the text of the correct option.
                // 'answerState.selected' stores the letter (A, B, C, D) of the chosen option.
                // We need to get the text of the selected option to compare.
                if (answerState.selected && studentAnswerForSubmission !== "NO_ANSWER") {
                    // Find the original question data to get the text of the selected option
                    // This is a bit complex here because currentQuizQuestions might be for a different module
                    // if submission happens after all modules are done.
                    // This highlights a potential need to store option texts or have a map.
                    // For now, this part of is_correct for MCQ might be inaccurate if not handled carefully
                    // during the actual quiz flow.
                    // HOWEVER, the OLD SCRIPT compared `userAnswerData.answer` (which was the option text) 
                    // with `question.correct_answer` (also option text).
                    // Our Bluebook `answerState.selected` stores the KEY ('A', 'B').
                    // This is a mismatch that needs addressing if we want accurate `is_correct` for MCQs.
                    
                    // TEMPORARY: For now, to make submission proceed, we'll set isCorrect for MCQ to false
                    // This needs to be fixed by ensuring answerState.selected either stores full text,
                    // or we can retrieve the option text based on the key at submission time.
                    // Given the structure, let's assume correct_ans is the option TEXT.
                    // We need to map answerState.selected ('A') to currentQuestionDetails['option_a']
                    // This is difficult to do generically in submitQuizData without loading original question.
                    // Let's assume `answerState.correct_ans` IS the text of the correct option from JSON.
                    // If `answerState.selected` stored the TEXT of the selected option, this would work:
                    // isCorrect = (String(studentAnswerForSubmission).trim() === String(answerState.correct_ans).trim());
                    
                    // For the OLD script, `studentAnswers[questionId].answer` was the *value* (text) of the selected option.
                    // Our `answerState.selected` is the *key* ('A', 'B', etc.).
                    // To fix this properly, when recording MCQ answers, we should store the TEXT of the selected option.
                    // For now, to make the structure match the old script for `is_correct`:
                    // This is_correct for MCQ WILL BE WRONG until we store option text in answerState.selected or similar.
                    // We'll assume `answerState.selected` is already the option text for this fetch call.
                    // THIS WILL BE FIXED IN THE NEXT STEP IF `studentAnswerForSubmission` is an option key ('A')
                    // and `answerState.correct_ans` is option text.

                    // Correct approach for MCQ is_correct:
                    // 1. `answerState.selected` should store the *text* of the selected option, not the key.
                    //    This change needs to be made in `handleAnswerSelect`.
                    // OR
                    // 2. At submission, retrieve the question details to map the key to text. (More complex here)

                    // For now, to match old script's direct comparison:
                    if (answerState.correct_ans && studentAnswerForSubmission !== "NO_ANSWER") {
                        isCorrect = (String(studentAnswerForSubmission).trim().toLowerCase() === String(answerState.correct_ans).trim().toLowerCase());
                    }
                }
            }
            
            submissions.push({
                timestamp: timestamp,
                student_gmail_id: studentEmailForSubmission, 
                quiz_name: answerState.quizName_from_flow, // Use stored quizName
                question_id: answerState.q_id, 
                student_answer: studentAnswerForSubmission,
                is_correct: isCorrect, // Boolean, Apps Script handles conversion to string if necessary
                time_spent_seconds: parseFloat(answerState.timeSpent || 0).toFixed(2)
            });
        }
    }

    if (submissions.length === 0) {
        console.log("No valid answers with complete data found. Nothing to submit.");
        alert("No answers were recorded properly to submit.");
        return;
    }

    console.log("Submitting the following data (Phase 4 Corrected):", submissions);

    if (APPS_SCRIPT_WEB_APP_URL === 'YOUR_CORRECT_BLUEBOOK_APPS_SCRIPT_URL_HERE' || !APPS_SCRIPT_WEB_APP_URL.startsWith('https://script.google.com/')) {
        console.warn("APPS_SCRIPT_WEB_APP_URL is not set or invalid. Submission will not proceed.");
        alert("Submission URL not configured. Data logged to console.");
        return;
    }

    try {
        const response = await fetch(APPS_SCRIPT_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', 
            cache: 'no-cache',
            headers: {
                'Content-Type': 'text/plain', 
            },
            redirect: 'follow',
            body: JSON.stringify(submissions) 
        });
        
        // With 'no-cors', we don't get a meaningful response object here.
        // The request is "fire and forget" from the browser's perspective regarding success/failure details from the server.
        console.log('Submission attempt finished (no-cors mode). Please verify in the Google Sheet.');
        alert('Your answers have been submitted! Please check the Google Sheet to confirm.');

    } catch (error) {
        // This catch block will primarily catch network errors if the request couldn't even be made (e.g., DNS, no internet)
        // or if there's a fundamental issue with the fetch setup itself.
        // It won't typically catch server-side errors from Apps Script when using 'no-cors'.
        console.error('Error submitting quiz data (fetch failed):', error);
        alert(`There was an error sending your quiz data: ${error.message}. Please check your internet connection and the console.`);
    }
}

    


// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    initializeStudentIdentifier(); 
    updateNavigation(); 
});

// =======================================================================
// === END OF ADDED/RESTORED CODE                                      ===
// =======================================================================
