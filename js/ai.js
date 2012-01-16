
function AIPlayer(name, ui, memCoefficient) {

    var player = {};
    player.name = name;
    player.memory = {};
    player.type = "ai";
    var $cursor = $("<div class='aicursor'></div>");
    $cursor.css("display", "none");
    $("#game").append($cursor);
    var clickedCount = 0;

    for (var i = 0; i < 60; i++) {
        player.memory[i] = {};
    }

    player.requestMove = function (game, callback) {
        // For now this is just picks a random open box.
        // FIXME: write some real AI code.
        var move = null;
        while (true) {
            move = Math.floor(Math.random()*60);
            if (! game.boxes[move].open) {
                break;
            }
        }

        var bbox = ui.getBoxBoundingBox(move);
        var clicktop = bbox.top + (bbox.height / 2);
        var clickleft = bbox.left + (bbox.width / 2);

        // Add a random offset to the click point
        // to make it seem more "human".
        clicktop += (Math.random() - 0.5) * 40;
        clickleft += (Math.random() - 0.5) * 40;

        $cursor.fadeIn(function() {
            setTimeout(function () {
                $cursor.animate({
                    "top": clicktop,
                    "left": clickleft,
                },
                {
                    complete: function () {
                        callback(move);
                        clickedCount++;
                        if (clickedCount > 1) {
                            clickedCount = 0;
                            $cursor.fadeOut();
                        }
                    },
                });
            }, 500);
        });

    };

    return player;

}
