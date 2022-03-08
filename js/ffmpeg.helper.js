
class FFmpegHelper{
	ffmpegCore = null;
	ffmpegRunning = false;
	ffmpegCurrentDuration = null;
	ffmpegLogContent = null;
	ffmpegLogEmptyCount = 0;
	ffmpegDurationHandler = null;
	ffmpegProgressHandler = null;
	ffmpegLogHandler = null;

	handleFFmpegOutput = (type,message) => {
		//console.log(type,message);
		if(this.ffmpegLogHandler != null) this.ffmpegLogHandler(type,message);
		
		this.detectDuration(message);
		this.detectProgress(message);
		this.detectCompletion(message);
	}

	initialzeFFmpeg = async () => {
		await createFFmpegCore({
		  print:  (text) => { this.handleFFmpegOutput("stdout",text);},
		  printErr: (text) => { this.handleFFmpegOutput("stdout",text); }
		}).then(async (Module) => {
		  this.ffmpegCore = Module;
		  //console.log("FFmpeg WASM module loaded!");
		});
	}

	detectProgress = (message) => {
		var progress_matches = message.match(/.*time.(\d\d).(\d\d).(\d\d).(\d+).*/m);

		if(progress_matches == null) return;

	    var hours = parseFloat(progress_matches[1]);
	    var minutes = parseFloat(progress_matches[2]);
	    var seconds = parseFloat(progress_matches[3]);
	    var milliseconds = parseFloat("0." + progress_matches[4]) * 1000.0;
	    var progress_in_seconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000.0;
	    //console.log("Progress time in seconds: ", progress_in_seconds);

	    var ratio = progress_in_seconds;
	    if(this.ffmpegCurrentDuration !=null) ratio = ~~(progress_in_seconds / this.ffmpegCurrentDuration * 100.0);

	    if(this.ffmpegProgressHandler!=null) this.ffmpegProgressHandler(ratio);

	    return progress_in_seconds;
	}

	FS = () => {
		return this.ffmpegCore.FS;
	}

	detectDuration = (message) => {
		var duration_matches = message.match(/.*Duration..(\d\d).(\d\d).(\d\d).(\d+).*/m);
		if(duration_matches == null) return;

	    var hours = parseFloat(duration_matches[1]);
	    var minutes = parseFloat(duration_matches[2]);
	    var seconds = parseFloat(duration_matches[3]);
	    var milliseconds = parseFloat("0." + duration_matches[4]) * 1000.0;
	    var duration_in_seconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000.0;
	    //console.log("Duration in seconds: ", duration_in_seconds);

	    if(this.ffmpegDurationHandler!=null) this.ffmpegDurationHandler(duration_in_seconds);

	    this.ffmpegCurrentDuration = duration_in_seconds;
	    return duration_in_seconds;
	}

	detectCompletion = (message) => {
		if ((message.includes('kB muxing overhead') || message.includes('Invalid argument') || message.includes('Invalid data found') || message.includes("At least one output file")) && this.runResolve !== null) {
		  this.runResolve();
		  this.runResolve = null;
		  this.ffmpegLogEmptyCount = 0;
		  this.ffmpegRunning = false;
		  //reset duration and report final progress: 100%
		  this.ffmpegCurrentDuration = null;
		  if(this.ffmpegProgressHandler!=null) this.ffmpegProgressHandler(100);
		}
	};

	run = (args) => {
		var defaultArgs = [ '-y', '-hide_banner', '-stats_period', '0.2', '-loglevel', 'info', '-nostdin']
		args = [...defaultArgs,...args];
		console.log('info', `run ffmpeg command: ${args.join('\' \'')}`);
		if (this.ffmpegRunning) {
		  throw Error('ffmpeg.wasm can only run one command at a time');
		} else {
		  this.ffmpegRunning = true;
		  return new Promise((resolve) => {
		    this.runResolve = resolve;
		    this.ffmpegCore.callMain(args);
		  });
		}
	};
}	

var FFmpegSingleton = (function () {
    var instance;

    function createInstance() {
        var object = new FFmpegHelper();
        object.initialzeFFmpeg();
        return object;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();


if(typeof window === `undefined`)
module.exports = {  FFmpegHelper: FFmpegHelper };


