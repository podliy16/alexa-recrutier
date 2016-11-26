'use strict';
const APPLICATION_ID = 'amzn1.ask.skill.c6a42742-e204-47bc-83a9-cf3d6f5653d6';
const model = require('./intents');

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}


/**
 * --------------- Main handler -----------------------
 * Route the incoming request based on type (LaunchRequest, IntentRequest,
 * etc.) The JSON body of the request is provided in the event parameter.
 */
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        if (event.session.application.applicationId !== APPLICATION_ID) {
            callback('Invalid Application ID');
        }

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            let result = model.onLaunch(event.request, event.session);
            callback(null, buildResponse(result.sessionAttributes, result.speechletResponse));
        }
        if (event.request.type === 'IntentRequest') {
            let result = model.onIntent(event.request, event.session);
            callback(null, buildResponse(result.sessionAttributes, result.speechletResponse));
        }
        if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        console.log("ERROR: " + err);
        callback(err);
    }
};
