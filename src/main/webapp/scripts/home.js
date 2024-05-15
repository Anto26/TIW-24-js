// General elements
const errorPopup = document.querySelector('#error-popup');
const errorMessage = document.querySelector('#error-message')
// Navbar elements
const homeButton = document.querySelector("#home-button");
const createAlbumButton = document.querySelector("#create-album-button");
// Album page elements
const homePage = document.querySelector('#homepage')
const userAlbumsDiv = document.querySelector('#user-albums');
const othersAlbumsDiv = document.querySelector('#others-albums');
const usernameHeader = document.querySelector('#username');
var username = "";
var albums;

// Create album page elements
const createAlbumPage = document.querySelector('#create-album-page');
const photoList = document.querySelector('#photos-list');
var images = "";

// Create album page elements
asyncXHR(getMeUrl, 
    (url) => {}, 
    (response) => {
        if (response.ok) {
            username = response.result.username;
            usernameHeader.textContent = username;
            // Populate albums
            asyncXHR(getAlbumsUrl, (url) => {return url;}, (response) => {
                if (response.ok) {
                    albums = response.result;
                    populateAlbums(albums);
                } else {
                    displayError(response.result);
                }
            })
        }
    }
);

function showCreateAlbumPage() {
    homePage.setAttribute("style", "display:none;");
    createAlbumPage.setAttribute("style", "");
    createAlbumButton.setAttribute("style", "display:none");
    homeButton.setAttribute("style", "");
    refreshImages();
}

function showHomePage() {
	homePage.setAttribute("style", "");
    createAlbumPage.setAttribute("style", "display:none;");
    createAlbumButton.setAttribute("style", "");
    homeButton.setAttribute("style", "display:none;");
	refreshAlbums();
	
}

function refreshAlbums() {
	userAlbumsDiv.innerHTML = "";
	othersAlbumsDiv.innerHTML = "";
	asyncXHR(getAlbumsUrl, (url) => {return url;}, (response) => {
            if (response.ok) {
                albums = response.result;
                populateAlbums(albums);
            } else {
                displayError(response.result);
            }
        });
}
function populateAlbums(albums) {

    albums.forEach(album => {
        // Create the card container
        const card = document.createElement("div");
        card.classList.add("album-card");
        // Add inner HTML
        // TODO add onclick to button
        card.innerHTML = `
          <div class="thumbnail-container">
            <img class="album-thumbnail" src="images/${album.thumbnail.file_path}" />
          </div>
          <div class="card-information">
            <p class="card-title">${album.title}</p>
            <p class="card-author">by: ${album.creator.username}</p>
            <p class="card-date">${album.creation_date}</p>
            <button class="button accent-button">Go to album</button>
          </div>
        `;
        // Add listener
        const button = card.querySelector('button');
        button.addEventListener('click', () => {
            showAlbumPage(album.id);
        });
        // Add the card to the right container
                // Choose where to put the album
        if (album.creator.username == username) {
            container = userAlbumsDiv;
        } else {
            container = othersAlbumsDiv;
        }
        container.appendChild(card);
      });
}

function refreshImages() {
	photoList.innerHTML = '';
	asyncXHR(getUserImagesUrl, (url) => {return url;}, (response) => {
        if (response.ok) {
            // Populate images
            images = response.result;
            populateImages(images);
        }
    });
}
function populateImages(images) {
    images.forEach(image => {
        // Create the card container
        const photo = document.createElement("div");
        photo.classList.add("photo-check");
        // Add inner HTML
        // TODO add onclick to button
        photo.innerHTML = `
        <div class="photo-check">
            <input id="${image.id}" name="${image.id}" type="checkbox" name="checkbox" class="checkbox">
            <img src="images/${image.file_path}" class="checkbox-image" />
        </div>
        `;
        photoList.appendChild(photo);
      });
}

function submitImage() {
	form = document.getElementById("image-form");
	title = document.getElementById("image-title").value;
	description = document.getElementById("image-description").value;
	file = document.getElementById("image-upload");
	var sendForm = new FormData();
	//sendForm.append("title", "Ciao");
	//sendForm.append("description", "adfadsf");
	sendForm.append("image", file.files[0]);
	sendFormData(uploadImageUrl, (url) =>  {
		url.searchParams.append("title", title);
		url.searchParams.append("description", description);
		url.searchParams.append("fileName", file.files[0].name);
	}, 
	sendForm, 
	(response) => {
		if (response.ok) {
			refreshImages();
		} else {
			displayError(response.result);
		}
	});
}

function submitAlbum() {
	asyncXHR(createAlbumUrl, 
	(url) => {
		var checkboxes = document.querySelectorAll('.checkbox:checked');
		checkboxes.forEach((checkbox) => {
			var id = checkbox.getAttribute("id");
			url.searchParams.append(id, "on");
		});
		url.searchParams.append("title", document.querySelector("#album-title").value);
	}, 
	(response) => {
            if (response.ok) {
				showHomePage();
            } else {
                displayError(response.result);
            }
        });
}