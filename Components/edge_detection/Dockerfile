FROM alpine
WORKDIR .

# Install nodejs
RUN apk add --update nodejs npm
# Install python/pip
# ENV PYTHONUNBUFFERED=1
# RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
# RUN python3 -m ensurepip
# RUN pip3 install --no-cache --upgrade pip setuptools

RUN echo "http://dl-8.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories
RUN apk --no-cache --update-cache add gcc gfortran python3 python3-dev py-pip build-base wget freetype-dev libpng-dev openblas-dev
RUN ln -s /usr/include/locale.h /usr/include/xlocale.h
# RUN pip install numpy

COPY . .
RUN pip3 install -r ./app/requirements.txt
RUN npm install

EXPOSE 8080
CMD [ "node", "server.js" ]