from flask import Flask, Response, request, jsonify, Blueprint
from marshmallow import Schema, fields, validates, ValidationError
from marshmallow.validate import Length

import api, os

queue_bp = Blueprint("queue", __name__)

class JobSchema(Schema):
    jid = fields.Int(required=True)
    job = fields.Str(required=True, validate=Length(max=255, min=5))
    nid = fields.Int(required=True)
    finished = fields.Int(required=True)

    @validates("job")
    def validate_error(self, value):
        if not os.path.isfile(value):
            raise ValidationError("Job must be a file.")

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

@queue_bp.route("/<int:jid>", methods=["DELETE"])
def pop_item(jid):
    res = None
    for i, job in enumerate(api.job_q):
        if job["jid"] == jid:
            res = job
            del(api.job_q[i])
            break
    if res:
        return jsonify({"err": None, "data": res})
    else:
        return jsonify({"err": "Could not find jid!", "data": res}), 404


@queue_bp.route("/", methods=["GET"])
def get_queue():
    return jsonify({"err": None, "jobs": list(api.job_q)}), 200
