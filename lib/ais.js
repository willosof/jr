var debug       = require("debug")("ais");
var util        = require("util");
var AisParser   = require('aisparser');
var parser      = new AisParser({ checksum : true });
var debug       = require('debug')('aisParser');
var serverdebug = require('debug')('tcpServer');
var net         = require('net');

exports = module.exports = function (system) {
	debug("new(ais)");
	return new ais(system);
};

function ais(system) {
	var self = this;

	// config
	self.ip = "10.21.20.249";

	// parsefunksjon!

	self.client = new net.Socket();

	self.client.on('error', function(e) {
		debug("ais_client","error connecting",e);
		ais_client.destroy();
	});

	self.client.connect(40003, self.ip, function() {
		debug('ais_client','Connected');
	});

	self.client.on('close', function() {
		console.log('ais_client','lost connection');
		self.client.destroy();

		setTimeout(function() {
			self.client.connect(40003, self.ip, function() {
				debug('ais_client','Connected');
			});
		}, 1000);

	});

	self.client.on('data', function(data) {
		var ais_data = data.toString().trim();
		var ais_array = ais_data.split(/:/);
		self.parse(ais_array[0]);
	});

	self.valid_packet = function(packet) {
		system.emit('ais_packet', packet);
	};

	self.parse = function(sentence) {

	  var result = parser.parse(sentence);

	  var info = {};
	  var match = 0;

	  if (result.valid == 'VALID') {

	    try {
	      var suppValues = result.supportedValues;
	      for(field in suppValues) {
	        if (field == 'mmsi' || field == 'latitude' || field == 'longitude') {
	          info[field] = result[field];
	          match++;
	        }
	      }
	    } catch(error) {
	        //debug('parsing failed for' + sentence + ' error:' + error);
	    }

	    if (match == 3) {
	      self.valid_packet(info);
	    }

	  }

	  else if (result.valid == 'UNSUPPORTED') {
	    //debug('unsupported message: ' + sentence, result.errMsg);
	  }

	  else if (result.valid == 'INVALID') {
	    //debug('invalid message: ' + sentence, result.errMsg);
	  }

	  else if (result.valid == 'INCOMPLETE') {
	    //debug('incomplete message, waiting for more');
	  }

	  else {
	    //debug('Well, this is unexpected?')
	  }

	};




}
