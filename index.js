const tf = require('@tensorflow/tfjs-node');
const nsfw = require('nsfwjs');

const express = require('express');
const app = express();
// const fs = require("fs");

const port = 3000;
const nsfwLoad = nsfw.load();

function catchE(res, e) {
    res.end(JSON.stringify({
        'code': -1,
        'msg': e.message,
        'data': {}
    }));
};

app.post('/nsfw', (req, res) => {
    try {
        let data = [];
        req.on("data", (chunk) => {
            try {
                data.push(chunk);
            } catch (e) {
                catchE(res, e);
            };
        });
        req.on("end", () => {
            try {
                let buffer = Buffer.concat(data);
                // 保存图片
                // fs.writeFile("./image.jpg", buffer, (err) => {
                //     if (!err) {
                //         res.end("ok");
                //     };
                // });
                const image = tf.node.decodeImage(buffer);
                nsfwLoad.then((model) => {
                    model.classify(image).then((predictions) => {
                        let data = {};
                        for (i of predictions) {
                            data[i['className']] = Math.trunc(i['probability'] * 10000) / 100;
                        };
                        res.end(JSON.stringify({
                            'code': 0,
                            'msg': '',
                            'data': data
                        }));
                    });
                });
            } catch (e) {
                catchE(res, e);
            };
        });
    } catch (e) {
        catchE(res, e);
    };
});

app.listen(port, () => {
    console.log("server run at ", port);
});