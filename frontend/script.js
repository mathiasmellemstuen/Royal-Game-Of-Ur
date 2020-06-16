/*
 Index map (for clarity)

    24 0  1  2  31
    25 3  4  5  32
    26 6  7  8  33
    27 9 10  11 34
    28 12 13 14 35
    29 15 16 17 36
    30 18 19 20 37
       21 22 23
*/
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
var playerColor = "white";
var drawingInterval; 
var mousePosition = {
    x:0,
    y:0
}
var gameID = undefined; // ID for online games. 
var gameMode = undefined; //Online or offline
var diceValue = undefined;

var overlayText = "";
var overlayAlpha = 0.0;
var overlayFadeFactor = 0.01;

var image_tile = new Image(); 
var image_flower = new Image(); 
var image_white_stone = new Image(); 
var image_black_stone = new Image(); 


image_tile.src="/graphics/Tile.png";
image_flower.src="/graphics/Flower_Tile.png";
image_white_stone.src="/graphics/White_Stone.png";
image_black_stone.src="/graphics/Black_Stone.png"; 

window.onload = function() {

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

    document.getElementById("roll-dice-button-white").addEventListener("click", diceButtonWhiteClick);
    document.getElementById("roll-dice-button-black").addEventListener("click", diceButtonBlackClick);

    document.getElementById("play-button").addEventListener("click", function() {
        gameMode = document.querySelector('input[name="game-type"]:checked').value;
        startNewGame(); 
        document.getElementById("play-button").parentElement.parentElement.style.display = "none";
    });

    document.getElementById("white-dice-div").style.display = "block";
    document.getElementById("black-dice-div").style.display = "none";
}

function diceButtonWhiteClick() {
    diceValue = rollDice();
    document.getElementById("roll-dice-button-white").style.display = "none";
    document.getElementById("roll-dice-text-white").style.display = "block";
    document.getElementById("roll-dice-text-white").innerHTML = diceValue;
}

function diceButtonBlackClick() {
    diceValue = rollDice();
    document.getElementById("roll-dice-button-black").style.display = "none";
    document.getElementById("roll-dice-text-black").style.display = "block";
    document.getElementById("roll-dice-text-black").innerHTML = diceValue;
}
function toggleWhiteDiv() {
    document.getElementById("white-dice-div").style.display = "block";
    document.getElementById("black-dice-div").style.display = "none";
    document.getElementById("roll-dice-button-white").style.display = "block";
    document.getElementById("roll-dice-text-white").style.display = "none";

}
function toggleBlackDiv() {
    document.getElementById("black-dice-div").style.display = "block";
    document.getElementById("white-dice-div").style.display = "none";
    document.getElementById("roll-dice-button-black").style.display = "block";
    document.getElementById("roll-dice-text-black").style.display = "none";
}

function startNewGame() {
    
    if(gameMode == "offline") {
        let random = rollDice();
        playerColor = random > 2 ? "black" : "white"; 

        if(playerColor == "white") {
            toggleWhiteDiv();
        } else {
            toggleBlackDiv();
        }
    } else if(gameMode == "online") {
        //Fetch a online game id and start the game. 
        //Display waiting for player html content.

    } else {
        console.error("GameMode is not correctly specified");
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

    playerColor = playerColor == "white" ? "black" : "white";

    if(playerColor == "white") {
        toggleWhiteDiv();
    } else {
        toggleBlackDiv();
    }

    draw();
}


function updateRawMousePosition(event) {
    let rect = canvas.getBoundingClientRect();
    mousePosition.x = event.clientX - rect.left;
    mousePosition.y = event.clientY - rect.top;


}
function onMouseMove(event) {
    updateRawMousePosition(event);

    if(drawingInterval == undefined)
        drawingInterval = setInterval(draw, drawingIntervalTime);
}
function getCanvasXSize() {
    return window.innerWidth / 3.5; 
}

function scaleCanvas() {
    canvas.width = getCanvasXSize(); 
    canvas.height = window.innerHeight; 

    draw(); //Redrawing because of the rescaling. 
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
    drawOverlayText();
}

function showOverlayText(text) {
    overlayText = text;
    overlayAlpha = 1.0;
}
function drawOverlayText() {

    context.font = "30px Arial";
    let textWidth = context.measureText(overlayText).width;
    let textHeight = context.measureText("M").width;
    context.fillStyle = "rgba(37, 92, 61, " + overlayAlpha + ")";
    context.fillRect((canvas.width / 2) - (textWidth / 2) - 15,textHeight - 15, textWidth + 30,textHeight + 30);
    context.fillStyle = "rgba(0, 0, 0, " + overlayAlpha + ")";
    context.fillRect((canvas.width / 2) - (textWidth / 2) - 10,textHeight - 10, textWidth + 20,textHeight + 20);
    context.fillStyle = "rgba(255, 255, 255, " + overlayAlpha + ")";
    context.fillText(overlayText, (canvas.width / 2) - (textWidth / 2), 50);
    overlayAlpha = overlayAlpha - overlayFadeFactor;
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
        draw(); // Drawing the changes to remove the red square.
    }
}

