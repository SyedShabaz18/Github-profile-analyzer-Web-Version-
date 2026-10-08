const form = document.getElementById("searchForm");
const usernameInput = document.getElementById("username");
const analyzeButton = document.getElementById("analyzeButton");
const dashboard = document.getElementById("dashboard");
const welcomeSection = document.getElementById("welcomeSection");
const errorBox = document.getElementById("errorBox");
const loadingOverlay = document.getElementById("loadingOverlay");
const repoSearch = document.getElementById("repoSearch");
const downloadButton = document.getElementById("downloadButton");

let currentUsername = "";
let currentRepositories = [];
let languageChart = null;
let starsChart = null;

const numberFormat = new Intl.NumberFormat("en-IN");

function formatNumber(value) {
    return numberFormat.format(value || 0);
}

function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
}

function hideError() {
    errorBox.classList.add("hidden");
}

function setLoading(isLoading) {
    if (isLoading) {
        loadingOverlay.classList.remove("hidden");
        analyzeButton.disabled = true;
        analyzeButton.querySelector("span:first-child").textContent = "Analyzing...";
    } else {
        loadingOverlay.classList.add("hidden");
        analyzeButton.disabled = false;
        analyzeButton.querySelector("span:first-child").textContent = "Analyze Profile";
    }
}

function showDashboard() {
    dashboard.classList.remove("hidden");
    welcomeSection.classList.add("hidden");
}

function formatDate(dateString) {
    if (!dateString) return "—";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function renderProfile(data) {
    const profile = data.profile;
    const stats = data.statistics;

    document.getElementById("avatar").src = profile.avatar_url || "";
    document.getElementById("avatar").alt = `${profile.login} avatar`;

    document.getElementById("profileName").textContent =
        profile.name || profile.login || "GitHub User";

    document.getElementById("profileLogin").textContent =
        `@${profile.login}`;

    document.getElementById("profileBio").textContent =
        profile.bio || "No bio provided.";

    document.getElementById("locationMeta").textContent =
        profile.location ? `⌖ ${profile.location}` : "⌖ Not provided";

    document.getElementById("companyMeta").textContent =
        profile.company ? `▣ ${profile.company}` : "▣ Not provided";

    document.getElementById("blogMeta").textContent =
        profile.blog ? `⌁ ${profile.blog}` : "⌁ Not provided";

    const profileLink = document.getElementById("profileLink");
    profileLink.href = profile.html_url;

    document.getElementById("followers").textContent =
        formatNumber(profile.followers);

    document.getElementById("following").textContent =
        formatNumber(profile.following);

    document.getElementById("repoCount").textContent =
        formatNumber(profile.public_repos);

    document.getElementById("totalStars").textContent =
        formatNumber(stats.total_stars);

    document.getElementById("totalForks").textContent =
        formatNumber(stats.total_forks);

    document.getElementById("gists").textContent =
        formatNumber(profile.public_gists);

    document.getElementById("averageStars").textContent =
        formatNumber(stats.average_stars);

    document.getElementById("averageForks").textContent =
        formatNumber(stats.average_forks);

    document.getElementById("originalRepos").textContent =
        formatNumber(stats.original_repositories);

    document.getElementById("forkedRepos").textContent =
        formatNumber(stats.forked_repositories);

    document.getElementById("languageCount").textContent =
        `${data.languages.length} languages`;

    document.getElementById("lastUpdated").textContent =
        `GitHub account created ${formatDate(profile.account_created)}`;
}

function renderLanguageChart(languages) {
    const ctx = document.getElementById("languageChart");

    if (languageChart) {
        languageChart.destroy();
    }

    const topLanguages = languages.slice(0, 8);

    languageChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: topLanguages.map(item => item.name),
            datasets: [{
                data: topLanguages.map(item => item.repositories),
                borderWidth: 4,
                borderColor: "#ffffff",
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        usePointStyle: true,
                        padding: 18,
                        font: {
                            family: "Inter",
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function renderStarsChart(repositories) {
    const ctx = document.getElementById("starsChart");

    if (starsChart) {
        starsChart.destroy();
    }

    const top = repositories
        .slice()
        .sort((a, b) => b.stars - a.stars)
        .slice(0, 7);

    starsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: top.map(repo => repo.name),
            datasets: [{
                label: "Stars",
                data: top.map(repo => repo.stars),
                borderRadius: 7,
                maxBarThickness: 36,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: {
                            family: "Inter",
                            size: 10
                        },
                        maxRotation: 35,
                        minRotation: 0
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    },
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function renderRepositories(repositories) {
    currentRepositories = repositories || [];

    const tbody = document.getElementById("repoTableBody");
    const empty = document.getElementById("emptyRepos");

    if (!currentRepositories.length) {
        tbody.innerHTML = "";
        empty.classList.remove("hidden");
        return;
    }

    empty.classList.add("hidden");

    tbody.innerHTML = currentRepositories.map(repo => {
        const language = repo.language
            ? `<span class="language-badge">${escapeHtml(repo.language)}</span>`
            : `<span class="muted">—</span>`;

        return `
            <tr>
                <td>
                    <div class="repo-name">
                        <strong>${escapeHtml(repo.name)}</strong>
                        <span>${escapeHtml(repo.description || "No description provided.")}</span>
                    </div>
                </td>
                <td>${language}</td>
                <td>★ ${formatNumber(repo.stars)}</td>
                <td>⑂ ${formatNumber(repo.forks)}</td>
                <td>${formatDate(repo.updated_at)}</td>
                <td>
                    <a class="repo-link"
                       href="${escapeHtml(repo.html_url)}"
                       target="_blank"
                       rel="noopener noreferrer">
                        Open ↗
                    </a>
                </td>
            </tr>
        `;
    }).join("");
}

async function analyzeProfile(username) {
    const cleanUsername = username.trim();

    if (!cleanUsername) {
        showError("Please enter a GitHub username.");
        return;
    }

    hideError();
    setLoading(true);

    try {
        const response = await fetch(
            `/api/analyze/${encodeURIComponent(cleanUsername)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Unable to analyze this GitHub profile."
            );
        }

        currentUsername = cleanUsername;
        renderProfile(data);
        renderLanguageChart(data.languages);
        renderStarsChart(data.repositories);
        renderRepositories(data.repositories);
        showDashboard();

        window.scrollTo({
            top: dashboard.offsetTop - 20,
            behavior: "smooth"
        });

    } catch (error) {
        showError(error.message || "Something went wrong.");
    } finally {
        setLoading(false);
    }
}

form.addEventListener("submit", event => {
    event.preventDefault();
    analyzeProfile(usernameInput.value);
});

repoSearch.addEventListener("input", () => {
    const query = repoSearch.value.toLowerCase().trim();

    const filtered = currentRepositories.filter(repo => {
        return (
            repo.name.toLowerCase().includes(query) ||
            (repo.description || "").toLowerCase().includes(query) ||
            (repo.language || "").toLowerCase().includes(query)
        );
    });

    renderRepositories(filtered);
});

downloadButton.addEventListener("click", () => {
    if (!currentUsername) return;

    window.location.href =
        `/api/analyze/${encodeURIComponent(currentUsername)}/csv`;
});

usernameInput.focus();
