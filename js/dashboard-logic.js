// --- DUMMY DATA (Will be replaced by fetched data) ---
// Keep the structure for reference, but its values will be overridden.
let currentStudentData = {
    name: "Loading Data...", // Initial placeholder
    targetScore: 1400, // This can be hardcoded or fetched if available in CSV
    latestScores: { total: 0, rw: 0, math: 0, avgEocKhan: 0 },
    timeSpent: { studentAvg: 0, studentUnit: "min / day", classAvg: 0, classUnit: "min / day"},
    scoreTrend: { labels: [], studentScores: [], classAvgScores: [] },
    overallSkillPerformance: { labels: [], studentAccuracy: [], classAvgAccuracy: [] },

    cbPracticeTests: [],
    eocQuizzes: {
        reading: [],
        writing: [],
        math: []
    },
    khanAcademy: {
        reading: [],
        writing: [],
        math: []
    },
    skills: {
        reading: [],
        writing: [],
        math: []
    },
    chapters: { // This mapping is static and can remain as is
        math: [
            "1: Exponents & Radicals", "2: Percent", "3: Exponential & Linear Growth",
            "4: Rates", "5: Ratio & Proportion", "6: Expressions", "7: Constructing Models",
            "8: Manipulating & Solving Equations", "9: More Equation Solving Strategies",
            "10: Systems of Equations", "11: Inequalities", "12: Word Problems",
            "13: Min & Max Word Problems", "14: Lines", "15: Interpreting Linear Models",
            "16: Functions", "17: Quadratics", "18: Synthetic Division", "19: Complex Numbers",
            "20: Absolute Value", "21: Angles", "22: Triangles", "23: Circles", "24: Trigonometry",
            "25: Reading Data", "26: Probability", "27: Statistics 1", "28: Statistics 2", "29: Volume"
        ],
        writing: [
            "1: Transitions", "2: Specific Focus", "3: Sentences & Fragments",
            "4: Joining & Separating Sentences", "5: Joining Sentences & Fragments",
            "6: Non-Essential & Essential Clauses", "7: Additional Comma Uses & Misuses",
            "8: Verbs Agreements and Tense", "9: Pronouns", "10: Apostrophes",
            "11: Modification", "12: Parallel Structure", "13: Word Pairs", "14: Question Marks",
            "Appendix: Parts of Speech"
        ],
        reading: [
            "1: Overview of SAT Reading", "2: Vocabulary in Context", "3: Making the Leap",
            "4: The Big Picture", "5: Literal Comprehension", "6: Reading for Function",
            "7: Text Completions", "8: Supporting & Undermining", "9: Graphs & Charts",
            "10: Paired Passages", "Appendix: Question Types"
        ]
    }
};

// Global array to hold all questions for easy access (will be populated from fetched data)
let ALL_DASHBOARD_QUESTIONS = [];

// --- MAPPING SAT SKILLS TO BOOK CHAPTERS (extracted from your PDF) ---
const SAT_CHAPTER_SKILL_MAPPING = {
    math: {
        "Understanding and applying properties of exponents": ["1: Exponents & Radicals"],
        "working with radical expressions": ["1: Exponents & Radicals"],
        "understanding rational exponents": ["1: Exponents & Radicals"],
        "Calculating and applying percentages": ["2: Percent"],
        "percent increase/decrease": ["2: Percent"],
        "solving word problems involving percents": ["2: Percent"],
        "Identifying, interpreting, and comparing linear and exponential growth models": ["3: Exponential & Linear Growth"],
        "creating and solving equations from these models": ["3: Exponential & Linear Growth"],
        "Calculating and applying rates, including unit rates, speed, and work rates": ["4: Rates"],
        "unit conversions": ["4: Rates"],
        "Setting up and solving problems involving ratios and proportions": ["5: Ratio & Proportion"],
        "Manipulating and simplifying algebraic expressions, including polynomials": ["6: Expressions"],
        "factoring": ["6: Expressions"],
        "Translating word problems into algebraic equations or inequalities": ["7: Constructing Models"],
        "creating linear and nonlinear models": ["7: Constructing Models"],
        "Solving linear equations in one or more variables": ["8: Manipulating & Solving Equations"],
        "solving various forms of nonlinear equations": ["8: Manipulating & Solving Equations"],
        "Applying advanced strategies to solve complex equations, including those involving quadratics, absolute values, and systems": ["9: More Equation Solving Strategies"],
        "Solving systems of two linear equations in two variables using various methods (substitution, elimination)": ["10: Systems of Equations"],
        "Solving linear inequalities in one or two variables": ["11: Inequalities"],
        "graphing solutions": ["11: Inequalities"],
        "Applying algebraic and arithmetic skills to solve a variety of contextualized problems": ["12: Word Problems"],
        "Solving optimization problems, often by finding the vertex of a quadratic function or analyzing inequalities": ["13: Min & Max Word Problems"],
        "Understanding and applying properties of lines, including slope, intercepts, and equations of lines": ["14: Lines"],
        "Interpreting the slope and intercepts of linear models in context": ["15: Interpreting Linear Models"],
        "making predictions (linear models)": ["15: Interpreting Linear Models"],
        "Understanding function notation, domain, range": ["16: Functions"],
        "evaluating functions": ["16: Functions"],
        "transformations (functions)": ["16: Functions"],
        "composition of functions": ["16: Functions"],
        "Solving quadratic equations (factoring, quadratic formula, completing the square)": ["17: Quadratics"],
        "graphing parabolas": ["17: Quadratics"],
        "understanding properties of quadratic functions": ["17: Quadratics"],
        "Performing polynomial division (specifically synthetic division)": ["18: Synthetic Division"],
        "finding roots of polynomials": ["18: Synthetic Division"],
        "Performing operations with complex numbers": ["19: Complex Numbers"],
        "Solving equations and inequalities involving absolute value": ["20: Absolute Value"],
        "Understanding and applying angle relationships": ["21: Angles"],
        "Applying properties of triangles, including Pythagorean theorem, similar triangles, special right triangles, and basic trigonometric ratios": ["22: Triangles"],
        "Understanding and applying properties of circles, including equations, radius, diameter, circumference, area, arc length, and sector area": ["23: Circles"],
        "Applying trigonometric ratios (sine, cosine, tangent) in right triangles": ["24: Trigonometry"],
        "understanding radians and the unit circle (basics)": ["24: Trigonometry"],
        "Interpreting and analyzing data presented in tables, charts, and graphs (scatterplots, bar graphs, line graphs)": ["25: Reading Data"],
        "Calculating basic probabilities, including compound events": ["26: Probability"],
        "Calculating and interpreting measures of central tendency (mean, median, mode) and spread (range)": ["27: Statistics 1"],
        "Understanding standard deviation, distributions (like normal distribution basics), and basic statistical inference": ["28: Statistics 2"],
        "Calculating the volume of 3D shapes (e.g., prisms, cylinders, cones, spheres)": ["29: Volume"]
    },
    writing: {
        "Choosing the most logical and effective transition words or phrases to connect ideas, sentences, and paragraphs": ["1: Transitions"],
        "Ensuring writing is concise, precise, and directly relevant to the rhetorical situation or main idea": ["2: Specific Focus"],
        "eliminating redundancy": ["2: Specific Focus"],
        "Identifying and correcting sentence fragments and run-on sentences": ["3: Sentences & Fragments"],
        "ensuring complete sentence structures": ["3: Sentences & Fragments"],
        "Correctly using punctuation (commas, semicolons, colons) and conjunctions to join or separate independent and dependent clauses": ["4: Joining & Separating Sentences"],
        "Advanced application of rules for combining clauses and phrases, avoiding fragments and run-ons": ["5: Joining Sentences & Fragments"],
        "Correctly punctuating restrictive (essential) and non-restrictive (non-essential) clauses, primarily with commas": ["6: Non-Essential & Essential Clauses"],
        "Applying comma rules for items in a series, introductory elements, appositives, interrupters, and avoiding common misuses like comma splices": ["7: Additional Comma Uses & Misuses"],
        "Ensuring subject-verb agreement and consistent, appropriate verb tense": ["8: Verbs Agreements and Tense"],
        "Ensuring pronoun-antecedent agreement, correct pronoun case (subjective, objective, possessive), and clear pronoun reference": ["9: Pronouns"],
        "Correctly using apostrophes for possessive nouns, possessive pronouns (or lack thereof), and contractions": ["10: Apostrophes"],
        "Ensuring modifiers (adjectives, adverbs, phrases, clauses) are correctly placed to modify the intended word and avoiding dangling or misplaced modifiers": ["11: Modification"],
        "Maintaining parallel grammatical structure for items in a list, series, or comparison": ["12: Parallel Structure"],
        "Choosing the correct word from commonly confused pairs (e.g., affect/effect)": ["13: Word Pairs"],
        "understanding idiomatic expressions": ["13: Word Pairs"],
        "Correctly using question marks at the end of direct questions": ["14: Question Marks"],
        "Understanding the function of different parts of speech as a foundation for other grammar rules": ["Appendix: Parts of Speech"]
    },
    reading: {
        "Understanding the overall structure and approach to the Reading and Writing section": ["1: Overview of SAT Reading"],
        "Determining the meaning of words and phrases as they are used in particular contexts within the passage": ["2: Vocabulary in Context"],
        "Drawing logical inferences and conclusions based on information stated or implied in the text": ["3: Making the Leap"],
        "Identifying the main idea or central theme of a passage or a significant portion of it": ["4: The Big Picture"],
        "Locating and understanding explicitly stated information and details within the text": ["5: Literal Comprehension"],
        "Analyzing how specific words, phrases, sentences, or paragraphs contribute to the author's overall purpose, argument, or the structure of the text": ["6: Reading for Function"],
        "Choosing words/phrases that best complete the meaning/logic of a portion of text": ["7: Text Completions"],
        "Identifying textual evidence that best supports a given claim or identifying claims/evidence that would undermine an argument": ["8: Supporting & Undermining"],
        "Interpreting data presented in tables, graphs, and charts, and integrating that information with textual information": ["9: Graphs & Charts"],
        "Analyzing the relationship between two related texts, including identifying points of agreement/disagreement, or how one text responds to/elaboates on the other": ["10: Paired Passages"],
        "Reviewing various question formats and strategies for approaching them": ["Appendix: Question Types"]
    }
};


