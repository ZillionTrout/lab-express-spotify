require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));

app.get("/", (req, res, next) => {
    res.render("index");
});

app.get("/artist-search", (req, res, next) => {
    const { artist } = req.query;
    spotifyApi
    .searchArtists(`${artist}`)
    .then(data => {
    const apiSearchResponse = data.body.artists;
    res.render("artist-search-results", {artist, ...apiSearchResponse})    
    })
    .catch(err => console.log("The error while searching artists occurred: ", err));
});

app.get("/albums/:artistId", (req, res, next) => {
    const { artist } = req.query;
    const { artistId } = req.params;
    spotifyApi
        .getArtistAlbums(artistId)
        .then(data => {
            const response = data.body;
            res.render("albums", {artist, artistId, ...response});
        })
        .catch(err => console.log("An error while searching the album occured: ", err));
});

app.get("/albums/:artistId/tracks/:albumId", (req, res, next) => {
    const { artistId, albumId } = req.params;
    spotifyApi
        .getAlbumTracks(albumId)
        .then(data => {
            console.log("The recived tracks:", data.body.items);
        const tracksData = data.body.items
        res.render("tracks", {artistId, albumId, tracksData})
    }, function (err) {
        console.log("An error occured", err);
    });
});

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
