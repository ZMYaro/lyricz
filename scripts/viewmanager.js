function openListView() {
	document.getElementById('authorizeView').style.display = 'none';
	document.getElementById('lyricsView').style.display = 'none';
	document.getElementById('listView').style.display = 'block';
}

function openLyricsView() {
	document.getElementById('authorizeView').style.display = 'none';
	document.getElementById('listView').style.display = 'none';
	document.getElementById('lyricsView').style.display = 'block';
}

function openAuthView() {
	document.getElementById('authorizeButton').onclick = function() {
		gapi.auth2.getAuthInstance().signIn();
	};
	document.getElementById('listView').style.display = 'none';
	document.getElementById('lyricsView').style.display = 'none';
	document.getElementById('authorizeView').style.display = 'block';
}

function followHash () {
	if (location.hash.length < 2) {
		openListView();
	} else if (location.hash === '#settings') {
		openAuthView();
	} else {
		loadSongData(location.hash.substring(1));
	}
}

window.addEventListener('hashchange', followHash);
