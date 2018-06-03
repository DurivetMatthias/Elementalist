const storageName = "keybinds";
const instanceName = "keybindStorage";

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