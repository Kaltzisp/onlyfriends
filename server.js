// Determining environment.
let test = true;
if (process.env.OS !== "Windows_NT") {
    test = false;
}

const port = 443;
const express = require("express");

const app = express();
const fs = require("fs");

const options = test ? {} : {
    key: fs.readFileSync("/etc/letsencrypt/live/daal.me/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/daal.me/fullchain.pem")
};

const httpForm = test ? "http" : "https";
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

// Requiring modules.
const WebTorrent = require("webtorrent");
const getFiles = require("./libs/getFiles");

// Setting up torrent client.
const client = new WebTorrent();

// Getting video paths.
let videos = getFiles("./media");

// Socket.io events.
io.on("connection", (socket) => {
    videos = getFiles("./media");
    socket.emit("videoList", videos);

    socket.on("selectVideo", (fileName) => {
        const videoPath = videos[fileName];
        socket.emit("getVideo", videoPath);
    });

    socket.on("selectSubs", (fileName) => {
        const subs = fs.readFileSync(videos[fileName], "utf-8");
        socket.emit("subs", subs);
    });

    socket.on("torrent", (data) => {
        const magnet = data;
        client.add(magnet, { path: "./media/" }, (torrent) => {
            const info = setInterval(() => {
                const torrentInfo = {
                    name: torrent.name,
                    timeLeft: Math.round(torrent.timeRemaining / 1000),
                    progress: Math.round(torrent.progress * 10000) / 100,
                    downloaded: Math.round(torrent.downloaded / 1000000),
                    size: Math.round(torrent.length / 1000000)
                };
                io.emit("torrentInfo", torrentInfo);
            }, 1000);
            torrent.on("done", () => {
                io.emit("videoList", videos);
                torrent.destroy();
                clearInterval(info);
                io.emit("torrentDone");
            });
        }).on("error", (err) => {
            io.emit("torrentDone", err);
        });
    });

    socket.on("playAll", () => {
        io.emit("play");
    });

    socket.on("pauseAll", () => {
        io.emit("pause");
    });

    socket.on("syncAll", (time) => {
        io.emit("sync", time);
    });
});
