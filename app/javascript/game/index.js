import { Baba } from './baba';

$(function(){
    const roomname = $('#room').data('room')
    const user_id = $('#room').data('id')
    const baba = new Baba()

    $('#participate').on('click', (e)=>{
        e.preventDefault();
        baba.makeCall(roomname);
    })

    $('#game-start').on('click', (e)=>{
        e.preventDefault();
        baba.start(roomname);
    })

    $('header, footer').remove();

    baba.on('init', ()=>{
        let my = baba.getUserCards(baba.peer.id);
        let take = baba.getUserCards(baba.takeUser.id);

        appendCards('#my-cards', my);
        appendCards('#their-cards', take);
    })

    baba.on('choiced', ()=>{
        console.log(baba.choicedIndex+"番目のカードが選択されました。")
    })

    baba.on('take', ()=>{

    })

    baba.on('taken', ()=>{
        console.log(baba.choicedIndex+"番目のカードが取られました。");
        baba.choicedIndex = null;
        
    })

    baba.on('push', ()=>{

    })

    baba.on('throw', ()=>{

    })

    function appendCards(_selector, _cards = []){
        $(_selector).empty();
        for(let i=0; i<_cards.length; i++){
            let c = $(
                '<div class="card" data-index="'+i+'">'+
                '<p>'+_cards[i]._mark+_cards[i]._num+'</p>'+
                '</div>'
            );
            $(_selector).append(c);

            c.on('click', (e)=>{
                console.log(e.target);
                const index = e.target.dataset.index;
                console.log('index:', index);

                if(!baba.choiceIndex || baba.choiceIndex != index){
                    // 選択しているカードが無いとき
                    baba.choice(index);
                } else if(baba.choiceIndex == index){
                    baba.take(index);
                }
            })
        }
    }
    $("#face_start").on("click", (e)=>{
       baba.setStatus("turn");
       console.log("btn")
       let video = document.getElementById("my-video");
       baba.face_start(video);
   })

})


