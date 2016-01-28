Orders = new Mongo.Collection("orders");


Meteor.methods({
    setOrdersSize: function(newValue) {
        var today = currentDate();

        var orders = Orders.findOne({data: today});
        if (!orders) {
            Orders.insert({data: today, orders_size: newValue})
        } else {
            console.log("UPDATING " + orders + " to " + newValue);
            Orders.update({data: today}, {$set: {orders_size: newValue}});
        }
    },

    checkCompleted: function() {
        var today = currentDate();

        var orders = Orders.findOne({data: today});
        if (orders && orders.orders_size && orders.orders && orders.orders.length == orders.orders_size /*caller*/) {
            var random = Math.floor((Math.random() * orders.orders.length));
            var caller = orders.orders[random].name;
            Orders.update({data: today}, {$set: {caller: caller}});
        }
    }
});
