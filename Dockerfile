#
# Copyright (C) Patrik Jonell and contributors 2021.
# Licensed under the MIT license. See LICENSE.txt file in the project root for details.
#

FROM tiangolo/uvicorn-gunicorn-fastapi
COPY ./ /app
RUN pip install aiofiles python-multipart pymongo==3.11.2
