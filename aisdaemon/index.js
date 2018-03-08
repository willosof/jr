var exec = require('child_process').exec;
var spawn = function() {

	exec('./decorun', function(error, stdout, stderr) {
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
		}
		setTimeout(function() {
			spawn();
		},1000);
	});

	console.log("loop");

};

spawn();
