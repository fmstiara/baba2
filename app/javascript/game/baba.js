import { SkyWay } from './skyway';
import { Card } from './card';
import { send_face } from './face'

export class Baba extends SkyWay{
    constructor(){
        super();

        this.roomInfo = null
        this.takeUser = {
            id: ''
        } //peerId
        this.rank = null;

        // 選択しているカード
        this.choiceIndex = null;

        // 選択されているカード
        this.choicedIndex = null;
        
        // 自分の状態(出番, 出番じゃない, 抜け)
        this.status = '';

        console.log('new Baba instance')

        this.events = {}
    }

    face_start(_target_video){
        const self = this;
        let id = setInterval(function(){
            if(self.status == 'myturn'){
                send_face(_target_video);
            } else {
                clearInterval(id);
            }
        }, 1000);
    }

    on(_name = "test", callback){
        let _element = document.createElement('div');
        _element.addEventListener(_name, callback);
        this.events[_name] = {
            element: _element
        }
    }

    dispatch(_name = "test", _detail = {}){
        const self = this;
        if(self.events[_name]){
            let el = self.events[_name]['element'];
            let evt = new CustomEvent(_name, {detail: _detail});
            el.dispatchEvent(evt);
        } else {
            // console.log('そのイベントは存在しません');
        }
    }

    emit(_eventName = "test", _data){
        this.room.send({
            event: _eventName,
            data: _data
        })
    }

    cardInit(){
        let cards = []
        for(let i = 1; i<=13; i++){
            cards.push(new Card(i, "heart"));
            cards.push(new Card(i, "club"));
            cards.push(new Card(i, "diamond"));
            cards.push(new Card(i, "spade"));
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

                    if(self.room){
                        console.log('initialized');
                        
                        // 自分がカードを取る人を決定
                        self.setTakeUser();

                        // 他のユーザにも情報を投げる。
                        self.emit('init', self.roomInfo);
                        self.dispatch('init');
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
        let check = Array.apply(null, Array(_cards.length)).map(function () {return true });
        
        for(let i=0; i<_cards.length-1;i++){
            if(check[i]){
                for(let j=i+1; j<_cards.length; j++){
                    if(check[j]){
                        if(_cards[i].num==_cards[j].num){
                            check[i] = false;
                            check[j] = false;
                            this.roomInfo.trash += 2;
                            break;
                        }
                    }
                }
            }
        }

        for(let i=0;i<_cards.length;i++){
            if(check[i]){
                res.push(_cards[i])
            }
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

            if(eventName === 'init'){
                // 最初にカードを配られたとき
                console.log('on data: event '+eventName);
                self.roomInfo = data;
                
                // 自分がカードを取る人を決定
                self.setTakeUser();
                self.dispatch('init')

            } else if(eventName === 'choice'){
                // data['choice']番目のカードを取ろうとしている
                console.log('on data: event '+eventName);
                let index = data['index'];
                let user_id = data['user_id'];

                if(self.peer.id == user_id){
                    self.choicedIndex = data['index'];
                    self.dispatch('choiced');
                }
            } else if(eventName === 'take'){
                console.log('on data: event '+eventName);
                let index = data['index'];
                let user_id = data['user_id'];
                let cards = self.roomInfo['userCards'][user_id];
                cards.splice(index, 1);

                if(user_id == self.peer.id){
                    // 自分が取られたとき
                    self.dispatch('taken')
                    if(cards.length == 0){
                        // 自分、勝ち
                        self.emit('set-status', {
                            user_id: self.takeUser.id,
                            status: 'myturn'
                        })
                        self.iWin();
                    }
                } else {
                    // 自分以外の人が取られたとき
                    self.dispatch('change')
                }

            } else if(eventName === 'throw'){
                console.log('on data: event '+eventName);
                // カードを捨てる
                let index = data['index'];
                let user_id = data['user_id'];
                let cards = self.roomInfo['userCards'][user_id];
                cards.splice(index, 1);

                self.dispatch('change');
                self.addTrash();
            } else if(eventName === 'push'){
                console.log('on data: event '+eventName);
                let c = data['card']
                let cards = self.roomInfo['userCards'][data['user_id']]
                cards.push(c);
                self.dispatch('change')
                // self.shuffle(cards);
            } else if(eventName === 'anyone-win'){
                console.log('on data: event '+eventName);
                self.anyoneWin(data['user_id']);

            } else if(eventName === 'set-status'){
                if(self.peer.id == data['user_id']){
                    self.setStatus(data['status']);
                }
            }
        })
    }

    choice(_index){
        // カードを選択
        // peerIdと選択したカードを送る
        this.choiceIndex = _index;
        this.emit('choice', {
            index: _index,
            user_id: this.takeUser.id
        });
        this.dispatch('choice')
    }

    take(_index){
        const self = this;
        this.choiceIndex = null;
        return new Promise((resolve)=>{
            // カードを取る
            self.emit('take', {
                index: _index,
                user_id: self.takeUser.id //取られる人
            });

            let cards = self.roomInfo['userCards'][self.takeUser.id];
            let c = cards[_index]
            cards.splice(_index, 1);
            self.dispatch('take', c);
            resolve(c);
        })
    }

    getMatchIndex(_card){
        const self = this
        return new Promise((resolve)=>{
            let mycards = self.roomInfo['userCards'][self.peer.id]
            let res = null
            for(let i=0; i<mycards.length; i++){
                if(mycards[i].num === _card.num){
                    res = i;
                }
            }

            resolve(res)
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
            } else {
                self.setStatus('anyoneturn');
            }
            self.emit('throw', {
                index: _matchIndex,
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
            self.emit('push', {
                card: _card,
                user_id: self.peer.id
            })
            self.setStatus('anyoneturn');
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
        let next = members.indexOf(this.peer.id) + 1;
        if(next >= members.length ) next = 0;
        console.log(members, next);
        this.takeUser.id = members[next];
    }

    getRoomInfo(){
        return this.roomInfo;
    }

    getUserCards(_id){
        return this.roomInfo['userCards'][_id];
    }

    iWin(_id){
        this.rank = this.roomInfo['winner'].length + 1;
        this.roomInfo['winner'].push(this.peer.id)
        this.emit('anyone-win', {
            user_id: this.peer.id
        })
        this.dispatch('win', this.peer.id);
    }

    anyoneWin(_id){
        this.roomInfo['winner'].push(_id);
        let i = this.roomInfo['members'].indexOf(_id);
        this.roomInfo['members'].splice(i, 1);
        this.setTakeUser();
        this.dispatch('anyone-win', _id);
    }

    setStatus(_status = ''){
        this.status = _status;
        this.dispatch('status-change');
    }
}