from flask import Flask, Response, request
import json, shlex
import globals

app = Flask(__name__)

@app.route("/status", methods=["GET"])
def status():
    if len(globals.out_queue) == 0:
        return Response(status=404)
    return Response(json.dumps(globals.out_queue.popleft()), mimetype="application/json")

@app.route("/jobs/<new_job>", methods=["GET", "POST"])
def jobs(new_job):
    if request.method == "GET":
        if len(globals.job_queue) == 0:
            return Response(status=404)
        job = globals.job_queue.popleft()
        globals.job_queue.appendleft(job)
        return Response(json.dumps(job), mimetype="application/json")
    else:
        globals.job_queue.append(shlex.quote(new_job))
        return Response(status=200)

@app.route("/job/pause", methods=["POST"])
def job():
    globals.pause = not globals.pause
    return Response(status=200)

def run():
    app.run()
