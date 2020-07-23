package no.mellemstuen.mathias.theroyalgameofur;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.javalin.http.Context;

import java.io.IOException;
import java.time.LocalDateTime;

public class Game {

    @JsonIgnore
    private final IdPair idPair;

    @JsonIgnore
    private boolean isBotGame = false;

    @JsonIgnore
    private LocalDateTime startTime;

    @JsonIgnore
    private LocalDateTime lastRequestFromWhite;

    @JsonIgnore
    private LocalDateTime lastRequestFromBlack;

    @JsonProperty("gamestate")
    private GameState gameState;

    @JsonProperty("playerturn")
    private Color playerTurn = Random.getRandom() ? Color.WHITE : Color.BLACK;

    @JsonProperty("dicevalue")
    private int diceValue;

    @JsonProperty("board")
    private Board board;

    @JsonProperty("specialcasemessage")
    public String specialCaseMessage = "";

    @JsonIgnore
    public Color UIDToColor(String uid) throws NullPointerException{
        return uid.equals(idPair.getWhitePlayerId()) ? Color.WHITE : uid.equals(idPair.getBlackPlayerId())  ? Color.BLACK : null;
    }

    @JsonIgnore
    public Color getPlayerTurn() {
        return playerTurn;
    }
    @JsonIgnore
    public int getDiceValue() {
        return diceValue;
    }
    @JsonIgnore
    public Board getBoard() {
        return board;
    }
    @JsonIgnore
    public LocalDateTime getStartTime() {
        return startTime;
    }
    @JsonIgnore
    public boolean getIsBotGame() {
        return isBotGame;
    }

    @JsonIgnore
    public void setIsBotGame(boolean isBotGame) {
        this.isBotGame = isBotGame;

        if(playerTurn.equals(Color.BLACK)) {
            Bot.calculateAndExecuteMove(this);
        }
    }

    @JsonIgnore
    public GameState getGameState() {
        return gameState;
    }

    @JsonIgnore
    public void setGameState(GameState gameState) {
        this.gameState = gameState;
    }

    @JsonIgnore
    public IdPair getIdPair() {
        return idPair;
    }

    @JsonIgnore
    public void makeMove(Context context) {

        if(gameState != GameState.INGAME)
            return;

        String uid = Controller.getUID(context);

        if(uid.equals(idPair.getBlackPlayerId())) {
            lastRequestFromBlack = LocalDateTime.now();
        }

        if(uid.equals(idPair.getWhitePlayerId())) {
            lastRequestFromWhite = LocalDateTime.now();
        }

        if(!((uid.equals(idPair.getBlackPlayerId()) && playerTurn.equals(Color.BLACK)) || (uid.equals(idPair.getWhitePlayerId()) && playerTurn.equals(Color.WHITE)))) {
            System.out.println("Error: Either not your turn or wrong uid.");
            context.json("\"NOT YOUR TURN OR WRONG UID\"");
            return;
        }
        //Authenticated and your turn here.

        String requestContent = context.body().toString();

        MoveRequest moveRequest = null;

        try {
            moveRequest = JSON.mapper.readValue(requestContent, MoveRequest.class);
        } catch (IOException e) {
            e.printStackTrace();
        }

        if(moveRequest == null) {
            System.out.println("Could not process delivered JSON data. Returning!");
            context.json("\"COULD NOT PROCESS JSON\"");
            return;
        }

        if(!board.checkIfMoveIsValid(board.getPieceAtIndex(moveRequest.from),moveRequest.to,diceValue)) {
            System.out.println("Invalid move! Returning!");
            context.json("\"INVALID MOVE\"");
            return;
        }

        if(moveRequest.to == 17 || moveRequest.to == 15) {
            board.removePieceAtIndex(moveRequest.from);
        }
        else if(board.getPieceAtIndex(moveRequest.to) != null && board.getPieceAtIndex(moveRequest.to).getColor() != playerTurn) {

            board.putPieceBackAtStartPosition(board.getPieceAtIndex(moveRequest.to));
            board.getPieceAtIndex(moveRequest.from).setIndex(moveRequest.to);

        } else if(moveRequest.to == (playerTurn == Color.WHITE ? Board.whitePath[Board.whitePath.length - 1] : Board.blackPath[Board.blackPath.length - 1])) {
            board.removePieceAtIndex(moveRequest.to);
        } else {
            board.getPieceAtIndex(moveRequest.from).setIndex(moveRequest.to);
        }

        checkForWinCondition();

        if(!board.pieceGetsBonusMove(moveRequest.to)) //Changing turn if the piece does not get a bonus move.
            changeTurn();

        rollDice();
        specialCaseMessage = "";

        checkForDiceValueIsNull();
        checkForPlayerNoMoves();

        context.json("\"VALID\"");


        if(playerTurn.equals(Color.BLACK)) { // Making a bot move if everything is valid and it's the bots turn.
            Bot.calculateAndExecuteMove(this);
        }
    }

