#!/bin/sh

rsync -av amxa.ch:public_html/speierling/gis/ --exclude site/node/ --exclude node-editor gis/.


