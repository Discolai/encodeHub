from flask import Flask, Response, request, jsonify, Blueprint
from marshmallow import Schema, fields, post_load
from marshmallow.validate import Length, URL
from api.db import get_db
from api import config
import requests, socket

nodes_bp = Blueprint("nodes", __name__)

class NodeSchema(Schema):
    name = fields.Str(required=True, validate=Length(max=255, min=5))
    address = fields.Str(required=True, validate=URL())

@nodes_bp.route("/", methods=["GET"])
def get_nodes():
    cur = get_db().cursor()
    cur.execute("select * from nodes;")
    nodes = [dict(node) for node in cur.fetchall()]
    return jsonify({"err": None, "nodes": nodes})

@nodes_bp.route("/", methods=["POST"])
def create_node():
    node = NodeSchema().load(request.json)

    cur = get_db().cursor()
    cur.execute("insert into nodes (name, address) values (?,?);", (node["name"], node["address"]))
    return Response(), 201

@nodes_bp.route("/<int:nid>", methods=["DELETE"])
def delete_node(nid):
    cur = get_db().cursor()
    cur.execute("delete from nodes where nid = ?;", (nid,))
    return Response()

@nodes_bp.route("/setup/<int:nid>", methods=["POST"])
def setup_node(nid):
    cur = get_db().cursor()
    cur.execute("select * from nodes where nid=?;", (nid,))

    if not cur.rowcount:
        return jsonify({"err": "Invalid nid!"}), 400

    node = dict(cur.fetchall()[0])
    payload = {
        "nid": node["nid"],
        "name": node["name"],
        "distributor": construct_distributor_url()
    }
    try:
        r = requests.post(node["address"]+"/config/setup", json=payload)
    except Exception as e:
        return jsonify({"err": "Unable to contact node!"}), 404
    if r.status_code != 200:
        return jsonify(r.text), r.status_code
    return Response()


def construct_distributor_url():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    return "http://{}:{}".format(s.getsockname()[0], config["api_port"])
