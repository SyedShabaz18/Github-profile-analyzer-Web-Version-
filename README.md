# GitHub Profile Analyzer — Web Application

A full-stack web application that analyzes **public GitHub profiles and repositories** using the GitHub REST API and presents the results through an interactive analytics dashboard.

The application allows users to search for a GitHub username and view profile information, repository statistics, programming-language distribution, repository performance, and downloadable repository data.

---

## 🚀 Features

- 🔍 Search any public GitHub username
- 👤 Display GitHub profile information
- 👥 Followers and following count
- 📦 Public repository and gist count
- ⭐ Total stars across repositories
- 🍴 Total forks across repositories
- 📊 Average stars and forks
- 🗂️ Original vs. forked repository statistics
- 🏆 Top repositories by stars and forks
- 💻 Programming-language analysis
- 📈 Language distribution chart
- 📊 Repository stars comparison chart
- 🔎 Search and filter repositories
- 🔗 Direct GitHub profile and repository links
- 📥 Download repository information as CSV
- ⏳ Loading and error handling
- 📱 Responsive design
- ✨ Interactive UI effects

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Chart.js

### Backend
- Python
- FastAPI
- Uvicorn

### API
- GitHub REST API

### Data & Integration
- REST API integration
- JSON data handling
- CSV generation
- API-based data processing

---

## 📊 What the Application Analyzes

For a public GitHub profile, the application collects and processes information such as:

- Profile name and username
- Bio
- Location
- Company
- Website/blog
- Followers
- Following
- Public repositories
- Public gists
- Repository stars
- Repository forks
- Repository languages
- Repository watchers
- Repository size
- Repository creation and update dates
- Original and forked repositories

The application also calculates additional statistics such as:

- Total stars
- Total forks
- Average stars
- Average forks
- Language distribution
- Top repositories

---

## 📁 Project Structure

```text
github_profile_analyzer_web/
│
├── backend/
│   ├── __init__.py
│   ├── main.py
│   └── github_service.py
│
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── assets/
│       └── style.css
│
├── requirements.txt
├── run.py
├── .gitignore
└── README.md
```

---

## ⚙️ How to Run Locally

### 1. Clone the repository

```powershell
git clone https://github.com/SyedShabaz18/Github-profile-analyzer.git
```

Navigate into the project:

```powershell
cd Github-profile-analyzer
```

---

### 2. Create a virtual environment

For Windows:

```powershell
python -m venv venv
```

Activate it:

```powershell
venv\Scripts\activate
```

---

### 3. Install dependencies

```powershell
pip install -r requirements.txt
```

---

### 4. Start the application

```powershell
python run.py
```

The application will start at:

```text
http://127.0.0.1:8000
```

Open the URL in your browser and enter a public GitHub username.

---

## 🔌 API Endpoints

### Analyze GitHub Profile

```text
GET /api/analyze/{username}
```

Example:

```text
GET /api/analyze/SyedShabaz18
```

---

### Health Check

```text
GET /api/health
```

Example response:

```json
{
  "status": "ok",
  "service": "GitHub Profile Analyzer"
}
```

---

### Download Repository Data

```text
GET /api/analyze/{username}/csv
```

Example:

```text
GET /api/analyze/SyedShabaz18/csv
```

The endpoint generates a CSV file containing analyzed repository information.

---

## 🔄 Application Flow

```text
User
  │
  ▼
Enter GitHub Username
  │
  ▼
Frontend
  │
  ▼
FastAPI Backend
  │
  ▼
GitHub REST API
  │
  ▼
Profile + Repository Data
  │
  ▼
Data Processing
  │
  ├── Repository Statistics
  ├── Language Analysis
  ├── Stars & Forks
  └── Top Repositories
  │
  ▼
Interactive Dashboard
  │
  └── CSV Export
```

---

## 🔐 Privacy & Security

The application works with **public GitHub information**.

It does not:

- Ask for a GitHub password
- Request private repository access
- Store GitHub passwords
- Require GitHub account login

The frontend communicates with the FastAPI backend, which retrieves publicly available information through the GitHub REST API.

No GitHub authentication token is currently stored in this project.

---

## ⚠️ GitHub API Rate Limits

The application currently uses unauthenticated GitHub API requests.

GitHub applies rate limits to unauthenticated API usage. This is generally suitable for a personal or demonstration project.

For a larger production deployment, the application could be improved by implementing:

- Server-side GitHub authentication
- API request caching
- Rate-limit monitoring
- Request optimization

---

## 🌐 Deployment

The application can be deployed as a FastAPI web service using platforms such as Render or other Python-compatible hosting services.

For production deployment, HTTPS should be used and API credentials, if introduced later, should be stored securely as environment variables rather than committed to GitHub.

---

## 🎯 Project Objective

The main objective of this project is to demonstrate practical experience with:

- Python backend development
- FastAPI
- REST API integration
- JSON data processing
- Data analysis
- API-driven application development
- Frontend and backend integration
- Data visualization
- CSV data generation
- Error handling
- Building and deploying a full-stack web application

---

## 👤 Author

**Syed Shabaz Banu**

B.Tech CSE (AI & ML)  
Ananta Lakshmi Institute of Technology and Sciences

GitHub: [@SyedShabaz18](https://github.com/SyedShabaz18)

---

⭐ If you found this project useful, consider giving it a star!
