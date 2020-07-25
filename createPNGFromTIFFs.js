
import * as gdal from 'gdal-next';
import fs from 'fs';
import { PNG } from 'pngjs';
import convert from 'color-convert';
import { scaleLinear} from 'd3-scale'
import { temps } from './ub_7_day_avg_temp'

const NUM_INTERMEDIARY_FRAMES = 11;
const NUM_CALCULATED_FRAMES = NUM_INTERMEDIARY_FRAMES + 1;

let green_color = '#93c947'; //green
let red_color = '#f0004c'; //red
let orange_red_color = '#fc6203';
let yellow_color = '#ebc505';
let green_yellow_color = '#d7e01d'
let orange_color = '#fc9d03';
let red_purple_color = '#d921d0';
let purple_color = '#5e03fc';
let dark_purple_color = '#4b1f7a';
let black_color = '#050505';

const airQualityScale = [12, 22, 35, 55, 100, 150, 200, 250, 500]; // this is up for changing!
const colorScale = [green_color, // <12
        green_yellow_color, // <22
        yellow_color, // <35
        orange_color, // <55
        orange_red_color, // < 100
        red_color, // <150
        red_purple_color, // < 200
        purple_color, // < 250
        dark_purple_color, // < 500
        black_color]; //> 500

// SMOOTH 
var scaleAirQualityToColor = scaleLinear().domain(airQualityScale).range(colorScale);
scaleAirQualityToColor.clamp(true);

// BANDS
//var scaleAirQualityToColor = scaleThreshold().domain(airQualityScale).range(colorScale);

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

const getPixelColor = function(pixelValue, opacityPixelValue) {
    // if want to do bands
    // let pixelColor = pixelValue < 0 | pixelValue >= COLOR_ARRAY.length ? black_color : COLOR_ARRAY[pixelValue];
    // let rgbPixelColor = hexRgb(pixelColor, {format: 'array'});
    // return rgbPixelColor;

    // BANDS
   // let rgbPixelColors = convert.hex.rgb(scaleAirQualityToColor(pixelValue));


    // SMOOTH
    let rgbColorString = scaleAirQualityToColor(pixelValue);
    let rgbPixelColors = rgbColorString.substring(4, rgbColorString.length-1)
         .replace(/ /g, '')
         .split(',');

    var rgbPixelColor = [
        parseInt(rgbPixelColors[0]), 
        parseInt(rgbPixelColors[1]), 
        parseInt(rgbPixelColors[2])
    ]

    var hsvColor = convert.rgb.hsv(rgbPixelColor);
    hsvColor[1] = Math.round(hsvColor[1]* opacityPixelValue);
    rgbPixelColor = convert.hsv.rgb(hsvColor);
    return rgbPixelColor;

}


