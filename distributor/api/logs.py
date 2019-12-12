from flask import Flask, Response, request, jsonify, Blueprint

from api.db import get_db

blu = Blueprint("logs", __name__)

@blu.route("/logs/<node>", methods=["GET"])
def get_logs(node):
    cur = get_db().cursor()
    sql = (
        "select * from logs as l"
        "join (select * from nodes where name = ?)"
        " as n on l.node = n.id;"
    )
    cur.execute("select * from logs natural join (select * from nodes where name = ?)", (node,))
    logs = [dict(row) for row in cur.fetchall()]

    if len(logs):
        return jsonify({"err": None, "logs": logs}), 200
    else:
        return jsonify({"err": "{} has no logs".format(node), "logs": None}), 404


@blu.route("/logs/<node>", methods=["POST"])
def post_log(node):
    cur = get_db().cursor()

    # Get the node's id
    cur.execute("select nid from nodes where name = ?;", (node,))
    nid = dict(cur.fetchall()[0])["nid"]
    if not nid:
        return jsonify({"err": "Could not find node: {}".format(node)}), 404
    l = request.get_json()
    args = (
        nid, l["frame"], l["fps"], l["speed"], l["bitrate"], l["drop_frames"],
        l["dup_frames"], l["stream"], l["elapsed_time"], l["out_time"],
        l["remaining_time"], l["percentage"], l["progress"], l["video"],
        l["audio"], l["subtitle"], l["global_headers"], l["other_streams"],
        l["total_size"], l["muxing_overhead"]
    )
    sql = (
        "insert into logs "
        "(nid, frame, fps, speed, bitrate, drop_frames, dup_frames, stream,"
        "elapsed_time, out_time, remaining_time, percentage, progress,"
        "video, audio, subtitle, global_headers, other_streams, total_size, muxing_overhead) "
        "values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
    )
    cur.execute(sql, args)
    return jsonify({"err": None}), 200
