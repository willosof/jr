var debug       = require("debug")("gps");
var util        = require("util");

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
	self.hallo = function(sentence) {
		// logge til gps-loggen
		//system.emit('log', 'gps', 'lalala')

	};

	self.hallo();

	//system.on()


}