// --- Date Formatting Helper ---
function formatDate(dateString) {
    if (!dateString || dateString === "N/A" || dateString === "Not Attempted") return dateString;
    try {
        const date = new Date(dateString + 'T00:00:00'); // Add T00:00:00 to ensure UTC interpretation and avoid timezone issues
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month}, ${year}`;
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return dateString;
    }
}

// URLs for the Google Sheet CSV data (Updated based on Phase 1 & 2 sheets)
const CSV_URLS = {
    aggregatedScores: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSySYBO9YL3N4aUG3JEYZMQQIv9d1oSm3ba4Ty9Gt4SsGs2zmTS_k81rH3Qv41mZvClnayNcDpl_QbI/pub?gid=1890969747&single=true&output=csv', // DashboardFeed_AggregatedScores from Phase 1 
    questionDetails: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJl8XYak_fAzpuboA6GgOO-hEMd6rP_X9BD7ruZ-pSnIGKkd27uGmP2ZWeBcwSvSKsafObcXDOW080/pub?gid=822014112&single=true&output=csv' // DashboardFeed_QuestionDetails from Phase 2 
};

/**
 * Fetches CSV data from a given URL and parses it using PapaParse.
 * @param {string} url - The URL of the CSV file.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of objects representing the CSV data.
 */
async function fetchCsvData(url) {
    console.log(`Fetching data from: ${url}`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true, // Treat the first row as headers
                dynamicTyping: true, // Automatically convert numbers and booleans
                skipEmptyLines: true,
                complete: function(results) {
                    if (results.errors.length) {
                        console.error(`PapaParse errors for ${url}:`, results.errors);
                        reject(results.errors);
                    }
                    console.log(`Successfully parsed ${results.data.length} rows from ${url}`);
                    // Log headers for confirmation
                    if (results.meta && results.meta.fields) {
                        console.log(`Headers for ${url}:`, results.meta.fields);
                    }
                    resolve(results.data);
                }
            });
        });
    } catch (error) {
        console.error(`Could not fetch or parse CSV from ${url}:`, error);
        return []; // Return empty array on error to allow the rest of the app to function
    }
}

/**
 * Orchestrates the fetching and processing of all data sources.
 * This is the main function to call when refreshing or initially loading data.
 */
async function loadAndDisplayData() {
    console.log("Loading and displaying data...");
    document.getElementById('studentNameDisplay').textContent = "Loading data...";

    try {
        const aggregatedScoresData = await fetchCsvData(CSV_URLS.aggregatedScores);
        const questionDetailsData = await fetchCsvData(CSV_URLS.questionDetails);

        // --- Data Transformation Goes Here ---
        // For now, we'll just log and use a placeholder to show data fetching works.
        // The detailed transformation logic will be built in the next steps.

        // Placeholder for the transformed data
        const transformedData = transformRawData(aggregatedScoresData, questionDetailsData);
        currentStudentData = transformedData; // Update global data object

        // Populate ALL_DASHBOARD_QUESTIONS from the newly fetched data
        ALL_DASHBOARD_QUESTIONS = [
            ...(currentStudentData.cbPracticeTests.flatMap(t => t.questions || [])),
            ...(Object.values(currentStudentData.eocQuizzes).flat().flatMap(q => q.questions || []))
        ];
        console.log("ALL_DASHBOARD_QUESTIONS populated with:", ALL_DASHBOARD_QUESTIONS.length, "questions from fetched data.");


        // Update student name display
        document.getElementById('studentNameDisplay').textContent = `Welcome! ${currentStudentData.studentName}`;
        
        // Re-render dashboard sections with the new data
        populateOverview(currentStudentData);
        populatePracticeTestsTable(currentStudentData.cbPracticeTests);

        ['reading', 'writing', 'math'].forEach(subject => {
            populateEOCPractice(subject, currentStudentData.eocQuizzes[subject] || []);
            populateKhanAcademy(subject, currentStudentData.khanAcademy[subject] || []);
        });

        // Ensure the active tab's content is re-rendered properly
        const activeMainTab = document.querySelector('.main-tab-button.active');
        if (activeMainTab) {
            const targetTabName = activeMainTab.getAttribute('data-main-tab');
            if (targetTabName === 'overview') {
                initializeOverviewCharts(currentStudentData);
            } else if (['reading', 'writing', 'math'].includes(targetTabName)) {
                const firstSubTabButton = document.querySelector(`#${targetTabName}-content .sub-tab-button.active`);
                if (firstSubTabButton) {
                    // Re-trigger sub-tab content display, especially for Skills Hub
                    const subject = targetTabName;
                    populateSkillsHub(subject, currentStudentData.skills[subject] || []);
                }
            }
        }
        console.log("Dashboard data loaded and displayed successfully.");

    } catch (error) {
        console.error("Failed to load and display dashboard data:", error);
        document.getElementById('studentNameDisplay').textContent = "Data Loading Failed!";
        // Optionally, display a user-friendly error message on the dashboard
    }
}

// ... (rest of your script.js code remains the same above this point) ...

/**
 * Transforms raw CSV data into the structured currentStudentData object.
 * This is the core data processing logic.
 * @param {Array<Object>} aggregatedScoresData - Data from DashboardFeed_AggregatedScores.
 * @param {Array<Object>} questionDetailsData - Data from DashboardFeed_QuestionDetails.
 * @returns {Object} The transformed currentStudentData object.
 */
