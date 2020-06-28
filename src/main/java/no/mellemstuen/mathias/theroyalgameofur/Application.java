package no.mellemstuen.mathias.theroyalgameofur;

import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;

public class Application {
    public static void main(String[] args) {


        Controller.startGameDeletionSchedule(); // Starting deletion schedule for inactive games.

        //Setting up webserver:

        Javalin app = Javalin.create();
        app.config.enableWebjars();
        app.config.addStaticFiles("frontend", Location.EXTERNAL);

        //Setting up API calls:

        app.get("/newgame", Controller::newGame);
        app.get("/numberofgames", Controller::getNumberOfGames);
        app.get("/gameupdate", Controller::gameUpdate);

        app.post("/move", Controller::postMove);

        //Starting the webserver:
        app.start(7000);
    }
}