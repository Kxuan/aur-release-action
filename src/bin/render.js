#!/usr/bin/env node

const {render} = require('ejs');
const fs = require('fs');

if (process.argv.length < 3) {
    console.error("Error: Missing data json file path");
    process.exit(1);
}

function renderFile(filename) {
    const data = fs.readFileSync(filename, "utf-8");
    const params = fs.readFileSync(process.argv[2], "utf-8");
    const p = JSON.parse(params);
    return render(data, p, {});
}

if (process.argv.length > 3) {
    for (let file of process.argv.slice(3)) {
        process.stdout.write(renderFile(file));
    }
} else {
    process.stdout.write(renderFile(0));
}