function transformRawData(aggregatedScoresData, questionDetailsData) {
    console.log("Starting data transformation...");

    // Determine the student to display. For now, let's take the first unique student found.
    // In a real app, this would be a user selection or login-based.
    const uniqueStudentGmailIDs = [...new Set(aggregatedScoresData.map(row => row.StudentGmailID))];
    const targetStudentGmailID = uniqueStudentGmailIDs[0] || "default@example.com"; // Fallback
    console.log("Targeting data for student:", targetStudentGmailID);

    // Filter data for the target student
    const studentAggregatedScores = aggregatedScoresData.filter(row => row.StudentGmailID === targetStudentGmailID);
    const studentQuestionDetails = questionDetailsData.filter(row => row.StudentGmailID === targetStudentGmailID);

    let transformedData = {
        studentName: studentAggregatedScores.length > 0 ? studentAggregatedScores[0]['StudentFullName'] : "Unknown Student",
        targetScore: studentAggregatedScores.length > 0 ? studentAggregatedScores[0]['StudentTargetScore'] : 1400,
        latestScores: { total: 0, rw: 0, math: 0, avgEocKhan: 0 }, // Will be calculated
        timeSpent: { studentAvg: 0, studentUnit: "min / day", classAvg: 0, classUnit: "min / day"}, // Will be calculated/derived
        scoreTrend: { labels: [], studentScores: [], classAvgScores: [] }, // Will be populated from CB Tests
        overallSkillPerformance: { labels: [], studentAccuracy: [], classAvgAccuracy: [] }, // Will be populated from question details

        cbPracticeTests: [],
        eocQuizzes: {
            reading: [],
            writing: [],
            math: []
        },
        khanAcademy: {
            reading: [],
            writing: [],
            math: []
        },
        skills: {
            reading: [],
            writing: [],
            math: []
        },
        chapters: currentStudentData.chapters // Retain static chapters mapping
    };

    // --- Process CB Practice Tests from Aggregated Scores ---
    const cbTests = studentAggregatedScores.filter(row => row.AssessmentSource === 'Canvas CB Test' && row.AssessmentName.startsWith('CB-T') || row.AssessmentName.startsWith('DG-T0'));
    // Sort CB Tests by attempt date if available, or by name
    cbTests.sort((a, b) => {
        if (a.AttemptDate && b.AttemptDate) return new Date(a.AttemptDate) - new Date(b.AttemptDate);
        return a.AssessmentName.localeCompare(b.AssessmentName);
    });

    // Keep track of which official tests have been attempted
    const attemptedCBTNames = new Set(cbTests.map(t => t.AssessmentName));
    const allOfficialCBTNames = [ // Ensure all 8 CB Tests are represented, even if not attempted
        "DG-T0", "CB-T1", "CB-T2", "CB-T3", "CB-T4", "CB-T5", "CB-T6", "CB-T7", "CB-T8", "CB-T9", "CB-T10"
        // Add more as per your full list of official tests if different
    ];

    allOfficialCBTNames.forEach(testName => {
        const foundTest = cbTests.find(t => t.AssessmentName === testName);
        if (foundTest) {
            // Find all questions related to this test from questionDetailsData
            const testQuestions = studentQuestionDetails.filter(q =>
                q.AssessmentName === foundTest.AssessmentName
            ).map(qRow => ({
                id: `${qRow.AssessmentName}-Q${qRow.QuestionSequenceInQuiz}`,
                subject: qRow.SAT_Skill_Tag && (qRow.SAT_Skill_Tag.includes("Math") ? "math" : qRow.SAT_Skill_Tag.includes("Reading") ? "reading" : qRow.SAT_Skill_Tag.includes("Writing") ? "writing" : "unknown"), // Derive subject
                skill: qRow.SAT_Skill_Tag,
                difficulty: qRow.Difficulty,
                yourAnswer: qRow.StudentAnswer,
                correctAnswer: qRow.IsCorrect === true ? qRow.StudentAnswer : "N/A (check raw data for actual correct answer)", // Placeholder, need actual correct answer
                isCorrect: qRow.IsCorrect,
                explanation: "Explanation will go here if available from another source", // Placeholder for explanations
                yourTime: qRow.TimeSpentOnQuestion_Seconds,
                classAvgTime: qRow.ClassAveragePoints_Question, // Assuming this is actually class average time, rename later
                classPerformance: {
                    correct: qRow.ClassAveragePoints_Question !== null ? Math.round((qRow.ClassAveragePoints_Question / qRow.PointsPossible_Question) * 100) : 0, // Placeholder calculation, need actual class performance %
                    incorrect: 0, // Placeholder
                    unanswered: 0 // Placeholder
                },
                source: foundTest.AssessmentSource,
                text: qRow.QuestionText_fromMetadata
            }));

            // Calculate score for the test based on individual question correctness if needed
            // For now, use aggregated scores
            transformedData.cbPracticeTests.push({
                name: foundTest.AssessmentName,
                date: foundTest.AttemptDate,
                rw: foundTest.ScaledScore_RW || "-",
                math: foundTest.ScaledScore_Math || "-",
                total: foundTest.ScaledScore_Total || "-",
                questions: testQuestions
            });
        } else {
            // Add as "Not Attempted"
            transformedData.cbPracticeTests.push({
                name: testName,
                date: "Not Attempted",
                rw: "-",
                math: "-",
                total: "-",
                questions: []
            });
        }
    });

    // --- Populate Score Trend (from CB Tests) ---
    transformedData.scoreTrend.labels = transformedData.cbPracticeTests
        .filter(t => t.date !== "Not Attempted" && t.total !== "-")
        .map(t => t.name);
    transformedData.scoreTrend.studentScores = transformedData.cbPracticeTests
        .filter(t => t.date !== "Not Attempted" && t.total !== "-")
        .map(t => t.total);
    transformedData.scoreTrend.classAvgScores = transformedData.cbPracticeTests
        .filter(t => t.date !== "Not Attempted" && t.total !== "-")
        .map(t => {
            const correspondingAggregatedRow = studentAggregatedScores.find(s => s.AssessmentName === t.name);
            return correspondingAggregatedRow ? correspondingAggregatedRow.ClassAverageScore_Normalized : null; // Use normalized class average
        });


    // --- Calculate Overall Scores and Latest Scores ---
    const latestTest = transformedData.cbPracticeTests.filter(t => t.date !== "Not Attempted" && t.total !== "-").sort((a,b) => new Date(b.date) - new Date(a.date))[0];
    if (latestTest) {
        transformedData.latestScores.total = latestTest.total;
        transformedData.latestScores.rw = latestTest.rw;
        transformedData.latestScores.math = latestTest.math;
    }

    // --- Process EOC Quizzes and Khan Academy (Initial Structure) ---
    // Group question details by AssessmentSource and AssessmentName
    const quizzesByAssessment = {};
    studentQuestionDetails.forEach(qRow => {
        const assessmentName = qRow.AssessmentName;
        const assessmentSource = qRow.AssessmentSource;
        if (!quizzesByAssessment[assessmentSource]) {
            quizzesByAssessment[assessmentSource] = {};
        }
        if (!quizzesByAssessment[assessmentSource][assessmentName]) {
            quizzesByAssessment[assessmentSource][assessmentName] = [];
        }
        quizzesByAssessment[assessmentSource][assessmentName].push(qRow);
    });

    for (const source in quizzesByAssessment) {
        for (const name in quizzesByAssessment[source]) {
            const questions = quizzesByAssessment[source][name].map(qRow => ({
                id: `${name}-Q${qRow.QuestionSequenceInQuiz}`,
                subject: qRow.SAT_Skill_Tag && (qRow.SAT_Skill_Tag.includes("Math") ? "math" : qRow.SAT_Skill_Tag.includes("Reading") ? "reading" : qRow.SAT_Skill_Tag.includes("Writing") ? "writing" : "unknown"), // Derive subject
                skill: qRow.SAT_Skill_Tag,
                difficulty: qRow.Difficulty,
                yourAnswer: qRow.StudentAnswer,
                correctAnswer: qRow.IsCorrect === true ? qRow.StudentAnswer : "N/A", // Need actual correct answer if not provided
                isCorrect: qRow.IsCorrect,
                explanation: "Explanation will go here if available",
                yourTime: qRow.TimeSpentOnQuestion_Seconds,
                classAvgTime: qRow.ClassAveragePoints_Question, // Assuming this is class average time, rename later
                classPerformance: {
                    correct: qRow.ClassAveragePoints_Question !== null ? Math.round((qRow.ClassAveragePoints_Question / qRow.PointsPossible_Question) * 100) : 0,
                    incorrect: 0,
                    unanswered: 0
                },
                source: source,
                text: qRow.QuestionText_fromMetadata
            }));

            // Calculate quiz score and find attempt date if possible from aggregated scores
            const matchingAggregatedScore = studentAggregatedScores.find(s => s.AssessmentName === name);
            const latestScorePercentage = matchingAggregatedScore ? matchingAggregatedScore.Score_Percentage : null;
            const latestScoreRaw = matchingAggregatedScore ? `${matchingAggregatedScore.Score_Raw_Combined}/${matchingAggregatedScore.PointsPossible_Combined}` : null;
            const attemptDate = matchingAggregatedScore ? matchingAggregatedScore.AttemptDate : "N/A";

            const quizEntry = {
                name: name,
                date: attemptDate,
                latestScore: latestScorePercentage !== null ? `${latestScorePercentage}% (${latestScoreRaw})` : "N/A",
                questions: questions
            };

            if (source === 'Canvas EOC Practice') {
                const subjectCategory = quizEntry.name.toLowerCase().includes('r-eoc') ? 'reading' :
                                        quizEntry.name.toLowerCase().includes('w-eoc') ? 'writing' :
                                        quizEntry.name.toLowerCase().includes('m-eoc') ? 'math' : 'unknown';
                if (transformedData.eocQuizzes[subjectCategory]) {
                    transformedData.eocQuizzes[subjectCategory].push(quizEntry);
                }
            } else if (source === 'Khan Academy Practice') {
                // For Khan Academy, we might need to categorize by subject.
                // Assuming "Khan: Reading", "Khan: Writing", "Khan: Math" in AssessmentName or SkillTag
                const khanSubject = quizEntry.name.toLowerCase().includes('reading') ? 'reading' :
                                    quizEntry.name.toLowerCase().includes('writing') || quizEntry.name.toLowerCase().includes('grammar') ? 'writing' :
                                    quizEntry.name.toLowerCase().includes('math') || quizEntry.name.toLowerCase().includes('algebra') || quizEntry.name.toLowerCase().includes('geometry') ? 'math' : 'unknown';
                if (transformedData.khanAcademy[khanSubject]) {
                    transformedData.khanAcademy[khanSubject].push(quizEntry);
                }
            }
        }
    }


    // --- Calculate Skill Performance (from all questions) ---
    const allStudentQuestions = studentQuestionDetails; // Use all raw questions for skill aggregation
    const skillScores = {}; // skillName: { correctCount, totalCount }

    allStudentQuestions.forEach(q => {
        const skill = q.SAT_Skill_Tag;
        if (!skill) return;

        if (!skillScores[skill]) {
            skillScores[skill] = { correctCount: 0, totalCount: 0, classAvg: 0, classSumPoints: 0, classTotalPossible: 0 };
        }
        skillScores[skill].totalCount++;
        if (q.IsCorrect === true) {
            skillScores[skill].correctCount++;
        }
        // For class average: sum up class average points and total possible points
        if (q.ClassAveragePoints_Question !== null && q.PointsPossible_Question !== null) {
            skillScores[skill].classSumPoints += q.ClassAveragePoints_Question;
            skillScores[skill].classTotalPossible += q.PointsPossible_Question;
        }
    });

    const subjects = ['reading', 'writing', 'math'];
    subjects.forEach(subject => {
        transformedData.skills[subject] = [];
    });

    for (const skillName in skillScores) {
        const scoreData = skillScores[skillName];
        const studentScore = scoreData.totalCount > 0 ? Math.round((scoreData.correctCount / scoreData.totalCount) * 100) : 0;
        const classAvgScore = scoreData.classTotalPossible > 0 ? Math.round((scoreData.classSumPoints / scoreData.classTotalPossible) * 100) : 0;

        let subjectCategory = 'unknown';
        if (skillName.includes('Reading')) subjectCategory = 'reading';
        else if (skillName.includes('Writing') || skillName.includes('Grammar') || skillName.includes('Punctuation')) subjectCategory = 'writing';
        else if (skillName.includes('Math') || skillName.includes('Algebra') || skillName.includes('Geometry')) subjectCategory = 'math';

        if (transformedData.skills[subjectCategory]) {
            transformedData.skills[subjectCategory].push({
                name: skillName,
                score: studentScore,
                classAvg: classAvgScore,
                attempted: scoreData.totalCount > 0
            });
        }
    }

    // --- Calculate OverallSkillPerformance (for overview chart) ---
    subjects.forEach(subject => {
        const subjectSkills = transformedData.skills[subject];
        if (subjectSkills.length > 0) {
            const totalStudentAccuracy = subjectSkills.reduce((sum, s) => sum + s.score, 0);
            const totalClassAccuracy = subjectSkills.reduce((sum, s) => sum + s.classAvg, 0);
            transformedData.overallSkillPerformance.labels.push(subject.charAt(0).toUpperCase() + subject.slice(1));
            transformedData.overallSkillPerformance.studentAccuracy.push(Math.round(totalStudentAccuracy / subjectSkills.length));
            transformedData.overallSkillPerformance.classAvgAccuracy.push(Math.round(totalClassAccuracy / subjectSkills.length));
        }
    });
    
    // --- Calculate Time Spent (Placeholder - needs specific data for this) ---
    // The current CSVs have TimeSpent_Seconds for assessments and TimeSpentOnQuestion_Seconds for questions.
    // For overall time spent, you'd need a separate aggregation. For now, using placeholders.
    transformedData.timeSpent.studentAvg = Math.round(studentAggregatedScores.reduce((sum, row) => sum + (row.TimeSpent_Seconds || 0), 0) / (studentAggregatedScores.length || 1) / 60); // minutes per assessment
    transformedData.timeSpent.classAvg = Math.round(aggregatedScoresData.reduce((sum, row) => sum + (row.ClassAverageTime_Seconds || 0), 0) / (aggregatedScoresData.length || 1) / 60); // minutes per assessment
    transformedData.timeSpent.studentUnit = "min / assessment";
    transformedData.timeSpent.classUnit = "min / assessment";

    // --- Calculate Avg EOC/Khan Score ---
    const allEocKhanScores = Object.values(transformedData.eocQuizzes).flat().map(q => {
        const percentageMatch = q.latestScore.match(/(\d+)%/);
        return percentageMatch ? parseInt(percentageMatch[1]) : 0;
    }).filter(score => score > 0);

    const allKhanScores = Object.values(transformedData.khanAcademy).flat().map(q => {
        const percentageMatch = q.latestScore.match(/(\d+)%/);
        return percentageMatch ? parseInt(percentageMatch[1]) : 0;
    }).filter(score => score > 0);

    const combinedEocKhanScores = [...allEocKhanScores, ...allKhanScores];
    if (combinedEocKhanScores.length > 0) {
        transformedData.latestScores.avgEocKhan = Math.round(combinedEocKhanScores.reduce((sum, score) => sum + score, 0) / combinedEocKhanScores.length);
    }


    console.log("Transformed Data:", transformedData);
    return transformedData;
}

