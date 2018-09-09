Polling = Class.create( {
initialize: function( config ) {
this.on_success_function = this.on_polling_success.bind( this );
this.on_failure_function = this.on_polling_failure.bind( this );
this.init_time_messages();
this.wait( config );
},
init_time_messages: function() {
this.time_messages = {};
this.message_view = $('reserve_polling_wait_messages');
var nodes = this.message_view.childElements();
for ( var i = 0 ; i < nodes.length ; i ++ ) {
var node = nodes[i];
this.time_messages[node.id] = node;
if ( !Element.visible( node ) ) {
Element.remove( node );
}
}
},
stop_waiting: function() {
if ( this.poll_timeout ) {
window.clearTimeout( this.poll_timeout );
delete this.poll_timeout;
}
},
wait: function( data ) {
this.poll_timeout = setTimeout( this.poll.bind( this, data ), data.poll.delay * 1000 );
},
on_polling_success: function( transport ) {
if ( transport.responseText ) {
var data = transport.responseText.evalJSON();
if ( data.poll ) {
this.show_polling( data );
}
else if ( data.html ) {
var doc = document.open( "text/html", "replace" );
doc.write( data.html );
doc.close();
}
else {
window.location = data.uri;
}
}
else {
this.on_polling_failure();
}
},
on_polling_failure: function() {
window.location = "/checkout/order?error=polling-error";
},
poll: function( data ) {
this.stop_waiting();
new Ajax.Request( data.uri, {
method: 'get',
evalJS: false,
evalJSON: false,
onSuccess: this.on_success_function,
onFailure: this.on_failure_function,
onException: this.on_failure_function
} );
},
clear_all_time_messages: function() {
for ( var id in this.time_messages ) {
var node = this.time_messages[id];
if ( node.parentNode == this.message_view ) {
Element.remove( node );
}
}
},
show_polling: function( data ) {
this.clear_all_time_messages();
if ( !data.poll.queue_wait ) {
if ( data.poll.queue_minutes && data.poll.queue_seconds ) {
var minutes = new Number( data.poll.queue_minutes );
var seconds = new Number( data.poll.queue_seconds );
data.poll.queue_wait = minutes * 60 + seconds;
}
else {
data.poll.queue_wait = 0;
}
}
if ( !Object.isUndefined(data.poll.queue_wait) ) {
this.update_time_remaining( data.poll.queue_wait );
}
this.wait( data );
},
show_message: function( id ) {
var node = this.time_messages[id];
this.message_view.appendChild( node );
node.show();
},
update_time_remaining: function( wait ) {
if ( wait == 0 ) {
this.show_message('reserve_polling_working');
}
else {
if ( wait > 90 ) {
this.show_message('reserve_polling_higher_traffic_than_usual');
}
this.show_message('reserve_polling_wait_time');
if ( wait < 60 ) {
this.show_message('reserve_polling_less_than_minute');
return;
}
if ( wait >= 60 && wait <= 90 ) {
this.show_message('reserve_polling_approx_minute');
return;
}
if ( wait > 2670 ){
this.show_message('reserve_polling_more_45_minutes');
return;
}
else {
var minutes = Math.floor(wait/60);
if ( wait > 90 && wait < 300 ) {
if ( ( wait % 60 ) <= 30 )
id = 'reserve_polling_approx_num_minutes';
else {
id = 'reserve_polling_less_than_minutes';
minutes ++;
}
}
if ( wait >= 300 ) {
if ( ( wait % 60 ) <= 30 )
id = 'reserve_polling_approx_large_minutes';
else {
id = 'reserve_polling_less_than_large_minutes';
minutes ++;
}
}
var message = this.time_messages[id];
this.show_message( id );
message.down().update( minutes );
}
}
}
} );
