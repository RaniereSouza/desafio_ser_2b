import { Template }    from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './teste.html';

Template.Hello.onCreated(function helloOnCreated() {
    // counter starts at 0
    this.counter = new ReactiveVar(0);
});

Template.Hello.helpers({
    counter() {
        return Template.instance().counter.get();
    },
});

Template.Hello.events({
    'click button' (event, instance) {
        // increment the counter when button is clicked
        instance.counter.set(instance.counter.get() + 1);
    },
});