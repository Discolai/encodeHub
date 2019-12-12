from flask import Flask


PORT = 3000
app = Flask(__name__)

from api.jobs import blu as jblu
from api.logs import blu as lblu
from api.nodes import blu as nblu

app.register_blueprint(jblu)
app.register_blueprint(lblu)
app.register_blueprint(nblu)

def main():
    from waitress import serve
    serve(app, host="0.0.0.0", port=PORT)

if __name__ == '__main__':
    main()
