var debug       = require("debug")("serial");
var util        = require("util");
var serialPort 	= require('serialport');

exports = module.exports = function (system) {
	debug("new(serial)");
	return new serial(system);
};


function serial(system) {
	var self = this;

	self.serial_status = false;

	setInterval(function() {
		var now = Date.now();
		// valgene er success, warning, danger (grøn, oransj, rød)
		if (self.serial_status === true) {
			system.emit('set_status', 'speed', 'success', 'tachometer-alt', 'ok');
		} else {
			system.emit('set_status', 'speed', 'danger', 'tachometer-alt', 'fault');
		}
	}, 1000);

	// funksjon i objektet
	self.port = new serialPort('/dev/ttyACM0');
	system.on('distance', function(data) {
			self.port.write(data);
			console.log("distansen er: " + data);
		data = "";
});


	debug("jadda, constructor funker");

	//system.on()


}
