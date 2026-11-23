
let sampleArtifacts = [];
let artifacts = [];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

// ---------------- HELPER FUNCTIONS ----------------

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[ch]);
}

function formatDate(value) {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function sortNewest(data) {
    return [...data].sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );
}

function badge(text, cls) {
    return `<span class="${cls}">${escapeHtml(text)}</span>`;
}

function toast(message) {
    let box = $("#toast");

    if (!box) {
        box = document.createElement("div");
        box.id = "toast";
        box.className = "toast";
        document.body.appendChild(box);
    }

    box.textContent = message;
    box.classList.add("show");

    clearTimeout(box.timer);
    box.timer = setTimeout(() => {
        box.classList.remove("show");
    }, 2800);
}

// ---------------- BACKEND CONNECTION ----------------

async function loadArtifactsFromBackend() {
    try {
        const response = await fetch("/api/artifacts");

        if (!response.ok) {
            throw new Error("Backend returned status " + response.status);
        }

        const data = await response.json();

        if (!Array.isArray(data.artifacts)) {
            throw new Error("Invalid artifact data received.");
        }

        sampleArtifacts = data.artifacts.map((item, index) => ({
            id: index + 1,
            browser: item.browser,
            type: item.type,
            title: item.title,
            url: item.url,
            timestamp: item.timestamp
        }));

        artifacts = [...sampleArtifacts];

        updateStats();

        const status = $("#importStatus");
        if (status) {
            status.textContent =
                "Successfully connected to Python backend.";
        }

        console.log("Artifacts loaded from Python:", artifacts);
        toast("Backend connected. " + artifacts.length + " records loaded.");

    } catch (error) {
        console.error("Backend error:", error);
        toast("Unable to load artifacts from Python.");
    }
}

// ---------------- DASHBOARD STATISTICS ----------------

function updateStats() {
    if ($("#statTotal")) {
        $("#statTotal").textContent = artifacts.length;
    }

    const counts = {
        Chrome: 0,
        Edge: 0,
        Firefox: 0
    };

    artifacts.forEach(a => {
        if (counts[a.browser] !== undefined) {
            counts[a.browser]++;
        }
    });

    if ($("#chromeCount")) {
        $("#chromeCount").textContent = counts.Chrome;
    }

    if ($("#edgeCount")) {
        $("#edgeCount").textContent = counts.Edge;
    }

    if ($("#firefoxCount")) {
        $("#firefoxCount").textContent = counts.Firefox;
    }

    const urls = new Set(
        artifacts.map(a => normalizeUrl(a.url)).filter(Boolean)
    );

    if ($("#statCorrelated")) {
        $("#statCorrelated").textContent =
            Math.max(0, artifacts.length - urls.size);
    }

    renderRecent();
    renderArtifacts();
    renderTimeline();
    renderReportSummary();
}

// ---------------- URL NORMALIZATION ----------------

function normalizeUrl(url) {
    try {
        const u = new URL(url);
        return u.hostname + u.pathname.replace(/\/$/, "");
    } catch {
        return String(url || "").trim().toLowerCase();
    }
}

// ---------------- RECENT ARTIFACTS ----------------

function renderRecent() {
    const rows = $("#recentRows");
    if (!rows) return;

    const recent = sortNewest(artifacts).slice(0, 5);

    rows.innerHTML = recent.map(a => `
        <tr>
            <td>${escapeHtml(a.title || "(untitled)")}</td>
            <td>${badge(a.browser || "Unknown", "browser-chip")}</td>
            <td>${escapeHtml(formatDate(a.timestamp))}</td>
        </tr>
    `).join("") || `
        <tr><td colspan="3">No records available.</td></tr>
    `;
}

// ---------------- ARTIFACT EXPLORER ----------------

function renderArtifacts() {
    const rows = $("#artifactRows");
    if (!rows) return;

    const query = ($("#searchInput")?.value || "").toLowerCase();
    const browser = $("#browserFilter")?.value || "all";
    const type = $("#typeFilter")?.value || "all";

    const filtered = sortNewest(artifacts).filter(a =>
        (browser === "all" || a.browser === browser) &&
        (type === "all" || a.type === type) &&
        [a.title, a.url, a.browser, a.type].some(v =>
            String(v || "").toLowerCase().includes(query)
        )
    );

    rows.innerHTML = filtered.map(a => `
        <tr>
            <td>
                <span class="artifact-title">
                    ${escapeHtml(a.title || "(untitled)")}
                </span>
            </td>
            <td>${badge(a.browser || "Unknown", "browser-chip")}</td>
            <td>${badge(a.type || "Other", "type-chip")}</td>
            <td title="${escapeHtml(a.url)}">
                ${escapeHtml(
                    (a.url || "").length > 44
                        ? a.url.slice(0, 44) + "..."
                        : a.url || "—"
                )}
            </td>
            <td>${escapeHtml(formatDate(a.timestamp))}</td>
        </tr>
    `).join("") || `
        <tr><td colspan="5">No matching records found.</td></tr>
    `;

    if ($("#resultCount")) {
        $("#resultCount").textContent =
            `${filtered.length} of ${artifacts.length} records`;
    }
}

