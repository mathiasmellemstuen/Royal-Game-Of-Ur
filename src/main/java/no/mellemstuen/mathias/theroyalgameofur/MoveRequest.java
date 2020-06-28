package no.mellemstuen.mathias.theroyalgameofur;

import com.fasterxml.jackson.annotation.JsonAlias;

public class MoveRequest {

    @JsonAlias("from")
    public int from;

    @JsonAlias("to")
    public int to;
}
