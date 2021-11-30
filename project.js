// ------------------------------------------------------------------
// JOVO PROJECT CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
  stages: {
    dev: {
      alexaSkill: {
        nlu: 'alexa',
      },
      googleAction: {
        nlu: 'dialogflow',
      },
      endpoint: '${JOVO_WEBHOOK_URL}',
    },
    prod: {
      
    }
  }
};
