var canvas; 
var context; 
var playerColor = "white"; 
var drawingInterval; 
var mousePosition = {
    x:0,
    y:0
}
const drawingIntervalTime = 20; 

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
const tileMap = [
    11,0,21,
    10,0,20,
    10,0,20,
    10,1,20,
    -1,0,-1,
    -1,0,-1,
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
    18
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
    20
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

    scaleCanvas();
    window.addEventListener("resize", scaleCanvas); 
    canvas.addEventListener("mousedown", onClick); 
    canvas.addEventListener("mouseup", onClick); 
    canvas.addEventListener("mousemove", updateRawMousePosition);
}

function updateRawMousePosition(event) {
    let rect = canvas.getBoundingClientRect();
    mousePosition.x = event.clientX - rect.left;
    mousePosition.y = event.clientY - rect.top;
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
    drawStoneAtHand(); 
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
        context.drawImage(pieceOnHand.piece.color == "white" ? image_white_stone : image_black_stone, mousePosition.x, mousePosition.y, getTileSize(), getTileSize());

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
    else if(event.type == "mouseup") {
        putDownPiece(tileMapPositionToIndex(mouseTile.x, mouseTile.y)); 
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
            pieceOnHand.piece = pieces[i]; 
            pieceOnHand.state = true; 
            pieces.splice(i,1);
        }
    }
    drawingInterval = setInterval(draw, drawingIntervalTime);
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

    console.error("Didn't find a avaiable space."); 

}
function putDownPiece(index) {

    if(index < 24) { // Since you can only put pieces down at the board. 
        
        let pieceAtIndex = getPieceAtIndex(index); 

        if(pieceAtIndex != undefined && pieceAtIndex.color == playerColor) { // Putting the piece back. 
            placePieceOffBoard(pieceOnHand.piece); 
            return; 
        } else if(pieceAtIndex != undefined && pieceAtIndex.color != playerColor) {
            placePieceOffBoard(pieceAtIndex); 
        }
        pieceOnHand.piece.index = index; 
        pieces.push(pieceOnHand.piece); 
        pieceOnHand.piece = undefined; 
        pieceOnHand.state = false; 
        clearInterval(drawingInterval); 
        draw(); // Redrawing
    }

}