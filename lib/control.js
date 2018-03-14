var debug       = require("debug")("control");
var util        = require("util");
var serialPort 	= require('serialport');

exports = module.exports = function (system) {
	debug("new(control)");
	return new control(system);
};

function control(system) {
	var self = this;

	self.control_status = false;

	// for å oppdatere ikonene på websiden
	setInterval(function() {
		var now = Date.now();
		// valgene er success, warning, danger (grøn, oransj, rød)
		if (self.control_status === true) {
			system.emit('set_status', 'control', 'success', 'cogs', 'ok');
		} else {
			system.emit('set_status', 'control', 'danger', 'cogs', 'fault');

			system.emit('log', 'control', 'lalala haha control')


		}
	}, 1000);

  self.port = new serialPort('/dev/ttyACM0');
	self.port.on('open', function(){
		debug("port opened");
	});

	self.port.on('data',function(data) {
		var ds = data.toString().split(/[/n]/);
		debug('Kontrolleren sa: ', ds[0]);
			if(ds[0] === "speed_ok"){
				system.emit('set_status', 'speed', 'success', 'speed', 'ok');
			}
			else {
				system.emit('set_status', 'speed', 'danger', 'speed', 'fault');
			}
	});

	debug("jadda, constructor funker");

	//system.on()


}
