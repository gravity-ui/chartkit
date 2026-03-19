#!/usr/bin/env bash
# Usage:
#   npm run test:docker:update                         - run all visual tests with --update
#   npm run test:docker:update -- <file-pattern>        - run only matching files (e.g. Base.visual, SplitTooltip)

set -euo pipefail

IMAGE_NAME="mcr.microsoft.com/playwright"
IMAGE_TAG="v$(cat package-lock.json | jq --raw-output '.packages."node_modules/playwright".version')-noble"

NODE_MODULES_CACHE_DIR="$HOME/.cache/chartkit-docker-node-modules"

command_exists() {
  command -v "$*" >/dev/null 2>&1
}

run_command() {
  $CONTAINER_TOOL run --rm --network host -it -w /work \
    -v $(pwd):/work \
    -v "$NODE_MODULES_CACHE_DIR:/work/node_modules" \
    -e CI=1 \
    -p 51204:51204 \
    "$IMAGE_NAME:$IMAGE_TAG" \
    /bin/bash -c "$*"
}

if command_exists docker; then
  CONTAINER_TOOL="docker"
elif command_exists podman; then
  CONTAINER_TOOL="podman"
else
  echo "Neither Docker nor Podman is installed on the system."
  exit 1
fi

if [[ "$*" = "clear-cache" ]]; then
  rm -rf "$NODE_MODULES_CACHE_DIR"
  exit 0
fi

if [[ ! -d "$NODE_MODULES_CACHE_DIR" ]]; then
  mkdir -p "$NODE_MODULES_CACHE_DIR"
  run_command 'npm ci'
fi

run_command "$*"
