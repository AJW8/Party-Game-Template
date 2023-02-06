# Party-Game-Template

##A template for creating local server multiplayer party games using Node.js and Socket.IO.
For this project I recreated the setup from https://github.com/shaan1337/quiz while making the necessary modifications.

### Host
- Each game has a single host whose screen must be publically displayed at all times.
- As the initial version of this project is just a template, it has no actual game functionality. You will need to implement this yourself.

### Player
- Once a game has been created, users can join as a player by entering the matching room code displayed on the host's screen.
- Players actively compete against each other to win either by ending up with the highest score (no score feature has been implemented) or by meeting some other condition.
- The player view is exclusive to the player and should not be shown to anyone else.
- During the game, the view should update to allow the player to interact with the game by pressing buttons, entering text input, drawing on a canvas, etc.

## Audience
- If the maximum number of players have already joined or the game has started, any further users who try to join will be put in the audience.
- The audience generally does not compete but might be able to influence the outcome of the game in some way.

### Project Setup
After downloading and unzipping the GIT folder, you will need to install dependencies before you can play. You can do so with the following command:
```
npm install
```

### Preferences
The root folder contains a prefs.json file for customising preferences. These include:
- The password required to host a game
- The minimum number of players required to start a game.
- The maximum number of players that can join a game.
You may also add your own preferences e.g. enable audience, hide code.

### Local Server
Run the local server with the following command:
```
node app.js
```

### Creating a new game
- Go to http://localhost:3000 on your web browser
- Under the 'Create Game' heading, enter the correct password then click 'Create'
- You will be taken to the host page, where you will be shown the room code and the lobby
- Once enough players have joined, you may start the game whenever you are ready

### Joining a game
- Go to http://localhost:3000 on your web browser
- Under the 'Join Game' heading, enter your desired name and the matching room code then click 'Connect'
- You will be taken to the game page, where you will need to wait for the host to start the game
