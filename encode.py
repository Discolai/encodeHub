import json, datetime, subprocess, time, io, re

def ffmpeg(inargs, input, outargs, output):
    cmd = " ".join(["ffmpeg", *inargs, "-i", input, *outargs, output])
    return subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

def read_output(output):
    reg = "".join([
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

    match = re.search(reg, output)
    if not match:
        return None
    else:
        return match.groupdict()

def hhmmssms_to_ms(formatted):
    h, m, s = formatted.split(":")
    return int(h)*3600000 + int(m)*60000 + float(s)*1000

def ms_to_hhmmssms(ms):
    h = int(ms/3600000)
    m = int((ms-(h*3600000))/60000)
    s = float((ms - (h*3600000) - (m*60000))/1000)
    return ":".join([str(h).zfill(2), str(m).zfill(2), "%.2f"%s])


def current_progress(duration, current):
    return int((current/duration) * 100)

def remaining_time(duration, current, speed):
    remaining = (duration-current)/speed
    return ms_to_hhmmssms((duration-current)/speed)

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

        p = ffmpeg(config["ffmpeg"]["inargs"], input, config["ffmpeg"]["outargs"], output)

        while True:
            out = p.stdout.readline()
            if out[:8] == b"progress":
                break
            else:
                # print(out)
                match = re.search(b"Duration: (?P<duration>.+), start", out)
                if match:
                    duration = hhmmssms_to_ms(match.group("duration").decode("utf-8"))
                    # duration = match.group("duration").decode("utf-8")

        print(duration)
        while p.returncode == None:
            out = b""
            for i in range(11):
                out += p.stdout.readline().strip()
            if out:
                out = read_output(out.decode("utf-8"))
                current = hhmmssms_to_ms(out["out_time"])
                progress = current_progress(duration, current)
                remaining = remaining_time(duration, current, float(out["speed"]))
                print("Progress: {}\tRemaining: {}\tFps: {}\tOut time: {}\tSpeed: {}".format(progress, remaining, out["fps"], out["out_time"], out["speed"]))


        print("stop: ", datetime.datetime.now(), "\n")



if __name__ == '__main__':
    main()
