var states = {
	LOBBY: 0,
	GAME: 1,
	END: 2
};

function GameView(){
	var state = false;
	var name = false;
	
	this.init = function(){
		this.initSocket();
		this.bindViewEvents();
		this.bindSocketEvents();
		socket.emit('game_init');
	}
	
	this.initSocket = function(){
		socket = io.connect({
			'reconnection':true,
			'reconnectionDelay': 1000,
			'reconnectionDelayMax' : 1000,
			'reconnectionAttempts': 1000
		});
	}
	
	this.updateView = function(){
		if(state == states.LOBBY) $("#lobby").show();
		else $("#lobby").hide();
		if(state == states.GAME) $("#game").show();
		else $("#game").hide();
		if(state == states.END) $("#end").show();
		else $("#end").hide();
	}
	
	this.bindViewEvents = function(){
		
	}
	
	this.bindSocketEvents = function(){
		socket.on('game_init_ok', function(game){
			return function(data){
				state = data.state;
				name = data.name;
				game.updateView();
			}
		}(this));
		socket.on('game_init_nok', function(data){
			alert('You were disconnected.');
			location.href = '/';
		});
		socket.on('game_state_update', function(game){
			return function(data){
				if(state == data.state) return;
				state = data.state;
				game.updateView();
			}
		}(this));
	}
}

$(document).ready(function(){
	var game = new GameView();
	game.init();
});