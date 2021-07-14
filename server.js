const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const app = express();
const fs = require('fs')
const path = require('path')
const axios = require('axios');
const { resolve } = require('path');

//Spotify API

var client_id = '9dbec10c80d2433781f6464521773ecf';
var client_secret = 'acbd9cac11204b9eae93d3f68b441e4a';
var redirect_uri = 'REDIRECT_URI'; 
authURL = 'https://accounts.spotify.com/api/token'


app.use(cors());
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server Works On Port: ${PORT}`);
})

app.get('/download', async function(req,res){
    var URL = req.query.URL
    var FORMAT = req.query.FORMAT
    var SONG = req.query.SONG
    var KEY = req.query.KEY
    var BPM = req.query.BPM
    console.log(FORMAT);
    res.header('Content-Disposition', `attachment; filename="${SONG}_${KEY}_${BPM}.${FORMAT}"`);
    ytdl(URL,  { filter: (FORMAT == 'mp4' ? format => format.container === 'mp4' : 'audioonly') } ).pipe(res)
    DownloadHistory(URL)
});
app.get('/track_features', async function(req, res){
    var song = req.query.SONG
    token = await getAccessToken()
    songi = await getSongByName(token, song)
    if(songi.tracks.items[0]!=undefined){
        var features = await getSongFeatures(token,songi.tracks.items[0].id)
    }else features = await tryAgain(token,song)
    res.send(features)
})

function DownloadHistory(URL)
{
    //fs.appendFileSync('record.txt',URL + " At: " + new Date().toString().replace(/T/, ':').replace(/\.\w*/, '') + "\n");
}
function getAccessToken()
{
    return p = new Promise(function (resolve, reject){
        axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),        
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: {
              grant_type: 'client_credentials'
            },
            json: true,
        })
        .then(body => {
            resolve(body.data.access_token);
        })
        .catch(e => {
            console.log(e.response.data);
            reject(e.response.data);
        });
    })
}
function getSongFeatures(token, songID){
    return p = new Promise(function (resolve, reject){
        axios({
            method: 'get',
            url: `https://api.spotify.com/v1/audio-features/${songID}`,
            headers: {
                'Authorization': "Bearer " + token 
            },
            json: true,
        })
        .then(body => {
            resolve(body.data);
        })
        .catch(e => {
            console.log(e.response.data);
            reject(e.response.data);
        });
    })
}
function getSongByName(token, songName)
{
    return p = new Promise(function (resolve, reject){
        axios({
            method: 'get',
            url: `https://api.spotify.com/v1/search?q=${songName}&type=track`,
            headers: {
                'Authorization': "Bearer " + token 
            },
            json: true,
        })
        .then(body => {
            resolve(body.data);
        })
        .catch(e => {
            console.log(e.response.data + 'getSongName: ');
            reject(e.response.data);
        });
    })
}

async function tryAgain(key, stringlist) {
    return p = new Promise(async function(resolve, reject){
        while (stringlist.length > 0)
        {
            let stringlista = stringlist.split(' ')
            stringlista.pop()
            stringlist = stringlista.join(' ')
            songid = await getSongByName(token, stringlist)
            if(songid.tracks.items[0] != undefined || songid.tracks.items[0] != null){
                    getSongFeatures(token,songid.tracks.items[0].id).then((features)=>{
                    features['name'] = token,songid.tracks.items[0].name
                    resolve(features)
                    stringlist = ''
                })
            }
        }
        reject('sadge')
    })
}
