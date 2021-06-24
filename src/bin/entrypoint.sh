#!/bin/bash
set -e

mkdir -p /action/work

export PATH="$PATH:/action/bin"

get_last_release.js "${INPUT_REPO:-$GITHUB_REPOSITORY}" > /action/work/release.json
render.js /action/work/release.json < "$INPUT_PKGBUILD" > /action/work/PKGBUILD
render.js /action/work/release.json <<< "$INPUT_COMMIT_MSG" > /action/work/commit_msg

echo "$INPUT_SSH_PRIVATE_KEY" > /action/work/ssh_private_key

useradd -m aur
sudo -E -u aur mkdir -p ~aur/.ssh
echo '
Host aur
    User aur
    Hostname aur.archlinux.org
    IdentityFile /action/work/ssh_private_key
    IdentitiesOnly yes
    StrictHostKeyChecking no
' >> ~aur/.ssh/config

mkdir /action/aur
chown aur:aur /action/aur
sudo -E -u aur run_as_aur.sh