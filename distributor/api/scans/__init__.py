from flask import Flask, Response, request, jsonify, Blueprint
from marshmallow import Schema, fields, post_load
from marshmallow.validate import Length
from api.db import get_db
from api.scans.scan_dir import run
import os, threading

scans_bp = Blueprint("scans", __name__)

scan_thread = None
stop_thread = False

class ScanSchema(Schema):
    dir = fields.Str(required=True, validate=Length(max=255))

@scans_bp.route("/", methods=["GET"])
def get_scans():
    cur = get_db().cursor()
    cur.execute("select * from scans;")
    scans  = [dict(row) for row in cur.fetchall()]
    return jsonify({"err": None, "data": scans})

@scans_bp.route("/<int:sid>", methods=["GET"])
def get_scan(sid):
    cur = get_db().cursor()
    cur.execute("select * from scans where sid= ?;", (sid,))
    scan  = [dict(row) for row in cur.fetchall()]
    if len(scan):
        return jsonify({"err": None, "data": scan[0]})
    return jsonify({"err": "Invalid sid {}".format(sid), "data": None})

@scans_bp.route("/running", methods=["GET"])
def get_running():
    cur = get_db().cursor()
    cur.execute("select * from scans where stop is null;")
    scan  = [dict(row) for row in cur.fetchall()]
    if len(scan):
        return jsonify({"err": None, "data": scan[0]})
    return jsonify({"err": "No scan is running!", "data": None})

@scans_bp.route("/start", methods=["POST"])
def start_scan():
    scan = ScanSchema().load(request.json)
    if not os.path.isdir(scan["dir"]):
        return jsonify({"err": "{} is not a directory!".format(scan["dir"])})

    cur = get_db().cursor()
    cur.execute("select * from scans where stop is null;")
    if len(cur.fetchall()):
        return jsonify({"err": "A scan is already running!", "data": None}), 403

    cur.execute("insert into scans (dir) values (?);", (scan["dir"],))

    cur.execute("select * from scans where sid = ?;", (cur.lastrowid,))
    scan  = [dict(row) for row in cur.fetchall()][0]

    global scan_thread
    global stop_thread
    scan_thread = threading.Thread(target=run, daemon=True, args=(lambda : stop_thread, scan["sid"], scan["dir"]))
    scan_thread.start()

    return jsonify({"err": None, "data": scan}), 201


@scans_bp.route("/stop/<int:sid>", methods=["POST"])
def stop_scan(sid):
    cur = get_db().cursor()
    cur.execute("select * from scans where sid = ? and stop is not null;", (sid,))
    if not scan_thread or len(cur.fetchall()):
        return jsonify({"err": "Scan has already stopped!"}), 403

    global stop_thread
    global scan_thread
    stop_thread = True
    scan_thread.join()
    return Response()
