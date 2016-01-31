Orders = new Mongo.Collection("orders");
Groups = new Mongo.Collection("groups");

// ROUTES

Router.configure({
    layoutTemplate: 'main'
});

Router.route('/', {
    template: 'Groups'
});

Router.route('/groups/:group', function () {
    group = this.params.group;
    console.log("group: " + group);
    this.render('todayOrder', {data: {group: group}});
});


// HELPER FUNCTIONS GLOBALS

currentDate = function() {
    var date = new Date();
    return date.getDate() + ":" + date.getMonth();
};

isOrderCompleted = function(group) {
    var order = findTodayOrderForGroup(group);
    console.log("is order completed? " + order);
    return (order && order.orders_size == Object.keys(order.orders).length);
};

findTodayOrderForGroup = function(group) {
    return Orders.findOne({data: currentDate(), group: group});
}


// CLIENT SIDE

if (Meteor.isClient) {
    var today = currentDate();

    Template.listGroups.helpers({
        groups: function() {
            return Groups.find({});
        }
    });

    Template.addGroup.events({
        'submit .add-group ': function (event) {
            event.preventDefault();

            console.log("Adding group " + event.target.name.value);
            Groups.insert({name: event.target.name.value});
        }
    });

    Template.orders_size.helpers({
        selectors: function(group) {
            var orders = findTodayOrderForGroup(group);
            var selected = '-';
            if (orders) {
                selected = orders.orders_size;
            }
            return [
                {value: '-', isSelected: (selected == 2 ? 'selected' : '')},
                {value: '1', isSelected: (selected == 1 ? 'selected' : '')},
                {value: '2', isSelected: (selected == 2 ? 'selected' : '')},
                {value: '3', isSelected: (selected == 3 ? 'selected' : '')},
                {value: '4', isSelected: (selected == 4 ? 'selected' : '')},
                {value: '5', isSelected: (selected == 5 ? 'selected' : '')},
                {value: '6', isSelected: (selected == 6 ? 'selected' : '')},
                {value: '7', isSelected: (selected == 7 ? 'selected' : '')},
                {value: '8', isSelected: (selected == 8 ? 'selected' : '')}
            ];
        },

        ordersSizeDisabled: function() {
            var orders = findTodayOrderForGroup(this.group);
            if (orders && isOrderCompleted(this.group)) {
                return "disabled";
            } else {
                return "";
            }
        }
    });

    Template.orders_size.events({
        'change .orderssize': function(event) {
            event.preventDefault();

            var selectedValue = event.target.value;

            console.log("change orders size: " + selectedValue);
            Meteor.call("setOrdersSize", this.group, selectedValue);
            Meteor.call("tryComplete", this.group);
        }
    });

    Template.order_food.events({
        'submit .submit-order': function (event) {
            event.preventDefault();

            var name = event.target.name.value;
            var meal = event.target.meal.value;

            var order = findTodayOrderForGroup(this.group);
            if (order) {
                order.orders[name] = meal;
                Orders.update(order._id, {$set: {'orders': order.orders}});
            } else {
                var o = {};
                o[name] = meal;
                Orders.insert({data: today, group: this.group, orders_size: "-", orders: o});
            }
            Meteor.call("tryComplete", this.group);
        }
    });

    Template.order_food.helpers({
        orderDisabled: function() {
            return isOrderCompleted(this.group) ? "disabled" : "";
        }
    });

    Template.orders_list.helpers({
        orders: function() {
            var orders = findTodayOrderForGroup(this.group);
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

            console.log("DELETE " + event.target.id + " GG " + group);
            var orders = findTodayOrderForGroup(group);
            console.debug(orders);
            delete orders.orders[event.target.id];
            Orders.update({_id: orders._id}, {$set: {orders: orders.orders}});
        }
    });

    Template.order_guy.helpers({
        order_completed: function() {
            return isOrderCompleted(this.group);
        },

        order_caller: function() {
            var completed = Orders.findOne({data: today, group: this.group});
            return completed.caller;
        }
    });

};

Meteor.methods({
    setOrdersSize: function(group, newValue) {
        var today = currentDate();
        var orders = findTodayOrderForGroup(group);
        if (!orders) {
            Orders.insert({data: today, group: group, orders_size: newValue, orders: {}});
        } else {
            Orders.update({data: today, group: group}, {$set: {orders_size: newValue}});
        }
    },

    tryComplete: function(group) {
        var today = currentDate();
        var orders = findTodayOrderForGroup(group);

        if (isOrderCompleted(group)) {
            var people = Object.keys(orders.orders);
            var random = Math.floor((Math.random() * people.length));
            console.log("Randomly chosen " + random + " from " + people);
            var caller = people[random];
            Orders.update({data: today, group: group}, {$set: {caller: caller}});
            console.log("Randomized caller to be " + caller);
        }
    }
});
