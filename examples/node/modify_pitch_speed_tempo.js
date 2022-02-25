const fs = require('fs');
const createFFmpegCore = require('./ffmpeg.audio.core/v5/ffmpeg.core');
const ffmpegHelper = require('./js/ffmpeg.helper.js');

global.createFFmpegCore = createFFmpegCore;

let FFmpegHelper = ffmpegHelper.FFmpegHelper;

async function modify_pitch_and_tempo(pitch_factor,tempo_factor,in_file,output_filename){
  const helper = new FFmpegHelper();
  await helper.initialzeFFmpeg();

  const buffer = fs.readFileSync(in_file);

  helper.FS().writeFile(in_file, new Uint8Array(buffer));

  var args = ['-i', in_file, '-vn' ,'-filter', 'rubberband=tempo=' + tempo_factor +':pitch=' + pitch_factor ,output_filename];

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
const output_filename ="pitch_speed_mod_out.mp3"
const pitch_factor = 1.2;
const tempo_factor = 0.8;
modify_pitch_and_tempo(pitch_factor,tempo_factor,in_file,output_filename);

