from api import socketio, app, config, BASE_DIR
import api.error_handlers, os, json

def main():
    socketio.run(app, host="0.0.0.0", port=config["api_port"])


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        raise e
    except:
        pass
    finally:
        with open(os.path.join(BASE_DIR, "config.json"), "w") as f:
            config = json.dump(config, f, indent="\t", separators=(',', ': '))
