'use strict';
const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');
//const { DynamoDb } = require('jovo-db-dynamodb');

console.log('This template uses an outdated version of the Jovo Framework. We strongly recommend upgrading to Jovo v4. Learn more here: https://www.jovo.tech/docs/migration-from-v3');

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const app = new App();

app.use(
  new Alexa(),
  new GoogleAssistant(),
  new JovoDebugger(),
  new FileDb(),
  //new DynamoDb()
);

// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
  LAUNCH() {
    this.setUserDict()
    return this.toIntent('WelcomeIntent');
  },

  WelcomeIntent() {
    this.ask("Welcome to Produce Pal! Try adding something to your fridge!")
  },

  AddFoodIntent() {
    this.$session.$data.tempFood = this.$inputs.food.value
    this.$user.$data.food[this.$session.$data.tempFood] = {}
    this.ask("Ok, how long will your " + this.$inputs.food.value + " last?")
  },

  DurationIntent() {
    var expirationDate = this.addDays(Date.now(), parseInt(this.$inputs.days.value))
    var addedDate = Date.now()
    this.$user.$data.food[this.$session.$data.tempFood]["AddedDate"] = addedDate
    this.$user.$data.food[this.$session.$data.tempFood]["ExpirationDate"] = expirationDate
    this.ask("Awesome! How many servings of " + this.$session.$data.tempFood + " are there?")
  },

  ServingCountIntent() {
    this.$user.$data.food[this.$session.$data.tempFood]["ServingCount"] = this.$inputs.servings.value
    this.$session.$data.tempFood = ""
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
    var addedDate = Date.now()
    
    this.$user.$data.food[food] = {}
    this.$user.$data.food[food]["ExpirationDate"] = expirationDate
    this.$user.$data.food[food]["ServingCount"] = servings
    this.$user.$data.food[food]["AddedDate"] = addedDate
    this.ask("Added. Other food?")
  },

  RemoveFoodIntent() {
    this.$session.$data.tempFood = this.$inputs.food.value
    this.ask("Was the " + this.$inputs.food.value + " eaten or thrown away?")
  },

  //FIX ME: Needs modeling
  RemoveFoodMethodIntent() {
    var food = this.$session.$data.tempFood

    //FIX ME: Maybe sanitize the method input for standard values? Or will the voice model do this?
    var method = this.$inputs.DisposalMethod.value
    var servings = this.$user.$data.food[this.$session.$data.tempFood]["ServingCount"]
    this.CreateDisposalLog(food, method, servings)
    delete this.$user.$data.food[this.$session.$data.tempFood]

    this.ask("Removed. Other Food?")
  },

  CreateDisposalLog(food, method, servings) {
    this.$user.$data.DisposalLog[Date.now()] = {}
    this.$user.$data.DisposalLog[Date.now()]["Food"] = food
    this.$user.$data.DisposalLog[Date.now()]["DisposalMethod"] = method
    this.$user.$data.DisposalLog[Date.now()]["ServingCount"] = servings
  },

  "AMAZON.StopIntent"() {
    this.tell("Goodbye!")
  },

  "AMAZON.HelpIntent"() {
    this.ask("I can do a lot of things. For example, you could tell me to add a food to your fridge, and I will keep track of it for you. Or you can ask what food you have in your fridge and I can tell you that list as well. What would you like to do?")
  },

  "AMAZON.CancelIntent"() {
    this.tell("Goodbye!")
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
  },

  HowOldIsIntent() {
    var dt = Date.now()
    var dateAdded = this.$user.$data.food[this.$inputs.food.value]["AddedDate"]
    var timeDiff = dt - dateAdded;
    var dateDiff = timeDiff / (1000 * 60 * 60 * 24)
    if (dateDiff < 1) {
      this.ask("You added your " + this.$inputs.food.value + " today. Would you like to do something else?")
    }
    else {
      this.ask("Your " + this.$inputs.food.value + " is " + Math.round(dateDiff) + " days old. Would you like to do something else?")
    }
  },
  
  WhenExpireIntent() {
    var dt = new Date(Date.now())
    var expirationDate = new Date(this.$user.$data.food[this.$inputs.food.value]["ExpirationDate"])
    console.log(dt)
    console.log(expirationDate)

    var timeDiff = expirationDate - dt;
    console.log(timeDiff)
    var dateDiff = timeDiff / (1000 * 60 * 60 * 24)
    console.log(dateDiff)

    if (dateDiff < 1) {
      this.ask("Your " + this.$inputs.food.value + " expires today. Would you like to do something else?")
    }
    else {
      this.ask("Your " + this.$inputs.food.value + " expires in " + Math.round(dateDiff) + " days. Would you like to do something else?")
    }
  }
});

module.exports = { app };
