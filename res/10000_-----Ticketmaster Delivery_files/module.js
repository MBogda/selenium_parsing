
var Module = Class.create( {
tlog: TMDebug.gen_tlog( 'module' ),
initialize: function( source, options ) {
false;
this.is_attached = false;
if ( !arguments.length ){
false;
}
this.options = Object.extend( {
sub_modules: []
}, options || {} );
if ( typeof(source) == 'object' && !source.nodeType ) {
this.source_name = source.dom || source.parent;
false;
this.doms = Module.get_doms( source, this.options );
this.unique_index = Module.get_index( source );
}
else {
false;
var element = $(source);
this.doms = [ $(element) ];
var source_id = element.id || "";
var id_index = source_id.match( Module.indexed_id_regexp );
if ( id_index ) {
this.unique_index = id_index[0].substr( 1 );
element.id = source_id.substr ( 0, source_id.length - id_index[0].length );
}
else {
if ( typeof(options) != 'undefined' ) {
if ( typeof(options) == 'object' )
this.unique_index = options.index;
else
this.unique_index = options;
}
}
this.source_name = element.id;
}
this.sub_modules = this.options.sub_modules;
if ( this.unique_index ) {
for ( var i = 0 ; i < this.doms.length; i ++ )
Module.make_unique_ids( this.doms[i], this.id.bind( this ) );
}
this.tlog ( 'created', this.id( '' ) );
},
visible: function() {
return this.doms[0].visible();
},
show: function() {
false;
this.doms.each( function ( dom ) {
dom.show();
} );
this.sub_modules.each( function ( m ) {
m.show();
} );
return this;
},
hide: function() {
false;
this.doms.each( function ( dom ) {
dom.hide();
} );
this.sub_modules.each( function ( m ) {
m.hide();
} );
return this;
},
attach: function( id ) {
false;
this.doms.each( function ( dom ) {
dom.parentNode.removeChild( dom );
$(id).appendChild( dom );
} );
this.is_attached = true;
return this;
},
insert: function( element, position ) {
var doms = this.doms;
if ( position == "top" || position == "before" )
doms = this.doms.reverse();
var content = {};
doms.each( function ( dom ) {
dom.parentNode.removeChild( dom );
content[position] = dom;
Element.insert( $(element), content );
} );
this.is_attached = true;
return this;
},
detach: function() {
this.doms.each( function ( dom ) {
dom.parentNode.removeChild( dom );
Module.workarea.appendChild( dom );
} );
this.is_attached = false;
return this;
},
$: function( id ) {
return $( this.id( id ) );
},
id_base: function( id ) {
return this.source_name + "_" + id;
},
id: function( id ) {
return this.id_base( id ) + "_" + this.unique_index;
},
make_unique: function( id ) {
var element;
for ( var i = 0 ; i < this.doms.length ; i ++ )
element = Module.find_element_with_id( this.doms[i], id );
element.id = this.id( id );
}
} );
Module.indexed_id_regexp = /_[0-9]+$/;
Module.get_index = function( source ) {
var module_source = source.dom || source.parent;
Module.sources[module_source].index ++;
return Module.sources[module_source].index;
};
Module.get_doms = function( source, options ) {
if ( !Module.sources ) {
Module.sources = {};
Module.workarea = new Element( 'div', { 'style': 'display:none', id: 'workarea' } );
document.body.appendChild( Module.workarea );
}
var module_source = source.dom || source.parent;
var doms;
if ( Module.sources[module_source] )
doms = Module.sources[module_source].doms;
else {
Module.sources[module_source] = { index: 0 };
if ( source.dom ) {
var dom = $(source.dom);
if ( source.removeParent )
Element.remove( dom.parentNode );
doms = [ Element.remove( dom ) ];
}
else if ( source.parent ) {
doms = Module.sources[source.parent];
var parent = $(source.parent);
if ( source.removeParent )
Element.remove( parent );
doms = [];
while( parent.childNodes.length )
doms.push( Element.remove( parent.firstChild ) );
}
Module.sources[module_source].doms = doms;
}
var new_doms = [];
for ( var i = 0 ; i < doms.length ; i ++ ) {
var dom = doms[i].cloneNode( true );
new_doms.push( dom );
Module.workarea.appendChild( dom );
}
return new_doms;
};
Module.make_unique_ids = function( element, gen_id ) {
if ( element.id && !Element.hasClassName( element, "module-js-ignore" ) )
element.id = gen_id( element.id );
if ( element.hasChildNodes() )
for ( var i = 0 ; i < element.childNodes.length ; i ++ )
Module.make_unique_ids( element.childNodes[i], gen_id );
};
Module.find_element_with_id = function( root, id ) {
if ( root.id == id )
return root;
else {
if ( root.hasChildNodes() ) {
for ( var i = 0 ; i < root.childNodes.length ; i ++ ) {
var element = Module.find_element_with_id( root.childNodes[i], id );
if ( element )
return element;
}
}
}
return false;
};
