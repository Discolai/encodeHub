import os, json, re, sqlite3, pexpect, sys
from api import config

class VideoInfo:
    def __init__(self, sid, config):
        self.sid = sid
        self.config = config
        self.db = sqlite3.connect(self.config["database"])
        self.cmd = " ".join(["ffprobe", *config["ffprobe"]["args"]])

    def analyze_video(self, video):
        p = pexpect.spawn(self.cmd + " \"{}\"".format(video))
        codec = p.readline().strip().decode("utf-8")
        p.close()
        return codec

    def analyze_directory(self, dir):
        cur = self.db.cursor()
        for root, dirs, files in os.walk(dir):
            for file in files:
                file = os.path.abspath(os.path.join(root, file))

                match = re.search("\\.(\\w+)$", file)
                if match and match.group(1) in self.config["extentions"]:
                    codec = self.analyze_video(file)
                    if codec not in self.config["wanted"]:
                        try:
                            cur.execute("insert into jobs (job) values (?)", (file,))
                        except:
                            pass
    def cleanup(self):
        cur = self.db.cursor()
        cur.execute("update scans set stop = CURRENT_TIMESTAMP where sid = ?;", (self.sid,))
        self.db.commit()
        self.db.close()

def run(sid, dir):
    info = VideoInfo(sid, config)
    info.analyze_directory(dir)
    info.cleanup()
