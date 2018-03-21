var debug       = require("debug")("compass");
var util        = require("util");

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


	// funksjon i objektet
	self.hallo = function(sentence) {

	};

	debug("jadda, constructor funker");

	//system.on()


}
