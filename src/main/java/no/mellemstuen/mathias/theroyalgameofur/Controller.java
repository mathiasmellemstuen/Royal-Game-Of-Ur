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

    private static Game getGame(String uid) {
        for(Game game: games) {
            if(game.getIdPair().getBlackPlayerId().equals(uid) || game.getIdPair().getWhitePlayerId().equals(uid)) {
                return game;
            }
        }
        return null;
    }
    public static void postMove(Context context) {

        String uid = getUID(context);
    }

    public static void gameUpdate(Context context) {

        String uid = getUID(context);

        System.out.println(uid);

        if(uid == null) {
            System.out.println("Could not find uid.");
            context.json("{error:'Could not find the uid.'}");
            return;
        }

        Game game = getGame(uid);
        if(game == null) {
            System.out.println("Could not find the game.");
            context.json("{error:'Could not find the game.'}");
            return;
        }

        context.json(game.JSONResponse());
    }

    public static void newGame(Context context) {

        //Checking if a game with a open lobby exists. If that's the case, add the player to the lobby.
        if(games.size() != 0 && games.get(games.size() - 1).getGameState() == GameState.LOBBY) {

            context.json("{uid:" + games.get(games.size() - 1).getIdPair().getBlackPlayerId() + "}");
            System.out.println("Starting a new game.");
            games.get(games.size() - 1).setGameState(GameState.INGAME);
            return;
        }

        Game game = new Game(new IdPair());

        games.add(game);

        context.json("{uid:" + game.getIdPair().getWhitePlayerId() + "}");
    }

    public static void getNumberOfGames(Context context) {
        context.json("{number_of_games:" + games.size() + "}");
    }
}
