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

export default parseSubs;
