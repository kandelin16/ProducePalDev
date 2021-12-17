'use strict';
const { App, HttpService } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');
const { DynamoDb } = require('jovo-db-dynamodb');

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const app = new App();

app.use(
  new Alexa(),
  new GoogleAssistant(),
  new JovoDebugger(),
  new FileDb(),
  new DynamoDb()
);

// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
  async LAUNCH() {
    if (!this.$request.getAccessToken()) {
      this.$alexaSkill.showAccountLinkingCard();
      return this.toIntent('WelcomeIntentWithLink');
    } else {
      const url = `https://api.amazon.com/user/profile?access_token=${this.$request.getAccessToken()}`;

      const { data } = await HttpService.get(url);
      this.setUserDict()
      this.$user.$data.email = data.email
      this.$user.$data.name = data.name
      this.$user.$data.zip = data.postal_code
      return this.toIntent('WelcomeIntent');
    }
  },

  //Called upon initialization
  WelcomeIntentWithLink() {
    this.ask("Welcome to Produce Pal! To improve your experience, please link your amazon account! Try adding something to your fridge!")
  },

  //Called upon initialization
  WelcomeIntent() {
    this.ask("Welcome to Produce Pal! Try adding something to your fridge!")
  },

  //Adding Food - 1
  AddFoodIntent() {
    this.$session.$data.tempFood = this.$inputs.food.value
    this.$user.$data.food[this.$session.$data.tempFood] = {}
    this.ask("Ok, how long will your " + this.$inputs.food.value + " last?")
  },

  //Adding Food - 2
  DurationIntent() {
    var expirationDate = this.addDays(Date.now(), parseInt(this.$inputs.days.value))
    var addedDate = Date.now()
    this.$user.$data.food[this.$session.$data.tempFood]["AddedDate"] = addedDate
    this.$user.$data.food[this.$session.$data.tempFood]["ExpirationDate"] = expirationDate
    this.ask("All set. Do you want to save other food?")
  },

  //Returns a list of your food items.
  ListFoodIntent() {
    var foodItems = this.$user.$data.food
    var foodNames = ""
    var lengthOfDict = Object.keys(foodItems).length
    var index = 1
    for (const [food, detailsDict] of Object.entries(foodItems)) {
      if (lengthOfDict == 1) {
        foodNames = foodNames + food + "."
      }
      else {
        if (index == lengthOfDict) {
          foodNames = foodNames + " and " + food + "."
        }
        else {
          foodNames = foodNames + food + ", "
        }
      }
      index ++
    }
    this.ask("In your fridge you have: " + foodNames)
  },

  //Adds food in one intent
  QuickAddIntent() {
    var food = this.$inputs.food.value
    var days = this.$inputs.days.value
    var expirationDate = this.addDays(Date.now(), parseInt(days))
    var addedDate = Date.now()
    
    this.$user.$data.food[food] = {}
    this.$user.$data.food[food]["ExpirationDate"] = expirationDate
    this.$user.$data.food[food]["AddedDate"] = addedDate
    this.ask("Added. Other food?")
  },

  //Remove Food - 1
  RemoveFoodIntent() {
    this.$session.$data.tempFood = this.$inputs.food.value
    if (this.$inputs.food.value in this.$user.$data.food) {
      this.ask("Was the " + this.$inputs.food.value + " eaten or thrown away?")
    }
    else {
      this.ask("Sorry, I couldn't find that food item. Try saying it again.")
    }
  },

  //Remove Food - 2
  RemoveFoodMethodIntent() {
    var food = this.$session.$data.tempFood

    //FIX ME: Maybe sanitize the method input for standard values? Or will the voice model do this?
    var method = this.$inputs.DisposalMethod.value
    this.CreateDisposalLog(food, method)
    delete this.$user.$data.food[this.$session.$data.tempFood]

    this.ask("Removed. Other Food?")
  },

  //This function is called by the RemoveFoodMethodIntent. It creates a disposal log containing some information about the food.
  CreateDisposalLog(food, method) {
    this.$user.$data.DisposalLog[Date.now()] = {}
    this.$user.$data.DisposalLog[Date.now()]["Food"] = food
    this.$user.$data.DisposalLog[Date.now()]["DisposalMethod"] = method
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
