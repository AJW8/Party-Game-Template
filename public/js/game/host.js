var states = {
	LOBBY: 0,
	GAME: 1,
	END: 2
};

function GameView(){
	var state = false;
	var minPlayers = false;
	var maxPlayers = false;
	var playerNames = false;
	var audience = false;
	
	this.init = function(){
		this.initSocket();
		this.bindViewEvents();
		this.bindSocketEvents();
		socket.emit('host_init');
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
		if(state == states.LOBBY){
			$("#lobby").show();
			$("#game_start").hide();
			var html = "";
			var l = 0;
			for(var n in playerNames){
				html += "<p>" + playerNames[n] + "</p>";
				l++;
			}
			for(let i = l; i < maxPlayers; i++) html += "<p><i>join now!</i></p>";
			if(l >= minPlayers){
				$("#btn_start_game").html('Start Game');
				if(l == maxPlayers) html += "<p>" + audience + " in audience</p>";
			}
			else{
				$("#btn_start_game").html((minPlayers - l) + ' more players needed');
			}
			$('#lobby_players').html(html);
		}
		else{
			$("#lobby").hide();
			$("#game_start").show();
			if(state == states.GAME){
				$("#game").show();
				$("#end").hide();
			}
			else{
				$("#game").hide();
				$("#end").show();
			}
		}
	}
	
	this.bindViewEvents = function(){
		$('#btn_start_game').click(function(){
			if(!playerNames || playerNames.length < minPlayers) alert((minPlayers - playerNames.length) + " more players needed to start.");
			else if(confirm("Start the game?")) socket.emit('host_start_game');
			return false;
		});
		$('#btn_end_game').click(function(){
			socket.emit('host_end_game');
			return false;
		});
		$('#btn_leave_game').click(function(){
			if(confirm("Destroy the current game? All local users in this game, including you as the host, will be disconnected.")){
				socket.emit('host_leave_game');
			}
			return false;
		});
		$('#btn_same_players').click(function(){
			if(confirm("Play again with the same players?")){
				socket.emit('host_start_game');
			}
			return false;
		});
		$('#btn_new_players').click(function(){
			if(confirm("Start a new lobby? You as the host will remain connected.")){
				socket.emit('host_new_lobby');
			}
			return false;
		});
	}
	
	this.bindSocketEvents = function(){
		socket.on('host_init_ok', function(host){
			return function(data){
				$("#lobby_room_code").html("Code: " + data.code);
				state = data.state;
				minPlayers = data.min_players;
				maxPlayers = data.max_players;
				playerNames = data.player_names;
				audience = data.audience;
				host.updateView();
				return false;
			}
		}(this));
		socket.on('host_init_nok', function(){
			location.href = '/';
		});
		socket.on('host_lobby_update', function(host){
			return function(data){
				if(state != states.LOBBY) return false;
				playerNames = data.player_names;
				host.updateView();
				return false;
			}
		}(this));
		socket.on('host_state_update', function(host){
			return function(data){
				if(state == data.state) return false;
				state = data.state;
				host.updateView();
				return false;
			}
		}(this));
		socket.on('host_audience_update', function(host){
			return function(audienceCount){
				audience = audienceCount;
				host.updateView();
				return false;
			}
		}(this));
	}
}

$(document).ready(function(){
	var game = new GameView();
	game.init();
});