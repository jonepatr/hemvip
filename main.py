from fastapi import FastAPI, Request, Form, Query
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse, PlainTextResponse
import random
from glob import glob
from pymongo import MongoClient
import json
import os

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
    data = json.load(open(random.choice(list(glob("new_files/*.json")))))
    data["userId"] = user_id
    return data


@app.post("/fail")
def fail(user_id=Form(...)):
    connect_to_db().fails.insert_one({"userId": user_id})
    return {}


@app.get("/failed_task", response_class=PlainTextResponse)
def failed():
    return "Sorry, you have failed our attention checks."


@app.post("/save")
def save(sessionJSON=Form(...)):
    data = json.loads(sessionJSON)
    data["success"] = True
    connect_to_db().responses.insert_one(data)
    return {}


@app.get("/prolific/{test_id}")
def index(
    test_id: str, PROLIFIC_PID=Query(...), STUDY_ID=Query(...), SESSION_ID=Query(...)
):
    db = connect_to_db()

    result_count = db.responses.find({"testId": test_id, "userId": PROLIFIC_PID}).count()
    if result_count > 0:
        return PlainTextResponse(
            "Sorry, it seems like you have already done this experiment"
        )

    fail_count = db.fails.find({"userId": PROLIFIC_PID}).count()
    if fail_count > 0:
        return PlainTextResponse("Sorry, you cannot do this experiment anymore")
    return FileResponse("index.html")