// ---------------- UNIFIED TIMELINE ----------------

function renderTimeline() {
    const list = $("#timelineList");
    if (!list) return;

    const events = sortNewest(artifacts).reverse();

    list.innerHTML = events.map(a => `
        <div class="timeline-item">
            <div class="timeline-date">
                ${escapeHtml(formatDate(a.timestamp))}
            </div>

            <div class="timeline-line">
                <span class="timeline-dot"></span>
            </div>

            <div class="timeline-card">
                <b>${escapeHtml(a.title || "(untitled)")}</b>
                <p>${escapeHtml(a.url || "No URL provided")}</p>

                <div class="timeline-meta">
                    ${badge(a.browser || "Unknown", "browser-chip")}
                    ${badge(a.type || "Other", "type-chip")}
                    <small>Record #${escapeHtml(a.id ?? "—")}</small>
                </div>
            </div>
        </div>
    `).join("") || "<p>No events to display.</p>";
}

// ---------------- REPORT SUMMARY ----------------

function renderReportSummary() {
    const summary = $("#reportSummary");
    if (!summary) return;

    summary.innerHTML = `
        <div>
            <strong>${artifacts.length}</strong>
            <span>Total artifacts</span>
        </div>

        <div>
            <strong>${new Set(artifacts.map(a => a.browser)).size}</strong>
            <span>Browser sources</span>
        </div>

        <div>
            <strong>${new Set(artifacts.map(a => normalizeUrl(a.url))).size}</strong>
            <span>Unique URL keys</span>
        </div>
    `;
}

// ---------------- PAGE NAVIGATION ----------------

function showView(view) {
    const views = ["dashboard", "artifacts", "timeline", "reports"];

    views.forEach(v => {
        const element = $("#" + v + "View");
        if (element) {
            element.classList.toggle("hidden", v !== view);
        }
    });

    $$(".nav-item").forEach(b =>
        b.classList.toggle("active", b.dataset.view === view)
    );

    const names = {
        dashboard: "Dashboard",
        artifacts: "Artifacts",
        timeline: "Unified Timeline",
        reports: "Reports"
    };

    const headings = {
        dashboard: "Cross-Browser Artifact Overview",
        artifacts: "Artifact Explorer",
        timeline: "Unified Forensic Timeline",
        reports: "Investigation Reports"
    };

    if ($("#pageName")) $("#pageName").textContent = names[view];
    if ($("#heading")) $("#heading").textContent = headings[view];

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------------- EVENT LISTENERS ----------------

$$(".nav-item").forEach(b =>
    b.addEventListener("click", () => showView(b.dataset.view))
);

$$("[data-go]").forEach(b =>
    b.addEventListener("click", () => showView(b.dataset.go))
);

$("#searchInput")?.addEventListener("input", renderArtifacts);
$("#browserFilter")?.addEventListener("change", renderArtifacts);
$("#typeFilter")?.addEventListener("change", renderArtifacts);

$("#resetFilters")?.addEventListener("click", () => {
    $("#searchInput").value = "";
    $("#browserFilter").value = "all";
    $("#typeFilter").value = "all";
    renderArtifacts();
});

$("#closeNotice")?.addEventListener("click", () => {
    $(".notice")?.remove();
});

$("#newCaseBtn")?.addEventListener("click", () => {
    if (confirm("Start a new analysis using the sample dataset?")) {
        artifacts = [...sampleArtifacts];

        if ($("#fileInput")) {
            $("#fileInput").value = "";
        }

        updateStats();
        toast("Sample analysis loaded.");
    }
});

// ---------------- FILE IMPORT ----------------

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);

    if (lines.length < 2) return [];

    const parseLine = line => {
        const out = [];
        let cur = "";
        let quoted = false;

        for (let i = 0; i < line.length; i++) {
            const c = line[i];

            if (c === '"' && line[i + 1] === '"' && quoted) {
                cur += '"';
                i++;
            } else if (c === '"') {
                quoted = !quoted;
            } else if (c === "," && !quoted) {
                out.push(cur);
                cur = "";
            } else {
                cur += c;
            }
        }

        out.push(cur);
        return out;
    };

    const headers = parseLine(lines.shift())
        .map(h => h.trim().toLowerCase());

    return lines.filter(l => l.trim()).map((line, i) => {
        const values = parseLine(line);
        const row = {};

        headers.forEach((h, j) => {
            row[h] = values[j] ?? "";
        });

        return normalizeRecord(row, i);
    });
}

// ---------------- RECORD NORMALIZATION ----------------

