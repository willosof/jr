var debug       = require("debug")("serial");
var util        = require("util");
var serialPort 	= require('serialport');

exports = module.exports = function (system) {
	debug("new(serial)");
	return new serial(system);
};

function serial(system) {
	var self = this;

	// funksjon i objektet
	self.port = new serialPort('/dev/ttyACM0');
	system.on('distance', function(data) {
		self.port.write(data);
		debug('sent data', data);
});


	debug("jadda, constructor funker");

	//system.on()


}
