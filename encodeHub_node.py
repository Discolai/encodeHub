import json, time
import threading
import api
import globals
import pickle
from ffmpeg import FFmpeg

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

def main():
    api_thread = threading.Thread(target=api.run, daemon=True)
    api_thread.start()
    while True:
        with open("config.json") as f:
            config = json.load(f)

        while len(globals.job_q) == 0:
            time.sleep(config["sleeptime"])

        try:
            m = globals.job_q.popleft()
            handle_job(m, config)
        except:
            globals.job_q.appendleft(m)
            raise e



if __name__ == '__main__':
    try:
        main()
    except:
        with open(globals.progress_q_pickle, "wb") as f:
            pickle.dump(globals.progress_q, f)
        with open(globals.job_q_pickle, "wb") as f:
            pickle.dump(globals.job_q, f)
        with open(globals.paused_pickle, "wb") as f:
            picle.dump(globals.paused)
        exit()