function getPieceAtIndex(index) {
    for(let i = 0; i < pieces.length; i++) 
        if(pieces[i].index == index)
            return pieces[i]; 

    return undefined; 
}

function pickUpPiece(index) {
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
    draw();
    //drawingInterval = setInterval(draw, drawingIntervalTime);
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
function checkForWinCondition(color) {
    for(let i = 0; i < pieces.length; i++)
        if(pieces[i].color == color) return false;
    return true;
}
function putDownPiece(index) {

    if(index == currentAvaiablePlacementForPiece) {

        //Checking if a player is placing the piece on a winning square.
        if(index == 15 && pieceOnHand.piece.color == "white") {

            if(checkForWinCondition("white"))
                showOverlayText("Player white won!");

            pieceOnHand.piece = undefined;
            pieceOnHand.state = false;
            clearInterval(drawingInterval);
            drawingInterval = undefined;
            draw();
            changeTurn();
            return;
        } else if(index == 17 && pieceOnHand.piece.color == "black") {

            if(checkForWinCondition("black"))
                showOverlayText("Player black won!");

            pieceOnHand.piece = undefined;
            pieceOnHand.state = false;
            clearInterval(drawingInterval);
            drawingInterval = undefined;
            draw();
            changeTurn();
            return;
        }

        let pieceAtIndex = getPieceAtIndex(index);

         if((index == 10 || index == 0 || index == 2 || index == 18 || index == 20) && pieceAtIndex == undefined) { // This is all special squares, give extra turn.

            pieceOnHand.piece.index = index;
            pieces.push(pieceOnHand.piece);
            pieceOnHand.piece = undefined;
            pieceOnHand.state = false;
            clearInterval(drawingInterval);
            drawingInterval = undefined;
            draw(); // Redrawing
            showOverlayText("Bonus turn!");

            if(playerColor == "white") {
                toggleWhiteDiv();
            } else {
                toggleBlackDiv();
            }
            return;
        }

        if(pieceAtIndex == undefined) { // Valid. Placing the piece at the position.

            pieceOnHand.piece.index = index;
            pieces.push(pieceOnHand.piece);
            pieceOnHand.piece = undefined;
            pieceOnHand.state = false;
            clearInterval(drawingInterval);
            drawingInterval = undefined;
            draw(); // Redrawing
            changeTurn();

        } else if(pieceAtIndex.color == pieceOnHand.piece.color) { // Not valid, putting the piece back where it was.

            pieces.push(pieceOnHand.piece);
            pieceOnHand.piece = undefined;
            pieceOnHand.state = false;
            clearInterval(drawingInterval);
            drawingInterval = undefined;
            draw(); // Redrawing

        } else if(pieceAtIndex.color != pieceOnHand.piece.color) { // Valid. Placing the piece at the position and placing the opponents piece off the board.
            placePieceOffBoard(pieceAtIndex);
            pieceOnHand.piece.index = index;
            pieces.push(pieceOnHand.piece);
            pieceOnHand.piece = undefined;
            pieceOnHand.state = false;
            clearInterval(drawingInterval);
            drawingInterval = undefined;
            draw(); // Redrawing
            changeTurn();
        }
    } else { // Not valid. Placing the piece back where it was.
        pieces.push(pieceOnHand.piece);
        pieceOnHand.piece = undefined;
        pieceOnHand.state = false;
        clearInterval(drawingInterval);
        drawingInterval = undefined;
        draw(); // Redrawing

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

    if(value == 0) {
        showOverlayText("Dice is 0. Changing turn.");
        changeTurn();
    }
    return value;

}
