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

// Reorder modal elements
var dragged;

// Make initial request to get information for home page
asyncXHR(getMeUrl, () => {},
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

function escape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

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

// === Home page functions

function refreshAlbums() {
	userAlbumsDiv.innerHTML = "";
	othersAlbumsDiv.innerHTML = "";
	asyncXHR(getAlbumsUrl, () => {},
		(response) => {
			if (response.ok) {
				albums = response.result;
				populateAlbums(albums);
			} else {
				displayError(response.result);
			}
		}
	);
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
            <img class="album-thumbnail" src="images/${escape(album.thumbnail.file_path)}" />
          </div>
          <div class="card-information">
            <p class="card-title">${escape(album.title)}</p>
            <p class="card-author">by: ${escape(album.creator.username)}</p>
            <p class="card-date">${escape(album.creation_date)}</p>
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
		if (album.creator.username == username)
			container = userAlbumsDiv;
		else
			container = othersAlbumsDiv;
		container.appendChild(card);
	});
}


// === Create Album page functions

function refreshImages() {
	photoList.innerHTML = '';
	asyncXHR(getUserImagesUrl, () => {}, 
		(response) => {
			if (response.ok) {
				// Populate images
				images = response.result;
				populateImages(images);
			}
		}
	);
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
            <input id="${escape(image.id)}" name="${escape(image.id)}" type="checkbox" name="checkbox" class="checkbox">
            <img src="images/${escape(image.file_path)}" class="checkbox-image" />
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
			if (response.ok)
				refreshImages();
			else
				displayError(response.result);
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
			if (response.ok)
				showHomePage();
			else
				displayError(response.result);
		});
}



// === Album page functions

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
	document.getElementById("album-page-title").innerText = album.title;
	document.getElementById("album-page-author").innerText = album.creator.username + " - " + album.creation_date;
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
				<p class="image-title">${escape(image.title)}</p>
				<div>
					<img src="images/${escape(image.file_path)}" class="image-thumbnail"/>
				</div>
	        `;
			thumbnail = photo.querySelector(".image-thumbnail");
			thumbnail.addEventListener("mouseover", () => { showImgModal(image); });
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

// === Image Page

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
					<h1 style="margin-bottom: 0px">${escape(img.title)}</h1>
					<p>${escape(img.description)}</p>
					<p style="margin-top: 2px;">Created by ${escape(img.uploader.username)} on ${escape(img.date)}</p>
					<button class="button destructive-button delete-button" style="display:none;"> Delete</button>
					<div style="overflow-x: scroll; overflow-y: scroll">
						<img src="images/${escape(img.file_path)}">
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
	if (img.uploader.username == username) {
		const button = modal.querySelector('.delete-button');
		button.addEventListener("click", () => {deleteImage(img.id); modal.remove();});
		button.setAttribute("style", "");
	}
	// Show modal in body
	document.querySelector('body').appendChild(modal);

	// Add comments to modal
	const commentContainer = document.querySelector('#comments-container');
	img.comments.forEach(comment => {
		const commentObj = document.createElement('div');
		commentObj.classList = 'comment'
		commentObj.innerHTML = `
			<p class="comment-author">${escape(comment.author.username)}</p>
			<p class="comment-text">${escape(comment.content)}</p>`;

		commentContainer.appendChild(commentObj);
	});

	// Listen for send comment interaction
	const sendComment = document.querySelector('#send-comment');
	const textComment = document.querySelector('#text-comment');
	sendComment.addEventListener('click', () => {
		if (textComment.value.length > 4096) {
			displayError('The comment is too long');
		} else if (textComment.value === '') {
			displayError('The comment cannot be empty')
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
							<p class="comment-author">${escape(username)}</p>
							<p class="comment-text">${escape(textComment.value)}</p>`;
						commentContainer.appendChild(commentObj);
						// Add comment to local image object
						img.comments.push({
							id: "",
							content: textComment.value,
							author: {
								id: "",
								username: username
							}
						});
						textComment.value = "";
						displayFine("Comment added");
					} else {
						displayError(response.result);
					}
				}
			);
		}
	});

	// Close modal when it is clicked out of the modal
	document.querySelector("#img-modal").addEventListener("click", (e) => {
		if (e.target == document.querySelector("#img-modal"))
			modal.remove();
		else
			e.stopPropagation();
	});

	// Close modal when span with 'X' icon clicked
	const close = document.querySelector(".close");
	close.addEventListener('click', () => {
		modal.remove();
	});
}

