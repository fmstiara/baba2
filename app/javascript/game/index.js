import { Baba } from './baba';

$(function(){
    const roomname = $('#room').data('room')
    const baba = new Baba(roomname)

    $('#participate').on('click', (e)=>{
        e.preventDefault();
        baba.makeCall(roomname);
    })

    $('#game-start').on('click', (e)=>{
        e.preventDefault();
        baba.start(roomname);
    })

    baba.on('init', function(e){
        console.log('game initするぜ!!')
        console.log(e);
    })

    $('#id').on('click', (e)=>{
        baba.setStatus('turn');
        let video = document.getElementById('id');
        baba.face_start(video);
    })

    $('header, footer').remove();
})


