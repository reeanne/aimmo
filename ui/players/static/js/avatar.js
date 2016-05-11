const VIEWER = Object.create({

	sideAvatarRatio: 1 / 5,

	index: 0,

	refreshPickers: function() {
		$("#body_stroke").spectrum("set", this.data.colours[this.index].body_stroke);
		$("#body_fill").spectrum("set", this.data.colours[this.index].body_fill);
		$("#eye_stroke").spectrum("set", this.data.colours[this.index].eye_stroke);
		$("#eye_fill").spectrum("set", this.data.colours[this.index].eye_fill);
	},

	refreshPlayer: function(player, index, opacity = 1) {
		player.playerBody.attr({"fill": this.data.colours[index].body_fill, "fill-opacity": opacity});
		player.playerBody.attr({"stroke": this.data.colours[index].body_stroke, "stroke-opacity": opacity});
		player.playerEyeLeft.attr({"fill": this.data.colours[index].eye_fill, "fill-opacity": opacity});
        player.playerEyeLeft.attr({"stroke": this.data.colours[index].eye_stroke, "stroke-opacity": opacity});
        player.playerEyeRight.attr({"fill": this.data.colours[index].eye_fill, "fill-opacity": opacity});
        player.playerEyeRight.attr({"stroke": this.data.colours[index].eye_stroke, "stroke-opacity": opacity});
	},

	refreshAllPlayers: function() {
		this.constructCentralAvatarElement();
		this.constructLeftAvatarElement();
		this.constructRightAvatarElement();
	},

    constructCentralAvatarElement: function() {
    	const angle = 1
        const playerRadius = 80;
        const playerHeadRadius = playerRadius * 0.6;
        const playerEyeRadius = playerRadius * 0.2;
        const playerX = (this.paper.width - playerHeadRadius) / 2;
        const playerY = (this.paper.height + playerHeadRadius) / 2;

        this.central = {};
        this.central.playerBody = this.paper.circle(playerX, playerY, playerRadius);
        this.central.playerEyeLeft = this.paper.circle(
            playerX + playerHeadRadius * Math.cos(angle - 1),
            playerY + playerHeadRadius * Math.sin(angle - 1),
            playerEyeRadius
        );
        this.central.playerEyeRight = this.paper.circle(
            playerX + playerHeadRadius * Math.cos(angle + 1),
            playerY + playerHeadRadius * Math.sin(angle + 1),
            playerEyeRadius
        );

        this.refreshPlayer(this.central, this.index);

        this.player = this.paper.set();
        this.player.push(
            this.playerBody,
            this.playerEyeLeft,
            this.playerEyeRight
        );
    },

    constructLeftAvatarElement: function() {
    	const angle = 1
        const playerRadius = 60;
        const playerHeadRadius = playerRadius * 0.6;
        const playerEyeRadius = playerRadius * 0.2;
        const playerX = (this.paper.width - playerHeadRadius) * this.sideAvatarRatio;
        const playerY = (this.paper.height + playerHeadRadius) * this.sideAvatarRatio;

		this.left = {};
        this.left.playerBody = this.paper.circle(playerX, playerY, playerRadius);
        this.left.playerEyeLeft = this.paper.circle(
            playerX + playerHeadRadius * Math.cos(angle - 1),
            playerY + playerHeadRadius * Math.sin(angle - 1),
            playerEyeRadius
        );
        this.left.playerEyeRight = this.paper.circle(
            playerX + playerHeadRadius * Math.cos(angle + 1),
            playerY + playerHeadRadius * Math.sin(angle + 1),
            playerEyeRadius
        );

        this.refreshPlayer(this.left, Math.abs((this.index + 1) % this.data.colours.length), 0.5);

        this.left.player = this.paper.set();
        this.left.player.push(
            this.left.playerBody,
            this.left.playerEyeLeft,
            this.left.playerEyeRight
        );
    },

     constructRightAvatarElement: function() {
    	const angle = 1
        const playerRadius = 60;
        const playerHeadRadius = playerRadius * 0.6;
        const playerEyeRadius = playerRadius * 0.2;
        const playerX = (this.paper.width - playerHeadRadius) * (1 - this.sideAvatarRatio);
        const playerY = (this.paper.height + playerHeadRadius) * this.sideAvatarRatio;

		this.right = {};
        this.right.playerBody = this.paper.circle(playerX, playerY, playerRadius);
        this.right.playerEyeLeft = this.paper.circle(
            playerX + playerHeadRadius * Math.cos(angle - 1),
            playerY + playerHeadRadius * Math.sin(angle - 1),
            playerEyeRadius
        );
        this.right.playerEyeRight = this.paper.circle(
            playerX + playerHeadRadius * Math.cos(angle + 1),
            playerY + playerHeadRadius * Math.sin(angle + 1),
            playerEyeRadius
        );

        this.refreshPlayer(this.right, Math.abs((this.index - 1) % this.data.colours.length), 0.5);

        this.right.player = this.paper.set();
        this.right.player.push(
            this.right.playerBody,
            this.right.playerEyeLeft,
            this.right.playerEyeRight
        );
    },

    shiftLeft: function() {
		this.index = Math.abs((this.index + 1) % this.data.colours.length);
		this.refreshAllPlayers();
		this.refreshPickers();	
    },

    shiftRight: function() {
		this.index = Math.abs((this.index - 1) % this.data.colours.length);
    	this.refreshAllPlayers();
		this.refreshPickers();	
    }

});

