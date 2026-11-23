
from flask import Flask, jsonify, send_from_directory
import json
from pathlib import Path

# Find the project folders
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

# Create Flask application
app = Flask(
    __name__,
    static_folder=str(FRONTEND_DIR),
    static_url_path=""
)


# Open the frontend dashboard
@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


# Check backend connection
@app.route("/api/status")
def status():
    return jsonify({
        "project": "TraceLens",
        "backend": "Python Flask",
        "status": "Connected"
    })


# Get browser artifacts from JSON file
@app.route("/api/artifacts")
def get_artifacts():

    file_path = FRONTEND_DIR / "sample-artifacts.json"

    with open(file_path, "r", encoding="utf-8") as file:
        artifacts = json.load(file)

    return jsonify({
        "total": len(artifacts),
        "artifacts": artifacts
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
        use_reloader=False
    )
s
