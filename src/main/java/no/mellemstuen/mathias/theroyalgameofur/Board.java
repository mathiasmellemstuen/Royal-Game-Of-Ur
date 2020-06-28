package no.mellemstuen.mathias.theroyalgameofur;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;

public class Board {
    @JsonIgnore
    public static final int[] whitePath = {
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
    @JsonIgnore
    public static final int[] blackPath = {
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
    @JsonProperty("pieces")
    public ArrayList<Piece> pieces = new ArrayList<>();

    @JsonIgnore
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

    @JsonIgnore
    public boolean checkForWinCondition(Color pieceColor) {
        for(Piece piece : pieces)
            if(piece.getColor() == pieceColor)
                return false;

        return true;
    }

    @JsonIgnore
    public boolean checkIfMoveIsValid(Piece piece,int to, int moveCount) {

        if(piece == null)
            return false;

        int[] path = piece.getColor() == Color.WHITE ? whitePath : blackPath;
        int index;

        if(piece.getIndex() >= 24) {

            index = path[moveCount - 1];

            if(to != index)
                return false;

            if(getPieceAtIndex(to) == null) // Don't need to check for more conditions because you can't meet your opponent when your position is >= 24.
                return true;

        } else {

            index = path[piece.getIndex() + moveCount];

            if(to != index)
                return false;

            if(getPieceAtIndex(to) == null || (getPieceAtIndex(to).getColor() != piece.getColor() && to != 10))
                return true;

        }
        return false;
    }

    @JsonIgnore
    public boolean haveMoves(int moveCount) {

        for(Piece p: pieces) {
            
        }
        return false;
    }
    @JsonIgnore
    public Piece getPieceAtIndex(int index) {
        for(Piece piece : pieces)
            if(piece.getIndex() == index)
                return piece;
        return null;
    }

    @JsonIgnore
    public void removePieceAtIndex(int index) {
        for(Piece piece : pieces)
            if(piece.getIndex() == index) {
                pieces.remove(piece);
                return;
            }
    }

    @JsonIgnore
    public void putPieceBackAtStartPosition(Piece piece) {

        int startingIndex = piece.getColor() == Color.WHITE ? 24 : 31;

        for(int i = startingIndex; i < startingIndex + 6; i++) {

            boolean freeSpace = true;

            for(Piece p : pieces)
                if(p.getIndex() == i) {
                    freeSpace = false;
                }

            if(freeSpace) {
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