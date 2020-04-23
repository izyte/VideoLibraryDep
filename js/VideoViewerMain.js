
$(document).ready(function () {

    setSpinner();

    initPage();

});

function initPage() {
    //
    //alert($('#divDesc'));
    unescapeHTML('divTitle');
    unescapeHTML('divDesc', true);
    unescapeHTML('divComm');

    $(window).on('resize', function () {
        resizeVideo();
    });

    resizeVideo();

    $('#videoplayer').bind('contextmenu', function () { return false; });

}


function unescapeHTML(id, nowrap) {
    if (typeof (nowrap) == 'undefined') nowrap = false;
    $('#' + id).html(dataToHTMLID(id, nowrap));
}

function dataToHTMLID(id,nowrap) {
    if (typeof (nowrap) == 'undefined') nowrap = false;
    if (nowrap) {
        return unescape($('#' + id).html()).replace(/\\n/gi, '&nbsp;');
    } else {
        return unescape($('#' + id).html()).replace(/\\n/gi, '<br/>');
    }
}

function dataToHTML(text, nowrap) {
    if (typeof (nowrap) == 'undefined') nowrap = false;
    if (nowrap) {
        return unescape(text).replace(/\\n/gi, '&nbsp;');
    } else {
        return unescape(text).replace(/\\n/gi, '<br/>');
    }
}

function resizeVideo() {
    var h = $(window).height();
    var w = $(window).width();

    var hoff = $('#divTitle').height() + $('#divDesc').height() + $('#divCommHead').height() + $('#divComm').height();
    $('#videoplayer').width(w);
    $('#videoplayer').height(h - hoff);

    $('#hw').val('h:' + h + ', w:' + w);

    //$('#videoplayer').width(w).height(h);

}

var spinner;
function setSpinner() {
    var opts = {
        lines: 13 // The number of lines to draw
        , length: 20 // The length of each line
        , width: 14 // The line thickness
        , radius: 32 // The radius of the inner circle
        , scale: 1 // Scales overall size of the spinner
        , corners: 1 // Corner roundness (0..1)
        , color: '#fff' // #rgb or #rrggbb or array of colors
        , opacity: 0.25 // Opacity of the lines
        , rotate: 0 // The rotation offset
        , direction: 1 // 1: clockwise, -1: counterclockwise
        , speed: 1 // Rounds per second
        , trail: 60 // Afterglow percentage
        , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        , zIndex: 2e9 // The z-index (defaults to 2000000000)
        , className: 'spinner' // The CSS class to assign to the spinner
        , top: '50%' // Top position relative to parent
        , left: '50%' // Left position relative to parent
        , shadow: false // Whether to render a shadow
        , hwaccel: false // Whether to use hardware acceleration
        , position: 'absolute' // Element positioning
    }
    var target = document.body;

    spinner = new Spinner(opts).spin();
    //setTimeout(function () {spinner.stop() }, 3000);

}