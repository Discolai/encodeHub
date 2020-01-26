from flask import Flask, Response, request, jsonify, Blueprint
from marshmallow import Schema, fields, post_load
from marshmallow.validate import Length, Range
from marshmallow.exceptions import ValidationError
from api.db import get_db
from math import ceil

logs_blu = Blueprint("logs", __name__)

class LogSchema(Schema):
    nid = fields.Int(required=True)
    jid = fields.Int(required=True)
    drop_frames = fields.Int(required=True)
    dup_frames = fields.Int(required=True)
    elapsed_time_ms = fields.Int(required=True)
    video = fields.Int(required=True)
    audio = fields.Int(required=True)
    subtitle = fields.Int(required=True)
    global_headers = fields.Int(required=True)
    other_streams = fields.Int(required=True)
    lsize = fields.Int(required=True)
    prev_size = fields.Int(required=True)
    muxing_overhead = fields.Float(required=True)
    finished = fields.Bool(required=True)

class PagingSchema(Schema):
    page = fields.Int(required=True, validate=[Range(min=0, error="Pages start at 1")])
    pageSize = fields.Int(required=True, validate=[Range(min=10, max=100, error="Page size can be between 10 and 100")])

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

    pageSize = int(request.args.get("pageSize", 20));
    page = int(request.args.get("page", 1)) - 1; # subtract 1 so pages start at 0
    PagingSchema().load({"page": page, "pageSize": pageSize})

    cur.execute("select count(lid) as count from (select * from nodes where nid = ?) natural join logs;", (nid,))
    count = dict(cur.fetchall()[0])["count"]

    cur.execute("select * from (select * from nodes where nid = ?) natural join logs natural join jobs limit ? offset ?;", (nid,pageSize, int(page*pageSize)))
    logs = [dict(row) for row in cur.fetchall()]
    return jsonify({"err": None, "data": logs, "paging": {"currentPage": page+1, "totalResults": count, "pageSize": pageSize}})

@logs_blu.route("/", methods=["POST"])
def post_log_for():
    log = LogSchema().load(request.json)

    cur = get_db().cursor()
    params = ""
    vals = ""
    args = []
    for i, (key, val) in enumerate(log.items()):
        params += "{}{}".format(key, "," if i < len(log)-1 else "")
        vals += "?{}".format("," if i < len(log)-1 else "")
        args.append(val)

    sql = "insert into logs ({}) values ({});".format(params, vals)
    cur.execute(sql, tuple(args))
    if log["finished"]:
        cur.execute("update jobs set finished=1 where jid=?;", (log["jid"],))
    return Response(), 201
