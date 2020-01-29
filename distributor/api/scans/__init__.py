from flask import Flask, Response, request, jsonify, Blueprint
from marshmallow import Schema, fields, validates, ValidationError
from marshmallow.validate import Length, Range
from api.db import get_db
from api.scans.scan_dir import run
import os, threading, api

scans_bp = Blueprint("scans", __name__)

scan_thread = None
stop_thread = False

class ScanSchema(Schema):
    dir = fields.Str(required=True, validate=Length(max=255))

    @validates("dir")
    def validate_error(self, value):
        if not os.path.isdir(value):
            raise ValidationError("Scan directory not found")

class PagingSchema(Schema):
    page = fields.Int(required=True, validate=[Range(min=0, error="Pages start at 1")])
    pageSize = fields.Int(required=True, validate=[Range(min=10, max=100, error="Page size can be between 10 and 100")])

@scans_bp.route("/", methods=["GET"])
def get_scans():
    pageSize = int(request.args.get("pageSize", 20));
    page = int(request.args.get("page", 1)) - 1; # subtract 1 so pages start at 0
    PagingSchema().load({"page": page, "pageSize": pageSize})

    cur = get_db().cursor()

    cur.execute("select count(sid) as count from scans;")
    count = dict(cur.fetchall()[0])["count"]

    cur.execute("select * from scans limit ? offset ?;", (pageSize, int(page*pageSize)))
    scans  = [dict(row) for row in cur.fetchall()]
    return jsonify({"err": None, "data": scans, "paging": {"currentPage": page+1, "totalResults": count, "pageSize": pageSize}})

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

def broadcast_scan(scan):
    api.socketio.emit("scan", scan, broadcast=True, json=True, namespace="/data")

def broadcast_scan_status(scanning):
    api.socketio.emit("scan", {"scanning": scanning}, broadcast=True, json=True, namespace="/status")

@api.socketio.on("connect", namespace="/status")
def handle_scan_status():
    api.socketio.emit("scan", {"scanning": bool(scan_thread and scan_thread.isAlive())}, namespace="/status")

@api.socketio.on("scan", namespace="/status")
def handle_status_request():
    api.socketio.emit("scan", {"scanning": bool(scan_thread and scan_thread.isAlive())}, namespace="/status")

@scans_bp.route("/start", methods=["POST"])
def start_scan():
    scan = ScanSchema().load(request.json)

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
    broadcast_scan_status(True)
    return jsonify({"err": None, "data": scan}), 201


@scans_bp.route("/stop/<int:sid>", methods=["POST"])
def stop_scan(sid):
    cur = get_db().cursor()
    cur.execute("select * from scans where sid = ? and stop is not null;", (sid,))
    if not scan_thread or len(cur.fetchall()):
        return jsonify({"err": "Scan has already stopped!"}), 403

    global stop_thread
    stop_thread = True
    scan_thread.join()
    stop_thread = False
    return Response()