function normalizeRecord(row, i = 0) {
    const get = (...keys) => {
        for (const key of keys) {
            if (row[key] !== undefined &&
                row[key] !== null &&
                row[key] !== "") {
                return row[key];
            }
        }
        return "";
    };

    return {
        id: Date.now() + i,
        browser: canonicalBrowser(get("browser", "source")),
        type: canonicalType(get("type", "artifact_type", "kind")),
        title: get("title", "name", "artifact"),
        url: get("url", "uri", "path"),
        timestamp: get("timestamp", "time", "datetime", "date")
            || new Date().toISOString()
    };
}

function canonicalBrowser(value) {
    const s = String(value).toLowerCase();

    if (s.includes("chrome")) return "Chrome";
    if (s.includes("edge")) return "Edge";
    if (s.includes("firefox")) return "Firefox";

    return value || "Unknown";
}

function canonicalType(value) {
    const s = String(value).toLowerCase();

    for (const t of ["history", "download", "search", "bookmark"]) {
        if (s.includes(t)) {
            return t[0].toUpperCase() + t.slice(1);
        }
    }

    return value || "Other";
}

// ---------------- IMPORT JSON / CSV ----------------

async function importFile(file) {
    if (!file) return;

    try {
        const text = await file.text();
        let rows;

        if (file.name.toLowerCase().endsWith(".json")) {
            const parsed = JSON.parse(text);

            const arr = Array.isArray(parsed)
                ? parsed
                : (parsed.artifacts || parsed.records || []);

            if (!Array.isArray(arr)) {
                throw new Error("Invalid JSON format.");
            }

            rows = arr.map((item, i) => normalizeRecord(item, i));

        } else if (file.name.toLowerCase().endsWith(".csv")) {
            rows = parseCSV(text);

        } else {
            throw new Error("Please select a JSON or CSV file.");
        }

        if (!rows.length) {
            throw new Error("No records found in the selected file.");
        }

        artifacts = rows;
        updateStats();

        if ($("#importStatus")) {
            $("#importStatus").textContent =
                `Imported ${rows.length} records from ${file.name}.`;
        }

        toast(`Successfully imported ${rows.length} records.`);
        showView("dashboard");

    } catch (error) {
        console.error("Import error:", error);

        if ($("#importStatus")) {
            $("#importStatus").textContent =
                "Import failed: " + error.message;
        }

        toast("Could not import file. Check its format.");
    }
}

$("#fileInput")?.addEventListener("change", e => {
    importFile(e.target.files[0]);
});

// Drag and drop

const drop = $("#dropZone");

if (drop) {
    drop.addEventListener("dragover", e => {
        e.preventDefault();
        drop.style.borderColor = "#635bdb";
    });

    drop.addEventListener("dragleave", () => {
        drop.style.borderColor = "";
    });

    drop.addEventListener("drop", e => {
        e.preventDefault();
        drop.style.borderColor = "";

        importFile(e.dataTransfer.files[0]);
    });
}

// ---------------- FILE DOWNLOAD ----------------

function downloadFile(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvEscape(value) {
    const s = String(value ?? "");

    return /[",\n]/.test(s)
        ? '"' + s.replace(/"/g, '""') + '"'
        : s;
}

// ---------------- CSV EXPORT ----------------

function exportCSV() {
    const cols = ["browser", "type", "title", "url", "timestamp"];

    const content = [
        cols.join(","),
        ...sortNewest(artifacts).map(a =>
            cols.map(c => csvEscape(a[c])).join(",")
        )
    ].join("\n");

    downloadFile(
        "forensic-artifacts.csv",
        content,
        "text/csv;charset=utf-8"
    );

    toast("CSV exported successfully.");
}

$("#exportCsv")?.addEventListener("click", exportCSV);

// ---------------- FORENSIC REPORT ----------------

function makeReport() {
    const lines = [
        "CROSS-BROWSER DIGITAL FORENSIC ARTIFACT ANALYZER",
        "DEMONSTRATION REPORT",
        "",
        `Generated: ${new Date().toLocaleString()}`,
        `Total artifacts: ${artifacts.length}`,
        `Unique URL keys: ${new Set(artifacts.map(a => normalizeUrl(a.url))).size}`,
        "",
        "BROWSER COUNTS",

        ...["Chrome", "Edge", "Firefox"].map(b =>
            `${b}: ${artifacts.filter(a => a.browser === b).length}`
        ),

        "",
        "CHRONOLOGICAL EVENTS",

        ...sortNewest(artifacts).reverse().map(a =>
            `${formatDate(a.timestamp)} | ${a.browser} | ${a.type} | ${a.title} | ${a.url}`
        ),

        "",
        "NOTE: This is a demonstration report using sample or user-provided records."
    ];

    return lines.join("\n");
}

$("#generateReport")?.addEventListener("click", () => {
    downloadFile(
        "forensic-investigation-report.txt",
        makeReport(),
        "text/plain;charset=utf-8"
    );

    toast("Forensic report downloaded.");
});

$("#exportTop")?.addEventListener("click", () => {
    showView("reports");
    toast("Review the report summary and generate your report.");
});

// ---------------- START APPLICATION ----------------

loadArtifactsFromBackend();
