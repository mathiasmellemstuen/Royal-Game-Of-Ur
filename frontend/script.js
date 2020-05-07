var canvas; 
var context; 

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

var piecesOnHand = {
    from:-1,
    state:false
}
var player1Pieces = [
    24,
    25,
    26,
    27,
    28,
    29,
    30
];
var player2Pieces = [
    31,
    32,
    33,
    34,
    35,
    36,
    37
];
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
    canvas.addEventListener("click", onClick); 
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
function getTileImageBasedOnTileMapNumber(number) {
    switch(number) {
        case 11: case 21: case 1: return image_flower;
        case 10: case 20: case 0: return image_tile;
    }
}

function draw() {
    drawBackground(); 
    drawStones(); 
}

function drawBackground() {
    for(let i = 0; i < tileMap.length; i++) {
        let pos = tileMapIndexToPosition(i); 
        let img = getTileImageBasedOnTileMapNumber(tileMap[i]); 

        if(img != undefined) context.drawImage(img, (pos.x * getTileSize()) + getTileSize(), pos.y * getTileSize(), getTileSize(), getTileSize());
    }
}
function drawStones() {

    for(let i = 0; i  < player1Pieces.length; i++)
        drawStone(player1Pieces[i],image_white_stone);

    for(let i = 0; i < player2Pieces.length; i ++) 
        drawStone(player2Pieces[i], image_black_stone); 
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

function onClick(event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    let xTile = Math.floor(x / getTileSize()) - 1; // Legger på -1 fordi jeg vil at x: 0 skal være på selve brettet.
    let yTile = Math.floor(y / getTileSize());
    
    console.log("X-tile: " + xTile + "\nY-tile: " + yTile); 
}