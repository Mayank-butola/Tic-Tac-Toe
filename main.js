let computerIsPlaying = false;

let playerProto = {};
let player = function(name, score, piece){
    let player = Object.create(playerProto);
    player.name = name;
    player.score = score;
    player.piece = piece;
    return player;
}

let player1 = player('player1', 0, 'O');
let player2 = player('player2', 0, 'X');

let nodeProto = {

    isWinForSymbol: function(symbol){
        if(this.position[0] == symbol && this.position[1] == symbol && this.position[2] == symbol
            || this.position[3] == symbol && this.position[4] == symbol && this.position[5] == symbol
            || this.position[6] == symbol && this.position[7] == symbol && this.position[8] == symbol){
                return true;
            } // HORIZONTAL CHECK
        if(this.position[0] == symbol && this.position[3] == symbol && this.position[6] == symbol
            || this.position[1] == symbol && this.position[4] == symbol && this.position[7] == symbol
            || this.position[2] == symbol && this.position[5] == symbol && this.position[8] == symbol){
                return true;
            } // VERTICAL CHECK
        if(this.position[0] == symbol && this.position[4] == symbol && this.position[8] == symbol
            || this.position[2] == symbol && this.position[4] == symbol && this.position[6] == symbol){
                return true;
            } // DIAGONAL CHECK
        return false;
    },

    isDraw: function(){
        if(this.isWinForSymbol('X') || this.isWinForSymbol('O')){
            return false;
        }
        for(elem of this.position){
            if(elem == ''){
                return false;
            }
        }
        return true;
    },
    getValue: function(){
        if(this.isWinForSymbol('X')){
            return 1;
        }
        if(this.isWinForSymbol('O')){
            return -1;
        }else{
            return 0;
        }
    },
    isTerminal: function(){
        return (this.isWinForSymbol('X') || this.isWinForSymbol('O') || this.isDraw());
    },
    getMoveFromPosition(position){
        switch(position){
            case 0:
                return 'a1';
            case 1:
                return 'b1';
            case 2:
                return 'c1';
            case 3:
                return 'a2';
            case 4:
                return 'b2';
            case 5:
                return 'c2';
            case 6:
                return 'a3';
            case 7:
                return 'b3';
            case 8:
                return 'c3';
        }
    },
    getChildren: function(){
        let children = [];
        let moveNumber = 0;
        for(let i = 0; i < this.position.length; i++){
            if(this.position[i] != ''){
                moveNumber++;
            }
        }
        let currentTurn = (moveNumber%2 == 0)? 'X': 'O';
        for(let i = 0; i<this.position.length; i++){
            if(this.position[i] != ''){
                continue;
            }
            let childArr = [...this.position];
            childArr[i] = currentTurn;
            children.push(nodeFactory(childArr, this.getMoveFromPosition(i)));
        }
        return children;
    }
};
let nodeFactory = function(position, lastMove){
    let node = Object.create(nodeProto);
    node.position = position;
    node.lastMove = lastMove || '';
    return node;
};

let Computer = (function(){
    let depth;
    let minimax = function(node, depth, maximizingPlayer){

        if(depth == 0 || node.isTerminal()){
            return {value: node.getValue(), optimalNode: node};
        }
        let optimalNode;
        let value;
        let children = node.getChildren();
        if(maximizingPlayer){
            value = -2;
            for(child of children){
                let childCopy = Object.create(nodeProto);
                Object.assign(childCopy, child);
                let newVal = minimax(child, depth-1, false).value;
                if(newVal > value){
                    value = newVal;
                    optimalNode = childCopy;
                }
            }
        }else{
            value = 2;
            for(child of children){
                let childCopy = Object.create(nodeProto);
                Object.assign(childCopy, child);
                let newVal = minimax(child, depth-1, true).value;
                if(newVal < value){
                    value = newVal;
                    optimalNode = childCopy;
                }
            }
        }
        return {value, optimalNode};
    };
    return{
        getBestMove(){
            let position = [];
            let board = document.querySelectorAll('.game-board div');
            for(let i = 0; i < board.length; i++){
                if(board[i].textContent == ''){
                    position.push('');
                }else if (board[i].textContent == 'X'){
                    position.push('X');
                }else if(board[i].textContent == 'O'){
                    position.push('O');
                }
            }
            let node = nodeFactory(position);
            let result = minimax(node, 10, false).optimalNode.lastMove;
            return result;
        }
    };
})();

