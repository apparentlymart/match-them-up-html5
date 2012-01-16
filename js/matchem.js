
(function () {

    var $boxes;
    var $players;
    var game;
    var ui;
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
    var aiPlayers = [
        ["Mr Forget", 1],
        ["Mr Silly", 2],
        ["Mr Reasonable", 3],
        ["Mr Memory", 8],
        ["Mr Impossible", 64],
    ];
    var wantedPlayers = [
        ["ui", "Player 1", 2], // selected type, human name, ai player index
        ["ai", "Player 2", 2],
        ["",   "Player 3", 2],
        ["",   "Player 4", 2],
    ];

    var initGame = function () {

        $players = [];
        $boxes = [];
        game = null;
        moveCallback = null;
        inARow = 0;

        var $boxcontainer = $("#boxes");

        var setBoxTileImage = function (boxidx, tileidx) {
            var $box = $boxes[boxidx];
            tileidxstr = tileidx < 10 ? "0" + tileidx : "" + tileidx;
            $box.css("background-image", "url(data/tile"+tileidxstr+".png)");
        };

        for (var i = 0; i < 60; i++) {
            var $box = $("<div class='box'><div class='door'><div class='doorcaption'>?</div></div></div>");
            $boxes[i] = $box;
            $box[0]._box_idx = i;
            setBoxTileImage(i, i % 30);
            $boxcontainer.append($box);
        }

        ui = {
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
                if (winners.length == 1) {
                    var playerName = game.players[winners[0]].name;
                    slideMessageLeft(playerName + " wins!");
                }
                else {
                    slideMessageLeft("It's a draw!");
                }
            },
            getBoxBoundingBox: function (idx) {
                var $box = $boxes[idx];
                var pos = $box.position();
                var width = $box.width();
                var height = $box.height();
                return {
                    top: pos.top,
                    left: pos.left,
                    width: width,
                    height: height,
                };
            },
        };

    };

    var initSetup = function () {

        var $setupPanel = $("#setuppanel");
        $setupPanel.find("table").html("");
        var $table = $setupPanel.find("table");

        for (var i = 0; i < wantedPlayers.length; i++) {
            (function () {
                var idx = i;
                var type = wantedPlayers[idx][0];
                var $row = $("<tr><td class='playertype'></td><td class='playername'></td></tr>");
                var $playertype = $row.find(".playertype");
                var $playername = $row.find(".playername");
                var $typeselect = $("<select><option value='ui'>Human</option><option value='ai'>Computer</option><option value=''>None</option></select>");
                $typeselect.val(type);
                $playertype.append($typeselect);
                $table.append($row);

                $typeselect.bind("change", function (evt) {
                    var type = $typeselect.val();
                    $playername.html('');
                    wantedPlayers[idx][0] = type;
                    if (type == 'ui') {
                        var playerName = wantedPlayers[idx][1];
                        var $entry = $("<input type='text'>");
                        $entry.val(playerName);
                        $playername.append($entry);
                        $entry.bind("change", function () {
                            wantedPlayers[idx][1] = $entry.val();
                        });
                    }
                    else if (type == 'ai') {
                        var aiPlayerIdx = wantedPlayers[idx][2];
                        var $entry = $("<select></select>");
                        for (var aiPlayerChoiceIdx = 0; aiPlayerChoiceIdx < aiPlayers.length; aiPlayerChoiceIdx++) {
                            var aiPlayerChoice = aiPlayers[aiPlayerChoiceIdx];
                            var $option = $("<option></option>");
                            $option.text(aiPlayerChoice[0]);
                            $option.attr('value', aiPlayerChoiceIdx);
                            $entry.append($option);
                        }
                        $entry.val(aiPlayerIdx);
                        $playername.append($entry);
                        $entry.bind("change", function () {
                            wantedPlayers[idx][2] = parseInt($entry.val(), 10);
                        });
                    }
                });

                $typeselect.trigger("change");
            })();
        }

    };

    $(document).ready(function() {

        $("#boxes").on("click", ".box", function (elem) {
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

        initGame();
        initSetup();

        $("#setuppanel button").bind("click", function () {

            players = [];
            for (var i = 0; i < 4; i++) {
                var wanted = wantedPlayers[i];
                if (wanted[0] == "ui") {
                    players.push({
                        "requestMove": function (game, callback) {
                            moveCallback = callback;
                        },
                        "notifyBoxTile": function () {},
                        "name": wanted[1],
                        "type": "ui",
                    });
                }
                else if (wanted[0] == "ai") {
                    var playerType = wanted[2];
                    var playerName = aiPlayers[playerType][0];
                    var playerMemCoefficient = aiPlayers[playerType][1];
                    var aiPlayer = AIPlayer(playerName, ui, playerMemCoefficient);
                    players.push(aiPlayer);
                }
            }

            hideSetup(function () {
                MatchEmGame(players, ui);
            });
        });

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

    function hideSetup(complete) {
        $("#setup").fadeOut(600, function () {
            $("#setupbg").fadeOut(600, complete);
        });
    }

    function showSetup(complete) {
        $("#setupbg").fadeIn(600, function () {
            $("#setup").fadeIn(600, complete);
        });
    }

})();

