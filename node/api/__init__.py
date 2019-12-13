from flask import Flask, Response, request, jsonify

from marshmallow import Schema, fields, post_load
from marshmallow.validate import Length

import json, shlex, os, globals, signal

app = Flask(__name__)

from api.queue import queue_bp
app.register_blueprint(queue_bp, url_prefix="/queue")

from api.job import job_bp
app.register_blueprint(job_bp, url_prefix="/job")

from api.config import config_bp
app.register_blueprint(config_bp, url_prefix="/config")


from werkzeug.exceptions import BadRequest
from marshmallow.exceptions import ValidationError

@app.errorhandler(BadRequest)
def handle_bad_request(e):
    return jsonify({"err": e.name}), 400

@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({"err": e.messages}), 400

def run():
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)
