from flask import Flask, Response, request, jsonify
import json, shlex, os, globals, signal

app = Flask(__name__)

@app.route("/enque", methods=["POST"])
def enque():
    nj = request.get_json()
    if nj and "job" in nj and isinstance(nj["job"], list) and len(nj["job"]) == 3:
        nj["job"][1] = shlex.quote(nj["job"][1])
        globals.job_q.append(nj["job"])
        return jsonify({"err": None}), 200
    else:
        return jsonify({"err": "Invalid json"}), 400

@app.route("/deque", methods=["POST"])
def deque():
    try:
        job = globals.job_q.popleft()
        return jsonify({"err": None, "job": job}), 200
    except:
        return jsonify({"err": "Job queue is empty", "job": None}), 404

@app.route("/queue", methods=["GET"])
def queue():
    jobs = list(globals.job_q)
    if len(jobs):
        return jsonify({"err": None, "jobs": jobs}), 200
    else:
        return jsonify({"err": "Job queue is empty", "jobs": None}), 404


@app.route("/progress", methods=["GET"])
def progress():
    ret = {"paused": globals.paused}
    if len(globals.progress_q) > 0:
        progress = globals.progress_q[0]
        return jsonify({"err": None, "progress": progress})
    else:
        return jsonify({"err": "No progress available", "progress": None}), 404

@app.route("/pause", methods=["POST"])
def pause():
    globals.paused = not globals.paused
    return jsonify({"err": None, "paused": globals.paused}), 200

@app.route("/stop", methods=["POST"])
def stop():
    globals.stop = True
    return Response(status=204)

def run():
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)
