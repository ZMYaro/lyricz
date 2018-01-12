/**
 * Loads a song's metadata
 *
 * @param {String} docID - The ID of the doc whose metadata is to be loaded
 */
function loadSongData(docID) {
	gapi.client.drive.files.get({
		fileId: docID
	}).then(loadSong);
	
	// Temporary solution: open the Google Doc in a new window
	//window.open('https://docs.google.com/document/d/' + docID + '/edit', '_blank');
}

/**
 * Loads a song (doc)
 *
 * @param {Object} res - The response from the file data request
 */
function loadSong(res) {
	if (!res.result || !res.result.exportLinks) {
		return;
	}
	
	gapi.client.drive.files.export({
		fileId: res.result.id,
		mimeType: 'text/html'
	}).then(function (exportRes) {
		displaySong(res.result.title, exportRes.body);
	});
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
