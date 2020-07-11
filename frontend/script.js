/*
       INDEX map

    24 0  1  2  31
    25 3  4  5  32
    26 6  7  8  33
    27 9 10  11 34
    28 12 13 14 35
    29 15 16 17 36
    30 18 19 20 37
       21 22 23
*/
const openGameTypeScreenDelay = 3000;
const drawingIntervalTime = 20;
const maxDiceValue = 4;
const tileMap = [
    11,0,21,
    10,0,20,
    10,0,20,
    10,1,20,
    -1,0,-1,
    12,0,22,
    11,0,21,
    10,0,20
];

const whitePlayerPath = [
    9,
    6,
    3,
    0,
    1,
    4,
    7,
    10,
    13,
    16,
    19,
    22,
    21,
    18,
    15
];
const blackPlayerPath = [
    11,
    8,
    5,
    2,
    1,
    4,
    7,
    10,
    13,
    16,
    19,
    22,
    23,
    20,
    17
];
var pieces = [
    {color:"white", index:24},
    {color:"white", index:25},
    {color:"white", index:26},
    {color:"white", index:27},
    {color:"white", index:28},
    {color:"white", index:29},
    {color:"white", index:30},
    {color:"black", index:31},
    {color:"black", index:32},
    {color:"black", index:33},
    {color:"black", index:34},
    {color:"black", index:35},
    {color:"black", index:36},
    {color:"black", index:37}
];
var pieceOnHand = {
    from:undefined,
    state:false
}
var currentAvaiablePlacementForPiece = undefined;
var canvas; 
var context; 
var playerColor = undefined;
var onlinePlayerTurn = undefined;
var drawingInterval; 
var mousePosition = {
    x:0,
    y:0
}
var uid = undefined; //User-identification for online games.
var gameMode = undefined; //Online or offline
var diceValue = undefined;

var onlineGameUpdateInterval = undefined;
const onlineGameUpdateIntervalMs = 1000;

var waitingForPlayerInterval = undefined;
const waitingForPlayerIntervalMs = 1000;

var image_tile = new Image(); 
var image_flower = new Image(); 
var image_white_stone = new Image(); 
var image_black_stone = new Image(); 

var gameFinished = false;
var lastShownedMessage = "";


var dicePanel = undefined;
var dicePanel_CurrentPlayer = undefined;
var dicePanel_CurrentPlayerButton = undefined;
var dicePanel_DiceValue = undefined;
var dicePanel_RollDiceButton = undefined;

image_tile.src="/graphics/Tile.png";
image_flower.src="/graphics/Flower_Tile.png";
image_white_stone.src="/graphics/White_Stone.png";
image_black_stone.src="/graphics/Black_Stone.png"; 

window.onload = function() {

    dicePanel = document.getElementById("dice-panel");
    dicePanel_CurrentPlayer = document.getElementById("dice-panel-current-player");
    dicePanel_CurrentPlayerButton = document.getElementById("dice-panel-current-player-button");
    dicePanel_DiceValue = document.getElementById("dice-panel-dice-value");
    dicePanel_RollDiceButton = document.getElementById("dice-panel-roll-dice-button");
    dicePanel_RollDiceButton.addEventListener("click", diceButtonClick);

    canvas = document.getElementById("canvas"); 
    context = canvas.getContext("2d"); 
    context.font = "Roboto";

    scaleCanvas();
    window.addEventListener("resize", scaleCanvas); 
    canvas.addEventListener("mousedown", onClick); 
    canvas.addEventListener("mouseup", onClick); 
    canvas.addEventListener("mousemove", onMouseMove);

    for (let element of document.getElementsByClassName("modal-close-button")) {

        element.addEventListener("click", function() {
            element.parentElement.parentElement.style.display = "none";
        });
    }
    document.getElementById("play-button").addEventListener("click", function() {
        gameMode = document.querySelector('input[name="game-type"]:checked').value;
        startNewGame(); 
        document.getElementById("play-button").parentElement.parentElement.style.display = "none";
    });
}

function diceButtonClick() {
    disableDicePanelRollDiceButton();
    rollDice();
    changeDicePanelDiceValueText();
}

function initDicePanelOnline() {
    dicePanel.style.display = "block";
    disableDicePanelRollDiceButton();
}

function initDicePanelOffline() {
    dicePanel.style.display = "block";
    dicePanel_DiceValue.style.display = "none";
}

