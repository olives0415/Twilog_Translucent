const ipc = require('electron').ipcRenderer;
const BrowserWindow = require('electron').remote.BrowserWindow;

var client = require('./token');
const Twitter = require('twitter');

ipc.on('message',function(e,id){
    const fromWindow = BrowserWindow.fromId(id);
    const params = {count: 20};
    (()=>{
        client.get('statuses/home_timeline', params, function(error, tweets, response){
            if (!error) {                
                tweets.reverse().forEach((e) => {
                    fromWindow.webContents.send('reply',e);
                });
            }
        })
        client.stream('user', function(stream){
            stream.on('data', function(tweet){
                fromWindow.webContents.send('reply', tweet);
            })
            stream.on('error', function(e) {
                console.log(e);
            })
        })
    })();
})
