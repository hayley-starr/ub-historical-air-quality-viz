import { contours } from 'd3-contour';
import { geoTransform } from 'd3-geo';
import { geoProject } from 'd3-geo-projection';
import * as gdal from 'gdal';
import fs from 'fs';
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
    //let array = band.pixels.read(0, 0, width, height);
    let bandThresholds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    let bandThresholdValues = [];
    bandThresholds.forEach(threshold => {
        bandThresholdValues.push({value: threshold});
    });

    let resultgeojson = {
        type: 'FeatureCollection',
        features: []
    };

    for (var y = 0; y < height; y++){ 
        for (var x = 0; x < width; x++){
            let pixelValue = band.pixels.get(x, y);
            let point = new turf.point([x, y], {pixelValue: pixelValue});
            resultgeojson.features.push(point);
        }
    }

    
    var geotransf = gdalDataset.geoTransform;
    
    let geoProjectionForPoints = geoTransform({
        point: function(x, y) {
            var xGeo = geotransf[0] + x*geotransf[1] + y*geotransf[2];
            var yGeo = geotransf[3] + x*geotransf[4] + y*geotransf[5];
    
            this.stream.point(xGeo, yGeo);
        }
      });
    
    let lonLatPoints = geoProject(resultgeojson, geoProjectionForPoints);

    //console.log(lonLatPoints.features[0]);
    
    let isobands = turf.isobands(
        lonLatPoints, // points with values
        bandThresholds, // where to draw bands
        {
            zProperty: 'pixelValue',
            commonProperties: {
                idx: frameId // so can select only polygons for a specific frame
            },
            breaksProperties: bandThresholdValues // assign each band a #
        });
    
    writeJsonData(isobands, outputFilename);
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
        let outputFilename = 'contours/contours' + frameId + '.json';   
        vectorizeRasterFrame(inputFilename, outputFilename, frameId);
    });
}

main();


// FAILED ATTEMPT :(
const attemptToCreatePolygonsFromContourPolygons = function(contourPolygons) {
    let resultgeojson = {
        type: 'FeatureCollection',
        features: []
    };

    var prevContour; 
    var prevContourValue;
    var previousPolygons = [];

    contourPolygons.forEach((contourPolygon) => {
        let currContour = turf.multiPolygon(contourPolygon.coordinates);

        currContour.properties = {
            value: contourPolygon.value,
            idx: frameId // so can select only polygons for a specific frame
        }

        if (contourPolygon.value > 5 | contourPolygon.value < 3) return;

        resultgeojson.features.push(currContour);

      
        console.log('------------------------------------------')
        console.log('PROCESSING LAYER ', contourPolygon.value);
        console.log('SETTING UP LAYER: ', prevContourValue);

        // compute a polygon based on difference of two contours
        //if (false) { 
        if (prevContour) { 
            //subtract currPolygon from the previous polygon (a "bigger" contour)
            let newPolygon = turf.mask(currContour, prevContour); 

            if (newPolygon) {

                //if there are previously computed polygons
                // if (previousPolygons[previousPolygons.length-1]) { 
                //     for (let i = previousPolygons.length-1; i >= 0; i--) {
                        
                //         // subtract whatever was calculated before in case of holes
                //         let prevPolygon = previousPolygons[i];
                //         console.log('subtracting prev polygon: ', prevPolygon.properties.value);
                //         newPolygon = turf.difference(newPolygon, prevPolygon);
                //     } 
                // }

                newPolygon.properties = {
                    value: prevContourValue,
                    idx: frameId // so can select only polygons for a specific frame
                }
            
                resultgeojson.features.push(newPolygon);
                previousPolygons.push(newPolygon);
            }   
        }
        prevContour = currContour;
        prevContourValue = contourPolygon.value
    });   
}