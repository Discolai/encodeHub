from api import app
from flask import jsonify
from werkzeug.exceptions import BadRequest
from marshmallow.exceptions import ValidationError

@app.errorhandler(BadRequest)
def handle_bad_request(e):
    return jsonify({"err": e.name}), 400

@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({"err": e.messages}), 400
