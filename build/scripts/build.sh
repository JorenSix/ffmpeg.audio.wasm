#!/bin/bash

set -eo pipefail

SCRIPT_ROOT=$(dirname $0)

$SCRIPT_ROOT/init-dependencies.sh

source ./modules/emsdk/emsdk_env.sh

emcc -v

#$SCRIPT_ROOT/build-zlib.sh
$SCRIPT_ROOT/build-lame.sh
#$SCRIPT_ROOT/build-libvpx.sh
#$SCRIPT_ROOT/build-libwebp.sh
$SCRIPT_ROOT/build-ogg.sh
$SCRIPT_ROOT/build-opus.sh
$SCRIPT_ROOT/build-rubberband.sh
#$SCRIPT_ROOT/build-theora.sh
$SCRIPT_ROOT/build-vorbis.sh
#$SCRIPT_ROOT/build-x264.sh
#$SCRIPT_ROOT/build-x265.sh

$SCRIPT_ROOT/configure-ffmpeg.sh
$SCRIPT_ROOT/build-ffmpeg.sh
