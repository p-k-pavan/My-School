# 🏫 My-School: Complete School Management System

My-School is a comprehensive, modern school management platform designed to streamline administrative operations, improve school-to-parent communication, and manage academic resources. The project features a unified monorepo structure containing a robust backend service, an administrative web dashboard, and a cross-platform mobile application.

---

## 🏗️ Architecture Overview

The codebase is organized into three primary sub-projects:

```
my-school/
├── 📁 service/       # Node.js / Express backend REST API
├── 📁 dashboard/     # React / Vite web dashboard for admins & staff
└── 📁 app/           # React Native / Expo mobile app for parents & students
```

* **[service](./service)**: Manages authentication, database storage, email alerts, push notifications, and report generation (Excel/PDF).
* **[dashboard](./dashboard)**: A modern web interface allowing school administrators to manage registrations, attendance, subjects, timetables, fees, grades, and feeds.
* **[app](./app)**: A mobile app with real-time push notifications enabling parents and students to track homework, view timetables, review attendance records, and pay/track fee structures.

---

## 🛠️ Technology Stack

### Backend Service (`/service`)
* **Core**: Node.js, Express.js (ES Modules)
* **Database**: MongoDB & Mongoose ODM
* **Storage**: Cloudinary API (for media uploads like homework and attachments)
* **Auth**: JSON Web Tokens (JWT) & HTTP-only cookies
* **Emails**: Resend API
* **Push Notifications**: Firebase Admin SDK
* **Reporting**: `exceljs` & `xlsx` (Excel importing/exporting), `pdfkit` (PDF generation)

### Web Dashboard (`/dashboard`)
* **Core**: React 19, Vite, React Router 7
* **State Management**: Redux Toolkit & RTK Query
* **Styling**: Tailwind CSS v4, Lucide React, TW Animate
* **UI Components**: Shadcn UI & Base UI
* **Form Handling**: TanStack Form & Zod (validation)

### Mobile Application (`/app`)
* **Core**: React Native, Expo SDK 56, Expo Router (file-based navigation)
* **State Management**: Redux Toolkit & Redux Persist
* **Styling**: NativeWind v4 (Tailwind CSS for React Native)
* **Notifications**: `@notifee/react-native` & `@react-native-firebase/messaging`
* **Additional Packages**: `react-native-reanimated`, `react-native-pdf` (for viewing assignments/reports), `expo-image`, `@expo/ui`

---

## 🔑 Environment Variables Setup

Each sub-project contains its own environment configuration file. Copy the descriptions below to create your `.env` files.

### 1. Backend Service (`service/.env`)
Create `service/.env` and configure the following variables:
```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_secret

# Email Service
RESEND_API_KEY=your_resend_api_key

# Media Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET_KEY=your_cloudinary_api_secret

# Firebase Admin SDK (JSON stringified) for Push Notifications
FIREBASE_SERVICE_ACCOUNT_JSON={"type": "service_account", "project_id": "...", ...}
```

### 2. Web Dashboard (`dashboard/.env`)
Create `dashboard/.env` and configure the API endpoint:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Mobile App (`app/.env`)
Create `app/.env` and specify the API URLs:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
EXPO_PUBLIC_API_BASE_FILEURL=http://localhost:5000
```
> **Note**: For local mobile testing on physical devices or emulators, replace `localhost` with your local machine's IP address (e.g., `http://192.168.1.100:5000/api`).

---

## 🚀 Quick Start & Installation

Ensure you have [Node.js](https://nodejs.org/) (v18+) and [MongoDB](https://www.mongodb.com/) installed and running.

### Step 1: Install Dependencies
Open three separate terminals or run the following installation commands in each directory:

#### Backend Service
```bash
cd service
npm install
```

#### Admin Dashboard
```bash
cd dashboard
npm install
```

#### Mobile Application
```bash
cd app
npm install
```

### Step 2: Start Development Servers

#### 1. Start Backend API
```bash
cd service
npm run dev
```
*Runs the API on [http://localhost:5000](http://localhost:5000) with auto-reload (nodemon).*

#### 2. Start Admin Dashboard
```bash
cd dashboard
npm run dev
```
*Runs the Vite web app on [http://localhost:5173](http://localhost:5173).*

#### 3. Start Mobile App
```bash
cd app
npx expo start
```
*Press `a` to open in Android Emulator, `i` to open in iOS Simulator, or scan the QR code with the Expo Go app.*

---

## 🗄️ Database Schemas & Data Models

The system architecture is modeled around these Mongoose entities:

1. **User**: Authentication credentials, roles (Admin, Teacher, Student, Parent), and system permissions.
2. **Student**: Profile information, enrollment details, linkage to parents, and academic history.
3. **Teacher**: Teaching credentials, hired date, and linked classes/subjects.
4. **Parent**: Profile info and array of linked Student records.
5. **Class**: Grade/Standard names, section names, and assigned class teacher.
6. **Subject**: Name, code, and links to assigned teachers.
7. **Timetable**: Class schedule map linking timeslots, classes, subjects, and teachers.
8. **Attendance**: Daily tracking records containing student status (Present, Absent, Late).
9. **Homework**: Digital assignments, subject linkages, deadlines, and attachment links.
10. **Fee Structure**: Set rates for different classes, payment intervals, and descriptions.
11. **Fee & Payment**: Tracking individual invoices, payment status, dates, and transactions.
12. **Feed**: School announcements, news feed, blogs, and notifications.
13. **AuditLog**: Internal logs recording CRUD modifications for administrators.

---

## 📦 Production Builds

### Dashboard Build
To bundle the React frontend into static files (HTML, CSS, JS):
```bash
cd dashboard
npm run build
```
The compiled files will output to the `/dashboard/dist` folder, ready for hosting.

### Mobile App Deployment
To build standalone binaries for deployment on Android and iOS:
```bash
cd app
# Android
npx ea-build:android
# iOS
npx ea-build:ios
```
*(Requires EAS CLI configuration and Expo Developer login).*

---

## 🔒 Security & Best Practices

1. **Secure Cookies**: HTTP-Only and Secure cookies are used for saving authentication tokens.
2. **CORS Configuration**: Restricts access to predefined web dashboard origins, local emulator URLs, and custom network configurations.
3. **Token Expiry**: Token sessions expire securely, requiring re-login.
4. **Audit Logs**: Any modification to sensitive models (e.g. Fees, Attendance, Timetables) registers a log in the database under `audit-log` for security validation.
