export class Card{
    constructor(_num = 0, _mark = "undefiend_mark"){
        this._num = _num
        this._mark = _mark
    }

    getNumber(){
        return this._num;
    }
}