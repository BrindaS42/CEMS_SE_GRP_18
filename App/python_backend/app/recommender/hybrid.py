from app.recommender.content_based import recommend_events_for_user
from app.recommender.collaborative import recommend_collaborative
from app.recommender.demographic import recommend_demographic
from app.recommender.content_based import convert_object_ids  
from bson import ObjectId
from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["recm_test"]

def recommend_hybrid(profile_id: str, top_k=5):
    content_scores = recommend_events_for_user(profile_id, top_k * 2)
    collab_ids = recommend_collaborative(profile_id, top_k * 2)
    demo_ids = recommend_demographic(profile_id, top_k * 2)

    # Weighting system
    WEIGHTS = {
        "content": 0.6,
        "collab": 0.3,
        "demo": 0.1
    }

    final_scores = {}

    for item in content_scores:
        final_scores[item["event"]["_id"]] = WEIGHTS["content"] * (1 - item["score"]) 

    for eid in collab_ids:
        final_scores[eid] = final_scores.get(eid, 0) + WEIGHTS["collab"]

    for eid in demo_ids:
        final_scores[eid] = final_scores.get(eid, 0) + WEIGHTS["demo"]

    # Sort and fetch top events
    sorted_eids = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
    event_ids = [ObjectId(eid) for eid, _ in sorted_eids]

    events = list(db.event.find({"_id": {"$in": event_ids}}))

    id_to_event = {str(e["_id"]): e for e in events}
    ranked = [{"event": id_to_event[str(eid)], "score": score} for eid, score in sorted_eids if str(eid) in id_to_event]

    return convert_object_ids(ranked)

