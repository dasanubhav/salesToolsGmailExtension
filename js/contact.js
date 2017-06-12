function saveContact() {
	var emailAddress = $('#emailAddress').val();
	var firstName = $('#firstName').val();
	var lastName = $('#lastName').val();
	var lastName = $('#lastName').val();
	var operation = $('#operation').val();
	var xsrfToken = $('#xsrfToken').val();

	var url = 'https://devsecure.eloquacorp.com/API/REST/2.0/data/contact';

	$.ajax({
		type: 'POST',
		data: JSON.stringify({
			type: "Contact",
			emailAddress: emailAddress,
			firstName: firstName,
			lastName: lastName
		}),
		dataType: 'json',
		contentType: 'application/json',
		url: url + '?xsrfToken=' + xsrfToken,
		success: function(response, status, jqxhr) {
			debugger;
		},
		error: function(jqxhr) {
			debugger;
		}
	});

}