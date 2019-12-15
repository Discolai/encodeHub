from api import app
from flask import jsonify
from werkzeug.exceptions import BadRequest, HTTPException
from marshmallow.exceptions import ValidationError

@app.errorhandler(BadRequest)
def handle_bad_request(e):
    return jsonify({"err": e.name, "data": None}), 400

@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({"err": e.messages, "data": None}), 400

@app.errorhandler(Exception)
def handle_error(e):
    return jsonify({"err": str(e), "data": None}), 500 if not isinstance(e, HTTPException) else e.code
