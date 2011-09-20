var Game = function(){
    this.recaptchaInit();
    this.dom.startButton.attr("value", "restart");
    $('#captchagame-form').unbind().submit(this.submit.bind(this)).focusout(this.reload.bind(this));
    $('#result').remove();

    //score
    this.success = 0; //正解した問題数
    this.fail = 0; //間違えた問題数
    this.straightSuccess = 0; //直前に連続正解した問題数
    this.readCharNum = 0; //正解した文字数
    
    this.startTime = (new Date).valueOf();
    this.timeLimit = 20000;
    this.bonusTime = 0;
    this.timer = setInterval(this.countdown.bind(this), 100);
};

Game.prototype = {
    dom: {startButton: $("#start")},
    setTimebar: function(value){
	$("#timebar").attr("value", value);
    },
    recaptchaInit: function(){
	Recaptcha.create("public key",
			 "captcha",
			 {theme: "clean",
			  callback: Recaptcha.focus_response_field});
    },
    gameOver: function(){
	Recaptcha.destroy();
	this.endTime = new Date;
	
	var result = {'Time': (this.endTime - this.startTime)/1000 + " secs",
		      'Success Problems': this.success,
		      'Success Characters': this.readCharNum,
		      'Failed Problems': this.fail};
	var dl = $('<dl>');
	for(var i in result)
	    dl.append($('<dt>').text(i), $('<dd>').text(result[i]));
	var cps = Math.round(this.readCharNum/((this.timeLimit+this.bonusTime)/1000)*100)/100;
	var s = $('<span>').text(cps + ' char per second');
	var holder = $('<div id="result">').appendTo($('body'));
	holder.append(dl, s);

	this.dom.startButton.attr("value", "replay");
    },
    
    //callbacks
    submit: function(evt){
	$(evt.target).ajaxSubmit({success: this.verify.bind(this, Recaptcha.get_response())});
	return false;
    },
    reload: function(){
	Recaptcha.reload();
	message("Reload", "reload");
	this.bonusTime -= 1000;
	message("-1 sec", "reload");
    },
    verify: function(sendText, responseText){
	var msgText;
	var msgClass;
	var bonus;
	if(responseText.match(/^true\n/)){ //success
	    bonus = 3000;
	    this.success++;
	    this.straightSuccess++;
	    this.readCharNum += sendText.match(/\S/g).length;
	    var straight = (this.straightSuccess > 1)?this.straightSuccess+" ":"";
	    msgText = straight + "Success";
	    msgClass = "success";
	}else{ //fail
	    bonus = -3000;
	    if(this.bonusTime > 0) bonus -= this.bonusTime/100;
	    this.fail++;
	    this.straightSuccess = 0;
	    msgText = "Fail";
	    msgClass = "fail";
	}
	
	if(!this.timer){
	    message(msgText, msgClass);
	    message("Game Over");
	    this.gameOver();
	}else{
	    message(msgText + ((bonus > 0)?" +"+bonus/1000:" "+bonus/1000)+" secs",
		    msgClass);
	    this.bonusTime += bonus;
	    this.recaptchaInit();
	}
    },
    countdown: function(){
	var rest = (this.startTime + this.timeLimit + this.bonusTime - new Date)/1000;
	if(rest <= 0){
	    this.setTimebar(0);
	    clearInterval(this.timer);
	    this.timer = false;
	}
	this.setTimebar(rest);
    }
};

function message(str, className){
    className = className || "";
    $('<span class="message">').addClass(className).text(str).insertBefore($('#captcha'))
	.fadeOut(5000,function(){$(this).remove()});
}

$(function() {
    $("#start").click(function(){new Game});
});