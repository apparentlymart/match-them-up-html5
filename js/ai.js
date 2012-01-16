
function AIPlayer(name, ui, memCoefficient) {

    var player = {};
    player.name = name;
    player.memory = {};
    player.type = "ai";

    for (var i = 0; i < 60; i++) {
        player.memory[i] = {};
    }

    player.requestMove = function (game, callback) {
        // For now this is just picks the first open box.
        // FIXME: write some real AI code.
        for (var bi = 0; bi < 60; bi++) {
            if (! game.boxes[bi].open) {
                setTimeout(function () {
                    callback(bi);
                }, 500);
                break;
            }
        }
    };

    return player;

}
