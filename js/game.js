
function MatchEmGame(players, ui) {
    var game = {};

    game.players = players;
    game.currentPlayer = players[0];
    game.doorsOpen = 0;

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

    game.selectBox = function (player, idx, complete) {
        if (player == game.currentPlayer) {
            box = game.boxes[idx];
            if (box.open) {
                game.doorsOpen--;
                box.open = false;
                ui.closeBox(idx, complete);
            }
            else {
                game.doorsOpen++;
                box.open = true;
                ui.openBox(idx, complete);
            }
        }
    };

    return game;
}
