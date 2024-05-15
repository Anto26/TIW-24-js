const username = document.querySelector('#username');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const repeatPassword = document.querySelector('#repeat-password');
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
					displayError(response.result, 'sign');
				else if(response.result.taken)
					displayError('The username is already taken', 'sign');
			}
		);
	}
});

email.addEventListener("focusout", () => {
	const validEmailPattern = new RegExp("^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$");
	
	if(!validEmailPattern.test(email.value) && email.value !== '') {
		displayError('The email address is not valid', 'sign');
	} else {
		asyncXHR(checkAvailabilityUrl, 
			(url) => {
				url.searchParams.append('email', email.value);
			},
			(response) => {
				if(!response.ok && email.value !== '')
					displayError(response.result, 'sign');
				else if(response.result.taken)
					displayError('The email address is already taken', 'sign');
			}
		);
	}
});

password.addEventListener("input", () => {
	if (password.value.length < 8 || password.value.length > 40)
		displayError('The password has to be at least 8 characters and must not exceed 40 characters', 'sign');
	else
		displayFine('The password meets the criteria', 'sign')
});

repeatPassword.addEventListener("input", () => {
	if(repeatPassword.value !== password.value)
		displayError('The passwords ARE NOT equal', 'sign');
	else
		displayFine('The passwords are equal', 'sign')
});