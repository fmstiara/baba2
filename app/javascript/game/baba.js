import { SkyWay } from './skyway';
import { Card } from './card';

export class Baba extends SkyWay{
    constructor(){
        super();
        this.gameInit()
        console.log('extends skyway')
    }

    async cardInit(){
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

    async gameInit(_roomName = ''){
        this.peer.on('connection', (connection)=>{
            console.log(connection.metadata);
        })
        let cards = await this.cardInit()
        console.log(cards);
        // let members = this.getRoomMembers(_roomName)
        // let roomInfo = {cards: cards, users: {}, lest: []}
        // for(let i=0; i<members.length; i++){
        //     roomInfo['users'][members[i].id] = []
        // }
        // connection.metadata[_roomName] = roomInfo
    }

    async shuffle(array = []){
        for (let i = array.length - 1; i >= 0; i--){
            let rand = Math.floor( Math.random() * ( i + 1 ) );
            [array[i], array[rand]] = [array[rand], array[i]]
        }
    }

    start(){
        // ゲームを開始する
    }

    end(){
        // ゲームを終了する
    }
}
