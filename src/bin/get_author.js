#!/usr/bin/env node

const core = require("@actions/core");
const url = require("url");
const mimelib = require("mimelib-noiconv");
const argparse = require("argparse");
const {Octokit} = require("@octokit/rest");
const fs = require('fs/promises');

function take_from_input(what) {
    const inputAuthor = core.getInput("author");
    if (!inputAuthor) {
        return
    }
    const author = mimelib.parseAddresses(inputAuthor)[0];
    switch (what) {
        case "name":
            return author.name;
        case "email":
            return author.address;
    }
}

function parse_repo_from_release(release) {
    const u = new url.URL(release["html_url"]);
    const t = u.pathname.split("/");
    return {
        owner: t[1],
        repo: t[2],
    }
}

async function take_from_github(release_file, what) {
    const octokit = new Octokit({
        auth: core.getInput('token') || process.env['GITHUB_TOKEN'],
    });
    const release = JSON.parse(await fs.readFile(release_file, 'utf-8'));
    const repo = parse_repo_from_release(release);
    const {data: all_commits} = await octokit.repos.listCommits({
        owner: repo.owner,
        repo: repo.repo,
        sha: release['target_commitish'],
        per_page: 1,
        page: 1
    });

    if (all_commits.length < 1) {
        throw new Error("unable to find the commit which is associated to the release");
    }
    const commit = all_commits[0];
    return commit.commit.author[what];
}

const parser = new argparse.ArgumentParser({
    description: 'get author',
});
parser.add_argument('-r', '--release', {help: 'release info file', required: true})
parser.add_argument('what', {
    help: 'what do you want',
    choices: ['name', 'email'],
})

async function run() {
    const args = parser.parse_args();

    const result = take_from_input(args.what) || await take_from_github(args.release, args.what);
    process.stdout.write(result);
}

run().catch((reason) => {
    console.error(reason);
    process.exit(1);
});