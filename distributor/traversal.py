import os, json, re, sqlite3, pexpect, sys

class VideoInfo:
    """docstring for VideoInfo."""

    def __init__(self, config):
        self.config = config
        self.cmd = " ".join(["ffprobe", *config["ffprobe"]["args"]])

    def analyze_video(self, video):
        p = pexpect.spawn(self.cmd + " \"{}\"".format(video))
        codec = p.readline().strip().decode("utf-8")
        p.close()
        return codec

    def analyze_directory(self, dir):
        db = sqlite3.connect(self.config["database"])
        cur = db.cursor()
        for root, dirs, files in os.walk(dir):
            for file in files:
                file = os.path.abspath(os.path.join(root, file))

                match = re.search("\\.(\\w+)$", file)
                if match and match.group(1) in self.config["extentions"]:
                    codec = self.analyze_video(file)
                    if codec not in self.config["wanted"]:
                        try:
                            cur.execute("insert into jobs (job) values (?)", (file,))
                            # print(file)
                        except:
                            pass
        db.commit()
        db.close()
def main(dir):
    if not os.path.isdir(dir):
        raise FileNotFoundError()

    with open("distributor_config.json") as f:
        config = json.load(f)
    info = VideoInfo(config)
    info.analyze_directory("/mnt/Tv-series/Barry")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Please specify a directory!")
    else:
        main(sys.argv[1])
