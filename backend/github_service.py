import csv
import io
import os
from typing import Any, Dict, List, Optional

import requests


GITHUB_API = "https://api.github.com"
TIMEOUT = 15

# The token is read from the environment.
# It is NEVER hard-coded into the source code.
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()


class GitHubAPIError(Exception):
    """Raised when the GitHub API returns an expected error."""


def github_get(
    path: str,
    params: Optional[Dict[str, Any]] = None,
) -> Any:
    """
    Send a GET request to the GitHub API.

    If GITHUB_TOKEN exists, authenticated API requests are used.
    If it does not exist, the app falls back to unauthenticated
    public API requests so local development still works.
    """

    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "GitHub-Profile-Analyzer",
    }

    # Add the token only on the server side.
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    try:
        response = requests.get(
            f"{GITHUB_API}{path}",
            params=params,
            headers=headers,
            timeout=TIMEOUT,
        )
    except requests.RequestException as exc:
        raise GitHubAPIError(
            "Unable to connect to GitHub. Please try again."
        ) from exc

    if response.status_code == 404:
        raise GitHubAPIError(
            "GitHub user or resource was not found."
        )

    if response.status_code == 401:
        raise GitHubAPIError(
            "GitHub authentication failed. Please check the server configuration."
        )

    if response.status_code == 403:
        remaining = response.headers.get("X-RateLimit-Remaining")
        reset = response.headers.get("X-RateLimit-Reset")

        if remaining == "0":
            message = (
                "GitHub API rate limit reached. "
                "Please try again later."
            )

            if reset:
                message += " The limit will reset automatically."

            raise GitHubAPIError(message)

        raise GitHubAPIError(
            "GitHub denied the API request. Please try again later."
        )

    if not response.ok:
        raise GitHubAPIError(
            f"GitHub API returned status {response.status_code}."
        )

    try:
        return response.json()
    except ValueError as exc:
        raise GitHubAPIError(
            "GitHub returned an invalid response."
        ) from exc


def get_all_repositories(username: str) -> List[Dict[str, Any]]:
    """
    Retrieve all public repositories for a GitHub user.

    GitHub returns a maximum of 100 repositories per page,
    so pagination is used for users with many repositories.
    """

    repositories: List[Dict[str, Any]] = []

    for page in range(1, 21):
        page_data = github_get(
            f"/users/{username}/repos",
            params={
                "per_page": 100,
                "page": page,
                "sort": "updated",
                "direction": "desc",
            },
        )

        if not page_data:
            break

        repositories.extend(page_data)

        if len(page_data) < 100:
            break

    return repositories


def analyze_github_profile(username: str) -> Dict[str, Any]:
    """
    Analyze a public GitHub profile and return dashboard-ready data.
    """

    username = username.strip()

    if not username:
        raise GitHubAPIError(
            "Please enter a GitHub username."
        )

    profile = github_get(f"/users/{username}")
    repositories = get_all_repositories(username)

    total_stars = sum(
        int(repo.get("stargazers_count", 0) or 0)
        for repo in repositories
    )

    total_forks = sum(
        int(repo.get("forks_count", 0) or 0)
        for repo in repositories
    )

    original_repositories = [
        repo
        for repo in repositories
        if not repo.get("fork", False)
    ]

    forked_repositories = [
        repo
        for repo in repositories
        if repo.get("fork", False)
    ]

    language_counts: Dict[str, int] = {}

    for repo in repositories:
        language = repo.get("language")

        if language:
            language_counts[language] = (
                language_counts.get(language, 0) + 1
            )

    sorted_languages = sorted(
        language_counts.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    top_repositories = sorted(
        repositories,
        key=lambda repo: (
            int(repo.get("stargazers_count", 0) or 0),
            int(repo.get("forks_count", 0) or 0),
        ),
        reverse=True,
    )[:10]

    repository_details = []

    for repo in repositories:
        repository_details.append(
            {
                "name": repo.get("name"),
                "full_name": repo.get("full_name"),
                "description": repo.get("description"),
                "language": repo.get("language"),
                "stars": int(
                    repo.get("stargazers_count", 0) or 0
                ),
                "forks": int(
                    repo.get("forks_count", 0) or 0
                ),
                "watchers": int(
                    repo.get("watchers_count", 0) or 0
                ),
                "fork": bool(repo.get("fork", False)),
                "url": repo.get("html_url"),
                "updated_at": repo.get("updated_at"),
            }
        )

    repository_count = len(repositories)

    average_stars = (
        round(total_stars / repository_count, 2)
        if repository_count
        else 0
    )

    average_forks = (
        round(total_forks / repository_count, 2)
        if repository_count
        else 0
    )

    return {
        "profile": {
            "login": profile.get("login"),
            "name": profile.get("name"),
            "avatar_url": profile.get("avatar_url"),
            "bio": profile.get("bio"),
            "location": profile.get("location"),
            "company": profile.get("company"),
            "blog": profile.get("blog"),
            "followers": int(
                profile.get("followers", 0) or 0
            ),
            "following": int(
                profile.get("following", 0) or 0
            ),
            "public_repos": int(
                profile.get("public_repos", 0) or 0
            ),
            "public_gists": int(
                profile.get("public_gists", 0) or 0
            ),
            "profile_url": profile.get("html_url"),
        },
        "stats": {
            "repository_count": repository_count,
            "total_stars": total_stars,
            "total_forks": total_forks,
            "average_stars": average_stars,
            "average_forks": average_forks,
            "original_repositories": len(
                original_repositories
            ),
            "forked_repositories": len(
                forked_repositories
            ),
        },
        "languages": [
            {
                "name": language,
                "count": count,
            }
            for language, count in sorted_languages
        ],
        "top_repositories": [
            {
                "name": repo.get("name"),
                "language": repo.get("language"),
                "stars": int(
                    repo.get("stargazers_count", 0) or 0
                ),
                "forks": int(
                    repo.get("forks_count", 0) or 0
                ),
                "url": repo.get("html_url"),
            }
            for repo in top_repositories
        ],
        "repositories": repository_details,
    }


def repositories_to_csv(data: Dict[str, Any]) -> str:
    """
    Convert analyzed repository information into CSV format.
    """

    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow(
        [
            "Repository",
            "Language",
            "Stars",
            "Forks",
            "Watchers",
            "Description",
            "URL",
            "Updated At",
        ]
    )

    for repo in data.get("repositories", []):
        writer.writerow(
            [
                repo.get("name", ""),
                repo.get("language", "") or "",
                repo.get("stars", 0),
                repo.get("forks", 0),
                repo.get("watchers", 0),
                repo.get("description", "") or "",
                repo.get("url", ""),
                repo.get("updated_at", "") or "",
            ]
        )

    return output.getvalue()