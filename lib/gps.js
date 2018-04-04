var debug       = require("debug")("gps");
var util        = require("util");
var serialPort 	= require('serialport');
var gps_status;

exports = module.exports = function (system) {
	debug("new(gps)");
	return new gps(system);
};

function gps(system) {
	var self = this;

	setInterval(function() {
		var now = Date.now();
		if(self.gps_status === undefined){
			system.emit('set_status', 'gps', 'danger', 'globe', 'fault');
		}

		if(self.gps_status === null){
			system.emit('set_status', 'gps', 'warning', 'globe', 'waiting');
		}

		else {
			var last = parseInt((now - self.gps_status) / 1000);
			system.emit('set_status', 'gps', 'success', 'globe', last + 's ago');
		}
}, 1000);

	debug("opening port");
	self.port = new serialPort('/dev/ttyUSB0');
	self.gps_status = null;
	self.port.on('open', function(){
		debug("port opened");

	});

	self.port.on('data',function(data) {
		var ds = data.toString().split(/[:\n]/);
		var lat = ds[0];
		var lon = ds[1];
			if(ds =! null){
				self.gps_status = Date.now();
			}
		system.emit('log','gps', lat + "," + lon);
		system.emit('location_data',data.toString());
	});

}
