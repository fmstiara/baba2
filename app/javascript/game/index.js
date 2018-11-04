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
        appendCards('#their-cards', take, true);

        let members = baba.roomInfo['members']
        if(baba.peer.id == members[0]){
            baba.setStatus('myturn')
        } else {
            baba.setStatus('anyoneturn')
        }
    })

    baba.on('status-change', ()=>{
        console.log('current status: '+baba.status);
        if(baba.status == 'myturn'){
            // idがtakeUser.idと同じvideoを取得
            // let video = document.getElementById('')
            // baba.face_start()

        } else if(baba.status == 'anyoneturn'){

        } else if(baba.status == 'winner'){

        }
    })

    baba.on('choiced', ()=>{
        console.log(baba.choicedIndex+"番目のカードが選択されました。")
    })

    baba.on('take', (e)=>{
        let take = baba.getUserCards(baba.takeUser.id);
        appendCards('#their-cards', take, true);

        // e.detail にカードが入ってる
        let c = e.detail
        console.log('card', c);
        baba.getMatchIndex(c).then(res=>{
            if(res != null){
                // throuwCard実行
                baba.throwCard(res);
            } else {
                // pushCard実行
                baba.pushCard(c)
            }
        })
    })

    baba.on('change', (e)=>{
        let take = baba.getUserCards(baba.takeUser.id);
        appendCards('#their-cards', take, true);
    })

    baba.on('push', (e)=>{
        let my = baba.getUserCards(baba.peer.id);
        appendCards('#my-cards', my);
    })

    baba.on('throw', (e)=>{
        let my = baba.getUserCards(baba.peer.id);
        appendCards('#my-cards', my);
    })

    baba.on('taken', ()=>{
        baba.choicedIndex = null;
        let my = baba.getUserCards(baba.peer.id);
        appendCards('#my-cards', my);
        baba.setStatus('myturn');
    })

    baba.on('win', ()=>{
        console.log('あなたの勝ちです');
        $('#my-cards').hide();
        $('#their-cards').hide();
        baba.setStatus('end');
    })

    baba.on('anyone-win', (e)=>{
        console.log(e.detail+"さんが勝ちました");
        let take = baba.getUserCards(baba.takeUser.id);
        appendCards('#their-cards', take, true);
    })

    function appendCards(_selector, _cards = [], addEvent = false){
        $(_selector).empty();
        for(let i=0; i<_cards.length; i++){
            let c = $(
                '<div class="card card_wrapper '+_cards[i].mark+'" data-index="'+i+'">'+
                    '<p'+' data-index="'+i+'">' +_cards[i].num+'</p>'+
                '</div>'
            );
            $(_selector).append(c);

            if(addEvent){
                c.on('click', (e)=>{
                    if(baba.status == "myturn"){
                        const index = e.target.dataset.index;
                        if(!baba.choiceIndex || baba.choiceIndex != index){
                            // 選択しているカードが無いとき
                            baba.choice(index);
                        } else if(baba.choiceIndex == index){
                            baba.take(index);
                        }
                    } else {
                        console.log("あなたの出番じゃありません");
                    }
                })
            }
        }
    }



    $("#face_start").on("click", (e)=>{
       baba.setStatus("turn");
       console.log("btn")
       let video = document.getElementById("my-video");
       baba.face_start(video);
   })

})


