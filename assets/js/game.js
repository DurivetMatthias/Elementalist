let width = 600;
let height = 600;
initViewportHW();

const heightMulitplier = 2;
const widthMultiplier = 2;
const mainCamZoom = 1;
const miniCamZoom = 4;
const housesJSON = [
    {x: 500, y:500, width: 100, height: 200},
    {x: 750, y:750, width: 100, height: 200}
];
const playerVelocity = 500;
const playerSize = 32;
const playerHp = 100;
const playerName = 'player-';

let game;
let keybindPromise;
let playerAngle;
let player;
let players;
let bullets;
let scrolls;
let houseWalls;
let houses;
let camera;
let minimapCamera;
let createThis;
let pointer;
let shotCooldown = 0;
let keyboard;
let lastPickup = 0;

let debugText;
let squirelText;
let keybindingObject;


function initViewportHW() {

    /*var viewPortWidth;
    var viewPortHeight;

    // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
    if (window.innerWidth) {
        viewPortWidth = window.innerWidth;
        viewPortHeight = window.innerHeight
    }

    // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
    if (document.documentElement && document.documentElement.clientWidth && document.documentElement.clientWidth != 0) {
        viewPortWidth = document.documentElement.clientWidth;
        viewPortHeight = document.documentElement.clientHeight
    }

    // older versions of IE
    else {
        viewPortWidth = document.getElementsByTagName('body')[0].clientWidth;
        viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
    }*/

    width = screen.availWidth;
    height = screen.availHeight;
}