// ... (rest of your script.js code remains the same below this point) ...



// --- Rest of your existing script.js code remains here ---
// (setupEventListeners, populateOverview, initializeOverviewCharts,
// populateSkillsHub, populatePracticeTestsTable, populateEOCPractice,
// populateKhanAcademy, modal functions, renderQuestionAnalysisCard,
// getChaptersForSkill, renderDynamicCharts, renderPacingBarChart,
// addExplanationToggleListeners)

// This function will be called once the page is loaded
document.addEventListener('DOMContentLoaded', function () {
    // --- Chart.js Global Configuration ---
    Chart.defaults.font.family = 'Inter';
    Chart.defaults.plugins.legend.position = 'bottom';
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;

    // Call the main data loading function
    loadAndDisplayData();
    setupEventListeners(); // Set up event listeners after data loading initiation
});

/**
 * Sets up all the interactive elements like tabs, mobile menu, and the refresh button.
 */
function setupEventListeners() {
    const mainTabs = document.querySelectorAll('.main-tab-button');
    const mainTabContents = document.querySelectorAll('.main-tab-content');
    const hamburgerButton = document.getElementById('hamburgerButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const refreshDataBtn = document.getElementById('refreshDataBtn');

    document.getElementById('currentYear').textContent = new Date().getFullYear();

    hamburgerButton?.addEventListener('click', () => mobileMenu?.classList.toggle('hidden'));
    refreshDataBtn?.addEventListener('click', handleRefreshData);

    /**
     * Handles switching between main tabs.
     * @param {HTMLElement} tabElement - The button element that was clicked.
     */
    const switchMainTab = (tabElement) => {
        const targetTabName = tabElement.getAttribute('data-main-tab');

        // Deactivate all main tabs and hide all content
        mainTabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.mobile-nav-link').forEach(link => link.classList.remove('active'));
        mainTabContents.forEach(content => content.classList.add('hidden'));

        // Activate the clicked tab and show its content
        document.querySelector(`.main-tab-button[data-main-tab="${targetTabName}"]`)?.classList.add('active');
        document.querySelector(`.mobile-nav-link[data-main-tab="${targetTabName}"]`)?.classList.add('active');
        document.getElementById(targetTabName + '-content')?.classList.remove('hidden');

        // Special handling for overview tab charts and subject tab sub-tabs
        if (targetTabName === 'overview') {
            initializeOverviewCharts(currentStudentData);
        } else if (['reading', 'writing', 'math'].includes(targetTabName)) {
            // For subject tabs, activate the default sub-tab (Skills Hub)
            const firstSubTabButton = document.querySelector(`#${targetTabName}-content .sub-tab-button[data-sub-tab="${targetTabName}-skills-hub"]`);
            if (firstSubTabButton) {
                switchSubTab(firstSubTabButton); // Programmatically click it
            }
        }

        // Hide mobile menu after selection
        mobileMenu?.classList.add('hidden');
    };

    // Attach event listeners to main tab buttons
    mainTabs.forEach(tab => tab.addEventListener('click', () => switchMainTab(tab)));
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            switchMainTab(link);
        });
    });

    /**
     * Handles switching between sub-tabs within a main tab.
     * @param {HTMLElement} subTabElement - The button element that was clicked.
     */
    const switchSubTab = (subTabElement) => {
        const parentMainContent = subTabElement.closest('.main-tab-content');
        const targetSubTabName = subTabElement.getAttribute('data-sub-tab');

        // Deactivate all sub-tabs and hide all sub-tab content panels in the current main tab
        parentMainContent.querySelectorAll('.sub-tab-button').forEach(st => st.classList.remove('active'));
        parentMainContent.querySelectorAll('.sub-tab-content-panel').forEach(panel => panel.classList.add('hidden'));

        // Activate the clicked sub-tab and show its content panel
        subTabElement.classList.add('active');
        document.getElementById(targetSubTabName + '-content')?.classList.remove('hidden');

        // Special rendering logic for Skills Hub when activated
        if (targetSubTabName.endsWith('-skills-hub')) {
            const subject = targetSubTabName.replace('-skills-hub', '');
            populateSkillsHub(subject, currentStudentData.skills[subject] || []);
        }
    };

    // Attach event listeners to sub-tab buttons
    document.querySelectorAll('.sub-tab-button').forEach(subTab => {
        subTab.addEventListener('click', () => switchSubTab(subTab));
    });

    // Manually trigger click on the initial active tab (Overview) to set up the dashboard
    document.querySelector('.main-tab-button[data-main-tab="overview"]')?.click();
}

