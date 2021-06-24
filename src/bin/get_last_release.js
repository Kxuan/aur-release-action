#!/usr/bin/env node

const {Octokit} = require("@octokit/rest");
const core = require("@actions/core");

async function getLastRelease(repoName) {
    const t = repoName.split('/', 2);
    const octokit = new Octokit({
        auth: core.getInput('token') || process.env['GITHUB_TOKEN'],
    });
    const repo = {
        owner: t[0], repo: t[1],
    };

    const {data: release} = await octokit.repos.getLatestRelease({
        owner: repo.owner,
        repo: repo.repo,
    });

    return release;
}

async function run() {
    if (process.argv.length !== 3) {
        console.error("Error: No repo passed in arguments");
        process.exit(1);
    }
    const release = await getLastRelease(process.argv[2]);
    process.stdout.write(JSON.stringify(release));
    process.exit(0);
}

run().catch((reason) => {
    console.error(reason);
    process.exit(1);
});