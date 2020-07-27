FROM tiangolo/uvicorn-gunicorn-fastapi
COPY ./ /app
RUN pip install aiofiles pyyaml python-multipart pymongo