# 📊 Excellytics

**Excellytics** is a powerful full-stack web application for uploading, analyzing, and visualizing Excel files. Users can generate interactive **2D and 3D charts** (Bar, Pie, Line, and 3D Bar graphs), track upload history, and manage data seamlessly — all through a responsive, intuitive interface. Admins enjoy a dedicated dashboard for managing users and monitoring data usage.

---

## 🚀 Features

* 🔐 **User Authentication** – Secure sign up, login, and password reset using JWT.
* 📁 **Excel File Uploads** – Upload `.xls` or `.xlsx` files for instant analysis.
* 📊 **Chart Generation** – Create **Bar**, **Pie**, **Line**, and **3D Bar** graphs using Chart.js & Plotly.js.
* 📥 **Download Insights** – Download processed Excel data and chart images.
* 🕒 **Upload History** – View and manage your uploads and data usage statistics.
* 🧑‍💼 **Admin Dashboard** – Manage users, track uploads, and monitor storage.
* 📱 **Responsive UI** – Optimized for both desktop and mobile screens.

---

## 🛠️ Tech Stack

### 🖼️ Frontend

* ⚛️ **React** – Component-based UI development.
* 🧠 **Redux Toolkit** – Predictable and efficient state management.
* 🎨 **Tailwind CSS** – Utility-first CSS framework for rapid styling.
* 📊 **Chart.js & Plotly.js** – Visualization libraries for 2D and 3D graphs.
* ⚡ **Vite** – Lightning-fast frontend build tool and dev server.

### 🔧 Backend

* 🟢 **Node.js** – JavaScript runtime for scalable backend operations.
* 🚂 **Express.js** – Minimal and flexible backend framework.
* 🍃 **MongoDB + Mongoose** – NoSQL database with schema modeling.
* 🔐 **JWT (JSON Web Tokens)** – Secure authentication and authorization.
* ☁️ **Cloudinary** – Image/chart upload and media processing service.

### 🛡️ Admin Panel

* A standalone **React** app with protected routes and dashboard features for admins.

---

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/THEJUSKRISHNAN/Excellytics.git
cd Excellytics
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file from `.env.example`:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

Run the backend server:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open the app at: [http://localhost:5173](http://localhost:5173)

---

### 4. Admin Panel Setup

```bash
cd admin
npm install
npm run dev
```

Access the admin panel at: [http://localhost:5174](http://localhost:5174)

---

## 🖼️ Excellytics Preview

![Preview 1](https://res.cloudinary.com/dgzkgmldz/image/upload/v1749059039/Screenshot_2025-06-04_230205_yphvgy.png)
![Preview 2](https://res.cloudinary.com/dgzkgmldz/image/upload/v1749059031/Screenshot_2025-06-04_230228_c5tj6o.png)
![Preview 3](https://res.cloudinary.com/dgzkgmldz/image/upload/v1749059015/Screenshot_2025-06-04_230308_e6uiwm.png)

---
