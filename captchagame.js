$(function() {
    function recaptchaInit(){
	Recaptcha.create("public api key",
			 "captcha",
			 {theme: "clean",
			  callback: Recaptcha.focus_response_field});
    }

    recaptchaInit();
    
    function afterPost(responseText, statusText, xhr, $form) {
	if(responseText.match(/^true\n/)){
	    alert("Success");
	}else{
	    alert("Fail");
	}
	recaptchaInit();
    }
    var options = { 
        success: afterPost
    };
 
    $('#captchagame-form').ajaxForm(options);
});