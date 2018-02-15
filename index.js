var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);

var status  = {
	compass:       [ 'warning', '<span class="fa fa-exclamation-triangle"></span>' ],
	control:       [ 'ok',      '<span class="fa fa-check"></span>' ],
	gps:           [ 'ok',      '<span class="fa fa-check"></span>' ],
	ais_receiving: [ 'error',   '<span class="fa fa-times"></span>' ],
	ais_radio:     [ 'ok',      '<span class="fa fa-check"></span>' ]
};

var mmsi_list = {
	'test': true
};

// Bind opp /public mappa til å være statiske filer :)
app.use(express.static(__dirname + '/public'));

// Bind opp / URLen til å peke til /index.html fila
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/public/index.html');
});

var sendStatus = function(client) {
	console.log('sendStatus(',client.id,')')
	client.emit('status', status);
};

var MMSIAdd = function(id) {
	mmsi_list[id] = true;
	io.emit('mmsi_list', mmsi_list);
};

var MMSIDel = function(id) {
	delete mmsi_list[id];
	io.emit('mmsi_list', mmsi_list);
};

var sendMMSIs = function(client) {
	client.emit('mmsi_list', mmsi_list);
};

var syslog = function(device,text) {
	console.log("sendLog()")
	io.emit('log', device, text);
};

var setStatus = function(key, bootstrap, text) {
	console.log('setStatus(all):',key,bootstrap,text);
	status[key] = [bootstrap, text];
	io.emit('status', status);
};

var initLog = function(client) {
	console.log('initLog(',client.log,')');
	client.emit('log', 'compass', '--- compass log start ---');
	client.emit('log', 'gps', '--- gps log start ---');
	client.emit('log', 'ais', '--- ais log start ---');
	client.emit('log', 'control', '--- control log start ---');
}

var sendRaceConditions = function(client) {
	console.log('sendRaceConditions(',client.id,')')
	sendStatus(client);
	initLog(client);
	sendMMSIs(client);
};

io.on('connect', function (client) {
	client.on('ready', function() {
		sendRaceConditions(client);
	});
	client.on('mmsi_add', function(id) {
		MMSIAdd(id)
	});
	client.on('mmsi_del', function(id) {
		MMSIDel(id);
	});
});



// TCP port å lytte på for webserveren.
server.listen(4200);
