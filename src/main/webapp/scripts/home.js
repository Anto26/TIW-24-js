// General elements
const errorPopup = document.querySelector('#error-popup');
const errorMessage = document.querySelector('#error-message');
const finePopup = document.querySelector('#fine-popup');
const fineMessage = document.querySelector('#fine-message');

// Navbar elements
const homeButton = document.querySelector("#home-button");
const createAlbumButton = document.querySelector("#create-album-button");

// Home page elements
const homePage = document.querySelector('#homepage')
const userAlbumsDiv = document.querySelector('#user-albums');
const othersAlbumsDiv = document.querySelector('#others-albums');
const usernameHeader = document.querySelector('#username');
var username = "";
var albums;
var currentPage = 0;

// Create album page elements
const createAlbumPage = document.querySelector('#create-album-page');
const photoList = document.querySelector('#photos-list');
var images = "";

// Album Page elements
const albumPage = document.querySelector("#album-page");
var albumImages;
var page = 0;
var currentAlbum;

// Make initial request to get information for home page
asyncXHR(getMeUrl,
	(url) => { },
	(response) => {
		if (response.ok) {
			username = response.result.username;

			usernameHeader.textContent = username;
			// Populate albums
			asyncXHR(getAlbumsUrl, (url) => { return url; }, (response) => {
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
	albumPage.setAttribute("style", "display:none;");
	createAlbumButton.setAttribute("style", "display:none");
	homeButton.setAttribute("style", "");
	refreshImages();
}

function showHomePage() {
	homePage.setAttribute("style", "");
	createAlbumPage.setAttribute("style", "display:none;");
	albumPage.setAttribute("style", "display:none;");
	createAlbumButton.setAttribute("style", "");
	homeButton.setAttribute("style", "display:none;");
	refreshAlbums();

}

function showAlbumPage(id) {
	createAlbumPage.setAttribute("style", "display:none;");
	homePage.setAttribute("style", "display:none;");

	albumPage.setAttribute("style", "");
	homeButton.setAttribute("style", "");
	createAlbumButton.setAttribute("style", "");

	refreshAlbumPage(id);
}

// Home page functions

function refreshAlbums() {
	userAlbumsDiv.innerHTML = "";
	othersAlbumsDiv.innerHTML = "";
	asyncXHR(getAlbumsUrl, (url) => { return url; }, (response) => {
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


// Create Album page functions

function refreshImages() {
	photoList.innerHTML = '';
	asyncXHR(getUserImagesUrl, (url) => { return url; }, (response) => {
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
	sendFormData(uploadImageUrl, (url) => {
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



// Album page functions
function refreshAlbumPage(id) {
	asyncXHR(getImagesUrl,
		(url) => {
			url.searchParams.append("albumId", id);
		},
		(response) => {
			if (response.ok) {
				currentAlbum = response.result;
				albumImages = currentAlbum.images;
				populateAlbumImages(albumImages);
				populateAlbumInfo(currentAlbum);
			}
		}
	)
}

function populateAlbumInfo(album) {
	document.getElementById("album-page-title").innerHTML = album.title;
	document.getElementById("album-page-author").innerHTML = album.creator.username + " - " + album.creation_date;
}

function populateAlbumImages(albumImages) {
	// Calculate maxPage
	maxPage = 0;
	if (albumImages.length > 5) {
		maxPage = Math.floor(albumImages.length / 5) - 1;
		if (albumImages % 5 != 0) {
			maxPage++;
		}
	}
	// In case there are not enough images for the requested page
	// go to the first page
	if (albumImages.length < page * 5) {
		page = 0;
	}

	// Create image array
	var shownImages = [null, null, null, null, null];
	var currentIndex = 0;
	var i;
	for (i = page * 5; i < (page + 1) * 5 && i < albumImages.length; i++) {
		shownImages[currentIndex] = albumImages[i];
		currentIndex++;
	}

	i = 0;
	shownImages.forEach(image => {
		// Create the card container
		container = document.getElementById("album-image-" + i);
		container.innerHTML = "";
		const photo = document.createElement("div");
		// Add inner HTML
		if (image != null) {
			photo.innerHTML = `
								<p class="image-title">${image.title}</p>
								<div>
									<img src="images/${image.file_path}" class="image-thumbnail"/>
								</div>
	        `;
	        thumbnail = photo.querySelector(".image-thumbnail");
	        thumbnail.addEventListener("mouseover",() => {showImgModal(image);});
        }
		container.appendChild(photo);
		i++;
	});

	if (page != 0) {
		document.getElementById("back-button").setAttribute("style", "");
	} else {
		document.getElementById("back-button").setAttribute("style", "display:none;");
	}
	
	if (page < maxPage) {
		document.getElementById("next-button").setAttribute("style", "");
	} else {
		document.getElementById("next-button").setAttribute("style", "display:none");
	}
}

function albumPageNext() {
	page++;
	populateAlbumImages(albumImages);
}

function albumPagePrevious() {
	page--;
	populateAlbumImages(albumImages);
}

// Image Page

function showImgModal(img) {
    // Create the modal
    const modal = document.createElement('div');
    modal.innerHTML = `
    	<!--  Image modal -->
        <div id="img-modal" class="modal">
            
            <!-- Modal content -->
            <div class="modal-content">

            	<span class="close">&times;</span>

				<div class="image-page">
					<h1 style="margin-bottom: 0px">${img.title}</h1>
					<p>${img.description}</p>
					<p style="margin-top: 2px;">Created by ${img.uploader.username} on ${img.date}</p>
					<div style="overflow-x: scroll; overflow-y: scroll">
						<img src="images/${img.file_path}">
					</div>
					<div class="centerdiv">
						<div class="comments">
							<h2>Comments</h2>
							<div id="comments-container"></div>
	
							<!--Input form-->
							<br />
							<div>
								<label class="input-label">Add comment</label> 
								<input type="text" id="text-comment" name="text" class="input" />
								<button type="button" id="send-comment" class="button accent-button">Send</button>
							</div>
						</div>
					</div>
				</div>
            </div>
        </div>`;

    // Show modal in body
    document.querySelector('body').appendChild(modal);

    // Add comments to modal
    const commentContainer = document.querySelector('#comments-container');
    img.comments.forEach(comment => {
        const commentObj = document.createElement('div');
        commentObj.classList = 'comment'
        commentObj.innerHTML = `
			<p class="comment-author">${comment.author.username}</p>
			<p class="comment-text">${comment.content}</p>`;

        commentContainer.appendChild(commentObj);
    });

    // Listen for send comment interaction
    const sendComment = document.querySelector('#send-comment');
    const textComment = document.querySelector('#text-comment');
    sendComment.addEventListener('click', () => {
    	if(textComment.value.length > 4096) {
    		displayError('The comment is too long');
    	} else {
    		asyncXHR(addCommentUrl,
    			(url) => {
    				url.searchParams.append("imgId", img.id);
    				url.searchParams.append("text", textComment.value);
    			},
    			(response) => {
    				if (response.ok) {
    					// Add comment to view
    					const commentObj = document.createElement('div');
				        commentObj.classList = 'comment'
				        commentObj.innerHTML = `
							<p class="comment-author">${username}</p>
							<p class="comment-text">${textComment.value}</p>`;
				        commentContainer.appendChild(commentObj);
						textComment.value = "";
				        // Add comment to local image object
				        img.comments.push({
			        		id: "", 
			        		content: textComment.value,
			        		author: {
			        			id: "",
			        			username: username
			        		}
			        	});
			        	displayFine("Comment added");
    				} else {
    					displayError(response.result);
    				}
    			}
			);
    	}
    });
    // Close modal when it is clicked out of the modal
    document.getElementById("img-modal").addEventListener("click", (e) => {
		console.log("Lol");
		if (e.target == document.getElementById("img-modal")) {
			modal.remove();
		} else {
			e.stopPropagation();
		}
	});
    // Close modal when span with 'X' icon clicked
    const close = document.querySelector(".close");
    close.addEventListener('click', () => {
      modal.remove();
    });
}