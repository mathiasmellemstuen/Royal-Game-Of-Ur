package no.mellemstuen.mathias.theroyalgameofur;

import java.util.UUID;

public class IdPair {

    private final String whitePlayerId = UUID.randomUUID().toString();
    private final String blackPlayerId = UUID.randomUUID().toString();

    public String getWhitePlayerId() {
        return whitePlayerId;
    }

    public String getBlackPlayerId() {
        return blackPlayerId;
    }
}
