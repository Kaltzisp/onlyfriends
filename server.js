const port = process.env.PORT || 8000;
const express = require("express");

const app = express();
const http = require("http").Server(app);
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
const fs = require("fs");
const getFiles = require("./scripts/getFiles");

// Setting up torrent client.
const client = new WebTorrent();

// Getting video paths.
const videos = getFiles("./media");

// Socket.io events.
io.on("connection", (socket) => {
    socket.emit("videoList", videos);

    socket.on("selectVideo", (fileName) => {
        const videoPath = videos[fileName];
        socket.emit("getVideo", videoPath);
    });

    socket.on("selectSubs", (fileName) => {
        const subs = fs.readFileSync(`./media/${fileName}`, "utf-8");
        console.log(subs);
        socket.emit("subs", subs);
    });

    socket.on("torrent", (data) => {
        const magnet = data;
        client.add(magnet, { path: `./media/` }, (torrent) => {
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
