import json, time
import threading
import api
import pickle
import requests
import signal
import sys
import os
from ffmpeg import FFmpeg

def request_job():
    try:
        r = requests.put(api.config["distributor"]+"/jobs/oldest", json={"nid":api.config["nid"]})
        body = json.loads(r.text)
    except:
        return None

    if body and body["err"]:
        return None
    else:
        return body["data"]

def send_report(log):
    try:
        r = requests.post("{}/logs/node/{}".format(api.config["distributor"], api.config["nid"]), json=log)
        body = json.loads(r.text)
    except Exception as e:
        return False

    if body and body["err"]:
        return False
    else:
        return True

def handle_job(j):
    print("Got job: ", j["job"])

    input = "\"%s\""%(j["job"])
    output = "\"%shevc.mkv\""%(j["job"][:-3])

    job = FFmpeg(api.config["ffmpeg"]["inargs"], input, api.config["ffmpeg"]["outargs"], output)

    job.start()

    while not job.has_finished():
        if api.stop:
            print("Stopping job: ", j["job"])
            job.stop()
            api.stop = False

        if api.paused:
            job.pause()
            while api.paused and not api.stop:
                time.sleep(api.config["sleeptime"])
            api.paused = False
            job.resume()

        progress = job.read_progress().copy()
        progress["paused"] = api.paused
        progress = {**progress, **j}
        api.progress_q.append(progress)
        if len(api.progress_q) > 1:
            api.progress_q.popleft()

    send_report(job.report.copy())
    api.progress_q.appendleft(job.report.copy())
    if api.config["delete_complete"]:
        os.remove(j["job"])

def main():
    api_thread = threading.Thread(target=api.run, daemon=True)
    api_thread.start()
    while True:
        while len(api.job_q) == 0:
            r = request_job()
            if not r:
                time.sleep(api.config["sleeptime"])
            else:
                api.job_q.append(r)


        try:
            api.stop = False
            j = api.job_q.popleft()
            if not os.path.isfile(j["job"]):
                continue
            handle_job(j)
        except Exception as e:
            api.job_q.appendleft(j)
            raise e
        except:
            api.job_q.appendleft(j)
            raise KeyboardInterrupt()


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print("Intercepted exception: ", e)
    except:
        print("Intercepted KeyboardInterrupt")
    finally:
        with open(api.progress_q_pickle, "wb") as f:
            pickle.dump(api.progress_q, f)
        with open(api.job_q_pickle, "wb") as f:
            pickle.dump(api.job_q, f)
        with open(api.paused_pickle, "wb") as f:
            pickle.dump(api.paused, f)
        with open("node_config.json", "w") as f:
            config = json.dump(api.config, f)
