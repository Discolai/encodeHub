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

@app.route("/jobs/<job>", methods=["DELETE", "POST"])
def insert(job):
    cur = get_db().cursor()
    if request.method == "POST":
        try:
            cur.execute("insert into jobs (job) values (?);", (job,))
            return jsonify({"err": None}), 201
        except Exception as e:
            return jsonify({"err": str(e)}), 400


@app.route("/jobs/oldest", methods=["PUT"])
def jobs():
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
