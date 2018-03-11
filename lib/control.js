var debug       = require("debug")("control");
var util        = require("util");

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


	// funksjon i objektet
	self.hallo = function(sentence) {

	};

	debug("jadda, constructor funker");

	//system.on()


}