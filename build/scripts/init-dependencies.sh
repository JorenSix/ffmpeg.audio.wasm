#!/bin/bash

cmds=()

# Detect what dependencies are missing.
for cmd in autoconf autogen automake libtool pkg-config ragel
do
  if ! command -v $cmd &> /dev/null
  then
    cmds+=("$cmd")
  fi
done

# Install missing dependencies
if [ ${#cmds[@]} -ne 0 ];
then
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    apt-get update
    apt-get install -y ${cmds[@]}
  else
    brew install ${cmds[@]}
  fi
fi

cd modules/emsdk/
git pull
./emsdk install 3.1.2
./emsdk activate 3.1.2
cd ../../