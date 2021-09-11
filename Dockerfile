FROM ubuntu:20.04

COPY . /app
WORKDIR /app

RUN apt-get update
RUN apt-get install -y systemd wget gnupg

# mongodb
RUN wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
RUN echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
RUN apt-get update
RUN apt-get install -y mongodb-org
RUN systemctl start mongod
RUN systemctl enable mongod

# create monbodb database
RUN mongo pony_db --eval "db.new_collection.insert({ some_key: 'some_value' })"
RUN mongo pony_db --eval "db.createUser({ user: 'admin', pwd: 'admin', roles: [{ role: 'readWrite', db: 'your_database_name' }] })"

# git
RUN apt-get install -y git

# git-lfs
RUN curl -sLO https://github.com/github/git-lfs/releases/download/v2.0.1/git-lfs-linux-amd64-2.0.1.tar.gz
RUN tar xf git-lfs-linux-amd64-2.0.1.tar.gz && mv git-lfs-2.0.1/git-lfs /usr/bin/ && rm -Rf git-lfs-2.0.1
RUN git lfs install && git lfs fetch && git lfs pull

# nodejs
RUN wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
RUN nvm install v9

# npm deps and build
RUN npm i -g pm2
RUN npm i
RUN npm run build-sprites

CMD ["./start.sh"]
