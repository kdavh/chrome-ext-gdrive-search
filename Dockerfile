FROM node:latest
RUN mkdir -p /project
WORKDIR /project
RUN apt-get update && apt-get install apt-transport-https \
  && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
  && apt-get update && apt-get install yarn

RUN yarn

CMD [ "npm", "start" ]
