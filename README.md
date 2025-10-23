# NEXTUP.

### A Full-Stack Kanban Productivity App

> After a brutal, caffeine-fueled journey through the nine circles of debugging hell, solely because I am dumb, this project emerged. It's a testament to perseverance and a deep dive into what it takes to build a modern web application from the ground up. 
---

## Live Application

The application is deployed and fully operational. No local setup is required.

**Access the live application here:**
**[https://to-do-list-app-pi-liart.vercel.app/login](https://to-do-list-app-pi-liart.vercel.app/login)** 



---

##  The Vision & Core Features

The goal was to build a clean, intuitive task manager that merges the flexibility of a note-taking app with the structured power of a Kanban board.

*   **Full-Stack Architecture:** A robust backend powered by **Python & Flask** serves a dynamic, responsive frontend built with **React**.
*   **Secure User Authentication:** Full user account creation and login functionality using **JWT tokens** for secure, stateless sessions. Your tasks belong to you and you alone.
*   **Multi-Page Experience:** A clean, multi-layered UI managed by **React Router**, logically separating your "inbox" of quick tasks from your structured, named "folders."
*   **Interactive Kanban Boards:** The core of the app. A dynamic drag-and-drop interface powered by **dnd-kit** allows you to intuitively change a task's status between `TO DO`, `ONGOING`, and `DONE`.
*   **Intelligent Organization:**
    *   **Priority System:** Assign one of four priority levels (Urgent, High, Medium, Low) to each task.
    *   **Automatic Sorting:** Tasks within each Kanban column automatically sort themselves by priority, ensuring the most critical items always float to the top.
    *   **Categories:** Assign a category to each task for quick visual identification.
*   **Glassmorphism UI:** A modern, minimal "glass-like" aesthetic built with **Tailwind CSS**, designed to be clean, professional, and easy on the eyes.

---

## The Deployment Architecture

This project is deployed using a modern, decoupled, continuous deployment workflow.

### **Frontend: Vercel**

*   The **React** single-page application is hosted on **Vercel**.
*   Vercel is connected directly to the `main` branch of this GitHub repository.
*   Every `git push` to the `main` branch automatically triggers a new, instantaneous deployment of the frontend, ensuring the live app is always up-to-date.

### **Backend: Render**

*   The **Flask API** and its **SQLite database** are hosted on **Render**.
*   Render is also connected to the `main` branch and automatically redeploys the backend server on every push.
*   This decoupled architecture is robust and scalable: the "face" of the application (Vercel) and the "brain" (Render) are completely independent, communicating only through a secure REST API.

---


