FROM archlinux:base-devel
RUN pacman -Sy --needed --noconfirm \
      git \
      npm \
      nodejs \
      openssh \
      pacman-contrib \
      rsync \
      sudo

COPY . /action
WORKDIR /action
RUN npm install

WORKDIR $GITHUB_WORKSPACE
ENTRYPOINT ["/action/bin/entrypoint.sh"]
