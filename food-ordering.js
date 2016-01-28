Orders = new Mongo.Collection("orders");

if (Meteor.isClient) {
    var date = new Date();
    var today = date.getDate() + ":" + date.getMonth();


    Template.order_guy.helpers({
        order_completed: function() {
            var orders = Orders.findOne({data: today});
            if (orders && orders.orders_size && orders.orders) {
                var completed = orders.orders_size == orders.orders.length;
                console.log("Is completed? " + completed);
                return completed;
            } else {
                return false;
            }
        },

        order_caller: function() {
            var completed = Orders.findOne({data: today});
            return completed.caller;
        }
    });


    Template.orders_list.helpers({
        orders: function() {
            var orders = Orders.findOne({data: today})
            if (orders) {
                return orders.orders;
            } else {
                return [];
            }
        }
    });

    Template.orders_list.events({
        'submit .order-removed': function (event) {
            event.preventDefault();

            console.log(event.target.id);
            var orders = Orders.findOne({data: today});
            var newOrders = orders.orders.filter(function (x) { return x.name != event.target.id });
            Orders.update({_id: orders._id}, {$set: {orders: newOrders}});
        }
    });

    Template.order_food.events({
        'submit .submit-order': function (event) {

            event.preventDefault();

            var name = event.target.name.value;
            var meal = event.target.meal.value;

            var order = Orders.findOne({data: today});
            if (order) {
                Orders.update(order._id, {$push: {'orders': {name: name, meal: meal}}});
            } else {
                Orders.insert({data: today, orders_size: 2, orders: [{name: name, meal: meal}]});
            }
            Meteor.call("checkCompleted");
        }
    });

    Template.order_food.helpers({
        orderDisabled: function() {
            var orders = Orders.findOne({data: today});
            if (orders && orders.orders_size && orders.orders) {
                var completed = orders.orders_size == orders.orders.length;
                return completed ? "disabled" : "";
            } else {
                return "";
            }
        }
    });

    Template.orders_size.helpers({
        selectors: function() {
            var orders = Orders.findOne({data: today});
            var selected = 2;
            if (orders) {
                selected = orders.orders_size;
            }
            return [
                {value: '2', isSelected: (selected == 2 ? 'selected' : ''), name: '2'},
                {value: '3', isSelected: (selected == 3 ? 'selected' : ''), name: '3'},
                {value: '4', isSelected: (selected == 4 ? 'selected' : ''), name: '4'},
                {value: '5', isSelected: (selected == 5 ? 'selected' : ''), name: '5'}
            ];
        },

        ordersSizeDisabled: function() {
            var orders = Orders.findOne({data: today});
            if (orders && orders.orders_size && orders.orders) {
                var completed = orders.orders_size == orders.orders.length;
                return completed ? "disabled" : "";
            } else {
                return "";
            }
        }

    });

    Template.orders_size.events({
        'change .orderssize': function(event) {
            event.preventDefault();

            var selectedValue = event.target.value;

            console.log("orders size: " + selectedValue);
            Meteor.call("setOrdersSize", selectedValue);
            Meteor.call("checkCompleted");
        }
    });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

Meteor.methods({
    setOrdersSize: function(newValue) {
        var date = new Date();
        var today = date.getDate() + ":" + date.getMonth();

        var orders = Orders.findOne({data: today});
        if (!orders) {
            Orders.insert({data: today, orders_size: newValue})
        } else {
            console.log("UPDATING " + orders + " to " + newValue);
            Orders.update({data: today}, {$set: {orders_size: newValue}});
        }
    },

    checkCompleted: function() {
        var date = new Date();
        var today = date.getDate() + ":" + date.getMonth();

        var orders = Orders.findOne({data: today});
        if (orders && orders.orders_size && orders.orders && orders.orders.length == orders.orders_size /*caller*/) {
            var random = Math.floor((Math.random() * orders.orders.length));
            var caller = orders.orders[random].name;
            Orders.update({data: today}, {$set: {caller: caller}});
        }
    }
});
