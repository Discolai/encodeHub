from flask import Flask, Response, request, jsonify, Blueprint
import json

from api.db import get_db

blu = Blueprint("jobs", __name__)


@blu.route("/jobs", methods=["GET"])
def get_jobs():
    cur = get_db().cursor()

    cur.execute("select * from jobs;")
    jobs = [dict(job) for job in cur.fetchall()]
    if len(jobs):
        return jsonify({"err": None, "jobs": jobs}), 200
    else:
        return jsonify({"err": "Job queue is empty!", "jobs": None}), 404

@blu.route("/jobs", methods=["POST"])
def post_jobs():
    cur = get_db().cursor()
    jobs = request.get_json()
    if isinstance(jobs, list):
        for job in jobs:
            if isinstance(job, str):
                try:
                    cur.execute("insert into jobs (job) values (?)", (job,))
                except Exception as e:
                    return jsonify({"err": "Duplicate job entry {}".format(job)}), 400
            else:
                return jsonify({"err": "{} is an invalid job!".format(job)}), 400
        return jsonify({"err": None}), 200
    else:
        return jsonify({"err": "Wrong json formatting, expected array!"}), 400

@blu.route("/jobs/<jid>", methods=["DELETE"])
def delete_jobs(jid):
    cur = get_db().cursor()
    try:
        cur.execute("delete from jobs where jid=(?);", (jid,))
        return jsonify({"err": None}), 200
    except Exception as e:
        return jsonify({"err": str(e)}), 400

@blu.route("/jobs/oldest", methods=["PUT"])
def oldest_job():
    cur = get_db().cursor()

    node = request.get_json()
    if "name" not in node:
        return jsonify({"err": "No node specified!", "job": None}), 400

    cur.execute("select nid from nodes where name = ?;", (node["name"],))
    # fix index out of range
    nid = dict(cur.fetchall()[0])["nid"]
    if not nid:
        return jsonify({"err": "Could not find node: {}".format(node["name"])}), 404

    cur.execute("select jid, job, MIN(timestamp) as timestamp from jobs where nid is null;")
    job = dict(cur.fetchall()[0])

    if not job or not job["jid"]:
        return jsonify({"err": "Job queue is empty!"}), 404

    cur.execute("update jobs set nid = 1 where jid = ?;", (job["jid"],))
    return jsonify({"err": None, "job": job})
