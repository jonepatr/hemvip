from fastapi import FastAPI, Request, Form
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse, PlainTextResponse
import yaml
from pymongo import MongoClient
import json


app = FastAPI(docs_url=None, redoc_url=None)
app.mount("/lib", StaticFiles(directory="lib"), name="lib")
app.mount("/design", StaticFiles(directory="design"), name="design")
app.mount("/videos", StaticFiles(directory="videos"), name="videos")


@app.get("/")
def index():
    return FileResponse("index.html")


@app.get("/startup.js")
def startup():
    return FileResponse("startup.js")


@app.get("/configs/{item_id}", response_class=PlainTextResponse)
def read_item(item_id: str):
    return generate_config()


@app.post("/save")
def save(sessionJSON=Form(...)):
    print(sessionJSON)
    client = MongoClient("mongodb://db:27017", username="user", password="passpass")
    db = client.test_database
    response_id = db.responses.insert_one(json.loads(sessionJSON)).inserted_id
    print(db.responses.find_one({"_id": response_id}))

    return {}


def generate_config():
    return yaml.dump(
        {
            "testname": "webMUSHRA Example",
            "testId": "default_example",
            "stopOnErrors": True,
            "remoteService": "/save",
            "pages": [
                {
                    "type": "video",
                    "id": "trial_random_43",
                    "name": "MUSHRA - Random 1",
                    "content": "Due to randomization, this page will be either the second MUSHRA page or the third MUSHRA page.",
                    "stimuli": {
                        "C1": "/videos/small.mp4",
                        "C2": "/videos/sample-mp4-file.mp4",
                        "C3": "/videos/big_buck_bunny.mp4",
                    },
                },
                {
                    "type": "finish",
                    "name": "Thank you",
                    "content": "Thank you for attending!",
                    "showResults": "false",
                    "writeResults": "true",
                    "questionnaire": [
                        {"type": "text", "label": "eMail", "name": "email"},
                        {
                            "type": "number",
                            "label": "Age",
                            "name": "age",
                            "min": 0,
                            "max": 100,
                            "default": 30,
                        },
                        {
                            "type": "likert",
                            "name": "gender",
                            "label": "Gender",
                            "response": [
                                {"value": "female", "label": "Female"},
                                {"value": "male", "label": "Male"},
                                {"value": "other", "label": "Other"},
                            ],
                        },
                    ],
                },
            ],
        }
    )