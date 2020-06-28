package no.mellemstuen.mathias.theroyalgameofur;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.javalin.http.Context;

import java.io.IOException;

public class Game {

    @JsonIgnore
    private final IdPair idPair;

    @JsonProperty("gamestate")
    private GameState gameState;

    @JsonProperty("playerturn")
    private Color playerTurn = Random.getRandom() ? Color.WHITE : Color.BLACK;

    @JsonProperty("dicevalue")
    private int diceValue;

    @JsonProperty("board")
    private Board board;

    @JsonProperty("specialcasemessage")
    private String specialCaseMessage = "";

    @JsonIgnore
    public Color UIDToColor(String uid) { // TODO: lage et api call som tar uid og gir fargen. Skal bare kalles en gang i starten av hvert spill.
        return uid == idPair.getWhitePlayerId() ? Color.WHITE : uid == idPair.getBlackPlayerId() ? Color.BLACK : null;
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

        String uid = Controller.getUID(context);

        if(!(uid == idPair.getBlackPlayerId() && playerTurn == Color.BLACK) || !(uid == idPair.getWhitePlayerId() && playerTurn == Color.WHITE)) {
            context.json("{'ERROR':'NOT YOUR TURN OR WRONG UID'}");
            return;
        }

        //Authenticated and your turn.

        String requestContent = context.body().toString();

        MoveRequest moveRequest = null;

        try {
            moveRequest = JSON.mapper.readValue(requestContent, MoveRequest.class);
        } catch (IOException e) {
            e.printStackTrace();
        }

        if(moveRequest == null) {
            context.json("{'STATUS:'COULD PROCESS JSON DATA'}");
            return;
        }

        if(!board.checkIfMoveIsValid(board.getPieceAtIndex(moveRequest.from),moveRequest.to,diceValue)) {
            context.json("{'STATUS':'INVALID MOVE'}");
            return;
        }

        if(board.getPieceAtIndex(moveRequest.to) != null && board.getPieceAtIndex(moveRequest.to).getColor() != playerTurn) {

            board.putPieceBackAtStartPosition(board.getPieceAtIndex(moveRequest.to));
            board.getPieceAtIndex(moveRequest.from).setIndex(moveRequest.to);

        } else if(moveRequest.to == (playerTurn == Color.WHITE ? Board.whitePath[Board.whitePath.length - 1] : Board.blackPath[Board.blackPath.length - 1])) {
            board.removePieceAtIndex(moveRequest.to);
        } else {
            board.getPieceAtIndex(moveRequest.from).setIndex(moveRequest.to);
        }

        rollDice();
        specialCaseMessage = "";
        changeTurn();

        while(diceValue == 0) {
            rollDice();
            specialCaseMessage = "Dice is 0. Changing turn.";
            changeTurn();
        }

        context.json("{'STATUS':'VALID'}");
    }

    @JsonIgnore
    private void rollDice() {
        diceValue = Random.randomNumberInRange(0,4);
    }
    @JsonIgnore
    private void changeTurn() {
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

    public Game(IdPair idPair) {
        this.idPair = idPair;
        this.gameState = GameState.LOBBY;
        this.board = new Board();
        diceValue = Random.randomNumberInRange(1,4); // Can't use rollDice method because rolldice method includes rolling 0 which we don't want at the first throw because it creates issues.
    }
}