// imports/api/tasks.js
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

// Valid categories — single source of truth
export const CATEGORIES = ['Work', 'Personal', 'Urgent'];

if (Meteor.isServer) {
  // Publication — only the logged-in user's own tasks, sorted by order ascending
  Meteor.publish('tasks', function tasksPublication() {
    if (!this.userId) {
      return this.ready(); // Return nothing for unauthenticated users
    }
    return Tasks.find(
      { userId: this.userId },
      { sort: { order: 1 } }
    );
  });
}

Meteor.methods({
  /**
   * Insert a new task.
   * Assigns order = (max existing order + 1) so new tasks go to the bottom.
   */
  async 'tasks.insert'(text, category) {
    check(text, String);
    check(category, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to add tasks.');
    }
    if (text.trim().length === 0) {
      throw new Meteor.Error('invalid-text', 'Task text cannot be empty.');
    }
    if (!CATEGORIES.includes(category)) {
      throw new Meteor.Error('invalid-category', `Category must be one of: ${CATEGORIES.join(', ')}.`);
    }

    // Find the current maximum order value for this user
    const lastTask = await Tasks.findOneAsync(
      { userId: this.userId },
      { sort: { order: -1 }, fields: { order: 1 } }
    );
    const newOrder = lastTask ? lastTask.order + 1 : 0;

    const user = await Meteor.users.findOneAsync(this.userId);

    await Tasks.insertAsync({
      text: text.trim(),
      category,
      order: newOrder,
      checked: false,
      createdAt: new Date(),
      userId: this.userId,
      username: user.username,
    });
  },

  /**
   * Delete a task. Only the owner can delete.
   */
  async 'tasks.remove'(taskId) {
    check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in.');
    }
    const task = await Tasks.findOneAsync(taskId);
    if (!task || task.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You do not own this task.');
    }

    await Tasks.removeAsync(taskId);
  },

  /**
   * Toggle a task's checked (completion) status.
   */
  async 'tasks.setChecked'(taskId, setChecked) {
    check(taskId, String);
    check(setChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in.');
    }
    const task = await Tasks.findOneAsync(taskId);
    if (!task || task.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You do not own this task.');
    }

    await Tasks.updateAsync(taskId, { $set: { checked: setChecked } });
  },

  /**
   * Update the order of a task after drag-and-drop.
   * Receives the full ordered array of task IDs and updates each task's order field.
   */
  async 'tasks.updateOrder'(orderedIds) {
    check(orderedIds, [String]);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in.');
    }

    for (let index = 0; index < orderedIds.length; index++) {
      const id = orderedIds[index];
      const task = await Tasks.findOneAsync(id);
      if (task && task.userId === this.userId) {
        await Tasks.updateAsync(id, { $set: { order: index } });
      }
    }
  },

  /**
   * Update a task's category after creation.
   */
  async 'tasks.updateCategory'(taskId, category) {
    check(taskId, String);
    check(category, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in.');
    }
    if (!CATEGORIES.includes(category)) {
      throw new Meteor.Error('invalid-category', `Category must be one of: ${CATEGORIES.join(', ')}.`);
    }
    const task = await Tasks.findOneAsync(taskId);
    if (!task || task.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You do not own this task.');
    }

    await Tasks.updateAsync(taskId, { $set: { category } });
  },
});
