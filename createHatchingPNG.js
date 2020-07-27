
import * as gdal from 'gdal-next';
import fs from 'fs';
import { PNG } from 'pngjs';
import convert from 'color-convert';
import { scaleLinear} from 'd3-scale'

// CREATE HATCHING PNG FILE

// write to file
const writePNG = function(colorArray, width, height, filename) {

    let rgb_array = new Array(width * height * 3);
    let ofs = 0;

    for (let i = 0; i < colorArray.length; i ++) {
        let rgbColor = (colorArray[i]);
        rgb_array[ofs++] = rgbColor[0];
        rgb_array[ofs++] = rgbColor[1];
        rgb_array[ofs++] = rgbColor[2];
        rgb_array[ofs++] = rgbColor[3];
    }

    let png = new PNG({
        width: width,
        height: height,
        bitDepth: 8,
        colorType: 6,
      });

    png.data = Buffer.from(rgb_array);
    var buffer = PNG.sync.write(png, {
        width: width,
        height: height,
        bitDepth: 8,
        colorType: 6,
      });

    fs.writeFileSync(filename, buffer);

    console.log('made a png!');
}

const getColor = function(pixelValue, opacityValue) { //opacityPixelValue
    if (pixelValue == 1) {
        return [94, 88, 88, 255*opacityValue]; // nice light brown
    } else {
        return [255, 255, 255, 0]; // transparent
    }
}


const createPNGFromOpacityTiff = function(inputFilename, outputFilename) {
    console.log('creating png file: ' + inputFilename + '...');

    let gdalDataset = gdal.open(inputFilename);
    let band = gdalDataset.bands.get(1);
    let width = band.size.x-1; 
    let height = band.size.y-1;


    let num_hatches = 150;
    let hatch_repetition_unit = Math.round(width / num_hatches); // every unit, place a hatch-line
    let hatch_width_ratio = 8; // for every 1 hatch, place ratio amount of whitespace
    let num_pixels_for_hatch = Math.round(hatch_repetition_unit/(1+hatch_width_ratio));
    let num_pixels_for_space = hatch_repetition_unit - num_pixels_for_hatch;
    

    //read data into an array of length widthxheight so that d3.contours can work
    let array = band.pixels.read(0, 0, width, height);
    let colorArray = new Array(array.length);

    for (let i = 0; i < array.length; i+= hatch_repetition_unit) {
        for(let j = 0; j < num_pixels_for_hatch; j++) {
            // console.log('opacity: ',  array[i+j]);
            colorArray[i+j] = getColor(1, array[i+j]); // fill 
        }
        for(let j = num_pixels_for_hatch; j < num_pixels_for_hatch + num_pixels_for_space; j++) {
            colorArray[i+j] = getColor(0, array[i+j]); // unfilled
        }
    }

    //write img to a png file
    writePNG(colorArray, width, height, outputFilename + '.png');   
}

const main = () => {
    let inputFilename = 'opacity_filter.tif';
    let outputFilename = 'uncertainty_mask_img';   
    createPNGFromOpacityTiff(inputFilename, outputFilename);
}


main();





