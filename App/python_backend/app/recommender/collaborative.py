import numpy as np
from pymongo import MongoClient
from sklearn.metrics.pairwise import cosine_similarity
import os

MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["main"]


def get_user_ids_for_registration(reg):
    """
    Returns ALL user IDs involved in a registration.
    Handles:
    - Individual registration
    - Team registration with leader + members[]
    """

    users = set()

    # Individual user always exists (leader in team-mode)
    if "userId" in reg:
        users.add(str(reg["userId"]))

    # If team registration
    if "teamName" in reg and reg["teamName"]:
        team = db.studentteams.find_one({"_id": reg["teamName"]})

        if team:
            # Add team leader
            users.add(str(team["leader"]))

            # Add approved team members
            for m in team.get("members", []):
                if m["status"] == "Approved":
                    users.add(str(m["member"]))

    return users



def get_user_event_matrix():
    """Builds user × event matrix using ratings + registrations."""

    users = list(db.users.find({}, {"_id": 1}))
    events = list(db.events.find({"status": "published"}, {"_id": 1}))

    if len(users) == 0 or len(events) == 0:
        return None, None, None, users, events

    user_index = {str(u["_id"]): i for i, u in enumerate(users)}
    event_index = {str(e["_id"]): j for j, e in enumerate(events)}

    matrix = np.zeros((len(users), len(events)))

    for event in events:
        e_id = str(event["_id"])
        e_col = event_index[e_id]

        full_event = db.events.find_one({"_id": event["_id"]})

        # 1️⃣ Fill Ratings First
        for r in full_event.get("ratings", []):
            uid = str(r["by"])
            rating_value = r.get("rating", 0)

            if uid in user_index:
                matrix[user_index[uid], e_col] = rating_value  # rating 1–5

        # 2️⃣ Fill Registrations (only if user has no rating)
        regs = db.registrations.find({"eventId": event["_id"]})

        for reg in regs:
            user_ids = get_user_ids_for_registration(reg)

            for uid in user_ids:
                if uid in user_index:
                    # Don't overwrite rating
                    if matrix[user_index[uid], e_col] == 0:
                        matrix[user_index[uid], e_col] = 1  # registered = 1

    return matrix, user_index, event_index, users, events




def recommend_collaborative(profile_id: str, top_k=5):
    """Returns recommended event IDs using collaborative filtering."""
    
    matrix, user_index, event_index, users, events = get_user_event_matrix()

    if matrix is None:
        return []
    if profile_id not in user_index:
        return []
    if matrix.shape[1] == 0:
        return []
    if matrix.shape[0] < 2:
        return []

    # User similarity matrix
    user_sim = cosine_similarity(matrix)
    target_idx = user_index[profile_id]

    sim_scores = user_sim[target_idx]

    if np.all(sim_scores == 0):
        return []

    similar_users = np.argsort(sim_scores)[::-1][1:6]  # Top 5 similar users

    event_scores = np.zeros(matrix.shape[1])
    for u_idx in similar_users:
        event_scores += matrix[u_idx]

    # Remove already attended events
    user_events = matrix[target_idx]
    event_scores = event_scores * (1 - user_events)

    top_indices = np.argsort(event_scores)[::-1][:top_k]

    recommended = [
        str(events[i]["_id"])
        for i in top_indices
        if event_scores[i] > 0
    ]

    return recommended
