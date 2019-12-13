from flask import Flask, Response, request, jsonify, Blueprint
from marshmallow import Schema, fields, post_load
from marshmallow.validate import Length

import globals

job_bp = Blueprint("job", __name__)


@job_bp.route("/progress", methods=["GET"])
def progress():
    if len(globals.progress_q) > 0:
        progress = globals.progress_q[0]
        return jsonify({"err": None, "progress": progress})
    else:
        return jsonify({"err": "No progress available", "progress": None}), 404

@job_bp.route("/pause", methods=["POST"])
def pause():
    globals.paused = not globals.paused
    return jsonify({"err": None, "paused": globals.paused})


@job_bp.route("/stop", methods=["POST"])
def stop():
    globals.stop = True
    return jsonify({"err": None})
