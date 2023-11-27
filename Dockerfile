FROM node As build

# install node_modules
COPY ./app /opt
WORKDIR /opt
RUN npm install

RUN mkdir /opt/app
WORKDIR /opt/app
ENTRYPOINT ["npm","start"]
