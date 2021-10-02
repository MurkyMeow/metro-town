FROM node:9

WORKDIR /app

COPY . .

RUN npm i

# pull sprites via git-lfs and build them
RUN curl -sLO https://github.com/github/git-lfs/releases/download/v2.0.1/git-lfs-linux-amd64-2.0.1.tar.gz
RUN tar xf git-lfs-linux-amd64-2.0.1.tar.gz && mv git-lfs-2.0.1/git-lfs /usr/bin/ && rm -rf git-lfs-2.0.1 git-lfs-linux-amd64-2.0.1.tar.gz
RUN git lfs install && git lfs fetch && git lfs pull
RUN npx gulp sprites

RUN npm i -g pm2

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
