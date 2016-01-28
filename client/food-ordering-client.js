var today = currentDate();

Template.order_guy.helpers({
    order_completed: function() {
        var orders = Orders.findOne({data: today});
        if (orders && orders.orders_size && orders.orders) {
            var completed = orders.orders_size == Object.keys(orders.orders).length;
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
            var result = [];
            Object.keys(orders.orders).forEach(function (k) {
                result.push({'name': k, 'meal': orders.orders[k]});
            });
            return result;
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
        delete orders.orders[event.target.id];
        Orders.update({_id: orders._id}, {$set: {orders: orders.orders}});
    }
});

Template.order_food.events({
    'submit .submit-order': function (event) {

        event.preventDefault();

        var name = event.target.name.value;
        var meal = event.target.meal.value;

        var order = Orders.findOne({data: today});
        if (order) {
            order.orders[name] = meal;
            Orders.update(order._id, {$set: {'orders': order.orders}});
        } else {
            var o = {};
            o[name] = meal;
            Orders.insert({data: today, orders_size: 2, orders: o});
        }
        Meteor.call("checkCompleted");
    }
});

Template.order_food.helpers({
    orderDisabled: function() {
        var orders = Orders.findOne({data: today});
        if (orders && orders.orders_size && orders.orders) {
            var completed = orders.orders_size == Object.keys(orders.orders).length;
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
            var completed = orders.orders_size == Object.keys(orders.orders).length;
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
