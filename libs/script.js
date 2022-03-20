/* global $ io */
// Requiring subs modules.
import parseSubs from "./parseSubs.js";

// Setting up player.
const socket = io();
let player = {};
let video = {};

// Socket events.
socket.on("videoList", (videos) => {
    for (const file in videos) {
        $("#videoSelector").append(`<option>${file}</option>`);
    }
});

socket.on("getVideo", (path) => {
    player.attr("src", path);
    player.attr("type", `video/${path.substring(path.length - 3)}`);
});

socket.on("subs", (subs) => {
    const track = video.addTextTrack("subtitles", "English", "en");
    track.mode = "showing";
    parseSubs(subs).map((cue) => track.addCue(cue));
});

socket.on("torrentInfo", (torrentInfo) => {
    $("#torrent").text(`${torrentInfo.progress} %`);
    $("#magnetLink")[0].value = `${torrentInfo.name} : ${torrentInfo.downloaded} Mb / ${torrentInfo.size} Mb : ETA ${torrentInfo.timeLeft} seconds.`;
    $("#torrent").prop("disabled", true);
    $("#torrent").css("background-color", "grey");
});

socket.on("torrentDone", (message) => {
    $("#torrent").text("Torrent");
    $("#magnetLink")[0].value = message || "";
    $("#torrent").prop("disabled", false);
    $("#torrent").css("background-color", "darkslategray");
});

// Socket events.
socket.on("play", () => {
    if (video.paused) video.play();
});

socket.on("pause", () => {
    if (video.paused === false) video.pause();
});

socket.on("sync", (time) => {
    if (video.paused === false) video.pause();
    video.currentTime = time;
});

// DOM Load Jquery.
$(() => {
    player = $("#player");
    video = player[0];

    $("#videoSelector").change(() => {
        if ($("#videoSelector")[0].value.match(/.*.srt/)) {
            socket.emit("selectSubs", $("#videoSelector")[0].value);
        } else {
            socket.emit("selectVideo", $("#videoSelector")[0].value);
        }
    });

    $("#torrent").click(() => {
        $("#torrent").prop("disabled", true);
        $("#torrent").css("background-color", "grey");
        socket.emit("torrent", $("#magnetLink")[0].value);
    });

    $("#play").click(() => {
        socket.emit("playAll");
    });

    $("#pause").click(() => {
        socket.emit("pauseAll");
    });

    $("#sync").click(() => {
        socket.emit("syncAll", video.currentTime);
    });
});
