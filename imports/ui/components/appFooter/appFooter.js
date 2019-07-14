import { Template } from 'meteor/templating';

import moment from 'moment';

import './appFooter.html';

Template.AppFooter.helpers({
    year: () => moment().format('YYYY')
});