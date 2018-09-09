
function getOffset( node ) {
if( node.offsetParent )
var offset = getOffset( node.offsetParent );
else
{
var offset = new Object();
offset.x = 0;
offset.y = 0;
}
offset.x += node.offsetLeft;
offset.y += node.offsetTop;
return offset;
};
var dom = (document.getElementById) ? true : false;
var ns5 = ((navigator.userAgent.indexOf("Gecko")>-1) && dom) ? true: false;
var ie5 = ((navigator.userAgent.indexOf("MSIE")>-1) && dom) ? true : false;
var ns4 = (document.layers && !dom) ? true : false;
var ie4 = (document.all && !dom) ? true : false;
function getMouse( evt ) {
var mouse = new Object();
mouse.X = (ns4||ns5)? evt.pageX: window.event.clientX + document.body.scrollLeft;
mouse.Y = (ns4||ns5)? evt.pageY: window.event.clientY + document.body.scrollTop;
return mouse;
};
function TMPopupLayerManager() {
this.layers = new Array();
this.drag = new Object();
this.drag.active_popup = null;
this.hide_others_on_show = true;
this.activate_drag = function( evt, layer_index ) {
this.drag.active_popup = this.layers[layer_index];
var mouse = getMouse( evt );
this.drag.last_x = mouse.X;
this.drag.last_y = mouse.Y;
return false;
};
this.add_layer = function( tm_popup_layer ) {
this.layers.push( tm_popup_layer );
return this.layers.length - 1;
};
this.hide_layer = function( layer_index ) {
this.layers[layer_index].popup_hide();
};
this.show_layer = function( event, layer_index, actuator_id ) {
if( this.hide_others_on_show ) {
this.hide_all_layers();
};
if( this.layers[layer_index].actuator_onclick ) {
this.layers[layer_index].actuator_onclick( event );
}
this.layers[layer_index].popup_show( actuator_id );
return false;
};
this.hide_all_layers = function() {
for( var i = 0 ; i < this.layers.length ; i ++ ) {
this.hide_layer( i );
}
};
};
window.popup_manager = new TMPopupLayerManager();
function TMPopupLayer( layer_id, drag_id, close_id ) {
this.layer = document.getElementById( layer_id );
this.popup_drag_el = document.getElementById( drag_id );
this.popup_close_el = document.getElementById( close_id );
this.layer.style.zIndex = "100";
this.layer.style.display = "none";
this.popup_index = window.popup_manager.add_layer( this );
eval( "var close_function = function( event ) {\n" +
"window.popup_manager.hide_layer( " + this.popup_index + " );\n" +
"var tigger_id = this.getAttribute('original_tigger_id');\n" +
"if( tigger_id && $( tigger_id ) ){ $( tigger_id ).focus(); }\n" +
"return false;\n" +
"};\n" );
this.popup_close_el.onclick = close_function;
eval( "var drag_function = function( event ) {\n" +
"window.popup_manager.activate_drag( event, " + this.popup_index + " );\n" +
"return false;\n" +
"};\n" );
this.popup_drag_el.onmousedown = drag_function;
document.body.onmouseup = function( evt ) {
window.popup_manager.drag.active_popup = null;
};
document.body.onmousemove = function( evt ) {
if( window.popup_manager ) {
if( window.popup_manager.drag.active_popup ) {
var mouse = getMouse( evt );
var dx = mouse.X - window.popup_manager.drag.last_x;
var dy = mouse.Y - window.popup_manager.drag.last_y;
window.popup_manager.drag.active_popup.popup_move( dx, dy );
window.popup_manager.drag.last_x = mouse.X;
window.popup_manager.drag.last_y = mouse.Y;
return false;
}
}
};
if( ie4 || ie5 ) {
var iframe = document.createElement( "iframe" );
iframe.style.zIndex = this.layer.style.zIndex-1;
iframe.style.display = "none";
iframe.style.position = "absolute";
iframe.frameborder = "0";
iframe.style.backgroundColor = "#FFFFFF";
iframe.src="javascript: ''";
var parent = this.layer.parentNode;
parent.insertBefore( iframe, this.layer );
parent.removeChild( this.layer );
parent.insertBefore( this.layer, iframe );
this.popup_blocking_iframe = iframe;
}
this.set_blocking_iframe = function() {
if( ie4 || ie5 ) {
with( this.popup_blocking_iframe ) {
style.left = this.layer.style.left;
style.top = this.layer.style.top;
style.width = this.layer.offsetWidth + "px";
style.height = this.layer.offsetHeight + "px";
style.display = this.layer.style.display;
}
}
};
this.popup_hide = function() {
this.layer.style.display = "none";
this.set_blocking_iframe();
};
this.popup_show = function( actuator_id, newpos) {
var anchor = document.getElementById( actuator_id );
var anchorsInLayer = $(this.layer).select('a');
var offset = getOffset( anchor );
this.layer.style.display = "block";
switch(newpos){
case "pos_topR":
x = offset.x + anchor.offsetWidth;
y = offset.y + anchor.offsetHeight - Element.getHeight(this.layer.id);
break;
default:
x = offset.x;
y = offset.y + anchor.offsetHeight;
}
this.popup_moveTo( x, y);
this.set_blocking_iframe();
if( anchorsInLayer[0] ){
anchorsInLayer[0].focus();
}
this.popup_close_el.setAttribute( 'original_tigger_id', actuator_id );
};
this.popup_move = function( dx, dy ) {
this.popup_moveTo( this.popup_X + dx, this.popup_Y + dy );
};
this.popup_moveTo = function( x, y ) {
this.popup_X = x;
this.popup_Y = y;
this.layer.style.left = x + "px";
this.layer.style.top = y + "px";
this.set_blocking_iframe();
};
this.popup_install_actuator = function( actuator_id, alternate_anchor_id ) {
var actuator = document.getElementById( actuator_id );
this.actuator_onclick = actuator.onclick;
if( !alternate_anchor_id )
alternate_anchor_id = actuator_id;
eval( "var popup_function = function( event ) {\n" +
"return window.popup_manager.show_layer( event, " + this.popup_index + ", '" + alternate_anchor_id + "' );\n" +
"};\n" );
actuator.onclick = popup_function;
};
this.layer.tm_popup_layer = this;
};
