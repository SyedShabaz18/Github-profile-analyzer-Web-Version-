from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles

from .github_service import GitHubAPIError, analyze_github_profile, repositories_to_csv

app = FastAPI(
    title="GitHub Profile Analyzer",
    description="Analyze public GitHub profile and repository statistics.",
    version="1.0.0",
)

# Useful for local development and future separate frontend hosting.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "GitHub Profile Analyzer"}


@app.get("/api/analyze/{username}")
def analyze(username: str):
    try:
        return analyze_github_profile(username)
    except GitHubAPIError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while analyzing this GitHub profile.",
        )


@app.get("/api/analyze/{username}/csv")
def download_csv(username: str):
    try:
        data = analyze_github_profile(username)
        csv_text = repositories_to_csv(data)

        filename = f"{username}_github_repositories.csv"

        return Response(
            content=csv_text,
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            },
        )
    except GitHubAPIError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate the CSV report.",
        )


# Serve the frontend from the same FastAPI application.
app.mount(
    "/",
    StaticFiles(directory="frontend", html=True),
    name="frontend",
)
