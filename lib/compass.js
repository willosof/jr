var debug       = require("debug")("compass");
var util        = require("util");
var serialPort 	= require('serialport');

exports = module.exports = function (system) {
	debug("new(compass)");
	return new compass(system);
};

function compass(system) {
	var self = this;

	self.port = new serialPort('/dev/ttyUSB2');
	// funksjon i objektet
	system.on('heading', function(data) {
			self.port.write(data);
		data = "";
	});
	//system.on()
}
