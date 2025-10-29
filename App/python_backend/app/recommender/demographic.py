from bson import ObjectId
from pymongo import MongoClient
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import os

MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["recm_test"]

def recommend_demographic(profile_id: str, top_k=5):
    users = list( db.profile.find({}, {"_id": 1, "gender": 1, "college": 1, "areasOfInterest": 1}))
    events = list(db.event.find({"status": "Published"}))

    profile =  db.profile.find_one({"_id": ObjectId(profile_id)})
    if not profile:
        return []

    # Represent demographics as vectors
    def vectorize(user):
        features = []
        features.append(user.get("gender", ""))
        features.append(user.get("college", ""))
        features.extend(user.get("areasOfInterest", []))
        return " ".join(features)

    user_vecs = [vectorize(u) for u in users]
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(user_vecs, normalize_embeddings=True)

    target_idx = [str(u["_id"]) for u in users].index(profile_id)
    sims = cosine_similarity([embeddings[target_idx]], embeddings)[0]

    similar_user_ids = [users[i]["_id"] for i in np.argsort(sims)[::-1][1:6]]

    interactions = db.registration.find({"studentId": {"$in": similar_user_ids}})
    event_counts = {}
    for inter in interactions:
        eid = str(inter["event_id"])
        event_counts[eid] = event_counts.get(eid, 0) + 1

    ranked = sorted(event_counts.items(), key=lambda x: x[1], reverse=True)[:top_k]
    return [eid for eid, _ in ranked]
