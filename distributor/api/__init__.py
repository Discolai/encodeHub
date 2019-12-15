from flask import Flask
import json

with open("config.json") as f:
    config = json.load(f)

app = Flask(__name__)

from api.jobs import jobs_bp
from api.logs import logs_blu
from api.nodes import nodes_bp

app.register_blueprint(jobs_bp, url_prefix="/jobs")
app.register_blueprint(logs_blu, url_prefix="/logs")
app.register_blueprint(nodes_bp, url_prefix="/nodes")
