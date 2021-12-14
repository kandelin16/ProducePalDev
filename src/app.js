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
    this.setUserDict()
    this.ask("Welcome to Produce Pal! Try adding something to your fridge!")
  },

  AddFoodIntent() {
    this.$session.$data.tempFood = this.$inputs.food.value
    this.$user.$data.food[this.$session.$data.tempFood] = {}
    this.ask("Ok, how long will your " + this.$inputs.food.value + " last?")
  },

  DurationIntent() {
    var expirationDate = this.addDays(Date.now(), parseInt(this.$inputs.days.value))
    this.$user.$data.food[this.$session.$data.tempFood]["ExpirationDate"] = expirationDate
    this.ask("Awesome! How many servings of " + this.$session.$data.tempFood + " are there?")
  },

  ServingCountIntent() {
    this.$user.$data.food[this.$session.$data.tempFood]["ServingCount"] = this.$inputs.servings.value
    this.ask("All set. Do you want to save other food?")
  },

  ListFoodIntent() {
    var foodItems = this.$user.$data.food
    var foodNames = ""
    var lengthOfDict = Object.keys(foodItems).length
    var index = 1
    for (const [food, detailsDict] of Object.entries(foodItems)) {
      if (index == lengthOfDict) {
        foodNames = foodNames + " and " + food + "."
      }
      else {
        foodNames = foodNames + food + ", "
      }
      index ++
    }
    this.ask("In your fridge you have: " + foodNames)
  },

  QuickAddIntent() {
    var food = this.$inputs.food.value
    var servings = this.$inputs.servings.value
    var days = this.$inputs.days.value
    var expirationDate = this.addDays(Date.now(), parseInt(days))
    
    this.$user.$data.food[food] = {}
    this.$user.$data.food[food]["ExpirationDate"] = expirationDate
    this.$user.$data.food[food]["ServingCount"] = servings
    this.ask("Added. Other food?")
  },

  RemoveFoodIntent() {
    this.$session.$data.tempFood = this.$inputs.food.value
    this.ask("Was the " + this.$inputs.food.value + " eaten or thrown away?")
  },

  //FIX ME: Needs modeling
  RemoveFoodMethodIntent() {
    var food = this.$session.date.tempFood

    //FIX ME: Maybe sanitize the method input for standard values? Or will the voice model do this?
    var method = this.$inputs.method.value
    var servings = this.$user.$data.Food[this.$session.$data.tempFood]["ServingCount"]
    CreateDisposalLog(food, method, servings)
    delete this.$user.$data.Food[this.$session.$data.tempFood]
  },

  CreateDisposalLog(food, method, servings) {
    this.$user.$data.DisposalLog[Date.now()] = {}
    this.$user.$data.DisposalLog[Date.now()]["Food"] = food
    this.$user.$data.DisposalLog[Date.now()]["DisposalMethod"] = method
    this.$user.$data.DisposalLog[Date.now()]["ServingCount"] = servings
  },

  setUserDict() {
    if (this.$user.$data.food == null) {
      this.$user.$data.food = {}
    }
    if (this.$user.$data.DisposalLog == null) {
      this.$user.$data.DisposalLog = {}
    }
  },

  addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  noIntent() {
    this.tell("")
  }
});

module.exports = { app };
