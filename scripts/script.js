/* global $ io */
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
    // const track = video.addTextTrack("subtitles", "English", "en");
    // track.mode = "showing";
    // parseSubs(subs).map((cue) => track.addCue(cue));
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
        socket.emit("selectVideo", $("#videoSelector")[0].value);
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

/*
// Declaring global variables.
let player;
let video;

// Subtitle parser functions.
function parseTime(s) {
    const match = s.match(/^(?:([0-9]{2,}):)?([0-5][0-9]):([0-5][0-9][.,][0-9]{0,3})/);
    const hours = parseInt(match[1] || "0", 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseFloat(match[3].replace(",", "."));
    return seconds + 60 * minutes + 60 * 60 * hours;
}

function parseSubs(srt) {
    const lines = srt.trim().replaceAll("\r\n", "\n").split("\n");
    const cues = [];
    let start = null;
    let end = null;
    let payload = null;
    for (const i in lines) {
        if (/-->/.test(lines[i])) {
            const timeData = lines[i].split(/[ \t]+-->[ \t]+/);
            start = parseTime(timeData[0]);
            end = parseTime(timeData[1]);
        } else if (lines[i] === "" && start && end) {
            cues.push(new VTTCue(start, end, payload));
            start = null;
            end = null;
            payload = null;
        } else if (start && end) {
            if (payload) {
                payload += `\n${lines[i]}`;
            } else {
                payload = lines[i];
            }
        }
    }
    return cues;
}

socket.on("readyVideo", (data) => {
    const path = data[0];
    const subs = data[1];
    player.attr("src", path);
    player.attr("type", `video/${path.substring(path.length - 3)}`);
    const track = video.addTextTrack("subtitles", "English", "en");
    track.mode = "showing";
    parseSubs(subs).map((cue) => track.addCue(cue));
});

// DOM load jQuery.
$(() => {
});
*/
