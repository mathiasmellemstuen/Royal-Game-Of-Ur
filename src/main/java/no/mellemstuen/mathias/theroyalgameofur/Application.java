package no.mellemstuen.mathias.theroyalgameofur;

import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;

public class Application {
    public static void main(String[] args) {

        Javalin app = Javalin.create();
        app.config.enableWebjars();
        app.config.addStaticFiles("frontend", Location.EXTERNAL);


        app.get("/newgame", Controller::newGame);
        app.get("/numberofgames", Controller::getNumberOfGames);
        app.get("/gameupdate", Controller::gameUpdate);
       // app.get("/game", Controller::)
        app.post("/move", Controller::postMove);

        
        app.start(7000);
    }
}