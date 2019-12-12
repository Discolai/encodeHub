import json, time
import threading
import api
import globals
import pickle
import requests
import signal
import sys
from ffmpeg import FFmpeg

def request_job(distributor, name):
    try:
        r = requests.put(distributor+"/jobs/oldest", json={"name":name})
    except:
        return None

    if r.status_code != 200:
        return None

    body = json.loads(r.text)
    if body["err"]:
        print(body["err"])
        return None
    else:
        return body["job"]

def send_report(distributor, name, log):
    try:
        r = requests.post(distributor+"/logs/"+name, json=log)
    except Exception as e:
        return False

    body = json.loads(r.text)
    if body["err"]:
        print(body["err"])
        return False
    else:
        return True

def handle_job(j):

    print("Got job: ", j["job"])

    input = "\"%s\""%(j["job"])
    output = "\"%shevc.mkv\""%(j["job"][:-3])

    job = FFmpeg(globals.config["ffmpeg"]["inargs"], input, globals.config["ffmpeg"]["outargs"], output)

    job.start()

    while not job.has_finished():
        if globals.stop:
            print("Stopping job: ", j["job"])
            job.stop()
            globals.stop = False

        if globals.paused:
            job.pause()
            while globals.paused and not globals.stop:
                time.sleep(globals.config["sleeptime"])
            globals.paused = False
            job.resume()

        progress = job.read_progress().copy()
        progress["paused"] = globals.paused
        globals.progress_q.append(progress)
        if len(globals.progress_q) > 1:
            globals.progress_q.popleft()

    send_report(globals.config["distributor"], globals.config["name"], job.report.copy())
    globals.progress_q.appendleft(job.report.copy())

def main():
    api_thread = threading.Thread(target=api.run, daemon=True)
    api_thread.start()
    while True:
        while len(globals.job_q) == 0:
            r = request_job(globals.config["distributor"], globals.config["name"])
            if not r:
                time.sleep(globals.config["sleeptime"])
            else:
                globals.job_q.append(r)


        try:
            globals.stop = False
            j = globals.job_q.popleft()
            handle_job(j)
        except Exception as e:
            globals.job_q.appendleft(j)
            raise e
        except:
            globals.job_q.appendleft(j)
            raise KeyboardInterrupt()


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print("Intercepted exception: ", e)
    except:
        print("Intercepted KeyboardInterrupt")
    finally:
        with open(globals.progress_q_pickle, "wb") as f:
            pickle.dump(globals.progress_q, f)
        with open(globals.job_q_pickle, "wb") as f:
            pickle.dump(globals.job_q, f)
        with open(globals.paused_pickle, "wb") as f:
            pickle.dump(globals.paused, f)
        with open("node_config.json", "w") as f:
            config = json.dump(globals.config, f)
