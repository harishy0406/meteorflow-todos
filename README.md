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

<img width="925" height="426" alt="image" src="https://github.com/user-attachments/assets/5cdabe1d-44c5-4a8e-9d46-1bc89917ad7c" />


**Main Task Board:**
<img width="1909" height="576" alt="image" src="https://github.com/user-attachments/assets/aa09b6af-80c2-426f-8b9a-d54e4e3dd544" />
<img width="985" height="505" alt="image" src="https://github.com/user-attachments/assets/5902a305-6753-477e-bf57-e5e38e25c7a7" />
<img width="1228" height="634" alt="image" src="https://github.com/user-attachments/assets/d2a4611e-58d8-40e0-9e80-7c90daf9362f" />


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
