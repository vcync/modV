const express = require("express");

export default function createHttpServer() {
  const fileServerApp = express();
  fileServerApp.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  fileServerApp.use(express.static(this.mediaDirectoryPath));
  return fileServerApp;
}
