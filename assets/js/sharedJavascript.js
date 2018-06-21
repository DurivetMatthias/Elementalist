const storageName = "keybinds";
const instanceName = "keybindStorage";

let scrollUI;

const keybindStorage = localforage.createInstance({
    name: instanceName
});

const defaultBindings = {
    up: {name: 'ArrowUp',code: 38},
    down: {name: 'ArrowDown',code: 40},
    right: {name: 'ArrowRight',code: 39},
    left: {name: 'ArrowLeft',code: 37},
    fire: {name: 'mousedown',code: 0},
    pickup: {name: 'f',code: 70},
    fullscreen: {name: 'p',code: 80},
};

function fetchKeybindsObject() {
    return new Promise (function (resolve, reject) {
        keybindStorage.getItem(storageName).then(function (data) {
            if (data) resolve(data);
            else resolve(defaultBindings);
        }).catch(function () {
            reject(data);
        });
    });
}

const SCROLLOPTIONS = {
    ELEMENT: {
        FIRE: "fire",
        WATER: "water",
        EARTH: "earth",
        AIR: "air",
    },
    SHOT_TYPE: {
        PROJECTILE: "projectile",
    },
    EFFECT: {
        HOMING: "homing",
        UNSTABLE: "unstable",
        GROWING: "growing",
        BOOMERANG: "boomerang",
    },
    NECESSARY_PARAMETERS: {
        FIRE_RATE: "shot_speed",
        BULLET_VELOCITY: "velocity",
        RANGE: "range",
        DAMAGE: "damage",
        COOLDOWN: "cooldown",
    },
    CATEGORIE: {
        ELEMENT: "element",
        SHOT_TYPE: "shot_type",
        EFFECT: "effect",
    }
};

function createScroll(element, effect, shotType, fireRate, bulletVelocity, range, damage) {
    let scroll = scrolls.create(200,500 + (scrolls.getChildren().length*200),"temp").setDisplaySize(10,10).setDataEnabled();
    scroll.data.set(SCROLLOPTIONS.CATEGORIE.ELEMENT,element);
    scroll.data.set(SCROLLOPTIONS.CATEGORIE.EFFECT,effect);
    scroll.data.set(SCROLLOPTIONS.CATEGORIE.SHOT_TYPE,shotType);
    scroll.data.set(SCROLLOPTIONS.NECESSARY_PARAMETERS.BULLET_VELOCITY,bulletVelocity);
    scroll.data.set(SCROLLOPTIONS.NECESSARY_PARAMETERS.RANGE,range);
    scroll.data.set(SCROLLOPTIONS.NECESSARY_PARAMETERS.DAMAGE,damage);
    scroll.data.set(SCROLLOPTIONS.NECESSARY_PARAMETERS.FIRE_RATE,fireRate);
    scroll.data.set(SCROLLOPTIONS.NECESSARY_PARAMETERS.COOLDOWN,0);
    return scroll
}

function initScrolls() {
    scrolls = createThis.add.group();
    pickup(createScroll(SCROLLOPTIONS.ELEMENT.FIRE, SCROLLOPTIONS.EFFECT.GROWING,SCROLLOPTIONS.SHOT_TYPE.PROJECTILE, 2, 600, 1, 10));
    createScroll(SCROLLOPTIONS.ELEMENT.WATER, SCROLLOPTIONS.EFFECT.UNSTABLE,SCROLLOPTIONS.SHOT_TYPE.PROJECTILE, 4, 600, 1, 10);
    createScroll(SCROLLOPTIONS.ELEMENT.EARTH, SCROLLOPTIONS.EFFECT.BOOMERANG,SCROLLOPTIONS.SHOT_TYPE.PROJECTILE, 2, 600, 3, 10);
    createScroll(SCROLLOPTIONS.ELEMENT.AIR, SCROLLOPTIONS.EFFECT.HOMING,SCROLLOPTIONS.SHOT_TYPE.PROJECTILE, 2, 600, 1, 10);
}

function pickup(scroll) {
    let oldScroll = player.data.get("scroll");
    if(oldScroll)drop(oldScroll);
    scroll.setVisible(false);
    player.data.set("scroll",scroll);
    //scrollUI.setText(scroll.data.get("element"));
}

function drop(scroll) {
    scroll.setX(player.x);
    scroll.setY(player.y);
    scroll.setVisible(true);
}

