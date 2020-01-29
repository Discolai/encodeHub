from flask import Flask, render_template, send_from_directory
from flask_socketio import SocketIO
from werkzeug.routing import BaseConverter
from flask_cors import CORS
import json, os, sqlite3

import eventlet
eventlet.monkey_patch()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(BASE_DIR, "config.json"), "r") as f:
    config = json.load(f)

db = os.path.join(BASE_DIR, config["database"])
if not os.path.isfile(db) or os.path.getsize(db) == 0 :
    with open(os.path.join(BASE_DIR, "../db/schema.sql"), "r") as f:
        schema = f.read()
    conn = sqlite3.connect(os.path.join(BASE_DIR, config["database"]))
    cur = conn.cursor()
    cur.executescript(schema)
    conn.commit()
    conn.close()

class RegexConverter(BaseConverter):
    def __init__(self, url_map, *items):
        super(RegexConverter, self).__init__(url_map)
        self.regex = items[0]

app = Flask(__name__, static_folder="../frontend/build")
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*", logger=True)

app.url_map.converters['regex'] = RegexConverter

from api.jobs import jobs_bp
from api.logs import logs_blu
from api.nodes import nodes_bp
from api.scans import scans_bp

app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
app.register_blueprint(logs_blu, url_prefix="/api/logs")
app.register_blueprint(nodes_bp, url_prefix="/api/nodes")
app.register_blueprint(scans_bp, url_prefix="/api/scans")

@app.route("/<regex('((?!api).)*$'):path>")
def react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')
