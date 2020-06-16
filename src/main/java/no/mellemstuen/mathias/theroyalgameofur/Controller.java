package no.mellemstuen.mathias.theroyalgameofur;

import io.javalin.http.Context;

import java.util.ArrayList;

public class Controller {

    private static ArrayList<Game> games = new ArrayList<>();

    public static String getUID(Context context) {
        if(!context.queryParamMap().containsKey("uid"))
            return null;

        return context.queryParam("uid");
    }

    public static void getGame(String uid) {

    }
    public static void postMove(Context context) {

        String uid = getUID(context);
    }
}
