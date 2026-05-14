# Meteorflow-todos

> **Note:** This project was developed as part of a company technical assessment to evaluate proficiency in modern real-time full-stack development using Meteor.js.

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

## Demo & Images

*(Replace the placeholders below with actual screenshots and demo links)*

### Live Demo
[Live Demo Link](https://your-deployment-url.com)

### Application Screenshots

**Login Screen:**
![Login Screen](placeholder-login.png)

**Main Task Board:**
![Task Board](placeholder-tasks.png)

## Tech Stack

Meteor.js · Blaze · MongoDB · SortableJS · accounts-password

## Architecture

- All DB writes go through validated Meteor Methods (no insecure client writes)
- Publications filter strictly by `userId` — users never see each other's tasks
- Drag-and-drop order is persisted to MongoDB via `tasks.updateOrder` method
- `autopublish` and `insecure` packages are removed

## CI/CD & Deployment

This project includes configuration for modern deployment pipelines:
- **Docker**: A multi-stage `Dockerfile` is included to easily containerize the Meteor 3 application and run it as a standard Node.js server.
- **GitHub Actions**: A `.github/workflows/ci.yml` is set up to automatically install dependencies and test the build process on pushes and pull requests.
## Categories

| Category | Color |
|----------|-------|
| Work | Blue `#3498db` |
| Personal | Green `#2ecc71` |
| Urgent | Red `#e74c3c` |
