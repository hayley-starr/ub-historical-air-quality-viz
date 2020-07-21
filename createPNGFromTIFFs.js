
import * as gdal from 'gdal';
import fs from 'fs';
import { PNG } from 'pngjs';
import hexRgb from 'hex-rgb';
import { scaleLinear} from 'd3-scale'

const NUM_INTERMEDIARY_FRAMES = 7;
const NUM_CALCULATED_FRAMES = NUM_INTERMEDIARY_FRAMES + 1;

let green_color = '#93c947'; //green
let red_color = '#f0004c'; //red
let yellow_color = '#ebc505'; 
let blue_color = '#027ef2';
let white_color = '#ffffff';
let orange_color = '#fc9d03';
let purple_color = '#5e03fc';
let dark_purple_color = '#4b1f7a';
let black_color = '#050505';

let COLOR_ARRAY = [
    white_color, // 0
    blue_color, // 1
    blue_color, // 2
    green_color, // 3
    green_color, // 4
    yellow_color, // 5
    yellow_color, // 6
    orange_color, // 7
    orange_color, // 8
    red_color, // 9
    red_color, // 10
    purple_color, // 11
    purple_color, // 12
    dark_purple_color, // 13
    dark_purple_color // 14
]

const airQualityScale = [0, 15, 100, 250, 300, 350];
const colorScale = [blue_color, green_color, orange_color,red_color, purple_color, dark_purple_color];

var scaleAirQualityToColor = scaleLinear().domain(airQualityScale).range(colorScale);
scaleAirQualityToColor.clamp(true);


// write geojson to file
const writePNG = function(colorArray, width, height, filename) {

    let rgb_array = new Array(width * height * 3);
    let ofs = 0;

    for (let i = 0; i < colorArray.length; i ++) {
        let rgbColor = (colorArray[i]);
        rgb_array[ofs++] = rgbColor[0];
        rgb_array[ofs++] = rgbColor[1];
        rgb_array[ofs++] = rgbColor[2];
        rgb_array[ofs++] = 255;
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

const getPixelColor = function(pixelValue) {
    // if want to do bands
    // let pixelColor = pixelValue < 0 | pixelValue >= COLOR_ARRAY.length ? black_color : COLOR_ARRAY[pixelValue];
    // let rgbPixelColor = hexRgb(pixelColor, {format: 'array'});
    // return rgbPixelColor;

    let rgbColorString = scaleAirQualityToColor(pixelValue);
   
    let rgbPixelColors = rgbColorString.substring(4, rgbColorString.length-1)
         .replace(/ /g, '')
         .split(',');

    var rgbPixelColor = [
        parseInt(rgbPixelColors[0]), 
        parseInt(rgbPixelColors[1]), 
        parseInt(rgbPixelColors[2])
    ]
    return rgbPixelColor;

}


const createPNGFromFrame = function(inputFilename, outputFilename, frameId, prevBand) {
    console.log('png-izing tif file: ' + inputFilename + '...');

    let frameIdStart = (frameId - 1) * NUM_CALCULATED_FRAMES;

    let gdalDataset = gdal.open(inputFilename);
    let band = gdalDataset.bands.get(1);

    let width = band.size.x-1; 
    let height = band.size.y-1;
    

    //read data into an array of length widthxheight so that d3.contours can work
    let array = band.pixels.read(0, 0, width, height);

    let prevArray = prevBand ? prevBand.pixels.read(0, 0, width, height) : undefined;
    let resultingFrames = []

    for (let frm = 0; frm < NUM_CALCULATED_FRAMES; frm++) {
        resultingFrames.push({frameId: frameIdStart + frm, colorArray: new Array(array.length) })
    }

    for (let i = 0; i < array.length; i++) {
        let currValue = array[i];
        let prevValue = prevArray ? prevArray[i] : currValue;
        let stepAmt = (currValue - prevValue) / (NUM_CALCULATED_FRAMES);

        // calculate a value for each interpolated frame
        for (let frm = 0; frm < NUM_CALCULATED_FRAMES; frm++) {
            let interpolatedValue = prevValue + (frm * stepAmt);
           
            let pixelColor = getPixelColor(interpolatedValue);
            resultingFrames[frm].colorArray[i] = pixelColor;
        }
    }

    //write each fresulting frame to a png file
    for (let frm = 0; frm < NUM_CALCULATED_FRAMES; frm++) {
        let pngFrame = resultingFrames[frm];
        writePNG(pngFrame.colorArray, width, height, '' + outputFilename + '_' + frm + '.png');   
    }
    
    return band;
}

const main = () => {

    // get tif filenames from data directory
    var files = fs.readdirSync('../ub-historical-air-quality-interpolation/R/frames');
    var frameId = 1;
    var prevBand;


   //for each file, vectorize and save
    files.forEach(filename => {
        console.log(filename);

        let inputFilename = '../ub-historical-air-quality-interpolation/R/frames/' + filename;
        let outputFilename = 'pngs/img' + frameId;   
        prevBand = createPNGFromFrame(inputFilename, outputFilename, frameId, prevBand);
        frameId++;
        return;
    });
}

main();