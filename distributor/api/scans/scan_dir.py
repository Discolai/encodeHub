import os, json, re, sqlite3, pexpect, sys
from api import config, scans, BASE_DIR

class VideoInfo:
    def __init__(self, sid):
        self.sid = sid
        self.cmd = " ".join(["ffprobe", *config["ffprobe"]["args"]])

    def analyze_video(self, video):
        p = pexpect.spawn(self.cmd + " \"{}\"".format(video))
        codec = p.readline().strip().decode("utf-8")
        p.close()
        return codec

    def analyze_directory(self, dir, stop):
        for root, dirs, files in os.walk(dir):
            if stop():
                break
            for file in files:
                file = os.path.abspath(os.path.join(root, file))

                match = re.search("\\.(\\w+)$", file)
                if match and match.group(1) in config["extentions"]:
                    codec = self.analyze_video(file)
                    if codec not in config["wanted"]:
                        db = sqlite3.connect(os.path.join(BASE_DIR, config["database"]))
                        cur = db.cursor()
                        try:
                            cur.execute("insert into jobs (job) values (?)", (file,))
                            scans.broadcast_scan({"job": file})
                        except:
                            pass
                        finally:
                            db.commit()
                            db.close()

    def cleanup(self):
        db = sqlite3.connect(os.path.join(BASE_DIR, config["database"]))
        cur = db.cursor()
        cur.execute("update scans set stop = CURRENT_TIMESTAMP where sid = ?;", (self.sid,))
        db.commit()
        db.close()
        scans.broadcast_scan_status(False)

def run(stop, sid, dir):
    info = VideoInfo(sid)
    info.analyze_directory(dir, stop)
    info.cleanup()
