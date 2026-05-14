# Meteorflow Todos

![Meteor](https://img.shields.io/badge/Meteor-3.0-D74C4F?style=for-the-badge&logo=meteor&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D14-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

> **Note:** This project was developed as part of a technical assessment for MergerWare to evaluate proficiency in modern, real-time full-stack development using Meteor.js.

Built by: M HARISH GAUTHAM, 22MIS0421, harivelgm76@gmail.com, 7889289504

Meteorflow Todos is a reactive, real-time task management application built with Meteor.js and Blaze.

## 🚀 Features

- **User Authentication:** Secure login and registration.
- **Task Categories:** Organize tasks by distinct categories.
- **Drag-and-Drop Reordering:** Intuitive interface for prioritizing tasks.
- **Real-Time Synchronization:** Seamless, instant updates across multiple clients.

## 🛠️ Tech Stack

- **Framework:** ![Meteor.js](https://img.shields.io/badge/Meteor.js-D74C4F?style=flat&logo=meteor&logoColor=white) (v3.0)
- **Templating:** ![Blaze](https://img.shields.io/badge/Blaze-FF6C37?style=flat&logo=meteor&logoColor=white) 
- **Database:** ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
- **Libraries:** ![SortableJS](https://img.shields.io/badge/SortableJS-v1.15.7-blue?style=flat), `accounts-password`

## 🏗️ Architecture & Security

- **Secure Data Mutations:** All database write operations are handled exclusively through validated Meteor Methods (the `insecure` package is removed).
- **Data Privacy:** Publications strictly filter by `userId`, ensuring users only have access to their own tasks (the `autopublish` package is removed).
- **Persistent Ordering:** Drag-and-drop actions persist state to MongoDB via the `tasks.updateOrder` method.

## ⚙️ Setup & Installation

**Prerequisites:** 
- Node.js ≥ 14
- Meteor (install via `npm install -g meteor`)

```bash
# Clone the repository
git clone https://github.com/harishy0406/meteorflow-todos

# Navigate to the project directory
cd meteorflow-todos

# Install dependencies
meteor npm install

# Start the application
meteor run
```

Visit the application at: **http://localhost:3000**

## 📸 Application Screenshots

### Login Screen
<img width="925" height="426" alt="Login Screen Screenshot" src="https://github.com/user-attachments/assets/5cdabe1d-44c5-4a8e-9d46-1bc89917ad7c" />

### Main Task Board
<img width="1909" height="576" alt="Main Task Board Screenshot 1" src="https://github.com/user-attachments/assets/aa09b6af-80c2-426f-8b9a-d54e4e3dd544" />
<img width="985" height="505" alt="Main Task Board Screenshot 2" src="https://github.com/user-attachments/assets/5902a305-6753-477e-bf57-e5e38e25c7a7" />
<img width="1228" height="634" alt="Main Task Board Screenshot 3" src="https://github.com/user-attachments/assets/d2a4611e-58d8-40e0-9e80-7c90daf9362f" />

## 🏷️ Categories

| Category | Color Indicator | Hex Code |
|----------|-----------------|----------|
| **Work** | Blue            | `#3498db` |
| **Personal** | Green       | `#2ecc71` |
| **Urgent** | Red           | `#e74c3c` |

## 📦 CI/CD & Deployment

This project includes configuration for modern deployment pipelines:
- **Docker:** A multi-stage `Dockerfile` is included to containerize the Meteor 3 application and run it as a standard Node.js server.
- **GitHub Actions:** A Continuous Integration pipeline (`.github/workflows/ci.yml`) is configured to automatically install dependencies and validate the build process on pushes and pull requests.
---

<div align="center">

**Made with ❤️ by M Harish Gautham**

⭐ If you find this project helpful, please star it! ⭐

[Website](https://github.com/harishy0406/PruneVision-AI) • [Docs](https://github.com/harishy0406/PruneVision-AI) • [GitHub](https://github.com/harishy0406/PruneVision-AI)

</div>
