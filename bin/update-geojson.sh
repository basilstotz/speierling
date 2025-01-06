#!/bin/sh

cd "$(dirname $0)/../."
cat ./osm/sorbusdomestica.geojson | ./bin/add-pics.js ./tmp/bilder.json | \
    ./bin/add-project.js ./tmp/project.json | tee sorbusdomestica.geojson | \
    ./bin/beautify.js 2>beautify.log  > ./site/sorbusdomestica.geojson
cat ./site/sorbusdomestica.geojson | ./bin/reduce.js | ./bin/flatten-tags.js > ../sorbusdomestica.geojson
cat ./site/sorbusdomestica.geojson | ./bin/make-geo-diff.js > ./site/sorbusdomestica-diff.geojson
echo "done"