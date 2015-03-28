// Bootstrap asset paths into JS land

var GAME = {};

GAME.assets = {
    subtitle: "/assets/subtitle-39dc570a6ab6f483cef09cb0f46613ae.png",
    fullStack: "/assets/full-stack-text-b25bca38433cae9a7ca920eb3a4dd693.png",
    stackTech: "/assets/stack-tech-57b066ecb68f71b4331954d59319c78a.png",
    clickDrag: "/assets/drag-4f8540fd4d799e4fb662f47019f81c1f.png",
    player: "/assets/player-889987fcd1da0d59c3873bc5f4c9611b.png",
    cursor: "/assets/cursor-6f91a113e09fcc86b6104f74226b3f7c.png"
};
// Sets up canvas prior to loading assets

GAME.Boot = function() {};

GAME.Boot.prototype = {
    preload: function() {
        // Load loading screen assets
    },
    
    create: function() {
        this.game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
        this.game.state.start('preloader');
    }
};
// The main game state

GAME.Main = function() {
    this.stackY = 470;
};

GAME.Main.prototype = {

    create: function() {
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.gravity.y = 300;

        // Helper text is behind all
        this.bgHelpers = this.game.add.group();

        this.subtitle = new GAME.Subtitle(this.game, this.game.world.centerX, this.stackY + 65);
        this.drawClickDrag();
        this.drawBoxStack();
        this.wireSpawn();
        
        this.cursors = this.game.input.keyboard.createCursorKeys();
    },
    
    update: function() {
        this.subtitle.update();
        this.stack.update();
        
        if (this.player) {
            this.player.update(this.cursors);
        }
    },
    
    drawBoxStack: function() {
        this.stack = new GAME.BoxStack(this.game,
            this.game.world.centerX - 130, this.stackY, 80, 80, 4, this.stackText);
    },
    
    drawClickDrag: function() {
        this.drag = this.bgHelpers.create(this.game.world.centerX - 285, 215, 'clickDrag');
        this.drag.scale = { x: 0.37, y: 0.37 };
    },
    
    wireSpawn: function() {
        $('.spawner').click(function() {
            $('.spawner').unbind('click');
            $('body').animate({ scrollTop: 0 }, 'fast');
            this.drag.kill();
            this.cursor = this.bgHelpers.create(this.game.world.centerX + 30, 230, 'cursor');
            this.player = new GAME.Player(this.game, this.game.world.centerX, 400);
            this.stack.explode();
        }.bind(this));
    },
    
    stackText: [
        [
            {
                text: 'HTML'
            }
        ],
        [
            {
                text: 'CSS'
            },
            {
                text: 'Sass'
            }
        ],
        [
            {
                text: 'Java-\nScript'
            },
            {
                text: 'Back-\nbone'
            },
            {
                text: ' jQuery '
            }
        ],
        [
            {
                text: 'Ruby'
            },
            {
                text: 'Rails'
            },
            {
                text: 'SQL'
            },
            {
                text: 'Mongo'
            }
        ]
    ]
};
// Loads main game assets

GAME.Preloader = function() {};

GAME.Preloader.prototype = {
    preload: function() {
        // Load main game assets
        this.game.load.image('subtitle', GAME.assets.subtitle);
        this.game.load.image('fullStack', GAME.assets.fullStack);
        this.game.load.image('stackTech', GAME.assets.stackTech);
        this.game.load.image('clickDrag', GAME.assets.clickDrag);
        this.game.load.image('cursor', GAME.assets.cursor);
        this.game.load.spritesheet('player', GAME.assets.player, 64, 64);
    },
    
    create: function() {
        var _this = this;
        
        WebFont.load({
            google: {
                families: ['Indie Flower']
            },
            active: function() {
                _this.game.state.start('main');
            }
        });
    }
};

// A simple physics enabled box

GAME.Box = function(game, x, y, sizeX, sizeY, text) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.text = text;
    this.init();
};

GAME.Box.prototype = {
    init: function() {
        var bmd = this.game.add.bitmapData(this.sizeX, this.sizeY);

        bmd.ctx.fillStyle = '#eeeeee';
        bmd.ctx.fillRect(0, 0, this.sizeX, this.sizeY);

        bmd.ctx.lineWidth = 5;
        bmd.ctx.strokeStyle = '#222222';
        bmd.ctx.strokeRect(0, 0, this.sizeX, this.sizeY);
        
        this.sprite = this.game.add.sprite(this.x, this.y, bmd);
        this.game.physics.p2.enable(this.sprite);
        this.sprite.body.collideWithWorldBounds = true;
        this.sprite.inputEnabled = true;
        this.sprite.alpha = 1;
        
        this.draggable();
        
        this.drawText();
    },
    
    drawText: function() {
        this.textSprite = this.game.add.text(0, 0, this.text, {
            font: '20px "Indie Flower"'
        });
        this.textSprite.lineSpacing = 2;
        this.textSprite.anchor.set(0.5);
        this.sprite.addChild(this.textSprite);
    },
    
    draggable: function() {
        this.sprite.input.enableDrag();
    },
    
    killable: function() {
        this.sprite.events.onInputDown.add(function() {
            this.sprite.kill();
        }, this);
    },
    
    update: function() {
        if (this.sprite.input.isDragged) {
            this.sprite.body.x = this.game.input.activePointer.worldX;
            this.sprite.body.y = this.game.input.activePointer.worldY;
            this.sprite.body.setZeroVelocity();
        }
    }
};
// A stack of boxes

