#!/bin/bash
#
# Common variables for all scripts

set -euo pipefail

# Include llvm binaries
export PATH=$PATH:$EMSDK/upstream/bin

# Root directory
ROOT_DIR=$PWD

# Directory to install headers and libraries
BUILD_DIR=$ROOT_DIR/build

# Directory to look for pkgconfig files
EM_PKG_CONFIG_PATH=$BUILD_DIR/lib/pkgconfig

# Toolchain file path for cmake
TOOLCHAIN_FILE=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake

OPTIM_FLAGS="-O3"

CFLAGS_BASE="$OPTIM_FLAGS -I$BUILD_DIR/include -s USE_PTHREADS=1"
CFLAGS="$CFLAGS_BASE "

export CFLAGS=$CFLAGS
export CXXFLAGS=$CFLAGS
export LDFLAGS="$CFLAGS -L$BUILD_DIR/lib"
export STRIP="llvm-strip"
export EM_PKG_CONFIG_PATH=$EM_PKG_CONFIG_PATH

echo "EMSDK=$EMSDK"
echo "CFLAGS(CXXFLAGS)=$CFLAGS"
echo "BUILD_DIR=$BUILD_DIR"
