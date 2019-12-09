import json, datetime, subprocess, time, io, re

class FFmpeg:
    """docstring for FFmpeg."""

    progress_reg = re.compile(
        "".join([
            "^frame=(?P<frame>.+)",
            "fps=(?P<fps>.+)",
            "stream.+=(?P<stream>.+)",
            "bitrate=(?P<bitrate>.+)kbits/s",
            "total_size=(?P<total_size>.+)",
            "out_time_ms=(?P<out_time_ms>.+)",
            "out_time=(?P<out_time>.+)",
            "dup_frames=(?P<dup_frames>.+)",
            "drop_frames=(?P<drop_frames>.+)",
            "speed=(?P<speed>.+)x",
            "progress=(?P<progress>.+)"
        ])
    )


    def __init__(self, inargs, input, outargs, output):
        self.cmd = " ".join(["ffmpeg", *inargs, "-i", input, *outargs, output])

        ffprobe_cmd = "ffprobe -v error -sexagesimal -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 " + input
        self.duration = subprocess.run(ffprobe_cmd, stdout=subprocess.PIPE, shell=True).stdout.strip().decode("utf-8")
        self.duration = hhmmssms_to_ms(self.duration)

        self._p = None
        self.progress = None

    def start(self):
        self._p = subprocess.Popen(self.cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

    def discard_info(self):
        while self._p.stdout.readline()[:8] != b"progress":
            pass

    def has_finished(self):
        return self._p.returncode != None

    def _current_progress(self):
        return int((self.progress["out_time_s"]/self.duration) * 100)

    def _remaining_time(self):
        return ms_to_hhmmssms(self.duration-(self.progress["out_time_ms"])/self.progress["speed"])

    def _cast_progress(self, progress):
        # Since ffmpeg for some reason states ms as microseconds instead of milliseconds
        # This workaround takes into account that it might get fixed in the future
        ms = hhmmssms_to_ms(progress["out_time"])
        return {
            "frame": int(progress["frame"]),
            "fps": float(progress["fps"]),
            "stream": progress["stream"],
            "bitrate": float(progress["bitrate"]),
            "total_size": int(progress["total_size"]),
            "out_time_ms": ms,
            "out_time_s": int(ms/1000),
            "out_time": progress["out_time"],
            "dup_frames": int(progress["dup_frames"]),
            "drop_frames": int(progress["drop_frames"]),
            "speed": float(progress["speed"]),
            "progress": progress["progress"],
        }

    def read_progress(self):
        out = b""
        for i in range(11):
            out += self._p.stdout.readline().strip()

        match = re.search(self.progress_reg, out.decode("utf-8"))
        if match:
            self.progress = self._cast_progress(match.groupdict())

            self.progress["progress"] = self._current_progress()
            self.progress["remaining"] = self._remaining_time()
        return self.progress




def hhmmssms_to_ms(formatted):
    h, m, s = formatted.split(":")
    return int(h)*3600000 + int(m)*60000 + float(s)*1000

def ms_to_hhmmssms(in_ms):
    h = int(in_ms/3600000)
    m = int((in_ms-(h*3600000))/60000)
    s = float((in_ms - (h*3600000) - (m*60000))/1000)
    return ":".join([str(h).zfill(2), str(m).zfill(2), "%.6f"%s])


def main():
    with open("config.json") as f:
        config = json.load(f)

    with open("queue.json") as f:
        q = json.load(f)

    for m in q:
        print(m)
        print("start: ", datetime.datetime.now())
        # q.remove(m)
        with open("queue.json", "w") as f:
            json.dump(q, f)

        input = "\"%s\""%(m)
        output = "\"%shevc.mkv\""%(m[:-3])

        job = FFmpeg(config["ffmpeg"]["inargs"], input, config["ffmpeg"]["outargs"], output)

        job.start()
        job.discard_info()

        while not job.has_finished():
            progress = job.read_progress()
            print("Frame: {}\tFps: {}\tProgress: {}%\t Remaining: {}\tOut time: {}".format(
                progress["frame"],
                progress["fps"],
                progress["progress"],
                progress["remaining"],
                progress["out_time"]
            ))

        print("stop: ", datetime.datetime.now(), "\n")



if __name__ == '__main__':
    main()
