#!/bin/bash

rm -rf build
rm -rf modules
git submodule sync --recursive
git submodule update --init --recursive --remote
