import json
import os
import random
import re
from glob import glob
from pathlib import Path

from fastapi import FastAPI, Form, Query, Request
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
from starlette.responses import FileResponse, PlainTextResponse
from datetime import datetime, timedelta


app = FastAPI(docs_url=None, redoc_url=None)
app.mount("/prolific/lib", StaticFiles(directory="lib"), name="lib")
app.mount("/prolific/design", StaticFiles(directory="design"), name="design")

def connect_to_db():
    client = MongoClient(
        "mongodb://db:27017",
        username=os.environ["MONGO_USERNAME"],
        password=os.environ["MONGO_PASSWORD"],
    )
    return client.test_database


@app.get("/prolific/startup.js")
def startup():
    return FileResponse("startup.js")


@app.get("/configs/{test_id}/{user_id}")
def configs(test_id: str, user_id: str):
    status = connect_to_db().status.find_one(
        {"userId": user_id, "testId": test_id, "status": "ACTIVE"}
    )
    data = json.load(open(status["experiment_file"]))
    data["userId"] = user_id
    data["testId"] = test_id
    return data


@app.post("/fail")
def fail(user_id=Form(...), test_id=Form(...)):
    connect_to_db().status.update(
        {"userId": user_id, "testId": test_id}, {"$set": {"status": "FAILED", "ended": datetime.now()}}
    )
    return {}


@app.get("/failed_task", response_class=PlainTextResponse)
def failed():
    return "Sorry, you have failed our attention checks."


@app.post("/save", response_class=PlainTextResponse)
def save(sessionJSON=Form(...)):
    data = json.loads(sessionJSON)
    db = connect_to_db()
    db.responses.insert_one(data)
    ended_date = datetime.now()
    db.status.update(
        {"userId": data["userId"], "testId": data["testId"]},
        {"$set": {"status": "DONE", "ended": ended_date}},
    )
    code = db.codes.find_one({"testId": data["testId"], "ended": ended_date})
    return code["code"]


@app.get("/prolific/{test_id}")
def index(
    test_id: str, PROLIFIC_PID=Query(...), STUDY_ID=Query(...), SESSION_ID=Query(...)
):
    db = connect_to_db()

    db.status.remove(
        {"status": "ACTIVE", "date": {"$lt": datetime.now() - timedelta(hours=2)}}
    )

    status = db.status.find_one({"userId": PROLIFIC_PID, "testId": test_id})

    if not status:
        blocked = db.status.find(
            {"status": {"$in": ["DONE", "ACTIVE"]}, "testId": test_id}
        )
        blocked_files = [x["experiment_file"] for x in blocked]

        config_path = Path("configs") / re.sub(r"\W+", "", test_id)
        potential_files = [
            x for x in sorted(config_path.glob("*.json")) if str(x) not in blocked_files
        ]
        if not potential_files:
            return PlainTextResponse("Sorry, you cannot do this experiment right now")

        db.status.insert(
            {
                "status": "ACTIVE",
                "experiment_file": str(potential_files[0]),
                "testId": test_id,
                "userId": PROLIFIC_PID,
                "date": datetime.now(),
            }
        )

    elif status["status"] == "FAILED":
        return PlainTextResponse("Sorry, you cannot do this experiment anymore")
    elif status["status"] == "DONE":
        return PlainTextResponse(
            "Sorry, it seems like you have already done this experiment"
        )
    return FileResponse("index.html")
