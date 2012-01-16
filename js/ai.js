
function AIPlayer(name, ui, memCoefficient) {

    var player = {};
    player.name = name;
    player.memory = {};
    player.type = "ai";
    var $cursor = $("<div class='aicursor'></div>");
    $cursor.css("display", "none");
    $("#game").append($cursor);
    var clickedCount = 0;
    var aiCheats = false;

    for (var i = 0; i < 60; i++) {
        player.memory[i] = {};
    }

    player.requestMove = function (game, callback) {
        var move = null;

        if (aiCheats) {
            for (var boxidx = 0; boxidx < 60; boxidx++) {
                var box = game.boxes[boxidx];
                var tileidx = box.tile;
                if (! player.memory[tileidx]) player.memory[tileidx] = {};
                player.memory[tileidx][boxidx] = 2000;
            }
        }

        if (game.openBoxes.length == 0) {
            // First move of the turn.
            // Try to find a tile we know about two of.
            for (maybetileidx in player.memory) {
                var entry = player.memory[maybetileidx];
                var ct = Object.keys(entry).length;
                if (ct > 1) {
                    for (maybeboxidx in entry) {
                        move = parseInt(maybeboxidx, 10);
                        if (! game.boxes[move].open) {
                            break;
                        }
                    }
                }
                if (move != null) {
                    break;
                }
            }
        }
        else {
            // Second move of the turn.
            // Try to match what's already open.
            var openbox = game.openBoxes[0];
            var opentile = game.boxes[openbox].tile;
            var entry = player.memory[opentile];
            for (maybeboxidx in entry) {
                maybeboxidx = parseInt(maybeboxidx, 10);
                if (maybeboxidx != openbox) {
                    move = maybeboxidx;
                    break;
                }
            }
        }

        // If we've not picked anything yet then try to
        // prefer a box we don't know anything about
        // in order to learn more about the board.
        if (move == null || game.boxes[move].open) {
            var candidates = {};
            for (var maybeboxidx = 0; maybeboxidx < 30; maybeboxidx++) {
                candidates[maybeboxidx] = true;
            }
            for (maybetileidx in player.memory) {
                for (maybeboxidx in player.memory[maybetileidx]) {
                    maybeboxidx = parseInt(maybeboxidx, 10);
                    delete candidates[maybeboxidx];
                }
            }
            // Turn it into a list so we can easily seek into it.
            candidates = Object.keys(candidates);
            var candidx = Math.floor(Math.random() * candidates.length);
            move = candidates[candidx];
        }

        // If we've not picked anything yet then just
        // pick something at random.
        while (move == null || game.boxes[move].open) {
            move = Math.floor(Math.random()*60);
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
    player.notifyBoxTile = function (boxidx, tileidx) {
        // First decrement the existing ttls.

        var memory = player.memory;

        for (var i = 0; i < 30; i++) {
            var entries = memory[i];
            if (entries) {
                for (inboxidx in entries) {
                    entries[inboxidx]--;
                    if (entries[inboxidx] < 1) {
                        delete entries[inboxidx];
                    }
                }
            }
        }

        var value = 1;
        // The more valuable tiles are more memorable.
        if (tileidx == 0) value += 1;
        if (tileidx == 1) value += 2;
        if (tileidx == 2) value += 3;

        // It's easier to remember edge tiles.
        // Corner tiles doubly so. (they get counted twice below)
        if ((boxidx % 10) == 0 || (boxidx % 10) == 9) value += 1;
        if (boxidx > 19) value += 1;
        if (boxidx < 10) value += 1;

        value *= memCoefficient;
        if (memory[tileidx][boxidx] == null) memory[tileidx][boxidx] = 0;
        memory[tileidx][boxidx] += value;
    };

    return player;

}
