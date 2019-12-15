from flask import g
from api import app
import sqlite3

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect("/home/nikolai/Documents/encodeHub/db/jobs.db")
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.commit()
        db.close()
