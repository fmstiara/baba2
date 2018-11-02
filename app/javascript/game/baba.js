import { SkyWay } from './skyway';
import { Card } from './card';

export class Baba extends SkyWay{
    constructor(_roomName){
        super();

        this.roomInfo = null
        this.cardList = []
        this.leftUser = '' //peerId
        this.rightUser = ''

        console.log('new Baba instance')
    }

    cardInit(){
        let cards = []
        for(let i = 1; i<=13; i++){
            cards.push(new Card(i, "heart"));
            cards.push(new Card(i, "club"));
            cards.push(new Card(i, "diamond"));
            cards.push(new Card(i, "spede"));
        }
        cards.push(new Card(-1, "joker"))
        return cards
    }

    gameInit(_roomName = ''){
        // ゲームを開始する
        const self = this;
        let cards = self.cardInit();

        self.getRoomMembers(_roomName).then((members)=>{
            members.push(self.peer.id);
            console.log(members);
            if(members.length < 2){
                alert('人数が揃っていません');
            } else {
                self.room.on('data', (data)=>{
                    console.log(data);
                    if(data.hasOwnProperty('cards')){
                        self.roomInfo = data;
                        self.cardList = self.roomInfo['users'][self.peer.id];
                    }
                })

                self.shuffle(cards)
                .then(()=>{
                    self.roomInfo = {users: [], lest: []};

                    let t = 0;
                    let s = Math.floor(cards.length / members.length);
                    let a = cards.length % members.length;
                    for(let i=0; i<members.length; i++){
                        let e = t + s + (i<a?1:0);
                        let c = cards.slice(t, e);
                        self.roomInfo['users'][members[i].id] = c;
                        t = e;
                    }

                    if(self.room){
                        console.log('send init card');
                        self.room.send(self.roomInfo);
                    }
                })
                //
            }
        })

    }

    shuffle(array = []){
        return new Promise((resolve)=>{
            for (let i = array.length - 1; i >= 0; i--){
                let rand = Math.floor( Math.random() * ( i + 1 ) );
                [array[i], array[rand]] = [array[rand], array[i]];
            }
            resolve();
        })
    }

    start(_roomName){
        // ゲーム開始
        // ゲーム開始したら,その部屋にいる人のゲーム開始ボタンを使えなくする
        this.gameInit(_roomName);
    }

    end(_roomName){
        // ゲームを終了する
    }

    choice(){
        // カードを選択
        // peerIdと選択したカードを送る

    }

    exchange(){
        // カード交換の儀
        // choiceと実質同じだが、実際にカードを受け取る
    }

    omake(){
        // 手札シャッフル
        // 人数が3人以上のとき手札を交換する
    }
}
