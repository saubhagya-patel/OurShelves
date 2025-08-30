# Book Notes App

A full-stack, multi-user web application designed for book lovers to track, review, and discover literature. This project features a secure, scalable Node.js REST API backend and a modern, responsive React single-page application (SPA) frontend.

**Developer:** Saubhagya Patel
**Contact:** [patelsaubhagya0144@gmail.com](mailto:patelsaubhagya0144@gmail.com)
**Project Dates:** Jan 2024 - Aug 2025

---

### **Tech Stack**

**Backend:**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL
* **Authentication:** JSON Web Tokens (JWT) & Bcrypt.js
* **API Client:** Axios

**Frontend:**
* **Library:** React.js (bootstrapped with Vite)
* **Styling:** Tailwind CSS
* **Routing:** React Router
* **API Client:** Axios

**External Services:**
* [Open Library API](https://openlibrary.org/developers/api) for book data.

---

### **Core Features**

* **Secure Authentication:** Users can register and log in via a JWT-based system, with tokens expiring after one day for enhanced security.
* **Personalized Reviews:** Each user can write and update a single, personal review (rating and summary) for any book in the library.
* **Community-Driven Library:** Logged-in users can search the Open Library API to discover new books and add them to the application's shared database for all users to review.
* **Modern User Experience:** A fast, dark-themed, and fully responsive interface ensures a seamless experience across desktops, tablets, and mobile devices.

---

### **Getting Started**

**Prerequisites:**
* Node.js and npm installed
* A running PostgreSQL server

**1. Backend Setup:**
```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Create and configure a .env file with your database credentials and a JWT_SECRET

# Initialize the database schema
psql -U your_username -d your_database -f db/db_init.sql

# Start the API server
npm run dev
````

**2. Frontend Setup:**

```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the React development server
npm run dev
```
