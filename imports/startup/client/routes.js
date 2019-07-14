import { Router } from 'meteor/iron:router';

import '../../ui/layouts/appLayout.js';
import '../../ui/views/home/home.js';
import '../../ui/views/teste/teste.js';

Router.configure({
    layoutTemplate: 'AppLayout'
});

Router.route('/', {
    name:       'comics.home',
    template:   'Home',
    action:     function () {
                    this.render();
                },
});

Router.route('/testando-1-2-3', {
    name:       'dummy.test',
    template:   'Teste',
    action:     function () {
                    this.render();
                },
});