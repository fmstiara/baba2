export function send_face(_target_video){
    let canvas = document.createElement('canvas');
    let video = _target_video;
    canvas.getContext("2d").drawImage(video, 0, 0, 480, 270);//この行でスクリーンショットを取っている

    let data = canvas.toDataURL('image/jpeg');
    fetch(data).then(res => res.blob())
        .then(blobData => {
            console.log(blobData)
            let params = {
                "returnFaceId": "false",
                "returnFaceLandmarks": "false",
                "returnFaceAttributes":"emotion"
            };
            $.ajax({
                url: "https://japaneast.api.cognitive.microsoft.com/face/v1.0/detect"+ "?" + $.param(params),
                contentType: "application/octet-stream",
                headers: {
                'Ocp-Apim-Subscription-Key': ""
                },
                type: "POST",
                processData: false,
                data: blobData
            })
            .done(function(data) {
                // Show formatted JSON on webpage.
                console.log("get")
                console.log(data[0]["faceAttributes"]["emotion"])//ここで感情を取得できた

                // ここで_target_videoのボーダカラーチェンジ
            })
            .fail(function(err) {
                console.error(err);
            })
        });
}

