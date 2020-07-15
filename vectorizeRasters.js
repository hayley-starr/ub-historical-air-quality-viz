import { contours } from 'd3-contour';
import { geoTransform } from 'd3-geo';
import { geoProject } from 'd3-geo-projection';
import * as gdal from 'gdal';
import fs from 'fs';
import { component_subscribe } from 'svelte/internal';
// import polygonize from '@turf/polygonize';
// import polygonToLine from '@turf/polygon-to-line';
// import { multiPolygon } from '@turf/helpers';
import * as turf  from 'turf';


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
    let band = gdalDataset.bands.get(1);

    let width = band.size.x-1; 
    let height = band.size.y-1;

    //read data into an array of length widthxheight so that d3.contours can work
    let array = band.pixels.read(0, 0, width, height);
    let bandThresholds = [1,2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

    // generate array of multipolygons that represent the contours of the data
    var contourPolygons = contours()
        .size([width, height])
        .thresholds(bandThresholds)
        (array);

    // var finalPolygons = [];
    // var prevBandLines;
    // var prevBandValue;
    
    // contourPolygons.forEach((contourPolygon) => {
    //     // create lines from the polygon
    //     let turfPolygon = turf.multiPolygon(contourPolygon.coordinates);
    //     let currBandLines = turf.polygonToLine(turfPolygon);
        
    //     console.log('-----------------------');
    //     console.log('current polygon: ', contourPolygon.value);

    //     if (prevBandLines) { //compute a polygon

    //         prevBandLines.features = prevBandLines.features.concat(currBandLines.features);

    //         console.log(prevBandLines);

    //         let prevBandPolygon = turf.polygonize(prevBandLines);
    //         console.log('FINISHED WITH BAND')
    //         // prevBandPolygon.value = prevBandValue;

    //         // finalPolygons.push(prevBandPolygon);
    //     }
      

    //     prevBandLines = currBandLines;
    //     prevBandValue = contourPolygon.value;
    // });    

    // console.log('PREV BAND VALUE FINAL');
    // console.log(prevBandValue);

     let resultgeojson = {
        type: 'FeatureCollection',
        features: []
    };

    var prevPolygon; 

    contourPolygons.forEach((contourPolygon) => {
        let currPolygon = turf.multiPolygon(contourPolygon.coordinates);

        if (prevPolygon) { // compute a polygon based on difference of two bins
            let newPolygon = turf.difference(prevPolygon, currPolygon);
            if (!newPolygon) return;
            newPolygon.properties = {test_value: contourPolygon.value};
            //console.log(newPolygon);
        
            resultgeojson.features.push({
                type: 'Feature',
                properties: {
                    value: contourPolygon.value,
                    idx: frameId // different for each frame so can select appropriate polygons
                    },
                geometry: {
                    type: 'MultiPolygon',
                    coordinates: newPolygon.geometry.coordinates
                }
            });
        }
        prevPolygon = currPolygon;
    });  
    
    console.log('FINAL POLYGONS');
    console.log(resultgeojson)

    
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
    var files = fs.readdirSync('./R/data/frame_tifs');

    // for each file, vectorize and save
    files.forEach(filename => {
        console.log(filename);
        var patt = new RegExp(/\d+/);
        var res = patt.exec(filename);
        var frameId = 1; //res[0]; TODO PUT BACK
        

        let inputFilename = './R/data/frame_tifs/' + filename;
        let outputFilename = 'vectorjson/contours/contours' + frameId + '.json';   
        vectorizeRasterFrame(inputFilename, outputFilename, frameId);
    });
}

main();