const createPNGFromFrame = function(inputFilename, outputFilename, frameId, prevBand, opacityBand) {
    console.log('png-izing tif file: ' + inputFilename + '...');

    let frameIdStart = (frameId - 1) * NUM_CALCULATED_FRAMES;

    let gdalDataset = gdal.open(inputFilename);
    let band = gdalDataset.bands.get(1);

    if (!prevBand) {
        return band;
    }

    let width = band.size.x-1; 
    let height = band.size.y-1;

    console.log(opacityBand);
    

    //read data into an array of length widthxheight so that d3.contours can work
    let array = band.pixels.read(0, 0, width, height);
    let opacityArray = opacityBand.pixels.read(0, 0, width, height);

    let prevArray = prevBand.pixels.read(0, 0, width, height);
    let resultingFrames = []

    for (let frm = 0; frm < NUM_CALCULATED_FRAMES; frm++) {
        resultingFrames.push({frameId: frameIdStart + frm, colorArray: new Array(array.length) })
    }

    for (let i = 0; i < array.length; i++) {
        let currValue = array[i];
        let prevValue = prevArray ? prevArray[i] : currValue;
        let stepAmt = (currValue - prevValue) / (NUM_CALCULATED_FRAMES);
        let opacityPixelValue = opacityArray[i];

        // calculate a value for each interpolated frame
        for (let frm = 0; frm < NUM_CALCULATED_FRAMES; frm++) {
            let interpolatedValue = prevValue + (frm * stepAmt);
           
            let pixelColor = getPixelColor(interpolatedValue, opacityPixelValue);
            resultingFrames[frm].colorArray[i] = pixelColor;
        }
    }

    console.log('created frames');

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
    

    var opacityBandData =  gdal.open('opacity_filter.tif');
    var opacityBand = opacityBandData.bands.get(1);

    let dateArray = [];
    let tempsArray = [];
    let prevTemp;
    var tempArrayIndex = 0;

   //for each file, png-ize and save
    files.forEach(filename => {
        if (frameId > 30) return false;

        // get date array
        let dateString = filename.substring(18, 28);
        let date = new Date(dateString);
        dateArray.push(date);

        let inputFilename = '../ub-historical-air-quality-interpolation/R/frames/' + filename;
        let outputFilename = 'pngs_bands_smoother/img_' + dateString + '_';   
        prevBand = createPNGFromFrame(inputFilename, outputFilename, frameId, prevBand, opacityBand);
        frameId++;


        let currTemp = temps[tempArrayIndex].mov_daily_avg;

        if (prevTemp) {     
            let stepAmt = (currTemp - prevTemp) / (NUM_CALCULATED_FRAMES);
            for (let frm = 0; frm < NUM_CALCULATED_FRAMES; frm++) {
                let interpolatedTempValue = prevTemp + (frm * stepAmt);
                tempsArray.push(interpolatedTempValue);
            }
        }

        prevTemp = currTemp;
        tempArrayIndex++;
    });


    writeDatestoFrameArray(dateArray, tempsArray);

    // SEEING IF CAN APPLY OPACITY RASTER
    // let sampleFilename = '../ub-historical-air-quality-interpolation/R/frames/air_quality_bands_2019-02-14.tif'
    // let sampleOutputFilename = 'opacityImg';
    // createPNGFromFrame(sampleFilename, sampleOutputFilename, frameId, prevBand, opacityBand);
}

const writeDatestoFrameArray = (dateArray, tempsArray) => {
    let prevDate = dateArray[0];
    let tempArrayIndex = 0;
    let dateTempFrameArray = [];

    for (let i = 1; i < dateArray.length; i++) {
        let currDate = dateArray[i];

        let firstHalf = NUM_CALCULATED_FRAMES/2;
        let secondHalf = NUM_CALCULATED_FRAMES - firstHalf;

        for (let frm = 0; frm < firstHalf; frm++) {
            dateTempFrameArray.push({
                date: prevDate,
                temp: tempsArray[tempArrayIndex]
            });
            tempArrayIndex++;
        }

        for (let frm = 0; frm < secondHalf; frm++) {
            dateTempFrameArray.push({
                date: currDate,
                temp: tempsArray[tempArrayIndex]
            });
            tempArrayIndex++;
        }
        prevDate = currDate;
    };

    // convert JSON object to string
    let dateTempArrayFrameJson = JSON.stringify(dateTempFrameArray);

   // write JSON string to a file
    fs.writeFile('dateTempFrames.json', dateTempArrayFrameJson, (err) => {
        if (err) {
            throw err;
        }
        console.log("date temp JSON data is saved.");
    });
    
}

const createSingleFrame = () => {
    var opacityBandData =  gdal.open('opacity_filter.tif');
    var opacityBand = opacityBandData.bands.get(1);
    console.log(opacityBand);

    let prevBand;
    let inputFilename1 = '../ub-historical-air-quality-interpolation/R/frames/air_quality_bands_2019-02-14.tif' ;
    let inputFilename2 = '../ub-historical-air-quality-interpolation/R/frames/air_quality_bands_2019-02-18.tif' ;
    let outputFilename = 'sample_opacity_fade_2019-02-14.tif' ;
    prevBand = createPNGFromFrame(inputFilename1, outputFilename, 1, prevBand, opacityBand);
    createPNGFromFrame(inputFilename2, outputFilename, 1, prevBand);
}

createSingleFrame();
//main();





