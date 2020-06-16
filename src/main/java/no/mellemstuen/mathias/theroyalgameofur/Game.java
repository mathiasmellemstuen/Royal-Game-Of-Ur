package no.mellemstuen.mathias.theroyalgameofur;

public class Game {

    private final IdPair idPair;

    public IdPair getIdPair() {
        return idPair;
    }

    public String JSONResponse() {
        return ""; //TODO: Create a json response of the game that can be sent back to the client.
    }
    public Game(IdPair idPair) {
        this.idPair = idPair;
    }
}