from flask import Flask, Response, request, jsonify, g
import json, shlex, sqlite3
import globals

DATABASE = "./db/jobs.db"
app = Flask(__name__)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.commit()
        db.close()

@app.route("/jobs/<id>", methods=["DELETE"])
def delete(id):
    cur = get_db().cursor()
    try:
        cur.execute("delete from jobs where id=(?);", (id,))
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
                    return jsonify({"err": str(e)}), 500
            else:
                return jsonify({"err": "\"{}\" is an invalid job!"}), 400
        return jsonify({"err": None}), 200
    else:
        return jsonify({"err": "Wrong json formatting, expected array!"}), 400

@app.route("/jobs", methods=["GET"])
def jobs():
    cur = get_db().cursor()

    cur.execute("select * from jobs;")
    jobs = cur.fetchall()
    if len(jobs):
        return jsonify({"err": None, "jobs": jobs}), 200
    else:
        return jsonify({"err": "Job queue is empty!", "jobs": None}), 404

@app.route("/jobs/oldest", methods=["PUT"])
def oldest():
    cur = get_db().cursor()

    cur.execute("select id, job, MIN(timestamp) from jobs where processing = 0;")
    job = cur.fetchall()
    if job and job[0] and job[0][0]:
        try:
            cur.execute("update jobs set processing = 1 where id = ?;", (job[0][0],))
            return jsonify({"err": None, "job": job[0]})
        except Exception as e:
            return jsonify({"err": str(e)}), 400
    return jsonify({"err": None}), 204


def main():
    from waitress import serve
    serve(app, host="0.0.0.0", port=3000)

if __name__ == '__main__':
    main()
