SeatingChartDisplay = Class.create( Module, {
initialize: function ( $super, options ) {
$super( { dom: 'seating_chart' } );
this.map_size = options.map_size;
this.viewport = [ options.viewport_width, this.map_size[1] ];
this.$('seating_chart_image').style.width = this.map_size[0] + "px";
this.$('seating_chart_image').style.height = this.map_size[1] + "px";
this.$('chart_container').style.width = this.viewport[0] + "px";
this.$('chart_container').style.height = this.viewport[1] + "px";
this.current_pos = [ -1000, -1000 ];
this.charts = {};
this.is_magnified = false;
this.default_id = options.default_id;
Event.observe( this.$('chart_select'), 'change', this.update_chart.bind( this ) );
this.$('chart_container').observe( 'mousedown', this.start_drag.bind( this ) );
this.update_chart_event = this.update_chart_position.bind( this );
Event.observe( document.body, 'mouseup', this.end_drag.bind( this ) );
SeatingChartDisplay.zoom_popup.addLinks( [ {
link_id: this.id('sc_mag_zoom_in'),
anchor_align: {
x: 1,
y: -1
},
popup_align: {
x: -1,
y: -1
},
offset: {
x: 3,
y: 2
}
} ] );
SeatingChartDisplay.zoom_popup.addLinks( [ {
link_id: this.id('sc_mag_zoom_out'),
anchor_align: {
x: 1,
y: -1
},
popup_align: {
x: -1,
y: -1
},
offset: {
x: 3,
y: 2
}
} ] );
},
start_drag: function( event ) {
if( this.is_magnified && !this.is_dragging ) {
this.current_mouse = [ Event.pointerX(event), Event.pointerY(event) ];
this.$('chart_container').style.cursor = SeatingChartDisplay.grabbing_cursors;
this.is_dragging = true;
Event.observe( document.body, 'mousemove', this.update_chart_event );
Event.stop( event );
}
},
update_chart_position: function( event ) {
if ( this.is_dragging ) {
var current_mouse = [ Event.pointerX(event), Event.pointerY(event) ];
var new_pos = [];
for ( var i = 0 ; i <= 1 ; i ++ ) {
new_pos[i] = this.current_pos[i] + current_mouse[i] - this.current_mouse[i];
if ( new_pos[i] > 0 )
new_pos[i] = 0;
if ( -new_pos[i] + this.viewport[i] > this.large_map[i] )
new_pos[i] = this.viewport[i] - this.large_map[i];
}
this.current_pos = new_pos;
this.set_chart_position();
this.$('chart_container').style.cursor = SeatingChartDisplay.grabbing_cursors;
this.current_mouse = current_mouse;
Event.stop( event );
}
},
end_drag: function( event ) {
if( this.is_dragging ) {
this.is_dragging = false;
this.$('chart_container').style.cursor = SeatingChartDisplay.grab_cursors;
Event.stopObserving( document.body, 'mousemove', this.update_chart_event );
}
},
add_chart: function ( chart ) {
this.charts[chart.id] = chart;
},
set_chart_position: function() {
this.$('chart_container').style.backgroundPosition = this.current_pos[0] + "px " + this.current_pos[1] + "px";
},
update_magnification: function() {
if( this.is_magnified ) {
var options = this.$('chart_select').options;
var option = options[this.$('chart_select').selectedIndex];
var chart = this.charts[option.value];
this.$('chart_container').className = "map-zoomIn";
this.$('chart_container').style.cursor = SeatingChartDisplay.grab_cursors;
this.$('chart_container').style.backgroundImage = "url('" + chart.image + "')";
this.set_chart_position();
this.$('seating_chart_image').style.display = "none";
this.$('sc_mag_zoom_in').hide();
this.$('sc_mag_zoom_out').show();
$('zoomTip').innerHTML = SeatingChartDisplay.zoom_out_tip;
}
else {
this.$('seating_chart_image').style.display = "";
this.$('chart_container').style.backgroundImage = "";
this.set_chart_position();
this.$('seating_chart_image').style.cursor = "pointer";
this.$('chart_container').className = "map-zoomOut";
this.$('chart_container').style.cursor = "default";
this.$('sc_mag_zoom_out').hide();
this.$('sc_mag_zoom_in').show();
$('zoomTip').innerHTML = SeatingChartDisplay.zoom_in_tip;
}
},
toggle_magnification: function( by_mag_icon, event ) {
if( this.is_magnified ) {
this.is_magnified = false;
this.current_pos = [-1000, -1000];
}
else {
this.is_magnified = true;
if( !by_mag_icon ) {
var mouse = [ Event.pointerX(event), Event.pointerY(event) ];
var map_pos = this.$('seating_chart_image').cumulativeOffset();
for ( var i = 0 ; i <= 1 ; i ++ )
this.current_pos[i] = -( ((mouse[i] - map_pos[i]) / this.map_size[i]) * this.hidden_map[i] );
} else {
this.current_pos = [0,0];
}
}
this.update_magnification();
},
setup_magnification: function() {
this.$('magnify_box').style.display = "";
this.$('seating_chart_image').observe( 'click', this.toggle_magnification.bind( this, false ) );
this.$('magnify_box').observe( 'click', this.toggle_magnification.bind( this, true ) );
},
calculate_large_chart_size: function( chart ) {
var sc = this;
jQuery( SeatingChartDisplay._img_check ).bind( 'load', function() {
sc.hidden_map = [];
sc.large_map = [ SeatingChartDisplay._img_check.width, SeatingChartDisplay._img_check.height ];
for ( var i = 0 ; i <= 1 ; i ++ ) {
sc.hidden_map[i] = sc.large_map[i] - sc.viewport[i];
sc.current_pos[i] = -(sc.hidden_map[i] / 2);
}
jQuery( SeatingChartDisplay._img_check ).unbind( 'load' );
} );
SeatingChartDisplay._img_check.src = chart.image;
},
update_chart: function() {
var options = this.$('chart_select').options;
var option = options[this.$('chart_select').selectedIndex];
var chart = this.charts[option.value];
if( options[0].value == -1 ) {
this.$('chart_select').remove(0);
this.setup_magnification();
}
if (chart) {
this.calculate_large_chart_size( chart );
this.$('seating_chart_image').setAttribute("alt", chart.description);
this.$('seating_chart_image').src = chart.small_image;
if( this.is_magnified ) {
this.toggle_magnification();
}
else {
this.update_magnification();
}
}
},
_alpha_sort_charts: function ( a, b ) {
if ( a.description > b.description )
return 1;
if ( a.description < b.description )
return -1;
return 0;
},
setup_display: function () {
var select = this.$('chart_select');
select.options.length = 0;
var charts = $H(this.charts).values().sort( this._alpha_sort_charts );
var options = [];
var has_valid_default = false;
var selectedIndex = 0;
for ( var i = 0 ; i < charts.length ; i ++ ) {
var chart = charts[i];
options.push( new Option( chart.description, chart.id ) );
if ( this.default_id == chart.id ) {
selectedIndex = options.length - 1;
has_valid_default = true;
if( charts.length == 1 )
select.style.display = "none";
}
}
if( !has_valid_default ) {
options.unshift( new Option( SeatingChartDisplay.view_a_chart, -1 ) );
this.$('seating_chart_image').style.cursor = "default";
}
for ( var i = 0 ; i < options.length ; i ++ )
select.options[select.options.length] = options[i];
select.selectedIndex = selectedIndex;
if ( has_valid_default ) {
this.setup_magnification();
this.update_chart();
}
}
} );
SeatingChartDisplay.zoom_popup = new Popup( 'zoomTip', {
autohide_timeout: 1,
link_event: 'mouseover'
} );
SeatingChartDisplay._img_check = new Element( 'img' );
SeatingChartDisplay._img_check.style.position = 'absolute';
SeatingChartDisplay._img_check.style.top = "0px";
SeatingChartDisplay._img_check.style.left = "-2000px";
new OnWindowLoad( function() {
document.body.appendChild( SeatingChartDisplay._img_check );
} );