/**
 * Placeholder for future data refresh logic (e.g., Google App Script call).
 */
function handleRefreshData() {
    console.log("Refresh Data button clicked! Initiating data reload.");
    alert("Refreshing data from Google Sheets...");
    loadAndDisplayData(); // Re-fetch and re-display all data
}

/**
 * Populates the entire overview tab, including KPIs and dynamic strengths/weaknesses.
 */
function populateOverview(data) {
    // Populate KPI cards
    const kpiContainer = document.getElementById('overview-kpis');
    kpiContainer.innerHTML = `
        <div class="score-card"><h3 class="text-md font-medium text-gray-600">Latest Total Score</h3><p class="text-3xl font-bold score-value">${data.latestScores.total} <span class="text-lg text-gray-500">/ 1600</span></p></div>
        <div class="score-card"><h3 class="text-md font-medium text-gray-600">Latest R&W Score</h3><p class="text-3xl font-bold score-value">${data.latestScores.rw} <span class="text-lg text-gray-500">/ 800</span></p></div>
        <div class="score-card"><h3 class="text-md font-medium text-gray-600">Latest Math Score</h3><p class="text-3xl font-bold score-value">${data.latestScores.math} <span class="text-lg text-gray-500">/ 800</span></p></div>
        <div class="score-card"><h3 class="text-md font-medium text-gray-600">Avg EOC Score</h3><p class="text-3xl font-bold score-value">${data.latestScores.avgEocKhan}%</p></div>
        <div class="score-card"><h3 class="text-md font-medium text-gray-600">Your Target Score</h3><p class="text-3xl font-bold" style="color: #8a3ffc;">${data.targetScore}</p></div>`;

    // Populate Strengths & Weaknesses
    const allSkills = Object.values(data.skills).flat().filter(s => s.attempted);
    const strengths = [...allSkills].sort((a, b) => b.score - a.score).slice(0, 3);
    const weaknesses = [...allSkills].sort((a, b) => a.score - b.score).slice(0, 3);

    const renderList = (items) => items.map(item => `<li>${item.name} (${item.score}%)</li>`).join('');
    document.getElementById('overviewStrengthsContainer').innerHTML = `<ul class="list-disc list-inside space-y-1 text-gray-600">${renderList(strengths)}</ul>`;
    document.getElementById('overviewImprovementsContainer').innerHTML = `<ul class="list-disc list-inside space-y-1 text-gray-600">${renderList(weaknesses)}</ul>`;

    // Populate Time Spent
    document.getElementById('timeSpentOverview').innerHTML = `<p class="text-gray-600">Your Avg: <span class="font-semibold">${data.timeSpent.studentAvg} ${data.timeSpent.studentUnit}</span></p><p class="text-gray-600">Class Avg: <span class="font-semibold">${data.timeSpent.classAvg} ${data.timeSpent.classUnit}</span></p>`;
}

// ... (rest of your script.js code up to initializeOverviewCharts) ...

/**
 * Renders the main overview charts.
 * @param {object} data - The current student data.
 */
