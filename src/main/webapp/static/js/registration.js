$(document).ready(
		function() {
			// Smart Wizard
			$('#wizard').smartWizard({
				// contentURL : '/event' + $('#eventId').val(),
				transitionEffect : 'slide',
				enableAllSteps : false,
				keyNavigation : false, // Enable/Disable key
				// navigation(left and right keys are used if enabled)
				hideButtonsOnDisabled : true,
				onLeaveStep : leaveAStepCallback,
				onShowStep : showStepCallback,
				onFinish : onFinishCallback,
				enableFinishButton : false
			});

			function leaveAStepCallback(obj) {
				var step_num = obj.attr('rel');
				$('.buttonFinish').hide();

				if (step_num == 2) {
					var eventId = $('#eventId').val();
					var town = $('#town').val();
					var adults = $('#adults').val();
					var children = $('#children').val();
					var url = "/register/calculatetotal/" + eventId + "/"
							+ adults + "/" + children;
					$.get(url, function(data, status) {
						$('#totalCharge').text(data);
					});
				}
				return validateSteps(step_num);
			}

			function showStepCallback(obj) {
				var step = obj.attr('rel');

				if (step == 1) {
					populateEvent();
				}

				if (step == 3) {
					$('.buttonNext').hide();
				}
				if (step == 4) {
					$('.buttonNext').hide();
					$('.buttonPrevious').hide();
					$('.buttonFinish').hide();
				}
			}

			function onFinishCallback() {
				if (validateAllSteps()) {
					return true;
				}
			}
		});

function submitPageForm(token) {
	var form = document.getElementById("mainForm");
	// stop the regular form submission
	// collect the form data while iterating over the inputs
	var data = {};
	for (var i = 0, ii = form.length; i < ii; ++i) {
		var input = form[i];
		if (input.name) {
			data[input.name] = input.value;
		}
	}

	$.ajax({
		type : "POST",
		url : "/register/family/" + token,
		data : JSON.stringify(data),
		contentType : "application/json; charset=utf-8",
		crossDomain : false,
		dataType : "json",
		success : function(data, status, jqXHR) {
			$("#confirmationMessage").html(data);
			$('#wizard').smartWizard('goForward');
		},

		error : function(jqXHR, status) {
			// error handler
			$("#confirmationMessage").html(jqXHR.responseText);
			$('#wizard').smartWizard('goForward');
		}
	});
}

function validateAllSteps() {
	var isStepValid = true;

	if (validateStep2() == false) {
		isStepValid = false;
		$('#wizard').smartWizard('setError', {
			stepnum : 1,
			iserror : true
		});
	} else {
		$('#wizard').smartWizard('setError', {
			stepnum : 1,
			iserror : false
		});
	}

	if (!isStepValid) {
		$('#wizard').smartWizard('showMessage',
				'Please correct the errors in the steps and continue');
	}

	return isStepValid;
}

function validateSteps(step) {
	var isStepValid = true;
	// validate step 1
	if (step == 2) {
		if (validateStep2() == false) {
			isStepValid = false;
			$('#wizard').smartWizard(
					'showMessage',
					'Please correct the errors in Step' + step
							+ ' and click next.');
			$('#wizard').smartWizard('setError', {
				stepnum : step,
				iserror : true
			});
		} else {
			$('#wizard').smartWizard('setError', {
				stepnum : step,
				iserror : false
			});
		}
	}

	return isStepValid;
}

function validateStep2() {
	var isValid = true;
	// Validate lastname
	var ln = $('#lastname').val();
	if (!ln && ln.length <= 0) {
		isValid = false;
		$('#msg_lastname').html('Please provide a Lastname').show();
	} else {
		$('#msg_lastname').html('').hide();
	}

	// Validate firstname
	var fn = $('#firstname').val();
	if (!fn && ln.length <= 0) {
		isValid = false;
		$('#msg_firstname').html('Please provide a Firstname').show();
	} else {
		$('#msg_firstname').html('').hide();
	}

	// validate email
	var email = $('#primaryEmail').val();
	if (!email && email.length <= 0) {
		isValid = false;
		$('#msg_primaryEmail').html('Please enter email').show();
	} else {
		$('#msg_primaryEmail').html('').hide();
	}

	// validate town
	var town = $('#town').val();
	if (!town && town.length <= 0) {
		isValid = false;
		$('#msg_town').html('Please select a town').show();
	} else {
		$('#msg_town').html('').hide();
	}

	// validate adults
	var adults = $('#adults').val();
	if (!adults || adults.length <= 0 || !isInt(adults) || parseInt(adults) < 1) {
		isValid = false;
		$('#msg_adults').html(
				'Please provide a valid number of adults attending the event')
				.show();
	} else {
		$('#msg_adults').html('').hide();
	}

	// validate children
	var children = $('#children').val();
	if (!children || children.length <= 0 || parseInt(children) < 0 || !isInt(children)) {
		isValid = false;
		$('#msg_children')
				.html(
						'Please provide a valid number of children attending the event')
				.show();
	} else {
		$('#msg_children').html('').hide();
	}

	return isValid;
}
// text and decimal validation
function isInt(value) {
	return !isNaN(value) && parseInt(Number(value)) == value
			&& !isNaN(parseInt(value, 10));
}

function isValidEmailAddress(emailAddress) {
	var pattern = new RegExp("/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;");
	return pattern.test(emailAddress);
}

function populateEventDetails(event) {
	$('#eventName').text(event.name);
	$('#eventNameAgain').text(event.name);

	$('#eventAddress').text(event.location);
	$('#eventAddressAgain').text(event.location);

	$('#eventDescription').text(event.description);
	$('#eventFlyer').append(
			'<a href="' + event.flyerUrl + '">' + event.flyerUrl + '</a>');
	$('#eventMap').attr('src', event.locationURL);

	$('#eventContactEmail').append(
			'<a href="mailto:' + event.contactEmail + '">' + event.contactEmail
					+ '</a>');
	$('#eventContactEmailAgain').append(
			'<a href="mailto:' + event.contactEmail + '">' + event.contactEmail
					+ '</a>');

	var dateTime = $.format.date(event.startDateTime, "hh:mm a") + " - "
			+ $.format.date(event.endDateTime, "hh:mm a") + ",<br />"
			+ $.format.date(event.endDateTime, "ddd, MMMM dd, yyyy")

	$('#eventPricing').text(
			"Adults: $" + event.adultCost + " - Kids: $" + event.childCost);

	$('#eventTime').append(dateTime);

	$('#eventTimeAgain').append(dateTime);

	$('#eventImage').val(event.paymentLogo);
}

function populateEventCal(event) {
	$('#eventNameCal').text(event.name);
	$('#eventLocationCal').text(event.location);
	$('#eventDescCal').text(event.description);
	$('#eventEmailCal').text(event.contactEmail);
	
	var stDate = $.format.date(event.startDateTime, "yyyy-MM-dd hh:mm:ss");
	var edDate = $.format.date(event.endDateTime, "yyyy-MM-dd hh:mm:ss");
	
	$('#eventStartDateCal').text(stDate);
	$('#eventEndDateCal').text(edDate);
}

