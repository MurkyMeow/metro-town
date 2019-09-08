#!/usr/bin/env bash
mkdir "${HOME}/.npm"
npm config set prefix "${HOME}/.npm"
npm install -g gulp
