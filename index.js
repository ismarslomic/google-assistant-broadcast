"use strict";

require('log-timestamp');
const express = require("express");
const Assistant = require("./assistant");

const server = express()
const port = 8085;
const assistant = new Assistant();

// Validate required files
assistant.validateFiles()

server.use(express.json())

// Respond only on POST /broadcast route
server.post("/broadcast", (req, res) => {
  if (!req.body || !req.body.message || req.body.message.len < 2) {
    res.status(400).json(
        {error: "Expecting valid JSON body with 'message' property with length of minimum 2 characters."});
  } else {
    assistant.cast(req.body.message)
    .then((response) => {
      res.json({response: response});
    })
    .catch((error) => {
      res.status(500).json({error: error});
    })
  }
})

// All other routes shall return HTTP 404
server.use((req, res) => {
  res
  .status(404)
  .json({error: "Only POST /broadcast endpoint is supported"});
})

// Gracefully shutdown ExpressJS
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  })
})

server.listen(port, () => {
  console.log(
      `Google Assistant Broadcast started at: http://localhost:${port}`);
});
