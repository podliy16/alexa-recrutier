/**
 * Percent of correct answered questions in middle level to determinate candidate position.
 */
const POSITIONS_SUCCESS_RATE = {
    JUNIOR: 0.3,
    STRONG_JUNIOR: 0.5,
    MIDDLE: 0.7,
};

/**
 * Build card from detailed statistic, which contain total count and count of correct answered questions.
 */
function buildCardText(detailedStatistic) {
    let text = "Your detailed statistic: \n";
    for (let key of Object.keys(detailedStatistic)) {
        let value = detailedStatistic[key];
        text += `You answered correctly ${value.correctCount} out of ${value.totalCount} in ${key} topic \n`;
    }
    return text;
}

/**
 * Calculate position of candidate, dependent on statistic of answered questions and level.
 * We can say that candidate is junior, if he get middle level questions, but didn't answered any one of it.
 */
function calculatePosition(questionsStat, level) {
    const POSITIONS_TEXT = {
        JUNIOR: "Junior",
        STRONG_JUNIOR: "Strong junior",
        MIDDLE: "Middle",
        STRONG_MIDDLE: "Strong middle"
    };
    if (level == 0) {
        return POSITIONS_TEXT.JUNIOR;
    }

    let successRate = questionsStat[1].correctCount / questionsStat[1].totalCount;
    if (successRate <= POSITIONS_SUCCESS_RATE.JUNIOR) {
        return POSITIONS_TEXT.JUNIOR;
    }
    if (successRate <= POSITIONS_SUCCESS_RATE.STRONG_JUNIOR) {
        return POSITIONS_TEXT.STRONG_JUNIOR;
    }
    if (successRate <= POSITIONS_SUCCESS_RATE.MIDDLE) {
        return POSITIONS_TEXT.MIDDLE;
    }
    return POSITIONS_TEXT.STRONG_MIDDLE;
}

/**
 * Build response for alexa.
 */
function buildResponse(speechOutput, repromptText, shouldEndSession, card) {
    let result = {
        outputSpeech: {
            type: 'SSML',
            ssml: "<speak>" + speechOutput + "</speak>"
        },
        card: {
            type: "Simple",
            title: "Detailed statistic",
            content: "tmp"
        },
        shouldEndSession
    };

    if (repromptText != null) {
        result['reprompt'] = {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText
            }
        }
    }

    if (card !== null) {
        result['card'] = {
            type: "Simple",
            title: "Detailed statistic",
            content: card
        }
    }
    return result;
}

module.exports = {
    buildCardText,
    calculatePosition,
    buildResponse
};