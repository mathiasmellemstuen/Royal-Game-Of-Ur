package no.mellemstuen.mathias.theroyalgameofur;

public class Random {
    private static final java.util.Random rd = new java.util.Random();

    public static boolean getRandom() {
        return rd.nextBoolean();
    }

    public static int randomNumberInRange(int min, int max) {
        return rd.nextInt((max - min) + 1) + min;
    }
}