export function send_face(_target_video){
    var canvas = document.getElementById("canvas");
    canvas.width = _target_video.videoWidth;
    canvas.height = _target_video.videoHeight;

    let video = _target_video;
    // console.log(video)
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);//この行でスクリーンショットを取っている
    // console.log(canvas)
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
                'Ocp-Apim-Subscription-Key': "7c3dd7bfc9cf4bc08acb56ff8281aa49"
                },
                type: "POST",
                processData: false,
                data: blobData
            })
            .done(function(data) {
                // Show formatted JSON on webpage.
                if (data != false){
                    if (data[0]["faceAttributes"]["emotion"]["neutral"] < 0.9){
                        // #焦っている
                        $(".targetVideo").css("border", "none");
                        $(".targetVideo").addClass("flash_red");
                        console.log("change")
                    } else {
                        $(".targetVideo").removeClass("flash_red");
                        $(".targetVideo").css("border", "10px solid blue");
                        console.log('normal')
                    }
                }
                    // ここで_target_videoのボーダカラーチェンジ
            })
            .fail(function(err) {
                console.error(err);
            })
        });
}

