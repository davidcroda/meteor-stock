Meteor.startup(function () {

  Meteor.publish("onlineUsers", function() {
    var filter = {"state":"online"};
    return Presences.find(filter, {fields: {state: true, userId: true}});
  });

  Meteor.publish("allUsers", function() {
    return Meteor.users.find({}, { fields: {username: true, emails: true, profile: true, stocks: true}});
  });

  Meteor.publish("recentChat", function() {
    return Models.ChatMessages.find({
      createdAt: {
        "$gt": moment().subtract(1, 'hour').toDate()
      }
    });
  });

  Meteor.publish("stocks", function() {
    return Models.Stocks.find({});
  });

  Meteor.publish("userData", function() {
    return Meteor.users.find(
      {_id: this.userId},
      {fields: {
        'money': true,
        'stocks': true
      }}
    )
  })

});