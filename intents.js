'use strict';
const topics = require('./topics.json');
const questions = require('./questions');
const helpers = require('./helpers');

/**
 * Total count of questions in interview;
 */
const QUESTIONS_COUNT = 5;
/**
 * Percent of questions which you should answer correct, to proceed for middle level.
 */
const QUESTIONS_NEXT_LVL = 0.1;

const TEXTS = {
    WELCOME: "Welcome, I'm Alexa recruiter. You should choose topic. Available topics are: Frontend Javascript, Node js",
    WRONG_TOPIC: "I don't know such topic, please choose Frontend Javascript or Node js",
    CANT_CHANGE_TOPIC: "You can't change topic during interview. You can finish current talk by saying CANCEL",
    EXIT: "You're leaving Alexa Recruiter skill"
};

const LEVELS = {
    JUNIOR: 0,
    MIDDLE: 1
};

/**
 * Function which executed on launch.
 */
function onLaunch() {
    const sessionAttributes = {};
    return {
        sessionAttributes,
        speechletResponse: helpers.buildResponse(TEXTS.WELCOME, null, false, null)
    }
}

/**
 * Handlers of all intents;
 */
function onIntent(intentRequest, session) {
    let sessionAttributes = session.attributes;
    if (sessionAttributes === undefined) {
        sessionAttributes = {};
    }

    const intent = intentRequest.intent;
    const intentName = intent.name;
    console.log(`intent = ${intentName}`);
    return intents[intentName](intent, sessionAttributes);
}

/**
 * Object with all intents.
 */
const intents = {
    'Start': function(intent, sessionAttributes) {
        const topicSlot = intent.slots.Topic;
        let speechOutput = TEXTS.WRONG_TOPIC;

        //if user want to change topic, during interview
        if (sessionAttributes['lastQuestion'] !== undefined) {
            return {
                sessionAttributes,
                speechletResponse: helpers.buildResponse(TEXTS.CANT_CHANGE_TOPIC, null, false, null)
            }
        }

        if (topicSlot && topicSlot.value !== undefined) {
            const topicValue = topicSlot.value;
            if (topics[topicValue]) {
                sessionAttributes['topic'] = topicValue;
                const question = questions.getRandomQuestion(0, topicValue, []);
                speechOutput = question.question.question;
                sessionAttributes['lastQuestion'] = {
                    index: question.index,
                    subtopic: question.subtopic
                };
                sessionAttributes['countQuestions'] = 1;
                //storing list of asked questions to prevent repetition of asked questions
                sessionAttributes['answeredQuestions'] = [question.question.id];
                sessionAttributes['level'] = 0;
                sessionAttributes['detailedStatistic'] = {};
                sessionAttributes['detailedStatistic'][question.subtopic] = {
                    totalCount: 1,
                    correctCount: 0
                };
                sessionAttributes['questionsCount'] = [
                    {
                        level: LEVELS.JUNIOR,
                        totalCount: 1,
                        correctCount: 0
                    },
                    {
                        level: LEVELS.MIDDLE,
                        totalCount: 0,
                        correctCount: 0
                    }
                ];
            }
        }
        return {
            sessionAttributes,
            speechletResponse: helpers.buildResponse(speechOutput, null, false, null)
        }
    },
    'AnswerQuestion': function(intent, sessionAttributes) {
        const topic = sessionAttributes['topic'];
        const lastQuestion = sessionAttributes['lastQuestion'];
        let questionsCount = sessionAttributes['questionsCount'];
        let level = sessionAttributes['level'];
        let detailedStatistics = sessionAttributes['detailedStatistic'];
        let card = null;
        const answerSlot = intent.slots.Answer;
        let finishSession = false;

        //If user didn't choose a topic
        if (lastQuestion === undefined) {
            return {
                sessionAttributes,
                speechletResponse: helpers.buildResponse(TEXTS.WRONG_TOPIC, null, false, null)
            }
        }
        //TODO: delete if can't reproduce
        if (!answerSlot || answerSlot.value === undefined) {
            return {
                sessionAttributes,
                speechletResponse: helpers.buildResponse('REPEAT QUESTION', null, false, null)
            }
        }

        let speechOutput = '';
        const answerValue = answerSlot.value;
        console.log(`answer value = ${answerValue}`);
        const isAnswerCorrect = questions.checkAnswer(level, lastQuestion, answerValue);
        if (isAnswerCorrect) {
            questionsCount[level].correctCount += 1;
            detailedStatistics[lastQuestion.subtopic].correctCount++;

            //proceed for next level of questions
            if (questionsCount[level].totalCount / questionsCount[level].correctCount >= QUESTIONS_NEXT_LVL && level == 0) {
                level++;
            }
        }
        questionsCount[level].totalCount += 1;
        sessionAttributes['questionsCount'] = questionsCount;
        if (sessionAttributes['countQuestions'] == QUESTIONS_COUNT) {
            let position = helpers.calculatePosition(sessionAttributes['questionsCount'], level);
            let countCorrect = questionsCount[0].correctCount + questionsCount[1].correctCount;
            speechOutput = `Your level is ${position} developer. You answered correctly ${countCorrect} out of ${QUESTIONS_COUNT} questions. For detailed statistic check out your alexa app.`;
            card = helpers.buildCardText(detailedStatistics);
            finishSession = true;
        } else {
            const question = questions.getRandomQuestion(level, topic, sessionAttributes['answeredQuestions']);
            speechOutput = question.question.question;
            sessionAttributes['lastQuestion'] = {
                index: question.index,
                subtopic: question.subtopic
            };
            if (detailedStatistics[question.subtopic] === undefined) {
                detailedStatistics[question.subtopic] = {
                    totalCount: 1,
                    correctCount: 0
                }
            } else {
                detailedStatistics[question.subtopic].totalCount++;
            }
            sessionAttributes['answeredQuestions'].push(question.question.id);
        }
        sessionAttributes['level'] = level;
        sessionAttributes['countQuestions']++;
        sessionAttributes['detailedStatistic'] = detailedStatistics;
        return {
            sessionAttributes,
            speechletResponse: helpers.buildResponse(speechOutput, null, finishSession, card)
        }
    },
    'AMAZON.CancelIntent': function(intent, sessionAttributes) {
        return {
            sessionAttributes,
            speechletResponse: helpers.buildResponse(TEXTS.EXIT, null, true, null)
        }
    },
    'AMAZON.RepeatIntent': function(intent, sessionAttributes) {
        const lastQuestion = sessionAttributes['lastQuestion'];
        const level = sessionAttributes['level'];
        const questionText = questions.repeatQuestion(level, lastQuestion);
        return {
            sessionAttributes,
            speechletResponse: helpers.buildResponse(questionText, null, false, null)
        }
    }
};



module.exports = {
    onLaunch,
    onIntent
};