function initializeOverviewCharts(data) {
    // --- Score Trend Chart ---
    const scoreTrendChartCanvas = document.getElementById('scoreTrendChart');
    if (!scoreTrendChartCanvas) {
        console.warn("Score Trend Chart canvas not found. Cannot initialize chart.");
        // If the canvas is genuinely missing, add a placeholder message instead.
        const parentDiv = document.querySelector('.themed-card.chart-container .themed-card-body'); // Find the parent div
        if (parentDiv && !parentDiv.querySelector('canvas')) { // Only add if no canvas is present
             parentDiv.innerHTML = '<p class="text-center p-4 text-gray-500">Score trend chart not available (canvas element missing or replaced).</p>';
        }
        return; // Exit if canvas is missing
    }

    const existingScoreTrendChart = Chart.getChart('scoreTrendChart');
    if (existingScoreTrendChart) {
        existingScoreTrendChart.destroy(); // Destroy existing chart instance if it exists
    }

    if (data.scoreTrend && data.scoreTrend.labels.length > 0) {
        // Ensure the canvas element is still there to draw on
        scoreTrendChartCanvas.style.display = 'block'; // Ensure it's visible if hidden
        new Chart(scoreTrendChartCanvas, {
            type: 'line',
            data: {
                labels: data.scoreTrend.labels,
                datasets: [
                    { label: 'Your Score', data: data.scoreTrend.studentScores, borderColor: '#2a5266', tension: 0.1 },
                    { label: 'Class Average', data: data.scoreTrend.classAvgScores, borderColor: '#757575', borderDash: [5, 5], tension: 0.1 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 10
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1600, // Max score for SAT Total
                        title: {
                            display: true,
                            text: 'Score'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Assessment'
                        }
                    }
                }
            }
        });
    } else {
        // Hide canvas and show "No data available" message
        scoreTrendChartCanvas.style.display = 'none'; // Hide the canvas
        scoreTrendChartCanvas.parentNode.innerHTML += '<p class="text-center p-4 text-gray-500" id="scoreTrendChartNoData">No score trend data available.</p>';
        // Make sure previous "No data" message is removed if data becomes available
        const existingNoData = document.getElementById('scoreTrendChartNoData');
        if (existingNoData) existingNoData.remove();
    }


    // --- Overall Skill Performance Chart ---
    const overallSkillChartCanvas = document.getElementById('overallSkillChart');
    if (!overallSkillChartCanvas) {
        console.warn("Overall Skill Chart canvas not found. Cannot initialize chart.");
        // Similar placeholder logic for the overall skill chart's parent
        const parentDiv = document.querySelector('.themed-card.chart-container:nth-of-type(2) .themed-card-body');
        if (parentDiv && !parentDiv.querySelector('canvas')) {
             parentDiv.innerHTML = '<p class="text-center p-4 text-gray-500">Overall skill performance chart not available (canvas element missing or replaced).</p>';
        }
        return; // Exit if canvas is missing
    }

    const existingOverallSkillChart = Chart.getChart('overallSkillChart');
    if (existingOverallSkillChart) {
        existingOverallSkillChart.destroy();
    }

    if (data.overallSkillPerformance && data.overallSkillPerformance.labels.length > 0) {
        overallSkillChartCanvas.style.display = 'block'; // Ensure it's visible if hidden
        new Chart(overallSkillChartCanvas, {
            type: 'bar',
            data: {
                labels: data.overallSkillPerformance.labels,
                datasets: [
                    { label: 'Your Accuracy', data: data.overallSkillPerformance.studentAccuracy, backgroundColor: 'rgba(42, 82, 102, 0.8)' },
                    { label: 'Class Average', data: data.overallSkillPerformance.classAvgAccuracy, backgroundColor: 'rgba(117, 117, 117, 0.7)' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 10
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y + '%';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Accuracy (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Subject'
                        }
                    }
                }
            }
        });
    } else {
        // Hide canvas and show "No data available" message
        overallSkillChartCanvas.style.display = 'none'; // Hide the canvas
        overallSkillChartCanvas.parentNode.innerHTML += '<p class="text-center p-4 text-gray-500" id="overallSkillChartNoData">No overall skill performance data available.</p>';
         // Make sure previous "No data" message is removed if data becomes available
        const existingNoData = document.getElementById('overallSkillChartNoData');
        if (existingNoData) existingNoData.remove();
    }
}
// ... (rest of your script.js code below initializeOverviewCharts) ...

// --- Subject-Specific Functions ---

/**
 * Populates the new combined "Skills Hub" tab.
 * This displays overall skill performance, sorted weakest first.
 * Clicking a skill here will open a modal showing incorrect questions for that skill.
 * @param {string} subject - The subject ('reading', 'writing', 'math').
 * @param {Array} skills - The list of skills for that subject.
 */
function populateSkillsHub(subject, skills) {
    const container = document.getElementById(`${subject}-skills-hub-body`);
    if (!container) return;

    skills.sort((a, b) => a.score - b.score); // Sort by weakest first

    if (skills.length === 0) {
        container.innerHTML = `<p class="text-center p-4 text-gray-500">No skill data available for ${subject}.</p>`;
        return;
    }

    container.innerHTML = skills.map(skill => {
        const performanceClass = skill.attempted ? (skill.score >= 85 ? 'performance-good' : skill.score >= 70 ? 'performance-average' : 'performance-poor') : 'performance-na';
        return `
        <div class="p-3 bg-gray-50 rounded-md border border-gray-200 mb-2 skill-item-container" onclick="openSkillIncorrectQuestionsModal('${skill.name}', '${subject}')">
            <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-gray-800">${skill.name}</span>
                <span class="text-xs font-semibold">${skill.attempted ? skill.score + '%' : 'N/A'}</span>
            </div>
            <div class="progress-bar-container"><div class="progress-bar ${performanceClass}" style="width: ${skill.attempted ? skill.score : 0}%"></div></div>
            <p class="text-xs text-gray-500 mt-1">Class Avg: ${skill.classAvg}%</p>
        </div>`;
    }).join('');
}


/**
 * Populates the main table of CB Practice Tests.
 * Each row is clickable to open a modal with all questions from that test.
 * @param {Array} tests - Array of CB practice test objects.
 */
function populatePracticeTestsTable(tests) {
    const tableBody = document.getElementById('cb-practice-tests-table-body');
    if (!tableBody) return;

    if (tests.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500">No CB practice test data available.</td></tr>`;
        return;
    }

    tableBody.innerHTML = tests.map(test => {
        const isAttempted = test.date && test.date !== "Not Attempted" && test.date !== "-";
        return `
        <tr class="${isAttempted ? 'clickable-row' : 'opacity-60'}" ${isAttempted ? `onclick="openTestQuestionsModal('${test.name}')"` : ''}>
            <td>${test.name}</td>
            <td>${formatDate(test.date)}</td>
            <td>${test.rw}</td>
            <td>${test.math}</td>
            <td>${test.total}</td>
        </tr>`;
    }).join('');
}

/**
 * Populates EOC Practice tables.
 * Each row (quiz) is clickable to open a modal with all questions from that quiz.
 * @param {string} subject - The subject ('reading', 'writing', 'math').
 * @param {Array} quizzes - Array of EOC quiz objects.
 */
function populateEOCPractice(subject, quizzes) {
    const tableBody = document.getElementById(`${subject}-eoc-tbody`);
    if (!tableBody) return;

    // Dynamically generate table header for EOC quizzes based on first quiz structure
    const eocThead = document.getElementById(`${subject}-eoc-thead`);
    if (eocThead && quizzes.length > 0) {
        const headers = ['Quiz Name', 'Date Attempted', 'Latest Score'];
        eocThead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    } else if (eocThead) {
        eocThead.innerHTML = `<tr><th>Quiz Name</th><th>Date Attempted</th><th>Latest Score</th></tr>`; // Fallback header
    }

    if (quizzes.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-gray-500">No EOC practice data available for ${subject}.</td></tr>`;
        return;
    }

    tableBody.innerHTML = quizzes.map(quiz => `
        <tr class="clickable-row" onclick="openEOCQuizQuestionsModal('${quiz.name}', '${subject}')">
            <td>${quiz.name}</td>
            <td>${formatDate(quiz.date)}</td>
            <td>${quiz.latestScore}</td>
        </tr>
    `).join('');
}

