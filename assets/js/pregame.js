let vueData;

const getTopForGame = "https://api.twitch.tv/helix/games?name=surviv.io";
const getTopStreamers = "https://api.twitch.tv/helix/streams?first=10";
const baseGetUserById = "https://api.twitch.tv/helix/users?";
const baseGetGameById = "https://api.twitch.tv/helix/games?";
const clientId = "qte7vrpteicmv40msjy2p80clzwg52";
const twitchMainElement = document.getElementById('twitch');

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
    //console.log(key, code);
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

function updateTwitchMain() {
    let twitchHeader = new Headers({
        'Client-ID': clientId,
    });

    fetch(getTopStreamers, {headers: twitchHeader})
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            let getUsersById = baseGetUserById;
            let getGamesById = baseGetGameById;
            data.data.forEach(function (streamObj, index) {
                if (index < data.data.length - 1) {
                    getUsersById += `id=${streamObj.user_id}&`;
                    getGamesById += `id=${streamObj.game_id}&`;
                }
                else {
                    getUsersById += `id=${streamObj.user_id}`;
                    getGamesById += `id=${streamObj.game_id}`;
                }
            });
            let usersDetails;
            let gameDetails = {};
            fetch(getUsersById, {headers: twitchHeader})
                .then(function (response) {
                    return response.json();
                }).then(function (data) {
                usersDetails = data.data;
            }).then(function () {
                fetch(getGamesById, {headers: twitchHeader})
                    .then(function (response) {
                        return response.json();
                    }).then(function (data) {
                    data.data.forEach(function (game) {
                        gameDetails[game.id] = game.name
                    });
                }).then(function () {
                    console.log("streamDetails", data.data);
                    console.log("usersDetails", usersDetails);
                    console.log("gamesDetails", gameDetails);
                    twitchMainElement.innerHTML = "";
                    data.data.forEach(function (streamObj, index) {
                        let twitchDiv = document.createElement('div');
                        twitchDiv.classList = "twitchStream";
                        twitchDiv.innerText = `${usersDetails[index].display_name} is playing ${gameDetails[streamObj.game_id]}\nviewers: ${streamObj.viewer_count}\n${streamObj.title}`;
                        let profileImg = document.createElement('img');
                        profileImg.src = usersDetails[index].profile_image_url;
                        twitchDiv.append(profileImg);
                        twitchMainElement.append(twitchDiv);
                    });
                });
            });
        });
}

function drag_start(event) {
    var style = window.getComputedStyle(event.target, null);
    event.dataTransfer.setData("text/plain",
        (parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
}
function drag_over(event) {
    event.preventDefault();
    return false;
}
function drop(event) {
    var offset = event.dataTransfer.getData("text/plain").split(',');
    var dm = document.getElementById('twitch');
    dm.style.left = (event.clientX + parseInt(offset[0],10)) + 'px';
    dm.style.top = (event.clientY + parseInt(offset[1],10)) + 'px';
    event.preventDefault();
    return false;
}


document.addEventListener('DOMContentLoaded',function () {
    //RESIZING FUN
    /*let windows = [];
    //setInterval(openWin, 1000);
    //setInterval(function(){windows.forEach(w => w.resize())}, 1);

    function openWin() {
        windows.push(new SpamW());
    }

    function SpamW() {
        this.w = 400;
        this.h = 400;
        this.window = window.open("index.html", "", `fullscreen=1, channelmode=1, menubar= 0, titlebar = 0, scrollbars, 0, toolbar=0, width=${this.w}, height=${this.h}`);
        this.resize = function () {
            let variety = 100;
            this.h += -variety/2 + Math.floor(Math.random()*variety);
            this.w += -variety/2 +  Math.floor(Math.random()*variety);
            if(this.w < 1) this.w = 1;
            if(this.h < 1) this.h = 1;
            if(this.w > 1920) this.w = 1920;
            if(this.h > 1080) this.h = 1080;
            this.window.resizeTo(this.w,this.h);
        };
        return this;
    }

*/
    //
    updateTwitchMain();
    setInterval(updateTwitchMain, 10000);

    //MAKE TWITCH DRAGABLE
    var dm = document.getElementById('twitch');
    dm.addEventListener('dragstart',drag_start,false);
    document.body.addEventListener('dragover',drag_over,false);
    document.body.addEventListener('drop',drop,false);

    //VUE
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