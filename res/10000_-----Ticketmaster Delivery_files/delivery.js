var CheckoutDeliveryTab = function($) {
var main = $('.delivery-options').first(),
selected = main.data('dm-selected');
if (main.length) {
var inpts = main.find('input'),
togs = main.find('a.toggler');
main.tabs({
selected: selected,
select: function(){
inpts.filter(':checked').prop('checked',false);
}
});
main.find("li").bind("keydown", function(event) {
var $ul = main.find(".do-regions li"), $selected;
switch(event.which) {
case 37:
case 38:
if($(this).prev().length) {
$selected = $(this).prev();
}
else {
$selected = $ul.last();
}
$ul.attr({
"tabindex":-1,
"aria-selected":false,
"aria-hidden":true
});
$selected.attr({
"tabindex":0,
"aria-selected":true,
"aria-hidden":false
}).focus().find("a").trigger("click");
return false;
break;
case 39:
case 40:
if($(this).next().length) {
$selected = $(this).next();
}
else {
$selected = $ul.first();
}
$ul.attr({
"tabindex":-1,
"aria-selected":false,
"aria-hidden":true
});
$selected.attr({
"tabindex":0,
"aria-selected":true,
"aria-hidden":false
}).focus().find("a").trigger("click");
return false;
break;
}
});
var tog_handler = function(e) {
e.preventDefault();
var $tog = $(this),
$trg = $tog.data('target_el');
if ( $trg.data( 'animated' ) ) {
return;
}
$trg.data( 'animated', true ).toggle( 'blind', function() {
var checked;
if (!$tog.hasClass('down')) {
checked = inpts.filter(':checked');
if (checked.length) {
checked.focus();
} else {
inpts.first().focus();
}
}
$trg.data('animated', false)
.find('input:checked')
.prop('checked', false);
$tog.toggleClass('down');
});
};
var len = togs.length;
for( var i = 0; i < len; i++ ) {
var $t = $(togs[i]);
var $trg = $( $t.attr( 'href' ) );
if ( $trg.length ) {
$t.data( 'target_el', $trg );
$t.click( tog_handler );
}
}
}
CheckoutDeliveryTab = {
getTab: function(){return main}
};
};
CheckoutCCEChoice = function($) {
var $ccentry = $('#ccentry');
if(CheckoutCCEChoice.initiated || !$ccentry.length) return;
var $ccpayment = $('#cc_payment')
, choices = $ccentry.find('input[name=cce]')
, $newcc = $('#newcc')
, $storedcc = $('#storedcc')
, $addressform = $('#address-form-container')
, $storeaddress = $('#store_address')
, $adderrmsg = $('#errorMessageStyles')
;
if($addressform.length) {
$addressform.detach().show();
}
var choice_map = {
"0" : function() {
$addressform.insertAfter($ccpayment);
$storedcc.detach();
$newcc.detach();
$storeaddress.detach();
$('<input type="hidden" name="new_payment_type" value="GC"><input type="hidden" name="new_payment" value="1">').insertAfter($addressform);
},
"1" : function() {
if($newcc.length) {
$newcc.insertAfter($ccentry);
$addressform.insertAfter($ccpayment);
$storeaddress.insertAfter($adderrmsg);
} else {
$storedcc.insertAfter($ccentry);
$addressform.detach();
}
}
};
var handler = function() {
var v = this.value;
var h = choice_map[v];
$.isFunction(h) && h.call();
};
var chkd = choices.filter(':checked');
if(chkd.length) {
handler.call(chkd[0]);
}
choices.bind('change',handler);
CheckoutCCEChoice.initiated = true;
};
