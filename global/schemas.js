Models = {};
Schema = {};

//Models.Matches = new Mongo.Collection("matches");
//Models.Matches.attachSchema(new SimpleSchema({
//  title: {
//    type: String,
//    label: "Title",
//    max: 200
//  },
//  start_date: {
//    type: Date,
//    label: "Start Date"
//  },
//  end_date: {
//    type: Date,
//    label: "End Date"
//  }
//}));

Models.ChatMessages = new Mongo.Collection("chat_messages");
Models.ChatMessages.attachSchema(new SimpleSchema({
  userId: {
    type: String
  },
  username: {
    type: String
  },
  message: {
    type: String
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if(this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();
      }
    }
  }
}));

Models.Stocks = new Mongo.Collection("stocks");
Models.Stocks.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: "Title",
    max: 200,
    unique: true
  }
}));


Models.UsersStocks = new Mongo.Collection("users_stocks");
Models.UsersStocks.attachSchema(new SimpleSchema({
  userId: {
    type: String
  },

}));

Models.PendingTrades = new Mongo.Collection("pending_trades");
Models.PendingTrades.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  }
}));


Models.Trades = new Mongo.Collection("trades");
Models.Trades.attachSchema(new SimpleSchema({
  userId: { type: String },
  stockId: { type: String },
  action: { type: String },
  shares: { type: Number },
  price: { type: Number },
  executed: { type: Boolean, defaultValue: false}
}));


Schema.UserProfile = new SimpleSchema({
  name: {
    type: String,
    regEx: /^[a-zA-Z- 0-9\.]{2,25}$/,
    optional: true
  },
  status: {
    type: Object,
    optional: true
  }
});

Schema.User = new SimpleSchema({
  username: {
    type: String,
    regEx: /^[a-z0-9A-Z_]{3,15}$/,
    optional: true
  },
  emails: {
    type: [Object],
    // this must be optional if you also use other login services like facebook,
    // but if you use only accounts-password, then it can be required
    optional: true
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {
    type: Boolean
  },
  createdAt: {
    type: Date
  },
  profile: {
    type: Schema.UserProfile,
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },

  money: {
    type: Number,
    defaultValue: Config.INITIAL_MONEY
  },

  stocks: {
    type: [Object],
    optional: true
  },

  "stocks.$.stockId": {
    type: String
  },

  "stocks.$.shares": {
    type: Number,
    autoValue: function() {
      return Config.INITIAL_SHARES;
    }
  },

  // Option 2: [String] type
  // If you are sure you will never need to use role groups, then
  // you can specify [String] as the type
  roles: {
    type: [String],
    optional: true
  }
});

Meteor.users.attachSchema(Schema.User);