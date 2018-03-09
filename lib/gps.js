var debug       = require("debug")("gps");
var util        = require("util");
var serialPort 	= require('serialport');
var GPSPort 		= new serialPort('./ttyUSB0');
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

	GPSPort.on('open', function(){
		GPSPort.on('data',function(data) {
			locationData += data.toString();
			debug("Jet",locationData);
			if(locationData.indexOf("LNG:") > -1){
		if (locationData.length > 12)
		lat = locationData.substr(4, 9); //LAT:12.345678 //14
		lon = locationData.substr(19,9); //LNG:12.345678 //28
		}
		system.emit('log', 'gps', locationData);

	});

	});
	
	// funksjon i objektet
	self.hallo = function(sentence) {

		// logge til gps-loggen
		//system.emit('log', 'gps', 'lalala')

	};

	self.hallo();

	//system.on()


}
