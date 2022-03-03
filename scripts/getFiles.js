const fs = require("fs");

module.exports = function(path) {
    const filesObject = {};
    fs.readdirSync(path).forEach((file) => {
        if (fs.statSync(`${path}/${file}`).isDirectory()) {
            const innerFiles = module.exports(`${path}/${file}`);
            for (const i in innerFiles) {
                filesObject[i] = innerFiles[i];
            }
        } else {
            filesObject[file] = `${path}/${file}`;
        }
    });
    return filesObject;
};
