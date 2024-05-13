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