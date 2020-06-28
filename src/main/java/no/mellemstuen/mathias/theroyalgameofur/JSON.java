package no.mellemstuen.mathias.theroyalgameofur;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

public class JSON {
    public static final ObjectWriter writer = new ObjectMapper().writer().withDefaultPrettyPrinter();

    public static final ObjectMapper mapper = new ObjectMapper();
}
