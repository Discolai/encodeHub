from flask import Flask, Response, request, jsonify, Blueprint
from marshmallow import Schema, fields, post_load
from marshmallow.validate import Length

from api.db import get_db

jobs_bp = Blueprint("jobs", __name__)

class JobSchema(Schema):
    job = fields.Str(required=True, validate=Length(max=255, min=5))

    @post_load
    def load_queue(self, data, **kwargs):
        return {
            "job": data["job"],
        }

class NodeSchema(Schema):
    nid = fields.Int(required=True)

    @post_load
    def load_node(self, data, **kwargs):
        return {
            "nid": data["nid"]
        }



@jobs_bp.route("/", methods=["GET"])
def get_jobs():
    cur = get_db().cursor()

    cur.execute("select * from jobs;")
    jobs = [dict(job) for job in cur.fetchall()]
    return jsonify({"err": None, "data": jobs}), 200


@jobs_bp.route("/", methods=["POST"])
def post_jobs():
    jobs = JobSchema(many=True).load(request.json)
    if not len(jobs):
        return jsonify({"err": "Empty request!"}), 400

    cur = get_db().cursor()
    for job in jobs:
        cur.execute("insert into jobs (job) values (?)", (job["job"],))
    return Response(), 201

@jobs_bp.route("/<int:jid>", methods=["DELETE"])
def delete_jobs(jid):
    cur = get_db().cursor()
    cur.execute("delete from jobs where jid=(?);", (jid,))
    return Response(), 204

@jobs_bp.route("/oldest", methods=["PUT"])
def oldest_job():
    node = NodeSchema().load(request.json)

    cur = get_db().cursor()

    cur.execute("select jid, job, MIN(timestamp) as timestamp from jobs where nid is null;")
    job = dict(cur.fetchall()[0])

    if job and job["jid"]:
        cur.execute("update jobs set nid = ? where jid = ?;", (node["nid"], job["jid"]))

    return jsonify({"err": None, "data": job})
