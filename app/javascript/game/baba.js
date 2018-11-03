import { SkyWay } from './skyway';
import { Card } from './card';
import { send_face } from './face'

export class Baba extends SkyWay{
    constructor(_user_id, _roomName){
        super(_user_id);

        this.roomInfo = null
        this.takeUser = {
            id: ''
        } //peerId
        this.rank = null;
        this.choiced = null;
        this.connections = {}
        this.status = '';
        
        console.log('new Baba instance')

        this.events = {}
    }

    face_start(_target_video){
        let id = setInterval(function(){
            if(this.status == 'turn'){
                send_face(_target_video);
            } else {
                clearInterval(id)
            }
        }, 5000);
    }

    on(_name = "test", callback){
        let _element = document.createElement('div');
        let _event = new Event(_name)
        console.log(callback());
        _element.addEventListener(_name, callback());
        
        this.events[_name] = {
            element: _element,
            event: _event
        }
    }

    dispatch(_name = "test"){
        const self = this;
        console.log('trigger :'+_name)
        if(self.events[_name]){
            let el = self.events[_name]['element'];
            let evt = self.events[_name]['event'];
            console.log(el, evt);
            el.dispatchEvent(evt);
        } else {
            console.log('そのイベントは存在しません');
        }
    }

    emit(_eventName = "test", _targetUserId = null ,_data){
        if(!_targetUserId){
            this.room.send({
                event: _eventName,
                data: _data
            })
        } else {
            this.connections[_targetUserId].send({
                event: _eventName,
                data: _data
            });
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

                self.shuffle(cards).then(()=>{
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
                            self.connections[members[i]] = self.peer.call(members[i])
                        }
                    }

                    if(self.room){
                        console.log('initialized');
                        console.log(self.roomInfo);

                        // 自分がカードを取る人を決定
                        self.setTakeUser();

                        // 他のユーザにも情報を投げる。
                        self.emit('init', null, self.roomInfo);
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

    firstCheck(_cards = []){
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
        return res;
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
        self.room.on('data', d => {
            const raw = d['data']
            const eventName = raw['event'];
            const data = raw['data'];

            console.log(d);
            console.log(raw);
            console.log(eventName, data);

            if(eventName === 'init'){
                // 最初にカードを配られたとき
                self.roomInfo = data;
                console.log(data);

                // 自分がカードを取る人を決定
                self.setTakeUser();
                self.dispatch('init')

            } else if(eventName === 'choice'){
                // data['choice']番目のカードを取ろうとしている
                self.choiced = data['index'];
                self.dispatch('choiced');

            } else if(eventName === 'take'){
                let index = data['index'];
                let user_id = data['user_id'];
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

            } else if(eventName === 'throw'){
                // カードを捨てる
                let index = data['index'];
                let user_id = data['user_id'];
                let cards = self.roomInfo['userCards'][user_id];
                cards.splice(index, 1);
                
                self.dispatch('change');
                if(cards.length == 0){
                    // 他人、勝ち
                    self.anyoneWin(user_id)
                }

                self.addTrash();
            } else if(eventName === 'push'){
                let c = data['push']
                let cards = self.roomInfo['userCards'][data['push_user_id']]
                cards.push(c);
                self.dispatch('change')
                // self.shuffle(cards);
            } else if(eventName === 'win'){
                self.roomInfo['winner'].push(data['winner']);
                self.dispatch('anyone-win');
            }
        })
    }

    choice(_index){
        // カードを選択
        // peerIdと選択したカードを送る
        this.emit('choice', this.takeUser.id, {index: _index});
    }

    take(_num){
        const self = this;
        return new Promise((resolve)=>{
            // カードを取る
            self.emit('take',{
                index: _num,
                user_id: self.takeUser.id //取られる人
            });

            let cards = self.roomInfo['userCards'][self.takeUser.id];
            let c = cards[_num]
            cards.splice(n, 1);
            self.dispatch('take');
            resolve(c);
        })
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

    throwCard(_matchIndex){
        const self = this;
        return new Promise((resolve)=>{
            let mycards = self.roomInfo['userCards'][self.peer.id];
            mycards.splice(_matchIndex, 1);
            if(mycards.length == 0){
                // 勝ち
                self.iWin();
            }
            self.emit('throw',null,{
                index: matchIndex,
                user_id: self.peer.id
            })
            self.dispatch('throw');
        })
    }

    pushCard(_card){
        const self = this;
        return new Promise((resolve)=>{
            let mycards = self.roomInfo['userCards'][self.peer.id];
            mycards.push(_card);
            self.emit('push',null,{
                card: _card,
                user_id: self.peer.id
            })
            self.dispatch('push');
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
        this.emit('win', null,{
            user: this.peer.id
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

    setStatus(_status = ''){
        this.status = _status;
        this.dispatch('status-change');
    }
}