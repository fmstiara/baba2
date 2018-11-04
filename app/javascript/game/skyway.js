import Peer from 'skyway-js'

export class SkyWay{
    constructor(_user_id){
        this.peer = new Peer({
            key: 'caf1fe56-c907-4957-8b12-d2e2ad93ac3a',
            debug: 2 //あとで数字を下げてdebug内容を減らす
        });

        this.metadata
        this.localStream = null;
        this.room = null;
       
        this.peerInit();
        this.members = [] 
      
    }

    peerInit(){
        this.peer.on('open', () => {
            // Get things startedbin/
            console.log('my peer id: '+this.peer.id);
            this.getMediaSources();
        });

        this.peer.on('error', err => {
            alert(err.message);
            // 入り直す処理
        });
    }

    getMediaSources(){
        const audioSelect = $('#audioSource');
        const videoSelect = $('#videoSource');
        const selectors = [audioSelect, videoSelect];

        navigator.mediaDevices.enumerateDevices()
          .then(deviceInfos => {
            const values = selectors.map(select => select.val() || '');
            selectors.forEach(select => {
              const children = select.children(':first');
              while (children.length) {
                select.remove(children);
              }
            });

            for (let i = 0; i !== deviceInfos.length; ++i) {
              const deviceInfo = deviceInfos[i];
              const option = $('<option>').val(deviceInfo.deviceId);

              if (deviceInfo.kind === 'audioinput') {
                option.text(deviceInfo.label ||
                  'Microphone ' + (audioSelect.children().length + 1));
                audioSelect.append(option);
              } else if (deviceInfo.kind === 'videoinput') {
                option.text(deviceInfo.label ||
                  'Camera ' + (videoSelect.children().length + 1));
                videoSelect.append(option);
              }
            }

            selectors.forEach((select, selectorIndex) => {
              if (Array.prototype.slice.call(select.children()).some(n => {
                return n.value === values[selectorIndex];
              })) {
                select.val(values[selectorIndex]);
              }
            });

            videoSelect.on('change', this.setMediaSources(this));
            audioSelect.on('change', this.setMediaSources(this));
          });
    }

    setMediaSources(_obj) {
        // Get audio/video stream
        const self = _obj
        const audioSource = $('#audioSource').val();
        const videoSource = $('#videoSource').val();
        const constraints = {
          audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
          video: {deviceId: videoSource ? {exact: videoSource} : undefined},
        };

        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
          $('#my-video').get(0).srcObject = stream;
          this.localStream = stream;

          if (this.room) {
            this.room.replaceStream(stream);
            return;
          }

        //   ここでMakeCall()する

        }).catch(err => {
          console.error(err);
        });
    }


    onCall(room, videoDOM = "#their-videos") {
        // Wait for stream on the call, then set peer video display
        room.on('stream', stream => {
          const peerId = stream.peerId;
          const id = 'video_' + peerId + '_' + stream.id.replace('{', '').replace('}', '');

          $(videoDOM).append($(
            '<div class="" id="' + id+ '">'+
              '<video class="remoteVideos" id="v-'+peerId+'"autoplay playsinline>' +
            '</div>'));
          const el = $('#' + id).find('video').get(0);
          el.srcObject = stream;
          el.play();
          console.log($('.remoteVideos').length)
          if ($('.remoteVideos').length >= 4){
            console.log("aaaaaaaa2")
            $('.remoteVideos').css('width', '290px');
          }
        });

        room.on('removeStream', stream => {
          const peerId = stream.peerId;
          $('#video_' + peerId + '_' + stream.id.replace('{', '').replace('}', '')).remove();
        });

        // UI stuff
        room.on('close', ()=>{

        });

        room.on('peerLeave', peerId => {
          $('.video_' + peerId).remove();
        });
    }

    makeCall(_roomName){
        const roomName = _roomName;
        if(!roomName){return;}
        this.room = this.peer.joinRoom('sfu_video_' + roomName, {mode: 'sfu', stream: this.localStream, metadata: {}});
        this.onCall(this.room);
        console.log("ss")
    }

    endCall(){
        if(this.room){
            this.room.close();
        }
    }

    getRoomMembers(_roomName){
        const self = this;
        return new Promise((resolve, reject)=>{
            let room = self.peer.rooms['sfu_video_'+_roomName]
            if(!room){
                resolve([]);
            }
            resolve(room.members);
        })
    }
}