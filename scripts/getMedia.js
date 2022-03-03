module.exports = function(path) {
    
};


function getMedia(index) {
    try {
        const base = `./media/${index}/`;
        const files = fs.readdirSync(base);
        let search = false;
        while (!search) {
            search = true;
            for (let i = 0; i < files.length; i++) {
                if (fs.lstatSync(base + files[i]).isDirectory()) {
                    const newFiles = fs.readdirSync(base + files[i]);
                    for (const j in newFiles) {
                        files.push(`${files[i]}/${newFiles[j]}`);
                    }
                    files.splice(i, 1);
                    i -= 1;
                }
            }
        }
        files.sort((a, b) => fs.statSync(base + b).size - fs.statSync(base + a).size);
        const videoPath = base + files[0];
        const subtitlePath = base + files.filter((i) => i.includes(".srt"))[0];
        const subtitle = fs.readFileSync(subtitlePath, "utf8");
        return [videoPath, subtitle];
    } catch (e) {
        return false;
    }
}