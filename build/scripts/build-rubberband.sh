#!/bin/bash

set -euo pipefail
source $(dirname $0)/var.sh

CONF_FLAGS=(
  --prefix=$BUILD_DIR                                 # install library in a build directory for FFmpeg to include
  --host=i686-gnu                                     # use i686 linux
  --enable-shared=no                                  # not to build shared library
  --disable-asm                                       # not to use asm
  --disable-rtcd                                      # not to detect cpu capabilities
  --disable-doc                                       # not to build docs
  --disable-extra-programs                            # not to build demo and tests
  --disable-stack-protector
)
echo "CONF_FLAGS=${CONF_FLAGS[@]}"

LIB_PATH1=modules/libsamplerate
(cd $LIB_PATH1 && \
  emconfigure ./autogen.sh && \
  CFLAGS=$CFLAGS emconfigure ./configure "${CONF_FLAGS[@]}")
emmake make -C $LIB_PATH1 clean
emmake make -C $LIB_PATH1 install

LIB_PATH2=modules/libsndfile
(cd $LIB_PATH2 && \
  emconfigure ./autogen.sh && \
  CFLAGS=$CFLAGS emconfigure ./configure "${CONF_FLAGS[@]}")
emmake make -C $LIB_PATH2 clean
emmake make -C $LIB_PATH2 install

LIB_PATH=modules/rubberband
(CPATH="${BUILD_DIR}/include" \
  OPTFLAGS="${OPTIM_FLAGS} -DNDEBUG -ffast-math -ftree-vectorize" \
  emmake make -C $LIB_PATH -f otherbuilds/Makefile.em clean distclean default)

cp $LIB_PATH/lib/librubberband.a $BUILD_DIR/lib
cp $LIB_PATH/rubberband.pc.in $EM_PKG_CONFIG_PATH/rubberband.pc
sed -i -e 's,%PREFIX%,'"$BUILD_DIR"',g' $EM_PKG_CONFIG_PATH/rubberband.pc
  
mkdir -p $BUILD_DIR/include/rubberband
cp $LIB_PATH/rubberband/RubberBandStretcher.h $BUILD_DIR/include/rubberband/RubberBandStretcher.h
cp $LIB_PATH/rubberband/rubberband-c.h $BUILD_DIR/include/rubberband/rubberband-c.h
