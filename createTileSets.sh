FILES=./vectorjson/*

for f in $FILES
do

echo "Processing $f"

outputfn=$(basename $f .tif)
tippecanoe -zg -o $outputfn.mbtiles -l apcontours --drop-densest-as-needed $f

done
