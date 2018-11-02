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

    // let e = document.createEvent('Event');
    // e.initEvent(eventName, true,true);
    // _DOM.addEventListener('test' , function(){

    // })
    
})