let DisplayController = (function(){
    let gameMessageBox = document.querySelector('.game-message-box');
    return{
        writeSymbol: function(elem, text){
            elem.textContent = text;
        },
        showGameOverSign: function(message){
            let gameOverMessage = document.querySelector('#game-over-message');
            gameMessageBox.style.display = 'block';
            gameOverMessage.textContent = message;

        },
        hideGameOverSign: function(){
            gameMessageBox.style.display = 'none';
        },
        drawScores: function(){
            let player1Score = document.querySelector('#player1-score');
            let player2Score = document.querySelector('#player2-score');
            player1Score.textContent = player1.score;
            player2Score.textContent = player2.score;
        }
    }
})();

let Gameboard = (function(){
    let squares = document.querySelectorAll('.game-board div');

    squares.forEach(div=>{
        div.addEventListener('click', square=>{
            Game.attemptMove(div);
        });
    });
    let cleanBoard = function(){
        squares.forEach(square => square.textContent = '');
    }
    let squareValues = function(){
        return {
            'a1': {value : document.querySelector('#a1').textContent},
            'b1': {value : document.querySelector('#b1').textContent},
            'c1': {value : document.querySelector('#c1').textContent},
            'a2': {value : document.querySelector('#a2').textContent},
            'b2': {value : document.querySelector('#b2').textContent},
            'c2': {value : document.querySelector('#c2').textContent},
            'a3': {value : document.querySelector('#a3').textContent},
            'b3': {value : document.querySelector('#b3').textContent},
            'c3': {value : document.querySelector('#c3').textContent},
        };
    };
    
    return {squareValues, cleanBoard};
})();

let Game = (function(){
    let currentTurn = 'X';
    let gameIsOver = false;
    let playAgainButton = document.querySelector('#play-again');
    playAgainButton.addEventListener('click', e=>{resetGame()});
    let hasFullVertical= function(){
        if((Gameboard.squareValues().a1.value !== '' 
            && Gameboard.squareValues().a1.value === Gameboard.squareValues().a2.value 
            && Gameboard.squareValues().a1.value === Gameboard.squareValues().a3.value) 
                || 
            ( Gameboard.squareValues().b1.value !== '' 
            && Gameboard.squareValues().b1.value === Gameboard.squareValues().b2.value 
            && Gameboard.squareValues().b1.value === Gameboard.squareValues().b3.value)
                || 
            (Gameboard.squareValues().c1.value !== '' 
            && Gameboard.squareValues().c1.value === Gameboard.squareValues().c2.value 
            && Gameboard.squareValues().c1.value === Gameboard.squareValues().c3.value) ){
            return true;
        }
        return false;

    };
    let hasFullHorizontal = function(){
        if((Gameboard.squareValues().a1.value !== '' 
            && Gameboard.squareValues().a1.value === Gameboard.squareValues().b1.value 
            && Gameboard.squareValues().a1.value === Gameboard.squareValues().c1.value) 
            || 
            (Gameboard.squareValues().a2.value !== '' 
            && Gameboard.squareValues().a2.value === Gameboard.squareValues().b2.value 
            && Gameboard.squareValues().a2.value === Gameboard.squareValues().c2.value)
            || 
            (Gameboard.squareValues().a3.value !== '' 
            && Gameboard.squareValues().a3.value === Gameboard.squareValues().b3.value 
            && Gameboard.squareValues().a3.value === Gameboard.squareValues().c3.value) ){
                return true;
            }
        return false;
    };
    let hasFullDiagonal = function(){
        if((Gameboard.squareValues().a1.value !== '' 
            && Gameboard.squareValues().a1.value === Gameboard.squareValues().b2.value 
            && Gameboard.squareValues().a1.value === Gameboard.squareValues().c3.value) 
            || 
            (Gameboard.squareValues().c1.value !== '' 
            && Gameboard.squareValues().c1.value === Gameboard.squareValues().b2.value 
            && Gameboard.squareValues().c1.value === Gameboard.squareValues().a3.value)){
                return true;
            }
        return false;
    };
    let gameOver = function(){
        if(hasFullVertical()
        || hasFullHorizontal()
        || hasFullDiagonal()){
            return true;
        }
        return false;
    };
    let isDraw = function(){
        if(gameOver()) {
            return false;
        }
        for(key in Gameboard.squareValues()){
            if(Gameboard.squareValues()[key].value == ''){
                return false;
            }
        }
        return true;
    };
    let updateScores = function(){
        if(isDraw()){
            return;
        }
        if(currentTurn == 'X'){
            player1.score++;
        }
        if(currentTurn == 'O'){
            player2.score++;
        }
        DisplayController.drawScores();
    };

    let resetGame = function(){
        gameIsOver = false;
        currentTurn = 'X';
        Gameboard.cleanBoard();
        DisplayController.hideGameOverSign();
    };
    
    let getRoundMessage = function(){
        let message = currentTurn;
        if(isDraw()){
            message = "Draw";
        }
        if(message == 'X'){
            message = `${player1.name} Wins!`;
        }
        if(message == 'O'){
            message = `${player2.name} Wins!`;
        }
        return message;
    };

    let handleGameOver = function(){
        if(gameOver() || isDraw()){
            let message = getRoundMessage();
            DisplayController.showGameOverSign(message);
            updateScores();
            currentTurn = 'X';
            gameIsOver = true;
        }
    };

    let makeComputerMove = function(){
        let move = Computer.getBestMove();
        let square = document.querySelector('#' + move);
        DisplayController.writeSymbol(square, currentTurn);
    };

    return{
        attemptMove: function(square){
            
            if(square.textContent == "" && !gameIsOver){
                DisplayController.writeSymbol(square, currentTurn);
                handleGameOver();
                if(gameIsOver) return;

                currentTurn = (currentTurn == 'O')? 'X': 'O';
                if(computerIsPlaying){
                    makeComputerMove();
                    handleGameOver();
                    currentTurn = (currentTurn == 'O')? 'X': 'O';
                }
            }   
        },
        resetGame: resetGame
    };
})();

