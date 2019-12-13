from flask import Flask, Response, request, jsonify

from marshmallow import Schema, fields, post_load
from marshmallow.validate import Length

import json, shlex, os, globals, signal

app = Flask(__name__)

from api.queue import queue_bp
app.register_blueprint(queue_bp, url_prefix="/queue")

from api.job import job_bp
app.register_blueprint(job_bp, url_prefix="/job")


from werkzeug.exceptions import BadRequest
from marshmallow.exceptions import ValidationError

@app.errorhandler(BadRequest)
def handle_bad_request(e):
    return jsonify({"err": e.name}), 400

@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({"err": e.messages}), 400

class SetupSchema(Schema):
    nid = fields.Int(required=True)
    name = fields.Str(required=True, validate=Length(max=255))
    distributor = fields.Str(required=True, validate=Length(max=255))

    @post_load
    def load_setup(self, data, **kwargs):
        return {
            "nid": data["nid"],
            "name": data["name"],
            "distributor": data["distributor"]
        }

@app.route("/config", methods=["GET"])
def get_config():
    return jsonify({"err": None, "config": globals.config}), 200


@app.route("/setup", methods=["POST"])
def setup_node():
    setup = SetupSchema().load(request.json)

    globals.config = {**globals.config, **setup}
    with open("node_config.json", "w") as f:
        json.dump(globals.config, f)

    return jsonify({"err": None})

def run():
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)
