var debug       = require("debug")("ais");
var util        = require("util");
var AisParser   = require('aisparser');
var parser      = new AisParser({ checksum : true });
var debug       = require('debug')('ais');
var net         = require('net');
var last_ais_msg;

exports = module.exports = function (system) {
	debug("new(ais)");
	return new ais(system);
};

function ais(system) {
	var self = this;

	setInterval(function() {
		var now = Date.now();

		// if daemon is not connected to aisdeco
		if (self.last_ais_msg === undefined) {
			system.emit('set_status', 'ais_receiving', 'danger', 'signal', 'fault');
		}

		// if daemon is connected, but still has not gotten any packets
		else if (self.last_ais_msg === null) {
			system.emit('set_status', 'ais_receiving', 'warning', 'signal', 'waiting');
		}

		// all ok! packets are coming in
		else {
			var last = parseInt((now - self.last_ais_msg) / 1000);
			system.emit('set_status', 'ais_receiving', 'success', 'signal', last + 's ago');
		}
	}, 1000);


	// config
	self.ip = "127.0.0.1";

	self.connect = function() {

		if (self.client !== undefined) {
			self.client.destroy();
			delete self.client;
		}

		self.client = new net.Socket();


		self.client.connect(40003, self.ip, function() {
			debug('ais_client','Connected');
			self.last_ais_msg = null;
		});

		self.client.on('error', function(e) {
			debug("ais_client","error connecting",e);
			self.client.removeAllListeners();
			delete self.client;
			delete self.last_ais_msg;
			setTimeout(function() {
				self.connect();
			}, 1000);

		});

		self.client.on('close', function() {
			debug('ais_client','lost connection');
			self.client.removeAllListeners();
			delete self.client;
			delete self.last_ais_msg;
			setTimeout(function() {
				self.connect();
			}, 1000);
		});



		self.client.on('data', function(data) {
			var ais_data = data.toString().trim();
			var ais_array = ais_data.split(/:/);
			self.parse(ais_array[0]);
		});



	};

	self.valid_packet = function(packet) {
		self.last_ais_msg = Date.now();
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


	self.connect();

}
