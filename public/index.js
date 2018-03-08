
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

	rpi.on('boat_mmsi', function(mmsi,pos) {
		$("#settingsBoatMMSI").val(mmsi);
		console.log("BOAT_MMSI():",mmsi,pos);
		boat_position = pos;
		if (pos !== undefined && pos !== null) {
			update_map();
		}

	});

	$("#settingsSaveBoatMMSI").click(function() {
		rpi.emit('boat_mmsi_update', $("#settingsBoatMMSI").val() );
	});


	rpi.on('status', function(services) {

		for (var i in services) {
			var service = services[i];
			console.log("HEHE", service);
			var $status_button = $("#status_"+i);

			if (service[0] == 'ok') {
				$status_button.removeClass('btn-warning');
				$status_button.removeClass('btn-danger');
				$status_button.addClass('btn-success');
			}

			else if (service[0] == 'warning') {
				$status_button.removeClass('btn-warning');
				$status_button.removeClass('btn-success');
				$status_button.addClass('btn-warning');
			}

			else {
				$status_button.removeClass('btn-warning');
				$status_button.removeClass('btn-success');
				$status_button.addClass('btn-danger');
			}

			$status_button.html(service[1]);

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
	var zoom           = 13;

	map.addLayer(mapnik);
	map.setCenter(position, zoom );

	var markers = new OpenLayers.Layer.Markers( "Markers" );
	map.addLayer(markers);


	var addMarker = function(lat,lon, boat) {

		map.addLayer(new OpenLayers.Layer.OSM());

		var lonLat = new OpenLayers.LonLat( lat,lon ).transform(
			new OpenLayers.Projection("EPSG:4326"),
			map.getProjectionObject()
		);

		var lonLat_two = new OpenLayers.LonLat( lat,lon ).transform(
			new OpenLayers.Projection("EPSG:4326"),
			map.getProjectionObject()
		);

		markers.addMarker(new OpenLayers.Marker(lonLat));


	}

	var update_map = function() {
		markers.clearMarkers();
		if (mmsi_list !== undefined) {
			for (var mmsi in mmsi_list) {
				var coord = mmsi_list[mmsi];
				if (coord !== true && coord !== undefined) {
					var latlng = coord.split(/,/);
					addMarker(latlng[1], latlng[0], false);
				}
			}
		}

		if (boat_position !== undefined && boat_position !== null) {
			console.log("bott", boat_position);
			var latlng = boat_position.split(/,/);
			addMarker(latlng[1], latlng[0], true);
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
