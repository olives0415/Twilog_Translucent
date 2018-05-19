# Twilog_Translucent

ストリーミングAPIがお無くなりになるそうなので供養です。

一応アクセストークンを```token.js```って名前で下記の形式にしてディレクトリに置いておけば動いたりするかもしれません。

```token.js
const Twitter = require('twitter');
const client = new Twitter({
    consumer_key: ~~~,
    consumer_secret: ~~~,
    access_token_key: ~~~,
    access_token_secret: ~~~
});
```

