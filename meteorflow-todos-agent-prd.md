# AGENT BUILD INSTRUCTIONS — Meteorflow-todos v1.0.0

> **Read this entire document before writing a single line of code.**
> Follow every section in order. Do not skip, summarize, or deviate unless a section explicitly marks something as optional.

---

## 0. AGENT OPERATING RULES

1. Execute one phase at a time. Complete and verify each phase before starting the next.
2. After every file creation or edit, re-read the file to confirm it was written correctly.
3. Never use `autopublish` or `insecure` packages. Remove them immediately after scaffolding.
4. Never write client-side `Tasks.insert()`, `Tasks.update()`, or `Tasks.remove()` calls. All DB writes go through Meteor Methods only.
5. Run `meteor run` and confirm zero console errors before marking any phase complete.
6. If an error occurs, read the full stack trace, fix the root cause, do not mask it.

---

## 1. ENVIRONMENT SETUP

### 1.1 Prerequisites (verify these exist before proceeding)

```bash
node --version        # Must be >= 14.x
meteor --version      # Must be >= 2.x (install: npm install -g meteor)
git --version
```

### 1.2 Scaffold the project

```bash
meteor create meteorflow-todos --blaze
cd meteorflow-todos
git init
git add -A
git commit -m "chore: initial meteor scaffold"
```

### 1.3 Remove insecure packages (MANDATORY — do this immediately)

```bash
meteor remove autopublish insecure
```

Confirm removal:

```bash
meteor list | grep -E "autopublish|insecure"
# Output must be empty. If not, remove again.
```

### 1.4 Add required packages

```bash
meteor add accounts-password
meteor add check
meteor add reactive-var
meteor npm install --save sortablejs
```

### 1.5 Final directory structure to create

Create every file listed below. Do not create any file not in this list unless required by Meteor internals.

```
meteorflow-todos/
├── client/
│   ├── main.html
│   ├── main.js
│   └── main.css
├── server/
│   └── main.js
├── imports/
│   ├── api/
│   │   └── tasks.js
│   └── ui/
│       ├── body.html
│       ├── body.js
│       ├── task.html
│       ├── task.js
│       ├── loginForm.html
│       └── loginForm.js
├── public/
│   └── (empty — no favicon needed)
├── .gitignore
└── README.md
```

---

## 2. DATA LAYER — `imports/api/tasks.js`

This file defines the collection, all Meteor Methods, and is imported by both client and server.

### 2.1 Full file content

```javascript
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
  'tasks.insert'(text, category) {
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
    const lastTask = Tasks.findOne(
      { userId: this.userId },
      { sort: { order: -1 }, fields: { order: 1 } }
    );
    const newOrder = lastTask ? lastTask.order + 1 : 0;

    Tasks.insert({
      text: text.trim(),
      category,
      order: newOrder,
      checked: false,
      createdAt: new Date(),
      userId: this.userId,
      username: Meteor.users.findOne(this.userId).username,
    });
  },

  /**
   * Delete a task. Only the owner can delete.
   */
  'tasks.remove'(taskId) {
    check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in.');
    }
    const task = Tasks.findOne(taskId);
    if (!task || task.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You do not own this task.');
    }

    Tasks.remove(taskId);
  },

  /**
   * Toggle a task's checked (completion) status.
   */
  'tasks.setChecked'(taskId, setChecked) {
    check(taskId, String);
    check(setChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in.');
    }
    const task = Tasks.findOne(taskId);
    if (!task || task.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You do not own this task.');
    }

    Tasks.update(taskId, { $set: { checked: setChecked } });
  },

  /**
   * Update the order of a task after drag-and-drop.
   * Receives the full ordered array of task IDs and updates each task's order field.
   */
  'tasks.updateOrder'(orderedIds) {
    check(orderedIds, [String]);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in.');
    }

    orderedIds.forEach((id, index) => {
      const task = Tasks.findOne(id);
      if (task && task.userId === this.userId) {
        Tasks.update(id, { $set: { order: index } });
      }
    });
  },

  /**
   * Update a task's category after creation.
   */
  'tasks.updateCategory'(taskId, category) {
    check(taskId, String);
    check(category, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in.');
    }
    if (!CATEGORIES.includes(category)) {
      throw new Meteor.Error('invalid-category', `Category must be one of: ${CATEGORIES.join(', ')}.`);
    }
    const task = Tasks.findOne(taskId);
    if (!task || task.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'You do not own this task.');
    }

    Tasks.update(taskId, { $set: { category } });
  },
});
```

