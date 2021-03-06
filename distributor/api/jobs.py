from flask import Flask, Response, request, jsonify, Blueprint
from marshmallow import Schema, fields, post_load, validates, ValidationError
from marshmallow.validate import Length, Range
from math import ceil
import os, requests
from api.db import get_db

jobs_bp = Blueprint("jobs", __name__)

class JobSchema(Schema):
    job = fields.Str(required=True, validate=Length(max=255, min=5))
    nid = fields.Int(required=True, allow_none=True)
    finished = fields.Bool(required=True)

    @validates("job")
    def validate_error(self, value):
        if not os.path.isfile(value):
            raise ValidationError("Job must be a file.")

class NodeSchema(Schema):
    nid = fields.Int(required=True)

class PagingSchema(Schema):
    page = fields.Int(required=True, validate=[Range(min=0, error="Pages start at 1")])
    pageSize = fields.Int(required=True, validate=[Range(min=10, max=100, error="Page size can be between 10 and 100")])

@jobs_bp.route("/", methods=["GET"])
def get_jobs():
    cur = get_db().cursor()

    finished = request.args.get("finished", False);
    pageSize = int(request.args.get("pageSize", 20));
    page = int(request.args.get("page", 1)) - 1; # subtract 1 so pages start at 0
    PagingSchema().load({"page": page, "pageSize": pageSize})

    cur.execute("select count(jid) as count from jobs where finished=?;", (finished,))
    count = dict(cur.fetchall()[0])["count"]

    cur.execute("select * from jobs natural left join nodes where finished=? limit ? offset ?;", (finished, pageSize, int(page*pageSize)))
    jobs = [dict(job) for job in cur.fetchall()]
    return jsonify({"err": None, "data": jobs, "paging": {"currentPage": page+1, "totalResults": count, "pageSize": pageSize}}), 200


@jobs_bp.route("/", methods=["POST"])
def post_jobs():
    jobs = JobSchema(many=True).load(request.json)

    cur = get_db().cursor()
    for job in jobs:
        cur.execute("insert into jobs (job,nid,finished) values (?,?,?)", (job["job"],job["nid"],job["finished"]))
    return Response(), 201

@jobs_bp.route("/<int:jid>", methods=["DELETE"])
def delete_jobs(jid):
    cur = get_db().cursor()
    cur.execute("delete from jobs where jid=(?);", (jid,))
    return Response(), 204

@jobs_bp.route("/<int:jid>", methods=["POST"])
def update_jobs(jid):
    ejob = JobSchema().load(request.json)
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

    cur.execute("select jid, job from jobs where nid=? and finished=0 limit 1;", (node["nid"],))
    job = [dict(row) for row in cur.fetchall()]
    if not job or not len(job):
        cur.execute("select jid, job from jobs where nid is null and finished=0 limit 1;")
        job = [dict(row) for row in cur.fetchall()]

    if job and len(job):
        cur.execute("update jobs set nid = ? where jid = ?;", (node["nid"], job[0]["jid"]))

    return jsonify({"err": None, "data": job[0] if len(job) else None})
