const BrowserWindow = require('electron').remote.BrowserWindow;
const ipc = require('electron').ipcRenderer;
const ejs = require('ejs');

const path = require('path');
const url = require('url');

window.$ = window.jQuery = require('jquery');
document.body.style.overflow = 'hidden';

$(()=>{
    console.log("view.js run");
    
    const $screen = $('#Screen');
    var log = [];
    var promise = new Promise((res,rej)=>{res();}).catch((e)=>{console.log(e);});

    // Tweetコンテンツをログに追加
    var addTweet = function(tweet){
        let height = 0;
        let imgheight = 0;
        let imgwidth = 0;
        let maximgheight = 0;
        const maxsize = {w:200, h:200};

        if ( tweet.retweeted_status ){tweet = tweet.retweeted_status; }; // リツイート

        // icon, name, text, images
        var {user:{profile_image_url_https:icon}, user:{name}, text, extended_entities:images} = tweet;
        if ( images ) { // textから画像urlの削除,画像の高さからコンテンツの高さを計算
            maximgheight = 0;
            height = 0;
            images.media.forEach((m) => {
                text = text.replace(m.url, "");
                let size = resizeImg(m.sizes.large, maxsize);
                if ( imgwidth + (wid = size.w) > 450 ) {
                    imgwidth = 0;
                    height += maximgheight;
                    maximgheight = 0;
                }
                if ( maximgheight < size.h ) {
                    maximgheight = size.h;
                }
                imgwidth += wid;
            });
            height += maximgheight;
        }

        text = text.replace(/\n/g, '<br>');
        
        console.log(icon, name, text, images);

        // ejs
        var tweetElement = `
            <%  
                let med = ""; 
                if ( images ) { images.media.forEach((m)=>{
                    med += "<img id='Image' src="+m.media_url_https+">";
                })}
            %>
            <div id="Tweet">
                <img id="Icon" src="<%- icon %>">
                <div id="Name"><%= name %></div>
                <div id="Content">
                    <div id="text"><%- text %></div>
                    <%- med %>
                </div>
            </div>`;
        let divTweet = $(ejs.render(tweetElement, {
            images,
            text,
            name,
            icon
        }));
        
        $screen.append(divTweet);
        log.unshift(divTweet);
        let divContent = divTweet.find('#text');
        
        if ( tweet.quoted_status ); // 引用リツイート
        
        setTimeout(()=>{
            height += divContent.height() + divContent.position().top + 16;
            height = Math.max(30, height)
            divTweet.height(height);
            divTweet.addClass('TweetMove');
            logShift(height);
        }, 10)
    }

    // ツイートコンテンツ要素の消去
    var deleteTweet = function(v){
        // log[log.length-1].remove();
        v.remove();
        log.pop();
    }

    // ツイートコンテンツが追加された際の位置のずらし
    var logShift = function(height){
        log.forEach(function(v,i){
            if ( v.offset().top + v.height() < 0 ) {
                deleteTweet(v);
            } else {
                if ( i == 0 ) {
                    v.css('bottom', '5px');
                } else {
                    v.css('bottom', '+='+(height+2)+'px');
                }
            }
        })
    }

    // 画像のサイズによる画像の高さ及び幅の取得(もとのサイズ, 最大サイズ)
    // サイズ {幅:w, 高さ:h}
    var resizeImg = function(size, maxsize){
        let s = {w:size.w, h:size.h};
        if ( size.w < size.h ) {
            if ( size.h > maxsize.h ) {
                s.w = size.w*(maxsize.h/size.h);
                s.h = maxsize.h;
            }
        } else {
            if ( size.w > maxsize.w ) {
                s.h = size.h*(maxsize.w/size.w);
                s.w = maxsize.w;
            }
        }
        return s;
    }

    // stream通信を行うレンダラプロセスの生成
    var CreateInvRenderer = function(){
        const windowID = Number( window.location.hash.replace('#', ''));
        let win = new BrowserWindow({
            width: 500,
            height: 500,
            show: false
        });
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'invisible.html'),
            protocol: 'file:',
            slashes: true
        }));
        win.webContents.on('did-finish-load', function(){
            win.webContents.send('message', windowID);
        })
    }

    // Tweetの取得
    var AsyncMessage = function() {
        CreateInvRenderer();
        ipc.on('reply', (event, tweet) => {
            // console.log(tweet);
            promise = promise.then(()=>{
                return new Promise((resolve,reject)=>{
                    addTweet(tweet);
                    setTimeout(()=>{
                        resolve();
                    },500)
                })
            })
        })
    }

    AsyncMessage();
})