function enableDicePanelRollDiceButton() {
    dicePanel_RollDiceButton.style.display = "block";
    dicePanel_DiceValue.style.display = "none";

    if(gameMode == "online")
        disableDicePanelRollDiceButton(); 
}

function disableDicePanelRollDiceButton() {
    dicePanel_RollDiceButton.style.display = "none";
    dicePanel_DiceValue.style.display = "block";
}

function changeDicePanelDiceValueText() {
    dicePanel_DiceValue.innerHTML = "Moves: " + diceValue;
}

function changeDicePanelCurrentPlayerText() {

    if(gameMode == "online") {
        
        if(onlinePlayerTurn == playerColor) {
            dicePanel_CurrentPlayer.innerHTML = "Your turn."; 
            dicePanel_CurrentPlayer.style.color = playerColor;
            return; 
        }
        dicePanel_CurrentPlayer.innerHTML = onlinePlayerTurn == "white" ? "White" : "Black";
        dicePanel_CurrentPlayer.style.color = onlinePlayerTurn;
        return; 
    }

    dicePanel_CurrentPlayer.innerHTML = playerColor == "white" ? "White" : "Black";
    dicePanel_CurrentPlayer.style.color = playerColor;

    dicePanel_CurrentPlayerButton.innerHTML = playerColor == "white" ? "White" : "Black";
    dicePanel_CurrentPlayerButton.style.color = playerColor;
}
function enableWaitingForPlayer() {

    document.getElementById("waiting-for-player").style.display = "block";
    waitingForPlayerInterval = setInterval(function() {
        let waitingForPlayerText = document.getElementById("waiting-for-player-text").innerText;
        document.getElementById("waiting-for-player-text").innerText = waitingForPlayerText == "Waiting for player." ? "Waiting for player.." : waitingForPlayerText == "Waiting for player.." ? "Waiting for player..." : waitingForPlayerText == "Waiting for player..." ? "Waiting for player." : "Waiting for player.";

    }, waitingForPlayerIntervalMs);
}

function disableWaitingForPlayer() {

    clearInterval(waitingForPlayerInterval);
    waitingForPlayerInterval = undefined;
    document.getElementById("waiting-for-player").style.display = "none";
}

function startNewGame() {
    

    drawingInterval = setInterval(draw,drawingIntervalTime); //Setting the drawing interval

    if(gameMode == "offline") {
        let random = Math.round(Math.random() * 1);
        playerColor = random == 1 ? "black" : "white";
        initDicePanelOffline();

    } else if(gameMode == "online") {
        //Fetch a online game id and start the game. 
        //Display waiting for player html content.

        enableWaitingForPlayer();

        fetch("/newgame").then(response => response.json()).then((response) => {

            uid = JSON.parse(response).uid;

            //Getting player color.
            fetch("/color?uid=" + uid).then(color => color.json()).then((color) => {

                playerColor = color.toLowerCase();
            });

            onlineGameUpdateInterval = setInterval(function() {

                fetch("/gameupdate?uid=" + uid).then(response => response.json()).then((response) => {
                    let gameUpdate = JSON.parse(response);
                    handleOnlineGameUpdate(gameUpdate);
                });
            }, onlineGameUpdateIntervalMs);
        });

    } else {
        console.error("GameMode is not correctly specified");
    }
}

function handleOnlineGameUpdate(gameUpdate) {

    switch (gameUpdate.gamestate) {
        case "LOBBY":
            break;
        case "INGAME":
            initDicePanelOnline();
            disableWaitingForPlayer();
            setupPiecesFromOnlineGameUpdate(gameUpdate);
            onlinePlayerTurn = gameUpdate.playerturn.toLowerCase();
            diceValue = gameUpdate.dicevalue;
            changeDicePanelDiceValueText();
            changeDicePanelCurrentPlayerText(); 
            break;
        case "white_victory":
            console.log("White victory");
            break;
        case "black_victory":
            console.log("Black victory");
            break;
    }
}

