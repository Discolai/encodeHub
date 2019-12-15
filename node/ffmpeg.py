import re, signal, pexpect, datetime
from pydoc import locate


class DurationError(Exception):
    pass

class FFmpeg:
    """docstring for FFmpeg."""

    formats = {
        "frame": (re.compile(b"frame=[ ]*(?P<frame>\\d+)"), "int"),
        "fps": (re.compile(b"fps=[ ]*(?P<fps>[\\d\\.]+)"), "float"),
        "stream": (re.compile(b"stream.+=[ ]*(?P<stream>[-\\d\\.]+)"), "str"),
        "bitrate": (re.compile(b"bitrate=[ ]*(?P<bitrate>[\\d\\.]+)kbits\\/s"), "float"),
        "total_size": (re.compile(b"total_size=[ ]*(?P<total_size>\\d+)"), "int"),
        "out_time_ms": (re.compile(b"out_time_ms=[ ]*(?P<out_time_ms>\\d+)"), "int"),
        "out_time": (re.compile(b"out_time=[ ]*(?P<out_time>\\d{2}:\\d{2}:\\d{2}\\.\\d{6})"), "str"),
        "dup_frames": (re.compile(b"dup_frames=[ ]*(?P<dup_frames>\d+)"), "int"),
        "drop_frames": (re.compile(b"drop_frames=[ ]*(?P<drop_frames>\d+)"), "int"),
        "speed": (re.compile(b"speed=[ ]*(?P<speed>[\\d\\.]+)x"), "float"),
        "progress":(re.compile(b"progress=[ ]*(?P<progress>\\w+)"), "str"),
        "video": (re.compile(b"video[ ]*:[ ]*(?P<video>\\d+)"), "int"),
        "audio": (re.compile(b"audio[ ]*:[ ]*(?P<audio>\\d+)"), "int"),
        "subtitle": (re.compile(b"subtitle[ ]*:[ ]*(?P<subtitle>\\d+)"), "int"),
        "other_streams": (re.compile(b"other streams[ ]*:[ ]*(?P<other_streams>\\d+)"), "int"),
        "global_headers": (re.compile(b"global headers[ ]*:[ ]*(?P<global_headers>\\d+)"), "int"),
        "muxing_overhead": (re.compile(b"muxing overhead[ ]*:[ ]*(?P<muxing_overhead>[\\d\\.]+)%"), "float"),
    }


    def __init__(self, inargs, input, outargs, output):
        self.cmd = " ".join(["ffmpeg", *inargs, "-i", input, *outargs, output])

        self._p = None
        self.progress = None
        self._finished = False
        self._pause = False
        self.report = None
        self._elapsed = []

    def start(self):
        self._p = pexpect.spawn(self.cmd)
        self._elapsed.append([datetime.datetime.now(), None])
        self._get_duration()
        self.exp_list = self._p.compile_pattern_list([pexpect.EOF, "(.+)"])

    def pause(self):
        self._elapsed[-1][1] = datetime.datetime.now()
        self._p.kill(signal.SIGSTOP)

    def resume(self):
        self._elapsed.append([datetime.datetime.now(), None])
        self._p.kill(signal.SIGCONT)

    def stop(self):
        self._p.kill(signal.SIGINT)

    def _stop(self):
        self._p.close()

        self._elapsed[-1][1] = datetime.datetime.now()
        self.report["elapsed_time"] = self.get_elapsed_time()

    def get_elapsed_time(self):
        elapsed = datetime.timedelta(0)
        for times in self._elapsed:
            elapsed += (times[1] if times[1] else datetime.datetime.now()) - times[0]
        return str(elapsed)

    def has_finished(self):
        return self._finished

    def _get_duration(self):
        try:
            self._p.expect("Duration: (?P<duration>.+), start:", timeout=5)
            self.duration = hhmmssms_to_ms(self._p.match.group("duration").decode("utf-8").strip())
        except pexpect.exceptions.TIMEOUT as e:
            raise DurationError("Unable to get video duration!")

    def _current_progress(self, out_time, duration):
        return int((out_time/duration) * 100)

    def _remaining_time(self, out_time, duration, speed):
        return ms_to_hhmmssms((duration-out_time)/speed)

    def auto_cast(self, progress):
        res = {}
        for key, v in self.formats.items():
            match = re.search(v[0], progress)
            if match:
                if v[1] == "str":
                    res[key] = match.group(key).strip().decode("utf-8")
                else:
                    res[key] = locate(v[1])(match.group(key).strip())
            else:
                res[key] = None

        return res


    def read_progress(self):
        i = self._p.expect_list(self.exp_list)
        if i == 0:
            self._finished = True
            self._stop()
        else:
            out = self._p.match.group(i)
            self.progress = self.auto_cast(out)
            try:
                ms = hhmmssms_to_ms(self.progress["out_time"])
                self.progress["percentage"] = self._current_progress(ms, self.duration)
                self.progress["remaining_time"] = self._remaining_time(ms, self.duration, self.progress["speed"])
            except Exception as e:
                self.progress["percentage"] = None
                self.progress["remaining_time"] = None

            if self.progress["progress"] in ["end", "stop"]:
                self.report = self.progress

            self.progress["elapsed_time"] = self.get_elapsed_time()

        return self.progress


def hhmmssms_to_ms(formatted):
    h, m, s = formatted.split(":")
    return int(h)*3600000 + int(m)*60000 + float(s)*1000

def ms_to_hhmmssms(in_ms):
    h = int(in_ms/3600000)
    m = int((in_ms-(h*3600000))/60000)
    s = float((in_ms - (h*3600000) - (m*60000))/1000)
    return ":".join([str(h).zfill(2), str(m).zfill(2), "%.6f"%s])
