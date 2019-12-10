import json, time
import threading
import api
import globals
import pickle
import requests
from ffmpeg import FFmpeg

def request_job(distributor):
    try:
        r = requests.put(distributor+"/jobs/oldest")
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


def handle_job(m, config):
    print("Got job: ", m)

    input = "\"%s\""%(m)
    output = "\"%shevc.mkv\""%(m[:-3])

    job = FFmpeg(config["ffmpeg"]["inargs"], input, config["ffmpeg"]["outargs"], output)

    job.start()

    while not job.has_finished():
        if globals.paused:
            job.pause()
            while globals.paused:
                time.sleep(config["sleeptime"])
            job.resume()

        progress = job.read_progress()
        globals.progress_q.append(progress)
        if len(globals.progress_q) > 1:
            globals.progress_q.popleft()
    job.kill()

def main():
    api_thread = threading.Thread(target=api.run, daemon=True)
    api_thread.start()
    while True:
        with open("config.json") as f:
            config = json.load(f)

        while len(globals.job_q) == 0:
            r = request_job(config["distributor"])
            if not r:
                time.sleep(config["sleeptime"])
            else:
                globals.job_q.append(r)


        try:
            m = globals.job_q.popleft()
            handle_job(m[1], config)
        except:
            globals.job_q.appendleft(m)
            raise Exception()



if __name__ == '__main__':
    try:
        main()
    except:
        with open(globals.progress_q_pickle, "wb") as f:
            pickle.dump(globals.progress_q, f)
        with open(globals.job_q_pickle, "wb") as f:
            pickle.dump(globals.job_q, f)
        with open(globals.paused_pickle, "wb") as f:
            pickle.dump(globals.paused, f)
        exit()
