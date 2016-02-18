/**
 * Loads a song's metadata
 *
 * @param {String} docID - The ID of the doc whose metadata is to be loaded
 */
function loadSongData(docID) {
	/*var request = gapi.client.request({
		'path': '/drive/v2/files/' + docID,
		'method': 'GET',
		'params': {},
		'callback': loadSong
	});*/
	var request = gapi.client.drive.files.get({
		fileId: docID
	});
	request.execute(loadSong);
	// Temporary solution: open the Google Doc in a new window
//	window.open('https://docs.google.com/document/d/' + docID + '/edit', '_blank');
}

/**
 * Loads a song (doc)
 *
 * @param {Object} jsonResp The response parsed as JSON.  If the response is not JSON, this field will be false.
 * @param {Object} rawResp The HTTP response.
 */
function loadSong(jsonResp, rawResp) {
	if(jsonResp && jsonResp.exportLinks && jsonResp.exportLinks['text/plain']) {
		var accessToken = gapi.auth.getToken().access_token;
		var xhr = new XMLHttpRequest();
		//xhr.open('GET', jsonResp.exportLinks['text/plain']);
		xhr.open('GET', jsonResp.exportLinks['text/html']);
		xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
		xhr.onload = function() {
			displaySong(jsonResp.title, xhr.responseText);
		}
		xhr.send();
	}
}

/**
 * Displays a song in the karaoke interface
 */
function displaySong(title, text) {
	document.getElementById('upBtn').textContent = title;
	document.getElementById('lyrics').innerHTML = text;//.replace(/\n/g, '<br />');
	openLyricsView();
	scrollTo(0, 0);
}
