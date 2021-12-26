
const url = `ws://${window.location.host}`;
const protocols = 'alpha-protocol-v1';

const webSocket = new WebSocket(url, protocols);

window.webSocket = webSocket;

webSocket.onopen = ()=> {

    webSocket.send(JSON.stringify({"name": "join"}));

};

webSocket.onmessage = (evt)=>{

    try {

        //console.log(evt.data);

        const event = JSON.parse(evt.data);

        // Update the existing tree with the given data.

        updateSession(event);

    } catch (error) {
        console.log(error);
    }
};







