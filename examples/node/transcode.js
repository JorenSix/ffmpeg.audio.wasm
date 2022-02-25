
const fs = require('fs');
const createFFmpegCore = require('./ffmpeg.audio.core/v5/ffmpeg.core');
const ffmpegHelper = require('./js/ffmpeg.helper.js');

let FFmpegHelper = ffmpegHelper.FFmpegHelper;
global.createFFmpegCore = createFFmpegCore;

async function transcode(in_file,output_filename){
  const helper = new FFmpegHelper();
  await helper.initialzeFFmpeg();

  const buffer = fs.readFileSync(in_file);

  helper.FS().writeFile(in_file, new Uint8Array(buffer));

  var args = ['-i', in_file, '-vn' , output_filename];

  helper.ffmpegDurationHandler = (duration) => { console.log(`Audio duration ${duration} seconds`)};
  helper.ffmpegProgressHandler = (progress) => { console.log(`Transcoding progress ${progress}%`);};

  await helper.run(args);

  //the resulting file:
  fs.writeFile(output_filename, await helper.FS().readFile(output_filename), (err) => {
  if (err)
    console.log(err);
  else {
    console.log("File written successfully\n");
  }});

}

transcode('input_sine_wave.mp3','transcode_out.mp3');