/**
 * Populates Khan Academy Practice sections.
 * (Currently just a placeholder as dummy data is empty for Khan)
 * @param {string} subject - The subject ('reading', 'writing', 'math').
 * @param {Array} khanData - Array of Khan Academy data.
 */
function populateKhanAcademy(subject, khanData) {
    const container = document.getElementById(`${subject}-khan-data`);
    if (!container) return;

    if (khanData.length === 0) {
        container.innerHTML = `<p class="text-gray-500 text-center p-4">No Khan Academy data available for ${subject}.</p>`;
        return;
    }
    // Implement rendering for Khan Academy data here when dummy data is available
    container.innerHTML = `<p class="text-gray-500 text-center p-4">Khan Academy data for ${subject} will be displayed here once fetched and transformed.</p>`;
}

// --- Modals and Detailed View Functions ---

const modal = document.getElementById('detailModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

/**
 * Opens the modal to show ALL incorrect questions for a specific skill,
 * triggered from the "Skills Hub" (by clicking a skill performance bar).
 * Questions are sorted by difficulty.
 * @param {string} skillName - The name of the skill to filter by.
 * @param {string} subject - The subject of the skill (e.g., 'reading').
 */
function openSkillIncorrectQuestionsModal(skillName, subject) {
    modalTitle.textContent = `Incorrect Questions for: ${skillName} (${subject.charAt(0).toUpperCase() + subject.slice(1)})`;

    // Filter all questions for the specific skill and ensure they are incorrect
    const incorrectQuestions = ALL_DASHBOARD_QUESTIONS.filter(q =>
        q.skill === skillName && !q.isCorrect && q.subject === subject
    );

    // Sort by difficulty: Hard > Medium > Easy
    const difficultyOrder = { "Hard": 1, "Medium": 2, "Easy": 3 };
    incorrectQuestions.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

    if (incorrectQuestions.length === 0) {
        modalBody.innerHTML = `<p class="text-center p-5 text-gray-600">No incorrect questions found for "${skillName}" in ${subject}.</p>`;
    } else {
        // Render each question as a detailed analysis card (without pacing here)
        modalBody.innerHTML = incorrectQuestions.map((q, index) => renderQuestionAnalysisCard(q, `skill-${index}`, false)).join('');
    }
    modal.style.display = "block";
    renderDynamicCharts(); // Render charts AFTER content is in the DOM
    addExplanationToggleListeners(); // Add listeners for explanation toggles
}

/**
 * Opens the modal to show ALL questions for a specific CB Practice Test,
 * and includes a pacing analysis table at the bottom.
 * @param {string} testName - The name of the test.
 */
function openTestQuestionsModal(testName) {
    modalTitle.textContent = `Reviewing Test: ${testName}`;
    const test = currentStudentData.cbPracticeTests.find(t => t.name === testName);

    if (!test || !test.questions || test.questions.length === 0) {
        modalBody.innerHTML = `<p class="text-center p-5 text-gray-600">No questions found for ${testName}.</p>`;
        modal.style.display = "block";
        return;
    }

    // Render each question as a single question analysis card, including pacing
    let content = test.questions.map((q, index) => renderQuestionAnalysisCard(q, `test-${index}`, true)).join('');

    // Append pacing analysis at the bottom if pacing data exists
    if (test.questions.some(q => q.yourTime !== undefined && q.classAvgTime !== undefined)) {
        content += `<h3 class="text-lg font-semibold text-gray-800 border-t pt-4 mt-6">Pacing Analysis</h3>`;
        content += `<div class="pacing-bar-chart-container"><canvas id="pacingBarChart"></canvas></div>`; // Placeholder for bar chart

        const pacingRows = test.questions.map((p, index) => {
            const diff = p.yourTime - p.classAvgTime;
            const status = diff > 15 ? 'Slower' : diff < -15 ? 'Faster' : 'On Pace';
            const statusClass = `pacing-${status.toLowerCase().replace(' ', '-')}`;
            return `<tr><td>${index + 1}</td><td>${p.yourTime}s</td><td>${p.classAvgTime}s</td><td><span class="pacing-badge ${statusClass}">${status}</span></td><td class="${p.isCorrect ? 'text-good' : 'text-poor'} font-semibold">${p.isCorrect ? 'Correct' : 'Incorrect'}</td></tr>`;
        }).join('');
        content += `<div class="overflow-x-auto mt-4"><table class="min-w-full table"><thead><tr><th>Q#</th><th>Your Time</th><th>Class Avg</th><th>Pacing</th><th>Result</th></tr></thead><tbody>${pacingRows}</tbody></table></div>`;
    }

    modalBody.innerHTML = content;
    modal.style.display = "block";
    renderDynamicCharts(); // Render donut charts AFTER content is in the DOM
    addExplanationToggleListeners(); // Add listeners for explanation toggles
    if (test.questions.some(q => q.yourTime !== undefined)) { // Only render pacing bar chart if data exists
        renderPacingBarChart('pacingBarChart', test.questions);
    }
}

/**
 * Opens the modal to show ALL questions for a specific EOC Quiz.
 * Pacing data is NOT included for EOC quizzes.
 * @param {string} quizName - The name of the EOC quiz.
 * @param {string} subject - The subject of the EOC quiz.
 */
function openEOCQuizQuestionsModal(quizName, subject) {
    modalTitle.textContent = `Reviewing EOC Quiz: ${quizName} (${subject.charAt(0).toUpperCase() + subject.slice(1)})`;
    const quizzesForSubject = currentStudentData.eocQuizzes[subject] || [];
    const quiz = quizzesForSubject.find(q => q.name === quizName);

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        modalBody.innerHTML = `<p class="text-center p-5 text-gray-600">No questions found for ${quizName}.</p>`;
        modal.style.display = "block";
        return;
    }

    // Render each question as a single question analysis card, without pacing info
    let content = quiz.questions.map((q, index) => renderQuestionAnalysisCard(q, `eoc-${index}`, false)).join(''); // `false` for pacing

    modalBody.innerHTML = content;
    modal.style.display = "block";
    renderDynamicCharts(); // Render donut charts AFTER content is in the DOM
    addExplanationToggleListeners(); // Add listeners for explanation toggles
}


/**
 * Closes the modal and cleans up any Chart.js instances to prevent memory leaks.
 */
function closeModal() {
    // Destroy all Chart.js instances within the modal body
    const canvases = modalBody.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        const chart = Chart.getChart(canvas);
        if (chart) {
            chart.destroy();
        }
    });

    modal.style.display = "none";
    modalBody.innerHTML = ''; // Clear content to prevent old data flashing
}
window.onclick = (event) => {
    if (event.target == modal) {
        closeModal();
    }
};

// --- Reusable HTML Renderer for a Single Question ---

/**
 * Renders a self-contained card for a single question's analysis.
 * This function now includes class performance percentage, a mini donut,
 * and a toggle for explanation.
 * @param {object} q - The question object.
 * @param {string} uniqueIdPrefix - A unique prefix for element IDs within the card (e.g., 'skill-0', 'test-1').
 * @param {boolean} includePacing - Whether to show the pacing information for this question.
 * @returns {string} - The HTML string for the card.
 */
