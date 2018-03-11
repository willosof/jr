var debug       = require("debug")("gps");
var util        = require("util");
var serialPort 	= require('serialport');
var GPSPort 		= new serialPort('/dev/ttyUSB0');
var lon = "";
var lat = "";
var locationData = "";

exports = module.exports = function (system) {
	debug("new(gps)");
	return new gps(system);
};

function gps(system) {
	var self = this;

	self.gps_status = false;

	// for å oppdatere ikonene på websiden
	setInterval(function() {
		var now = Date.now();
		// valgene er success, warning, danger (grøn, oransj, rød)
		if (self.gps_status === true) {
			system.emit('set_status', 'gps', 'success', 'globe', 'ok');

		} else {
			system.emit('set_status', 'gps', 'danger', 'globe', 'fault');
		}
	}, 1000);



	// funksjon i objektet
	self.hallo = function() {
		system.emit('log','gps', 'test');
			GPSPort.on('open', function(){
				GPSPort.on('data',function(data) {
					locationData += data.toString();
					system.emit('log','gps',locationData);
					self.gps_status = true;
				});

			});
		// logge til gps-loggen
		//system.emit('log', 'gps', 'lalala');
		//system.emit('log','gps', sentence);


	};

	self.hallo();

	//system.on()


}
