let vueData;

function valueAlreadyUsed(newValue) {
    let result = false;
    Object.entries(vueData.keybindObject).forEach(
        obj => {
            if(obj.name === newValue) result = true;
        }
    );
    return result;
}

function changeKeybindTo(key, code) {
    console.log(key, code);
    if(vueData.listening===''){
        //TODO_
    }else if(!valueAlreadyUsed(key)) {
        vueData.keybindObject[vueData.listening].name = key;
        vueData.keybindObject[vueData.listening].code = code;
        vueData.listening = '';
        vueData.message = "click a keybind to change it";
    }else{
        vueData.message = `${key} is already in use try another key`;
    }
}

document.addEventListener('DOMContentLoaded',function () {
    let app = new Vue({
        el: '#app',
        data: {
            mainScreenActive: true,
            listening: '',
            keybindObject: null,
            message: 'click a keybind to change it'
        },
        methods: {
            startGame: function () {
                keybindStorage.setItem(storageName, this.keybindObject);
                window.location = "game.html";
            },
            listenForKeybind: function (key,code) {
                this.listening = key;
                this.keybindObject[key].name = '|';
                this.keybindObject[key].code = 0;
                this.message = `listening for key: ${key}`;

            },
            initListener: function () {
                document.addEventListener('keyup',function (event) {
                    changeKeybindTo(event.key, event.keyCode);
                });
                document.addEventListener('mousedown',function () {
                    changeKeybindTo('mousedown', 0);
                })
            },
            initKeybinds: function () {
                fetchKeybindsObject().then(function (data) {
                    vueData.keybindObject = data;
                });
            }
        },
        beforeMount(){
            vueData = this;
            this.initKeybinds();
            this.initListener();
        }
    });
});