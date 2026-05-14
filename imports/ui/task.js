// imports/ui/task.js
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import './task.html';

Template.task.helpers({
  categoryLower() {
    // Used for CSS class: category-work, category-personal, category-urgent
    return this.category ? this.category.toLowerCase() : '';
  },
});

Template.task.events({
  'change .task-checkbox'(event) {
    Meteor.call('tasks.setChecked', this._id, event.target.checked, (err) => {
      if (err) console.error('setChecked error:', err);
    });
  },

  'click .btn-delete'() {
    // Simple confirmation before delete
    if (window.confirm('Delete this task?')) {
      Meteor.call('tasks.remove', this._id, (err) => {
        if (err) console.error('remove error:', err);
      });
    }
  },
});
