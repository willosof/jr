var debug       = require("debug")("control");
var util        = require("util");
var serialPort 	= require('serialport');
var ds 					= "";

exports = module.exports = function (system) {
	debug("new(control)");
	return new control(system);
};

function control(system) {
	var self = this;

	self.control_status = false;

	// for å oppdatere ikonene på websiden
	setInterval(function() {
		var now = Date.now();
		// valgene er success, warning, danger (grøn, oransj, rød)
		if (self.control_status === true) {
			system.emit('set_status', 'control', 'success', 'cogs', 'ok');
		} else {
			system.emit('set_status', 'control', 'danger', 'cogs', 'fault');
		}
	}, 1000);

  self.port = new serialPort('/dev/ttyACM1');
	self.port.on('open', function(){
		debug("port opened");
	});

	self.port.on('data',function(data) {
		self.control_status = true;
		ds = data.toString();
		system.emit('log', 'control', ds);
			if(ds == 0){
				system.emit('nodstopp_set_status', 'nodstopp_btn', 'danger', 'exclamation-triangle', 'Emergency Stop');
				system.emit('steering_set_status', 'stop_steering', 'success', 'compass', 'Stop');
				system.emit('speed_set_status', 'stop_speed', 'success', 'tachometer-alt', 'Stop');
				system.emit('steering_set_status', 'stb_steering', 'danger', 'compass', 'Standby');
				system.emit('steering_set_status', 'run_steering', 'danger', 'compass', 'Run');
				system.emit('steering_set_status', 'res_steering', 'danger', 'compass', 'Restart');
				system.emit('speed_set_status', 'stb_speed', 'danger', 'tachometer-alt', 'Standby');
				system.emit('speed_set_status', 'run_speed', 'danger', 'tachometer-alt', 'Run');
				system.emit('speed_set_status', 'res_speed', 'danger', 'tachometer-alt', 'Restart');
			}
			if(ds == 1){
				system.emit('nodstopp_set_status', 'nodstopp_btn', 'success', 'exclamation-triangle', 'Emergency Stop');
				system.emit('steering_set_status', 'stb_steering', 'danger', 'compass', 'Standby');
				system.emit('steering_set_status', 'run_steering', 'danger', 'compass', 'Run');
				system.emit('steering_set_status', 'res_steering', 'success', 'compass', 'Restart');
				system.emit('steering_set_status', 'stop_steering', 'danger', 'compass', 'Stop');
			}
			if(ds == 2){
				system.emit('nodstopp_set_status', 'nodstopp_btn', 'success', 'exclamation-triangle', 'Emergency Stop');
				system.emit('steering_set_status', 'stb_steering', 'success', 'compass', 'Standby');
				system.emit('steering_set_status', 'run_steering', 'danger', 'compass', 'Run');
				system.emit('steering_set_status', 'res_steering', 'danger', 'compass', 'Restart');
				system.emit('steering_set_status', 'stop_steering', 'danger', 'compass', 'Stop');
			}
			if(ds == 3){
				system.emit('nodstopp_set_status', 'nodstopp_btn', 'success', 'exclamation-triangle', 'Emergency Stop');
				system.emit('steering_set_status', 'stb_steering', 'danger', 'compass', 'Standby');
				system.emit('steering_set_status', 'run_steering', 'success', 'compass', 'Run');
				system.emit('steering_set_status', 'res_steering', 'danger', 'compass', 'Restart');
				system.emit('steering_set_status', 'stop_steering', 'danger', 'compass', 'Stop');
			}
			if(ds == 4){
				system.emit('set_status', 'steering', 'success', 'compass', 'ok');
			}
			if(ds == 5){
				system.emit('set_status', 'steering', 'danger', 'compass', 'false');
			}
			if(ds == 6){
				system.emit('nodstopp_set_status', 'nodstopp_btn', 'success', 'exclamation-triangle', 'Emergency Stop');
				system.emit('speed_set_status', 'stb_speed', 'danger', 'tachometer-alt', 'Standby');
				system.emit('speed_set_status', 'run_speed', 'danger', 'tachometer-alt', 'Run');
				system.emit('speed_set_status', 'res_speed', 'success', 'tachometer-alt', 'Restart');
				system.emit('speed_set_status', 'stop_speed', 'danger', 'tachometer-alt', 'Stop');
			}
			if(ds == 7){
				system.emit('nodstopp_set_status', 'nodstopp_btn', 'success', 'exclamation-triangle', 'Emergency Stop');
				system.emit('speed_set_status', 'stb_speed', 'success', 'tachometer-alt', 'Standby');
				system.emit('speed_set_status', 'run_speed', 'danger', 'tachometer-alt', 'Run');
				system.emit('speed_set_status', 'res_speed', 'danger', 'tachometer-alt', 'Restart');
				system.emit('speed_set_status', 'stop_speed', 'danger', 'tachometer-alt', 'Stop');
			}
			if(ds == 8){
				system.emit('nodstopp_set_status', 'nodstopp_btn', 'success', 'exclamation-triangle', 'Emergency Stop');
				system.emit('speed_set_status', 'stb_speed', 'danger', 'tachometer-alt', 'Standby');
				system.emit('speed_set_status', 'run_speed', 'success', 'tachometer-alt', 'Run');
				system.emit('speed_set_status', 'res_speed', 'danger', 'tachometer-alt', 'Restart');
				system.emit('speed_set_status', 'stop_speed', 'danger', 'tachometer-alt', 'Stop');
			}
			if(ds == 9){
				system.emit('set_status', 'speed', 'success', 'tachometer-alt', 'ok');
			}
			if(ds == 10){
				system.emit('set_status', 'speed', 'danger', 'tachometer-alt', 'fault');
			}

			if(ds == 11){
				system.emit('nodstopp_set_status', 'nodstopp_btn', 'success', 'exclamation-triangle', 'Emergency Break');
				system.emit('speed_set_status', 'stb_speed', 'danger', 'tachometer-alt', 'Standby');
				system.emit('speed_set_status', 'run_speed', 'danger', 'tachometer-alt', 'Run');
				system.emit('speed_set_status', 'res_speed', 'success', 'tachometer-alt', 'Restart');
				system.emit('speed_set_status', 'stop_speed', 'danger', 'tachometer-alt', 'Stop');
				system.emit('steering_set_status', 'stb_steering', 'danger', 'compass', 'Standby');
				system.emit('steering_set_status', 'run_steering', 'danger', 'compass', 'Run');
				system.emit('steering_set_status', 'res_steering', 'success', 'compass', 'Restart');
				system.emit('steering_set_status', 'stop_steering', 'danger', 'compass', 'Stop');
				system.emit('gps_set_status', 'res_gps', 'success', 'globe', 'Restart');
				system.emit('gps_set_status', 'run_gps', 'danger', 'globe', 'Run');
			}
			if(ds == 12){
				system.emit('nodstopp_set_status', 'nodstopp_btn', 'success', 'exclamation-triangle', 'Emergency Break');
				system.emit('speed_set_status', 'stb_speed', 'danger', 'tachometer-alt', 'Standby');
				system.emit('speed_set_status', 'run_speed', 'success', 'tachometer-alt', 'Run');
				system.emit('speed_set_status', 'res_speed', 'danger', 'tachometer-alt', 'Restart');
				system.emit('speed_set_status', 'stop_speed', 'danger', 'tachometer-alt', 'Stop');
				system.emit('steering_set_status', 'stb_steering', 'danger', 'compass', 'Standby');
				system.emit('steering_set_status', 'run_steering', 'success', 'compass', 'Run');
				system.emit('steering_set_status', 'res_steering', 'danger', 'compass', 'Restart');
				system.emit('steering_set_status', 'stop_steering', 'danger', 'compass', 'Stop');
				system.emit('gps_set_status', 'res_gps', 'danger', 'globe', 'Restart');
				system.emit('gps_set_status', 'run_gps', 'success', 'globe', 'Run');
			}
			if(ds == 13){
				system.emit('nodstopp_set_status', 'nodstopp_btn', 'success', 'exclamation-triangle', 'Emergency Break');
				system.emit('speed_set_status', 'stb_speed', 'success', 'tachometer-alt', 'Standby');
				system.emit('speed_set_status', 'run_speed', 'danger', 'tachometer-alt', 'Run');
				system.emit('speed_set_status', 'res_speed', 'danger', 'tachometer-alt', 'Restart');
				system.emit('speed_set_status', 'stop_speed', 'danger', 'tachometer-alt', 'Stop');
				system.emit('steering_set_status', 'stb_steering', 'success', 'compass', 'Standby');
				system.emit('steering_set_status', 'run_steering', 'danger', 'compass', 'Run');
				system.emit('steering_set_status', 'res_steering', 'danger', 'compass', 'Restart');
				system.emit('steering_set_status', 'stop_steering', 'danger', 'compass', 'Stop');
			}
			if(ds == 14){
				system.emit('gps_set_status', 'res_gps', 'success', 'globe', 'Restart');
				system.emit('gps_set_status', 'run_gps', 'danger', 'globe', 'Run');
			}
	});

	debug("jadda, constructor funker");

	//system.on()


}
