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

        int startIndex = piece.getColor().equals(Color.WHITE) ? 24 : 31;
        int endingIndex = startIndex + 5;

        for(int i = startIndex; i < endingIndex; i++) {

            boolean foundPieceWithIndex = false;

            for(int j = 0; j < pieces.size(); j++)
                if(pieces.get(j).getIndex() == i)
                    foundPieceWithIndex = true;

            if(!foundPieceWithIndex) {
                piece.setIndex(i);
                return;
            }
        }
    }

    @JsonIgnore
    public boolean checkForWinCondition(Color pieceColor) {
        for(Piece piece : pieces)
            if(piece.getColor().equals(pieceColor))
                return false;

        return true;
    }

    @JsonIgnore
    public boolean checkIfMoveIsValid(Piece piece, int to, int moveCount) {

        if(piece == null) {

            return false;
        }

        int[] path = piece.getColor() == Color.WHITE ? whitePath : blackPath;
        int index;


        if(piece.getIndex() >= 24) {

            index = path[moveCount - 1];

            if(to != index) {

                return false;
            }

            if(getPieceAtIndex(to) == null) // Don't need to check for more conditions because you can't meet your opponent when your position is >= 24.
                return true;

        } else {

            int pieceArrayIndex = pieceToArrayIndex(piece);


            if(pieceArrayIndex == -1) {
                return false;
            }

            index = path[pieceArrayIndex + moveCount];

            if(to != index) {

                return false;
            }

            if(getPieceAtIndex(to) == null || (getPieceAtIndex(to).getColor() != piece.getColor() && to != 10))
                return true;

        }
        return false;
    }


    @JsonIgnore
    public Piece[] getAllPiecesOfColor(Color color) {
        ArrayList<Piece> p = new ArrayList<>();

        for(int i = 0 ;i < pieces.size(); i++) {
            if(pieces.get(i).getColor().equals(color))
                p.add(pieces.get(i));
        }
        return p.toArray(new Piece[0]);
    }
    @JsonIgnore
    public static int pieceToArrayIndex(Piece piece) {

        int[] arr = piece.getColor() == Color.WHITE ? whitePath : blackPath;
        int pos = piece.getIndex();

        for(int i = 0; i < arr.length; i++) {
            if(arr[i] == pos) {
                return i;
            }
        }
        return -1;
    }

    @JsonIgnore
    public boolean pieceGetsBonusMove(int to) { //Conditionally checking if the player gets a bonus turn.
        return (to == 0 || to == 2 || to == 10 || to == 19 || to == 21);
    }
    @JsonIgnore
    public boolean haveMoves(Color playerColor, int moveCount) {

        int[] path = playerColor.equals(Color.WHITE) ? whitePath : blackPath;

        if(moveCount == 0)
            return false;

        for(Piece p: pieces) {

            if(!p.getColor().equals(playerColor))
                continue;

            if(pieceToArrayIndex(p) + moveCount >= path.length)
                continue;

            int index = p.getIndex() >= 24 ? path[moveCount - 1] : path[pieceToArrayIndex(p) + moveCount];

            if(checkIfMoveIsValid(p,index,moveCount))
                return true;
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
        pieces.add(new Piece(31, Color.BLACK));
        pieces.add(new Piece(32, Color.BLACK));
        pieces.add(new Piece(33, Color.BLACK));
        pieces.add(new Piece(34, Color.BLACK));
        pieces.add(new Piece(35, Color.BLACK));
    }
}