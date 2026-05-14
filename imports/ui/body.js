// imports/ui/body.js
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import Sortable from 'sortablejs';
import { Tasks, CATEGORIES } from '../api/tasks.js';
import './body.html';

// ─── Template Reactive State ────────────────────────────────────────────────

Template.body.onCreated(function () {
  this.hideCompleted = new ReactiveVar(false);
  this.categoryFilter = new ReactiveVar('');
  this.errorMessage = new ReactiveVar('');
  this._sortable = null;

  // Subscribe to tasks
  this.autorun(() => {
    this.subscribe('tasks');
  });
});

// ─── SortableJS Initialization ───────────────────────────────────────────────

Template.body.onRendered(function () {
  const instance = this;

  // Re-initialize Sortable whenever tasks change (Blaze re-renders the list)
  this.autorun(() => {
    // Access reactive tasks to trigger re-run on data change
    Tasks.find({ userId: Meteor.userId() }).fetch();

    Meteor.defer(() => {
      const el = document.getElementById('task-list-sortable');
      if (!el) return;

      // Destroy existing instance before recreating
      if (instance._sortable) {
        instance._sortable.destroy();
      }

      instance._sortable = Sortable.create(el, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd(evt) {
          // Collect ordered IDs from DOM after drop
          const items = el.querySelectorAll('.task-item');
          const orderedIds = Array.from(items).map(item => item.dataset.id);

          Meteor.call('tasks.updateOrder', orderedIds, (err) => {
            if (err) {
              instance.errorMessage.set('Failed to save order. Please try again.');
              setTimeout(() => instance.errorMessage.set(''), 3000);
            }
          });
        },
      });
    });
  });
});

Template.body.onDestroyed(function () {
  if (this._sortable) {
    this._sortable.destroy();
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

Template.body.helpers({
  tasks() {
    const instance = Template.instance();
    const hideCompleted = instance.hideCompleted.get();
    const categoryFilter = instance.categoryFilter.get();

    const query = { userId: Meteor.userId() };
    if (hideCompleted) query.checked = { $ne: true };
    if (categoryFilter) query.category = categoryFilter;

    return Tasks.find(query, { sort: { order: 1 } });
  },

  incompleteCount() {
    return Tasks.find({ userId: Meteor.userId(), checked: { $ne: true } }).count();
  },

  hideCompleted() {
    return Template.instance().hideCompleted.get();
  },

  categories() {
    return CATEGORIES;
  },

  isSelectedCategory(cat) {
    return Template.instance().categoryFilter.get() === cat;
  },

  errorMessage() {
    return Template.instance().errorMessage.get();
  },

  isListEmpty() {
    const instance = Template.instance();
    const hideCompleted = instance.hideCompleted.get();
    const categoryFilter = instance.categoryFilter.get();
    const query = { userId: Meteor.userId() };
    if (hideCompleted) query.checked = { $ne: true };
    if (categoryFilter) query.category = categoryFilter;
    return Tasks.find(query).count() === 0;
  },
});

// ─── Events ──────────────────────────────────────────────────────────────────

Template.body.events({
  'click #add-task-btn'(event, instance) {
    const text = document.getElementById('task-text-input').value;
    const category = document.getElementById('task-category-select').value;

    if (!text.trim()) {
      instance.errorMessage.set('Task text cannot be empty.');
      setTimeout(() => instance.errorMessage.set(''), 3000);
      return;
    }

    Meteor.call('tasks.insert', text, category, (err) => {
      if (err) {
        instance.errorMessage.set(err.reason || 'Failed to add task.');
        setTimeout(() => instance.errorMessage.set(''), 3000);
      } else {
        document.getElementById('task-text-input').value = '';
      }
    });
  },

  'keydown #task-text-input'(event, instance) {
    if (event.key === 'Enter') {
      document.getElementById('add-task-btn').click();
    }
  },

  'change #hide-completed-toggle'(event, instance) {
    instance.hideCompleted.set(event.target.checked);
  },

  'change #category-filter'(event, instance) {
    instance.categoryFilter.set(event.target.value);
  },

  'click #logout-btn'() {
    Meteor.logout();
  },
});
