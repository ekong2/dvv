
var connectedClients = 0;
var socket = io.connect();
//Predefined function just returns the element
var func = 'element';

//Upon button press, this function notifies the master
//it is ready to start
var clientRdy = function(){
  socket.emit('ready');
}


socket.on('data', function(data) {
  console.log("data received");

  //Save function if a function was passed in
  if (data.fn){
    func = data.fn;
  }
  
  //Spawn a new webworker
  var worker = new Worker('scripts/workerTask.js');

  //Have our slave process listen to when web worker finishes computation
  worker.addEventListener('message', function(e) {
    console.log ("Worker has finished computing");
    //TODO: error handling?
    socket.emit('completed', {
      "id": data.id,
      "result": e.data
    });
    worker.terminate();
  }, false);

  //Send data to our worker
  worker.postMessage({fn: func, payload: data.payload});

});

socket.on('progress', function(data) {
  console.log(data.progress);
});

socket.on('clientChange', function(data) {
  connectedClients = data.availableClients;
  console.log("Clients: ",connectedClients)
});

socket.on('complete', function(){
  console.log("COMPLETE");
});
