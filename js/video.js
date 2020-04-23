var video, juicebar, juice, btnPlayPause, btnMuteUnmute, btnFullscreen, volumebar, volume;

window.onload = initializePlayer;


/*
document.addEventListener("DOMContentLoaded", (event) => {
    console.log('DOMContentLoaded. DOM is ready.')
})
*/



function initializePlayer() {
    // initialize objects
    video = document.querySelector(".video");
    juicebar = document.querySelector(".orange-bar");
    juice = document.querySelector(".orange-juice");

    btnPlayPause = document.getElementById("play-pause");
    btnMuteUnmute = document.getElementById("mute-unmute");

    btnRewind = document.getElementById("rewind");
    btnForward = document.getElementById("forward");

    btnFullscreen = document.getElementById("fullscreen");

    volumebar = document.querySelector(".volume-bar");
    volume = document.querySelector(".volume");


    // add event listeners
    btnPlayPause.addEventListener("click", function () { togglePlayPause(); })

    var offSpan = 3;
    var offDelay = 20;

    var rewOffset = offSpan;
    var rewHandle = null;
    btnRewind.addEventListener("click", function () {
        if (rewHandle) {
            clearTimeout(rewHandle); rewHandle = null;
            rewOffset += offSpan;
        }
        rewHandle = setTimeout(function () {
            video.currentTime = Math.max(video.currentTime - rewOffset, 0);
            rewOffset = offSpan;
        }, offDelay)

    });

    var ffdOffset = offSpan;
    var ffdHandle = null;
    btnForward.addEventListener("click", function () {


        if (ffdHandle) {
            clearTimeout(ffdHandle); ffdHandle = null;
            ffdOffset += offSpan;
        }
        ffdHandle = setTimeout(function () {
            video.currentTime = Math.min(video.currentTime + ffdOffset, video.duration);
            ffdOffset = offSpan;
        }, offDelay)

    });

    btnMuteUnmute.addEventListener("click", function () { toggleMuteUnmute(); });

    video.addEventListener("timeupdate", function () {
        var juicePos = video.currentTime / video.duration;
        juice.style.width = juicePos * 100 + "%";

        if (video.ended) toggleIcon(btnPlayPause, "fa-play-circle", "fa-pause-circle")
    });

    //video.volume.addEventListener("volumechange",volumeBarUpdate)

    /*video.addEventListener("ended", function () {
        togglePlayPause(false);
    })*/

    juicebar.addEventListener("mouseup", noVolumeDrag);

    juicebar.addEventListener("mousedown", seekVideo);

    juice.addEventListener("mousedown", seekVideo);

    btnFullscreen.addEventListener("click", function () {

        if (video.requestFullScreen) {
            video.requestFullScreen();
        } else if (video.webkitRequestFullScreen) {
            video.webkitRequestFullScreen();
        } else if (video.mozRequestFullScreen) {
            video.mozRequestFullScreen();
        }else{
            alert("Fullscreen not possible!");
        }

    });

    volumebar.addEventListener("mousedown", adjustVolume);

    volume.addEventListener("mousedown", adjustVolume);

    volumebar.addEventListener("mousemove", adjustVolume);
    volume.addEventListener("mousemove", adjustVolume);

    volumebar.addEventListener("mouseup", noVolumeDrag);
    //volumebar.addEventListener("mouseout", noVolumeDrag);

    volume.addEventListener("mouseup", noVolumeDrag);
    //volume.addEventListener("mouseout", noVolumeDrag);


    volumeBarUpdate();

    /*
        try {
            if (video.paused) {
                video.currentTime = 0.0001;
                video.play();
            }
    
        } catch (e) {
    
        }
    */

}

var volumneDrag = false;
function adjustVolume(event) {

    if (event.type == "mousemove" && !volumneDrag) return;

    if (event.type == "mousedown") volumneDrag = true;

    console.log(volumneDrag);

    var elem = $(event.target);
    var left = elem.offset().left;
    var bar = $(volumebar);

    var volPos = (event.clientX - left) / bar.width();
    video.volume = volPos;

    volumeBarUpdate();

}

function volumeDrag(event) {
    volumneDrag = false;
}

function noVolumeDrag(event) {
    volumneDrag = false;
}

function setVolume() {
    //    vid.volume = volumeslider.value / 100;

}

function volumeBarUpdate() {
    volume.style.width = video.muted ? "0" : (volumebar.offsetWidth * video.volume) + "px";
}


function seekVideo(event) {
    //console.log("X:",event.target.clientX)

    var elem = $(event.target);
    var left = elem.offset().left;
    var bar = $(juicebar);

    var juicePos = (event.clientX - left) / bar.width();
    //juice.style.width = juicePos * 100 + "%";
    video.currentTime = juicePos * video.duration;
}

//function togglePlayPause(state=undefined) {
function togglePlayPause(state) {

    try {
        var play = video.paused;
        if (state != undefined) play = state;

        toggleIcon(btnPlayPause, "fa-pause-circle", "fa-play-circle", !play)

        //if (play && video.currentTime < 45) video.currentTime = 45;
        if (play) video.play(); else video.pause();

    } catch (e) {
        alert(e.message);
    }
}

function toggleMuteUnmute() {

    toggleIcon(btnMuteUnmute, "fa-volume-mute", "fa-volume-up", video.muted)

    video.muted = !video.muted;

    volumeBarUpdate();
}

function toggleIcon(e, iconA, iconB, reverse) {

    if (!e || !iconA || !iconB) return;

    if (reverse == undefined) reverse = false;

    var elem = e;
    if (e.tagName.toLowerCase() != "i") elem = e.querySelector("i");

    let cls = elem.classList;

    if (reverse) {
        if (cls.contains(iconA)) cls.remove(iconA);
        if (!cls.contains(iconB)) elem.classList.add(iconB);
    } else {
        if (cls.contains(iconB)) elem.classList.remove(iconB);
        if (!cls.contains(iconA)) elem.classList.add(iconA);
    }

}


