var CheckDeliveryMethod = (function() {
var upsell_list = new Hash();
var delivery_methods = {};
var delivery_method_description = {};
var setDeliveryMethods = function(dm) {
delivery_methods = dm;
};
var setDeliveryMethodDescription = function(dmd) {
delivery_method_description = dmd;
};
var hasSelectedUpsells = function() {
return upsell_list.keys().length > 0 ? true : false;
};
var addUpsellItem = function(upsell_id) {
if (upsell_id) {
var tmp = upsell_list.get(upsell_id);
if ( tmp > 0) {
upsell_list.set(upsell_id, tmp+1);
} else {
upsell_list.set(upsell_id, 1);
}
}
};
var removeUpsellItem = function(upsell_id) {
if (upsell_id) {
var tmp = upsell_list.get(upsell_id);
if (tmp > 1) {
upsell_list.set(upsell_id, tmp-1);
} else {
upsell_list.unset(upsell_id);
}
}
};
var getUpsellList = function() {
return upsell_list.toObject();
};
var selected_delivery_method = null;
var cdmna = new Popup('delivery_method_na', {
close_id: $('delivery_method_na').select('.close_box'),
zIndex: 110,
lightbox: {opacity:0.6}
});
var show_error = function(dm, errors) {
$('udmvtxt1').innerHTML = dm;
$('udmvtxt2').innerHTML = errors.join(', ');
cdmna.show({
anchor_id: document.body,
popup_align: {x:'center',y:'center'}
});
};
var checkSelectedDeliveryMethod = function( checked_dm ) {
var upsell_ids = upsell_list.keys();
var ulen=upsell_ids.length;
var errors = [];
for(var j=0; j<ulen; j++) {
var id=upsell_ids[j];
if( !delivery_methods[id][checked_dm.getAttribute('data-ms')] ) {
errors.push( delivery_method_description[id] );
}
if (checked_dm.getAttribute('data-smi')) {
var submethods = checked_dm.getAttribute('data-smi').split("|");
for (var i = 0; i < submethods.length; i++) {
if ( errors.length ) {
if ( !delivery_methods[id][submethods[i]] && ( errors[(errors.length - 1)] != delivery_method_description[id] ) ) {
errors.push( delivery_method_description[id] );
}
}
else if ( !delivery_methods[id][submethods[i]] ) {
errors.push( delivery_method_description[id] );
}
}
}
}
if( errors.length ) {
show_error( checked_dm.getAttribute('data-md'), errors );
return false;
}
return true;
};
var checkSelectedUpsell = function( upsell_id ) {
var checked_dm = selected_delivery_method;
if (checked_dm) {
if (!delivery_methods[upsell_id][checked_dm.getAttribute('data-ms')]) {
show_error( checked_dm.getAttribute('data-md'), [delivery_method_description[upsell_id]] );
}
}
return true;
};
var setSelectedDeliveryMethod = function(select_el) {
if (select_el) {
selected_delivery_method = select_el;
return select_el;
} else {
var theform = document.forms.form1;
if (theform) {
var dc = theform.vv_delivery_choice;
dc = dc.length ? dc : [dc];
var len = dc.length;
for( var i=0; i<len; i++ ) {
if (dc[i].checked) {
selected_delivery_method = dc[i];
return selected_delivery_method;
}
}
}
return false;
}
};
var getSelectedDeliveryMethod = function() {
return setSelectedDeliveryMethod();
};
return {
setDeliveryMethods: setDeliveryMethods,
setDeliveryMethodDescription: setDeliveryMethodDescription,
addUpsellItem : addUpsellItem,
removeUpsellItem: removeUpsellItem,
getUpsellList: getUpsellList,
checkSelectedDeliveryMethod: checkSelectedDeliveryMethod,
checkSelectedUpsell: checkSelectedUpsell,
selected_delivery_method: selected_delivery_method,
getSelectedDeliveryMethod: getSelectedDeliveryMethod,
setSelectedDeliveryMethod: setSelectedDeliveryMethod,
hasSelectedUpsells: hasSelectedUpsells
};
})();