function editPlayerName(player){
    let playerSelector = (player == 1)? '.player1' : '.player2';
    let selectedPlayer = (player == 1)? player1 : player2;
    let playerDiv = document.querySelector(playerSelector);
    let playerPara = document.querySelector(playerSelector +'-name');
    let playerInput = document.createElement('input');
    playerInput.classList.add('score-input');
    playerInput.addEventListener('keyup', e=>{
        if(e.key == 'Enter'){
            playerPara.textContent = playerInput.value;
            selectedPlayer.name = playerInput.value;
            if(player == 1){
                playerDiv.appendChild(playerPara);
            }else{
                playerDiv.insertAdjacentElement('afterbegin',playerPara);
            }
            playerDiv.removeChild(playerInput);
        }
    });
    if(player == 1){
        playerDiv.appendChild(playerInput);
    }else{
        playerDiv.insertAdjacentElement('afterbegin',playerInput);
    }
    playerDiv.removeChild(playerPara);

    selectedPlayer.name = playerPara.textContent;
}

function resetScore(){
    player1.score = 0;
    player2.score = 0;
    DisplayController.drawScores();
}

document.querySelector('#edit-player1').addEventListener('click',(e)=>{
    editPlayerName(1);
});

document.querySelector('#edit-player2').addEventListener('click',(e)=>{
    editPlayerName(2);
});

document.querySelector('#reset-score').addEventListener('click', (e)=>{
    resetScore();
    Game.resetGame();
    Gameboard.cleanBoard();
});

//TODO When the select player button is clicked after the edit button has been clicked, and the name hasn't been set, an error occurs

document.querySelector('#select-player').addEventListener('click', (e)=>{
    let selectPlayerButton = document.querySelector('#select-player');
    let playerPara = document.querySelector('.player2-name');
    if(selectPlayerButton.textContent == 'Play vs AI'){
        player2.name = 'Computer';
        playerPara.textContent = player2.name;
        selectPlayerButton.textContent = '2 Players';
        computerIsPlaying = true;
    }else{
        player2.name = 'Player 2';
        playerPara.textContent = player2.name;
        selectPlayerButton.textContent = 'Play vs AI';
        computerIsPlaying = false;
    }
    resetScore();
    Game.resetGame();
    Gameboard.cleanBoard();
});