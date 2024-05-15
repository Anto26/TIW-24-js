const userAlbumsDiv = document.querySelector('#user-albums');
const othersAlbumsDiv = document.querySelector('#others-albums');
const usernameHeader = document.querySelector('#username');
var username = "";
var albums;
const errorPopup = document.querySelector('#error-popup');
const errorMessage = document.querySelector('#error-message');

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