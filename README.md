# 🚀 Aurora - Next-Generation Educational Platform
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![PHP](https://img.shields.io/badge/PHP-7.4%252B-777BB4?logo=php)]()
[![MySQL](https://img.shields.io/badge/MySQL-5.7%252B-4479A1?logo=mysql)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%252B-F7DF1E?logo=javascript)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

Aurora is a modern web application for **educational management**, built with **Vanilla JavaScript**, **PHP**, and **MySQL**.
It allows administrators, teachers, and students to manage courses, sessions, and attendance, including **facial recognition attendance verification**.

---

## 📋 Features

### User Features
- **Authentication:** secure signup/login, password hashing (bcrypt), session management
- **Browse Courses:** filter by program/level, view course details, pagination
- **Manage Sessions:** view sessions with real-time status updates
- **Attendance System:** mark attendance with facial recognition
- **Real-Time Updates:** AJAX-based dynamic UI
- **Email Notifications:** account updates, course assignments, attendance confirmations

### Teacher Features
- **Course Management:** view assigned courses and enrolled students
- **Session Planning:** create/manage sessions with automatic validation
- **Attendance Tracking:** monitor attendance, export PDF/Excel reports
- **Student Analytics:** track performance and attendance patterns

### Admin Features
- **Dashboard:** overview of users, courses, sessions, attendance statistics
- **User Management:** create/update/deactivate/delete users
- **Course Management:** create courses, assign to teachers/programs
- **Session Management:** schedule sessions with conflict detection
- **Attendance Monitoring:** view/export attendance records

---

## 🛠️ Technology Stack

**Frontend:** HTML5/CSS3, Vanilla JS ES6+, Font Awesome  
**Backend:** PHP 7.4+, MySQL 5.7+, PHPMailer, RESTful API  
**Tools:** Composer, phpdotenv, Python + DeepFace (facial recognition)

---

## 📁 Project Structure

```bash

Aurora/
├─ front-end/
│   ├─ interfaces/
│   │   ├─ admin-management/
│   │   ├─ teacher-management/
│   │   ├─ student-management/
│   │   ├─ authentification/
│   │   ├─ legal-docs/
│   │   └─ aurora-landing-page.html
│   │          
│   ├─ scripts/
│   │   ├─ authentification/
│   │   ├─ course/
│   │   ├─ session/
│   │   ├─ presence/
│   │   ├─ student/
│   │   ├─ teacher/
│   │   └─ dashboard/
│   │   
│   └─ styles/
│       ├─ style.css
│       ├─ shared.css
│       ├─ style-dashboard.css
│       ├─ style-course.css
│       ├─ style-session.css
│       ├─ style-attendance.css
│       └─ modal.css
│
├─ back-end/
│   ├─ config/
│   │   └─ Database.php
│   ├─ user/
│   ├─ course/
│   ├─ session/
│   ├─ presence/
│   ├─ MailService/
│   └─ phpmailer/
│
├─ database/
│   └─ aurora_database_sql.sql
│
├─ vendor/
├─ .env
├─ composer.json
├─ composer.lock
└─ README.md

```

---

## 💾 Installation

**Prerequisites**
- PHP 7.4+
- MySQL 5.7+
- Composer
- Web server (Apache/Nginx)
- Python 3.11+ (for facial recognition)
- Modern browser

**Steps**
1. Clone the repository:

```bash
git https://github.com/ZeinebGhrab/Aurora.git
cd Aurora
```

2. Install PHP dependencies:

```bash
composer install
```

3. Install Python dependencies:

```bash
pip install deepface
```

4. Configure the database:

Import database/aurora_database_sql.sql in MySQL

Update back-end/config/Database.php with your credentials

5. Set up .env for emails:

```bash
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_PORT=587
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=Aurora
```
6. Access the app:

```bash
http://localhost/Aurora/front-end/interfaces/aurora-landing-page.html
```

---

## 💡 Usage

**For Students**

- Register, upload profile photo

- Browse courses and sessions

- Mark attendance via facial recognition

- Track attendance records

**For Teachers**

- Login, view courses

- Schedule and manage sessions

- Track and export attendance reports


**For Admins**

- Access dashboard

- Manage users and courses

- Schedule sessions and monitor attendance

---

## 💻 Database Configuration

Database connection is handled in back-end/config/Database.php:

```bash
class Database {
    private $host = "localhost";
    private $user = "root";
    private $password = "";
    private $dbname = "Aurora";
}
```

**Tables**

- utilisateur (users)

- enseignant (teachers)

- etudiant (students)

- filiere (programs)

- cours (courses)

- seance (sessions)

- presence (attendance)
---

## 📝 License

MIT License © Zeineb Ghrab

---

## 🤝 Contributions
Pull requests are welcome! For major changes, please open an issue first.

---

## 🙋 About the Developer
Built with dedication by Zeineb Ghrab  
🎓 Data Science Engineer | 🧠 Passionate about data, AI, and full-stack development