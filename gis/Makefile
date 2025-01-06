.PHONY: all
all: site/sorbusdomestica.geojson

site/sorbusdomestica.geojson: tmp/project.json tmp/bilder.json
	echo "" > beautify.log 
	cat ./osm/sorbusdomestica.geojson | ./bin/add-pics.js ./tmp/bilder.json | \
            ./bin/add-project.js ./tmp/project.json | tee sorbusdomestica.geojson | \
            ./bin/beautify.js 2>beautify.log  > ./site/sorbusdomestica.geojson
	cat ./site/sorbusdomestica.geojson | ./bin/reduce.js | ./bin/flatten-tags.js > ../sorbusdomestica.geojson
	cat ./site/sorbusdomestica.geojson | ./bin/make-geo-diff.js > ./site/sorbusdomestica-diff.geojson

#	./bin/geojson2js.sh ./site/sorbusdomestica.geojson  > ./site/sorbusdomestica.js

tmp/bilder.json: node  
	./bin/make-bilder.sh ./site/node  | ./bin/make-media.js > ./tmp/bilder.json


tmp/project.json: projekt.csv
	csv2json -d ./projekt.csv ./tmp/project.json 

.PHONY: node
node:
	@test -d ../Gemeinden || (echo "../Gemeinden not found";false)
	./bin/convert-all.sh ../Gemeinden ./site/node

.PHONY: archive
archive:
	./bin/archive.sh	

########################################################################################
osm/sorbusdomestica.geojson:
	$(MAKE) -C ./osm all
