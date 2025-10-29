from fastapi import FastAPI
from app.router import recommender_router
from app.recommender.utils import start_periodic_rebuild

app = FastAPI(title="Backend that handles AI/ML part")

app.include_router(recommender_router.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Recommendation System"}

