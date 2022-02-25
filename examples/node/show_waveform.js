

const fs = require('fs');
const createFFmpegCore = require('./ffmpeg.audio.core/v5-full/ffmpeg');
const ffmpegHelper = require('./js/ffmpeg.helper.js');

global.createFFmpegCore = createFFmpegCore;

let FFmpegHelper = ffmpegHelper.FFmpegHelper;

async function make_waveform(in_file,output_filename){
  const helper = new FFmpegHelper();
  await helper.initialzeFFmpeg();

  const buffer = fs.readFileSync(in_file);

  helper.FS().writeFile(in_file, new Uint8Array(buffer));

  var args = ['-i', in_file ,'-filter_complex', 'showwavespic=s=640x120','-frames:v','1' ,output_filename];

  helper.ffmpegDurationHandler = (duration) => { console.log(`Input audio duration ${duration} seconds`)};
  helper.ffmpegProgressHandler = (progress) => { console.log(`Transcoding progress ${progress}%`);};

  await helper.run(args);

  //the resulting file

  fs.writeFile(output_filename, await helper.FS().readFile(output_filename), (err) => {
  if (err)
    console.log(err);
  else {
    console.log("File written successfully\n");
  }});
}

const in_file = 'input_sine_wave.mp3';
const output_filename ="waveform.png"
make_waveform(in_file,output_filename);