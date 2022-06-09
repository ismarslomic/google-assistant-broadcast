FROM node:18.3.0-alpine3.16

LABEL maintainer="Ismar Slomic <ismar@slomic.no>"

ENV NODE_ENV production

# Use a lightweight init system to properly spawn the Node.js runtime process with signals support
# We use pip to install dumb-init to make sure it works on amd and arm architectures
RUN \
	apk add --update \
		python3 \
		python3-dev \
		py-pip \
		build-base \
	&& \
	pip install dumb-init && \
	apk del \
		python3 \
		python3-dev \
		py-pip \
		build-base \
	&& \
	rm -rf /var/cache/apk/* && \
	:

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
