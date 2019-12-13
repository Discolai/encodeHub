from flask import Flask

app = Flask(__name__)

from api.queue import queue_bp
app.register_blueprint(queue_bp, url_prefix="/queue")

from api.job import job_bp
app.register_blueprint(job_bp, url_prefix="/job")

from api.config import config_bp
app.register_blueprint(config_bp, url_prefix="/config")

import api.error_handlers

def run():
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)
