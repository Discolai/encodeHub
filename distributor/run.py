from api import app
import api.error_handlers

PORT = 3000

def main():
    from waitress import serve
    serve(app, host="0.0.0.0", port=PORT)

if __name__ == '__main__':
    main()
