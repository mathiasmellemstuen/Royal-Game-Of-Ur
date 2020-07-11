package no.mellemstuen.mathias.theroyalgameofur;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.javalin.http.Context;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class Game {

    @JsonIgnore
    private final IdPair idPair;

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
    private String specialCaseMessage = "";

    @JsonIgnore
    public Color  UIDToColor(String uid) throws NullPointerException{
        return uid.equals(idPair.getWhitePlayerId()) ? Color.WHITE : uid.equals(idPair.getBlackPlayerId())  ? Color.BLACK : null;
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


        System.out.println("**********************");
        System.out.println("****** NEW MOVE ******");
        System.out.println("**********************");

        if(gameState != GameState.INGAME)
            return;

        String uid = Controller.getUID(context);

        System.out.println("The move makers UID: " + uid);

        System.out.println("The UIDS of the players in this game: ");
        System.out.println("Black player UID: " + idPair.getBlackPlayerId());
        System.out.println("White player UID: " + idPair.getWhitePlayerId());
        System.out.println("\n");

        if(uid.equals(idPair.getBlackPlayerId())) {
            lastRequestFromBlack = LocalDateTime.now();
        }
        if(uid.equals(idPair.getWhitePlayerId())) {
            lastRequestFromWhite = LocalDateTime.now();
        }

        if(!((uid.equals(idPair.getBlackPlayerId()) && playerTurn.equals(Color.BLACK)) || (uid.equals(idPair.getWhitePlayerId()) && playerTurn.equals(Color.WHITE)))) {
            System.out.println("Error: Either not your turn or wrong uid.");
            context.json("{'ERROR':'NOT YOUR TURN OR WRONG UID'}");
            return;
        }
        System.out.println("The move maker is authenticated. Moving on. ");

        //Authenticated and your turn here.

        String requestContent = context.body().toString();

        MoveRequest moveRequest = null;

        try {
            moveRequest = JSON.mapper.readValue(requestContent, MoveRequest.class);
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println("Moverequest: " + moveRequest);

        if(moveRequest == null) {
            System.out.println("Could not process delivered JSON data. Returning!");
            context.json("{'STATUS:'COULD PROCESS JSON DATA'}");
            return;
        }

        if(!board.checkIfMoveIsValid(board.getPieceAtIndex(moveRequest.from),moveRequest.to,diceValue, true)) {
            System.out.println("Invalid move! Returning!");
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

        if(board.checkForWinCondition(playerTurn)) {

            System.out.println("Wincondition for " + playerTurn.toString());
            gameState = playerTurn == Color.WHITE ? GameState.WHITE_VICTORY : GameState.BLACK_VICTORY;
            context.json("{'status':'VALID AND VICTORY'}");
            return;
        }


        System.out.println("The move is valid. The piece have moved to the requested position.");

        if(!board.pieceGetsBonusMove(moveRequest.to)) //Changing turn if the piece does not get a bonus move.
            changeTurn();

        rollDice();
        specialCaseMessage = "";

        //Edge case scenario where the dice roll is 0.
        while(diceValue == 0) {
            rollDice();
            specialCaseMessage = "Dice is 0. Changing turn.";
            changeTurn();
        }

        //Edge case scenario where the player have no moves.
        while(!board.haveMoves(playerTurn,diceValue)) {
            rollDice();
            specialCaseMessage = "No moves. Changing turn.";
            changeTurn();
        }

        System.out.println("Move made successfully.");
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

    @JsonIgnore
    public boolean checkIfGameHasExpired() {
        return startTime.plusHours(Controller.gameDeletionSafeHours).isAfter(LocalDateTime.now()) || lastRequestFromWhite.isAfter(LocalDateTime.now().minusMinutes(Controller.gameDeletionSchedulePeriodMinuts)) || lastRequestFromBlack.isAfter(LocalDateTime.now().minusMinutes(Controller.gameDeletionSchedulePeriodMinuts));
    }

    public Game(IdPair idPair) {
        this.idPair = idPair;
        this.gameState = GameState.LOBBY;
        this.board = new Board();
        this.diceValue = Random.randomNumberInRange(1,4); // Can't use rollDice method because rolldice method includes rolling 0 which we don't want at the first throw because it creates issues.
        this.startTime = LocalDateTime.now();
    }
}