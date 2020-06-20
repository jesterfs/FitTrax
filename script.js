let spotifyToken;
let userId;
let tracks;
let date = new Date()



// Creates the search URL based on the value of the selected class
function fetchRecommended() {
  let tag = $('#classType').val() 
  let searchUrl = `https://api.spotify.com/v1/recommendations?${tag}`;
  return fetchSpotify(searchUrl);
}

// Fetches from the Spotify API using the appropriate URL
function fetchSpotify(searchUrl, options={}) {
  let bearer = 'Bearer ' + spotifyToken;
  return fetch(searchUrl ,  {
      ...options,
      headers: {
        'Authorization': bearer,
        'Content-Type': 'application/json'
      }
    }
  ).then(
    response => response.json()
  )
}



function getSpotifyToken() {
  // after logging in with spotify, this grabs the access token from the user's account
 let token = window.location.href.match(/\#(?:access_token)\=([\S\s]*?)\&/);
 
 if (token)
  return token[1];
}



function watchForm(){
  // waits for a submit and puts the fetch recommended function into action
  $('#js-form').submit(event => {
    event.preventDefault();
    // hides the tracks so they can be brought in with a fade
    $('#tracks').hide();

    fetchRecommended().then(
      r => {
        tracks = r.tracks;

        $('#tracks').html(
          // maps the track names abd artist from the JSON
          r.tracks.map(t => {
            const artists = t.artists.map(a => a.name).join(',');
            return `<li>${artists} - ${t.name}</li>`
          }).join('\n')
          
        )
        // brings tracks in with a fade of 1 second
        $('#tracks').show('fade', 1000);
      }
    )
    // removes the startHidden class from the playlist and create playlist button
    $('#playlist').removeClass('startHidden')
    $('#test').removeClass('startHidden');
    // re-enables the create playlist button, which is disabled once it is clicked for each playlist. (ie only matters if they have created a playlist and the want to create a new one with different songs)
    $("#test").attr("disabled", false); 
    
    
  });
 
}


function onLoad() {
  let playlistName = $( "#js-form option:selected" ).text();
  
  // gets the access token
  spotifyToken = getSpotifyToken();
  
  if (spotifyToken) {
    // if the spotify token exists, the main section is shown
    $('#main').removeClass('startHidden');

    // fetches the user id 
    fetchSpotify('https://api.spotify.com/v1/me').then(data => {
      userId = data.id;
      
    });
    

  } else {
    // if there is no token, the login with spotify screen shows
    $('#login').removeClass('startHidden');
  }
  watchForm();

// watches for the create playlist button
  $('#test').click(e => {
    e.preventDefault();
    // creates an empty playlist on user's spotify
    fetchSpotify(`https://api.spotify.com/v1/users/${userId}/playlists`, 
      {
        method: 'POST',
        body: JSON.stringify({
          name: `${playlistName} Playlist ${date}`,
          public: false
        })
      }).then(r => {
        const trackUris = tracks.map(t => t.uri).join(',');
        // adds songs to playlist
        return fetchSpotify(
          `https://api.spotify.com/v1/playlists/${r.id}/tracks?uris=${trackUris}`,
          {
            method: 'POST'
          })
      }).then(
        () => alert('Ready to feel the burn? Check Spotify for your new playlist!')
      )
     $("#test").attr("disabled", true); 
  })
  
}

$(onLoad);