GAME.BoxStack = function(game, x, y, sizeX, sizeY, rows, textMap) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.rows = rows;
    
    // Should be even number
    this.spacing = 6;
    
    this.boxes = [];
    
    this.textMap = textMap;

    this.init();
};

GAME.BoxStack.prototype = {
    init: function() {
        this.drawStack(this.rows, this.x, this.y)
    },
    
    drawStack: function(row, x, y, static) {
        var currentX = x;
        
        for (var i = 0; i < row; i++) {
            this.boxes.push(new GAME.Box(this.game, currentX, y, this.sizeX, this.sizeY,
                this.textMap[row - 1][i].text));
            currentX += this.sizeX + this.spacing;
        }
        
        if (row - 1 > 0) {
            this.drawStack(row - 1, x + (this.sizeX + this.spacing) / 2, y - this.sizeY)
        }
    },
    
    explode: function() {
        for (var i = 0; i < this.boxes.length; i++) {
            var body = this.boxes[i].sprite.body;
            
            body.velocity.x = 10000 * (1 / (-1 * (this.game.world.centerX - body.x)));
            body.velocity.y = 1000;
        }
    },
    
    update: function() {
        // Update each box
        for (var i = 0; i < this.boxes.length; i++) {
            this.boxes[i].update();
        }
    }
};

// Stick figure player

GAME.Player = function(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    
    this.inAir = false;
    
    this.init();
};

GAME.Player.prototype = {
    init: function() {
        this.sprite = this.game.add.sprite(this.x, this.y, 'player');
        this.game.physics.p2.enable(this.sprite);
        this.sprite.body.fixedRotation = true;
        this.sprite.animations.add('run', [11, 12, 13, 14, 15], 10, true);
        this.sprite.animations.add('jump', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10, false);
    },
    
    update: function(cursors) {
            var jumping = this.jumping();
        
            if (cursors.left.isDown) {
                this.sprite.body.moveLeft(150);
                this.sprite.scale.x = 1;
                
                if (!jumping) {
                    this.sprite.animations.play('run');
                }
            } else if (cursors.right.isDown) {
                this.sprite.body.moveRight(150);
                this.sprite.scale.x = -1;
                
                if (!jumping) {
                    this.sprite.animations.play('run');
                }
            } else {
                this.sprite.body.velocity.x = 0;
                
                if (!jumping) {
                    this.sprite.animations.stop();
                    this.sprite.frame = 16;
                }
            }

            if (cursors.up.isDown && !jumping) {
                this.sprite.body.moveUp(240);
                this.sprite.animations.play('jump');
            } 
    },

    jumping: function() {
        var yAxis = p2.vec2.fromValues(0, 1);
        var result = false;
    
        for (var i = 0; i < this.game.physics.p2.world.narrowphase.contactEquations.length; i++)
        {
            var c = this.game.physics.p2.world.narrowphase.contactEquations[i];
    
            if (c.bodyA === this.sprite.body.data || c.bodyB === this.sprite.body.data)
            {
                var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
                if (c.bodyA === this.sprite.body.data) d *= -1;
                if (d > 0.5) result = true;
            }
        }
        
        return !result;
    
    }
};
// The static physics enabled subtitle pbject

GAME.Subtitle = function(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.init();
};

GAME.Subtitle.prototype = {
    init: function() {
        this.sprite = this.game.add.sprite(this.x, this.y, 'fullStack');
        this.game.physics.p2.enable(this.sprite);
        this.sprite.body.static = true;
    },

    update: function() {
        if (this.sprite.input && this.sprite.input.isDragged) {
        	this.sprite.body.x = this.game.input.activePointer.worldX;
        	this.sprite.body.y = this.game.input.activePointer.worldY;
        	this.sprite.body.setZeroVelocity();
        	this.sprite.body.setZeroRotation();
        }
    }
};




$(function() {
    var $container = $('#game-container');
    
    var game = new Phaser.Game($container.width(), $container.height(),
        Phaser.AUTO, 'game-container', null, true);
    game.state.add('boot', GAME.Boot);
    game.state.add('preloader', GAME.Preloader);
    game.state.add('main', GAME.Main);
    game.state.start('boot');
});

