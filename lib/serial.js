var debug       = require("debug")("serial");
var util        = require("util");

exports = module.exports = function (system) {
	debug("new(serial)");
	return new serial(system);
};

function serial(system) {
	var self = this;

	// funksjon i objektet
	self.port = new serialPort('/dev/ttyACM0');
	system.on('location_data', function(data) {
		self.port.write(data.toString());
		debug('sent data', data); 
	});

	debug("jadda, constructor funker");

	//system.on()


}
