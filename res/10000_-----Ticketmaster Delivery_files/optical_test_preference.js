;(function($) {
createNamespace('TM.OpticalTestPreference');
TM.OpticalTestPreference = function (context, data) {
var self = this;
self.context = context;
self.event_id = data.event_id;
self.mode = data.mode;
self.action = data.action;
self.jsonpCallback = data.jsonpCallback;
self.callbacks = data.callbacks;
}
$.extend(TM.OpticalTestPreference.prototype, {
show_preference: function (fallback_reason) {
var self = this;
var data = self.context.recaptcha_request;
var recaptcha_preference;
if (typeof optical_test_preferences == 'undefined' || (optical_test_preferences[self.event_id] &&
optical_test_preferences[self.event_id].length == 0) && self.mode == "isc") {
self.context.show_error_captcha();
return;
}
if (typeof self.optical_preference == 'undefined') {
self.optical_preference = self.mode == "classic" ? data.recaptcha_choice : optical_test_preferences[self.event_id][0];
}
if (typeof fallback_reason !== 'undefined') {
var old_recaptcha;
if (self.mode == "classic") {
old_recaptcha = self.context.recaptcha_request;
$.ajax({
url: self.action,
dataType: 'jsonp',
jsonpCallback: self.jsonpCallback,
data: {
v: data.recaptcha.force
},
success: function(resp) {
self.context.recaptcha_request = resp;
self.show_captcha(resp.recaptcha_choice,resp);
},
error: function(error) {
}
});
} else {
old_recaptcha = optical_test_preferences[self.event_id].shift();
}
if (typeof old_recaptcha != 'undefined') self.context.fire_error_metrics(
old_recaptcha.recaptcha_choice,
fallback_reason,
old_recaptcha == self.optical_preference
);
}
if ((typeof fallback_reason == 'undefined' && self.mode == "classic") || self.mode == "isc") {
if (self.mode == "classic") {
recaptcha_preference = data.recaptcha_choice;
} else if (optical_test_preferences[self.event_id].length == 0 && self.optical_preference != ""){
recaptcha_preference = self.optical_preference;
self.optical_preference = "";
} else {
recaptcha_preference = optical_test_preferences[self.event_id][0];
}
if (self.callbacks.prepare_recaptcha_success) {
self.callbacks.prepare_recaptcha_success(data);
}
self.show_captcha(recaptcha_preference,data);
}
},
fire_log_metrics: function (captcha_type){
TM.MetricsCollection.timings.facade( 'startCounterMetrics', {
'mtype': 'web.captcha.display.counter',
'captcha_type': captcha_type,
'force': true
}
);
},
show_captcha: function (captcha,data) {
var self = this;
recaptcha_choice = captcha;
if((captcha != "" || captcha != 'undefined') && (self.mode != 'classic')){
self.fire_log_metrics(captcha);
}
switch (captcha) {
case 'solve_media':
self.context.solve_ready('load');
break;
case 'recaptchav2':
self.context.show_recaptcha();
self.context.show_google2();
break;
case 'immune':
if (self.callbacks.recaptcha_success()) {
self.callbacks.recaptcha_success(data);
}
break;
default:
if( optical_test_preferences && optical_test_preferences[self.event_id] && optical_test_preferences[self.event_id].length == 0 ) {
self.context.fire_error_metrics('all_captcha','services_down');
}
self.callbacks.recaptcha_cancel();
if ( typeof (data) != 'undefined' && data.error && data.error == "token_over_limit") {
self.context.show_error_captcha("token_over_limit");
} else {
self.context.show_error_captcha();
}
break;
}
}
});
})(jQuery);
