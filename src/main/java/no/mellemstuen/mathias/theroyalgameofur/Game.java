package no.mellemstuen.mathias.theroyalgameofur;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.javalin.http.Context;

public class Game {

    @JsonIgnore
    private final IdPair idPair;

    @JsonProperty("gamestate")
    private GameState gameState;

    @JsonProperty("playerturn")
    private Color playerTurn = Random.getRandom() ? Color.WHITE : Color.BLACK;

    @JsonProperty("dicevalue")
    private int diceValue = 0;

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
    }
}