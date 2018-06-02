let outerThis;
const defaultBindings = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    right: 'ArrowRight',
    left: 'ArrowLeft',
    fire: 'mousedown',
    pickup: 'f',
    fullscreen: 'p',
};

function valueAlreadyUsed(newValue) {
    let result = false;
    Object.entries(outerThis.keybindObject).forEach(
        ([key, value]) => {
            //console.log(value === newValue);
            if(value === newValue) result = true;
        }
    );
    console.log(result);
    return result
}

function changeKeybindTo(key) {
    if(!valueAlreadyUsed(key)) {
        outerThis.keybindObject[outerThis.listening] = key;
        outerThis.listening = '';
        outerThis.message = "click a keybind to change it";
    }else{
        outerThis.message = `${key} is already in use try another key`;
    }
}

document.addEventListener('DOMContentLoaded',function () {
    let app = new Vue({
        el: '#keybinds',
        data: {
            listening: '',
            keybindObject: {
                up: defaultBindings.up,
                down: defaultBindings.down,
                right: defaultBindings.right,
                left: defaultBindings.left,
                fire: defaultBindings.fire,
                pickup: defaultBindings.pickup,
                fullscreen: defaultBindings.fullscreen,
            },
            message: 'click a keybind to change it'
        },
        methods: {
            listenForKeybind: function (key) {
                this.listening = key;
                this.keybindObject[key] = '|';
                this.message = `listening for key: ${key}`;

            },
            initListener: function () {
                document.addEventListener('keyup',function (event) {
                    changeKeybindTo(event.key);
                });
                document.addEventListener('mousedown',function (event) {
                    /*if(event.button === 0) outerThis.keybindObject[outerThis.listening] = 'mousedown';
                    else if(event.button === 1) outerThis.keybindObject[outerThis.listening] = 'mousedown';
                    else*/
                    changeKeybindTo('mousedown');
                })
            }
        },
        beforeMount(){
            outerThis = this;
            this.initListener();
        }
    });
});