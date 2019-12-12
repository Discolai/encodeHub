from flask import Flask, Response, request, jsonify, Blueprint
from api.db import get_db
import requests, socket

blu = Blueprint("nodes", __name__)

@blu.route("/nodes", methods=["GET"])
def get_nodes():
    cur = get_db().cursor()
    cur.execute("select * from nodes;")
    nodes = [dict(node) for node in cur.fetchall()]
    if len(nodes):
        return jsonify({"err": None, "nodes": nodes}), 200
    else:
        return jsonify({"err": "No nodes registered!", "nodes": None}), 404

@blu.route("/nodes", methods=["POST"])
def create_node():
    body = request.get_json()

    if not all(key in ["name", "address"] for key in body):
        return jsonify({"err": "Please specify a name and an address!", "node": None}), 400

    cur = get_db().cursor()
    try:
        cur.execute("insert into nodes (name, address) values (?,?);", (body["name"], body["address"]))
    except Exception as e:
        return jsonify({"err": str(e), "node": None})

    return jsonify({
            "err": None,
            "node": {"nid": cur.lastrowid, "name": body["name"], "address": body["address"]}
            })

@blu.route("/nodes/init/<nid>", methods=["POST"])
def init_node(nid):
    cur = get_db().cursor()
    cur.execute("select * from nodes where nid=?;", (nid,))

    if not cur.rowcount:
        return jsonify({"err": "Invalid nid!"}), 400

    node = dict(cur.fetchall()[0])
    payload = {
        "nid": node["nid"],
        "name": node["name"],
        "distributor": "http://{}:{}".format(get_ip_address(), PORT)
    }
    try:
        r = requests.post(node["address"]+"/init", json=payload)
    except Exception as e:
        return jsonify({"err": "Unable to contact node!"}), 404
    if r.status_code != 200:
        return jsonify(r.text), r.status_code
    return jsonify({"err": None}), 200


def get_ip_address():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    return s.getsockname()[0]
