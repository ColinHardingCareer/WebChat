"use strict";

// Create DOM objects
const chatArea = document.querySelector("#chatArea");
const waitingPar = document.querySelector("#waiting");
const nameDiv = document.querySelector("#nameDiv");
const nameBox = document.querySelector("#name");
const sendNameButton = document.querySelector("#sendName");
const messageDiv = document.querySelector("#messageDiv");
const message = document.querySelector("#message");
const sendMessageButton = document.querySelector("#sendIt");
const closedPar = document.querySelector("#closed"); 

// Create WebSocket and add event listeners
const socket = new WebSocket("ws://localhost:3000");
socket.addEventListener('open', 
			event=>{
                          console.log('Connected to server.');
                          waitingPar.style.display = "none";
			  nameDiv.style.display = "block";
                        });
socket.addEventListener('message', 
                        event=>{chatArea.value += '\n' + event.data;});
socket.addEventListener('close', 
                        event=>{
			  console.log(`Connection closed: ${event.reason}`);
			  nameDiv.style.display = "none";
			  messageDiv.style.display = "none";
			  closedPar.style.display = "block";
 			});
socket.addEventListener('error',
	                event=>{console.log(`Connection error: ${event.error}`);});

// Add DOM button listeners
sendNameButton.addEventListener('click',
  event => {
    // Display the message div rather than the name div
    nameDiv.style.display = "none";
      messageDiv.style.display = "block";
      message.focus();
    // Send the user's name to the server
    socket.send(nameBox.value);
  });
sendMessageButton.addEventListener('click',
  event=>{
    // Add message to end of text area
    chatArea.value += '\n' + message.value;
    // Send message to server for forwarding to other clients
    socket.send(message.value);
    // Clear the message box
      message.value = '';
      // Give focus to the message text box
      message.focus();
  });