let config = {
    type: Phaser.WEBGL,
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

function startGame() {
    initViewportHW();
    config.width = width * widthMultiplier;
    config.height = height * heightMulitplier;

    if(game) {
        game.destroy();
        let canvas = document.getElementsByTagName('canvas')[0];
        canvas.parentNode.removeChild(canvas);
    }
    game = new Phaser.Game(config);
}

document.addEventListener('keydown',function (event) {
    if(event.keyCode === keyboard.fullscreen) goFullscreen();
});

function goFullscreen() {
    if(game.device.fullscreen.available) {
        document.documentElement[game.device.fullscreen.request]();
        //initViewportHW();
        //game.resize(width,height);
        setTimeout(startGame,500);
    }
}

document.addEventListener('DOMContentLoaded',function () {
    keybindPromise = fetchKeybindsObject();
    startGame();
});

function preload ()
{
    this.load.spritesheet('bullet', 'assets/media/bullet.png', { frameWidth: 16, frameHeight: 9 });//312/160 paper fire
    this.load.spritesheet('house', 'assets/media/house.png', { frameWidth: 1024, frameHeight: 640 });
    this.load.spritesheet('inside', 'assets/media/inside.png', { frameWidth: 1024, frameHeight: 640 });
    this.load.spritesheet('squirel', 'assets/media/squirel.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('player', 'assets/media/player.png');
    this.load.image('bg', 'assets/media/background.png');
    this.load.image('temp', 'assets/media/house.png');
}
function create() {
    createThis = this;

    keyboard = {up: null, down: null, right: null, left: null, pickup: null, fullscreen: null, fire: null};
    keybindPromise.then(function (data) {
        keyboard.up = createThis.input.keyboard.addKey(data.up.code);
        keyboard.down = createThis.input.keyboard.addKey(data.down.code);
        keyboard.right = createThis.input.keyboard.addKey(data.right.code);
        keyboard.left = createThis.input.keyboard.addKey(data.left.code);
        keyboard.pickup = createThis.input.keyboard.addKey(data.pickup.code);
        keyboard.fullscreen = createThis.input.keyboard.addKey(data.fullscreen.code);
        keyboard.fire = createThis.input.keyboard.addKey(data.fire.code);
    });

    this.anims.create({
        key: 'bulletAnim',
        frames: createThis.anims.generateFrameNumbers('bullet'),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'houseAnim',
        frames: createThis.anims.generateFrameNumbers('house'),
        frameRate: 0,
        repeat: false
    });
    this.anims.create({
        key: 'insideAnim',
        frames: createThis.anims.generateFrameNumbers('inside'),
        frameRate: 0,
        repeat: false
    });
    this.anims.create({
        key: 'squirelAnim',
        frames: createThis.anims.generateFrameNumbers('squirel'),
        frameRate: 10,
        repeat: -1
    });

    this.physics.world.setBounds(0, 0, width*widthMultiplier, height*heightMulitplier);

    this.add.tileSprite(0, 0, width*widthMultiplier, height*heightMulitplier, "bg").setOrigin(0,0);

    pointer = game.input.activePointer;

    initPlayers();
    initHouses();
    initBullets();
    initScrolls();

    let app = new Vue({
        el: '#healthOverlay',
        data: {
            healthText: player.data.get('hp') + "/100"
        }
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

    scrollUI = this.add.text(width/2, height/8, player.data.get('scroll').data.get('type'), { fontFamily: 'Arial', fontSize: 24, color: '#FF0000' }).setScrollFactor(0,0);

    //DEBUG STUFF\\

    debugText = this.add.text(width/2, height/10, game.loop.actualFps, { fontFamily: 'Arial', fontSize: 24, color: '#FF0000' }).setScrollFactor(0,0);
    //squirelText = this.add.text(50, 50,'', { fontFamily: 'Arial', fontSize: 50, color: '#FFFFFF' }).setScrollFactor(0,0);
}

function createPlayer() {
    let player = createThis.physics.add.sprite(width/2, height/2, 'player');
    player.setDisplaySize(playerSize, playerSize);
    player.setOrigin(0.5, 0.5);
    player.setMaxVelocity(playerVelocity);
    player.setCollideWorldBounds(true);
    player.setDrag(playerVelocity*5,playerVelocity*5);
    player.setDataEnabled();
    player.data.set('hp',playerHp);
    player.data.set('name',playerName+players.getChildren().length);
    player.data.set('scroll',null);
    player.data.set('takeDamage', function (amount) {
        document.documentElement.style.setProperty("--hpPercent", amount);
        player.data.set('hp', player.data.get('hp')-amount);
    });

    player.on('changedata', function (player, key, value, resetValue) {
        if (key === 'hp' && value <= 0)
        {
            resetValue(0);
            killPlayer(player);
        }
    });

    players.add(player);

    return player;
}

function initPlayers() {
    players = createThis.add.group();
    player = createPlayer();
    players.setDepth(10);
}

function initHouses() {

    houses = createThis.add.group();
    houseWalls = createThis.add.group();

    housesJSON.forEach(function (houseObject) {
        let house = createThis.physics.add.sprite(houseObject.x + houseObject.width/2,houseObject.y,'house').setDisplaySize(houseObject.width, houseObject.height);
        let left = createThis.physics.add.sprite(houseObject.x,houseObject.y,'house').setDisplaySize(1, houseObject.height);
        let right = createThis.physics.add.sprite(houseObject.x+houseObject.width,houseObject.y,'house').setDisplaySize(1, houseObject.height);

        house.enableBody(false);
        left.setImmovable(true);
        right.setImmovable(true);

        house.setDataEnabled();
        house.data.set('inside',false);

        houses.add(house);
        houseWalls.add(left);
        houseWalls.add(right);
    });

    createThis.physics.add.collider(players, houseWalls);

    createThis.physics.add.overlap(players, houses, function (player, house) {
        if(!house.data.get('inside')) house.data.set('inside',true);
    }, null, null);

}

function initBullets() {
    bullets = createThis.add.group();
    createThis.physics.add.overlap(bullets, players, function (bullet,player) {
        if(bullet.data.get('owner')!==player.data.get('name')){
            player.data.get('takeDamage')(bullet.data.get('damage'));
            destroyBullet(bullet);
        }
    }, null, null);
    createThis.physics.add.overlap(bullets, houseWalls, (bullet => bullet.destroy()), null, null);
}

function killPlayer(player) {
    player.destroy();
}

function update() {
    debugText.setText("angle: " + Phaser.Math.RadToDeg(playerAngle));

    /*let diags = 0;
    let horiz = 0;
    let verti = 0;

    players.getChildren().forEach(function (child) {
        if(child.body.velocity.x!=0&&child.body.velocity.y!=0){
            diags++;
        }else if(child.body.velocity.x!=0&&child.body.velocity.y==0){
            horiz++;
        }else if(child.body.velocity.x==0&&child.body.velocity.y!=0){
            verti++;
        }
    });

    squirelText.setText(
        `diagonal squirels: ${diags} : ${diags/50*100}%\n
horizontal squirels: ${horiz} : ${horiz/50*100}%\n
vertical squirels: ${verti} : ${verti/50*100}%\n
still squirels: ${50 - (diags+horiz+verti)} : ${(50 - (diags+horiz+verti))/50*100}%`
    );*/

    bullets.getChildren().map(bullet=> bullet.data.set('timeAlive',bullet.data.get('timeAlive')+1));

    //by drawing first and then setting the texture won't flicker, only the true/false value changes behind the scenes
    houses.getChildren().forEach(function (houseObj) {
        if(houseObj.data.get('inside')) houseObj.play('insideAnim');
        else houseObj.play('houseAnim');

        if(houseObj.data.get('inside')) houseObj.data.set('inside',false);
    });

    if(pointer){
        var line = new Phaser.Geom.Line(player.x-camera.scrollX, player.y-camera.scrollY, pointer.position.x, pointer.position.y);
        playerAngle = Phaser.Geom.Line.Angle(line);
        player.rotation = Phaser.Geom.Line.Angle(line);
    }

    let scroll = player.data.get("scroll");
    scroll.data.set(SCROLLOPTIONS.NECESSARY_PARAMETERS.COOLDOWN,scroll.data.get(SCROLLOPTIONS.NECESSARY_PARAMETERS.COOLDOWN) - 1);

    if(pointer.isDown){
        fire();
    }

    if(keyboard.up.isDown) player.setVelocityY(-playerVelocity);

    if(keyboard.down.isDown) player.setVelocityY(playerVelocity);

    if(keyboard.right.isDown) player.setVelocityX(playerVelocity);

    if(keyboard.left.isDown) player.setVelocityX(-playerVelocity);

    if(keyboard.pickup.isDown) {
        if(Date.now()-lastPickup >500){
            lastPickup = Date.now();
            pickupClosest();
        }
    };

    //if(keyboard.fullscreen.isDown) toggleFullscreen();
}
