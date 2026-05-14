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
