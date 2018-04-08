var jet_position;
var boat_position;
var mmsi_list;

$(function() {

	var rpi = new io();

	rpi.on('connect', function() {
		console.log("connected to rpi");
		rpi.emit('ready');
	});

	rpi.on('log', function(service, text) {
		$("#log_"+service).val(text + '\n' + $("#log_"+service).val());
	});

	rpi.on('gps',function(text) {
		console.log(text);
	});

	rpi.on('heading', function(text){
		$("#heading").val(text);
	});

	rpi.on('boat_mmsi', function(mmsi,pos) {
		$("#settingsBoatMMSI").val(mmsi);
		console.log("BOAT_MMSI():",mmsi,pos);
		boat_position = pos;
		if (pos !== undefined && pos !== null) {
			update_map();
		}

	});

	rpi.on('jet_update', function(pos) {
		jet_position = pos;
		if(pos !== undefined && pos !== null) {
			update_map();
		}
	});

	$("#settingsSaveBoatMMSI").click(function() {
		rpi.emit('boat_mmsi_update', $("#settingsBoatMMSI").val() );
	});


	rpi.on('status', function(services) {

		var service_definition = {
			'speed': 'Speed',
			'control': 'Control',
			'gps': 'GPS',
			'ais_receiving': 'AIS'
		};

		$ul = $("#status_wrapper ul");
		$ul.html("");

		for (var i in services) {
			var s = services[i];
			//console.log(s);
			var $li = $("<li><span title='"+service_definition[i]+"' class='btn btn-"+s[0]+" btn-lg' id='status_"+i+"'><i class='fa fa-"+s[1]+"'></i> "+s[2]+"</span>&nbsp;</li>");
			$li.appendTo($ul);
		}
	});

	rpi.on('speed_status', function(services) {

		var service_definition = {
			'stb_speed': 'Standby Speed',
			'run_speed': 'Run Speed',
			'res_speed': 'Restart Speed',
			'stop_speed': 'Stop Speed',
		};

		$ul = $("#speed_wrapper ul");
		$ul.html("");

		for (var i in services) {
			var s = services[i];
			//console.log(s);
			var $li = $("<li><span title='"+service_definition[i]+"' class='btn btn-"+s[0]+" btn-lg' id='status_"+i+"'><i class='fa fa-"+s[1]+"'></i> "+s[2]+"</span>&nbsp;</li>");
			$li.appendTo($ul);
		}
	});

	rpi.on('steering_status', function(services) {

		var service_definition = {
			'stb_steering': 'Standby Steering',
			'run_steering': 'Run Steering',
			'res_steering': 'Restart Steering',
			'stop_steering': 'Stop Steering',
		};

		$ul = $("#steering_wrapper ul");
		$ul.html("");

		for (var i in services) {
			var s = services[i];
			//console.log(s);
			var $li = $("<li><span title='"+service_definition[i]+"' class='btn btn-"+s[0]+" btn-lg' id='status_"+i+"'><i class='fa fa-"+s[1]+"'></i> "+s[2]+"</span>&nbsp;</li>");
			$li.appendTo($ul);
		}
	});

	rpi.on('gps_status', function(services) {

		var service_definition = {
			'run_gps': 'Run GPS',
			'res_gps': 'Restart GPS',
		};

		$ul = $("#gps_wrapper ul");
		$ul.html("");

		for (var i in services) {
			var s = services[i];
			//console.log(s);
			var $li = $("<li><span title='"+service_definition[i]+"' class='btn btn-"+s[0]+" btn-lg' id='status_"+i+"'><i class='fa fa-"+s[1]+"'></i> "+s[2]+"</span>&nbsp;</li>");
			$li.appendTo($ul);
		}
	});

	rpi.on('nodstopp_status', function(services) {

		var service_definition = {
			'nodstopp_btn': 'Nodstopp',

		};

		$ul = $("#nodstopp_wrapper ul");
		$ul.html("");

		for (var i in services) {
			var s = services[i];
			//console.log(s);
			var $li = $("<li><span title='"+service_definition[i]+"' class='btn btn-"+s[0]+" btn-lg' id='status_"+i+"'><i class='fa fa-"+s[1]+"'></i> "+s[2]+"</span>&nbsp;</li>");
			$li.appendTo($ul);
		}
	});



	$("#settingsAddMMSIButton").click(function() {
		var new_mmsi = $("#settingsAddMMSI").val();
		if (new_mmsi !== undefined && new_mmsi.length > 0) {
			rpi.emit('mmsi_add', new_mmsi);
		}

	});

	var mmsi_add = function(id,name) {
		var $mmsilist = $('#mmsilist');
		var $fake = $("<li><span class='btn btn-danger btn-sm' data-id='"+id+"'>delete</span> "+name+"</li>");
		$mmsilist.append($fake);
		$fake.find('span').click(mmsi_delete);
	}

	rpi.on('mmsi_list', function(mmsis) {
		$('#mmsilist').html("");
		for (var mmsi in mmsis) {
			mmsi_add(mmsi,mmsi);
		}
	});

	var mmsi_delete = function() {
		var id = $(this).attr('data-id');
		rpi.emit('mmsi_del', id);
	};


	map = new OpenLayers.Map("basicMap");
	var mapnik         = new OpenLayers.Layer.OSM();
	var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
	var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
	var position       = new OpenLayers.LonLat(10.75,59.90).transform( fromProjection, toProjection);
	var size					 = new OpenLayers.Size(31, 35);
	var offset 				 = new OpenLayers.Pixel(-(size.w/2), -size.h);
	var jet_icon			 = new OpenLayers.Icon('/fa/img/jetrescuer.png', size, offset);
	var boat_icon			 = new OpenLayers.Icon('/fa/img/boat.png', size, offset);
	var mob_icon			 = new OpenLayers.Icon('/fa/img/mob.png', size, offset);
	var zoom           = 13;

	map.addLayer(mapnik);
	map.setCenter(position, zoom );

	var markers = new OpenLayers.Layer.Markers( "Markers" );
	map.addLayer(markers);


	var addMarker = function(lat,lon, boat, icon) {

		map.addLayer(new OpenLayers.Layer.OSM());

		var lonLat = new OpenLayers.LonLat( lat,lon ).transform(
			new OpenLayers.Projection("EPSG:4326"),
			map.getProjectionObject()
		);

		var lonLat_two = new OpenLayers.LonLat( lat,lon ).transform(
			new OpenLayers.Projection("EPSG:4326"),
			map.getProjectionObject()
		);

		markers.addMarker(new OpenLayers.Marker(lonLat, icon));


	}

	var update_map = function() {
		markers.clearMarkers();
		if (mmsi_list !== undefined) {
			for (var mmsi in mmsi_list) {
				var coord = mmsi_list[mmsi];
				if (coord !== true && coord !== undefined) {
					var latlng = coord.split(/,/);
					addMarker(latlng[1], latlng[0], true, mob_icon);
				}
			}
		}

		if (boat_position !== undefined && boat_position !== null) {
			var latlng = boat_position.split(/,/);
			addMarker(latlng[1], latlng[0], true, boat_icon);
		}

		if (jet_position !== undefined && jet_position !== null) {
			var latlon = jet_position.split(/[:/n]/);
			addMarker(latlon[1], latlon[0], true, jet_icon);
		}

	};


	rpi.on('boat_update', function(pos) {
		console.log('boat_update()',pos);
		boat_position = pos;
		update_map();
	});

	rpi.on('mmsi_list', function(mmsis) {
		mmsi_list = mmsis;
		update_map();
	})




});
