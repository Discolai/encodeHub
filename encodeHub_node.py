import json, time
import threading
import api
import globals
from ffmpeg import FFmpeg

def main():
    api_thread = threading.Thread(target=api.run, daemon=True)
    api_thread.start()
    while True:
        with open("config.json") as f:
            config = json.load(f)

        while len(globals.job_q) == 0:
            time.sleep(config["sleeptime"])

        m = globals.job_q.popleft()
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




if __name__ == '__main__':
    main()