function setupPiecesFromOnlineGameUpdate(gameUpdate) {

    if(pieceOnHand.piece != undefined)  {
        console.log("Hitting this."); 
        return; 

    }
        
    pieces = [];
    let newPieces = gameUpdate.board.pieces;
    for(let i = 0; i < newPieces.length; i++) {
        let newPiece = newPieces[i];
        newPiece.color = newPiece.color.toLowerCase();
        pieces.push(newPiece); 
    }
}
function changeTurn() {

    if(gameMode == "offline") {
        offlineChangeTurn();
    } else {
        //Change turn online.
    }
}
function offlineChangeTurn()  {

    diceValue = 0;
    playerColor = playerColor == "white" ? "black" : "white";

    changeDicePanelCurrentPlayerText();
    enableDicePanelRollDiceButton();
}

function updateRawMousePosition(event) {
    let rect = canvas.getBoundingClientRect();
    mousePosition.x = event.clientX - rect.left;
    mousePosition.y = event.clientY - rect.top;


}
function onMouseMove(event) {
    updateRawMousePosition(event);
}
function getCanvasXSize() {
    return window.innerWidth / 3.5; 
}

function scaleCanvas() {
    canvas.width = getCanvasXSize(); 
    canvas.height = window.innerHeight; 
}

function getTileSize() {
    return getCanvasXSize() / 5; 
}

function tileMapIndexToPosition(index) {
    return {
        x:(index % 3),
        y:Math.floor(index / 3)
    };
}
function tileMapPositionToIndex(x,y) {
    return x <= -1 ? 24 + y : x >= 3 ? 31 + y : 3 * y + x;
}
function getTileImageBasedOnTileMapNumber(number) {
    switch(number) {
        case 11: case 21: case 1: return image_flower;
        case 10: case 20: case 0: return image_tile;
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); 
    drawStones();
    drawCurrentPlacementsForPiece();
    drawStoneAtHand();
}
function drawCurrentPlacementsForPiece() {

    if(currentAvaiablePlacementForPiece == undefined)
        return;

    context.strokeStyle = "#FF0000";
    let pos = tileMapIndexToPosition(currentAvaiablePlacementForPiece);
    context.strokeRect(getTileSize() + (pos.x * getTileSize()), pos.y * getTileSize(), getTileSize(), getTileSize());
}
function drawBackground() {
    for(let i = 0; i < tileMap.length; i++) {
        let pos = tileMapIndexToPosition(i); 
        let img = getTileImageBasedOnTileMapNumber(tileMap[i]); 

        if(img != undefined) context.drawImage(img, (pos.x * getTileSize()) + getTileSize(), pos.y * getTileSize(), getTileSize(), getTileSize());
    }
}
function drawStoneAtHand() {
    if(pieceOnHand.state == true)
        context.drawImage(pieceOnHand.piece.color == "white" ? image_white_stone : image_black_stone, mousePosition.x - (getTileSize() / 2), mousePosition.y - (getTileSize() / 2), getTileSize(), getTileSize());

}
function drawStones() {
    for(let i = 0; i < pieces.length; i++) 
        drawStone(pieces[i].index, pieces[i].color == "white" ? image_white_stone : image_black_stone); 
}

function drawStone(index, img) {

    if(index >= tileMap.length) {
        switch(index) {
            case 24:
                context.drawImage(img, 0, 0 * getTileSize(), getTileSize(), getTileSize());
            break; 
            case 25:
                context.drawImage(img, 0, 1 * getTileSize(), getTileSize(), getTileSize());
            break; 
            case 26: 
            context.drawImage(img, 0, 2 * getTileSize(), getTileSize(), getTileSize());
            break;
            case 27: 
            context.drawImage(img, 0, 3 * getTileSize(), getTileSize(), getTileSize());
            break; 
            case 28:
                context.drawImage(img, 0, 4 * getTileSize(), getTileSize(), getTileSize());
            break;
            case 29: 
                context.drawImage(img, 0, 5 * getTileSize(), getTileSize(), getTileSize());
            break; 
            case 30: 
                context.drawImage(img, 0, 6 * getTileSize(), getTileSize(), getTileSize());
            break;
            case 31:
                context.drawImage(img, 4 * getTileSize(), 0 * getTileSize(), getTileSize(), getTileSize());
            break; 
            case 32:
                context.drawImage(img, 4 * getTileSize(), 1 * getTileSize(), getTileSize(), getTileSize());
            break; 
            case 33: 
                context.drawImage(img, 4 * getTileSize(), 2 * getTileSize(), getTileSize(), getTileSize());
            break; 
            case 34: 
                context.drawImage(img, 4 * getTileSize(), 3 * getTileSize(), getTileSize(), getTileSize());
            break; 
            case 35: 
                context.drawImage(img, 4 * getTileSize(), 4 * getTileSize(), getTileSize(), getTileSize());
            break; 
            case 36: 
                context.drawImage(img, 4 * getTileSize(), 5 * getTileSize(), getTileSize(), getTileSize());
            break; 
            case 37: 
                context.drawImage(img, 4 * getTileSize(), 6 * getTileSize(), getTileSize(), getTileSize());
            break;
        }
        return; 
    }
    let pos = tileMapIndexToPosition(index); 
    context.drawImage(img, (pos.x * getTileSize()) + getTileSize(), pos.y * getTileSize(), getTileSize(), getTileSize());
}

