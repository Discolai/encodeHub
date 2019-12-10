from flask import Flask, Response, request, jsonify
import json, shlex
import globals

app = Flask(__name__)

@app.route("/status", methods=["GET"])
def status():
    if len(globals.progress_q) == 0:
        return Response(status=404)
    return jsonify(globals.progress_q.popleft())

@app.route("/jobs/<new_job>", methods=["GET", "POST"])
def jobs(new_job):
    if request.method == "GET":
        if len(globals.job_q) == 0:
            return Response(status=404)
        job = globals.job_q.popleft()
        globals.job_q.appendleft(job)
        return jsonify(job)
    else:
        globals.job_q.append(shlex.quote(new_job))
        return Response(status=200)

@app.route("/job/pause", methods=["GET", "POST"])
def job():
    if request.method == "GET":
        return jsonify(globals.paused)
    else:
        globals.paused = not globals.paused
        return Response(status=200)


def run():
    app.run()
