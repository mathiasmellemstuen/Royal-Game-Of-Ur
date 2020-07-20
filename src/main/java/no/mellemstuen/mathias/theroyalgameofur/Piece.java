package no.mellemstuen.mathias.theroyalgameofur;

public class Piece {
    private int index;
    private final Color color;

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public Color getColor() {
        return color;
    }

    public Piece(int index, Color color) {
        this.index = index;
        this.color = color;
    }

    @Override
    public String toString() {
        return "Piece ( " + color.toString() + ", " + index + ")";
    }
}