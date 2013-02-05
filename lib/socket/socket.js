var Socket = {
	url : 'ws://m8e.co.uk:1337/',
	connection:null,
	init : function() {
		// if user is running mozilla then use it's built-in WebSocket
		window.WebSocket = window.WebSocket || window.MozWebSocket;

		if (!window.WebSocket) {

			return false;
		} else {
			return true;
		}
	},
	connect : function() {
		this.connection = new WebSocket(this.url);
		this.connection.onopen = this.event.onopen;
		this.connection.onerror = this.event.onerror;
		this.connection.onmessage = this.event.onmessage;

	},
	event : {
		onopen : function() {
			if(Socket.onopen)Socket.onopen();
		},
		onerror :function (error) {
			if(Socket.onerror)Socket.onerror(error);
		},
		onmessage :function (message) {
			if(Socket.onmessage)Socket.onmessage(message);
		}
	},
	send:function(obj)
	{
		this.connection.send(obj);
	},
	onopen:null,
	onerror:null,
	onmessage:null
}
