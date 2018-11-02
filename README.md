# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...

必要なもの
- node
- yarn

必要なこと
- npm install 
- npm install yarn
- bundle install
- rails db:migrate

Baba.onで用意したイベント
- choiced(カードを選択されたとき)
- take(カードを取ったとき)
- taken(カードを取られたとき)
- throw(カードを捨てるとき)
- push(カードを手札に加えるとき)
- change(自分と自分が取る人以外でやり取りが行われたとき)
- win(自分が勝ったとき)
- anyone-win(他人が勝ったとき)
- end(ゲーム終了=札が52枚に達した)
