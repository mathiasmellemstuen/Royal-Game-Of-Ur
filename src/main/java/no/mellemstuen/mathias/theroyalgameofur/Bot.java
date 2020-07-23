package no.mellemstuen.mathias.theroyalgameofur;

import java.util.ArrayList;

public class Bot {

    public static final int botDelayTime = 500; // Milliseconds.

    private static void botSleep() {
        try {
            Thread.sleep(botDelayTime);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public static void calculateAndExecuteMove(Game game) {

        game.specialCaseMessage = "";
        game.rollDice();

        game.checkForDiceValueIsNull();
        game.checkForPlayerNoMoves();

        if(game.getPlayerTurn().equals(Color.WHITE))
            return;

        //The bot has a move value that is not 0 and it's the bot's turn.
        //Calculating all the moves the bot can take.

        Piece[] pieces = game.getBoard().getAllPiecesOfColor(Color.BLACK);
        ArrayList<MoveRequest> validMoveRequests = new ArrayList<>();

        for(Piece piece: pieces) {

            if(Board.pieceToArrayIndex(piece) + game.getDiceValue() > Board.blackPath.length - 1)
                continue;

            boolean valid = game.getBoard().checkIfMoveIsValid(piece, piece.getIndex() >= 24 ? Board.blackPath[game.getDiceValue() - 1] : Board.blackPath[Board.pieceToArrayIndex(piece) + game.getDiceValue()], game.getDiceValue());
            if (valid)
                validMoveRequests.add(new MoveRequest(piece.getIndex(), piece.getIndex() >= 24 ? Board.blackPath[game.getDiceValue() - 1] : Board.blackPath[Board.pieceToArrayIndex(piece) + game.getDiceValue()]));
        }

        if(validMoveRequests.size() == 0)
            return;

        //Valid move requests contains all the ways the bot can move.

        if(validMoveRequests.size() == 1) {
            makeMove(game, validMoveRequests.get(0));
            return;
        }

        //Checking if any of the moves is landing on a rosette or if it can move out of the board.

        for(MoveRequest move : validMoveRequests) {

            if (game.getBoard().pieceGetsBonusMove(move.to)) { // 1. Check if the bot can land on a rosette.
                makeMove(game, move);
                return;

            } else if (game.getBoard().getPieceAtIndex(move.to) != null) { // 2. Check if the bot can capture a enemy piece.
                makeMove(game, move);
                return;

            } else if (move.to == 17) { // 3. Check if the bot can get a point.
                makeMove(game, move);
                return;
            }
        }

        //If the bot have not made a move at this point, move a random piece.
        makeMove(game, validMoveRequests.get(Random.randomNumberInRange(0, validMoveRequests.size() - 1)));
    }

    public static void makeMove(Game game, MoveRequest move) {

        botSleep();

        if(move.to == 17) { // Removing the piece if the bot is moving a piece out of the board.
            game.getBoard().removePieceAtIndex(move.from);

        } else if (game.getBoard().getPieceAtIndex(move.to) != null) { // Capturing a piece.

            game.getBoard().placePieceOffBoard(game.getBoard().getPieceAtIndex(move.to));
            game.getBoard().getPieceAtIndex(move.from).setIndex(move.to);

        }
        else { // Move the piece.
            game.getBoard().getPieceAtIndex(move.from).setIndex(move.to);
        }

        game.checkForWinCondition();

        if(!game.getGameState().equals(GameState.INGAME))
            return;

        if(game.getBoard().pieceGetsBonusMove(move.to)) {
            calculateAndExecuteMove(game);
        } else {
            game.changeTurn();
            game.checkForDiceValueIsNull();
            game.checkForPlayerNoMoves();

            if(game.getPlayerTurn().equals(Color.BLACK)) { // Making a bot move if everything is valid and it's the bots turn.
                Bot.calculateAndExecuteMove(game);
            }
        }
    }
}
