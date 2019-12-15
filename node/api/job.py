from flask import Flask, Response, request, jsonify, Blueprint
from marshmallow import Schema, fields, post_load
from marshmallow.validate import Length

import api

job_bp = Blueprint("job", __name__)


@job_bp.route("/progress", methods=["GET"])
def progress():
    if len(api.progress_q) > 0:
        progress = api.progress_q[0]
        return jsonify({"err": None, "data": progress})
    else:
        return jsonify({"err": "No progress available", "data": None}), 404

@job_bp.route("/pause", methods=["POST"])
def pause():
    api.paused = not api.paused
    return jsonify({"err": None, "data": {"paused": api.paused}})


@job_bp.route("/stop", methods=["POST"])
def stop():
    api.stop = True
    return jsonify({"err": None})
