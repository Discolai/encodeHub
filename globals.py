from collections import deque
import pickle

paused_pickle = "paused_pickle.pkl"
try:
    with open(paused_pickle, "rb") as f:
        paused_pickle = pickle.load(f)
except:
    paused = False

progress_q_pickle = "progress_q_pickle.pkl"
try:
    with open(progress_q_pickle, "rb") as f:
        progress_q = pickle.load(f)
except:
    progress_q = deque()


job_q_pickle = "job_q_pickle.pkl"
try:
    with open(job_q_pickle, "rb") as f:
        job_q = pickle.load(f)
except:
    job_q = deque()
