// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
  logging: true,

  intentMap: {
    'AMAZON.StopIntent': 'END',
  },

  db: {
    DynamoDb: {
        tableName: 'producePal1',
    }
  }
};