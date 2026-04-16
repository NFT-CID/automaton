#!/bin/sh
set -eu

cd /app

CONFIG_FILE="${HOME:-/root}/.automaton/automaton.json"

if [ "$#" -eq 0 ]; then
  set -- --run
fi

if [ "$1" = "--run" ] && [ ! -f "$CONFIG_FILE" ]; then
  if [ -n "${AUTOMATON_NAME:-}" ] && [ -n "${AUTOMATON_GENESIS_PROMPT:-}" ] && [ -n "${AUTOMATON_CREATOR_ADDRESS:-}" ]; then
    echo "[docker] No config found. Bootstrapping from environment variables..."
    node /app/docker/bootstrap.mjs
  elif [ -t 0 ] && [ -t 1 ]; then
    echo "[docker] No config found. Launching interactive setup..."
    exec node dist/index.js --setup
  else
    echo "[docker] No config found at ${CONFIG_FILE}."
    echo "[docker] Run an interactive first setup:"
    echo "[docker]   docker compose run --rm automaton --setup"
    echo "[docker] or provide these env vars for unattended bootstrap:"
    echo "[docker]   AUTOMATON_NAME, AUTOMATON_GENESIS_PROMPT, AUTOMATON_CREATOR_ADDRESS"
    exit 1
  fi
fi

exec node dist/index.js "$@"
