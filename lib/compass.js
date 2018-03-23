var debug       = require("debug")("compass");
var util        = require("util");
var serialPort 	= require('serialport');

exports = module.exports = function (system) {
	debug("new(compass)");
	return new compass(system);
};

function compass(system) {
	var self = this;

	self.compass_status = false;

	// for å oppdatere ikonene på websiden
	setInterval(function() {
		var now = Date.now();
		// valgene er success, warning, danger (grøn, oransj, rød)
		if (self.compass_status === true) {
			system.emit('set_status', 'compass', 'success', 'compass', 'ok');
		}
		else {
			system.emit('set_status', 'compass', 'danger', 'compass', 'fault');
		}
	}, 2000);


	self.port = new serialPort('/dev/ttyUSB2');
	// funksjon i objektet
	system.on('heading', function(data) {
			self.port.write(data);
		data = "";
	});

	//system.on()


}
