
$(function() {

	var rpi = new io();

	rpi.on('connect', function() {
		console.log("connected to rpi");
		rpi.emit('ready');
	});

	rpi.on('log', function(service, text) {
		console.log('log():',service,text);
		$("#log_"+service).val(text + '\n' + $("#log_"+service).val());
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
		console.log("mmsi_add()",id,name);
		var $mmsilist = $('#mmsilist');
		var $fake = $("<li><span class='btn btn-danger btn-sm' data-id='"+id+"'>delete</span> "+name+"</li>");
		$mmsilist.append($fake);
		$fake.find('span').click(mmsi_delete);
	}

	rpi.on('mmsi_list', function(mmsis) {
		console.log("socket mmsi_list", mmsis);
		$('#mmsilist').html("");
		for (var mmsi in mmsis) {
			mmsi_add(mmsi,mmsi);
		}
	});

	var mmsi_delete = function() {
		var id = $(this).attr('data-id');
		rpi.emit('mmsi_del', id);
	};


/* status */



});
