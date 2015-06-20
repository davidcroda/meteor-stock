Trades = {};

Trades.isolate = function(userId, callback) {
  Models.PendingTrades.insert({
    userId: userId
  },function(err, pendingTradeId) {

    try {
      //This means there is already a pending trade, fail out

      callback(function() {

        Models.PendingTrades.remove({
          _id: pendingTradeId
        });

      });
    } catch (e) {
      console.error(e);
    }

    Models.PendingTrades.remove({
      _id: pendingTradeId
    });

  });
};