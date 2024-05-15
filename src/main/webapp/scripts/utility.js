const baseUrl = window.location.origin + '/TIW-24-js';
const checkAvailabilityUrl = baseUrl + '/checkAvailability';
const getAlbumsUrl = baseUrl + '/getAlbums';
const getMeUrl = baseUrl + '/getMe';

function asyncXHR(urlString, paramsInitCallback, onResponseCallback) {
	const url = new URL(urlString);
	const xmlHttpRequest = new XMLHttpRequest();
	
	xmlHttpRequest.withCredentials = true;
	paramsInitCallback(url);
	
	xmlHttpRequest.onreadystatechange = () => {
		if (xmlHttpRequest.readyState === 4) {
			const response = JSON.parse(xmlHttpRequest.response);
			onResponseCallback(response);
		}
	};
	
	xmlHttpRequest.open("get", url);
	xmlHttpRequest.send();
}

function displayError(error, type) {
    errorMessage.innerHTML = error;

    if(type === 'sign') {
    	errorPopup.classList.add("error-popup-show-sign");
    	setTimeout(() => {errorPopup.classList.remove("error-popup-show-sign")}, 4000);
    } else {
    	errorPopup.classList.add("error-popup-show")
    	setTimeout(() => {errorPopup.classList.remove("error-popup-show")}, 4000);
    }
}

function displayFine(fine, type) {
    fineMessage.innerHTML = fine;

    if(type === 'sign') {
    	finePopup.classList.add("fine-popup-show-sign");
    	setTimeout(() => {finePopup.classList.remove("fine-popup-show-sign")}, 4000);
    } else {
    	finePopup.classList.add("fine-popup-show")
    	setTimeout(() => {finePopup.classList.remove("fine-popup-show")}, 4000);
    }
}