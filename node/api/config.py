from flask import Flask, Response, request, jsonify, Blueprint
from marshmallow import Schema, fields, post_load
from marshmallow.validate import Length

import globals, json

config_bp = Blueprint("config", __name__)

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


@config_bp.route("/", methods=["GET"])
def get_config():
    return jsonify({"err": None, "config": globals.config}), 200


@config_bp.route("/setup", methods=["POST"])
def setup_node():
    setup = SetupSchema().load(request.json)

    globals.config = {**globals.config, **setup}
    with open("node_config.json", "w") as f:
        json.dump(globals.config, f)

    return jsonify({"err": None})
