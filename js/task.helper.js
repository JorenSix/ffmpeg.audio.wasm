

class MediaFile {

  buffer = null;
  duration = 0;
  file_name = null;

  constructor(file_name) {
    this.file_name = file_name;
  }

  static fomFile(file){

  }

  asBlob(){
  	return new Blob([this.buffer], { type: 'audio/' + this.extension() })
  }

  extension(){
  	return this.file_name.split('.').pop();
  }


}


class FFmpegTask{

  processed = false;
  failed = false;
  input_file = null;
  output_file = null;
  log = null;
  running = false;
  tempo_factor = 1.0;


  constructor(in_file,out_file,tempo_factor=1.0,pitch_factor=1.0){
  	this.input_file = in_file;
  	this.output_file = out_file;
    this.tempo_factor = tempo_factor;
    this.pitch_factor = pitch_factor;

  }

  async transcode(progressHandler){

    this.running = true;
  	var prefixIn = "" + ~~(Math.random() * 10000);
  	var prefixOut = "" + ~~(Math.random() * 10000);

  	var outputExtension = this.output_file.extension();
  	var outputFileName = prefixOut + this.output_file.file_name;
  	var inputFileName = prefixIn + this.input_file.file_name;
  	var args = [];

  	if(outputExtension == "wav") args =  ['-i', inputFileName, '-vn' , outputFileName];
    if(outputExtension == "mp3") args =  ['-i', inputFileName, '-vn' ,'-codec:a' , 'libmp3lame' ,'-qscale:a', '2' ,outputFileName];
    if(outputExtension == "opus") args = ['-i', inputFileName, '-vn' ,'-codec:a' , 'libopus' ,'-b:a', '128k' ,outputFileName];
    if(outputExtension == "pcm") args =  ['-i', inputFileName, '-vn' ,'-codec:a' , 'pcm_f32le' ,'-ac','1','-f','f32le', '-ar', ar.toFixed() ,outputFileName];
    
    //add filter args if needed
    if(this.tempo_factor != 1.0 || this.pitch_factor != 1.0){
      const filter_args = ['-filter', 'rubberband=tempo=' + this.tempo_factor +':pitch=' + this.pitch_factor]
      args.splice(3, 0, ...filter_args);
    }

    const helper = new FFmpegHelper();
    await helper.initialzeFFmpeg();


    helper.ffmpegDurationHandler = (duration) => {console.log("Handled duration:" , duration);};
    if(progressHandler == null)
      helper.ffmpegProgressHandler = (progress) => {console.log("handled progress", progress);};
    else
      helper.ffmpegProgressHandler = progressHandler;

    helper.FS().writeFile(inputFileName, new Uint8Array(await this.input_file.buffer)) ;

    const t0 = performance.now();
    await helper.run(args);
    const t1 = performance.now();
    this.run_duration = t1 - t0;

    this.processed = true;

 	  const check = helper.FS().readdir('.').find(name => (name === outputFileName));

    if (typeof check !== 'undefined') {
    	this.output_file.buffer = helper.FS().readFile(outputFileName);
    	this.failed = false;
    }else{
    	this.failed = true;
    }
    this.running = false;
  }
}


async function processTaskQueue(taskQueue,onTaskQueued,onTaskDone,updateProgress){

   for (const index in taskQueue) {
      task = taskQueue[index];
      if(task.processed) continue;
      onTaskQueued(index,task);
    }

    for (const index in taskQueue) {
    	task = taskQueue[index];
    	if(task.processed) continue;
      //if(verbose) console.log("Processing task: ",task);
      await task.transcode(updateProgress);
      console.log("transcode task done" , index)
      onTaskDone(index,task);
    }
}

if(typeof window === `undefined`)
module.exports = { MediaFile: MediaFile,  TranscodeTask: TranscodeTask };
