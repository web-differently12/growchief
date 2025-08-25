#!/usr/bin/env bash

docker kill growchief || true 
docker rm growchief || true 
docker create --name growchief -p 3000:3000 -p 4200:4200 localhost/growchief