$( document ).ready(function() {

    $('#saveBtn').click(function(event) {
        event.preventDefault();
        $.ajax({
            url: '/api/avatar/',
            type: 'POST',
            dataType: 'json',
            data: {
            	appear: JSON.stringify(VIEWER.data.colours[VIEWER.index]),
            	index: VIEWER.index,
            	csrfmiddlewaretoken: $('#saveForm input[name=csrfmiddlewaretoken]').val()
            },
            success: function(data) {
            	alert(data)
            },
            error: function(jqXHR, textStatus, errorThrown) {
            }
        });
    });

    $.ajax({
        url: '/api/avatar/',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
        	VIEWER.data = data;
			VIEWER.paper = Raphael(document.getElementById("watch-world-canvas"));
    		VIEWER.refreshAllPlayers();
    		VIEWER.refreshPickers();	
        },
        error: function(jqXHR, textStatus, errorThrown) {
        	alert("[fail]" + errorThrown);
        }
    });
    $('#left').click(function(event) {
    	VIEWER.shiftLeft();
    });
    $('#right').click(function(event) {
    	VIEWER.shiftRight();
    });

    $("#body_stroke").spectrum({
		preferredFormat: "hex3",
        change: function(color) {
        	VIEWER.data.colours[VIEWER.index].body_stroke = color.toHexString();
        	VIEWER.refreshPlayer(VIEWER.central, VIEWER.index);
    	}
    });
    $("#body_fill").spectrum({
    	preferredFormat: "hex3",
       change: function(color) {
			VIEWER.data.colours[VIEWER.index].body_fill = color.toHexString();
			VIEWER.refreshPlayer(VIEWER.central, VIEWER.index);
	    } 
    });
    $("#eye_stroke").spectrum({
        preferredFormat: "hex3",
        change: function(color) {
        	VIEWER.data.colours[VIEWER.index].eye_stroke = color.toHexString();
        	VIEWER.refreshPlayer(VIEWER.central, VIEWER.index);
		}
    });
    $("#eye_fill").spectrum({
        preferredFormat: "hex3",
        change: function(color) {
        	VIEWER.data.colours[VIEWER.index].eye_fill = color.toHexString();
        	VIEWER.refreshPlayer(VIEWER.central, VIEWER.index);
		}   
    });
});
