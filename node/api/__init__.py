from flask import Flask
from collections import deque
from flask_socketio import SocketIO, emit, send
import json, os
from api.queue import queue_bp
from api.job import job_bp
from api.config import config_bp

import eventlet
eventlet.monkey_patch()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

stop = False
paused = False
progress_q = deque()
job_q = deque()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(BASE_DIR, "config.json"), "r") as f:
    config = json.load(f)

app.register_blueprint(queue_bp, url_prefix="/queue")
app.register_blueprint(job_bp, url_prefix="/job")
app.register_blueprint(config_bp, url_prefix="/config")

import api.error_handlers

@app.after_request
def add_header(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

def run():
    socketio.run(app, host="0.0.0.0", port=config["api_port"])
