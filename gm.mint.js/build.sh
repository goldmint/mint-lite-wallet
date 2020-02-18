#!/bin/bash

export GOOS=js
export GOARCH=wasm

go build -o dist/mint.wasm mint.go
