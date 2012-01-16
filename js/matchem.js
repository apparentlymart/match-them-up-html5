
(function () {

    var $boxes;
    var $players;
    var game;
    var moveCallback = null;

    $(document).ready(function() {
        var $boxcontainer = $("#boxes");

        var setBoxTileImage = function (boxidx, tileidx) {
            var $box = $boxes[boxidx];
            tileidxstr = tileidx < 10 ? "0" + tileidx : "" + tileidx;
            $box.css("background-image", "url(data/tile"+tileidxstr+".png)");
        };

        $boxes = [];
        for (var i = 0; i < 60; i++) {
            var $box = $("<div class='box'><div class='door'><div class='doorcaption'>?</div></div></div>");
            $boxes[i] = $box;
            $box[0]._box_idx = i;
            setBoxTileImage(i, i % 30);
            $boxcontainer.append($box);
        }

        var ui = {
            openBox: function (idx, complete) {
                var $box = $boxes[idx];
                setBoxTileImage(idx, game.boxes[idx].tile);
                openBoxes($box, complete);
            },
            closeBox: function (idx, complete) {
                var $box = $boxes[idx];
                closeBoxes($box, complete);
            },
            init: function (newGame) {
                game = newGame;
                var $scoreboard = $("#scoreboard");
                $scoreboard.html("<table></table>");
                $scoreboardTable = $scoreboard.find("table");
                $players = [];

                for (var i = 0; i < game.players.length; i++) {
                    var player = game.players[i];
                    var name = player.name;
                    var score = player.score;
                    var $player = $("<tr><td class='marker'></td><td class='name'></td><td class='score'></td></tr>");
                    $player.find(".name").text(name);
                    $player.find(".score").text(score);
                    $scoreboardTable.append($player);
                    $players[i] = $player;
                }
            },
            updatePlayerMarker: function () {
                for (var i = 0; i < game.players.length; i++) {
                    var $player = $players[i];
                    var marker = (game.currentPlayer == i) ? "&#10148;" : "";
                    $player.find(".marker").html(marker);
                }
            },
        };
        players = [];
        for (var i = 0; i < 4; i++) {
            players.push({
                "requestMove": function (callback) {
                    moveCallback = callback;
                },
                "name": "Player " + (i + 1),
            });
        }

        $(".box").bind("click", function (elem) {
            var $box = $(elem.currentTarget);
            var idx = $box[0]._box_idx;

            if (moveCallback) {
                // Only an open box is selectable.
                if (! game.boxes[idx].open) {
                    moveCallback(idx);
                    moveCallback = null;
                }
            }
        });

        // Start the game
        MatchEmGame(players, ui);

    });

    function openBoxes($boxes, complete) {
        var $doors = $boxes.find(".door");
        var $captions = $boxes.find(".doorcaption");

        if (complete == null) complete = function () {};

        $({"_dummy": 0}).animate({
            "_dummy": 1,
        },
        {
            "step": function (now, fx) {
                var scale = 1 - now;
                var rot = 359 * now;
                var alpha = 1 - now;
                var color = "rgba(170, 28, 118, "+alpha+")";
                var str = "scale("+scale+") rotate("+rot+"deg)";
                $doors.css("background", color);
                $captions.css("-webkit-transform", str);
            },
            "complete": complete,
        });
    }

    function closeBoxes($boxes, complete) {
        var $doors = $boxes.find(".door");
        var $captions = $boxes.find(".doorcaption");

        if (complete == null) complete = function () {};

        $({"_dummy": 1}).animate({
            "_dummy": 0,
        },
        {
            "step": function (now, fx) {
                var offset = now * 100;
                var alpha = 1 - now;
                var color = "rgba(170, 28, 118, "+alpha+")";
                var str = "translate(0, -"+offset+"%)";
                $doors.css("background", color);
                $captions.css("-webkit-transform", str);
            },
            "complete": complete,
        });
    }

})();

