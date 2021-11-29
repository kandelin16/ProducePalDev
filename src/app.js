'use strict';
const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');

console.log('This template uses an outdated version of the Jovo Framework. We strongly recommend upgrading to Jovo v4. Learn more here: https://www.jovo.tech/docs/migration-from-v3');

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const app = new App();

app.use(
  new Alexa(),
  new GoogleAssistant(),
  new JovoDebugger(),
  new FileDb()
);

// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
  LAUNCH() {
    this.setUserFoodDict()
    this.ask("Welcome to Produce Pal! Try adding something to your fridge!")
  },

  AddFoodIntent() {
    this.$session.$data.tempFood = this.$inputs.food.value
    this.ask("Ok, how long will your " + this.$inputs.food.value + " last?")
  },

  SaveFoodIntent() {
    var expirationDate = this.addDays(Date.now(), parseInt($this.$inputs.number.value))
    this.$user.$data.food[this.$session.$data.tempFood]["ExpirationDate"] = expirationDate
    this.ask("Awesome! How many servings of " + this.$session.$data.tempFood + " are there?")
  },

  ServingCountIntent() {
    this.$user.$data.food[this.$session.$data.tempFood]["ServingCount"] = this.$data.$inputs.number.value
    this.ask("All set. Feel free to save other food.")
  },

  setUserFoodDict() {
    if (this.$user.$data.food == null) {
      this.$user.$data.food = {}
    }
  },

  addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
});

module.exports = { app };
