'use strict';
const WebSocket = require('ws');

/** Two-person chat server implemented using WebSockets.  The server
 *  assumes that the first message from a client is the user's name.
 *  This version assumes that the client the connects first is also
 *  the first to send their name.
 */
const wss = new WebSocket.Server(
    {port: 3000}, 
    () => console.log('listening')
);
// Register listener on the server.
wss.on('connection', connector);

/** Counter used to assign to each client a unique id number. */
var clientId = 0;

/** Array holding data for each client that has connected.
 *  Each element is an object<br />
 *  <code>
 *    {ws: client's WebSocket, name: client's username}
 *  </code><br />
 *  The username is initially undefined and is assigned once the
 *  first message is received from the client.
 */
const clients = [];

/**
 * Handle connection from a client.
 * Add the client to the 'clients' data structure.
 * Also register an event listener on this client's WebSocket.
 * @param {WebSocket} ws WebSocket of the client.
 */
function connector(ws) {
    let thisClient = clientId++;
    console.log(`connection opened by ${thisClient}`);

    // Add client with client number to the clients map
    clients[thisClient] = {ws: ws, name:undefined };

    // Add event listener
    ws.addEventListener('message', messageHandler);
}

/**
 * Handle message from a client.  Initial message is username.
 * Subsequent messages are to be displayed in chat windows of other
 * clients participating in the chat.
 * @param {Event} event The object passed to 'message' event listeners.
 *                      The primary property is <code>data</code>.
 */
function messageHandler(event) {
    const data = event.data;
    const ws = event.target;

    // Determine the client number
    const client_number = (ws === clients[0].ws ? 0 : 1);

    // If this is the first (username) message from this client
    const client = clients[client_number];
    if (!client.name) {

	// store data as client's name
	client.name = data;
	console.log(`Client ${client_number} entered name ${client.name}.`);

	// send appropriate message to this client and the other, if present
	if (client_number === 0) {
	    const welcome_message = "You are the first in this chat room.";
	    console.log(`Sending '${welcome_message}' to ${client_number}.`);
	    ws.send(welcome_message);
	}
	else { // client 1
	    const other_client_number = 0;
	    const welcome_message =
		`You're joining a chat with ${clients[other_client_number].name}`;
	    console.log(`Sending '${welcome_message}' to ${client_number}.`);
	    ws.send(welcome_message);
	    
	    const join_message = `${client.name} joined the chat.`;
	    console.log(`Sending '${join_message}' to ${other_client_number}.`);
	    clients[other_client_number].ws.send(join_message);
	}
    }
    // If this is not the first message from this client, send the
    // message from this client to the other client, prepending this
    // client's name to the message. This assumes that both clients
    // are connected before either sends its second message.
    else {
	const other_client_number = 1-client_number; // 1-0 = 1, 1-1=0
	console.log(`Sending '${data}' from ${client_number} to ${other_client_number}.`);
	clients[other_client_number].ws.send(`${client.name}: ${data}`);
    }
}
