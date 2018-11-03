import { Baba } from './baba';

$(function(){
    const roomname = $('#room').data('room')
    const user_id = $('#room').data('id')
    const baba = new Baba(user_id, roomname)

    $('#participate').on('click', (e)=>{
        e.preventDefault();
        baba.makeCall(roomname);
    })

    $('#game-start').on('click', (e)=>{
        e.preventDefault();
        baba.start(roomname);
    })

    $('header, footer').remove();

    $("#face_start").on("click", (e)=>{
       baba.setStatus("turn");
       console.log("btn")
       let video = document.getElementById("my-video");
       baba.face_start(video);
   })

})
