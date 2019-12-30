from flask import Flask, render_template
import json

with open("config.json") as f:
    config = json.load(f)

app = Flask(__name__, static_folder="../frontend/build/static", template_folder="../frontend/build")

from api.jobs import jobs_bp
from api.logs import logs_blu
from api.nodes import nodes_bp
from api.scans import scans_bp

app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
app.register_blueprint(logs_blu, url_prefix="/api/logs")
app.register_blueprint(nodes_bp, url_prefix="/api/nodes")
app.register_blueprint(scans_bp, url_prefix="/api/scans")

@app.after_request
def add_header(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route("/")
def react():
    return render_template('index.html')
