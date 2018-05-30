let width = 600;
let height = 600;
initViewportHW();

const heightMulitplier = 2;
const widthMultiplier = 2;
const theoreticalFramerate = 60;
const mainCamZoom = 1;
const miniCamZoom = 4;
const playerSize = 32;
const housesJSON = [
    {x: 500, y:500, width: 100, height: 200},
    {x: 750, y:750, width: 100, height: 200}
];


let playerAngle;
let player;
const playerVelocity = 500;
let bullets = [];
let houses = [];
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
    this.load.spritesheet('bullet', 'assets/media/bullet.png', { frameWidth: 16, frameHeight: 9 });
    this.load.image('inside', 'assets/media/house_inside.jpeg');
    this.load.image('player', 'assets/media/player.png');
    this.load.image('bg', 'assets/media/background.png');
    this.load.image('house', 'assets/media/house.png');
}

function create() {
    createThis = this;

    this.anims.create({
        key: 'bulletAnim',
        frames: createThis.anims.generateFrameNumbers('bullet'),
        frameRate: 10,
        repeat: -1
    });

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

    initHouses();

    houses.forEach(function (house) {
        createThis.physics.add.collider(player, house.right);
        createThis.physics.add.collider(player, house.left);
        function onOverlap(player, house) {
            //TODO
        }
        createThis.physics.add.overlap(player, house.house, onOverlap, null, null);
    });

    //CAMERA STUFF\\
    camera = this.cameras.main;
    camera.setSize(width/mainCamZoom, height/mainCamZoom);
    camera.startFollow(player);

    const borderSize = 1;
    const offset = 20;

    minimapCamera = this.cameras.add(width-width/miniCamZoom-offset, borderSize+offset, width/miniCamZoom, height/miniCamZoom);
    minimapCamera.setBackgroundColor(0x00FF00);
    minimapCamera.startFollow(player);


    let rect = new Phaser.Geom.Rectangle(width-width/miniCamZoom-borderSize-offset, offset, width/miniCamZoom+borderSize*2, height/miniCamZoom+borderSize*2);
    let graphics = this.add.graphics();
    graphics.strokeRectShape(rect).setScrollFactor(0);

}

function initHouses() {
    housesJSON.forEach(function (houseObject) {
        let house = createThis.physics.add.sprite(houseObject.x + houseObject.width/2,houseObject.y,'house').setDisplaySize(houseObject.width, houseObject.height);
        let left = createThis.physics.add.sprite(houseObject.x,houseObject.y,'house').setDisplaySize(1, houseObject.height);
        let right = createThis.physics.add.sprite(houseObject.x+houseObject.width,houseObject.y,'house').setDisplaySize(1, houseObject.height);

        house.enableBody(false);
        left.setImmovable(true);
        right.setImmovable(true);

        houses.push({house: house, right: right, left: left});
    })
}

function fire() {
    let shotsPerSecond = 3;
    shotCooldown = theoreticalFramerate/shotsPerSecond;
    let bullet = createThis.physics.add.sprite(player.x,player.y,'bullet');
    bullet.rotation = playerAngle;
    createThis.physics.moveTo(bullet, pointer.position.x+camera.scrollX, pointer.position.y+camera.scrollY,750);
    bullets.push(bullet);
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
