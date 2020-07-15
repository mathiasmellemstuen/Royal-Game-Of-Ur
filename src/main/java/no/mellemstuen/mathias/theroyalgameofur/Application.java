package no.mellemstuen.mathias.theroyalgameofur;

import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;

public class Application {
    public static void main(String[] args) {

        Controller.startGameDeletionSchedule(); // Starting deletion schedule for inactive games.

        //Setting up webserver:

        Javalin app = Javalin.create();
        app.config.enableWebjars();

        //Setting up API calls:

        app.get("/api/newgame", Controller::newGame);
        app.get("/api/numberofgames", Controller::getNumberOfGames);
        app.get("/api/gameupdate", Controller::gameUpdate);
        app.get("/api/color", Controller::getColor);

        app.post("/api/move", Controller::makeMove);
        app.post("/api/resign", Controller::resign);

        //Starting the webserver:
        app.start(7000);

        System.out.println("REST API is running.");
    }
}