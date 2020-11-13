# HEMVIP


## Introduction

Stimuli tests with videos are often used in the field of non verbal behavior generation. From the field of audio listening tests, we have adapted the webMUSHRA tool to make it possible to use the software for the simultaneous assessment of videos.
This tool works with Prolific, read more on that in the configuration section.

### Download

Currently, it is required to clone this repository to get started.

* __webMUSHRA-dev__ is targeted to developers and experienced users who want to customize experiments. This version is comparable to cloning the git repository

## Features

All the features from webMUSHRA + the ability to test with videos, and include attention checks.

## Supported Browsers

 * Google Chrome, Firefox on Windows, Mac and Linux

### Docker

You can use docker to set up HEMVIP quickly. Just run
`docker-compose -f docker-compose.yml build` to build the webMUSHRA docker container.

To run the container use HEMVIP `docker-compose -f docker-compose.yml up`. We configured the docker image so that the `configs`  folder is mounted inside the container so that you can modify it on the fly.

In order to assess the results that are stored in the MONGO database, you need to either use the `docker-compose_dev.yml` file or add the relevant ports to the original file.
This way, you can access the database and export the experimental results. 

#### Note for Docker on Windows

When using Docker Toolbox/Machine on Windows, volume paths (to mount the `configs` and `results` folder) are not converted by default. To enable this conversion set the environment variable COMPOSE_CONVERT_WINDOWS_PATHS=1 e.g. by `env:COMPOSE_CONVERT_WINDOWS_PATHS=1` in the power shell.

### Apache + PHP
Another custom way to run webMUSHRA would be to install a complete web server stack like [XAMPP](https://www.apachefriends.org/download.html).

#### Change or add a configuration

HEMVIP uses [JSON](https://en.wikipedia.org/wiki/JSON) to configure experiments. We recommend to use an editor to work with JSON files.
Place your configuration in the `configs/my_first_experiment` folder. Your configuration is now available under the following link (with fake IDs, these can be retreived from Prolific and are used to save the results in the Mongo DB):

`localhost:80/prolific/my_first_experiment?PROLIFIC_PID=1234567&STUDY_ID=1234567&SESSION_ID=123123`

## Documentation

 * [Experimenters Manual](doc/experimenter.md)
 * [Participants Manual](doc/participant.md)

## Citation

T.B.D.

## References

* [Journal of Open Research Software Paper](http://doi.org/10.5334/jors.187)
* [Web Audio Conference 2015 Paper](http://wac.ircam.fr/pdf/wac15_submission_8.pdf)
* [Web Audio Conference 2015 Presentation](http://www.audiolabs-erlangen.de/content/resources/webMUSHRA/slides.html#/)

## Copyright/Licence

(C) AudioLabs 2020

This source code is protected by copyright law and international treaties. This source code is made available to you subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to you prior to your download of this source code. By downloading this source code you agree to be bound by the above mentioned terms and conditions, which can also be found [here.](LICENSE.txt)
Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law.
