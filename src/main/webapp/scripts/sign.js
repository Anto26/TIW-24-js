const username = document.querySelector('#username');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const repeatPassword = document.querySelector('#repeat-password');
const form = document.querySelector('.inner-form');

const errorDiv = document.createElement('div');
errorDiv.className = 'error-container';
errorDiv.style = 'visibility: hidden';
errorDiv.innerHTML = '<p></p>';
form.insertBefore(errorDiv, form.firstChild);

function showError(error, text) {
	if (error === true) {
		errorDiv.style='visibility: visible';
		errorDiv.firstChild.innerText = text
	} else {
		errorDiv.style='visibility: hidden';
	}	
}

username.addEventListener("input", () => {
	asyncXHR(checkAvailabilityUrl, 
		(url) => {
			url.searchParams.append('username', username.value);
		},
		(response) => {
			if(response.ok === false && username.value !== '')
				showError(true, response.result);
			else if(response.result.taken === true)
				showError(true, 'The username is already taken');
			else
				showError(false);
		})
});

email.addEventListener("input", () => {
	const validEmailPattern = new RegExp("^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$");
	
	if(!validEmailPattern.test(email.value)) {
		showError(true, 'The email address is not valid');
	} else {
		showError(false);
		
		asyncXHR(checkAvailabilityUrl, 
		(url) => {
			url.searchParams.append('email', email.value);
		},
		(response) => {
			if(response.ok === false && email.value !== '')
				showError(true, response.result);
			else if(response.result.taken === true)
				showError(true, 'The email address is already taken');
			else
				showError(false);
		});
	}
});