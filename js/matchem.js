
(function () {

    var $boxes;
    var $players;
    var game;
    var moveCallback = null;
    var inARow = 0;
    var specialMatchMessages = {
        0: "That's a Big 2 for you, #!",
        1: "Hey, hey, hey! Three points for #!",
        2: "Four points for you, #!",
    };
    var matchMessages = [
        "Nice job, #! Can you find another pair?",
        "Keep it up, #!",
        "You're on a roll, #!",
    ];

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
            updateScores: function () {
                for (var i = 0; i < game.players.length; i++) {
                    var $player = $players[i];
                    var score = game.players[i].score;
                    $player.find(".score").text(""+score);
                }
            },
            announceNewPlayer: function (complete) {
                var playerName = game.players[game.currentPlayer].name;
                var playerType = game.players[game.currentPlayer].type;
                inARow = 0; // reset counter
                // If it's a UI (human) player then we address the
                // player. Otherwise, we talk about the player in the
                // third person.
                if (playerType == "ui") {
                    slideMessageLeft("Your turn, " + playerName + "...", complete);
                }
                else {
                    slideMessageLeft("Now for " + playerName + "...", complete);
                }
            },
            announceMatch: function (tileidx, complete) {
                var playerName = game.players[game.currentPlayer].name;
                var message;
                if (specialMatchMessages[tileidx]) {
                    message = specialMatchMessages[tileidx];
                }
                else {
                    message = matchMessages[inARow % matchMessages.length];
                }
                inARow++; // keep track for next time
                message = message.replace("#", playerName);
                slideMessageUp(message, complete);
            },
            endOfGame: function (winners) {
                // TODO: Real message for this state
                slideMessageLeft("End of game! Winners: " + winners);
            },
        };
        players = [];
        for (var i = 0; i < 4; i++) {
            players.push({
                "requestMove": function (callback) {
                    moveCallback = callback;
                },
                "name": "Player " + (i + 1),
                "type": "ui",
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

        // Start the game after waiting a second for the UI to settle.
        setTimeout(function () {
            MatchEmGame(players, ui);
        }, 1000);

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

    function slideMessageUp(msg, complete) {
        var $ticker = $("#ticker");
        var $tickerslide = $("#tickerslide");
        var $existing = $("#tickerslide div");
        var $new = $("<div></div>");
        $new.text(msg);
        $tickerslide.append($new);

        var realComplete = function () {
            $existing.remove();
            $ticker.scrollTop(0);
            if (complete) complete();
        };

        $ticker.animate({
            "scrollTop": 50,
        },
        {
            complete: realComplete,
        });
    }

    function slideMessageLeft(msg, complete) {
        var $ticker = $("#ticker");
        var $tickerslide = $("#tickerslide");
        var $existing = $("#tickerslide div");
        var $new = $("<div></div>");
        $new.text(msg);
        $tickerslide.append($new);
        $existing.css("float", "left");
        $new.css("float", "left");

        var realComplete = function () {
            $existing.remove();
            $new.css("float", "");
            $ticker.scrollLeft(0);
            if (complete) complete();
        };

        $ticker.animate({
            "scrollLeft": 628,
        },
        {
            complete: realComplete,
        });
    }

})();

