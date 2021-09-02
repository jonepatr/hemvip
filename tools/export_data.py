#
# Copyright (C) Patrik Jonell and contributors 2021.
# Licensed under the MIT license. See LICENSE.txt file in the project root for details.
#

from pymongo import MongoClient
import json
import sys


def connect_to_db():
    client = MongoClient(
        "mongodb://MONGODB_URL:27017", username="db_user", password="db_pass"
    )
    return client.test_database


test_id = sys.argv[1]
db = connect_to_db()
output = []
for response in db.responses.find({"testId": test_id}):
    response["_id"] = str(response["_id"])
    output.append(response)

with open("output.json", "w") as f:
    json.dump(output, f, indent=4)
