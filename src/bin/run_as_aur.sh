#!/bin/bash
# since makepkg can not run as root, we need this script to do some job as non-root user
set -x
set -e
TOOL_DIR=$(readlink -f "$(dirname "$0")")
function get_package_name() {
    (
      source /action/work/PKGBUILD
      echo $pkgname
    )
}

package_name=$(get_package_name)

git clone --depth=1 ssh://aur/${package_name}.git /action/aur
RSYNC_OPTS=(
  -a
  --cvs-exclude
)
if [[ -f .aurignore ]]; then
  RSYNC_OPTS+=(--exclude-from=.aurignore)
fi
rsync "${RSYNC_OPTS[@]}" . /action/aur/.

cp /action/work/PKGBUILD /action/aur/PKGBUILD
cd /action/aur

updpkgsums
makepkg --printsrcinfo > .SRCINFO
git config user.name "$(get_author.js -r /action/work/release.json name)"
git config user.email "$(get_author.js -r /action/work/release.json email)"
git add PKGBUILD .SRCINFO
git add -u
git commit -v -F /action/work/commit_msg

case "$INPUT_BUILD_STEP" in
download)  ;;
extract) makepkg --noconfirm -so --noprepare ;;
prepare) makepkg --noconfirm -so ;;
build) makepkg --noconfirm -s --nocheck --noarchive ;;
check) makepkg --noconfirm -s --check;;
install) makepkg --noconfirm -si --check ;;
*)
  echo "Unsupported \"${INPUT_BUILD_STEP}\" for \"build_step\" parameter."
  exit 1
  ;;
esac
git push