---

## 3. SERVER ENTRY — `server/main.js`

```javascript
// server/main.js
import '../imports/api/tasks.js';
```

Nothing else goes here. All server logic lives in the API module.

---

## 4. CLIENT ENTRY — `client/main.js`

```javascript
// client/main.js
import '../imports/api/tasks.js';
import '../imports/ui/body.js';
import '../imports/ui/task.js';
import '../imports/ui/loginForm.js';
```

---

## 5. ROOT TEMPLATE — `client/main.html`

```html
<!-- client/main.html -->
<head>
  <title>Meteorflow-todos</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>

<body>
  {{> body}}
</body>
```

---

## 6. BODY TEMPLATE — `imports/ui/body.html`

```html
<!-- imports/ui/body.html -->
<template name="body">
  <div class="app-wrapper">
    <header class="app-header">
      <div class="header-left">
        <span class="app-logo">🚀</span>
        <h1 class="app-title">Meteorflow-todos</h1>
      </div>
      <div class="header-right">
        {{#if currentUser}}
          <span class="username-display">{{currentUser.username}}</span>
          <button class="btn btn-logout" id="logout-btn">Logout</button>
        {{/if}}
      </div>
    </header>

    <main class="app-main">
      {{#if currentUser}}
        <section class="todo-section">

          <!-- Task count -->
          <div class="task-header">
            <h2 class="task-count-label">
              Todo List
              <span class="task-count-badge">{{incompleteCount}}</span>
            </h2>
          </div>

          <!-- Controls row -->
          <div class="controls-row">
            <label class="hide-completed-label">
              <input type="checkbox" id="hide-completed-toggle" {{#if hideCompleted}}checked{{/if}} />
              Hide Completed
            </label>

            <select id="category-filter" class="filter-select">
              <option value="">All Categories</option>
              {{#each categories}}
                <option value="{{this}}" {{#if isSelectedCategory this}}selected{{/if}}>{{this}}</option>
              {{/each}}
            </select>
          </div>

          <!-- New task form -->
          <div class="new-task-form">
            <input
              type="text"
              id="task-text-input"
              class="task-input"
              placeholder="Type a new task..."
              maxlength="200"
            />
            <select id="task-category-select" class="category-select">
              {{#each categories}}
                <option value="{{this}}">{{this}}</option>
              {{/each}}
            </select>
            <button class="btn btn-add" id="add-task-btn">Add Task</button>
          </div>

          <!-- Error message display -->
          {{#if errorMessage}}
            <div class="error-toast">{{errorMessage}}</div>
          {{/if}}

          <!-- Task list -->
          <ul class="task-list" id="task-list-sortable">
            {{#each tasks}}
              {{> task}}
            {{/each}}
          </ul>

          {{#if isListEmpty}}
            <div class="empty-state">
              <p>No tasks yet. Add one above!</p>
            </div>
          {{/if}}

        </section>
      {{else}}
        {{> loginForm}}
      {{/if}}
    </main>
  </div>
</template>
```

---

## 7. BODY LOGIC — `imports/ui/body.js`

```javascript
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
```

---

## 8. TASK TEMPLATE — `imports/ui/task.html`

```html
<!-- imports/ui/task.html -->
<template name="task">
  <li class="task-item {{#if checked}}task-completed{{/if}}" data-id="{{_id}}">

    <!-- Drag handle -->
    <span class="drag-handle" title="Drag to reorder">⋮⋮</span>

    <!-- Checkbox -->
    <input
      type="checkbox"
      class="task-checkbox"
      {{#if checked}}checked{{/if}}
    />

    <!-- Category badge -->
    <span class="category-badge category-{{categoryLower}}">{{category}}</span>

    <!-- Task text -->
    <span class="task-text">{{text}}</span>

    <!-- Delete button -->
    <button class="btn-delete" title="Delete task">✕</button>
  </li>
</template>
```

