'use strict';

const topics = require('./topics.json');
const questions = require('./question_list.json');

/**
 * Type of question which determine the count of correct answers.
 */
const MULTIPLE_ANSWERS = 1;

/**
 * Function that determine is user answer correct.
 */
function checkAnswer(level, lastQuestion, userAnswer) {
    console.log(`topic = ${JSON.stringify(lastQuestion)}`);
    const subtopic = lastQuestion.subtopic;
    const index = lastQuestion.index;
    const question = questions[level][subtopic][index];
    const answer = question.answer;
    let result = false;
    //Split the user answer by spaces. Count of correct answers from the list
    //if user answered correctly more than half of all possible answers, consider as the correct answer.
    if (question.type === MULTIPLE_ANSWERS) {
        userAnswer = userAnswer.split(" ");
        let countOfCorrect = 0;
        userAnswer.forEach((currentAnswer, index) => {
            //some answer contain spaces, so after split it's 2 different elements in array.
            //if two sequential elements or current element is in the list of answers, consider as the correct answer.
            //for processing questions like "What kind of data storage do you know?" Where answers: [local storage, session storage, cookies]
            //We consider that user answered correctly, if he specified more than half of answers in the list(e.g. local storage cookies)
            if (answer.indexOf(currentAnswer) > -1) {
                countOfCorrect++;
            } else if (index + 1 < userAnswer.length &&
                answer.indexOf(currentAnswer + " " + userAnswer[index + 1]) > -1) {
                countOfCorrect++;
            }
        });
        if (countOfCorrect > answer.length / 2) {
            result = true;
        }
    } else {
        result = answer.indexOf(userAnswer) > -1;
    }
    return result;
}

/**
 * Function that return random question for specific topic and level.
 */
function getRandomQuestion(level, topic, answeredQuestions) {
    var index;
    var question;
    var subtopic;
    do {
        //choose random subtopic
        let subtopicIndex = Math.floor(Math.random() * topics[topic].length);
        subtopic = topics[topic][subtopicIndex];
        //and choose random question in this subtopic
        index = Math.floor(Math.random() * questions[level][subtopic].length);
        question = questions[level][subtopic][index];
    } while(answeredQuestions.indexOf(question.id) > -1);
    return {
        question,
        index,
        subtopic
    };
}

/**
 * Function that return previously asked question.
 */
function repeatQuestion(level, lastQuestion) {
    const subtopic = lastQuestion.subtopic;
    const index = lastQuestion.index;
    const questionText = questions[level][subtopic][index].question;
    return questionText;
}

module.exports = {
    getRandomQuestion,
    checkAnswer,
    repeatQuestion
};