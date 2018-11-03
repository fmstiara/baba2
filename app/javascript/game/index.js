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

    $('header').remove();
})