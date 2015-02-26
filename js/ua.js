var elements = {
  uaForm: document.getElementById('ua-form'),
  uaAudio: document.getElementById('ua-audio'),
  hangup: document.getElementById('hangup'),
  mute: document.getElementById('mute'),
  media: document.getElementById('media')
}

var sipServer = '',
    user,
    ua,
    connection,
    caller_id;

var config = {
  userAgentString: 'SynclioSIP',
  traceSip: true,
  register: false,
  password: 'helle',
  wsServers: 'ws://'+sipServer+':8081'
};

elements.uaForm.addEventListener('submit', function(e){
  e.preventDefault(); //Prevent uaForm Submit
  user = document.getElementById('user').value;
  config['authorizationUser'] = user;
  config['uri'] = user+'@'+sipServer;

  //Creating user agent
  ua = new SIP.UA(config);
  if (ua) {
    ua.register();
  }else{
    console.warn('User agent configuration error!')
  }

  ua.on('connected', function () {
    elements.uaForm.innerHTML = 'Connected';
    console.info('User connected');
  });

  ua.on('registered', function () {
    elements.uaForm.innerHTML = 'Registered';
    console.info('User registered');
  });

  ua.on('unregistered', function () {
    elements.uaForm.innerHTML = 'Unregistered';
    console.info('unregistered');
  });

  // Incoming call
  ua.on('invite', function (session) {
    connection = session;
    caller_id = session.remoteIdentity.displayName;
    elements.uaForm.innerHTML = "Incoming "+caller_id;
    elements.media.style.display = "";

    session.accept({    //accepting incoming call with audio
        mediaConstraints: {
          audio: true
        }
    });

    function waiting (){
      setInterval(function (){
        elements.uaForm.innerHTML = "Waiting for a call";
      },3000);
    }

    session.on('accepted', function () {
      //attaching remote audio
      var stream = this.mediaHandler.getRemoteStreams()[0];
      elements.uaAudio.src = URL.createObjectURL(stream);
      elements.uaAudio.play();

    });

    session.on('bye', function (){
      elements.uaForm.innerHTML = "Call ended for "+caller_id
      console.info("Call ended");
      elements.media.style.display = "none";
      waiting();
    });

    session.on('failed', function (response){
      console.warn(response.cause);
    });

  });


  ua.on('message', function (message) {
    console.info('message');
  });

},false);

// On call hangup;
elements.hangup.addEventListener('click', function (e){
  e.preventDefault();
  if(connection){
    connection.terminate();  
    elements.media.style.display = "none";
  }else{
    console.warn("connection: "+connection);
  }
},false);

// On mute and un mute
elements.mute.addEventListener('click', function (){
  if(elements.mute.innerHTML == "Mute"){
    connection.mediaHandler.mute();
    elements.mute.innerHTML = "Unmute";
    console.info("Audio Muted");
  }else{
    connection.mediaHandler.unmute();
    console.info("Audio unmuted");
    elements.mute.innerHTML = "Mute";
  }
},false);
