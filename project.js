// ------------------------------------------------------------------
// JOVO PROJECT CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
  defaultStage: 'dev',
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
      endpoint: 'arn:aws:lambda:us-east-1:897369887681:function:producePal1',
    }
  }
};
