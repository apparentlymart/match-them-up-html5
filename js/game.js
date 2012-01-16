
function MatchEmGame(players, ui) {
    var game = {};

    game.players = players;
    game.currentPlayer = -1;
    game.openBoxes = [];
    game.numBoxesInPlay = 60;

    for (var i = 0; i < players.length; i++) {
        players[i].score = 0;
    }

    // Populate the boxes with a flat list and then shuffle it.
    var boxes = [];
    for (var idx = 0; idx < 60; idx++) {
        boxes[idx] = {
            "tile": idx % 30,
            "open": false,
        };
    }
    // Shuffle the boxes list
    for (var i = boxes.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var old = boxes[i];
        boxes[i] = boxes[j];
        boxes[j] = old;
    }
    game.boxes = boxes;

    var handleMove;

    game.nextPlayer = function () {
        game.currentPlayer++;
        if (game.currentPlayer >= game.players.length) {
            game.currentPlayer = 0;
        }
        ui.updatePlayerMarker();
        ui.announceNewPlayer(function () {
            game.nextMove();
        });
    };
    game.nextMove = function () {
        game.players[game.currentPlayer].requestMove(game, handleMove);
    }

    handleMove = function (idx) {
        var box = game.boxes[idx];

        if (box.open) {
            // It's not valid to select the same box again.
            throw Error("Box " + idx + " is already open");
        }

        ui.openBox(idx, function () {
            game.openBoxes.push(idx);
            box.open = true;
            for (var pi = 0; pi < players.length; pi++) {
                players[pi].notifyBoxTile(idx, game.boxes[idx].tile);
            }

            if (game.openBoxes.length == 2) {
                // Determine if the player found a match.
                var tile1 = game.boxes[game.openBoxes[0]].tile;
                var tile2 = game.boxes[game.openBoxes[1]].tile;
                if (tile1 != tile2) {
                    // No match. Close the boxes.
                    var closeComplete = function () {
                        // this doesn't necessarily pop them in the
                        // correct order but that's okay since we only
                        // want to keep track of the count.
                        game.openBoxes.pop();
                        if (game.openBoxes.length == 0) {
                            game.nextPlayer();
                        }
                    };
                    setTimeout(function () {
                        for (var i = 0; i < game.openBoxes.length; i++) {
                            var idx = game.openBoxes[i];
                            game.boxes[idx].open = false;
                            ui.closeBox(idx, closeComplete);
                        }
                    }, 1000);
                }
                else {
                    // Found a match! Player get at least one point
                    // and another turn.

                    var points = 1;
                    // Tiles 0, 1 and 2 grant extra points
                    if (tile1 < 3) {
                        points = points + tile1 + 1;
                    }
                    game.players[game.currentPlayer].score += points;
                    ui.updateScores();
                    // Take the new match out of play.
                    game.openBoxes = [];
                    game.numBoxesInPlay -= 2;

                    if (game.numBoxesInPlay > 0) {
                        ui.announceMatch(tile1, function () {
                            game.nextMove();
                        });
                    }
                    else {
                        // Game over!
                        var winners = [ 0 ];
                        for (var i = 1; i < game.players.length; i++) {
                            var scoreToBeat = game.players[winners[0]].score;
                            var actualScore = game.players[i].score;
                            if (actualScore > scoreToBeat) {
                                winners = [ i ];
                            }
                            else if (actualScore == scoreToBeat) {
                                winners.push(i);
                            }
                        }
                        ui.endOfGame(winners);
                    }
                }
            }
            else {
                game.nextMove();
            }

        });
    };

    ui.init(game);

    // Begin the game by starting a turn.
    game.nextPlayer();

    return game;
}
