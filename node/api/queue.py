from flask import Flask, Response, request, jsonify, Blueprint
from marshmallow import Schema, fields, post_load
from marshmallow.validate import Length

import api

queue_bp = Blueprint("queue", __name__)

class JobSchema(Schema):
    jid = fields.Int(required=True)
    job = fields.Str(required=True, validate=Length(max=255, min=5))
    timestamp = fields.DateTime(required=True)

    @post_load
    def load_queue(self, data, **kwargs):
        return {
            "jid": data["jid"],
            "job": data["job"],
            "timestamp": data["timestamp"]
        }

@queue_bp.route("/", methods=["POST"])
def enque():
    nj = JobSchema().load(request.json)

    api.job_q.append(nj)
    return jsonify({"err": None})

@queue_bp.route("/", methods=["DELETE"])
def deque():
    try:
        job = api.job_q.popleft()
        return jsonify({"err": None, "job": job}), 200
    except:
        return jsonify({"err": "Job queue is empty", "job": None}), 404

@queue_bp.route("/", methods=["GET"])
def get_queue():
    jobs = list(api.job_q)
    if len(jobs):
        return jsonify({"err": None, "jobs": jobs}), 200
    else:
        return jsonify({"err": "Job queue is empty", "jobs": None}), 404
