import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;

public class Application {
    public static void main(String[] args) {

        Javalin app = Javalin.create();
        app.config.enableWebjars();
        app.config.addStaticFiles("frontend", Location.EXTERNAL);

        app.start(7000);
    }
}