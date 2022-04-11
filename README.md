# google-assistant-broadcast
> Provides simple REST Api for broadcasting a message, without stopping 
> the music on your Google Assistant enabled speakers (such as Sonos or Google Home).

## REST Api - Broadcast message

**Endpoint**:
POST http://localhost:8085/broadcast

**Request payload**:

```json
{
  "message": "hello world"
}
```

### With curl

```
curl -X POST http://localhost:8085/broadcast -d '{"message":"hello world"}' -H "Content-Type: application/json"
```

## Run in Docker container

### With `docker run`

Create folder with name `config` and add files `client_secret.json` and `tokens.json`.

```bash
docker run -d --name google-assistant-broadcast \
-p 8085:8085 \
-v /path/to/volume/config:/usr/src/config \
--restart unless-stopped \
ismarslomic/google-assistant-broadcast
```

### With `docker-compose`

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

## Build Docker Image

```bash
docker build . -t ismarslomic/google-assistant-broadcast
```
