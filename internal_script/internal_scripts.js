
//Render variables
var welcomePage = document.querySelector("#main__page").innerHTML;
var categoryPage = document.querySelector("#category__page").innerHTML;
var quizPage = document.querySelector("#quiz__page").innerHTML;
var resultPage = document.querySelector("#results").innerHTML;

//app variables
var bttn = document.querySelector(".start");
var container = document.querySelector("#main__container");
var ajaxLink = "";
var currentQuestion = 0;
var maxQuestionNumber = 9;
var isSelected = false;
var startTime = null;
var endTime = null;
var calculatedGoodAnswers = null;
var measuredTimePoints = null;

//Rendering subpages
//******************************************************** */
function render(selector) {
    var currentTemplate = Handlebars.compile(selector);
    var withContext = currentTemplate();

    container.innerHTML = "";
    container.innerHTML = withContext;
}

//Main site template, load subpages with event delegation
document.addEventListener("DOMContentLoaded", function () {
    render(welcomePage);
});

//Build API link
function buildApiReq(category) {
    var link = "https://opentdb.com/api.php?amount=10&category=" + category + "&type=multiple";
    return link;
}

// Clear Loader
function clearLoader() {
    var loaderContent = document.querySelector(".quiz__loader");
    setTimeout(function () {
        loaderContent.classList.add("loaded");
        checkStartTime();
    }, 2000);
}

//check end time
function checkEndTime() {
    endTime = +new Date();
}

//check start time
function checkStartTime() {
    startTime = +new Date();
}

//measure difference time/ calculate time bonus points
function measureTimePoints(start, end) {
    var maxTime = 500000;
    var bonusTime = end - start;
    var timePoints = 0;
    if (((maxTime - bonusTime) / 150).toFixed() < 0) {
        timePoints = 0;
    } else {
        timePoints = ((maxTime - bonusTime) / 150).toFixed();
    }
    return timePoints;
}

//Shuffle array
function shuffle(array) {
    var j = void 0,
        x = void 0,
        i = void 0;
    for (i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }
    return array;
}

//gathering Api data
function getAjaxData() {

    //ajax fetch data
    var ajaxPromise = new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", ajaxLink, true);
        xhr.addEventListener("load", function () {
            return resolve(xhr.responseText);
        });
        xhr.send();
    });
    ajaxPromise.then(function (res) {
        dataController.buildQuestionPack(res);
        loadQuestionPackage();
    });
}

//load start quiz content
function loadQuestionPackage() {
    var buttonsCol = document.querySelectorAll(".quiz__box");
    var buttons= Array.prototype.slice.call( buttonsCol, 0 );
    var questionHolder = document.querySelector(".quiz__category");
    var loadedData = dataController.getData();

    //create question
    questionHolder.innerHTML = loadedData[currentQuestion].question;

    //create answers
    buttons.forEach(function (button, i) {
        button.innerHTML = loadedData[currentQuestion].answers[i];
    });
}
//Display alert info
function displayMessage(message) {
    var boxMessage = document.createElement("div");
    boxMessage.classList.add("quiz__info-box");
    boxMessage.innerHTML = message;
    container.firstElementChild.lastElementChild.insertAdjacentElement("beforeend", boxMessage);
    setTimeout(function () {
        var destroyedInfo = container.firstElementChild.lastElementChild.lastElementChild;
        destroyedInfo.remove();
    }, 2000);
}

//check is user select answer
function isAnswerSelected(target) {
    var selectedBttn = target;
    var checkedAnswer = false;
    allBttnCol = selectedBttn.parentNode.children;
    var allBttn = Array.prototype.slice.call( allBttnCol, 0 );

    for (var i = 0; i < allBttn.length; i++) {
        if (allBttn[i].classList.contains("selected")) {
            checkedAnswer = true;
            break;
        }
    }
    return checkedAnswer;
}

// clar selected button
function clearSelected(target) {
    allBttnCol = target.parentNode.children;
    var allBttn = Array.prototype.slice.call( allBttnCol, 0 );
    allBttn.forEach(function (el) {
        if (el.classList.contains("selected")) {
            el.classList.remove("selected");
        }
    });
}

//User select answer / check isSelected already
function selectAnswer(target) {
    var selectedBttn = target;
    allBttnCol = selectedBttn.parentNode.children;
    var allBttn = Array.prototype.slice.call( allBttnCol, 0 );
    isSelected = false;
    allBttn.forEach(function (el) {
        if (el.classList.contains("selected")) {
            isSelected = true;
        }
    });

    if (isSelected === true) {
        displayMessage("Only one answer is correct!");
    } else {
        selectedBttn.classList.add("selected");
        dataController.addUserAnswer(target.innerHTML);
    }
}

