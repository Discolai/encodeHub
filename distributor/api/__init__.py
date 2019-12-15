from flask import Flask

app = Flask(__name__)

from api.jobs import blu as jblu
from api.logs import blu as lblu
from api.nodes import blu as nblu

app.register_blueprint(jblu)
app.register_blueprint(lblu)
app.register_blueprint(nblu)
