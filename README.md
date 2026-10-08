# GitHub Profile Analyzer — Web Version

A full-stack GitHub analytics web application built with:

- Python
- FastAPI
- GitHub REST API
- HTML
- CSS
- JavaScript
- Chart.js

## Features

- Search any public GitHub username
- Profile information
- Followers / following
- Public repositories and gists
- Total stars and forks across public repositories
- Top repositories
- Primary languages
- Language distribution chart
- Stars by repository chart
- Repository table
- Direct GitHub profile/repository links
- Download analyzed repository data as CSV
- Responsive light UI

## Project structure

```text
github_profile_analyzer/
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

## 1. Open the project in VS Code

Open the `github_profile_analyzer` folder.

## 2. Create a virtual environment

Windows:

```powershell
python -m venv venv
```

Activate:

```powershell
venv\Scripts\activate
```

## 3. Install packages

```powershell
pip install -r requirements.txt
```

## 4. Start the website

```powershell
python run.py
```

Then open:

```text
http://127.0.0.1:8000
```

You can also use:

```powershell
uvicorn backend.main:app --reload
```

## Important

The application analyzes public GitHub information. It does not ask for a GitHub password or private repository access.

The browser talks to your FastAPI backend, and the backend talks to GitHub's public REST API.

For production deployment, use HTTPS and consider a GitHub token/server-side authentication if you need higher API limits.

## GitHub API rate limits

Unauthenticated GitHub API requests have a limited rate allowance. For a personal/demo project this is normally enough for testing, but a public production application should use an appropriate server-side token and caching strategy.

## API endpoint

Example:

```text
GET /api/analyze/SyedShabaz18
```

Health check:

```text
GET /api/health
```

CSV export:

```text
GET /api/analyze/SyedShabaz18/csv
```
