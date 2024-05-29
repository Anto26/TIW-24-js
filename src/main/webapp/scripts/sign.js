const username = document.querySelector('#signup-username');
const email = document.querySelector('#signup-email');
const password = document.querySelector('#signup-password');
const repeatPassword = document.querySelector('#signup-repeat-password');
const form = document.querySelector('.inner-form');
const errorPopup = document.querySelector('#error-popup');
const errorMessage = document.querySelector('#error-message');
const finePopup = document.querySelector('#fine-popup');
const fineMessage = document.querySelector('#fine-message');

username.addEventListener("focusout", () => {
	if(username.value.length > 20) {
		displayError('The username must not exceed 20 characters', 'sign');
	} else {
		asyncXHR(checkAvailabilityUrl, 
			(url) => {
				url.searchParams.append('username', username.value);
			},
			(response) => {
				if(!response.ok && username.value !== '')
					displayError(response.result);
				else if(response.result.taken)
					displayError('The username is already taken');
			}
		);
	}
});

email.addEventListener("focusout", () => {
	const validEmailPattern = new RegExp("^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$");
	
	if(!validEmailPattern.test(email.value) && email.value !== '') {
		displayError('The email address is not valid');
	} else {
		asyncXHR(checkAvailabilityUrl, 
			(url) => {
				url.searchParams.append('email', email.value);
			},
			(response) => {
				if(!response.ok && email.value !== '')
					displayError(response.result);
				else if(response.result.taken)
					displayError('The email address is already taken');
			}
		);
	}
});

password.addEventListener("input", () => {
	if (password.value.length < 8 || password.value.length > 40)
		displayError('The password has to be at least 8 characters and must not exceed 40 characters');
	else
		displayFine('The password meets the criteria');
});

repeatPassword.addEventListener("input", () => {
	if(repeatPassword.value !== password.value)
		displayError('The passwords ARE NOT equal');
	else
		displayFine('The passwords are equal');
});