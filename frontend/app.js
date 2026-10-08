const form = document.getElementById("searchForm");

const usernameInput = document.getElementById("username");

const analyzeButton = document.getElementById("analyzeButton");

const dashboard = document.getElementById("dashboard");

const welcomeSection = document.getElementById("welcomeSection");

const errorBox = document.getElementById("errorBox");

const loadingOverlay = document.getElementById("loadingOverlay");

const repoSearch = document.getElementById("repoSearch");

const downloadButton = document.getElementById("downloadButton");

const repoTableBody = document.getElementById("repoTableBody");

const repoEmptyState =
    document.getElementById("repoEmptyState") ||
    document.getElementById("emptyRepos");

let currentUsername = "";

let currentRepositories = [];

let languageChart = null;

let starsChart = null;

const numberFormat = new Intl.NumberFormat("en-IN");


function formatNumber(value) {
    return numberFormat.format(value || 0);
}


function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

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

        const buttonText =
            analyzeButton.querySelector("span:first-child");

        if (buttonText) {
            buttonText.textContent = "Analyzing...";
        }
    } else {
        loadingOverlay.classList.add("hidden");
        analyzeButton.disabled = false;

        const buttonText =
            analyzeButton.querySelector("span:first-child");

        if (buttonText) {
            buttonText.textContent = "Analyze Profile";
        }
    }
}


function showDashboard() {
    dashboard.classList.remove("hidden");
    welcomeSection.classList.add("hidden");
}


function formatDate(dateString) {
    if (!dateString) {
        return "—";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}


function renderProfile(data) {
    const profile = data.profile || {};
    const stats = data.stats || {};

    const avatar =
        document.getElementById("profileAvatar") ||
        document.getElementById("avatar");

    if (avatar) {
        avatar.src = profile.avatar_url || "";
        avatar.alt = `${profile.login || "GitHub"} avatar`;
    }


    const profileName =
        document.getElementById("profileName");

    if (profileName) {
        profileName.textContent =
            profile.name ||
            profile.login ||
            "GitHub User";
    }


    const profileLogin =
        document.getElementById("profileLogin");

    if (profileLogin) {
        profileLogin.textContent =
            `@${profile.login || ""}`;
    }


    const profileBio =
        document.getElementById("profileBio");

    if (profileBio) {
        profileBio.textContent =
            profile.bio ||
            "No bio provided.";
    }


    const locationMeta =
        document.getElementById("locationMeta");

    if (locationMeta) {
        locationMeta.textContent =
            profile.location
                ? `⌖ ${profile.location}`
                : "⌖ Not provided";
    }


    const companyMeta =
        document.getElementById("companyMeta");

    if (companyMeta) {
        companyMeta.textContent =
            profile.company
                ? `▣ ${profile.company}`
                : "▣ Not provided";
    }


    const blogMeta =
        document.getElementById("blogMeta");

    if (blogMeta) {
        blogMeta.textContent =
            profile.blog
                ? `⌁ ${profile.blog}`
                : "⌁ Not provided";
    }


    const profileLink =
        document.getElementById("profileLink");

    if (profileLink) {
        profileLink.href =
            profile.profile_url ||
            `https://github.com/${encodeURIComponent(
                profile.login || ""
            )}`;
    }


    const followers =
        document.getElementById("followers");

    if (followers) {
        followers.textContent =
            formatNumber(profile.followers);
    }


    const following =
        document.getElementById("following");

    if (following) {
        following.textContent =
            formatNumber(profile.following);
    }


    const repoCount =
        document.getElementById("repoCount");

    if (repoCount) {
        repoCount.textContent =
            formatNumber(stats.repository_count);
    }


    const totalStars =
        document.getElementById("totalStars");

    if (totalStars) {
        totalStars.textContent =
            formatNumber(stats.total_stars);
    }


    const totalForks =
        document.getElementById("totalForks");

    if (totalForks) {
        totalForks.textContent =
            formatNumber(stats.total_forks);
    }


    const gists =
        document.getElementById("gists");

    if (gists) {
        gists.textContent =
            formatNumber(profile.public_gists);
    }


    const averageStars =
        document.getElementById("averageStars");

    if (averageStars) {
        averageStars.textContent =
            formatNumber(stats.average_stars);
    }


    const averageForks =
        document.getElementById("averageForks");

    if (averageForks) {
        averageForks.textContent =
            formatNumber(stats.average_forks);
    }


    const originalRepos =
        document.getElementById("originalRepos");

    if (originalRepos) {
        originalRepos.textContent =
            formatNumber(stats.original_repositories);
    }


    const forkedRepos =
        document.getElementById("forkedRepos");

    if (forkedRepos) {
        forkedRepos.textContent =
            formatNumber(stats.forked_repositories);
    }


    const languageCount =
        document.getElementById("languageCount");

    if (languageCount) {
        const languages = data.languages || [];

        languageCount.textContent =
            `${languages.length} languages`;
    }


    const lastUpdated =
        document.getElementById("lastUpdated");

    if (lastUpdated) {
        lastUpdated.textContent =
            "Public GitHub profile analysis";
    }
}


function renderLanguageChart(languages) {
    const ctx =
        document.getElementById("languageChart");

    if (!ctx || typeof Chart === "undefined") {
        return;
    }

    if (languageChart) {
        languageChart.destroy();
    }


    const safeLanguages =
        Array.isArray(languages)
            ? languages
            : [];


    const topLanguages =
        safeLanguages.slice(0, 8);


    if (!topLanguages.length) {
        return;
    }


    languageChart = new Chart(ctx, {
        type: "doughnut",

        data: {
            labels: topLanguages.map(
                item => item.name
            ),

            datasets: [
                {
                    data: topLanguages.map(
                        item => item.count || 0
                    ),

                    borderWidth: 4,

                    borderColor: "#ffffff",
                },
            ],
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

                            size: 12,
                        },
                    },
                },
            },
        },
    });
}


