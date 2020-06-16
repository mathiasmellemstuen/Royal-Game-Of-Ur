package no.mellemstuen.mathias.theroyalgameofur;

import java.util.ArrayList;

public class Board {

    public static int[] whitePath = {
            9,
            6,
            3,
            0,
            1,
            4,
            7,
            10,
            13,
            16,
            19,
            22,
            21,
            18,
            15
    };
    public static int[] blackPath = {
            11,
            8,
            5,
            2,
            1,
            4,
            7,
            10,
            13,
            16,
            19,
            22,
            23,
            20,
            17
    };

    public ArrayList<Piece> pieces = new ArrayList<>();

    public void placePieceOffBoard(Piece piece) {

        for(int i = piece.getColor() == Color.WHITE ? 24 : 31; i < 7; i++) {

            boolean foundPieceWithIndex = false;

            for(int j = 0; j < pieces.size(); i++)
                if(pieces.get(j).getIndex() == i)
                    foundPieceWithIndex = true;

            if(foundPieceWithIndex == false) {
                piece.setIndex(i);
                return;
            }
        }
    }

    public Board() {

        pieces.add(new Piece(24, Color.WHITE));
        pieces.add(new Piece(25, Color.WHITE));
        pieces.add(new Piece(26, Color.WHITE));
        pieces.add(new Piece(27, Color.WHITE));
        pieces.add(new Piece(28, Color.WHITE));
        pieces.add(new Piece(29, Color.WHITE));
        pieces.add(new Piece(30, Color.WHITE));
        pieces.add(new Piece(31, Color.BLACK));
        pieces.add(new Piece(32, Color.BLACK));
        pieces.add(new Piece(33, Color.BLACK));
        pieces.add(new Piece(34, Color.BLACK));
        pieces.add(new Piece(35, Color.BLACK));
        pieces.add(new Piece(36, Color.BLACK));
        pieces.add(new Piece(37, Color.BLACK));
    }
}