function getCurrentMouseTileFromMousePosition() {

    let x = Math.floor(mousePosition.x / getTileSize()) - 1; // Legger på -1 fordi jeg vil at x: 0 skal være på selve brettet.
    let y = Math.floor(mousePosition.y / getTileSize());

    return {x:x,y:y}; 
}

function onClick(event) {

    let mouseTile = getCurrentMouseTileFromMousePosition();

    if(pieceOnHand.state == false && event.type == "mousedown") {
        pickUpPiece(tileMapPositionToIndex(mouseTile.x,mouseTile.y)); 
    } 
    else if(pieceOnHand.state == true && event.type == "mouseup") {
        putDownPiece(tileMapPositionToIndex(mouseTile.x, mouseTile.y));

    }

    if(event.type == "mouseup") {
        currentAvaiablePlacementForPiece = undefined;
    }
}

function getPieceAtIndex(index) {
    for(let i = 0; i < pieces.length; i++) 
        if(pieces[i].index == index)
            return pieces[i]; 

    return undefined; 
}

function pickUpPiece(index) {

    if(gameFinished)
        return;


    if(gameMode == "online" && onlinePlayerTurn != playerColor) 
        return; 

    for(let i = 0; i < pieces.length; i++) {
        if(pieces[i].index == index && pieces[i].color == playerColor) {

            let placementPositions = calculateAllPossiblePiecePlacements();
            pieceOnHand.piece = pieces[i];
            pieceOnHand.state = true; 
            pieces.splice(i,1);

            for(let i = 0; i < placementPositions.length; i++) {

                currentAvaiablePlacementForPiece = placementPositions[i].from == pieceOnHand.piece.index ? placementPositions[i].to : undefined;

                if(currentAvaiablePlacementForPiece != undefined)
                    break;
            }
        }
    }
}
function placePieceOffBoard(piece) {

    let startingIndex = piece.color == "white" ? 24 : 31; 

    for(let i = startingIndex; i < startingIndex + 6; i++) {

        let freeSpace = true; 

        for(let j = 0; j < pieces.length; j++) {
            if(pieces[j].index == i) {
                freeSpace = false;
            }
        }

        if(freeSpace) {
            piece.index = i;
            pieces.push(piece);
            return; 
        }
    }
    
    console.error("Could not find available space.");
}
function openGameTypeScreenDelayed() {
    setTimeout(function() {
        document.getElementById("choose-game-type-modal").style.display = "block"; 
    }, openGameTypeScreenDelay);
}
function checkForWinCondition(color) {
    for(let i = 0; i < pieces.length; i++)
        if(pieces[i].color == color) return false;
    return true;
}

