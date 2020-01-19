from api import app, config
import api.error_handlers

def main():
    from waitress import serve
    serve(app, host="0.0.0.0", port=config["api_port"])

if __name__ == '__main__':
    main()
