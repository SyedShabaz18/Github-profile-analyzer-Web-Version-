import csv
import io
from typing import Any, Dict, List

import requests

GITHUB_API = "https://api.github.com"
TIMEOUT = 15


class GitHubAPIError(Exception):
    """Raised when GitHub API returns an error."""


def github_get(path: str, params: Dict[str, Any] | None = None) -> Any:
    url = f"{GITHUB_API}{path}"
    response = requests.get(
        url,
        params=params,
        headers={
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "GitHub-Profile-Analyzer",
        },
        timeout=TIMEOUT,
    )

    if response.status_code == 404:
        raise GitHubAPIError("GitHub user or resource was not found.")

    if response.status_code == 403:
        raise GitHubAPIError(
            "GitHub API rate limit reached. Please wait and try again."
        )

    if not response.ok:
        raise GitHubAPIError(
            f"GitHub API returned status {response.status_code}."
        )

    return response.json()


def get_all_repositories(username: str) -> List[Dict[str, Any]]:
    """Fetch all public repositories using GitHub pagination."""
    repositories: List[Dict[str, Any]] = []
    page = 1

    while True:
        batch = github_get(
            f"/users/{username}/repos",
            params={
                "per_page": 100,
                "page": page,
                "sort": "updated",
                "direction": "desc",
            },
        )

        if not batch:
            break

        repositories.extend(batch)

        if len(batch) < 100:
            break

        page += 1

        # Safety guard for an unusually large account.
        if page > 20:
            break

    return repositories


def analyze_github_profile(username: str) -> Dict[str, Any]:
    username = username.strip()

    if not username:
        raise GitHubAPIError("Please enter a GitHub username.")

    profile = github_get(f"/users/{username}")
    repositories = get_all_repositories(username)

    total_stars = sum(repo.get("stargazers_count", 0) or 0 for repo in repositories)
    total_forks = sum(repo.get("forks_count", 0) or 0 for repo in repositories)

    language_counts: Dict[str, int] = {}
    for repo in repositories:
        language = repo.get("language")
        if language:
            language_counts[language] = language_counts.get(language, 0) + 1

    sorted_languages = sorted(
        language_counts.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    top_repositories = sorted(
        repositories,
        key=lambda repo: (
            repo.get("stargazers_count", 0) or 0,
            repo.get("forks_count", 0) or 0,
        ),
        reverse=True,
    )[:10]

    repository_rows = []
    for repo in repositories:
        repository_rows.append(
            {
                "name": repo.get("name"),
                "description": repo.get("description"),
                "language": repo.get("language"),
                "stars": repo.get("stargazers_count", 0),
                "forks": repo.get("forks_count", 0),
                "watchers": repo.get("watchers_count", 0),
                "size": repo.get("size", 0),
                "html_url": repo.get("html_url"),
                "updated_at": repo.get("updated_at"),
                "created_at": repo.get("created_at"),
                "is_fork": repo.get("fork", False),
                "default_branch": repo.get("default_branch"),
            }
        )

    return {
        "profile": {
            "login": profile.get("login"),
            "name": profile.get("name"),
            "bio": profile.get("bio"),
            "avatar_url": profile.get("avatar_url"),
            "html_url": profile.get("html_url"),
            "blog": profile.get("blog"),
            "company": profile.get("company"),
            "location": profile.get("location"),
            "email": profile.get("email"),
            "twitter_username": profile.get("twitter_username"),
            "followers": profile.get("followers", 0),
            "following": profile.get("following", 0),
            "public_repos": profile.get("public_repos", 0),
            "public_gists": profile.get("public_gists", 0),
            "account_created": profile.get("created_at"),
            "last_updated": profile.get("updated_at"),
        },
        "statistics": {
            "repository_count_fetched": len(repositories),
            "total_stars": total_stars,
            "total_forks": total_forks,
            "average_stars": round(total_stars / len(repositories), 2)
            if repositories
            else 0,
            "average_forks": round(total_forks / len(repositories), 2)
            if repositories
            else 0,
            "forked_repositories": sum(
                1 for repo in repositories if repo.get("fork")
            ),
            "original_repositories": sum(
                1 for repo in repositories if not repo.get("fork")
            ),
        },
        "languages": [
            {"name": name, "repositories": count}
            for name, count in sorted_languages
        ],
        "top_repositories": [
            {
                "name": repo.get("name"),
                "description": repo.get("description"),
                "language": repo.get("language"),
                "stars": repo.get("stargazers_count", 0),
                "forks": repo.get("forks_count", 0),
                "html_url": repo.get("html_url"),
            }
            for repo in top_repositories
        ],
        "repositories": repository_rows,
    }


def repositories_to_csv(data: Dict[str, Any]) -> str:
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

    for repo in data["repositories"]:
        writer.writerow(
            [
                repo["name"],
                repo["language"] or "Not specified",
                repo["stars"],
                repo["forks"],
                repo["watchers"],
                repo["description"] or "",
                repo["html_url"],
                repo["updated_at"],
            ]
        )

    return output.getvalue()
