Session.setDefault('show_timestamps', false);
Session.setDefault('show_online_users', false);
Session.setDefault('limitSale', true);

var PROJECT_NAME = "Meteor Stocks";

Meteor.subscribe('onlineUsers');
Meteor.subscribe('userData');
Meteor.subscribe("recentChat", function() {
  console.log('subscribe recentChat callback');
  $("#chat-window").scrollTop(999999);
});

Template.add_trades.helpers({
  stocks: function() {
    return Models.Stocks.find();
  },
  users: function() {
    return Meteor.users.find();
  },
  limitSale: function() {
    return Session.get('limitSale');
  }
});
Template.add_trades.events({
  'change #market': function(ev) {
    Session.set('limitSale', !ev.target.checked)
  },
  'submit form': function(ev) {

    var userId = ev.target.user.value,
      stockId = ev.target.stock.value,
      action = ev.target.action.value,
      shares = ev.target.shares.value,
      price = (ev.target.market.checked) ? -1 : ev.target.amount.value;

    Meteor.call("addTrade", userId, stockId, action, shares, price, function(err, trade) {

      console.log("Callback called with err: ", err, ' trade: ', trade);

      if(err) {
        console.error(err);
        throw err;
      }

      console.log("Trade Result: ", trade);

      if(trade) {
        FlashMessages.sendSuccess("Added Trade ", trade._id);
      } else {
        FlashMessages.sendError("Error adding Trade");
      }
    });

    return ev.preventDefault();
  }
});

Template.chat.helpers({
  sanitize: function(string) {
    return UniHTML.purify(string);
  },
  showOnlineUsers: function() {
    return Session.get('show_online_users');
  },
  chatMessages: function() {
    return Models.ChatMessages.find({
      createdAt: {
        "$gt": moment().subtract(10, 'minutes').toDate()
      }
    }, {sort: {createdAt: -1}, limit: 100}).fetch().reverse();
  },
  formatDate: function() {
    return moment(this.createdAt).format("hh:mm:ss")
  },
  showTimestamps: function() {
    return Session.get('show_timestamps');
  },
  onlineUsers: function() {
    var users = Presences.find({"state":"online"}).map(function(presence) {
      return Meteor.users.findOne({_id: presence.userId}, {fields: {
        username: true, emails: true, profile: true
      }});
    });
    return users;
  },
  profileName: function() {
    return Utilities.profileName(this);
  }
});

Template.chat.events({
  "submit #chat-input": function(ev) {
    Meteor.call("addChat", ev.target.text.value);
    ev.target.text.value = "";
    $("#chat-window").scrollTop(999999);
    return false;
  },
  "change #show_timestamps": function(ev) {
    Session.set("show_timestamps", ev.target.checked);
  },
  "click #toggle-online-users": function() {
    Session.set('show_online_users', ! Session.get('show_online_users'));
    return false;
  }
});

Template.registerHelper('not', function(val) {
  return !val;
});

Template.stocks.helpers({
  PROJECT_NAME: PROJECT_NAME,
  users: function() {
    Meteor.subscribe('allUsers');
    return Meteor.users.find({});
  },
  profileName: function() {
    return Utilities.profileName(this);
  },
  stocks: function() {
    Meteor.subscribe("stocks");
    return Models.Stocks.find();
  },
  getShares: function(stockId, stocks) {
    stocks = stocks || [];

    var shares = 0;

    stocks.forEach(function(stock) {
      if(stock.stockId == stockId) {
        shares = stock.shares;
      }
    });

    return shares;
  }
});

Template.stocks.events({
  'click button': function () {
    // increment the counter when button is clicked
    Session.set('counter', Session.get('counter') + 1);
  }
});

Template.add_user.events({
  'submit #add_user': function(event) {

    var name = event.target.name.value,
      email = event.target.email.value;
    Meteor.call("addUser", name, email, function(err, result) {
      console.log(err, result);
      event.target.name.value = "";
      event.target.email.value = "";

      if(err) {
        FlashMessages.sendError("Error Adding User: " + err.message);
      } else {
        FlashMessages.sendSuccess("Added User " + name + " [" + email + "]");
      }

    });
    return false;
  }
});

Template.add_stock.events({
  'submit #add_stock': function(event) {
    Meteor.call("addStock", event.target.name.value, function(err, result) {

      event.target.name.value = "";

      if(err) {
        FlashMessages.sendError("Error Adding Stock: " + err.message);
      } else {
        FlashMessages.sendSuccess("Added Stock " + name);
      }

    });
    return false;
  }
});

Template.nav.helpers({
  PROJECT_NAME: PROJECT_NAME
});

Template.nav_link.helpers({
  activeIfTemplate: function(template) {
    var route = Router.current().route;

    if (route && template == route.getName()) {
      return 'active';
    }
  }
});

Template.nav.events({
  "click #magic-button": function() {
    Meteor.call("magic", Meteor.userId());
  }
});