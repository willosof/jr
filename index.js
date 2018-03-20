process.env['DEBUG'] = '*,-config,-engine*,-socket.io*,-express*';

var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);
var fs      = require('fs');
var net     = require('net');
var debug   = require('debug');
var EventEmitter = require('events').EventEmitter;
var system  = new EventEmitter();
var ais     = require("./lib/ais")(system);
var config  = require("./lib/config")(system);
var serial  = require("./lib/serial")(system);
var gps     = require("./lib/gps")(system);
var control = require("./lib/control")(system);
var compass = require("./lib/compass")(system);
var geodist = require('geodist')


// Local state of the status representation
var status  = {
	speed:         [ 'danger', 'speed', '' ],
	control:       [ 'danger', 'cogs', '' ],
	gps:           [ 'danger', 'globe', '' ],
	ais_receiving: [ 'danger', 'exclamation-triangle', '' ],
	//ais_radio:     [ 'danger', 'exclamation-triangle', '' ]
};

// Local state of the MMSI list
var mmsi_list = {};

// Bind opp /public mappa til å være statiske filer :)
app.use(express.static(__dirname + '/public'));

// Bind opp / URLen til å peke til /index.html fila
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/public/index.html');
});


// Status Section
var sendStatus = function(client) {
	client.emit('status', status);
};


// MMSI Section
var MMSIAdd = function(id) {
	mmsi_list[id] = "0,0"; // add the mmsi to the list
	io.emit('mmsi_list', mmsi_list); // send new list to all
	saveMMSI();
};

var MMSIDel = function(id) {
	delete mmsi_list[id]; // delete this mmsi from list
	io.emit('mmsi_list', mmsi_list); // send new list to all
	saveMMSI();
};

var sendMMSIs = function(client) {
	client.emit('mmsi_list', mmsi_list);
};

var sendBoatMMSI = function(client) {

	system.emit('config_get', 'boat_mmsi', function(value) {
		if (value === undefined) {
			boat_mmsi = "0";
			system.emit('config_set', 'boat_mmsi', '0');
		}
		else {
			boat_mmsi = value;
		}

		system.emit('config_get', 'boat_position', function(boat_pos) {
			client.emit('boat_mmsi', boat_mmsi, boat_pos);
			console.log(boat_pos);
		});

	});

}

var sendJetMMSI = function(client) {
	system.on('location_data', function(pos){
		client.emit('jet_update',pos);
	});
}

var saveMMSI = function() {
	var json = JSON.stringify(mmsi_list);
	fs.writeFile('mmsi.json', json, 'utf8', function() {
		debug("mmsi.json saved")
	});
};



system.on('position_calculate', function() {
	system.emit('config_get','boat_position', function(b) {
		if (b !== undefined) {
			var boat_position = b.split(/,/);
			for (var mmsi in mmsi_list) {
				if (mmsi_list[mmsi] !== undefined) {
					var mob_position = mmsi_list[mmsi].split(/,/);
					var dist = geodist({
						lat: boat_position[0],
						lon: boat_position[1]
					}, {
						lat: mob_position[0],
						lon: mob_position[1],
					}, {
						exact: true,
						unit: "meters"
					});
					debug("CURRENT DISTANCE", mmsi, parseInt(dist) );
				}
			}
		}
	});
	system.on('location_data', function(data){
		var jet_position = data.split(/[:\n]/);
		for(var mmsi in mmsi_list) {
			if (mmsi_list[mmsi] !== undefined) {
				var mob_position = mmsi_list[mmsi].split(/,/);
				var dist = geodist({
					lat: jet_position[0],
					lon: jet_position[1]
				}, {
					lat: mob_position[0],
					lon: mob_position[1],
				}, {
					exact: true,
					unit: "meters"
				});
				debug("CURRENT DISTANCE FROM JET", mmsi, parseInt(dist) );
			}
		}
	});
});


system.on('mmsi_update', function(mob_mmsi, mob_position) {
	system.emit('position_calculate');
});


system.on('boat_update', function(mmsi, pos) {
	debug("BOAT MOVED: ", pos);
	system.emit('config_set', 'boat_position', pos);
	system.emit('position_calculate');
});



var loadMMSI = function() {
	fs.readFile('mmsi.json', 'utf8', function readFileCallback(err, data){
    if (err) {
      debug("loadMMSI() error",err);
    }
		else {
			var test = JSON.parse(data);
			if (test !== undefined) {
	    	mmsi_list = test;
				io.emit('mmsi_list', mmsi_list);
			}
		}
	});
}


// Add something to the system log and tell the browsers about it.
var syslog = function(device,text) {
 	var date = new Date();
  var d = date.toISOString().substr(11, 8);
	io.emit('log', device, ''+d+' - ' + text);
};

// add system listener for logging
system.on('log', function(device,text) {
	syslog(device,text);
});


// Status management
system.on('set_status', function(key, state, fa, text) {
	debug("set_status", key, status, fa, text);
	status[key] = [state, fa, text];
	io.emit('status', status);
});

// Initlog has no other function that to test and verify that the browser
// log window has connection to the backend.
var initLog = function(client) {
	client.emit('log', 'compass', '--- compass log start ---');
	client.emit('log', 'gps', '--- gps log start ---');
	client.emit('log', 'ais', '--- ais log start ---');
	client.emit('log', 'control', '--- control log start ---');
}

// This function is for catching the browser up to speed when it's ready
// to receive data.

var sendRaceConditions = function(client) {
	client.emit('status', status);
	initLog(client);
	sendMMSIs(client);
	sendBoatMMSI(client);
	sendJetMMSI(client);
};


// When a browser connects
io.on('connect', function (client) {

	// when browser says it's ready
	client.on('ready', function() {
		sendRaceConditions(client);
	});

	// when browser wants to add a mmsi
	client.on('mmsi_add', function(id) {
		MMSIAdd(id)
	});

	// when browser wants to delete a mmsi
	client.on('mmsi_del', function(id) {
		MMSIDel(id);
	});

	// when boat mmsi changes from client
	client.on('boat_mmsi_update', function(mmsi) {
		console.log("New boat");
		system.emit('config_set', 'boat_mmsi', mmsi);
		client.broadcast.emit('boat_mmsi', mmsi);
	});

});

system.on('ais_packet', function(data) {

	var pos = data.latitude + ',' + data.longitude;

	if (mmsi_list[data.mmsi] === undefined) {
		syslog('ais', 'Got unknown mmsi ' + data.mmsi);
		//mmsi_list[data.mmsi] = pos;
	}
	else {
		mmsi_list[data.mmsi] = pos;
		system.emit('mmsi_update', data.mmsi, pos);
	}

	system.emit('config_get', 'boat_position', function(value) {
		if (value == data.mmsi) {
			system.emit('boat_update', data.mmsi, pos);
			io.emit('boat_update', value);
			syslog('ais', 'boat update: ' + value);
		}
	});

	io.emit('mmsi_list', mmsi_list);
	//io.emit('log', 'ais', 'Got position for MMSI ' + data.mmsi + ': ' + pos);

});



// Load MMSIs from mmsi.json
loadMMSI();

// TCP port å lytte på for webserveren.
server.listen(4200);
