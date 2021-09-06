# Documentation for Experimenters

## Configuring an Experiment

### General

HEMVIP uses JSON to configure experiments. We recommend to use an editor to work with JSON files.
Place your configuration in the configs/my_first_experiment folder.

Your configuration is now available under the following link (with fake IDs, these can be retreived from Prolific and are used to save the results in the Mongo DB):

`localhost:80/prolific/my_first_experiment?PROLIFIC_PID=1234567&STUDY_ID=1234567&SESSION_ID=123123`

Filepaths in the config files are always relative to the root folder "/".

### Configuration

The JSON configuration file is a Python dictionary with an array of pages served to the participant.
At the top level of the config file, general options of the experiment are stored.

* **testname** Name of your listening test as it is shown to the participants.
* **testId** Identifier of your listening test which is also stored into the result files.
* **stopOnErrors** If set to true, the experiment will stop on any errors (e.g. if samples sizes do not match). Please watch the console log especially when unexpected behaviour occurs.
* **showButtonPreviousPage** If set to true, the participant can navigate to previous pages.
* **remoteService** A service/URL to which the results are sent. This is set to "/save" as the underlying Python application will save the results to the Mongo DB.
* **pages** An array of experiment pages, random keyword or an pages array ([Array]).

#### `random`

If the string "random" is the first element of an pages array, the content of the array is randomized (e.g. used for randomized experiments).

#### `generic` page

A generic page contains any content in HTML (e.g. useful for showing the instructions to the participants).

* **type** must be generic.
* **id** Identifier of the page.
* **name** Name of the page (is shown as title)
* **content** Content (HTML) of the page.

#### `video` page

A video page with 2 or more videos that require a rating.

* **type** must be generic.
* **id** Identifier of the page.
* **name** Name of the page (is shown as title)
* **content** Content (HTML) of the page.
* **question** Question that accompanies the rating.
* **stimuli** List of conditions with URLs to Vimeo videos.

#### `videopc` page

A video page showing 2 videos, for pairwise comparison.

* **type** must be generic.
* **id** Identifier of the page.
* **name** Name of the page (is shown as title)
* **content** Content (HTML) of the page.
* **question** Question that accompanies the pairwise comparison.
* **stimuli** List of conditions with URLs to Vimeo videos.

#### `finish` page

The finish page must be the last page of the experiment.

* **type** must be finish.
* **name** Name of the page (is shown as title).
* **content** Content (HTML) of the page. The content is shown on the upper part of the page.
* **showResults** The results are shown to the participant.  
* **writeResults** The results are sent to the remote service (which writes the results into a file).

#### Example JSON File

```{
  "testname": "Experiment",
  "stopOnErrors": true,
  "remoteService": "/save",
  "pages": [
      {
        "type": "generic"
        "id" : "first_page"
        "name" : "Name of the first page, used as heading on the page."
        "content" : "Content of the page, usage of HTML tags allowed."
      },
      {
        "type": "video"
        "id" : "subject_x"
        "name" : "Page 1 of Y"
        "content" : "Rate the videos shown below"
        "question" : "How human-like was the agent in this video?",
        "stimuli": [
          [
            "C1",
            "https://link.to.stimuli",
          ],
          [
            "C2",
            "https://link.to.stimuli",
          ]          
        ]       
        },
        {
          "type": "videopc",
          "id" : "subject_x",
          "name" : "Page 2 of Y",
          "content" : "Which from the two videos is the best?",
          "question" : "Which from the two videos is the best",
          "stimuli": [
            [
              "C1",
              "https://link.to.stimuli",
            ],
            [
              "C2",
              "https://link.to.stimuli",
            ]          
          ]       
          },
          {
            "type": "finish",
            "name" : "Thank you",
            "content" : "Thank You!",
            "showResults": false,
            "writeResults": true,
            "questionnaire": [
               {
                   "type": "number",
                   "label": "*What's your age in years?",
                   "name": "age",
                   "min": 0,
                   "max": 100,
                   "default": 0
               },
               {
                   "type": "options",
                   "name": "gender",
                   "label": "*How would you identify yourself (gender)?",
                   "response": [
                       {
                           "value": "female",
                           "label": "Female"
                       },
                       {
                           "value": "male",
                           "label": "Male"
                       },
                       {
                           "value": "other",
                           "label": "Other"
                       }
                   ]
               },
               {
                   "type": "text",
                   "label": "*What's your nationality?",
                   "name": "nationality"
               },
               {
                   "type": "likert",
                   "label": "How skilled are you with computers?",
                   "name": "video_games",
                   "response": [
                       {
                           "value": "1",
                           "label": "1 - Not at all"
                       },
                       {
                           "value": "2",
                           "label": "2"
                       },
                       {
                           "value": "3",
                           "label": "3"
                       },
                       {
                           "value": "4",
                           "label": "4 - Moderately"
                       },
                       {
                           "value": "5",
                           "label": "5"
                       },
                       {
                           "value": "6",
                           "label": "6"
                       },
                       {
                           "value": "7",
                           "label": "7 - Extremely"
                       }
                   ]
               },
               {
                   "type": "long_text",
                   "label": "How do you feel today about yourself and the state of the world?",
                   "name": "feeling"
               },
  ],
  "remoteFailService": "/fail"
  }```
