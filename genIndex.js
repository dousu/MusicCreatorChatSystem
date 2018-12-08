const glob = require('glob');
const fs = require('fs');
glob('./abc/*.abc', (_, files) => {
    files.sort((a, b) => {
        return Number(a.match(/\d+/)) - Number(b.match(/\d+/));
    });
    fs.writeFileSync(__dirname + '/static/index.json', JSON.stringify(files.map((file) => fs.readFileSync(file, 'utf-8'))))
});