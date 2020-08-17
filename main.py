from fastapi import FastAPI, Request, Form, Query
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse, PlainTextResponse
import random
from glob import glob
from pymongo import MongoClient
import json


app = FastAPI(docs_url=None, redoc_url=None)
app.mount("/prolific/lib", StaticFiles(directory="lib"), name="lib")
app.mount("/prolific/design", StaticFiles(directory="design"), name="design")


@app.get("/prolific/startup.js")
def startup():
    return FileResponse("startup.js")


@app.get("/configs/{test_id}/{user_id}", response_class=PlainTextResponse)
def read_item(test_id: str, user_id: str):
    return generate_config(test_id, user_id)


@app.post("/fail")
def fail(user_id=Form(...)):
    client = MongoClient("mongodb://db:27017", username="***REMOVED***", password="***REMOVED***")
    client.test_database.fails.insert_one({"userId": user_id})
    return {}


@app.get("/failed_task", response_class=PlainTextResponse)
def failed():
    return "Sorry, you have failed our attention checks."


@app.post("/save")
def save(sessionJSON=Form(...)):
    client = MongoClient("mongodb://db:27017", username="***REMOVED***", password="***REMOVED***")
    db = client.test_database
    data = json.loads(sessionJSON)
    data["success"] = True
    db.responses.insert_one(data)
    return {}


@app.get("/prolific/{test_id}")
def index(test_id: str, PROLIFIC_PID=Query(...), STUDY_ID=Query(...), SESSION_ID=Query(...)):
    client = MongoClient("mongodb://db:27017", username="***REMOVED***", password="***REMOVED***")
    responses = client.test_database.responses
    result_count = responses.find({"testId": test_id, "userId": PROLIFIC_PID}).count()
    if result_count > 0:
        return PlainTextResponse(
            "Sorry, it seems like you have already done this experiment"
        )

    fail_count = client.test_database.fails.find({"userId": PROLIFIC_PID}).count()
    if fail_count > 0:
        return PlainTextResponse("Sorry, you cannot do this experiment anymore")
    return FileResponse("index.html")

from ruamel.yaml import YAML
from ruamel.yaml.compat import StringIO

class MyYAML(YAML):
    def dump(self, data, stream=None, **kw):
        inefficient = False
        if stream is None:
            inefficient = True
            stream = StringIO()
        YAML.dump(self, data, stream, **kw)
        if inefficient:
            return stream.getvalue()



def generate_config(test_id, user_id):
    
    data = json.load(open(random.choice(list(glob("new_files/*.json")))))
    data["userId"] = user_id
    data["pages"][0]["content"].replace('\n', '<br>')
    
    yaml = MyYAML()
    yaml.compact(seq_seq=False, seq_map=False)
    return yaml.dump(data)