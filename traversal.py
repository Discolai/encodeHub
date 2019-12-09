import os, json, re, subprocess

class VideoInfo:
    """docstring for VideoInfo."""

    def __init__(self, config):
        self.config = config

    def analyze_video(self, video):
        pass

    def analyze_videos(self, dir):
        videos = self._get_videos(dir)

        with open(self.config["queue"]) as f:
            q = json.loads(f.read())

        for video in videos:
            repr = self.analyze_video(video)
            if repr["codec"] not in self.config["wanted"]:
                q.append(video)


        with open(self.config["queue"], "w") as f:
            json.dump(q, f)

    def _get_videos(self, dir):
        res = []
        for root, dirs, files in os.walk(dir):
            for file in files:
                file = os.path.abspath(os.path.join(root, file))

                match = re.search("\\.(\\w+)$", file)
                if match and match.group(1) in self.config["extentions"]:
                    res.append(file)
        return res

class TvSeriesInfo(VideoInfo):
    """docstring for TvSeriesInfo."""

    def analyze_video(self, video):
        print(video)
        return {"codec": subprocess.run(self.config["ffprobe"] + "\"%s\""%(video), stdout=subprocess.PIPE, shell=True).stdout.strip().decode("utf-8")}


def main():
    with open("config.json") as f:
        config = json.load(f)
    info = TvSeriesInfo(config)
    info.analyze_videos("/mnt/Tv-series")

if __name__ == '__main__':
    main()
