const port = 80;
const express = require("express");

const app = express();
const fs = require("fs");

const options = {};

const httpForm = "http";
const http = require(httpForm).Server(options, app);
const io = require("socket.io")(http);

// Initialising server.
app.use(express.static(__dirname));
app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});
http.listen(port, () => {
    console.log(`>> Standing by on port: ${port}\n`);
});
