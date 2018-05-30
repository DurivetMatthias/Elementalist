let width = 600;
let height = 600;
initViewportHW();

const heightMulitplier = 2;
const widthMultiplier = 2;
const theoreticalFramerate = 60;
const mainCamZoom = 1;
const miniCamZoom = 4;
const playerSize = 32;


let playerAngle;
let player;
const playerVelocity = 500;
let bullets = [];
let camera;
let minimapCamera;
let createThis;
let pointer;
let shotCooldown = 0;
let keyboard;


function initViewportHW() {

    var viewPortWidth;
    var viewPortHeight;

    // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
    if (window.innerWidth) {
        viewPortWidth = window.innerWidth;
        viewPortHeight = window.innerHeight
    }

    // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
    else if (document.documentElement && document.documentElement.clientWidth && document.documentElement.clientWidth != 0) {
        viewPortWidth = document.documentElement.clientWidth;
        viewPortHeight = document.documentElement.clientHeight
    }

    // older versions of IE
    else {
        viewPortWidth = document.getElementsByTagName('body')[0].clientWidth;
        viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
    }

    width = viewPortWidth;
    height = viewPortHeight;
}

const config = {
    type: Phaser.WEBGL,
    width: width * widthMultiplier,
    height: height * heightMulitplier,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0},
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

function preload ()
{
    this.load.image('player', 'assets/media/player.png');
    this.load.image('bullet', 'assets/media/bullet.png');
    this.load.image('bg', 'assets/media/background.png');
}

function create() {
    createThis = this;
    this.physics.world.setBounds(0, 0, width*widthMultiplier, height*heightMulitplier);

    this.add.tileSprite(0, 0, width*widthMultiplier, height*heightMulitplier, "bg").setOrigin(0,0);

    keyboard ={
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        pickup: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
    };
    pointer = game.input.activePointer;

    player = this.physics.add.sprite(width/2, height/2, 'player');
    player.setOrigin(0.5, 0.5).setDisplaySize(playerSize, playerSize).setCollideWorldBounds(true).setDrag(playerVelocity*5,playerVelocity*5);
    player.setMaxVelocity(playerVelocity);

    //CAMERA STUFF\\
    camera = this.cameras.main;
    camera.setSize(width/mainCamZoom, height/mainCamZoom);
    camera.startFollow(player);

    const borderSize = 1;
    const offset = 20;

    minimapCamera = this.cameras.add(width-width/miniCamZoom-offset, borderSize+offset, width/miniCamZoom, height/miniCamZoom);
    minimapCamera.setBackgroundColor(0x00FF00);
    minimapCamera.startFollow(player);


    var rect = new Phaser.Geom.Rectangle(width-width/miniCamZoom-borderSize-offset, offset, width/miniCamZoom+borderSize*2, height/miniCamZoom+borderSize*2);
    var graphics = this.add.graphics();
    graphics.strokeRectShape(rect).setScrollFactor(0);
}

function fire() {
    let shotsPerSecond = 3;
    shotCooldown = theoreticalFramerate/shotsPerSecond;
    let bullet = createThis.physics.add.sprite(player.x,player.y,'bullet');
    createThis.physics.moveTo(bullet, pointer.position.x+camera.scrollX, pointer.position.y+camera.scrollY,1000);
    //bullets.add(bullet);
}

function pickup() {
    //TODO
}
function update() {

    if(pointer){
        var line = new Phaser.Geom.Line(player.x-camera.scrollX, player.y-camera.scrollY, pointer.position.x, pointer.position.y);
        playerAngle = Phaser.Geom.Line.Angle(line);
        player.rotation = Phaser.Geom.Line.Angle(line);
    }

    if(pointer.isDown){
        if(shotCooldown <= 0) fire();
    }
    shotCooldown--;

    if(keyboard.up.isDown) player.setVelocityY(-playerVelocity);

    if(keyboard.down.isDown) player.setVelocityY(playerVelocity);

    if(keyboard.right.isDown) player.setVelocityX(playerVelocity);

    if(keyboard.left.isDown) player.setVelocityX(-playerVelocity);

    if(keyboard.pickup.isDown) pickup();
}
