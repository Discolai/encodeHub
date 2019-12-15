from flask import Flask
from collections import deque
import pickle, json
from api.queue import queue_bp
from api.job import job_bp
from api.config import config_bp

app = Flask(__name__)

with open("config.json", "r") as f:
    config = json.load(f)

stop = False

paused_pickle = "paused_pickle.pkl"
try:
    with open(paused_pickle, "rb") as f:
        paused = pickle.load(f)
except:
    paused = False

progress_q_pickle = "progress_q_pickle.pkl"
try:
    with open(progress_q_pickle, "rb") as f:
        progress_q = pickle.load(f)
except:
    progress_q = deque()


job_q_pickle = "job_q_pickle.pkl"
try:
    with open(job_q_pickle, "rb") as f:
        job_q = pickle.load(f)
except:
    job_q = deque()


app.register_blueprint(queue_bp, url_prefix="/queue")
app.register_blueprint(job_bp, url_prefix="/job")
app.register_blueprint(config_bp, url_prefix="/config")

import api.error_handlers

def run():
    from waitress import serve
    serve(app, host="0.0.0.0", port=config["api_port"])
