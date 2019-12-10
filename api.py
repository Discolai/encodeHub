from flask import Flask, Response, request, jsonify
import json, shlex
import globals

app = Flask(__name__)

@app.route("/enque/<new_job>", methods=["GET", "POST"])
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

@app.route("/pause", methods=["POST"])
def pause():
    globals.paused = not globals.paused
    return Response(status=200)

@app.route("/status", methods=["GET"])
def job():
    ret = {"paused": globals.paused}
    if len(globals.progress_q) > 0:
        progress = globals.progress_q.popleft()
        globals.progress_q.appendleft(progress)
        ret = {**ret, **progress}
    return jsonify(ret)


def run():
    app.run()
