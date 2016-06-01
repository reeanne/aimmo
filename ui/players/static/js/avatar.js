const VIEWER = Object.create({

	sideAvatarRatio: 1 / 5,

	index: 0,

    angle: 1,

	refreshPickers: function() {
        var avatar = this.data.colours[this.index];
		$("#body_stroke").spectrum("set", avatar.body_stroke);
		$("#body_fill").spectrum("set", avatar.body_fill);
		$("#eye_stroke").spectrum("set", avatar.eye_stroke);
		$("#eye_fill").spectrum("set", avatar.eye_fill);
	},

	refreshPlayer: function(player, index, opacity = 1) {
        var avatar = this.data.colours[index];
		player.playerBody.attr({"fill": avatar.body_fill, "fill-opacity": opacity});
		player.playerBody.attr({"stroke": avatar.body_stroke, "stroke-opacity": opacity});
		player.playerEyeLeft.attr({"fill": avatar.eye_fill, "fill-opacity": opacity});
        player.playerEyeLeft.attr({"stroke": avatar.eye_stroke, "stroke-opacity": opacity});
        player.playerEyeRight.attr({"fill": avatar.eye_fill, "fill-opacity": opacity});
        player.playerEyeRight.attr({"stroke": avatar.eye_stroke, "stroke-opacity": opacity});
	},

	refreshAllPlayers: function() {
		this.constructCentralAvatarElement();
		this.constructLeftAvatarElement();
		this.constructRightAvatarElement();
	},

    constructCentralAvatarElement: function() {
        const playerRadius = 80;
        const playerHeadRadius = playerRadius * 0.6;
        const playerX = (this.paper.width - playerHeadRadius) / 2;
        const playerY = (this.paper.height + playerHeadRadius) / 2;

        this.constructAvatarElement(this.central, playerRadius, playerX, playerY, this.index, 1);  
    },

    constructLeftAvatarElement: function() {
        if (this.getLength() > 1) {
            const playerRadius = 60;
            const playerHeadRadius = playerRadius * 0.6;
            const playerX = (this.paper.width - playerHeadRadius) * this.sideAvatarRatio;
            const playerY = (this.paper.height + playerHeadRadius) * this.sideAvatarRatio;

    		this.constructAvatarElement(this.left, playerRadius, playerX, playerY, this.index + 1, 0.5);
        }
    },

     constructRightAvatarElement: function() {
        if (this.getLength() > 2) {
            const playerRadius = 60;
            const playerHeadRadius = playerRadius * 0.6;
            const playerX = (this.paper.width - playerHeadRadius) * (1 - this.sideAvatarRatio);
            const playerY = (this.paper.height + playerHeadRadius) * this.sideAvatarRatio;

            this.constructAvatarElement(this.right, playerRadius, playerX, playerY, this.index - 1, 0.5);
        }
    },

    constructAvatarElement: function(avatar, playerRadius, playerX, playerY, index, opacity) {
        const playerHeadRadius = playerRadius * 0.6;
        const playerEyeRadius = playerRadius * 0.2;

        avatar = {};
        avatar.playerBody = this.paper.circle(playerX, playerY, playerRadius);
        avatar.playerEyeLeft = this.paper.circle(
            playerX + playerHeadRadius * Math.cos(this.angle - 1),
            playerY + playerHeadRadius * Math.sin(this.angle - 1),
            playerEyeRadius
        );
        avatar.playerEyeRight = this.paper.circle(
            playerX + playerHeadRadius * Math.cos(this.angle + 1),
            playerY + playerHeadRadius * Math.sin(this.angle + 1),
            playerEyeRadius
        );

        this.refreshPlayer(avatar, Math.abs(index % this.getLength()), opacity);

        avatar.player = this.paper.set();
        avatar.player.push(
            avatar.playerBody,
            avatar.playerEyeLeft,
            avatar.playerEyeRight
        );
    },

    shiftLeft: function() {
		this.index = Math.abs((this.index + this.getLength() + 1) % this.getLength());
		this.refreshAllPlayers();
		this.refreshPickers();	
    },

    shiftRight: function() {
		this.index = Math.abs((this.index + this.getLength() - 1) % this.getLength());
    	this.refreshAllPlayers();
		this.refreshPickers();	
    },

    getLength: function() {
        return this.data.colours.length;
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
