import numpy as np
from bson import ObjectId
from pymongo import MongoClient
from sklearn.metrics.pairwise import cosine_similarity
import os

MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["recm_test"]

def get_user_event_matrix():
    """Builds a binary user-event interaction matrix."""
    users = list(db.user.find({}, {"_id": 1}))
    events = list(db.event.find({"status": "Published"}, {"_id": 1}))

    user_index = {str(u["_id"]): i for i, u in enumerate(users)}
    event_index = {str(e["_id"]): j for j, e in enumerate(events)}

    matrix = np.zeros((len(users), len(events)))

    interactions = db.registration.find({})
    for inter in interactions:
        uid = str(inter["studentId"])
        eid = str(inter["eventId"])
        if uid in user_index and eid in event_index:
            matrix[user_index[uid], event_index[eid]] = 1

    return matrix, user_index, event_index, users, events


def recommend_collaborative(profile_id: str, top_k=5):
    matrix, user_index, event_index, users, events = get_user_event_matrix()

    if profile_id not in user_index:
        return []

    # compute user similarity
    user_sim = cosine_similarity(matrix)
    target_idx = user_index[profile_id]

    # find similar users
    sim_scores = user_sim[target_idx]
    similar_users = np.argsort(sim_scores)[::-1][1:6]

    # aggregate events those users interacted with
    event_scores = np.zeros(matrix.shape[1])
    for u_idx in similar_users:
        event_scores += matrix[u_idx]

    # remove events the current user already interacted with
    user_events = matrix[target_idx]
    event_scores = event_scores * (1 - user_events)

    top_indices = np.argsort(event_scores)[::-1][:top_k]

    recommended = [str(events[i]["_id"]) for i in top_indices if event_scores[i] > 0]
    return recommended
