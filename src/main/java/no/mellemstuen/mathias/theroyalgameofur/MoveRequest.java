package no.mellemstuen.mathias.theroyalgameofur;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class MoveRequest {

    @JsonAlias("from")
    public int from;

    @JsonAlias("to")
    public int to;

    @JsonIgnore
    public String toString() {
        return "From: " + from + ". To: " + to;
    }


    public MoveRequest() {};

    public MoveRequest(int from, int to) {
        this.from = from;
        this.to = to;
    }
}