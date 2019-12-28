from flask import Flask, Response, request, jsonify, Blueprint
from marshmallow import Schema, fields, post_load, validates, ValidationError
from marshmallow.validate import Length
import os, requests
from api.db import get_db

jobs_bp = Blueprint("jobs", __name__)

class JobSchema(Schema):
    job = fields.Str(required=True, validate=Length(max=255, min=5))

    @validates("job")
    def validate_error(self, value):
        if not os.path.isfile(value):
            raise ValidationError("Job must be a file.")

class EditJobSchema(JobSchema):
    nid = fields.Int(required=True, allow_none=True)
    finished = fields.Bool(required=True)

class NodeSchema(Schema):
    nid = fields.Int(required=True)

@jobs_bp.route("/", methods=["GET"])
def get_jobs():
    cur = get_db().cursor()

    limit = request.args.get("limit", 20);
    start = request.args.get("start", 0);
    finished = request.args.get("finished", False);
    cur.execute("select * from jobs where finished=? limit ? offset ?;", (finished, limit, start))
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

@jobs_bp.route("/<int:jid>", methods=["POST"])
def update_jobs(jid):
    ejob = EditJobSchema().load(request.json)
    cur = get_db().cursor()

    cur.execute("select * from jobs where jid=?;", (jid, ))
    if not len(cur.fetchall()):
        return jsonify({"err": "Invalid jid!", "data": None}), 404

    cur.execute("update jobs set job=?, nid=?, finished=? where jid=(?);", (ejob["job"], ejob["nid"], + ejob["finished"], jid))
    return Response(), 204


@jobs_bp.route("/oldest", methods=["PUT"])
def oldest_job():
    node = NodeSchema().load(request.json)

    cur = get_db().cursor()

    cur.execute("select jid, job from jobs where nid is null and finished=0 limit 1;")
    job = [dict(row) for row in cur.fetchall()]

    if job and len(job):
        cur.execute("update jobs set nid = ? where jid = ?;", (node["nid"], job[0]["jid"]))

    return jsonify({"err": None, "data": job[0] if len(job) else None})
