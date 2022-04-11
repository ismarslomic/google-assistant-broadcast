"use strict";

const GoogleAssistant = require("google-assistant");

/** See https://github.com/endoplasmic/google-assistant for more info **/
const config = {
  auth: {
    keyFilePath: process.env.CLIENT_SECRET
        || "/usr/src/config/client_secret.json",
    // where you want the tokens to be saved
    // will create the directory if not already there
    savedTokensPath: process.env.TOKEN || "/usr/src/config/tokens.json"
  },
  conversation: {
    lang: 'en-US', // defaults to en-US, but try other ones, it's fun!
    showDebugInfo: true, // default is false, bug good for testing AoG things,
    isNew: true,
  },
};

function Assistant() {

  this.cast = async (message) => {
    const assistant = new GoogleAssistant(config.auth);
    config.conversation.textQuery = `Broadcast ${message}`;

    console.log("Sending message:", config.conversation.textQuery);

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
