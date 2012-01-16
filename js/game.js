
function MatchEmGame(players, ui) {
    var game = {};

    game.players = players;
    game.currentPlayer = -1;
    game.openBoxes = [];

    // Populate the boxes with a flat list and then shuffle it.
    var boxes = [];
    for (var idx = 0; idx < 60; idx++) {
        boxes[idx] = {
            "tile": idx % 30,
            "open": false,
        };
    }
    // FIXME: It would be better to use a real array shuffle here
    boxes.sort(function () { Math.random()-0.5 });
    game.boxes = boxes;

    var handleMove;

    game.nextPlayer = function () {
        game.currentPlayer++;
        if (game.currentPlayer >= game.players.length) {
            game.currentPlayer = 0;
        }
        game.nextMove();
    };
    game.nextMove = function () {
        game.players[game.currentPlayer].requestMove(handleMove);
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

            if (game.openBoxes.length == 2) {
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
                game.nextMove();
            }

        });
    };

    // Begin the game by selecting the next (i.e. first) player
    game.nextPlayer();

    return game;
}