    public void checkForWinCondition() {
        if(board.checkForWinCondition(playerTurn)) {

            gameState = playerTurn == Color.WHITE ? GameState.WHITE_VICTORY : GameState.BLACK_VICTORY;
        }
    }
    public void checkForDiceValueIsNull() {
        //Edge case scenario where the dice roll is 0.
        while(diceValue == 0) {
            rollDice();
            specialCaseMessage += "Dice is 0 for " + playerTurn + ". Changing turn.;";
            changeTurn();
        }
    }

    public void checkForPlayerNoMoves() {
        //Edge case scenario where the player have no moves.
        while(!board.haveMoves(playerTurn,diceValue)) {
            rollDice();
            specialCaseMessage += "No moves for " + playerTurn + ". Changing turn.;";
            changeTurn();
        }

    }

    @JsonIgnore
    public void rollDice() {
        diceValue = Random.randomNumberInRange(0,4);
    }

    @JsonIgnore
    public void changeTurn() {
        playerTurn = playerTurn == Color.WHITE ? Color.BLACK : Color.WHITE;
    }
    @JsonIgnore
    public String JSONResponse() {
        try {

            if(gameState == GameState.LOBBY)
                return JSON.writer.writeValueAsString(gameState);

            return JSON.writer.writeValueAsString(this);

        } catch(JsonProcessingException e) {
            e.printStackTrace();
            return "INTERNAL SERVER ERROR";
        }
    }

    @JsonIgnore
    public void resign(String uid) {

        if(uid.equals(idPair.getBlackPlayerId())) {
            this.gameState = GameState.WHITE_VICTORY;
        }

        if(uid.equals(idPair.getWhitePlayerId())) {
            this.gameState = GameState.BLACK_VICTORY;
        }
    }
    @JsonIgnore
    public boolean checkIfGameHasExpired() {

        boolean white = lastRequestFromWhite.plusMinutes(Controller.gameDeletionScheduleMinutes).isBefore(LocalDateTime.now());
        boolean black = lastRequestFromWhite.plusMinutes(Controller.gameDeletionScheduleMinutes).isBefore(LocalDateTime.now()) && !isBotGame; // Makes this always false if it is a bot game.
        boolean start = startTime.plusHours(Controller.gameDeletionHours).isBefore(LocalDateTime.now());

        return (start || white || black);
    }

    public Game(IdPair idPair) {
        this.idPair = idPair;
        this.gameState = GameState.LOBBY;
        this.board = new Board();
        this.diceValue = Random.randomNumberInRange(1,4); // Can't use rollDice method because rolldice method includes rolling 0 which we don't want at the first throw because it creates issues.
        this.startTime = LocalDateTime.now();
        this.lastRequestFromBlack = LocalDateTime.now();
        this.lastRequestFromWhite = LocalDateTime.now();
    }
}