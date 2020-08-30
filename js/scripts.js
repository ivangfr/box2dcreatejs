$(document).ready(function() {
	
	$("#form_contact button[type='button']").click(function() {
		var $name = $('input[name="name"]');
		var nameVal = $name.val().trim();
		var $email = $('input[name="email"]');
		var emailVal = $email.val().trim();
		var $message = $('textarea[name="message"]');
		var messageVal = $message.val().trim();

		var condition = true;
		if ( nameVal == "" || emailVal == "" || messageVal == "" ) {
			condition = false;

			if ( nameVal == "" )
				fnShowPoshytip($name, "Tip the name!");
			else if ( emailVal == "" )
				fnShowPoshytip($email, "Tip the email!");
			else if ( messageVal == "" )
				fnShowPoshytip($message, "Tip the message!");
		}
		else if ( !IsValidEmail(emailVal) ) {
			fnShowPoshytip($email, "The email is not valid!");
			condition = false;
		}

		if ( condition ) {
			$.blockUI({
				message: "<p id='blockUIMsg'>Please wait ...</p>",
				css: {
					border: 'none', 
					padding: '15px', 
					backgroundColor: '#fff', 
					'-webkit-border-radius': '10px', 
					'-moz-border-radius': '10px', 
					opacity: .9, 
					color: '#000' 
				},
				overlayCSS:  { 
					opacity: 0.4 
				}
			});

			sendEmail(nameVal, emailVal, messageVal);
		}
	});	

});

function sendEmail(name, email, message) {
	$.ajax({
		url : "SendEmail",
		data : {
			name: name,
			email: email,
			message: message
		},
		type : 'GET',
		dataType : 'text',
		async : true,
		success : function(data) {
			console.log("success on send email!");

			clearContactFields();
			showPNotify('success','Success','Your email was sent successfully! Thanks!');
		},
		error : function(xhr, status) {
			console.log("error on send email!");
			console.log("error: " + status);
			console.log("incoming Text: " + xhr.responseText);

			showPNotify('error','Error','Occurred a problem to send your email! Try again!');
		},
		complete : function(xhr, status) {
			$.unblockUI();
		}
	});
}

function fnShowPoshytip($elem, text) {
	if ( !text )
		text = "Value informed is not valid!";
	$elem.poshytip({
		content: text,
		className: 'tip-twitter',
		showOn: 'none',
		alignTo: 'target',
		alignX: 'right',
		alignY: 'center',
		offsetX: 5,
		timeOnScreen : 2000
	});
	$elem.poshytip('show');
	$elem.focus();
}

function IsValidEmail(email) {
	var filter = new RegExp(/^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$/i);;
	return filter.test(email);
}

function clearContactFields() {
	$('input[name="name"]').val("");
	$('input[name="email"]').val("");
	$('textarea[name="message"]').val("");
}

function showPNotify(type, title, text) {
	$.pnotify({
		title: title,
		text: text,
		delay: 4500,
		addclass: 'custom',
		mouse_reset: false,
		width: "400px",
		animation: {
			effect_in: function(status, callback, pnotify) {
				var source_note = 'Always call the callback when the animation completes.';
				var cur_angle = 0,
				cur_opacity_scale = 0;
				var timer = setInterval(function() {
					cur_angle += 10;
					if (cur_angle == 360) {
						cur_angle = 0;
						cur_opacity_scale = 1;
						clearInterval(timer);
					} else {
						cur_opacity_scale = cur_angle / 360;
					}
					pnotify.css({
						'-moz-transform': ('rotate(' + cur_angle + 'deg) scale(' + cur_opacity_scale + ')'),
						'-webkit-transform': ('rotate(' + cur_angle + 'deg) scale(' + cur_opacity_scale + ')'),
						'-o-transform': ('rotate(' + cur_angle + 'deg) scale(' + cur_opacity_scale + ')'),
						'-ms-transform': ('rotate(' + cur_angle + 'deg) scale(' + cur_opacity_scale + ')'),
						'filter': ('progid:DXImageTransform.Microsoft.BasicImage(rotation=' + (cur_angle / 360 * 4) + ')')
					}).fadeTo(0, cur_opacity_scale);
					if (cur_angle == 0) callback();
				}, 20);
			},
			effect_out: function(status, callback, pnotify) {
				var source_note = 'Always call the callback when the animation completes.';
				var cur_angle = 0,
				cur_opacity_scale = 1;
				var timer = setInterval(function() {
					cur_angle += 10;
					if (cur_angle == 360) {
						cur_angle = 0;
						cur_opacity_scale = 0;
						clearInterval(timer);
					} else {
						cur_opacity_scale = cur_angle / 360;
						cur_opacity_scale = 1 - cur_opacity_scale;
					}
					pnotify.css({
						'-moz-transform': ('rotate(' + cur_angle + 'deg) scale(' + cur_opacity_scale + ')'),
						'-webkit-transform': ('rotate(' + cur_angle + 'deg) scale(' + cur_opacity_scale + ')'),
						'-o-transform': ('rotate(' + cur_angle + 'deg) scale(' + cur_opacity_scale + ')'),
						'-ms-transform': ('rotate(' + cur_angle + 'deg) scale(' + cur_opacity_scale + ')'),
						'filter': ('progid:DXImageTransform.Microsoft.BasicImage(rotation=' + (cur_angle / 360 * 4) + ')')
					}).fadeTo(0, cur_opacity_scale);
					if (cur_angle == 0) {
						pnotify.hide();
						callback();
					}
				}, 20);
			}
		}
	});
}