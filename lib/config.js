var debug = require('debug')('config');
var fs    = require('fs');

/**
	Simpel Config KVS

	Events: (system objektet)
	  * config_loaded(data) - Alle data
	  * config_saved(err) - kommandoen db_save ble fullført (eller feilet)

	Svarer på events: (system objektet)
	  * config_set(key, value) - Sett key til value
	  * config_get(key, cb) - Hent verdi til key i store, emitter svar til callback cb
	  * config_save - Lagrer db fra minne til fil. Svarer med db_saved. (se over)
*/

module.exports = exports = function (system) {
	return new config(system);
};

function config(system) {
	var self = this;

	self._system = system;
	self.store = {};

	try {
		var data = fs.readFileSync('config');

		self.store = JSON.parse(data);
		debug('config loaded');

		// Ikke nødvendig lenger, siden config leses før alt annet loades
		system.emit('config_loaded', self.store);

	} catch (err) {

		if (err.code == 'ENOENT') {
			debug("readFile(db)","Couldnt read config, loading default config");
			system.emit('config_loaded', {});
		} else {
			throw err;
		}
	}

	system.on('config_get', function (key, cb) {
		debug('config_get(' + key + ')');
		cb(self.store[key]);
	});

	system.on('config_all', function(cb) {
		cb(self.store);
	});

	system.on('config_save', function () {

		fs.writeFile('config', JSON.stringify(self.store), function (err) {

			if (err) {
				debug('Error saving: ', err);
				system.emit('config_saved', err);
				return;
			}

			debug('config written');
			system.emit('config_saved', null);

		});

	});

	system.on('config_set', function (key, value) {
		if (self.store[key] !== value) {
			system.emit('log', 'Configuration value ' + key + ' changed from ' + self.store[key] + ' to ' + value);
			self.store[key] = value;
			system.emit("config_save");
			debug('config_set('+key+') = '+value+' (changed)');
		}
		else {
			debug('config_set('+key+') = '+value+' (not changed)');
		}
	});


};
