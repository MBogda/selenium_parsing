PopupLightboxDialog = Class.create( Popup, {
initialize: function( $super, id, options ) {
this.id = id;
this.el = $(id);
options = Object.extend( {
zIndex: 110,
lightbox: { opacity: 0.6 }
}, options || {} );
var close_box = this.get_element(".close_box");
if( close_box != null ) {
Event.observe( close_box, 'click', this.close.bind( this ) );
}
$super( id, options );
},
close: function() {
if ( this.dialog_chain ) {
this.dialog_chain.cancel();
}
else {
this.hide();
}
},
get_element: function( selectors ) {
return this.get_elements( selectors )[0];
},
get_elements: function( selectors ) {
return $$( "#" + this.id + " " + selectors );
},
build_omnidata: function( tag ) {
var te = this.context.is_exchange ? " TE: " : " ";
var omnidata = {
channel: omn_domain_owner + te + 'Checkout',
prop1: omn_domain_owner + te + 'Checkout',
pageName: omn_domain_owner + te + 'Checkout: ' + tag,
prop16: omn_domain_owner + te + 'Checkout: ' + tag,
prop2: omn_domain_owner + ' Checkout',
prop3: omn_domain_owner + ' Checkout'
};
if ( !this.context.is_exchange ) {
omnidata.prop1 = omnidata.prop16;
}
return omnidata;
},
omnitrack_page: function( omnidata ) {
var omnitrackpage = new omniCustomClick( omnidata,
clickLink = '',
newPage = true
);
omnitrackpage.handleClick();
},
omniview: function( tag ) {
this.omnitrack_page( this.build_omnidata( tag ) );
},
show: function( $super, event ) {
if ( event ) {
Event.stop( event );
}
$super( {
anchor_id: document.body,
popup_align: { x: 'center', y: 'center' }
} );
if( this.get_element(".right") != null ) {
this.get_element(".left").style.width =
this.get_element(".lightbox-lid").getWidth() -
this.get_element(".right").getWidth() - 10 + "px";
}
}
} );
function add_delivery_and_upsell_choices ( data ) {
if ( document.forms.DeliveryOpts ) {
var options = document.forms.DeliveryOpts.vv_delivery_choice;
if ( typeof( options ) != 'undefined' ) {
if ( Object.isElement( options ) ) {
options = [ options ];
}
for ( var i = 0 ; i < options.length ; i ++ ) {
var option = options[i];
if ( option.checked ) {
data.vv_delivery_choice = option.value;
break;
}
}
}
}
jQuery.find("span.upsell_quantity").each( function( dropdown ) {
var $dropdown = jQuery( dropdown );
var value = $dropdown.tmDropdown( 'get_value' );
if ( value > 0 ) {
data[$dropdown.tmDropdown( 'get_input_name' )] = value;
}
} );
}
SaveToCart = Class.create( {
initialize: function( options ) {
this.cs_item_id = options.cs_item_id;
},
check: function( context ) {
if ( context.save_to_cart ) {
this.context = context;
this.save();
return true;
}
return false;
},
save: function() {
var data = {
command: "save_my_cart",
type: this.context.save_type
};
add_delivery_and_upsell_choices( data );
new Ajax.Request( this.context.reserve_uri, {
method: 'post',
evalJS: false,
evalJSON: false,
postBody: MooHash.toQueryString( data ),
onSuccess: this.on_save_success.bind( this ),
onFailure: this.on_save_failure.bind( this ),
onException: this.on_save_exception.bind( this )
} );
},
on_save_success: function( transport ) {
if ( !transport.responseText ) {
this.go_to_edp();
}
else {
var data = transport.responseText.evalJSON();
if ( data.error ) {
if ( data.error.timeout ) {
this.context.error = data.error;
this.dialog_chain.next();
}
else {
this.go_to_edp();
}
}
else {
var tm_omn=window.tm_omn;
tm_omn.linkTrackVars='events';
tm_omn.linkTrackEvents='event42,event43';
tm_omn.events='event42,event43';
tm_omn.tl(true,'o','Save to Cart');
this.go_to_cart( data );
}
}
},
go_to_edp: function() {
TMCookie.set( 'CART_SAVE_FAIL', this.context.event_id );
window.location = this.context.edp_url;
},
on_save_failure: function( transport ) {
var data = transport.responseText.evalJSON();
this.dialog_chain.next();
},
on_save_exception: function( transport ) {
var data = transport.responseText.evalJSON();
this.go_to_cart();
},
go_to_cart: function( data ) {
var form = new Element( 'form', { method: "POST", action: this.context.cart_url } );
if ( data.carrot ) {
var carrot = new Element( 'input', { input: "hidden", name: "carrot", value: data.carrot } );
form.appendChild( carrot );
}
var div = new Element( 'div', { style:"position:absolute;left:-10000px" } );
div.appendChild( form );
document.body.appendChild( div );
form.submit();
}
} );
SaveToCartDialog = Class.create( PopupLightboxDialog, {
initialize: function( $super, options ) {
$super( 'save_to_cart_dialog' );
this._showCallBack = options ? options.showCallBack : null;
Event.observe( this.get_element('.save'), 'click', this.save.bind( this ) );
Event.observe( this.get_element('.complete_order'), 'click', this.complete_order.bind( this ) );
},
showCallBack: function( instance ){
if( this._showCallBack && typeof this._showCallBack == 'function' ){
this._showCallBack( instance, this );
}
},
check: function( context ) { this.context = context; return true; },
close: function( $super ) {
omniTracking.navigation_link( this.context.omnitrack_prefix + "SavetocartClose" );
$super();
},
save: function() {
omniTracking.module_link( this.context.omnitrack_prefix + "SavetocartConf", false, {
prop19: this.context.event_id
} );
this.context.save_to_cart = true;
this.dialog_chain.next();
},
disable_buttons: function() {
this.get_element('.save').disabled = 'disabled';
this.get_element('.complete_order').disabled = 'disabled';
},
enable_buttons: function() {
this.get_element('.save').disabled = '';
this.get_element('.complete_order').disabled = '';
},
complete_order: function() {
omniTracking.navigation_link( this.context.omnitrack_prefix + "SavetocartComplete" );
this.disable_buttons();
var form = $$('.complete-order-form')[0];
if ( !Object.isUndefined(window.validate_delivery_form) ) {
if ( !validate_delivery_form.bind( form )() ) {
this.enable_buttons();
this.dialog_chain.cancel();
return;
}
}
form.submit();
}
} );
CheckoutTimeoutDialog = Class.create( PopupLightboxDialog, {
initialize: function( $super, options ) {
$super( 'checkout_timeout_dialog' );
this.solveOptions = options;
this.save_element = this.get_element('.save');
if ( this.save_element ) {
Event.observe( this.save_element, 'click', this.save.bind( this ) );
}
this._showCallBack = options ? options.showCallBack : null;
this.repeat_search_element = this.get_element('.repeat_search');
if ( this.repeat_search_element ) {
Event.observe( this.repeat_search_element, 'click', this.repeat_search.bind( this ) );
}
},
check: function( context ) {
this.context = context;
return true;
},
show: function( $super ) {
$super();
var omnidata = this.build_omnidata( this.solveOptions.active ? 'Solve Recaptcha: Time Limit Exceeded' : 'Time Limit Exceeded' );
if ( this.save_element ) {
omnidata.prop16 = omnidata.prop16 + ' with Save to Cart';
}
else {
omnidata.prop16 = omnidata.prop16 + ' without Save to Cart';
}
this.omnitrack_page( omnidata );
},
showCallBack: function( instance ){
if( this._showCallBack && typeof this._showCallBack == 'function' ){
this._showCallBack( instance, this );
}
},
save: function() {
omniTracking.navigation_link2( "carttimeout_click_Savetocart", {
tracking_vars: {
prop19: this.context.event_id
}
} );
this.context.save_to_cart = true;
this.dialog_chain.next();
},
repeat_search: function() {
var self = this;
omniTracking.navigation_link( "carttimeout_click_CartTryAgain" );
jQuery("#solve_captcha, #google_recaptcha2").hide();
if (is_optical_test_preferences_active && typeof captchaDialog.repeatSearchPollingDialogInstance.recaptcha !== 'undefined' ) {
captchaDialog.repeatSearchPollingDialogInstance.recaptcha.optical_test_preference_selector(undefined,'checkout');
}
else
{
if(self.solveOptions.active) {
captchaDialog.repeatSearchPollingDialogInstance.recaptcha.solve_ready("load");
}
else {
captchaDialog.repeatSearchPollingDialogInstance.recaptcha.show_google2();
self.dialog_chain.next();
}
}
}
} );
AbandonCheckoutDialog = Class.create( PopupLightboxDialog, {
initialize: function( $super ) {
$super( 'abandon_checkout_dialog' );
var save = this.get_element('.save');
if ( save ) {
Event.observe( save, 'click', this.save.bind( this ) );
}
Event.observe( this.get_element('.decline'), 'click', this.decline.bind( this ) );
},
check: function( context ) { this.context = context; return true; },
save: function() {
omniTracking.navigation_link2( "cartabandon_click_Savetocart", {
tracking_vars: {
prop19: this.context.event_id
}
} );
this.context.save_to_cart = true;
this.dialog_chain.next();
},
decline: function() {
omniTracking.navigation_link( "cartabandon_click_SaveNothanks" );
jQuery(document.body).trigger( "cartabandon_click_SaveNothanks" );
if ( this.on_back_button ) {
window.history.go(-1);
}
else {
window.location = this.return_uri;
}
},
show: function( $super, event ) {
if ( this.context.event.eventName == DetectBackButton.EVENT_NAME ) {
this.on_back_button = true;
}
else {
this.on_back_button = false;
this.return_uri = this.context.event.target.href;
}
$super( event );
this.omniview( 'Save to Cart Abandon' );
return false;
}
} );
SessionExpiredDialog = Class.create( PopupLightboxDialog, {
initialize: function( $super ) {
$super( 'session_expired_dialog' );
Event.observe( this.get_element('.start-again'), 'click', this.start_again.bind( this ) );
},
check: function( context ) {
if ( context.error ) {
this.context = context;
return true;
}
else {
return false;
}
},
start_again: function() {
omniTracking.navigation_link( "sessiontimeout_click_StartAgain" );
window.location = this.context.edp_url;
},
show: function( $super, event ) {
$super( event );
this.omniview( 'Session Timeout' );
return false;
}
} );
RecaptchaDialog = Class.create( Popup, {
tlog: TMDebug.gen_tlog( 'isc-recaptcha' ),
new_context: null,
initialize: function( $super, solveOptions ) {
var self = this;
self.solveOptions = solveOptions;
$super( 'cart_recaptcha_dialog', {
zIndex: 110,
lightbox: { opacity: 0.6 }
} );
jQuery(document).find('#recaptcha2_continue').bind('click', function (e) {
this.verify_recaptchav2_input(e);
}.bind(self));
jQuery(document).find('#recaptcha2_form').bind('submit', function (e) {
this.verify_recaptchav2_input(e);
}.bind(self));
Event.observe( $('recaptchav2_cancel'), 'click', this.cancel.bind( this ) );
self.$solve_first_element = jQuery('#cart_recaptcha_dialog').find('#close_lightbox');
self.$solve_last_element = jQuery('#cart_recaptcha_dialog').find('#adcopy-link-info');
self.$google2_first_element = jQuery('#cart_recaptcha_dialog').find('#cart_recaptcha2_dialog_heading');
self.$google2_last_element = jQuery('#cart_recaptcha_dialog').find('#cart_recaptcha2_help_link');
jQuery("#solve_form").submit(function() {
self.verify_solve_input();
return false;
});
jQuery("#close_lightbox").click(function() {
if(typeof captchaDialog !== "undefined") {
captchaDialog.repeatSearchPollingDialogInstance.cancel();
}
else {
if(typeof cart.recaptcha_dialog === "undefined") {
cart.cartReserveDialog.cancel();
}
else {
cart.recaptcha_dialog.cancel();
}
}
jQuery("#error").hide();
jQuery("#cart_checkout_button").focus();
return false;
});
jQuery("#adcopy-link-refresh").click(function() {
self.solve_reload();
self.hideError();
omniTracking.navigation_link('SOLVE Recaptcha - New Words',false);
return false;
});
jQuery("#adcopy-link-audio").click(function() {
self.audio();
omniTracking.navigation_link('SOLVE Recaptcha - ADA',false);
return false;
});
jQuery("#adcopy-link-image").click(function() {
self.visual();
self.focusSolveInput(100);
return false;
});
jQuery("#adcopy-link-info").click(function() {
self.info();
omniTracking.navigation_link('SOLVE Recaptcha - Help',false);
return false;
});
jQuery("#captcha-help-close").click(function() {
self.hideInfo();
return false;
});
jQuery(window).keydown(function(e) {
if(e.which === 27) {
self.hideInfo();
return false;
}
});
jQuery('#cart_recaptcha_dialog').keydown(function(e){
if(e.keyCode == 9){
if( e.shiftKey ){
if( e.target == self.$solve_first_element[0] ){
jQuery( self.$solve_last_element[0] ).focus();
}else if( e.target == self.$google2_first_element[0] ){
jQuery( self.$google2_last_element[0] ).focus();
}else{
return true;
}
}else{
if( e.target == self.$solve_last_element[0] ){
jQuery( self.$solve_first_element[0] ).focus();
}else if( e.target == self.$google2_last_element[0] ){
jQuery( self.$google2_first_element[0] ).focus();
}else{
return true;
}
}
return false;
}
return true;
});
},
show : function($super, event){
$super(event);
if(jQuery("#google_recaptcha2").is(":visible")){
obj_recaptcha_V2.reset();
jQuery('#google_recaptcha2').find('h2').focus();
}
},
cancel: function() {
this.dialog_chain.cancel();
if ( recaptcha_choice == 'recaptchav2' ) {
obj_recaptcha_V2.reset();
}
},
check: function( context ) {
false;
this.context = context;
this.cart = context.cart;
this.prepare_recaptcha();
return true;
},
prepare_recaptcha: function() {
var event_id = this.solveOptions.event_id;
var data = {
command: 'create_captcha',
domain: this.context.recaptcha_domain,
event_id: event_id
};
new SJAX( this.context.reserve_uri, {
on_success: this.on_prepare_recaptcha_success.bind( this ),
on_failure: this.on_prepare_recaptcha_failure.bind( this ),
data: data,
timeout: 30 * 1000
} );
},
on_prepare_recaptcha_success: function( data ) {
if (data.type == "reCAPTCHA") {
this.show_recaptcha();
}
else {
this.dialog_chain.next();
}
},
on_prepare_recaptcha_failure: function() {
this.context.errors = {
failure: { recaptcha: 1 }
};
this.dialog_chain.next();
},
show_recaptcha: function() {
this.show( {
anchor_id: document.body,
popup_align: { x: 'center', y: 'center' }
} );
},
set_pagehints:function(id) {
var self = this;
jQuery.each(self.solveOptions.pagehints, function(key, value) {
if(key === id) {
self.solveOptions.ACPuzzleOptions.pagehints = value;
return false;
}
});
},
get_pagehints:function(id) {
var self = this, pagehints = null;
jQuery.each(self.solveOptions.pagehints, function(key, value) {
if(key === id) {
pagehints = value;
return false;
}
});
return pagehints;
},
focusSolveInput:function(timeout) {
setTimeout(function() {
var interval = setInterval(function() {
if(jQuery("#adcopy_response").length) {
if(jQuery("#adcopy_response").is(":focus")) {
clearInterval(interval);
}
else {
jQuery("#adcopy_response").focus();
}
}
},100);
},timeout);
},
show_solve:function(location) {
jQuery("#google_recaptcha2").hide();
jQuery("#solve_captcha").show();
jQuery(document.body).trigger('solverecaptchacomplete');
if(location === "checkout") {
}
else {
if(location === 'event') {
var custLinkrecapISM = new omniCustomClick({
events: 'event8,event15',
products: ';' + tm_omni_temp.get('omnEID') + ';;;event8=' + cart.items.length ,
channel: omn_domain_owner + ' Checkout: Solve Recaptcha',
prop1: omn_domain_owner + ' Checkout: Solve Recaptcha: ISM EDP',
prop4: tm_omn.pageName,
pageName: omn_domain_owner + ' Checkout: Solve Recaptcha: ISM EDP',
prop16: tm_omn.prop16.gsub(/EDP: ISM:/,'Checkout: Solve Recaptcha: ISM EDP:'),
prop2: omn_domain_owner + ' Checkout',
prop3: omn_domain_owner + ' Checkout',
eVar23: "",
eVar24: "",
eVar29: "",
eVar34: 'Interactive Seat Map'
},
clickLink = '',
newPage = true
);
custLinkrecapISM.handleClick();
}
else {
if(location === 'mycart') {
location = 'My Cart';
}
else {
location = 'Checkout';
}
var te = cart.context.is_exchange ? " TE: " : " ";
var omnidata = {
channel: omn_domain_owner + te + 'Checkout',
prop1: omn_domain_owner + te + 'Checkout',
pageName: omn_domain_owner + te + 'Checkout: Solve Recaptcha: ' + location,
prop16: omn_domain_owner + te + 'Checkout: Solve Recaptcha: ' + location,
prop2: omn_domain_owner + ' Checkout',
prop3: omn_domain_owner + ' Checkout'
};
if ( !cart.context.is_exchange ) {
omnidata.channel = omnidata.channel + ': Solve Recaptcha';
omnidata.prop1 = omnidata.pageName;
omnidata.prop16 = omnidata.prop16 + ': ' +
cart.context.artist_id + ': ' +
cart.context.artist_name;
}
var omnitrackpage = new omniCustomClick( omnidata,
clickLink = '',
newPage = true
);
omnitrackpage.handleClick();
}
}
},
solve_ready: function(type) {
var self = this, time = 0;
self.created = false;
self.solve_click_track = new ClickTrack( window.location.protocol + "//" + window.location.host + '/clicktrack' );
self.solve_click_track.set_required_parameters({ solvemedia:1 });
if(self.get_pagehints(self.solveOptions.event_id) !== null) {
var interval = setInterval(function() {
if(time < self.solveOptions.response) {
if(typeof ACPuzzle !== "undefined") {
if(!self.created && type === "load") {
self.set_pagehints(self.solveOptions.event_id);
ACPuzzle.create(self.solveOptions.key, "adcopy-outer", self.solveOptions.ACPuzzleOptions);
self.created = true;
}
self.challenge = ACPuzzle.get_challenge();
if(jQuery.type(self.challenge) === "string" && self.challenge !== "" && jQuery("#adcopy-puzzle-image").children().length > 0) {
if(type === "load") {
self.show_solve(self.solveOptions.pageType);
if(self.solveOptions.pageType === 'checkout') {
captchaDialog.checkout_timeout_dialog.dialog_chain.next();
}
else {
cart.checkout_dialog_chain.start( cart.context );
}
self.solve_clickTrack(time);
}
self.focusSolveInput(500);
clearInterval(interval);
}
}
}
else {
self.fallback_captcha('solve', 'timeout');
self.solve_clickTrack(time);
clearInterval(interval);
}
time += 100;
}, 100);
}
else {
self.fallback_captcha('solve', 'captcha_error');
}
},
fire_error_metrics: function (captcha_type, fallback_reason, is_primary) {
is_primary = (typeof is_primary !== 'undefined') ? is_primary : true;
TM.MetricsCollection.timings.facade( 'startCounterMetrics', {
'mtype': 'web.captcha.cs_display_error.counter',
'captcha_type': captcha_type,
'fallback_reason': fallback_reason,
'is_primary': is_primary ? '1' : '0',
'force': true
}
);
},
fire_log_metrics: function (captcha_type){
TM.MetricsCollection.timings.facade( 'startCounterMetrics', {
'mtype': 'web.captcha.display.counter',
'captcha_type': captcha_type,
'force': true
}
);
},
use_recaptcha:function(location) {
var self = this;
if(location === 'checkout') {
captchaDialog.repeatSearchPollingDialogInstance.recaptcha.show_google2();
captchaDialog.checkout_timeout_dialog.dialog_chain.next();
}
else {
if(typeof cart.recaptcha_dialog === "undefined") {
if(location === 'mycart') {
location = 'My Cart';
}
else {
location = 'Checkout';
}
cart.cartReserveDialog.recaptcha.show_google2();
}
else {
cart.recaptcha_dialog.show_google2();
}
cart.checkout_dialog_chain.start ( cart.context );
}
},
solve_clickTrack:function(time) {
this.solve_click_track.log_datapoint({
solve_response_time:time
});
},
hideError:function() {
jQuery("#error").hide()
.find("label").prop("for","");
},
showError:function() {
jQuery("#error").show()
.find("label").prop("for","adcopy_response");
},
solve_reload:function(hideError) {
ACPuzzle.reload();
this.solve_ready();
},
audio:function() {
ACPuzzle.change2audio();
var $adcopy_link_audio = jQuery("#adcopy-link-audio");
var $adcopy_link_image = jQuery("#adcopy-link-image");
$adcopy_link_audio.add($adcopy_link_audio.parent()).hide();
$adcopy_link_image.add($adcopy_link_image.parent()).show();
this.hideError();
},
visual:function() {
ACPuzzle.change2image();
var $adcopy_link_audio = jQuery("#adcopy-link-audio");
var $adcopy_link_image = jQuery("#adcopy-link-image");
$adcopy_link_image.add($adcopy_link_image.parent()).hide();
$adcopy_link_audio.add($adcopy_link_audio.parent()).show();
this.hideError();
},
info:function() {
if(jQuery("#captcha-help-onclick").is(":visible")) {
this.hideInfo();
}
else {
this.showInfo();
}
},
showInfo:function() {
var $captcha_info = jQuery("#adcopy-link-info");
var position = $captcha_info.position();
jQuery("#captcha-help-onclick").css({
display:"block",
top: position.top + $captcha_info.height() + 10 + "px",
left: position.left - 5 + "px"
});
jQuery("#captcha-help-close").focus();
},
hideInfo:function() {
$("captcha-help-onclick").hide();
$("adcopy-link-info").focus();
},
verify_solve_input:function() {
var self = this;
jQuery.ajax({
url: window.location.protocol + "//" + window.location.host + "/solvemedia/validate",
data: {
adcopy_challenge: jQuery("#adcopy_challenge").val(),
adcopy_response: jQuery("#adcopy_response").val()
},
success: function(data) {
self.on_solve_input_verified(data);
},
error: function() {
cart.recaptcha_dialog.show_google2();
}
});
},
on_solve_input_verified: function( data ) {
if(data.solve_dead) {
if(typeof cart.recaptcha_dialog === "undefined") {
cart.cartReserveDialog.recaptcha.show_google2();
}
else {
cart.recaptcha_dialog.show_google2();
}
}
else {
if ( data.success ) {
if(this.solveOptions.pageType === 'mycart') {
cart.cartReserveDialog.on_solve_input_verified(true);
}
else if(this.solveOptions.pageType === 'checkout') {
captchaDialog.repeatSearchPollingDialogInstance.on_solve_input_verified(true);
}
else {
cart.checkout_dialog_chain.next();
}
}
else {
tm_omn.linkTrackVars = 'prop57';
tm_omn.prop57 = this.solveOptions.errorMessage;
tm_omn.tl(this, 'o', tm_omn.prop57);
this.showError();
this.solve_reload();
}
}
},
show_google2: function() {
var self = this;
var event_id = self.solveOptions.event_id;
var is_recaptchav2_active = obj_recaptcha_V2!=null && obj_recaptcha_V2.settings.enable;
if(is_recaptchav2_active && self.solveOptions.event_id == ''){
event_id = obj_recaptcha_V2.settings.event_id;
}
var by_event = obj_recaptcha_V2!=null && obj_recaptcha_V2.settings.enable_by_event;
var old_mechanism = is_recaptchav2_active && (by_event == null  || (by_event[event_id] != null && by_event[event_id].is_active == 1));
if (old_mechanism || is_optical_test_preferences_active) {
if(obj_recaptcha_V2 == null || typeof grecaptcha == 'undefined' || obj_recaptcha_V2.settings.status == 'dead') {
return this.on_recaptchav2_rollback('captcha error');
}
recaptcha_choice = 'recaptchav2';
jQuery("#solve_captcha").hide();
jQuery("#google_recaptcha2").show();
this.recaptcha_shown = 'googlerecaptchav2complete';
var custLinkrecapISM = new omniCustomClick({
pageName: omn_domain_owner + ' Checkout: Google Recaptcha v2',
events: 'event15',
products: ';' + tm_omni_temp.get('omnEID'),
channel: omn_domain_owner + ' Checkout: Recaptcha',
prop4: tm_omn.pageName,
prop16: omn_domain_owner + 'Checkout: Google Recaptcha v2',
prop2: omn_domain_owner + ' Checkout',
prop3: omn_domain_owner + ' Checkout',
eVar23: "",
eVar24: "",
eVar29: "",
eVar34: 'Interactive Seat Map'
},
clickLink = '',
newPage = true
);
custLinkrecapISM.handleClick();
}
},
verify_recaptchav2_input: function ( data ) {
var self = this;
var google2_response = jQuery("#response").val();
jQuery.ajax({
url: window.location.protocol + "//" + window.location.host + "/recaptchav2" ,
data: {
command: 'verify_recaptcha',
response: google2_response
},
success: function(data) {
self.on_recaptchav2_input_verified(data);
},
error: function() {
self.on_recaptchav2_rollback('captcha error');
}
});
},
optical_test_preference_selector: function (fallback_reason, page_type){
var recaptcha_preference;
var self = this;
var event_id = self.solveOptions.event_id;
if ( optical_test_preferences && optical_test_preferences[event_id] ) {
if (typeof fallback_reason === 'undefined') {
self.optical_preference = optical_test_preferences[event_id][0];
} else {
var old_recaptcha = optical_test_preferences[event_id].shift();
self.fire_error_metrics(
old_recaptcha,
fallback_reason,
old_recaptcha == self.optical_preference
);
}
if ( optical_test_preferences[event_id].length == 0 && self.optical_preference != "" ){
recaptcha_preference = self.optical_preference;
self.optical_preference = "";
} else {
recaptcha_preference = optical_test_preferences[event_id][0];
}
}
recaptcha_choice = recaptcha_preference;
if(recaptcha_preference != "" || recaptcha_preference != 'undefined'){
self.fire_log_metrics(recaptcha_preference);
}
switch ( recaptcha_preference ) {
case 'solve_media':
this.solve_ready('load')
break;
case 'recaptchav2':
if (this.new_context) {
this.new_context.cart.recaptcha_dialog.show_google2();
this.new_context.cart.checkout_dialog_chain.start ( this.new_context );
} else {
this.use_recaptcha(page_type);
}
break;
default:
if( optical_test_preferences && optical_test_preferences[event_id] && optical_test_preferences[event_id].length == 0 ) {
self.fire_error_metrics('all_captcha','services_down');
}
break;
};
},
on_recaptchav2_input_verified: function (data) {
var self = this;
if ( data.success == true ) {
if(this.solveOptions.pageType === 'mycart') {
cart.cartReserveDialog.on_solve_input_verified(true);
}
else if(this.solveOptions.pageType === 'checkout') {
captchaDialog.repeatSearchPollingDialogInstance.on_solve_input_verified(true);
}
else {
cart.checkout_dialog_chain.next();
}
} else if ( data.error == 'recaptchav2_dead' || data.error == 'recaptchav2_server_error' )  {
obj_recaptcha_V2.settings.status = 'dead';
self.on_recaptchav2_rollback('captcha error');
}
},
on_recaptchav2_rollback: function (fallback_reason) {
var self = this;
self.fallback_captcha('recaptchav2', fallback_reason);
},
set_new_context: function(context) {
var self = this;
self.new_context = context;
},
fallback_captcha: function(captcha_type, fallback_reason) {
var self = this;
if (is_optical_test_preferences_active) {
self.optical_test_preference_selector(fallback_reason, self.solveOptions.pageType);
} else {
self.fire_error_metrics(captcha_type, fallback_reason);
self.use_recaptcha(self.solveOptions.pageType);
}
}
} );
ReservePollingDialog = Class.create( Popup, {
tlog: TMDebug.gen_tlog( 'isc-reserve' ),
initialize: function( $super ) {
$super( 'reserve_polling_dialog', {
zIndex: 110,
lightbox: { opacity: 0.6 }
} );
this.init_time_messages = Polling.prototype.init_time_messages;
this.clear_all_time_messages = Polling.prototype.clear_all_time_messages;
this.show_message = Polling.prototype.show_message;
this.update_time_remaining = Polling.prototype.update_time_remaining;
this.init_time_messages();
},
check: function( context, options ) {
false;
options = options || {};
if ( context.errors ) {
return false;
}
else {
this.context = context;
this.seats_reordered = false;
this.reserve_token = false;
if ( !options.do_not_start_polling ) {
this.start_polling();
}
this.prepare_reserve();
return true;
}
},
start_polling: function() {
this.show_polling( {
init: true,
poll: { queue_wait: 0 }
} );
},
start_reserve: function( data ) {
if ( this.context.polling_ad ) {
if ( this.context.suppress_polling_ad ) {
this.context.polling_ad.hide();
}
this.context.trigger_ad = true;
}
else {
$('polling_ad').hide();
}
new SJAX( this.context.reserve_uri, {
on_success: this.on_reserve_polling_response.bind( this ),
on_failure: this.on_reserve_polling_failure.bind( this ),
data: data,
timeout: 30 * 1000
} );
},
stop_polling: function() {
if ( this.poll_timeout ) {
window.clearTimeout( this.poll_timeout );
delete this.poll_timeout;
}
},
on_reserve_polling_failure: function() {
this.stop_polling();
this.context.errors = {
failure: { polling: 1 }
};
this.dialog_chain.next();
},
poll: function( data ) {
false;
this.show_polling( data );
new SJAX( data.uri, {
on_success: this.on_reserve_polling_response.bind( this ),
on_failure: this.on_reserve_polling_failure.bind( this ),
timeout: 30 * 1000
} );
},
show_polling: function( data ) {
false;
this.clear_all_time_messages();
if ( !Object.isUndefined(data.poll.queue_wait) ) {
this.update_time_remaining( data.poll.queue_wait );
}
this.show( {
anchor_id: document.body,
popup_align: { x: 'center', y: 'center' }
} );
if ( !data.init ) {
if ( !this.context.suppress_polling_ad && this.context.trigger_ad && data.poll.ad ) {
delete this.context.trigger_ad;
var masktoken = data.poll.ad.masktoken ? data.poll.ad.masktoken : '';
this.context.polling_ad.load( { masktoken: masktoken } );
}
if (!this.poll_timeout) {
this.poll_timeout = setTimeout( this.poll.bind( this, data ), data.poll.delay * 1000 );
}
}
}
} );
RepeatSearchPollingDialog = Class.create( ReservePollingDialog, {
initialize: function( $super, solveOptions ) {
$super();
this.recaptcha = new RecaptchaDialog(solveOptions);
this.recaptcha.dialog_chain = {
next: this.on_recaptcha_finished.bind( this ),
cancel: this.cancel.bind( this )
};
},
check: function ( $super, context ) {
this.context = context;
this.layer.select(".processing")[0].show();
$('reserve_polling_wait_messages').hide();
$('pollingcontent').addClassName( 'working' );
return $super( context, { do_not_start_polling: true } );
},
cancel: function() {
this.recaptcha.hide();
this.stop_polling();
if ( this.context.checkout_timeout_dialog ) {
this.dialog_chain.go_to( this.context.checkout_timeout_dialog );
}
else {
this.dialog_chain.cancel();
}
},
prepare_reserve: function() {
this.reserve_data = {
command: "start_last_reserve"
};
add_delivery_and_upsell_choices( this.reserve_data );
this.start_reserve();
},
on_recaptcha_finished: function() {
if ( this.context.verify_psig ) {
this.reserve_data.verify_psig = this.context.verify_psig;
this.recaptcha.hide();
this.context.suppress_polling_ad = false;
$("reserve_polling_wait_messages").show();
$('pollingcontent').removeClassName( 'working' );
this.start_reserve();
}
else {
}
},
on_solve_input_verified: function(verified) {
if(verified) {
this.recaptcha.hide();
this.context.suppress_polling_ad = false;
$('reserve_polling_wait_messages').show();
$('pollingcontent').removeClassName( 'working' );
this.start_reserve();
}
},
start_reserve: function( $super ) {
this.start_polling();
$super( this.reserve_data );
},
on_reserve_polling_response: function( data ) {
this.stop_polling();
false;
if ( data.reserve ) {
window.location = data.uri;
return;
}
if ( data.exchange && data.reserve_form_data ) {
var form = new Element( 'form', { method: "POST", action: data.uri } );
var list = data.reserve_form_data;
for ( var i = 0; i < list.length; i++ )
form.appendChild( new Element( 'input', list[i] ) );
document.body.appendChild( form );
form.submit();
return;
}
if ( data.error ) {
if ( data.error.invalid ) {
if ( data.error.invalid.captcha || data.error.invalid.psig ) {
delete this.context.verify_psig;
this.recaptcha.check( this.context );
this.hide();
this.recaptcha.show();
return;
}
}
TMCookie.set( 'NTF', this.context.event_id );
window.location = this.context.edp_url;
return;
}
if ( data.poll ) {
this.show_polling( data );
}
}
} );
DeleteCcDialog = Class.create( PopupLightboxDialog, {
initialize: function( $super ) {
$super( 'checkout_delete_cc_dialog', {
zIndex: 110,
lightbox: { opacity: 0.6 }
});
Event.observe( $('checkout_delete_cc_button'), 'click', this.save.bind( this ));
return false;
},
save: function(){
window.location = '?v=' + this.reflocation + '&vv_mop_id='+ this.mop;
}
});
RepeatSearch = Class.create( ReservePollingDialog, {
initialize: function($super) {
this.context = context;
this.context.event_id = jQuery('.multi_fail_start_over_button').find('a').attr('onclick').match(/[A-Z0-9]{16}/)[0];
this.fire_metrics('web.checkout.re_reserve_error', 'Fail on retry the same reserve', this.context.event_id);
$super();
},
prepare_reserve: function() {
this.reserve_data = {
command: "start_last_reserve",
multi_fail: 1
};
add_delivery_and_upsell_choices( this.reserve_data );
this.start_reserve(this.reserve_data);
},
start_reserve: function( data ) {
this.start_polling();
new SJAX( this.context.secure_reserve_uri, {
on_success: this.on_reserve_polling_response.bind( this ),
on_failure: this.on_reserve_polling_failure.bind( this ),
data: data,
timeout: 30 * 1000
} );
},
on_reserve_polling_response: function( data ) {
this.stop_polling();
false;
if ( data.reserve ) {
this.fire_metrics('web.checkout.re_reserve_success', 'Successfull re-reserve purchase', this.context.event_id);
window.location = data.uri;
return;
}
if ( data.exchange && data.reserve_form_data ) {
this.fire_metrics('web.checkout.re_reserve_success', 'Successfull re-reserve purchase', this.context.event_id);
var form = new Element( 'form', { method: "POST", action: data.uri } );
var list = data.reserve_form_data;
for ( var i = 0; i < list.length; i++ )
form.appendChild( new Element( 'input', list[i] ) );
document.body.appendChild( form );
form.submit();
return;
}
if ( data.error ) {
if ( data.error.invalid ) {
if ( data.error.invalid.captcha || data.error.invalid.psig ) {
this.fire_metrics('web.checkout.re_reserve_error', 'Invalid captcha or invalid psig', this.context.event_id);
delete this.context.verify_psig;
this.recaptcha.check( this.context );
this.hide();
this.recaptcha.show();
return;
}
}
TMCookie.set( 'NTF', this.context.event_id );
this.fire_metrics('web.checkout.re_reserve_error', 'NTF error', this.context.event_id);
window.location = this.context.edp_url;
return;
}
if ( data.poll ) {
this.show_polling( data );
}
},
on_reserve_polling_failure: function(data) {
this.stop_polling();
this.fire_metrics('web.checkout.re_reserve_error', 'On reserve polling failure', this.context.event_id);
this.context.errors = {
failure: { polling: data }
};
},
fire_metrics: function(type, msg, event_id) {
TM.MetricsCollection.timings.facade('startCounterMetrics', {
'mtype': type,
'message': msg,
'event_id': event_id,
'force' :true
});
}
});
TicketLimitDialog = Class.create( PopupLightboxDialog, {
initialize: function( $super, options ) {
$super( 'ticket_limit_dialog' );
this.edp_url = options.edp_url || '';
Event.observe( this.get_element('.ok'), 'click', this.go_back_to_edp.bind( this ) );
},
go_back_to_edp: function(){
window.location = this.edp_url;
}
} );
