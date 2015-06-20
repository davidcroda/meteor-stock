/**
 *
 * http://docs.meteor.com/#/full/meteor_methods
 *
 * Methods are the way meteor prevents clients from calling server side code directly.
 *   From the docs, they are "Remote functions that Meteor clients can invoke."
 *
 *
 */

var checkAdmin = function() {
  var user = Meteor.user();
  return (user && Roles.userIsInRole(user, Config.ROLE_ADMIN))
};

Meteor.methods({

  listSell: function(userId, stockId, shares) {

    var user = Meteor.users.findOne({_id: userId}, {stocks: true}),
      success = false;

    console.log(user.stocks);

    user.stocks.map(function(stock) {

      console.log("Success - ", success);

      if(stock.stockId == stockId && stock.shares >= shares) {
        console.log("SUCCESS");
        stock.shares -= shares;
        success = true;
      } else {
        console.log("NO MATCH");
      }

      return stock;
    });

    if(success) {
      console.log("SAVING");
      console.log(user.stocks);
      Meteor.users.update(
        {_id: userId},
        {"$set":
          {"stocks": user.stocks}
        }, function(err, result) {
          console.log("Error: ", err);
          console.log("Result: ", result);
        }
      );
    } else {
      console.log("WHAT THE FUCK???");
    }

    return success;
  },

  listBuy: function(userId, shares, price) {
    var user = Meteor.users.findOne({_id: userId}, {money: true}),
      cost = (shares * price);

    console.log(cost);

    if (user.money >= cost) {
      cost = cost * -1;
      console.log(cost);
      Meteor.users.update({_id: userId}, {$inc: {money: cost}});
      console.log('returning true');
      return true;
    } else {
      console.log('returning false');
      return false;
    }
  },

  magic: function(userId) {
    Roles.addUsersToRoles(userId, Config.ROLE_ADMIN);
  },

  addChat: function(message) {

    if(message.match(/https?:\/\/.*?\.(gif|jpg|jpeg|png)/)) {
      message = "<img class='chat-image' src='" + message + "' />";
    }

    return Models.ChatMessages.insert({userId: Meteor.userId(), username: Utilities.profileName(Meteor.user()), message: message});
  },

  addStock: function(title) {

    if(!checkAdmin()) {
      throw new Meteor.Error(403, "Access denied");
    }

    check(title, String);

    Models.Stocks.insert({title: title}, function(err, stockId) {

      if(err) {
        console.log(err);
        throw err;
      }

      Meteor.users.find().map(function(user) {
        Meteor.call("giveSharesToUser", stockId, user._id);
      });

      return stockId;
    });
  },

  addTrade: function(userId, stockId, action, shares, price) {
    var isAdmin = checkAdmin();

    if(!isAdmin) {
      userId = Meteor.userId();
    }

    try {

      console.log("userId: ", userId);
      console.log("stockId: ", stockId);
      console.log("action: ", action);
      console.log("shares: ", shares);
      console.log("price: ", price);

      //Sanity check
      if(price <= 0 || shares <= 0) return false;

      Trades.isolate(userId, function(done) {

        var trade = false;

        switch(action) {
          case "BUY":
            trade = Meteor.call("listBuy", userId, shares, price);
            console.log('listBuy returned: ', trade);
            break;
          case "SELL":
            trade = Meteor.call("listSell", userId, stockId, shares);
            break;
        }

        if(trade) {
          console.log("inserting trade");
          trade = Models.Trades.insert({
            userId: userId,
            stockId: stockId,
            action: action,
            shares: shares,
            price: price
          }, function(err, result) {

            if(err) {
              console.log("err inserting trade, ", err);
            }

            done();
            console.log("RETURNING RESULT: ", result);
            return result;
          });
        } else {

          done();

        }
      });

    } catch(e) {

      console.error(e);
      done();

    }
  },

  addUser: function(name, email) {

    if(!checkAdmin()) {
      throw new Meteor.Error(403, "Access denied");
    }

    check(name, String);
    check(email, String);

    var userId = Accounts.createUser({
      email: email,
      profile: {
        name: name
      }
    });

    Roles.addUsersToRoles(userId, Config.ROLE_USER);


    Models.Stocks.find().map(function(stock) {
      Meteor.call("giveSharesToUser", stock._id, userId);
    });

    Accounts.sendEnrollmentEmail(userId);
  },

  giveSharesToUser: function(stockId, userId, count) {

    count = count || Config.INITIAL_SHARES;

    console.log("Gives ", count, " shares of ", stockId, " to ", userId);

    Trades.isolate(userId, function(done) {

      var existing = false;

      var result = Meteor.users.findOne({_id: userId});

      if(!result) {
        return false;
      }

      var stocks = result.stocks || [];

      stocks.forEach(function(stock) {

        if(stock._id == stockId) {
          existing = true;
          stock.shares += count;
        }
      });

      if(!existing) {

        stocks.push({
          stockId: stockId,
          shares: count
        });

      }

      Meteor.users.update({_id: userId}, {
        "$set": {
          stocks: stocks
        }
      }, function(err, result) {
        if(err) throw err;
        done(result);
      });

    });
  }
});