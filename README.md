# encodeHub
A clustered encoding suite for managing encoding jobs.

## Distributor
Keeps track of available jobs and monitors the nodes.

## Node
Nodes use ffmpeg to process available encoding jobs. After finishing they push a log to the distributor with the results.
