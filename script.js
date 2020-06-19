let spotifyToken;
let userId;
let tracks;
let date = new Date()




function fetchRecommended() {
  let tag = $('#classType').val() 
  let searchUrl = `https://api.spotify.com/v1/recommendations?${tag}`;
  return fetchSpotify(searchUrl);
}

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

function displayResults(responseJson){
  console.log(responseJson);
}

function getSpotifyToken() {
 let token = window.location.href.match(/\#(?:access_token)\=([\S\s]*?)\&/);
 
 if (token)
  return token[1];
}



function watchForm(){
  
  $('#js-form').submit(event => {
    event.preventDefault();
    $('#tracks').hide();

    fetchRecommended().then(
      r => {
        tracks = r.tracks;

        $('#tracks').html(
          
          r.tracks.map(t => {
            const artists = t.artists.map(a => a.name).join(',');
            return `<li>${artists} - ${t.name}</li>`
          }).join('\n')
          
        )
        $('#tracks').show('fade', 1000);
      }
    )
    $('#playlist').removeClass('startHidden')
    $('#test').removeClass('startHidden');
    $("#test").attr("disabled", false); 
    
    
  });
 
}


function onLoad() {
  let playlistName = $( "#js-form option:selected" ).text();
  
  spotifyToken = getSpotifyToken();
  console.log(spotifyToken);
  if (spotifyToken) {
    $('#main').removeClass('startHidden');

    fetchSpotify('https://api.spotify.com/v1/me').then(data => {
      userId = data.id;
      console.log(userId, 'got user id');
    });
    

  } else {
    
    $('#login').removeClass('startHidden');
  }
  watchForm();


  $('#test').click(e => {
    e.preventDefault();
    
    fetchSpotify(`https://api.spotify.com/v1/users/${userId}/playlists`, 
      {
        method: 'POST',
        body: JSON.stringify({
          name: `${playlistName} Playlist ${date}`,
          public: false
        })
      }).then(r => {
        const trackUris = tracks.map(t => t.uri).join(',');

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