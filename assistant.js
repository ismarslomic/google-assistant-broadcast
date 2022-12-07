"use strict";

const GoogleAssistant = require("google-assistant");
const fs = require("fs");

/** See https://github.com/endoplasmic/google-assistant for more info **/
const config = {
  auth: {
    keyFilePath: process.env.CLIENT_SECRET
        || "/usr/src/config/client_secret.json",
    savedTokensPath: process.env.TOKEN || "/usr/src/config/tokens.json"
  },
  conversation: {
    lang: process.env.LANGUAGE || 'en-GB', // defaults to en-GB, but try other ones, it's fun!
    isNew: true,
  },
};

const checkFileExistsSync = (filepath) => {
  let exists = true;

  try {
    fs.accessSync(filepath, fs.constants.F_OK);
  } catch (e) {
    exists = false;
  }

  return exists;
};

const readJsonFile = (filepath) => {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    console.log(e);
    exitAndLogError(`Failed reading JSON file at path ${filepath}`)
  }
}

const exitAndLogError = (errorMsg) => {
  console.log(`[ERROR] ${errorMsg}`)
  process.exit(1)
}

function Assistant() {
  this.validateFiles = () => {
    if (!checkFileExistsSync(config.auth.keyFilePath)) {
      exitAndLogError(
          `Client Secret file at path '${config.auth.keyFilePath}' does not exist.`)
    }

    if (!checkFileExistsSync(config.auth.savedTokensPath)) {
      exitAndLogError(
          `Tokens file at path '${config.auth.savedTokensPath}' does not exist.`)
    }

    const secretFileContent = readJsonFile(config.auth.keyFilePath).installed;

    if (secretFileContent.token_uri !== "https://oauth2.googleapis.com/token") {
      exitAndLogError(
          `The Client Secret file at path '${config.auth.keyFilePath}' has invalid 'token_uri' value. Expecting value 'https://oauth2.googleapis.com/token', but was '${secretFileContent.token_uri}'. Please make sure you download OAuth client file from GCP Console / API & Services / Credentials.`)
    }

    if (!secretFileContent.redirect_uris) {
      exitAndLogError(
          `The Client Secret file at path '${config.auth.keyFilePath}' is missing 'redirect_uris' property. Please make sure you download OAuth client file from GCP Console / API & Services / Credentials.`)
    }
  }

  this.cast = async (message) => {
    const assistant = new GoogleAssistant(config.auth);

    if(process.env.APPEND_BROADCAST_TO_MESSAGE === "false"){
      config.conversation.textQuery = `${message}`;
    } else {
      config.conversation.textQuery = `Broadcast ${message}`;
    }

    console.log(`Sending message (${config.conversation.lang}):`,
        config.conversation.textQuery);

    return new Promise((resolve, reject) => {
      assistant
      .on("ready", () => assistant.start(config.conversation))
      .on("started", (conversation) => {
        conversation
        .on("response", (text) => {
          const response = text || "empty"
          console.log("[OK] Conversation Response: ", response);
          resolve(response);
        })
        .on('ended', (error, continueConversation) => {
          if (error) {
            console.log('[ERROR] Conversation Ended Error:', error);
          } else if (continueConversation) {
            console.log('[WARN] Conversation continue is not handled');
          } else {
            console.log('[OK] Conversation Completed');
            conversation.end();
          }
        })
        .on("error", (error) => {
          console.log("[ERROR] Error while broadcasting:", error);
          reject(new Error(`Error while broadcasting: ${error}`));
        })
      })
      .on("error", (error) => {
        console.log("[ERROR] Error while broadcasting: ", error);
        reject(new Error(`Error while broadcasting: ${error}`));
      });
    })
  }
}

module.exports = Assistant;
