#!/bin/bash

set -eo pipefail
source $(dirname $0)/var.sh

LIB_PATH=modules/ffmpeg
WASM_DIR=$ROOT_DIR/build/wasm
INFO_FILE=$WASM_DIR/info.txt

mkdir -p $WASM_DIR

FLAGS=(
  $CFLAGS
  -I. -I./fftools -I$BUILD_DIR/include
  -Llibavcodec -Llibavdevice -Llibavfilter -Llibavformat -Llibavresample -Llibavutil -Llibpostproc -Llibswscale -Llibswresample -Lrubberband -Lsamplerate -Lflite -L$BUILD_DIR/lib
  -Wno-deprecated-declarations -Wno-pointer-sign -Wno-implicit-int-float-conversion -Wno-switch -Wno-parentheses -Qunused-arguments
  -lavdevice -lavfilter -lavformat -lavcodec -lswresample -lswscale -lavutil -lpostproc -lm  -lmp3lame -logg -lopus -lrubberband -lsamplerate
  fftools/ffmpeg_opt.c fftools/ffmpeg_filter.c fftools/ffmpeg_hw.c fftools/cmdutils.c fftools/ffmpeg.c
  -lworkerfs.js
  -s USE_SDL=2
  -s INVOKE_RUN=0
  -s EXIT_RUNTIME=1
  -s MODULARIZE=1
  -s EXPORT_NAME="createFFmpegCore"
  -s EXPORTED_FUNCTIONS="[_main, ___wasm_init_memory_flag,_emscripten_proxy_main]"
  -s EXPORTED_RUNTIME_METHODS="[callMain, FS, WORKERFS, cwrap, ccall, setValue, writeAsciiToMemory]"
  -s INITIAL_MEMORY=128mb
  -s ALLOW_MEMORY_GROWTH=1
  -s MAXIMUM_MEMORY=4gb
  -s PROXY_TO_PTHREAD=1
  -pthread
  -o $WASM_DIR/ffmpeg.js
)
echo "FFMPEG_EM_FLAGS=${FLAGS[@]}"
(cd $LIB_PATH && \
    emmake make -j && \
    emcc "${FLAGS[@]}")

gzip --force -9 -c $WASM_DIR/ffmpeg.wasm > $WASM_DIR/ffmpeg.wasm.gz
#rm $WASM_DIR/ffmpeg.wasm

gzip --force -9 -c $WASM_DIR/ffmpeg.js > $WASM_DIR/ffmpeg.js.gz
#rm $WASM_DIR/ffmpeg.js

gzip --force -9 -c $WASM_DIR/ffmpeg.worker.js > $WASM_DIR/ffmpeg.worker.js.gz
#rm $WASM_DIR/ffmpeg.worker.js

echo "emcc ${FLAGS[@]}" > $INFO_FILE
echo "" >> $INFO_FILE

git config --get remote.origin.url >> $INFO_FILE
git rev-parse HEAD >> $INFO_FILE
echo "" >> $INFO_FILE

echo "EMCC (emcc -v)" >> $INFO_FILE
emcc -v >> $INFO_FILE
echo "" >> $INFO_FILE

git submodule foreach 'git config --get remote.origin.url && git rev-parse HEAD && echo ""' >> $INFO_FILE
