
Sajax = Class.create( {
initialize: function( uri, callback, options ) {
this.callback = callback;
this.options = Object.extend( {
timeout: 0,
after_window_load: true
}, options );
if ( !this.options.callback_name ) {
this.options.callback_name = "callback" + Math.floor((Math.random() * 10000 ));
}
window[this.options.callback_name] = this.response.bind( this );
if ( !this.options.omit_callback_query_arg ) {
if ( uri.search( /\?/ ) == -1 )
uri += "?";
else
uri += "&";
uri += "callback=" + this.options.callback_name;
}
this.uri = uri;
this.send();
},
_dom_send: function() {
var tag = new Element("script");
tag.type = "text/javascript";
tag.src = this.uri;
var head = document.getElementsByTagName("head");
if ( !head || head.length < 1 )
document.body.appendChild( tag );
else
head[0].appendChild( tag );
this.wait();
},
send: function() {
if ( OnWindowLoad.prototype.flags.window_loaded || this.options.after_window_load ) {
var loader = new OnWindowLoad( this._dom_send.bind( this ) );
loader.run();
}
else {
this._dom_send();
}
},
wait: function() {
if ( arguments.length )
this.options.timeout = arguments[0];
if ( this.options.timeout ) {
delete this._do_not_respond;
this._timeout = setTimeout( this.on_timeout.bind( this ), this.options.timeout );
}
},
response: function( data ) {
this.stop_timeout();
if ( !this._do_not_respond ) {
this.callback( this, data );
}
},
on_timeout: function() {
this.stop_timeout();
this._do_not_respond = true;
if ( this.options.on_timeout ) {
this.options.on_timeout( this );
}
},
stop_timeout: function() {
if ( this._timeout ) {
window.clearTimeout( this._timeout );
delete this._timeout;
}
}
} );
SJAX = Class.create( {
initialize: function( uri, params ) {
this.params = params;
if ( uri.indexOf( document.location.origin ) == 0 ) {
return this.do_ajax( uri, params );
}
else {
return this.do_sajax( uri, params );
}
},
do_ajax: function( uri, params ) {
var options = {
evalJS: false,
evalJSON: false,
onSuccess: this.on_ajax_success.bind( this ),
onFailure: this.on_failure.bind( this ),
onException: this.on_failure.bind( this )
};
if ( params.data ) {
if ( params.format == 'json' )
options.postBody = tJSON.stringify(params.data);
else
options.postBody = MooHash.toQueryString( params.data );
options.method = 'post';
}
else {
options.method = 'get';
}
return new Ajax.Request( uri, options );
},
do_sajax: function( uri, params ) {
if ( params.data ) {
uri = uri + "?" + MooHash.toQueryString( params.data );
}
params.on_timeout = this.on_failure.bind( this );
return new Sajax( uri, this.on_sajax_success.bind( this ), params );
},
on_ajax_success: function( transport ) {
if ( transport.responseText ) {
var data = transport.responseText.evalJSON();
this.params.on_success( data );
}
else {
this.params.on_failure();
}
},
on_sajax_success: function( sajax, data ) {
this.params.on_success( data );
},
on_failure: function( transport ) {
if ( this.params.on_failure ) {
this.params.on_failure();
}
}
} );