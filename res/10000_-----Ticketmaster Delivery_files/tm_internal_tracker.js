ClickTrack= Class.create( {
initialize: function( base_url ) {
this.base_url = base_url + '?';
this.formated_arrival_params = '';
this.has_required_params = 0;
this.log_only_once_set = [];
},
_format_parameters: function( params ) {
if( typeof params == 'string' ){
return params;
} else {
var param_bucket = [];
for ( var key in params ) {
if ( key == '__log_only_once__' ) {
continue;
}
if ( params[key] ) {
param_bucket.push( key + '=' + params[key] );
} else {
param_bucket.push( key );
}
}
return param_bucket.join( '&' );
}
},
set_required_parameters: function ( params ) {
if ( this.has_required_params && params ) {
this.base_url += '&';
}
var formated_params = this._format_parameters( params );
if ( formated_params ) {
this.base_url += formated_params;
this.has_required_params = 1;
}
},
set_arrival_parameters: function ( params ) {
if ( this.formated_arrival_params ) {
this.formated_arrival_params += '&';
}
this.formated_arrival_params += this._format_parameters( params );
},
on_arrival: function( ) {
this.log_datapoint( this.formated_arrival_params );
},
on_departure: function( ) {
this.log_datapoint( this.formated_arrival_params );
},
_fire_log: function( params, async ) {
var log_url = this.base_url;
if( this.has_required_params && params ) {
log_url += '&';
}
log_url += this._format_parameters( params );
if ( async != false ) {
async = true;
}
new Ajax.Request( log_url, {
method: 'get',
asynchronous: async
} );
},
log_datapoint: function( params, async ) {
if ( $H( params ).keys().indexOf( '__log_only_once__' ) != -1 ) {
if ( this.log_only_once_set.indexOf( params['__log_only_once__'] ) == -1 ) {
this._fire_log( params, async );
this.log_only_once_set.push( params['__log_only_once__'] );
}
} else {
this._fire_log( params, async );
}
}
});
