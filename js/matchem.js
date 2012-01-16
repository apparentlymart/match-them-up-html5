
(function () {

    var $boxes = [];
    var game;
    var moveCallback = null;

    $(document).ready(function() {
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
        };
        var player1 = {
            "requestMove": function (callback) {
                moveCallback = callback;
            },
        };

        game = MatchEmGame([ player1 ], ui);

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

