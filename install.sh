#!/bin/bash

dbname="encodeHub.db"

echo "----------------\nSetting up python enviroment.\n----------------"
python3 -m virtualenv .env
source .env/bin/activate
pip3 install -r requirements.txt

echo "\n----------------\nSetting up sqlite db.\n----------------"
echo "Please specify a the absolute path to the db directory:"
read -r dbdir

echo "Using $dbdir/$dbname as database."
sudo mkdir --parents $dbdir

echo "Please specify the distributor service user:"
read -r user
sudo chown $user $dbdir

sqlite3 "$dbdir/$dbname" < "db/schema.sql"

echo "Please change the database within 'distributor/config' to '$dbdir/$dbname'."

exit
