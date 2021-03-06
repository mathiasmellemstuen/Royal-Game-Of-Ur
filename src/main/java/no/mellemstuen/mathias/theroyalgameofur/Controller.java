package no.mellemstuen.mathias.theroyalgameofur;

import io.javalin.http.Context;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class Controller {
    public static final int gameDeletionHours = 1; //Aborting every game every hour even if it is not finished.
    public static final int gameDeletionScheduleMinutes = 1; //Aborting a game with this amount of minutes of inactivity.
    public static final int timeBeforeBotGameStarts = 30; //Seconds.
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
    public static void gameUpdate(Context context) {

        String uid = getUID(context);

        if(uid == null) {
            context.json("aborted");
            return;
        }

        Game game = getGame(uid);

        if(game == null) {
            context.json("aborted");
            return;
        }
        context.json(game.JSONResponse());
    }

    public static void newGame(Context context) {

        //Checking if a game with a open lobby exists. If that's the case, add the player to the lobby.
        if(games.size() != 0 && games.get(games.size() - 1).getGameState() == GameState.LOBBY) {

            context.json("{\"uid\":\"" + games.get(games.size() - 1).getIdPair().getBlackPlayerId() + "\"}");
            games.get(games.size() - 1).setGameState(GameState.INGAME);
            return;
        }

        Game game = new Game(new IdPair());

        games.add(game);

        context.json("{\"uid\":\"" + game.getIdPair().getWhitePlayerId() + "\"}");
    }

    public static void getNumberOfGames(Context context) {
        context.json("{\"number_of_games\":" + games.size() + "}");
    }

    public static void makeMove(Context context) {

        String uid = getUID(context);

        if(uid == null) return;

        Game game = getGame(uid);

        if(game == null) return;

        game.makeMove(context);
    }

    public static void resign(Context context) {
        String uid = getUID(context);

        if(uid == null) return;

        Game game = getGame(uid);

        if(game == null) return;

        game.resign(uid);
    }
    public static void getColor(Context context) {
        String uid = getUID(context);

        if(uid == null)
            return;

        Game game = getGame(uid);

        if(game == null)
            return;

        try {
            context.json(game.UIDToColor(uid));

        } catch (NullPointerException e) {
            context.json("\"ERROR NullPointerException: Could not find the correct player id.\"");
            e.printStackTrace();
        }
    }

    public static void startGameDeletionAndBotSchedule() { // Checking to see if a game needs to be deleted. This is for removing inactive games so they don't stay in memory forever.
        ScheduledExecutorService ses = Executors.newSingleThreadScheduledExecutor();
        ses.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {


                if(games.size() != 0 && games.get(games.size() -1 ).getGameState().equals(GameState.LOBBY) && games.get(games.size() -1 ).getStartTime().plusSeconds(timeBeforeBotGameStarts).isBefore(LocalDateTime.now())) { //Creating a bot game if the player have waited more than a minute in the lobby.
                    games.get(games.size() - 1).setGameState(GameState.INGAME);
                    games.get(games.size() - 1).setIsBotGame(true);
                }
                try {
                    for(int i = 0; i < games.size(); i ++) {
                        if(games.get(i) != null && games.get(i).checkIfGameHasExpired())
                            games.remove(i);
                    }
                }
                catch (Exception e) {
                    System.out.println("Error in thread in scheduler.");
                    e.printStackTrace();
                }
            }
        }, 0, 1, TimeUnit.MINUTES);
    }
}