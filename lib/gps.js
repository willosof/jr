var debug       = require("debug")("gps");
var util        = require("util");
var serialPort 	= require('serialport');

exports = module.exports = function (system) {
	debug("new(gps)");
	return new gps(system);
};

function gps(system) {
	var self = this;

	self.gps_status = false;

	debug("opening port");
	self.port = new serialPort('/dev/ttyUSB0');

	self.port.on('open', function(){
		debug("port opened");
	});

	self.port.on('data',function(data) {
		var ds = data.toString().split(/[:\n]/);
		var lat = ds[0];
		var lon = ds[1];
		system.emit('set_status', 'gps', 'success', 'globe', 'ok');
		system.emit('log','gps', lat + "," + lon);
		system.emit('location_data',data.toString());
		debug("got data", lon);
	});

}
