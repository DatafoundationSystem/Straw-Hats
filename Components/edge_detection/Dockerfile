FROM alpine
WORKDIR .

# Install nodejs
RUN apk add --update nodejs npm
# Install python/pip
ENV PYTHONUNBUFFERED=1
# RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
# RUN python3 -m ensurepip
# RUN pip3 install --no-cache --upgrade pip setuptools

RUN apk update && apk add --update --no-cache \
	python3 \ 
	py3-pip && \ 
	ln -sf python3 /usr/bin/python 


COPY . .
RUN pip install -r ./app/requirements.txt


RUN npm install

EXPOSE 8080
CMD [ "node", "server.js" ]