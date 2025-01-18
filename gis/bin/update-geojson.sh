#!/bin/sh

cd "$(dirname $0)/../."

pwd

cat ./osm/sorbusdomestica.geojson | \
            ./bin/add-pics.js ./tmp/bilder.json | \
            ./bin/add-project.js ./tmp/project.json | \
            ./bin/add-history.js ./update-history/history.geojson | \
	    ./bin/add-historic.js |  tee sorbusdomestica.geojson | \
            ./bin/beautify.js 2>beautify.log  > ./site/sorbusdomestica.geojson

cat ./site/sorbusdomestica.geojson | ./bin/reduce.js | ./bin/flatten-tags.js > ../sorbusdomestica.geojson

./bin/update-history.sh >> ./update-history/update-history.log

echo "done"