function renderQuestionAnalysisCard(q, uniqueIdPrefix, includePacing = false) {
    const resultText = q.isCorrect ? "Correct" : "Incorrect";
    const resultClass = q.isCorrect ? "text-good" : "text-poor";
    const sourceInfo = q.source ? `<span class="meta-item text-gray-500">Source: ${q.source}</span>` : '';
    const questionTextDisplay = q.text ? `<p class="mb-2 text-gray-800 font-medium">${q.text}</p>` : `<p class="mb-2 text-gray-800 font-medium">Question ID: ${q.id}</p>`;

    const pacingHtml = includePacing && q.yourTime !== undefined ?
        `<p class="text-center text-sm mt-2">Pacing: <strong>${q.yourTime}s</strong> (Class Avg: ${q.classAvgTime}s)</p>` : '';

    const classCorrectPercentage = q.classPerformance ? q.classPerformance.correct : 'N/A';

    const explanationHtml = q.explanation ? `
        <button class="toggle-explanation-btn" data-target="explanation-${uniqueIdPrefix}-${q.id}">Show Explanation</button>
        <div id="explanation-${uniqueIdPrefix}-${q.id}" class="answer-explanation">
            <p class="font-semibold text-sm">Explanation</p>
            <p class="text-sm">${q.explanation}</p>
        </div>
    ` : '';

    // Get relevant chapters for review based on skill
    const relevantChapters = getChaptersForSkill(q.skill, q.subject);
    const chapterReviewHtml = relevantChapters.length > 0 ? `
        <div class="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200 text-sm">
            <p class="font-semibold text-blue-800 mb-1">Review Chapters:</p>
            <ul class="list-disc list-inside text-blue-700">
                ${relevantChapters.map(chapter => `<li>${chapter}</li>`).join('')}
            </ul>
        </div>
    ` : '';

    return `
    <div class="question-analysis-card">
        <div class="question-analysis-header">
            <span class="font-semibold text-gray-700">${q.skill}</span>
            <span class="difficulty-badge difficulty-${q.difficulty}">${q.difficulty}</span>
            ${sourceInfo}
        </div>
        <div class="question-analysis-body">
            <div>
                ${questionTextDisplay}
                <p>Your Answer: <span class="font-semibold ${resultClass}">${q.yourAnswer}</span> <span class="font-bold">(${resultText})</span></p>
                ${!q.isCorrect ? `<p>Correct Answer: <span class="font-semibold text-good">${q.correctAnswer}</span></p>` : ''}
                ${explanationHtml}
                ${chapterReviewHtml}
            </div>
            <div>
                <p class="text-center text-sm font-semibold mb-2">Class Performance: ${classCorrectPercentage}% Correct</p>
                <div class="question-chart-container">
                    <canvas id="chart-${uniqueIdPrefix}-${q.id}"></canvas>
                </div>
                ${pacingHtml}
            </div>
        </div>
    </div>`;
}

/**
 * Retrieves relevant chapters from the SAT_CHAPTER_SKILL_MAPPING for a given skill and subject.
 * @param {string} skillName - The skill name.
 * @param {string} subject - The subject (e.g., 'math', 'reading', 'writing').
 * @returns {string[]} An array of chapter names.
 */
function getChaptersForSkill(skillName, subject) {
    const chapters = new Set(); // Use a Set to avoid duplicate chapter names
    const skillMap = SAT_CHAPTER_SKILL_MAPPING[subject];

    if (skillMap) {
        // Iterate through the mapping to find all chapters associated with the skill
        for (const mappedSkill in skillMap) {
            // Simple check if the skill name is a substring or exact match
            if (skillName.toLowerCase().includes(mappedSkill.toLowerCase()) || mappedSkill.toLowerCase().includes(skillName.toLowerCase())) {
                skillMap[mappedSkill].forEach(chapter => chapters.add(chapter));
            }
        }
    }
    return Array.from(chapters).sort(); // Convert Set to Array and sort for consistent order
}


/**
 * Renders dynamic Chart.js charts for canvases present in the modalBody.
 * This must be called *after* the HTML content with the canvas elements is in the DOM.
 */
function renderDynamicCharts() {
    const canvases = modalBody.querySelectorAll('canvas[id^="chart-"]'); // Select all question charts
    canvases.forEach(canvas => {
        const chartId = canvas.id;
        const existingChart = Chart.getChart(chartId);
        if (existingChart) {
            existingChart.destroy(); // Destroy existing chart instance to prevent duplicates
        }

        // Extract original question ID from the chartId (e.g., "chart-skill-0-DT-Q1")
        // Need to be careful here: the q.id might not always be the last part if uniqueIdPrefix contains hyphens.
        // A more robust way would be to pass the actual question object to renderQuestionAnalysisCard
        // and then pass its ID directly here.
        // For now, let's assume q.id is unique enough and can be extracted.
        const qIdMatch = chartId.match(/-(Q\d+|-EOC-M\d+)/); // More specific regex for our dummy IDs
        const qId = qIdMatch ? qIdMatch[0].substring(1) : null; // Remove leading hyphen

        const qData = ALL_DASHBOARD_QUESTIONS.find(q => q.id === qId);

        if (qData && qData.classPerformance) {
            const correct = qData.classPerformance.correct || 0;
            const incorrect = qData.classPerformance.incorrect || 0;
            const unanswered = qData.classPerformance.unanswered || 0;

            new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: ['Correct', 'Incorrect', 'Unanswered'],
                    datasets: [{
                        data: [correct, incorrect, unanswered],
                        backgroundColor: ['#28a745', '#dc3545', '#ffc107'], // Green, Red, Yellow
                        borderColor: '#ffffff',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                font: {
                                    size: 10
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed !== null) {
                                        label += context.parsed + '%';
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    cutout: '60%', // Makes it a donut
                }
            });
        }
    });
}

/**
 * Renders a bar chart for pacing analysis.
 * @param {string} canvasId - The ID of the canvas element.
 * @param {Array} questions - An array of question objects with pacing data.
 */
function renderPacingBarChart(canvasId, questions) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const existingChart = Chart.getChart(canvasId);
    if (existingChart) {
        existingChart.destroy();
    }

    const labels = questions.map((q, index) => `Q${index + 1}`);
    const yourTimes = questions.map(q => q.yourTime);
    const classAvgTimes = questions.map(q => q.classAvgTime);

    const backgroundColors = questions.map(q => {
        const diff = q.yourTime - q.classAvgTime;
        if (diff > 15) return '#dc3545'; // Slower (Red)
        if (diff < -15) return '#28a745'; // Faster (Green)
        return '#4b5563'; // On Pace (Grey/Blue - similar to theme)
    });

    const borderColors = questions.map(q => {
        const diff = q.yourTime - q.classAvgTime;
        if (diff > 15) return '#bb2124';
        if (diff < -15) return '#198754';
        return '#2a5266';
    });

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Your Time (s)',
                    data: yourTimes,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    barPercentage: 0.8,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Class Avg Time (s)',
                    data: classAvgTimes,
                    backgroundColor: 'rgba(117, 117, 117, 0.5)', // Lighter grey for class average
                    borderColor: 'rgba(117, 117, 117, 0.8)',
                    borderWidth: 1,
                    type: 'line', // Make class avg a line on top of bars
                    fill: false,
                    pointRadius: 3,
                    pointBackgroundColor: '#757575',
                    tension: 0.1,
                    hidden: false // Ensure this dataset is visible
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label; // Q#
                        },
                        label: function(context) {
                            if (context.dataset.label === 'Your Time (s)') {
                                const qIndex = context.dataIndex;
                                const difficulty = questions[qIndex].difficulty;
                                return `${context.dataset.label}: ${context.parsed.y}s (Difficulty: ${difficulty})`;
                            }
                            return `${context.dataset.label}: ${context.parsed.y}s`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Question Number'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Time (seconds)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}


/**
 * Adds event listeners to "Show Explanation" buttons to toggle explanation visibility.
 * This needs to be called every time new content is loaded into the modalBody.
 */
function addExplanationToggleListeners() {
    modalBody.querySelectorAll('.toggle-explanation-btn').forEach(button => {
        button.onclick = function() {
            const targetId = this.getAttribute('data-target');
            const explanationDiv = document.getElementById(targetId);
            if (explanationDiv) {
                explanationDiv.classList.toggle('expanded');
                this.textContent = explanationDiv.classList.contains('expanded') ? 'Hide Explanation' : 'Show Explanation';
            }
        };
    });
}
