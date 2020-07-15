FILES=./vectorjson/*

for f in $FILES
do

echo "Processing $f"

outputfn=$(basename $f .tif)
tippecanoe -zg -o $outputfn.mbtiles -l apcontours --drop-densest-as-needed $f

done

#tippecanoe -zg -o sampleframe_binned.mbtiles -l apcontours .vectorjson/contours/contours1.json