function deleteImage(imgId) {
	asyncXHR(deleteImageUrl,
		(url) => {
			url.searchParams.append("imgId", imgId);
		},
		(response) => {
			if (response.ok) {
				refreshAlbumPage(currentAlbum.id);
				displayFine("Image deleted");
				modal.remove();
			} else {
				dipslayError(response.result);
			}
		}
	);
}

// === Reorder page

function swapNodes(node1, node2) {
	const parent1 = node1.parentNode;
	const parent2 = node2.parentNode;
    parent1.appendChild(node2);
  	parent2.appendChild(node1);
}

function saveOrder() {
	asyncXHR(addOrderUrl,
		(url) => {
			url.searchParams.append("albumId", currentAlbum.id);
			
			const imageTable = document.querySelector('#image-table');
			let priority = 0;
	
			// For each row in the images table
			for (var i = imageTable.children.length-1; i >= 0; i--) {
				let row = imageTable.children[i];
				
				// For each cell in the current row
				for (var j = row.children.length-1; j >= 0; j--) {
					let imageCell = row.children[j].children[0];
					url.searchParams.append(imageCell.id, priority);
					
					priority++;
				}
			}
		},
		(response) => {
			if (response.ok) {
				displayFine("Order saved");
				populateAlbumImages(response.result.images);
				
			} else {
				displayError(response.result);
			}
		}
	);
}

function showReorderModal() {
	// Create the modal
	const modal = document.createElement('div');
	modal.innerHTML = `
    	<div id="reorder-modal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
        		<span class="close">&times;</span>
        		<div>
					<table>
						<tbody id="image-table">
							<tr id="image-container-0"></tr>
						</tbody>
					</table>
					<div class="centerdiv">
						<button type="button" class="button accent-button" id="reorder-btn" onclick="saveOrder();">Save</button>
					</div>
            	</div>
            </div>
        </div>`;

	// Show modal in body
	document.querySelector('body').appendChild(modal);

	// Add images to modal as cells in a table
	const imageTable = document.querySelector('#image-table');
	let rowCount = 0;
	let cellCount = 0;
	albumImages.forEach(img => {
		if (cellCount === 5) {
			cellCount = 0;
			rowCount++;

			const trObj = document.createElement('tr');
			trObj.id = 'image-container-' + rowCount;

			imageTable.appendChild(trObj);
		}

		const imgObj = document.createElement('td');
		imgObj.innerHTML = `
			<div class="image-cell dropzone droptarget draggable" draggable="true" id="${escape(img.id)}">
				<p class="image-title">${escape(img.title)}</p>
				<img src="images/${escape(img.file_path)}" class="image-thumbnail" />
			</div>`;

		document.querySelector('#image-container-' + rowCount).appendChild(imgObj);

		cellCount++;
	});

	const draggables = document.querySelectorAll('.draggable');
	draggables.forEach(draggable => {
		draggable.addEventListener("dragstart", (event) => {
			dragged = event.target.closest('div');
		});
	});

	const dropTargets = document.querySelectorAll('.droptarget');
	dropTargets.forEach(dropTarget => {
		dropTarget.addEventListener("dragenter", (event) => {
			event.preventDefault();
		});
		dropTarget.addEventListener("dragleave", (event) => {
			event.preventDefault();
		});
		dropTarget.addEventListener("dragover", (event) => {
			event.preventDefault();
		});

		// Reorder images on drop
		dropTarget.addEventListener("drop", (event) => {
			event.preventDefault();
			
			if(event.target.closest('div') !== dragged)
				swapNodes(event.target.closest('div'), dragged);
		});
	});


	// Close modal when it is clicked out of the modal
	document.querySelector("#reorder-modal").addEventListener("click", (e) => {
		if (e.target == document.querySelector("#reorder-modal"))
			modal.remove();
		else
			e.stopPropagation();
	});

	// Close modal when span with 'X' icon clicked
	const close = document.querySelector(".close");
	close.addEventListener('click', () => {
		modal.remove();
	});
}