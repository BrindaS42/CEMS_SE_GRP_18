import numpy as np
from bson import ObjectId
from pymongo import MongoClient
from sklearn.metrics.pairwise import cosine_similarity
from google import genai
from google.genai import types
import os

MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["staging"]

client = genai.Client()


def recommend_demographic(profile_id: str, top_k=5):

    # --- Fetch all users with profile + college info ---
    pipeline = [
        {
            "$lookup": {
                "from": "colleges",
                "localField": "college",
                "foreignField": "_id",
                "as": "college_obj"
            }
        },
        {"$unwind": {"path": "$college_obj", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": 1,
                "collegeName": "$college_obj.name",
                "collegeCode": "$college_obj.code",
                "areasOfInterest": "$profile.areasOfInterest",
            }
        }
    ]

    users = list(db.users.aggregate(pipeline))

    # Safety: must have at least 2 users
    if len(users) < 2:
        return []

    # Identify the target user
    if not ObjectId.is_valid(profile_id):
        return []

    profile_id = ObjectId(profile_id)
    if not any(u["_id"] == profile_id for u in users):
        return []

    # ---- Vectorize demographic info ----
    def vectorize(u):
        features = []

        # College features
        features.append(str(u.get("collegeName", "")))
        features.append(str(u.get("collegeCode", "")))

        # Interests
        aois = u.get("areasOfInterest", [])
        if aois:
            features.extend([str(a) for a in aois])

        return " ".join(features)

    # Create embeddings
    user_strings = [vectorize(u) for u in users]
    try:
        response = client.models.embed_content(
            model='gemini-embedding-001',
            # Pass the list of all user strings
            contents=user_strings,
            config=types.EmbedContentConfig(
                task_type='SEMANTIC_SIMILARITY',
                # Truncate the output vector size for efficiency
                output_dimensionality=768 
            )
        )
        # Extract the list of embedding vectors from the response object
        embeddings_list = [e.values for e in response.embeddings]
        # Convert the list of embeddings to a numpy array
        embeddings = np.array(embeddings_list)
        
    except Exception as e:
        print(f"Error generating Gemini embeddings: {e}")
        return [] # Return empty list on critical embedding error

    # Target user index
    target_index = next(i for i, u in enumerate(users) if u["_id"] == profile_id)

    # Similarity scores
    sims = cosine_similarity([embeddings[target_index]], embeddings)[0]

    # Pick top similar users EXCEPT the user itself
    similar_user_ids = [
        users[i]["_id"]
        for i in np.argsort(sims)[::-1][1:6]  # top 5 excluding self
    ]

    # --- Fetch registrations of similar users ---
    interactions = db.registrations.find({
        "userId": {"$in": similar_user_ids}
    })

    event_counts = {}
    for inter in interactions:
        eid = str(inter["eventId"])
        event_counts[eid] = event_counts.get(eid, 0) + 1

    # --- Return ranked events ---
    ranked = sorted(event_counts.items(), key=lambda x: x[1], reverse=True)

    return [eid for eid, _ in ranked[:top_k]]