//Calculate correct answers
function calcCorrectAnswers(userAnswers, correctAnswers) {
    var checkedAnswers = 0;
    correctAnswers.forEach(function (el, i) {
        if (el.correctAnswer === userAnswers[i]) {
            checkedAnswers++;
        }
    });
    return checkedAnswers;
}

//Reset data before new game
function resetData() {
    ajaxLink = "";
    currentQuestion = 0;
    isSelected = false;
    startTime = null;
    endTime = null;
    calculatedGoodAnswers = null;
    measuredTimePoints = null;
    dataController.resetData();
}

//*********************************************************** */
//Render category select page + build data 
container.addEventListener("click", function (e) {
    if (e.target.classList.contains("start")) {
        render(categoryPage);
    } else if (e.target.classList.contains("category__action")) {
        //rendering quiz template
        render(quizPage);
        //quizPage operations
        //clear loader
        clearLoader();
        //check category...build ajax link
        ajaxLink = buildApiReq(e.target.getAttribute("data-category"));
        //get API data and push it to the dataController
        getAjaxData();
    }
});

//Main data controler
var dataController = function () {

    var quizData = [];

    var userAnswers = [];

    return {
        buildQuestionPack: function buildQuestionPack(stringData) {
            ajaxData = JSON.parse(stringData);
            ajaxData.results.forEach(function (el, i) {

                //build answers
                el.incorrect_answers.push(el.correct_answer);
                shuffle(el.incorrect_answers);

                //push object
                quizData.push({
                    index: i + 1,
                    question: el.question,
                    answers: el.incorrect_answers,
                    correctAnswer: el.correct_answer
                });
            });
        },
        addUserAnswer: function addUserAnswer(data) {
            userAnswers.push(data);
        },
        getUserAnswers: function getUserAnswers() {
            return userAnswers;
        },
        addQuestionData: function addQuestionData(data) {
            return quizData.push(data);
        },
        getData: function getData() {
            return quizData;
        },
        resetData: function resetData() {
            quizData = [];
            userAnswers = [];
        }
    };
}();

//event delegation

container.addEventListener("click", function (e) {
    if (e.target.classList.contains("quiz__box")) {
        selectAnswer(e.target);
    }
});

//Clear selected, load next question
container.addEventListener("click", function (e) {
    if (e.target.classList.contains("quiz__box-next")) {
        if (currentQuestion >= maxQuestionNumber - 1) {
            currentQuestion++;
            e.target.innerHTML = "Show results";
            e.target.classList.remove("quiz__box-next");
            e.target.classList.add("quiz__box-results");
            //clear selected
            clearSelected(e.target);
            loadQuestionPackage();
        } else if (isAnswerSelected(e.target)) {
            clearSelected(e.target);
            //increment question id
            currentQuestion++;
            //load current question
            loadQuestionPackage();
            //clear selected button
        } else {
            displayMessage("Please choose answer!");
        }
    }
});

//Build result outpout
function buildOutputResults() {
    var resultsContainer = document.querySelector(".results__container");
    var resultTemplate = "<div class=\"results__content\">\n    <h1 class=\"results__heading\">Your results:</h1>\n    <p class=\"results__correct-answer__number\">You answear correct for <span class=\"results__correct-answer__output\">" + calculatedGoodAnswers + "</span> question!</p>\n    <h2 class=\"results__score\">Score:</h2>\n    <p class=\"results__score-answers\">Correct answer score: <span class=\"results__question-score\">" + calculatedGoodAnswers * 1000 + " Pts</span></p>\n    <p class=\"results__score-bonus\">Time bonus score: <span class=\"results__time-score\">" + measuredTimePoints + " Pts</span></p>\n    <h2 class=\"results__final-score\">Your overall score: <span>" + (parseInt(measuredTimePoints) + calculatedGoodAnswers * 1000) + "</span></h2><a href=\"#\" class=\"bttn newGame\">New game</a>\n</div>";
    resultsContainer.innerHTML = resultTemplate;
}

//Clear selected, load next question
container.addEventListener("mousedown", function (e) {
    if (e.target.classList.contains("quiz__box-results")) {
        if (isAnswerSelected(e.target)) {
            //check answer time
            checkEndTime();
            //calculate good answers from dataController
            calculatedGoodAnswers = calcCorrectAnswers(dataController.getUserAnswers(), dataController.getData());
            //Measure time bonus points
            measuredTimePoints = measureTimePoints(startTime, endTime);
            //render result page
            render(resultPage);
            //Output results
            buildOutputResults();
        } else {
            displayMessage("Please choose answer!");
        }
    }
});

//Start new game, clear variables
container.addEventListener("click", function (e) {
    if (e.target.classList.contains("newGame")) {
        resetData();
        render(welcomePage);
    }
});