function renderStarsChart(repositories) {
    const ctx =
        document.getElementById("starsChart");

    if (!ctx || typeof Chart === "undefined") {
        return;
    }

    if (starsChart) {
        starsChart.destroy();
    }


    const safeRepositories =
        Array.isArray(repositories)
            ? repositories
            : [];


    const top =
        safeRepositories
            .slice()
            .sort(
                (a, b) =>
                    (b.stars || 0) -
                    (a.stars || 0)
            )
            .slice(0, 7);


    if (!top.length) {
        return;
    }


    starsChart = new Chart(ctx, {
        type: "bar",

        data: {
            labels: top.map(
                repo => repo.name
            ),

            datasets: [
                {
                    label: "Stars",

                    data: top.map(
                        repo => repo.stars || 0
                    ),

                    borderRadius: 7,

                    maxBarThickness: 36,
                },
            ],
        },

        options: {
            responsive: true,

            maintainAspectRatio: false,

            scales: {
                x: {
                    grid: {
                        display: false,
                    },

                    ticks: {
                        font: {
                            family: "Inter",

                            size: 10,
                        },

                        maxRotation: 35,

                        minRotation: 0,
                    },
                },

                y: {
                    beginAtZero: true,

                    grid: {
                        drawBorder: false,
                    },

                    ticks: {
                        precision: 0,
                    },
                },
            },

            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    });
}


function renderRepositories(repositories) {
    currentRepositories =
        Array.isArray(repositories)
            ? repositories
            : [];


    const tbody =
        document.getElementById(
            "repoTableBody"
        );


    const empty =
        document.getElementById(
            "repoEmptyState"
        ) ||
        document.getElementById(
            "emptyRepos"
        );


    if (!tbody) {
        return;
    }


    if (!currentRepositories.length) {
        tbody.innerHTML = "";

        if (empty) {
            empty.classList.remove("hidden");
        }

        return;
    }


    if (empty) {
        empty.classList.add("hidden");
    }


    tbody.innerHTML =
        currentRepositories
            .map(repo => {

                const language =
                    repo.language
                        ? `<span class="language-badge">${escapeHtml(
                              repo.language
                          )}</span>`
                        : `<span class="muted">—</span>`;


                const repositoryUrl =
                    repo.url ||
                    `https://github.com/${encodeURIComponent(
                        repo.full_name ||
                        repo.name ||
                        ""
                    )}`;


                return `
                    <tr>
                        <td>
                            <div class="repo-name">
                                <strong>
                                    ${escapeHtml(
                                        repo.name || "Unnamed Repository"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        repo.description ||
                                        "No description provided."
                                    )}
                                </span>
                            </div>
                        </td>

                        <td>${language}</td>

                        <td>
                            ★ ${formatNumber(repo.stars)}
                        </td>

                        <td>
                            ⑂ ${formatNumber(repo.forks)}
                        </td>

                        <td>
                            ${formatDate(repo.updated_at)}
                        </td>

                        <td>
                            <a
                                class="repo-link"
                                href="${escapeHtml(repositoryUrl)}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open ↗
                            </a>
                        </td>
                    </tr>
                `;
            })
            .join("");
}


async function analyzeProfile(username) {
    const cleanUsername =
        username.trim();


    if (!cleanUsername) {
        showError(
            "Please enter a GitHub username."
        );

        return;
    }


    hideError();

    setLoading(true);


    try {
        const response =
            await fetch(
                `/api/analyze/${encodeURIComponent(
                    cleanUsername
                )}`
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data.detail ||
                "Unable to analyze this GitHub profile."
            );
        }


        if (!data || !data.profile) {
            throw new Error(
                "GitHub returned an unexpected response. Please try again."
            );
        }


        currentUsername =
            cleanUsername;


        renderProfile(data);

        renderLanguageChart(
            data.languages
        );

        renderStarsChart(
            data.repositories
        );

        renderRepositories(
            data.repositories
        );

        showDashboard();


        window.scrollTo({
            top:
                dashboard.offsetTop - 20,

            behavior: "smooth",
        });


    } catch (error) {

        console.error(
            "GitHub Profile Analyzer error:",
            error
        );

        showError(
            error.message ||
            "Something went wrong."
        );

    } finally {

        setLoading(false);
    }
}


form.addEventListener(
    "submit",
    event => {
        event.preventDefault();

        analyzeProfile(
            usernameInput.value
        );
    }
);


if (repoSearch) {
    repoSearch.addEventListener(
        "input",
        () => {

            const query =
                repoSearch.value
                    .toLowerCase()
                    .trim();


            const filtered =
                currentRepositories.filter(
                    repo => {

                        return (
                            (repo.name || "")
                                .toLowerCase()
                                .includes(query) ||

                            (repo.description || "")
                                .toLowerCase()
                                .includes(query) ||

                            (repo.language || "")
                                .toLowerCase()
                                .includes(query)
                        );
                    }
                );


            renderRepositories(
                filtered
            );
        }
    );
}


if (downloadButton) {
    downloadButton.addEventListener(
        "click",
        () => {

            if (!currentUsername) {
                return;
            }


            window.location.href =
                `/api/analyze/${encodeURIComponent(
                    currentUsername
                )}/csv`;
        }
    );
}


usernameInput.focus();