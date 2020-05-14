import { contours } from 'd3-contour';
import { geoTransform, geoPath } from 'd3-geo';
import { geoProject } from 'd3-geo-projection';
import proj4 from 'proj4';
import * as gdal from 'gdal';
import fs from 'fs';


console.log('hello world');

let gdalDataset = gdal.open('sample_frame_raster.tif');
let band = gdalDataset.bands.get(1);
let width = band.size.x-1; 
let height = band.size.y-1;

//read data into an array
let array = band.pixels.read(0, 0, width, height);

// array of multipolygons that represent the contours of the image
var polygons = contours()
    .size([width, height]) // later can custom threshold, too
    (array);


var geotransf = gdalDataset.geoTransform;

let geoProjectionForRaster = geoTransform({
    point: function(point) {
        let x = point[0];
        let y = point[1];
        
        var xGeo = geotransf[0] + x*geotransf[1] + y*geotransf[2];
        var yGeo = geotransf[3] + x*geotransf[4] + y*geotransf[5];
        this.stream.point(xGeo, yGeo);
    }
  });

let resultgeojson = {
    type: 'FeatureCollection',
    features: []
};

polygons.forEach((polygon) => {
    resultgeojson.features.push({
        type: 'Feature',
        properties: {
            value: polygon.value,
            idx: 0
        },
        geometry: {
            type: 'MultiPolygon',
            coordinates: polygon.coordinates
        }
    });
});


const writeContourData = function(geojson) {
    // convert JSON object to string
    const allcontourdata = JSON.stringify(geojson);

    // write JSON string to a file
    fs.writeFile('allcontours.json', allcontourdata, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
}

let lonLatPolygons = geoProject(resultgeojson, geoProjectionForRaster);


// // convert JSON object to string
// const data = JSON.stringify(lonLatPolygons);

// // write JSON string to a file
// fs.writeFile('contour.json', data, (err) => {
//     if (err) {
//         throw err;
//     }
//     console.log("JSON data is saved.");
// });



