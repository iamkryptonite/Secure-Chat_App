// Make connection
var socket = io.connect('https://protected-island-04317.herokuapp.com');
// Query DOM
var message = document.getElementById('message'),
      handle = document.getElementById('handle'),
      btn = document.getElementById('send'),
      output = document.getElementById('output'),
      feedback = document.getElementById('feedback'),
      username = document.getElementById('username').innerHTML;      

// Emit events
btn.addEventListener('click', function(){       
    socket.emit('chat', {
        message: message.value,
        handle: handle.value,
        author: username
    });
    message.value = "";
});
message.addEventListener('keypress', function(){
    socket.emit('typing', username);
})
// Listen for events
socket.on('chat', function(data){
    feedback.innerHTML = '';
    handle.innerHTML = '';
    if(data.destination.includes(username)===true)
    output.innerHTML += '<p><strong>' + data.author + ': </strong>' + data.message + '</p>'; 
    // console.log(data.destination[i]+" - "+username);         
});
socket.on('typing', function(data){
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});