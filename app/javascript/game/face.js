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
                'Ocp-Apim-Subscription-Key': ""
                },
                type: "POST",
                processData: false,
                data: blobData
            })
            .done(function(data) {
                // Show formatted JSON on webpage.
                console.log("get")
                console.log(data)
                console.log(data[0]["faceAttributes"]["emotion"]["neutral"])
                console.log(data[0]["faceAttributes"]["emotion"])//ここで感情を取得できた
                if (data[0]["faceAttributes"]["emotion"]["neutral"] < 0.9){
                    // #焦っている
                    $(".my-video-con").css("border", "none");
                    $(".my-video-con").addClass("flash_red");
                    console.log("cheage")
                } else {
                    $(".my-video-con").removeClass("flash_red");
                    $(".my-video-con").css("border", "10px solid blue");
                }
                // ここで_target_videoのボーダカラーチェンジ
            })
            .fail(function(err) {
                console.error(err);
            })
        });
}

