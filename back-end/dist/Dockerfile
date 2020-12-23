FROM node:12

# Create a directory where our app will be placed
RUN mkdir /usr/src/app/
WORKDIR /usr/src/app

COPY package*.json ./
RUN yarn install
COPY . .

EXPOSE 3333
CMD [ "yarn", "server" ]