---

## 9. TASK LOGIC — `imports/ui/task.js`

```javascript
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
```

---

## 10. LOGIN FORM — `imports/ui/loginForm.html`

```html
<!-- imports/ui/loginForm.html -->
<template name="loginForm">
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-logo">🚀</div>
      <h2 class="auth-title">Meteorflow-todos</h2>
      <p class="auth-subtitle">Sign in or create an account to continue.</p>

      {{#if errorMsg}}
        <div class="auth-error">{{errorMsg}}</div>
      {{/if}}

      <div class="auth-fields">
        <input type="text" id="auth-username" class="auth-input" placeholder="Username" autocomplete="username" />
        <input type="password" id="auth-password" class="auth-input" placeholder="Password" autocomplete="current-password" />
      </div>

      <div class="auth-buttons">
        <button class="btn btn-login" id="login-btn">Log In</button>
        <button class="btn btn-signup" id="signup-btn">Sign Up</button>
      </div>
    </div>
  </div>
</template>
```

---

## 11. LOGIN LOGIC — `imports/ui/loginForm.js`

```javascript
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
```

---

## 12. STYLESHEET — `client/main.css`

Replace the entire file content with the following. Do not add vendor prefixes manually; they are included where needed.

```css
/* client/main.css */

/* ── Reset & Base ────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --color-primary:    #2c3e50;
  --color-accent:     #3498db;
  --color-bg:         #f5f7fa;
  --color-surface:    #ffffff;
  --color-border:     #e2e8f0;
  --color-text:       #2d3748;
  --color-text-muted: #718096;
  --color-work:       #3498db;
  --color-personal:   #2ecc71;
  --color-urgent:     #e74c3c;
  --color-error:      #e74c3c;
  --radius:           8px;
  --shadow:           0 2px 8px rgba(0,0,0,0.08);
  --transition:       150ms ease;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
  font-size: 15px;
  line-height: 1.5;
}

/* ── Layout ──────────────────────────────────────────────────────── */
.app-wrapper { display: flex; flex-direction: column; min-height: 100vh; }

.app-header {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--color-primary);
  color: #fff;
  padding: 0 24px;
  height: 60px;
  position: sticky; top: 0; z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
}

.header-left  { display: flex; align-items: center; gap: 10px; }
.header-right { display: flex; align-items: center; gap: 12px; }

.app-logo { font-size: 22px; }
.app-title { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }

.username-display {
  font-size: 13px; color: rgba(255,255,255,0.75);
  background: rgba(255,255,255,0.1);
  padding: 4px 10px; border-radius: 20px;
}

.app-main { flex: 1; max-width: 720px; margin: 0 auto; width: 100%; padding: 32px 16px; }

/* ── Buttons ─────────────────────────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 8px 18px; border: none; border-radius: var(--radius);
  font-family: inherit; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: opacity var(--transition), transform var(--transition);
}
.btn:hover  { opacity: 0.88; }
.btn:active { transform: scale(0.97); }

.btn-logout { background: rgba(255,255,255,0.15); color: #fff; font-size: 13px; padding: 6px 14px; }
.btn-add    { background: var(--color-accent); color: #fff; white-space: nowrap; }
.btn-login  { background: var(--color-accent); color: #fff; flex: 1; }
.btn-signup { background: transparent; color: var(--color-accent);
              border: 2px solid var(--color-accent); flex: 1; }

/* ── Todo Section ────────────────────────────────────────────────── */
.task-header { margin-bottom: 16px; }

.task-count-label {
  font-size: 22px; font-weight: 700; color: var(--color-primary);
  display: flex; align-items: center; gap: 10px;
}

.task-count-badge {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--color-accent); color: #fff;
  font-size: 13px; font-weight: 700;
  min-width: 26px; height: 26px; border-radius: 13px; padding: 0 6px;
}

/* ── Controls ────────────────────────────────────────────────────── */
.controls-row {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: 16px; flex-wrap: wrap;
}

.hide-completed-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 14px; color: var(--color-text-muted); cursor: pointer;
  user-select: none;
}
.hide-completed-label input[type="checkbox"] { cursor: pointer; accent-color: var(--color-accent); }

.filter-select {
  border: 1px solid var(--color-border); border-radius: var(--radius);
  padding: 6px 10px; font-family: inherit; font-size: 14px;
  color: var(--color-text); background: var(--color-surface);
  cursor: pointer;
}
.filter-select:focus { outline: 2px solid var(--color-accent); outline-offset: 1px; }

/* ── New Task Form ───────────────────────────────────────────────── */
.new-task-form {
  display: flex; gap: 8px; margin-bottom: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px;
  box-shadow: var(--shadow);
  flex-wrap: wrap;
}

.task-input {
  flex: 1; min-width: 160px;
  border: 1px solid var(--color-border); border-radius: var(--radius);
  padding: 8px 12px; font-family: inherit; font-size: 14px;
}
.task-input:focus { outline: 2px solid var(--color-accent); outline-offset: 1px; border-color: transparent; }

.category-select {
  border: 1px solid var(--color-border); border-radius: var(--radius);
  padding: 8px 10px; font-family: inherit; font-size: 14px;
  background: var(--color-surface); cursor: pointer;
}

/* ── Error Toast ─────────────────────────────────────────────────── */
.error-toast {
  background: #fff5f5; border: 1px solid #fed7d7; color: var(--color-error);
  border-radius: var(--radius); padding: 10px 14px;
  margin-bottom: 12px; font-size: 14px;
}

/* ── Task List ───────────────────────────────────────────────────── */
.task-list {
  list-style: none;
  display: flex; flex-direction: column; gap: 8px;
}

/* ── Task Item ───────────────────────────────────────────────────── */
.task-item {
  display: flex; align-items: center; gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px 14px;
  box-shadow: var(--shadow);
  transition: box-shadow var(--transition);
}
.task-item:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.10); }

/* Drag handle */
.drag-handle {
  color: var(--color-text-muted); font-size: 16px;
  cursor: grab; padding: 0 2px; letter-spacing: -2px;
  user-select: none; flex-shrink: 0;
}
.drag-handle:active { cursor: grabbing; }

/* Checkbox */
.task-checkbox {
  flex-shrink: 0; width: 18px; height: 18px;
  cursor: pointer; accent-color: var(--color-accent);
}

/* Category badges */
.category-badge {
  flex-shrink: 0;
  display: inline-block; padding: 2px 9px;
  border-radius: 12px; font-size: 12px; font-weight: 600;
  color: #fff; text-transform: uppercase; letter-spacing: 0.4px;
}
.category-work     { background: var(--color-work); }
.category-personal { background: var(--color-personal); }
.category-urgent   { background: var(--color-urgent); }

/* Task text */
.task-text {
  flex: 1; font-size: 15px; color: var(--color-text);
  word-break: break-word;
}

/* Completed state */
.task-completed .task-text {
  text-decoration: line-through;
  color: var(--color-text-muted);
}
.task-completed { opacity: 0.7; }

/* Delete button */
.btn-delete {
  flex-shrink: 0;
  background: none; border: none;
  color: var(--color-text-muted); font-size: 14px;
  cursor: pointer; padding: 4px 6px; border-radius: 4px;
  transition: color var(--transition), background var(--transition);
  line-height: 1;
}
.btn-delete:hover { color: var(--color-error); background: #fff5f5; }

/* ── Drag States ─────────────────────────────────────────────────── */
.sortable-ghost {
  opacity: 0.4;
  background: #ebf4ff;
  border: 2px dashed var(--color-accent);
}
.sortable-drag {
  opacity: 1;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

/* ── Empty State ─────────────────────────────────────────────────── */
.empty-state {
  text-align: center; padding: 48px 0;
  color: var(--color-text-muted); font-size: 15px;
}

/* ── Auth Page ───────────────────────────────────────────────────── */
.auth-container {
  display: flex; align-items: center; justify-content: center;
  min-height: calc(100vh - 60px); padding: 24px;
}

.auth-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 40px 36px;
  width: 100%; max-width: 400px;
  text-align: center;
}

.auth-logo    { font-size: 40px; margin-bottom: 12px; }
.auth-title   { font-size: 24px; font-weight: 700; color: var(--color-primary); margin-bottom: 6px; }
.auth-subtitle{ font-size: 14px; color: var(--color-text-muted); margin-bottom: 24px; }

.auth-error {
  background: #fff5f5; border: 1px solid #fed7d7; color: var(--color-error);
  border-radius: var(--radius); padding: 10px 14px;
  margin-bottom: 16px; font-size: 14px; text-align: left;
}

.auth-fields  { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }

.auth-input {
  width: 100%; border: 1px solid var(--color-border);
  border-radius: var(--radius); padding: 10px 14px;
  font-family: inherit; font-size: 15px;
}
.auth-input:focus { outline: 2px solid var(--color-accent); outline-offset: 1px; border-color: transparent; }

.auth-buttons { display: flex; gap: 10px; }

/* ── Responsive ──────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .app-header { padding: 0 14px; }
  .app-title  { font-size: 16px; }
  .new-task-form { padding: 10px; }
  .task-item { padding: 10px; }
  .auth-card { padding: 28px 20px; }
}
```

