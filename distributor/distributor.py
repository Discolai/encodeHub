from flask import Flask, Response, request, jsonify, g
import json, shlex, sqlite3, requests, socket
import globals

DATABASE = "./db/jobs.db"
PORT = 3000
app = Flask(__name__)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.commit()
        db.close()

@app.route("/jobs/<jid>", methods=["DELETE"])
def delete(jid):
    cur = get_db().cursor()
    try:
        cur.execute("delete from jobs where jid=(?);", (jid,))
        return jsonify({"err": None}), 200
    except Exception as e:
        return jsonify({"err": str(e)}), 400

@app.route("/jobs", methods=["POST"])
def insert():
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

@app.route("/jobs", methods=["GET"])
def jobs():
    cur = get_db().cursor()

    cur.execute("select * from jobs;")
    jobs = [dict(job) for job in cur.fetchall()]
    if len(jobs):
        return jsonify({"err": None, "jobs": jobs}), 200
    else:
        return jsonify({"err": "Job queue is empty!", "jobs": None}), 404

@app.route("/jobs/oldest", methods=["PUT"])
def oldest():
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

@app.route("/nodes", methods=["GET"])
def get_nodes():
    cur = get_db().cursor()
    cur.execute("select * from nodes;")
    nodes = [dict(node) for node in cur.fetchall()]
    if len(nodes):
        return jsonify({"err": None, "nodes": nodes}), 200
    else:
        return jsonify({"err": "No nodes registered!", "nodes": None}), 404

@app.route("/nodes", methods=["POST"])
def create_node():
    body = request.get_json()

    if not all(key in ["name", "address"] for key in body):
        return jsonify({"err": "Please specify a name and an address!", "node": None}), 400

    cur = get_db().cursor()
    try:
        cur.execute("insert into nodes (name, address) values (?,?);", (body["name"], body["address"]))
    except Exception as e:
        return jsonify({"err": str(e), "node": None})

    return jsonify({
            "err": None,
            "node": {"nid": cur.lastrowid, "name": body["name"], "address": body["address"]}
            })

@app.route("/nodes/init/<nid>", methods=["POST"])
def init_node(nid):
    cur = get_db().cursor()
    cur.execute("select * from nodes where nid=?;", (nid,))

    if not cur.rowcount:
        return jsonify({"err": "Invalid nid!"}), 400

    node = dict(cur.fetchall()[0])
    payload = {
        "nid": node["nid"],
        "name": node["name"],
        "distributor": "http://{}:{}".format(get_ip_address(), PORT)
    }
    try:
        r = requests.post(node["address"]+"/init", json=payload)
    except Exception as e:
        return jsonify({"err": "Unable to contact node!"}), 404
    if r.status_code != 200:
        return jsonify(r.text), r.status_code
    return jsonify({"err": None}), 200


def get_ip_address():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    return s.getsockname()[0]

@app.route("/logs/<node>", methods=["GET"])
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


@app.route("/logs/<node>", methods=["POST"])
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

def main():
    from waitress import serve
    serve(app, host="0.0.0.0", port=PORT)

if __name__ == '__main__':
    main()
