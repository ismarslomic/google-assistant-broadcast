# google-assistant-broadcast

[![Docker Image CI](https://github.com/ismarslomic/google-assistant-broadcast/actions/workflows/docker-image.yml/badge.svg?branch=main)](https://github.com/ismarslomic/google-assistant-broadcast/actions/workflows/docker-image.yml)
> Run tiny web server which expose REST Api for sending broadcast text messages to
> your Google Assistant, by using the [Google Assistant Service](https://developers.google.com/assistant/sdk/overview#google_assistant_service).

## About

Ever wanted to [broadcast a voice message](https://support.google.com/assistant/answer/9071582) to
your Google Assistant enabled speakers in your home, **without interrupting your music** that is
currently playing? Now you can, and I have tried to make it quit easy for you.

I have made this after a lot of research, and it all started
with [this](https://community.home-assistant.io/t/community-hass-io-add-on-google-assistant-webserver-broadcast-messages-without-interrupting-music/37274)
thread on the Home Assistant forum. 

I want to give credits to:

- [endoplasmic/google-assistant](https://github.com/endoplasmic/google-assistant) by @endoplasmic
- [AndBobsYourUncle/google-assistant-webserver](https://github.com/AndBobsYourUncle/hassio-addons/blob/master/google-assistant-webserver/README.md)
  by @AndBobsYourUncle
- [greghesp/assistant-relay](https://github.com/greghesp/assistant-relay) by @greghesp

## Note

1. You don't need to prefix the message with `broadcast`, `shout` and `tell` etc. as this is already
   done for you.

1. According to [Google Assistant doc](https://support.google.com/assistant/answer/9071582) you can
   broadcast to all speakers or specific speakers. I have just tested to all.

## Setup

### Prerequisites

- **docker** - you need to have Docker installed on your machine,
  read [Get Docker](https://docs.docker.com/get-docker/) for more information.
- **Google OAuth 2.0 Client ID** and **Access Keys** - in order to authenticate yourself and get access to your Google
  Assistant
  - You can find help and more information at [ismarslomic/google-assistant-oauth](https://github.com/ismarslomic/google-assistant-oauth)

### Alt 1: Run docker container with `docker-compose`

Create folder with name `config` and add files `client_secret.json` and `tokens.json`.

`docker-compose.yml`

```yaml
version: '3.8'
services:
  google-assistant-broadcast:
    container_name: google-assistant-broadcast
    image: ismarslomic/google-assistant-broadcast
    restart: unless-stopped
    ports:
      - "8085:8085"
    volumes:
      - ./config:/usr/src/config

```

```bash
docker-compose up -d
```

### Alt 2: Run docker container with `docker run`

Create folder with name `config` and add files `client_secret.json` and `tokens.json`.

```bash
docker run -d --name google-assistant-broadcast \
-p 8085:8085 \
-v /path/to/volume/config:/usr/src/config \
--restart unless-stopped \
ismarslomic/google-assistant-broadcast:latest
```

## Using

### Integrating with Home Assistant

You can easily integrate this REST Api in Home Assistant by using the
[RESTful Notifications](https://www.home-assistant.io/integrations/notify.rest/) platform.

Add following to your `configuration.yaml` file:

```yaml
# Google Assistant Broadcast - REST Api
notify:
  - platform: rest
    name: ga_broadcast
    resource: http://localhost:8085/broadcast
    method: POST_JSON
```

### Using in Home Assistant

Broadcast the message by calling the Notification service `ga_broadcast` (from previous step):

```yaml
service: notify.ga_broadcast
data:
  message: Hello world!!
```

### Calling the REST Api directly

**Endpoint**:
POST http://localhost:8085/broadcast

**Request payload**:

```json
{
  "message": "Hello world!!"
}
```

#### Example with curl

```
curl -X POST http://localhost:8085/broadcast \
 -d '{"message":"Hello world!!"}' \
 -H "Content-Type: application/json"
```
