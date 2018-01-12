var CLIENT_ID = '68982240764.apps.googleusercontent.com',
	API_KEY = 'AIzaSyCdRTdFjiJr2-dz55pLOfml3DOQJNbJL14',
	SCOPES = 'https://www.googleapis.com/auth/drive',

	FOLDER_MIME_TYPE = "application/vnd.google-apps.folder",
	DOC_MIME_TYPE = "application/vnd.google-apps.document",
	LYRICS_FOLDER_ID = "0B15evpzcAcI3ZTRiZTYzMTAtYzVhNS00ZGQ0LWI3YTQtYWNkNDI4ZmM5NmQ1";

var songList,
	unloadedFolders = [],
	listLoaded = false;

/**
 * Called when the client library is loaded to start the auth flow.
 */
function handleClientLoad() {
	gapi.load('client:auth2', checkAuth);
}

/**
 * Check if the current user has authorized the application.
 */
async function checkAuth() {
	gapi.client.init({
		apiKey: API_KEY,
		clientId: CLIENT_ID,
		scope: SCOPES
	}).then(function () {
		gapi.auth2.getAuthInstance().isSignedIn.listen(handleAuthResult);
		
		handleAuthResult(gapi.auth2.getAuthInstance().isSignedIn.get());
	});
}

/**
 * Called when authorization server replies.
 *
 * @param {Boolean} isSignedIn - Whether the user is signed in
 */
function handleAuthResult(isSignedIn) {
	document.getElementById('authorizeView').style.display = 'none';
	if (isSignedIn) {
		// Access token has been successfully retrieved, requests can be sent to the API
		gapi.client.load('drive', 'v2', function() {
			// The page should be loaded by now; set songList.
			songList = document.getElementById('songList');
			// Make sure the list container is visible.
			followHash();
			if (!listLoaded) {
				loadFolderContents();
			}
		});
	} else {
		// No access token could be retrieved, show the button to start the authorization flow.
		openAuthView();
	}
}

/**
 * Request the list of songs.
 */
function loadFolderContents(parentFolderID) {
	if(!parentFolderID) {
		parentFolderID = LYRICS_FOLDER_ID;
	}
	unloadedFolders.push(parentFolderID);
	
	gapi.client.drive.files.list({
		pageSize: 1000,
		'q': '\'' + parentFolderID + '\' in parents'
	}).then(insertSongs);
}

/**
 * Insert the songs into the list.
 *
 * @param {Object} res - The response from the folder list request
 */
function insertSongs(res) {
	// Parse the parent folder's ID from the request URL.
	var parentFolderID = /q='([0-9A-Za-z]+)'/.exec(res.result.selfLink)[1];
	// Get the returned list of items
	var items = res.result.items;
	items.sort(compareItems);
	
	// If this is the content of a lyrics subfolder...
	if(parentFolderID !== LYRICS_FOLDER_ID) {
		// Reverse the array (because each item will be added just after the folder's item),
		items.reverse();
		// Save a reference to the parent folder's <option>,
		var parentFolderItem = songList.querySelector('li[id=\"' + parentFolderID + '\"]');
		// And insert a space that will end up after the folder's contents.
		var emptyItem = document.createElement('li');
		parentFolderItem.insertAdjacentElement('afterend', emptyItem);
	}
	
	for(var i = 0; i < items.length; i++) {
		var newItem = document.createElement('li');
		if (items[i].mimeType === FOLDER_MIME_TYPE) {
			newItem.id = items[i].id;
			newItem.textContent = items[i].title;
			newItem.innerHTML = '<img src=\"images/folder.png\" alt=\"&#x1f4c2;\" />' + newItem.innerHTML;
		} else {
			var newItemBtn = document.createElement('a');
			newItemBtn.setAttribute('role', 'button');
			newItemBtn.href = '#' + items[i].id;
			newItemBtn.textContent = items[i].title;
			newItem.appendChild(newItemBtn);
		}
		
		if(parentFolderID === LYRICS_FOLDER_ID) {
			songList.appendChild(newItem);
		} else {
			parentFolderItem.insertAdjacentElement('afterend', newItem);
		}
		
		if(items[i].mimeType === FOLDER_MIME_TYPE) {
			loadFolderContents(items[i].id);
		}
	}
	
	unloadedFolders.splice(unloadedFolders.indexOf(parentFolderID), 1);
	if(unloadedFolders.length === 0) {
		listLoaded = true;
		makeSearchable();
	}
}

/**
 * Compares items in a Google Drive files.list response for sorting
 *
 * @param {Object} a - The first of two items to be compared
 * @param {Object} b - The second of two items to be compared
 */
function compareItems(a, b) {
	// Folders come before docs.
	if(a.mimeType === FOLDER_MIME_TYPE && b.mimeType === DOC_MIME_TYPE) {
		return -1;
	} else if(a.mimeType === DOC_MIME_TYPE && b.mimeType === FOLDER_MIME_TYPE) {
		return 1;
	}
	// Within each category, sort alphabetically.
	if(a.title.toUpperCase() < b.title.toUpperCase()) {
		return -1;
	} else if(a.title.toUpperCase() > b.title.toUpperCase()) {
		return 1;
	}
	// If they are equal (which should not happen)...
	return 0;
}

/**
 * Make the song list searchable.
 */
function makeSearchable() {
	var songSearchBox = document.getElementById('songSearchBox');
	
	songSearchBox.addEventListener('input', function (e) {
		var query = e.target.value.toLowerCase();
		query = query.replace(/  /g, ''); // Remove extra spaces.
		query = query.trim(); // Remove trailing whitespace.
		query = query.split(' '); // Split terms.
		var listItems = songList.getElementsByTagName('li');
		var i, j, foundIt;
		for (i = 0; i < listItems.length; i++) {
			foundIt = true;
			for (j = 0; j < query.length; j++) {
				if (query !== '' && listItems[i].textContent.toLowerCase().indexOf(query[j]) === -1) {
					foundIt = false;
					break;
				}
			}
			if (foundIt) {
				listItems[i].style.display = 'block';
				listItems[i].style.display = 'list-item';
			} else {
				listItems[i].style.display = 'none';
			}
		}
	}, false);
	
	songSearchBox.disabled = false;
}
