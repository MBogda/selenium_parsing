;(function ( $, window, undefined )
{
$.fn.recaptchaV2 = function(options){
var self = this;
var tag = ($(self).attr('id'));
var defaults = {
tag : null,
captchaId: null,
enable: true,
enable_by_event: true,
status: 'live',
key : "",
lang : 'en',
type : "image",
callbackResponse : null,
callbackErrorLoad : null,
url : "",
response : 0,
error : false,
errorMessage : "",
titleRecaptcha: ""
};
self.settings = $.extend( {}, defaults, options );
if(self.settings.tag){
self.settings.tag = tag;
}
self.loadCaptcha = function(){
var captchaOptions = {
'sitekey' : self.settings.key,
'type' : self.settings.type
};
if( typeof( self.settings.callbackResponse) == "function" ){
captchaOptions.callback = self.settings.callbackResponse;
}
try{
self.settings.captchaId = grecaptcha.render(self.settings.tag, captchaOptions);
}catch(err){
if( typeof( self.settings.callbackErrorLoad) == "function" ){
self.settings.callbackErrorLoad();
}
}
};
self.isEnabled = function(){
return self.settings.enable;
};
self.reset = function(){
if( $('#g_recaptcha2_continue') )
$('#g_recaptcha2_continue').prop('disabled',true).addClass('button-disabled');
if( $('#recaptcha2_continue') )
$('#recaptcha2_continue').prop('disabled',true).addClass('button-disabled');
if( self.settings.captchaId !=null && typeof(self.settings.captchaId) != 'undefined' ) {
grecaptcha.reset(self.settings.captchaId);
}else{
grecaptcha.reset();
}
};
$('body').css("opacity", 1);
return self;
};
}( jQuery, window ) );
