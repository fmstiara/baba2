import { SkyWay } from './skyway';
import { Card } from './card';

export class Baba extends SkyWay{
    constructor(_roomName){
        super();

        this.roomInfo = null
        this.takeUser = {
            id: ''
        } //peerId
        this.rank = null;
        this.choiced = null;
        this.connections = {}

        console.log('new Baba instance')

        this.events = {}
    }

    on(_name = "test", callback){
        let _element = document.createElement('div');
        let _event = new Event(_name)
        this.events[_name] = {
            element: _element,
            event: _event
        }
        _element.addEventListener(_name, callback());
    }

    dispatch(_name = "test"){
        const self = this;
        if(self.events[_name]){
            let element = self.events[_name].element;
            let event = self.events[_name].event;
            element.dispatchEvent(event);
        } else {
            // console.log('そのイベントは存在しません');
        }
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
            if(members.length < 2){
                alert('人数が揃っていません');
            } else {

                self.shuffle(cards)
                .then(()=>{
                    self.roomInfo = {members: members, userCards: {}, trash: 0, winner: []};

                    let t = 0;
                    let s = Math.floor(cards.length / members.length);
                    let a = cards.length % members.length;
                    for(let i=0; i<members.length; i++){
                        let e = t + s + (i<a?1:0);
                        let c = cards.slice(t, e);
                        self.roomInfo['userCards'][members[i]] = self.firstCheck(c);
                        t = e;
                    }

                    for(let i=0; i<members.length; i++){
                        if(members[i] != self.peer.id){
                            self.connections[members[i]] = self.peer(members[i])
                        }
                    }

                    if(self.room){
                        console.log('initialized');
                        console.log(self.roomInfo);

                        // 自分がカードを取る人を決定
                        self.setTakeUser();

                        // 他のユーザにも情報を投げる。
                        self.room.send(self.roomInfo);
                    }
                })
                //
            }
        })
    }

    firstCheck(_cards = []){
        return new Promise((resolve)=>{
            let res = []
            for(let i=0; i<_cards.length-1;i++){
                let include = false;
                for(let j=i+1; j<_cards.length; j++){
                    if(_cards[i].getNumber()==_cards[j].getNumber()){
                        include=true;
                        break;
                    }
                }
                if(!include)res.push(_cards[i]);
            }
            _cards = res;
            resolve;
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

    makeCall(_roomName){
        super.makeCall(_roomName);
        const self = this

        // 各種イベント定義
        self.room.on('data', data => {
            console.log(data);
            if(data.hasOwnProperty('members')){
                // 最初にカードを配られたとき
                self.roomInfo = data;
                console.log(data);

                // 自分がカードを取る人を決定
                self.setTakeUser();

            } else if(data.hasOwnProperty('choice')){
                // data['choice']番目のカードを取ろうとしている
                self.choiced = data['choice'];
                self.dispatch('choiced');

            } else if(data.hasOwnProperty('take')){
                // data['exchange']番目のカードを取られる
                let index = data['take'];
                let user_id = data['taken_user_id'];
                let cards = self.roomInfo['userCards'][user_id];
                cards.splice(index, 1);

                if(user_id == self.peer.id){
                    self.choiced = null;
                    self.dispatch('taken')
                    if(cards.length == 0){
                        // 自分、勝ち
                        self.iWin();
                    }
                } else {
                    self.dispatch('change')
                    if(cards.length == 0){
                        // 他人、勝ち
                        self.anyoneWin(user_id);
                    }
                }

            } else if(data.hasOwnProperty('throw')){
                カードを捨てる
                let index = data['throw'];
                let user_id = data['throw_user_id'];
                let cards = self.roomInfo['userCards'][user_id];
                cards.splice(index, 1);
                
                self.dispatch('change');
                if(cards.length == 0){
                    // 他人、勝ち
                    self.anyoneWin(user_id)
                }

                self.addTrash();
            } else if(data.hasOwnProperty('push')){
                let c = data['push']
                let cards = self.roomInfo['userCards'][data['push_user_id']]
                cards.push(c);
                self.dispatch('change')
                // self.shuffle(cards);
            } else if(data.hasOwnProperty('winner')){
                self.roomInfo['winner'].push(data['winner']);
                self.dispatch('anyone-win');
            }
        })
    }

    choice(_num){
        // カードを選択
        // peerIdと選択したカードを送る
        this.connections[this.takeUser.id].send({choice: _num});
    }

    take(_num){
        // カード交換の儀
        // choiceと実質同じだが、実際にカードを受け取る
        const self = this;
        self.room.send({
            take: _num,
            taken_user_id: self.takeUser.id //取られる人
        });

        let cards = self.roomInfo['userCards'][self.takeUser.id];
        let c = cards[_num]
        cards.splice(n, 1);
        self.dispatch('take');

        let mycards = self.roomInfo['userCards'][self.peer.id];
        self.getMatchCard(c).then((matchIndex)=>{
            if(matchIndex){
                // 一致するカードがあったとき
                mycards.splice(matchIndex, 1);
                
                if(mycards.length == 0){
                    // 勝ち
                    self.iWin();
                }

                self.dispatch('throw');
                self.room.send({
                    throw: matchIndex,
                    throw_user_id: self.peer.id
                })

                self.addTrash();
            } else {
                // 一致するカードがなかったとき
                mycards.push(c);
                self.dispatch('push');
                self.room.send({
                    push: c,
                    push_user_id: self.peer.id
                })
            }
        })
    }

    addTrash(){
        this.roomInfo.trash += 2;
        if(this.roomInfo.trash > 51){
            // ゲーム終了
            this.dispatch('end')
        }
    }

    getChoicedIndex(){
        if(this.choiced){
            return this.choiced;
        } else {
            return null;
        }
    }

    checkTakingCard(_num){
        // index.js側で数字を指定する。
        return this.roomInfo['userCards'][this.takeUser.id][_num];
    }

    getMatchIndex(_card){
        const self = this
        return new Promise((resolve)=>{
            let mycards = self.roomInfo['userCards'][self.peer.id]
            for(let i=0; i<mycards.length; i++){
                if(mycards[i].getNumber() == _card.getNumber()){
                    resolve(i)
                }
            }
            resolve(null);
        })
    }

    omake(){
        // 手札シャッフル
        // 人数が3人以上のとき手札を交換する
    }

    setTakeUser(){
        // 自分がカードを取る人を決める。
        let members = this.roomInfo['members'];
        let myturn = members.indexOf(this.peer.id);
        let next = (myturn >= members.length - 1)?(myturn+1):0
        this.takeUser.id = members[next];
    }

    getRoomInfo(){
        return this.roomInfo;
    }

    getUserCards(_id){
        return thi.roomInfo['userCards'][_id];
    }

    iWin(_id){
        this.rank = this.roomInfo['winner'].length + 1;
        this.roomInfo['winner'].push(this.peer.id)
        this.room.send({
            winner: this.peer.id
        })
        this.dispatch('win');
    }

    anyoneWin(_id){
        this.roomInfo['winner'].push(_id);
        let i = this.roomInfo['members'].indexOf(_id);
        this.roomInfo['members'].splice(i, 1);
        this.setTakeUser();
        this.dispatch('anyone-win');
    }
}