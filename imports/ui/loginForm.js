// imports/ui/loginForm.js
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';
import './loginForm.html';

Template.loginForm.onCreated(function () {
  this.errorMsg = new ReactiveVar('');
});

Template.loginForm.helpers({
  errorMsg() {
    return Template.instance().errorMsg.get();
  },
});

Template.loginForm.events({
  'click #login-btn'(event, instance) {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!username || !password) {
      instance.errorMsg.set('Please enter both username and password.');
      return;
    }

    Meteor.loginWithPassword(username, password, (err) => {
      if (err) {
        instance.errorMsg.set(err.reason || 'Login failed. Check your credentials.');
      }
    });
  },

  'click #signup-btn'(event, instance) {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!username || !password) {
      instance.errorMsg.set('Please enter both username and password.');
      return;
    }
    if (password.length < 6) {
      instance.errorMsg.set('Password must be at least 6 characters.');
      return;
    }

    Accounts.createUser({ username, password }, (err) => {
      if (err) {
        instance.errorMsg.set(err.reason || 'Sign up failed. Username may already be taken.');
      }
    });
  },

  'keydown #auth-password'(event) {
    if (event.key === 'Enter') {
      document.getElementById('login-btn').click();
    }
  },
});
