FROM node:17.8.0-alpine3.15

LABEL maintainer="Ismar Slomic <ismar@slomic.no>"

ENV NODE_ENV production

# Use a lightweight init system to properly spawn the Node.js runtime process with signals support
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Don’t run Node.js apps as root
USER node

# Create config and app directory
WORKDIR /usr/src/config
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node:node package*.json ./

RUN npm ci --only=production

# Bundle app source
COPY --chown=node:node . .

EXPOSE 8085

CMD [ "dumb-init", "node", "index.js" ]
