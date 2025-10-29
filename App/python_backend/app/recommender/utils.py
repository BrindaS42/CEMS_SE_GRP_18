import threading, time
from app.recommender.content_based import index_all_events

def start_periodic_rebuild(interval_hours=12):
    def job():
        while True:
            print("Rebuilding event embeddings...")
            index_all_events()
            time.sleep(interval_hours * 3600)
    threading.Thread(target=job, daemon=True).start()
