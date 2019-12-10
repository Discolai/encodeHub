import json, time
import threading
import api
import globals
from ffmpeg import FFmpeg

def main():
    api_thread = threading.Thread(target=api.run, daemon=True)
    api_thread.start()
    while True:
        while len(globals.job_queue) == 0:
            time.sleep(5)
        m = globals.job_queue.popleft()
        print("Got job: ", m)

        with open("config.json") as f:
            config = json.load(f)

        input = "\"%s\""%(m)
        output = "\"%shevc.mkv\""%(m[:-3])

        job = FFmpeg(config["ffmpeg"]["inargs"], input, config["ffmpeg"]["outargs"], output)

        job.start()

        while not job.has_finished():
            if globals.pause:
                job.pause()
                while globals.pause:
                    time.sleep(5)
                job.resume()

            print(globals.pause)
            progress = job.read_progress()
            globals.out_queue.append(progress)
            if len(globals.out_queue) > 1:
                globals.out_queue.popleft()




if __name__ == '__main__':
    main()