function putDownPiece(index) {

    function clearPieceOnHand() {
        pieceOnHand.piece = undefined;
        pieceOnHand.state = false;
    }

    if(index == currentAvaiablePlacementForPiece) {

        //Checking if a player is placing the piece on a winning square.
        if((index == 15 && pieceOnHand.piece.color == "white") || (index == 17 && pieceOnHand.piece.color == "black")) {

            if(checkForWinCondition("white")) {
                console.log("White player won!"); 
                gameFinished = true;
                openGameTypeScreenDelayed();
            }

            if(checkForWinCondition("black")) {
                console.log("Black player won!"); 
                gameFinished = true;
                openGameTypeScreenDelayed();
            }
            sendMove(pieceOnHand.piece.index, index);
            clearPieceOnHand();
            changeTurn();
            return;
        }

        let pieceAtIndex = getPieceAtIndex(index);

         if((index == 10 || index == 0 || index == 2 || index == 18 || index == 20) && pieceAtIndex == undefined) { // This is all special squares, give extra turn.

            sendMove(pieceOnHand.piece.index, index);

            pieceOnHand.piece.index = index;
            pieces.push(pieceOnHand.piece);
            clearPieceOnHand(); 
            console.log("Bonus turn!"); 
            diceValue = 0;

            //Instead of changeTurn();
            if(gameMode == "offline") {
                changeDicePanelCurrentPlayerText();
                enableDicePanelRollDiceButton();
            }

             return;
        }

        if(pieceAtIndex == undefined) { // Valid. Placing the piece at the position.

            sendMove(pieceOnHand.piece.index, index);

            pieceOnHand.piece.index = index;
            pieces.push(pieceOnHand.piece);
            clearPieceOnHand(); 
            changeTurn();

        } else if(pieceAtIndex.color == pieceOnHand.piece.color) { // Not valid, putting the piece back where it was.

            pieces.push(pieceOnHand.piece);
            clearPieceOnHand(); 

        } else if(pieceAtIndex.color != pieceOnHand.piece.color) { // Valid. Placing the piece at the position and placing the opponents piece off the board.

            sendMove(pieceOnHand.piece.index, index);

            placePieceOffBoard(pieceAtIndex);
            pieceOnHand.piece.index = index;
            pieces.push(pieceOnHand.piece);
            clearPieceOnHand(); 
            changeTurn();
        }
    } else { // Not valid. Placing the piece back where it was.
        pieces.push(pieceOnHand.piece);
        clearPieceOnHand(); 
    }
}

function sendMove(from, to) {
    if(gameMode == "online") {
        fetch("/move?uid=" + uid,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({from: from,to:to})
            }).then(function(res) {
        });
        console.log("Sending from:" + from + " and to: " + to);
    }
}
function calculateAllPossiblePiecePlacements() {

    let moves = [];

    for(let i = 0; i < pieces.length; i++)  {

        let piece = pieces[i];

        if(piece.color != playerColor)
            continue;

        let pathValue = playerColor == "white" ? whitePlayerPath[playerPathPositionToPlayerPathIndex(piece.index) + diceValue] : blackPlayerPath[playerPathPositionToPlayerPathIndex(piece.index) + diceValue];

        if(pathValue == undefined)
            continue;

        let pieceAtIndex = getPieceAtIndex(pathValue);

        if(pathValue == 10 && pieceAtIndex != undefined)
            continue;

        if(pieceAtIndex == undefined || pieceAtIndex.color != playerColor) {
            moves.push({from:piece.index,to:pathValue});
            continue;
        }

        if(pieceAtIndex.color == playerColor)
            continue;
    }

    return moves;
}
function playerPathPositionToPlayerPathIndex(position) {

    if(position >= 24)
        return - 1; // 0 is a bug.

    for(let i = 0; i < whitePlayerPath.length; i++)
        if(whitePlayerPath[i] == position)
            return i;

    for(let i = 0; i < blackPlayerPath.length; i++)
        if(blackPlayerPath[i] == position)
            return i;


    return undefined;
}
function calculatePiecePlacementPosition(piecePosition, pieceColor, randomNumber) {
    if(pieceColor == "white") {
        if(piecePosition >= 24) {
            return whitePlayerPath[randomNumber - 1];
        } else {
            for(let i = 0; i < whitePlayerPath.length; i++)
                if(whitePlayerPath[i] == piecePosition)
                    return ((i + randomNumber) > whitePlayerPath.length - 1) ? undefined : whitePlayerPath[i + randomNumber];
        }
    } else {
        if (piecePosition >= 24) {
            return blackPlayerPath[randomNumber - 1];
        } else {
            for (let i = 0; i < blackPlayerPath.length; i++)
                if (blackPlayerPath[i] == piecePosition)
                    return ((i + randomNumber) > blackPlayerPath.length - 1) ? undefined : blackPlayerPath[i + randomNumber];
        }
    }

    console.error("Did not find a suitable path for the values.");
    return undefined;
}
function rollDice() {

    let value = Math.round(Math.random() * maxDiceValue); // Random number 0 - 4.

    console.log(value); 
    diceValue = value;

    if(diceValue == 0) {
        changeTurn();
        console.log("Dice is 0. Changing turn."); 
        return;
    }

    if(calculateAllPossiblePiecePlacements().length == 0) {
        changeTurn();
        console.log("No moves. Changing turn."); 
    }
}