---

## 13. `.gitignore`

```
.meteor/local
node_modules/
*.DS_Store
```

---

## 14. `README.md`

```markdown
# Meteorflow-todos

A reactive, real-time todo application built with Meteor.js + Blaze.

**Features:** User auth · Task categories · Drag-and-drop reordering · Real-time sync

## Setup

**Requirements:** Node.js ≥ 14, Meteor (install: `npm install -g meteor`)

```bash
git clone <repo-url>
cd meteorflow-todos
meteor npm install
meteor run
```

Visit **http://localhost:3000**

## Tech Stack

Meteor.js · Blaze · MongoDB · SortableJS · accounts-password

## Architecture

- All DB writes go through validated Meteor Methods (no insecure client writes)
- Publications filter strictly by `userId` — users never see each other's tasks
- Drag-and-drop order is persisted to MongoDB via `tasks.updateOrder` method
- `autopublish` and `insecure` packages are removed

## Categories

| Category | Color |
|----------|-------|
| Work | Blue `#3498db` |
| Personal | Green `#2ecc71` |
| Urgent | Red `#e74c3c` |
```

---

## 15. VERIFICATION CHECKLIST

Run through every item below after completing all phases. Mark each ✅ only after manually testing in the browser.

### Auth
- [ ] A new user can register with username + password
- [ ] The same user can log in after logging out
- [ ] Wrong password shows a readable error message
- [ ] Logged-out user sees only the login form, not tasks

### Task CRUD
- [ ] Adding a task with text and category works
- [ ] Submitting an empty task shows an error and does NOT create a task
- [ ] A task's category badge appears with the correct color
- [ ] Checking a task marks it complete (strikethrough)
- [ ] Deleting a task removes it immediately

### Filters
- [ ] "Hide Completed" checkbox hides checked tasks
- [ ] Unchecking "Hide Completed" brings them back
- [ ] Category dropdown filters to only that category
- [ ] Selecting "All Categories" shows everything again

### Drag-and-Drop
- [ ] Dragging a task to a new position updates the visual order immediately
- [ ] After reloading the page, the new order is preserved
- [ ] Ghost element appears during drag
- [ ] No console errors during drag

### Security
- [ ] Run `meteor list` — confirm `autopublish` and `insecure` are absent
- [ ] Open browser console — zero errors on any user action
- [ ] Create User A and User B in separate browser tabs — confirm each sees only their own tasks

---

## 16. COMMON ERRORS & FIXES

| Error | Cause | Fix |
|---|---|---|
| `Tasks.insert is not a function` on client | Calling collection directly | Use `Meteor.call('tasks.insert', ...)` |
| `Publication 'tasks' returned no results` | Not logged in when subscribing | Wrap subscribe in `if (Meteor.userId())` or use `autorun` |
| SortableJS dragging jumps on re-render | Sortable not destroyed before recreating | Destroy in `autorun` before `Sortable.create` |
| `check` package not found | Forgot to `meteor add check` | `meteor add check` |
| Order not persisting | `updateOrder` not receiving correct IDs | Log `orderedIds` before the method call to verify |
| Blank page after login | Missing import in `client/main.js` | Confirm all four imports are present |

---

*End of Agent PRD — Meteorflow-todos v1.0.0*
