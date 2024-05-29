const baseUrl = window.location.origin + '/TIW-24-js';
const checkAvailabilityUrl = baseUrl + '/checkAvailability';
const getAlbumsUrl = baseUrl + '/getAlbums';
const getMeUrl = baseUrl + '/getMe';
const getUserImagesUrl = baseUrl + '/getUserImages';
const createAlbumUrl = baseUrl + '/createAlbum';
const uploadImageUrl = baseUrl + '/uploadImage';
const getImagesUrl = baseUrl + '/getImages';
const addCommentUrl = baseUrl + '/addComment';
const addOrderUrl = baseUrl + '/addOrder';
const deleteImageUrl = baseUrl + '/deleteImage';

function asyncXHR(urlString, paramsInitCallback, onResponseCallback) {
	const url = new URL(urlString);
	const xmlHttpRequest = new XMLHttpRequest();
	
	xmlHttpRequest.withCredentials = true;
	paramsInitCallback(url);
	
	xmlHttpRequest.onreadystatechange = () => {
		if (xmlHttpRequest.readyState === 4) {
			try {
				const response = JSON.parse(xmlHttpRequest.response);
				onResponseCallback(response);
			} catch (e) {
				if (xmlHttpRequest.status >= 500) {
					displayError("There is an internal error with the server");
				} else if (xmlHttpRequest.status == 401) {
					displayError("There was an error with the login");
				} else if (xmlHttpRequest.responseURL.includes("signin")) {
					sessionExpired();
				} else {
					console.log(xmlHttpRequest);
					displayError("There was an error parsing the response");
				}
			}
		}
	};
	
	xmlHttpRequest.open("get", url);
	xmlHttpRequest.send();
}
function sessionExpired() {
	displayError("Session expired, redirecting to sign in...");
	setTimeout(() => {window.location.replace(baseUrl + "/signin");}, 5000);
}

function displayError(error) {
    errorMessage.innerHTML = error;

	errorPopup.classList.add("popup-show")
	setTimeout(() => {errorPopup.classList.remove("popup-show")}, 4000);
}

function displayFine(fine) {
    fineMessage.innerHTML = fine;

	finePopup.classList.add("popup-show")
	setTimeout(() => {finePopup.classList.remove("popup-show")}, 4000);
}

function sendFormData(urlString, paramsInitCallback, form, onResponseCallback) {
	const url = new URL(urlString);
	paramsInitCallback(url);
	const xmlHttpRequest = new XMLHttpRequest();
	var formData = form;
	
	xmlHttpRequest.withCredentials = true;	
	xmlHttpRequest.onreadystatechange = () => {
		if (xmlHttpRequest.readyState === 4) {
			console.log(xmlHttpRequest.response);
			const response = JSON.parse(xmlHttpRequest.response);
			onResponseCallback(response);
		}
	};
	
	xmlHttpRequest.open("POST", url, true);
	xmlHttpRequest.send(formData);
}