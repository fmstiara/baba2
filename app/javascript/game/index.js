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

        $('#v-'+baba.takeUser.id).addClass('targetVideo');

        let members = baba.roomInfo['members']
        if(baba.peer.id == members[0]){
            baba.setStatus('myturn')
        } else {
            baba.setStatus('anyoneturn')
        }
    })

    baba.on('status-change', ()=>{
        let s = $('#my-status');
        console.log('current status: '+baba.status);
        if(baba.status == 'myturn'){
            // idがtakeUser.idと同じvideoを取得
            let video = document.getElementById('v-'+baba.takeUser.id);
            baba.face_start(video)
            s.text('あなたの番です!');
        } else if(baba.status == 'anyoneturn'){
            s.text('他人の番です');
        } else if(baba.status == 'winner'){
            s.text(baba.rank+"位です!!");
        } else if(baba.status == 'loser'){
            s.html('<h6>あんたの負けです</h6>')
        }
    })

    baba.on('face-end', ()=>{
        $('.targetVideo').removeClass('flash-red');
        $(".targetVideo").css("border-color", "#333");
    })

    baba.on('choice', ()=>{
        $('#take-card-index-'+baba.choiceIndex).addClass('choiced')
    })

    baba.on('choiced', ()=>{
        console.log(baba.choicedIndex+"番目のカードが選択されました。")
        $('#my-card-index-'+baba.choicedIndex).addClass('choiced')
    })

    baba.on('take', (e)=>{
        let take = baba.getUserCards(baba.takeUser.id);
        appendCards('#their-cards', take, true);

        // e.detail にカードが入ってる
        let c = e.detail
        console.log('card', c);

        let takearea = $('#take-card')
        takearea.empty();
        takearea.append(getCardDOM(c.mark, c.num));
        takearea.slideDown(200);
        setTimeout(()=>{
            takearea.slideUp(200);
            
            baba.getMatchIndex(c).then(res=>{
                if(res != null){
                    // throuwCard実行
                    baba.throwCard(res);
                } else {
                    // pushCard実行
                    baba.pushCard(c)
                }
            })
        }, 1000);
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
        console.log(baba.choicedIndex);
        console.log($('#my-card-index-'+baba.choicedIndex))
        $('#my-card-index-'+baba.choicedIndex).slideUp(200);
        setTimeout(()=>{
            baba.choicedIndex = null;
            let my = baba.getUserCards(baba.peer.id);
            appendCards('#my-cards', my);
            baba.setStatus('myturn');
        }, 200)
    })

    baba.on('win', ()=>{
        console.log('あなたの勝ちです');
        $('#my-cards').hide();
        $('#their-cards').hide();
        baba.setStatus('winner');
        
        $('#winner-list').append($(
            '<li class="list-group-item">'+baba.peer.id+'さん</li>'
        ));
    })

    baba.on('anyone-win', (e)=>{
        console.log(e.detail+"さんが勝ちました");

        $('.targetVideo').removeClass('targetVideo');
        $('#v-'+baba.takeUser.id).addClass('targetVideo');

        let take = baba.getUserCards(baba.takeUser.id);
        appendCards('#their-cards', take, true);

        $('#winner-list').append($(
            '<li class="list-group-item">'+e.detail+'さん</li>'
        ));

        let members = baba.roomInfo["members"]
        if(members.length < 2){
            baba.setStatus('loser')
        }
    })

    function appendCards(_selector, _cards = [], addEvent = false){
        $(_selector).empty();
        for(let i=0; i<_cards.length; i++){
            let c = getCardDOM(_cards[i].mark, _cards[i].num, i);
        
            if(addEvent){
                c.attr('id', 'take-card-index-'+i);
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
            } else {
                c.attr('id', 'my-card-index-'+i);
            }

            $(_selector).append(c);
        }
    }

    function getCardDOM(mark = "", num, index = ''){
        return $(
            '<div class="card card_wrapper '+mark+'" data-index="'+index+'">'+
                '<p'+' data-index="'+index+'">' +(num>0?num:"")+'</p>'+
            '</div>'
        );
    }

    $("#face_start").on("click", (e)=>{
       baba.setStatus("turn");
       console.log("btn")
       let video = document.getElementById("my-video");
       baba.face_start(video);
   })

})


