from flask import Flask, Response, request, jsonify, Blueprint
from marshmallow import Schema, fields, post_load
from marshmallow.validate import Length
from api.db import get_db

logs_blu = Blueprint("logs", __name__)

class LogSchema(Schema):
    frame = fields.Int(required=True)
    fps = fields.Float(required=True)
    speed = fields.Float(required=True)
    bitrate = fields.Float(required=True)
    drop_frames = fields.Int(required=True)
    dup_frames = fields.Int(required=True)
    stream = fields.Str(required=True, validate=Length(max=10))
    elapsed_time = fields.Str(required=True)
    out_time = fields.Str(required=True)
    remaining_time = fields.Str(required=True)
    percentage = fields.Int(required=True)
    progress = fields.Str(required=True, validate=Length(max=10))
    video = fields.Int(required=True)
    audio = fields.Int(required=True)
    subtitle = fields.Int(required=True)
    global_headers = fields.Int(required=True)
    other_streams = fields.Int(required=True)
    total_size = fields.Int(required=True)
    muxing_overhead = fields.Float(required=True)


@logs_blu.route("/", methods=["GET"])
def get_logs():
    cur = get_db().cursor()
    cur.execute("select * from logs;")
    logs = [dict(row) for row in cur.fetchall()]
    return jsonify({"err": None, "data": logs})

@logs_blu.route("/<int:lid>", methods=["DELETE"])
def delete_log(lid):
    cur = get_db().cursor()
    cur.execute("delete from logs where lid = ?;", (lid,))
    return Response(), 204

@logs_blu.route("/node/<int:nid>", methods=["GET"])
def get_logs_for(nid):
    cur = get_db().cursor()
    cur.execute("select * from (select * from nodes where nid = ?) natural join logs;", (nid,))
    logs = [dict(row) for row in cur.fetchall()]
    return jsonify({"err": None, "data": logs})

@logs_blu.route("/node/<int:nid>", methods=["POST"])
def post_log_for(nid):
    log = LogSchema().load(request.json)

    cur = get_db().cursor()
    params = "nid"
    vals = "?"
    args = [nid]
    for key, val in log.items():
        params += ",{}".format(key)
        vals += ",?"
        args.append(val)

    sql = "insert into logs ({}) values ({});".format(params, vals)
    cur.execute(sql, tuple(args))
    return Response(), 201
