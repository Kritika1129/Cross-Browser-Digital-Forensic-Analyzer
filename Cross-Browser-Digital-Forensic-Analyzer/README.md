# TraceLens — Cross-Browser Digital Forensic Artifact Analyzer

TraceLens is an MCA project prototype that demonstrates a unified interface for reviewing browser artifact records from Google Chrome, Microsoft Edge, and Mozilla Firefox.

The current version is a **sample-data / import-based prototype**. It demonstrates a Flask backend, a browser-based dashboard, artifact normalization, search and filtering, a chronological timeline, and local report exports. It does **not yet perform direct extraction from live browser profile databases**, create forensic evidence copies, or calculate SHA-256 evidence hashes. Those are planned development milestones.

## Project team

- Avinash Saini
- Kritika
- Amit Prakash
- Raushan Kumar

## Current features

- Flask backend serving the frontend and JSON API.
- Dashboard for reviewing browser artifact records.
- Import of JSON and CSV artifact data in the browser.
- Search and filtering by browser and artifact type.
- Chronological unified timeline.
- CSV export and a demonstration report.
- Sample records representing Chrome, Edge, and Firefox.

## Technology stack

- Python
- Flask
- HTML
- CSS
- JavaScript
- JSON and CSV

## Project structure

```text
Cross-Browser-Digital-Forensic-Analyzer/
├── backend/
│   └── app.py
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── sample-artifacts.json
│   └── sample-artifacts.csv
├── README.md
├── requirements.txt
└── .gitignore
```

## Requirements

- Python 3.9 or newer
- pip

## Run locally

1. Clone or download this repository.
2. Open a terminal in the project root directory.
3. (Recommended) Create and activate a virtual environment:

   **Windows PowerShell**
   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   **Command Prompt**
   ```bat
   py -m venv .venv
   .venv\Scripts\activate.bat
   ```

4. Install dependencies:

   ```bash
   python -m pip install -r requirements.txt
   ```

5. Start the Flask application:

   ```bash
   python backend/app.py
   ```

6. Open this address in your browser:

   http://127.0.0.1:5000

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Serves the dashboard |
| GET | `/api/status` | Returns backend connection status |
| GET | `/api/artifacts` | Returns the bundled sample JSON artifact records |

## Sample artifact format

Each record uses common fields:

```json
{
  "browser": "Chrome",
  "type": "History",
  "title": "University Portal",
  "url": "https://portal.example.com/login",
  "timestamp": "2026-10-12T08:00:00Z"
}
```

## Forensic scope and limitations

This repository is an educational prototype. Imported and bundled records are illustrative data and must not be represented as evidence collected from a real device.

Planned future work includes:

1. Browser profile and database discovery for Chrome, Edge, and Firefox.
2. Read-only acquisition and preservation of source databases.
3. SHA-256 hashing and acquisition metadata.
4. SQLite artifact extraction and storage.
5. Consistent timestamp conversion and cross-browser correlation.
6. A more complete, traceable forensic report.

For real investigations, follow applicable authorization, evidence-handling, privacy, and chain-of-custody procedures. Do not upload private browser histories, cookies, passwords, tokens, or real case evidence to a public repository.

## Academic project

Developed as an MCA project to explore browser artifact analysis and cross-browser forensic review.
