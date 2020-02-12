from flask import Flask, Response, request, jsonify, Blueprint
from marshmallow import Schema, fields, post_load
from marshmallow.validate import Length

import api, json, os

config_bp = Blueprint("config", __name__)

class SetupSchema(Schema):
    nid = fields.Int(required=True)
    name = fields.Str(required=True, validate=Length(max=255))
    distributor = fields.Str(required=True, validate=Length(max=255))

@config_bp.route("/", methods=["GET"])
def get_config():
    return jsonify({"err": None, "data": api.config}), 200


@config_bp.route("/setup", methods=["POST"])
def setup_node():
    setup = SetupSchema().load(request.json)

    api.config = {**api.config, **setup}
    with open(os.path.join(api.BASE_DIR, api.CONFIG_PATH), "w") as f:
        config = json.dump(api.config, f, indent="\t", separators=(',', ': '))

    return jsonify({"err": None})
