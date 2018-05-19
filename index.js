// アプリケーション作成用のモジュールを読み込み
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
  
const path = require('path');
const url = require('url');

const ipc = electron.ipcMain;
var client = require('./token');
const Twitter = require('twitter');
  
// メインウィンドウ
let mainWindow;
  
function createWindow () {
    var Screen = electron.screen;
    var size = Screen.getPrimaryDisplay().size; // ディスプレイのサイズを取得する
    // メインウィンドウを作成します
    mainWindow = new BrowserWindow({
        left: 0,
        top: 0,
        transparent: true,
        width: size.width,
        height: size.height,
        frame: false,
        show: true,
        resizable: false
    });

    mainWindow.setAlwaysOnTop(true);

    mainWindow.setIgnoreMouseEvents(true);
  
    // メインウィンドウに表示するURLを指定します
    // （今回はmain.jsと同じディレクトリのindex.html）
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
        hash: '#'+mainWindow.id
    }));
  
    // デベロッパーツールの起動
    mainWindow.webContents.openDevTools();
  
    // メインウィンドウが閉じられたときの処理
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
  
//  初期化が完了した時の処理
app.on('ready', createWindow);
  
// 全てのウィンドウが閉じたときの処理
app.on('window-all-closed', function () {
    // macOSのとき以外はアプリケーションを終了させます
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
// アプリケーションがアクティブになった時の処理(Macだと、Dockがクリックされた時）
app.on('activate', function () {
    /// メインウィンドウが消えている場合は再度メインウィンドウを作成する
    if (mainWindow === null) {
        createWindow();
    }
});

function OnMouseWindow() {
    mainWindow.setIgnoreMouseEvents(false);
}
