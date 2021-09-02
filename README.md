# HEMVIP


## Introduction

Stimuli tests with videos are often used in the field of non verbal behavior generation. From the field of audio listening tests, we have adapted the [webMUSHRA.js Software](https://github.com/audiolabs/webMUSHRA) to make it possible to use the software for the simultaneous assessment of videos.
This tool currently works with [Prolific](https://prolific.co/) but should be easy to adapt to other platforms or run as stand-alone. Read more about the prolific settings in the configuration section.

### Download

Currently, it is required to clone this repository to get started.

## Features

* Ability to test with videos, and include attention checks
* Handles rejections based on attention checks
* Saves data to mongodb
* Allows for showing a questionannaire or custom html content as pages

## Supported Browsers

 * Google Chrome, Firefox on Windows, Mac and Linux

### Docker

You can use docker to set up HEMVIP quickly. Just run
`docker-compose -f docker-compose.yml build` to build the HEMVIP docker container.

To run the container use `docker-compose -f docker-compose.yml up`. We configured the docker image so that the `configs`  folder is mounted inside the container so that you can modify it on the fly.

In order to assess the results that are stored in the MongoDB, you need to either use the `docker-compose_dev.yml` file or add the relevant ports to the original file.
This way, you can access the database and export the experimental results. 

#### Note for Docker on Windows

When using Docker Toolbox/Machine on Windows, volume paths (to mount the `configs` and `results` folder) are not converted by default. To enable this conversion set the environment variable COMPOSE_CONVERT_WINDOWS_PATHS=1 e.g. by `env:COMPOSE_CONVERT_WINDOWS_PATHS=1` in the power shell.

#### Change or add a configuration

HEMVIP uses [JSON](https://en.wikipedia.org/wiki/JSON) to configure experiments. We recommend to use an editor to work with JSON files.
Place your configuration in the `configs/my_first_experiment` folder. Your configuration is now available under the following link (with fake IDs, these can be retreived from Prolific and are used to save the results in the Mongo DB):

`localhost:80/prolific/my_first_experiment?PROLIFIC_PID=1234567&STUDY_ID=1234567&SESSION_ID=123123`

## Documentation

 * [Experimenters Manual](doc/experimenter.md)
 * [Participants Manual](doc/participant.md)

## Citation

T.B.D.


## Copyright/Licence
Please see LICENSE.txt and THIRD-PARTY-NOTICES.txt
