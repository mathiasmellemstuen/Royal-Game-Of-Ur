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
            if(piece.getColor().equals(pieceColor))
                return false;

        return true;
    }

    @JsonIgnore
    public boolean checkIfMoveIsValid(Piece piece, int to, int moveCount, boolean verbose) {

        if(verbose) {
            System.out.println("*******************************");
            System.out.println("** CHECKING IF MOVE IS VALID **");
            System.out.println("*******************************");
            System.out.println("Entering with to: " + to + " and moveCount: " + moveCount + ". The piece position is: " + piece.getIndex() + ".");
        }

        if(piece == null) {

            if(verbose) System.out.println("The piece is null.");

            return false;
        }

        int[] path = piece.getColor() == Color.WHITE ? whitePath : blackPath;
        int index;


        if(piece.getIndex() >= 24) {

            index = path[moveCount - 1];

            if(verbose) System.out.println("1. The path value index is: " + index);

            if(to != index) {

                if(verbose) System.out.println("To != index. Returing false.");

                return false;
            }

            if(getPieceAtIndex(to) == null) // Don't need to check for more conditions because you can't meet your opponent when your position is >= 24.
                return true;

        } else {

            if(verbose) System.out.println("2. The index of the piece is: " + piece.getIndex());

            int pieceArrayIndex = pieceToArrayIndex(piece);

            System.out.println("The piece array index is: " + pieceArrayIndex);

            if(pieceArrayIndex == -1) {
                if(verbose) System.out.println("2. The index is out of bounds.");
                return false;
            }

            index = path[pieceArrayIndex + moveCount];

            if(verbose) System.out.println("2. The path value index is: " + index);

            if(to != index) {
                if(verbose) System.out.println("To != index. Returing false.");

                return false;
            }

            if(getPieceAtIndex(to) == null || (getPieceAtIndex(to).getColor() != piece.getColor() && to != 10))
                return true;

        }
        if(verbose) System.out.println("Not meeting any of the conditions over. Returning false.");

        return false;
    }

    @JsonIgnore
    private int pieceToArrayIndex(Piece piece) {

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

        for(Piece p: pieces) {

            if(p.getColor() != playerColor)
                continue;

            if(pieceToArrayIndex(p) + moveCount >= path.length)
                return false;

            int index = p.getIndex() >= 24 ? path[moveCount - 1] : path[pieceToArrayIndex(p) + moveCount];

            if(checkIfMoveIsValid(p,index,moveCount, false))
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