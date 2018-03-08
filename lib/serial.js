var debug       = require("debug")("serial");
var util        = require("util");

exports = module.exports = function (system) {
	debug("new(serial)");
	return new serial(system);
};

function serial(system) {
	var self = this;

	// funksjon i objektet
	self.hallo = function(sentence) {

	};

	debug("jadda, constructor funker");

	//system.on()


}