function createBullet() {
    let scroll = player.data.get("scroll");
    let scrollInfo = {
        damage: scroll.data.get(SCROLLOPTIONS.NECESSARY_PARAMETERS.DAMAGE),
        velocity: scroll.data.get(SCROLLOPTIONS.NECESSARY_PARAMETERS.BULLET_VELOCITY),
        range: scroll.data.get(SCROLLOPTIONS.NECESSARY_PARAMETERS.RANGE),
        element:  scroll.data.get(SCROLLOPTIONS.CATEGORIE.ELEMENT),
        effect:  scroll.data.get(SCROLLOPTIONS.CATEGORIE.EFFECT),
        shotType:  scroll.data.get(SCROLLOPTIONS.CATEGORIE.SHOT_TYPE),
    };

    let bullet = createThis.physics.add.sprite(player.x,player.y,'bullet');
    bullet.setDataEnabled();
    bullet.data.set('owner',player.data.get('name'));
    bullet.data.set('timeAlive',0);
    bullet.data.set(SCROLLOPTIONS.NECESSARY_PARAMETERS.DAMAGE,scrollInfo.damage);
    bullet.data.set(SCROLLOPTIONS.NECESSARY_PARAMETERS.BULLET_VELOCITY,scrollInfo.velocity);
    bullet.data.set(SCROLLOPTIONS.NECESSARY_PARAMETERS.RANGE,scrollInfo.range);
    bullet.data.set(SCROLLOPTIONS.CATEGORIE.ELEMENT,scrollInfo.element);

    bullet.anims.play('bulletAnim');

    let timeToLive = scrollInfo.range*game.loop.actualFps*300/scrollInfo.velocity;

    bullet.on('changedata', function (bullet, key, value, resetValue) {
        if (key === 'timeAlive' && value > timeToLive)
        {
            destroyBullet(bullet);
        }
    });

    switch(scrollInfo.element){
        case SCROLLOPTIONS.ELEMENT.FIRE:
            //TODO
            break;
        case SCROLLOPTIONS.ELEMENT.WATER:
            //TODO
            break;
        case SCROLLOPTIONS.ELEMENT.EARTH:
            //TODO
            break;
        case SCROLLOPTIONS.ELEMENT.AIR:
            //TODO
            break;
        default:
            break;
    }

    switch(scrollInfo.effect){
        case SCROLLOPTIONS.EFFECT.GROWING:
            bullet.on('changedata', function (bullet, key, value, resetValue) {
                if(key === 'timeAlive') bullet.setScale(1 + (value/5)); // X = double size in X frames
            });
            break;
        case SCROLLOPTIONS.EFFECT.HOMING:
            //TODO
            break;
        case SCROLLOPTIONS.EFFECT.BOOMERANG:
            bullet.on('changedata', function (bullet, key, value, resetValue) {
                if (key === 'timeAlive' && value === Math.ceil(timeToLive/2) && bullet.data)
                {
                    createThis.physics.moveTo(bullet, player.x, player.y, bullet.data.get(SCROLLOPTIONS.NECESSARY_PARAMETERS.BULLET_VELOCITY));
                }
            });
                break;
        case SCROLLOPTIONS.EFFECT.UNSTABLE:
            let randomStrength = 10;
            let randomAccel = 200 * (-randomStrength/2 + Math.ceil(Math.random() * randomStrength));

            bullet.on('changedata', function (bullet, key, value, resetValue) {
                if(key === "activateEffect" && value){
                    if(Math.abs(Phaser.Math.RadToDeg(bullet._rotation)) <= 45
                        || Math.abs(Phaser.Math.RadToDeg(bullet._rotation)) >= 135 ){
                        bullet.setAccelerationY(randomAccel);
                    }
                    else  {
                        bullet.setAccelerationX(randomAccel);
                    }
                }
            });
            break;
        default:
            break;
    }
    bullets.add(bullet);
    return bullet;
}

function fire() {
    let scroll = player.data.get("scroll");
    if (scroll.data.get(SCROLLOPTIONS.NECESSARY_PARAMETERS.COOLDOWN) <= 0) {
        scroll.data.set(SCROLLOPTIONS.NECESSARY_PARAMETERS.COOLDOWN,game.loop.actualFps / scroll.data.get(SCROLLOPTIONS.NECESSARY_PARAMETERS.FIRE_RATE));
        let bullet = createBullet();
        bullet.rotation = playerAngle;
        createThis.physics.moveTo(bullet, pointer.position.x + camera.scrollX, pointer.position.y + camera.scrollY, bullet.data.get(SCROLLOPTIONS.NECESSARY_PARAMETERS.BULLET_VELOCITY));

        bullet.data.set("activateEffect",true);
    }
}

function destroyBullet(bullet) {
    bullet.destroy();
}

function pickupClosest() {
    let closets = 50; // max range
    let closestScroll = null;

    scrolls.children.iterate(function (scroll) {
        const line = new Phaser.Geom.Line(player.x, player.y,scroll.x, scroll.y);
        const distance = Phaser.Geom.Line.Length(line);
        if(distance<closets) {
            closets = distance;
            closestScroll = scroll;
        }
    });

    if(closestScroll) pickup(closestScroll);
}