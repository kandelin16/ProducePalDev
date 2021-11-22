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
    this.ask("Welcom to Produce Pal! Try adding something to your fridge!")
  },

  HelloWorldIntent() {
    this.ask("Hello World! What's your name?", 'Please tell me your name.');
  },

  MyNameIsIntent() {
    this.tell('Hey ' + this.$inputs.name.value + ', nice to meet you!');
  },

  AddFoodIntent() {
    this.$session.$data.tempFood = this.$inputs.food.value
    this.ask("Ok, how long will your " + this.$inputs.food.value + " last?")
  },

  SaveFoodIntent() {
    this.$user.$data.food[this.$session.$data.tempFood] = this.$inputs.number.value
    this.ask("Awesome! I saved your " + this.$session.$data.tempFood)
  },

  setUserFoodDict() {
    this.$user.$data.food = {}
  }
});

module.exports = { app };
