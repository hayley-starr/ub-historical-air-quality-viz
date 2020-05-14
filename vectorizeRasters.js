import { contours } from 'd3-contour';
import { geoTransform } from 'd3-geo';
import { geoProject } from 'd3-geo-projection';
import * as gdal from 'gdal';
import fs from 'fs';


// write geojson to file
const writeJsonData = function(geojson, filename) {
    // convert JSON object to string
    const data = JSON.stringify(geojson);

    // write JSON string to a file
    fs.writeFile(filename, data, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
}


const vectorizeRasterFrame = function(inputFilename, outputFilename, frameId) {
    console.log('vectorizing tif file: ' + inputFilename + '...');

    let gdalDataset = gdal.open(inputFilename);
    
    // get the raster with the data
    let band = gdalDataset.bands.get(1);
    let width = band.size.x-1; 
    let height = band.size.y-1;

    //read data into an array of length widthxheight so that d3.contours can work
    let array = band.pixels.read(0, 0, width, height);

    // generate array of multipolygons that represent the contours of the data
    var polygons = contours()
        .size([width, height]) // later can custom threshold, too
        (array);

    let resultgeojson = {
        type: 'FeatureCollection',
        features: []
    };

    polygons.forEach((polygon) => {
        resultgeojson.features.push({
            type: 'Feature',
            properties: {
                value: polygon.value,
                idx: frameId // different for each frame so can select appropriate polygons
             },
            geometry: {
                type: 'MultiPolygon',
                coordinates: polygon.coordinates
            }
        });
    });
    
    var geotransf = gdalDataset.geoTransform;
    
    let geoProjectionForRaster = geoTransform({
        point: function(x, y) {
            var xGeo = geotransf[0] + x*geotransf[1] + y*geotransf[2];
            var yGeo = geotransf[3] + x*geotransf[4] + y*geotransf[5];
    
            this.stream.point(xGeo, yGeo);
        }
      });
    
    let lonLatPolygons = geoProject(resultgeojson, geoProjectionForRaster);
    
    writeJsonData(lonLatPolygons, outputFilename);
}

const main = () => {

    // get tif filenames from data directory
    var files = fs.readdirSync('./R/sample_data/sample_frame_tifs');

    // for each file, vectorize and save
    files.forEach(filename => {
        var patt = new RegExp(/\d+/);
        var res = patt.exec(filename);
        var frameId = res[0];

        let inputFilename = './R/sample_data/sample_frame_tifs/' + filename;
        let outputFilename = 'vectorjson/samplecontours' + frameId + '.json';    
        vectorizeRasterFrame(inputFilename, outputFilename, frameId);
    });
}

main();







