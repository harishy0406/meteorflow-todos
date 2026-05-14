import { Meteor } from 'meteor/meteor';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import '../imports/api/tasks.js';
import '../imports/ui/body.js';
import '../imports/ui/task.js';
import '../imports/ui/loginForm.js';

Meteor.startup(() => {
  Blaze.render(Template.appBody, document.body);
});
