import os
import uuid
from bson import ObjectId
from pymongo import MongoClient
from fastapi.encoders import jsonable_encoder
from sentence_transformers import SentenceTransformer
from qdrant_client.http import models as qmodels
from app.config.qdrant import qdrant_client, COLLECTION_NAME, VECTOR_SIZE

MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["test"]

model = SentenceTransformer("all-mpnet-base-v2")

def get_embedding(text: str):
    """Generate MiniLM embeddings (locally)."""
    if not text or not text.strip():
        return [0.0] * VECTOR_SIZE
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()

def setup_collection():
    collections = qdrant_client.get_collections().collections
    existing = [c.name for c in collections]
    if COLLECTION_NAME not in existing:
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=qmodels.VectorParams(size=VECTOR_SIZE, distance="Cosine")
        )
        print(f"Created collection '{COLLECTION_NAME}'")
        qdrant_client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="event_id",
            field_schema=qmodels.PayloadSchemaType.KEYWORD,
        )
        print(f"Created payload index for 'event_id' in collection '{COLLECTION_NAME}'")

# Building event genome 
def build_event_genome(event):
    title = event.get("title", "")
    desc = event.get("description", "")
    tags = " ".join(event.get("categoryTags", []))

    # Strong signals
    enhanced_tags = " ".join([tag for tag in event.get("categoryTags", [])] * 3)

    genome = f"""
        {title}.
        {desc}.
        Categories: {tags}.
        Focus Areas: {enhanced_tags}.
    """

    return genome

# Index all events 
def index_all_events():
    try:
        qdrant_client.delete_collection(collection_name=COLLECTION_NAME)
        print(f"Deleted existing collection '{COLLECTION_NAME}'")
    except Exception:
        print("No previous collection found")

    setup_collection()
    events = list( db.events.find({"status": "published"}))
    points = []
    for ev in events:
        genome = build_event_genome(ev)
        embedding = get_embedding(genome)
        points.append(
            qmodels.PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload={"event_id": str(ev["_id"])}
            )
        )
    if points:
        qdrant_client.upsert(collection_name=COLLECTION_NAME, points=points)
    print(f"Indexed {len(points)} events into Qdrant")

# Incremental Add / Delete
def add_event(event_id: str):
    event =  db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        print(f"No event found for ID {event_id}")
        return
    genome = build_event_genome(event)
    embedding = get_embedding(genome)
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            qmodels.PointStruct(
                id=str(uuid.uuid4()),  
                vector=embedding,
                payload={"event_id": str(event_id)}
            )
        ]
    )
    print(f"Added event {event_id}")

def delete_event(event_id: str):
    """Delete event from Qdrant by matching payload event_id."""
    qdrant_client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=qmodels.FilterSelector(
            filter=qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="event_id",
                        match=qmodels.MatchValue(value=str(event_id))
                    )
                ]
            )
        )
    )
    print(f"Deleted event with event_id={event_id}")

# helper function
def convert_object_ids(obj):
    """Recursively convert ObjectIds to strings inside dicts/lists."""
    if isinstance(obj, list):
        return [convert_object_ids(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: convert_object_ids(v) for k, v in obj.items()}
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj

# content based recommendation
def recommend_events_for_user(profile_id: str, top_k=5):

    profile = db.users.find_one({"_id": ObjectId(profile_id)})
    if not profile:
        return []

    profile_data = profile.get("profile", {})

    # Extract areasOfInterest and pastAchievements
    interests = " ".join(profile_data.get("areasOfInterest", []))

    achievements = " ".join(
        [(a.get("title", "") + " " + a.get("description", "")) 
         for a in profile_data.get("pastAchievements", [])]
    )

    user_genome = (interests + " ") * 3 + achievements
    print("USER GENOME:", user_genome)

    user_embedding = get_embedding(user_genome)

    # VECTOR SEARCH (not .query)
    res = qdrant_client.search(
        collection_name=COLLECTION_NAME,
        query_vector=user_embedding,
        limit=top_k,
        with_payload=True
    )

    ranked_results = []

    for hit in res:
        event_id = ObjectId(hit.payload["event_id"])
        event = db.events.find_one({"_id": event_id})

        if not event:
            continue


        ranked_results.append({
            "event": convert_object_ids(event),
            "score": float(hit.score)
        })

    ranked_results.sort(key=lambda x: x["score"], reverse=True)

    return ranked_results