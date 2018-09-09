CountdownClock = Class.create( {
initialize: function( data ) {
this.minutes = $(data.minutes);
this.seconds = $(data.seconds);
this.nfb_message = data.nfb_message;
this.time_left = $(data.time_left);
this.is_running = false;
this.callbacks = [];
this.update_time_display();
},
add_timeout_handler: function( callback ) {
if ( !this.is_running && this.start_time && this.get_time_left() == 0 ) {
callback();
}
else {
this.callbacks.push( callback );
}
},
start: function() {
this.is_running = true;
this.start_time = new Date();
this.update_time_display();
this.call_nfb_alert();
},
stop: function() {
if ( this.timeout ) {
clearTimeout( this.timeout );
delete this.timeout;
}
},
set_time_left: function(time_left) {
this.time_left = $(time_left);
return this;
},
get_time_left: function() {
var now = new Date();
var elapsed = Math.floor( (now - this.start_time) / 1000 );
var time_left = this.time_left - elapsed;
if ( time_left < 0 )
time_left = 0;
return time_left;
},
call_nfb_alert: function() {
var message = this.nfb_message;
if (message && !$('CountdownClockAlert')) {
var alert_Message = document.createElement('div');
alert_Message.id = 'CountdownClockAlert';
alert_Message.setAttribute('role','alert');
alert_Message.className = 'hideContent';
alert_Message.innerHTML = '<span>' + message + '</span>';
$(alert_Message).hide();
this.alert_Message = alert_Message;
document.body.appendChild(this.alert_Message);
}
},
update_time_display: function() {
var time_left = this.get_time_left();
var minutes = Math.floor( time_left/60 );
var seconds = time_left % 60;
if ( seconds < 10 )
seconds = "0" + seconds;
if ( minutes < 10 )
minutes = "0" + minutes;
if (this.nfb_message &&  minutes * 1 < 1 && seconds * 1 == 30 )
$(this.alert_Message).show();
this.minutes.innerHTML = minutes;
this.seconds.innerHTML = seconds;
if ( this.is_running ) {
if ( time_left > 0 ) {
this.timeout = setTimeout( this.update_time_display.bind( this, this.update_time_display ), 1000 );
}
else {
this.stop();
for ( var i = 0 ; i < this.callbacks.length ; i ++ ) {
this.callbacks[i]();
}
}
}
}
});
