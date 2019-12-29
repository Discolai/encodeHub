drop table IF EXISTS jobs;
drop table IF EXISTS nodes;
drop table IF EXISTS logs;
drop table IF EXISTS scans;

CREATE TABLE IF NOT EXISTS jobs (
  jid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  job VARCHAR(255) NOT NULL UNIQUE,
  nid INTEGER DEFAULT NULL REFERENCES nodes(nid),
  finished TINYINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS nodes (
  nid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  address VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS logs (
  lid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  nid INTEGER NOT NULL REFERENCES nodes(nid),
  jid INTEGER NOT NULL REFERENCES nodes(nid),
  dup_frames INTEGER NOT NULL,
  drop_frames INTEGER NOT NULL,
  elapsed_time DATETIME NOT NULL,
  video INTEGER NOT NULL,
  audio INTEGER NOT NULL,
  subtitle INTEGER NOT NULL,
  global_headers INTEGER NOT NULL,
  other_streams INTEGER NOT NULL,
  lsize INTEGER NOT NULL,
  prev_size INTEGER NOT NULL,
  muxing_overhead FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS scans (
  sid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  dir VARCHAR(255) NOT NULL,
  start DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  stop DATETIME DEFAULT NULL
);
