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
    return jsonify({"err": None, "data": nodes})

@nodes_bp.route("/<int:nid>", methods=["GET"])
def get_node(nid):
    cur = get_db().cursor()
    cur.execute("select * from nodes where nid=?;", (nid,))
    nodes = [dict(node) for node in cur.fetchall()]
    if len(nodes):
        return jsonify({"err": None, "data": nodes[0]})
    return jsonify({"err": "Invalid nid!", "data": None})

@nodes_bp.route("/", methods=["POST"])
def create_node():
    node = NodeSchema().load(request.json)

    cur = get_db().cursor()
    cur.execute("insert into nodes (name, address) values (?,?);", (node["name"], node["address"]))
    return jsonify({"err": None, "data": {"id": cur.lastrowid}})

@nodes_bp.route("/<int:nid>", methods=["POST"])
def update_node(nid):
    node = NodeSchema().load(request.json)

    cur = get_db().cursor()
    cur.execute("update nodes set name=?, address=? where nid=?", (node["name"], node["address"], nid))
    return Response()

@nodes_bp.route("/<int:nid>", methods=["DELETE"])
def delete_node(nid):
    cur = get_db().cursor()
    cur.execute("delete from nodes where nid = ?;", (nid,))
    return Response()

@nodes_bp.route("/info", methods=["GET"])
def get_info():
    cur = get_db().cursor()

    sql = (
        "select t.saved_space, t.finished_count, t.sum_etime, "
        "(t.sum_etime/t.completed_count) as average_etime from "
        "(select (sum(prev_size)-sum(lsize)) as saved_space, "
        "count(lid) as finished_count, sum(elapsed_time_ms) as sum_etime, "
        "count(lid) as completed_count from logs) as t"
    )

    cur.execute(sql)
    info = [dict(row) for row in cur.fetchall()]
    return jsonify({"err": None, "data": info[0] if len(info) else None})

@nodes_bp.route("/info/<int:nid>", methods=["GET"])
def get_info_for(nid):
    cur = get_db().cursor()

    sql = (
        "select nid, name, (sum(prev_size)-sum(lsize)) as saved_space, "
        "t.sum_etime, t.finished_count, (t.sum_etime/t.finished_count) as average_etime from logs "
        "natural join "
        "(select nid, sum(elapsed_time_ms) as sum_etime , count(nid) as finished_count from logs where nid=?) as t "
        "natural join "
        "(select nid, name from nodes where nid=?);"
    )
    cur.execute(sql, (nid, nid))
    info = [dict(row) for row in cur.fetchall()]
    return jsonify({"err": None, "data": info[0] if len(info) else None})

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
