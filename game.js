var states = {
	LOBBY: 0,
	GAME: 1,
	END: 2
};

function Games(){
	var games = {};
	
	this.createGame = function(){
		var id = false;
		while(!id){
			id = '';
			var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			var length = letters.length;
			for(var i = 0; i < 4; i++) id += letters.charAt(Math.floor(Math.random() * length));
			for(var g in games) if(games[g].getId() == id) id = false;
		}
		games[id] = new Game(id);
		return games[id];
	}
	
	this.removeGame = function(gameId){
		if(gameId in games){
			games[gameId].destroyGame();
			delete games[gameId];
			games[gameId] = false;
		}
	}
	
	this.getGame = function(gameId){
		if(gameId in games) return games[gameId];
		else return false;
	}
}

function Game(pId){
	var gameId = pId;
	var users = new Users();
	var gameState = new GameState();
	gameState.setState(states.LOBBY, {});
	
	this.getId = function(){
		return gameId;
	}
	
	this.addUser = function(user){
		users.addUser(user, gameId);
	}
	
	this.getUser = function(userId){
		return users.getUser(userId);
	}
	
	this.removeUser = function(userId){
		users.removeUser(userId);
	}
	
	this.getState = function(){
		return gameState.get();
	}
	
	this.getPlayerCount = function(){
		var playerCount = 0;
		const allUsers = users.getAll();
		for(var u in allUsers) if(allUsers[u].getPlayer()) playerCount++;
		return playerCount;
	}
	
	this.hasPlayer = function(playerName){
		return users.hasPlayer(playerName);
	}
	
	this.startGame = function(){
		var curState = gameState.get();
		if(curState != states.LOBBY && curState != states.END) return;
		gameState.setState(states.GAME, {});
	}
	
	this.hasStarted = function(){
		var curState = gameState.get();
		return curState != states.LOBBY;
	}
	
	this.endGame = function(){
		var curState = gameState.get();
		if(curState != states.GAME) return;
		gameState.setState(states.END, {});
	}
	
	this.newLobby = function(){
		users.disconnectPlayers();
		gameState.setState(states.LOBBY, {});
	}
	
	this.destroyGame = function(){
		users.disconnectAll();
	}
	
	this.sendUpdates = function(user, params){
		var summary = gameState.getSummary();
		//user.sendUpdates(summary, params);
	}
	
	setInterval(function(game){
		return function(){
			const allUsers = users.getAll();
			var empty = true;
			for(var u in allUsers) if(empty) empty = false;
			if(empty) return;
			const state = gameState.get();
			for(var u in allUsers) if(allUsers[u]) allUsers[u].sendUpdates(state, allUsers);
		}
	}(this), 1000);
}

function Users(){
	var users = {};
	
	this.addUser = function(user, gameId){
		var uniqueId = user.getUniqueId();
		if(typeof uniqueId === 'undefined' || !uniqueId) return;
		user.setGameId(gameId);
		users[uniqueId] = user;
	}
	
	this.getUser = function(userId){
		if(userId in users) return users[userId];
		else return false;
	}
	
	this.removeUser = function(userId){
		if(userId in users){
			users[userId].disconnectUser();
			delete users[userId];
			users[userId] = false;
		}
	}
	
	this.getAll = function(){
		return users;
	}
	
	this.hasPlayer = function(playerName){
		for(var u in users) if(users[u].getPlayer() && users[u].getName() == playerName) return true;
		return false;
	}
	
	this.disconnectPlayers = function(){
		for(var u in users) if(!users[u].getHost()) this.removeUser(users[u].getUniqueId());
	}
	
	this.disconnectAll = function(){
		for(var u in users) this.removeUser(users[u].getUniqueId());
	}
}

function User(pSocket, pName){
	var socket = pSocket;
	
	this.getUniqueId = function(){
		if(socket && socket.handshake && socket.handshake.session && socket.handshake.session.unique_id) return socket.handshake.session.unique_id;
		return false;
	}
	
	if(socket && socket.handshake && socket.handshake.session){
		//if(typeof socket.handshake.session.unique_id === 'undefined'){
		//	console.log('# User connected.');
		//	socket.handshake.session.unique_id = socket.id;
		//}
		console.log('# User connected.');
		socket.handshake.session.unique_id = socket.id;
		
		socket.handshake.session.in_game = true;
		socket.handshake.session.user_id = this.getUniqueId();
		socket.handshake.session.save();
	}
	
	var isHost = pName == 'host';
	var isPlayer;
	var isAudience = pName == 'audience';
	isPlayer = !(isHost || isAudience);
	var name = isPlayer ? pName : false;
	
	this.getHost = function(){
		return isHost;
	}
	
	this.getPlayer = function(){
		return isPlayer;
	}
	
	this.getAudience = function(){
		return isAudience;
	}
	
	this.getName = function(){
		return name;
	}
	
	this.setGameId = function(gameId){
		socket.handshake.session.game_id = gameId;
	}
	
	this.updateSocket = function(pSocket){
		socket = pSocket;
	}
	
	this.disconnectUser = function(){
		socket.handshake.session.in_game = false;
		socket.handshake.session.unique_id = false;
		socket.handshake.session.user_id = false;
		socket.handshake.session.game_id = false;
		socket.handshake.session.save();
		if(isHost) socket.emit('host_init_nok');
		else socket.emit('game_init_nok');
	}
	
	this.sendUpdates = function(gameState, allUsers){
		if(isHost){
			if(gameState == states.LOBBY){
				var playerNames = [];
				for(var u in allUsers) if(allUsers[u] && allUsers[u].getPlayer()) playerNames.push(allUsers[u].getName());
				socket.emit('host_lobby_update', {
					player_names: playerNames
				});
			}
			socket.emit('host_state_update', {
				state: gameState
			});
			var audienceCount = 0;
			for(var u in allUsers) if(allUsers[u] && allUsers[u].getAudience()) audienceCount++;
			socket.emit('host_audience_update', audienceCount);
		}
		else socket.emit('game_state_update', {
			state: gameState
		});
	}
}

function GameState(){
	var curState = false;
	var stateParams = false;
	var hiddenParams = false;
	
	this.get = function(){
		return curState;
	}
	
	this.setState = function(pState, pStateParams){
		curState = pState;
		stateParams = pStateParams;
	}
	
	this.setHiddenParams = function(pHiddenParams){
		hiddenParams = pHiddenParams;
	}
	
	this.getHiddenParams = function(){
		return hiddenParams;
	}
	
	this.getSummary = function(){
		var obj = {};
		obj.state = curState;
		obj.stateParams = stateParams;
		return obj;
	}
}