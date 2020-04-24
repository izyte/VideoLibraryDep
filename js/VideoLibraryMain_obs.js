//$.ajax({
//    url: 'VideoData.aspx?acn=setpane',
//    beforeSend: function () {
//        ;
//    }
//}).done(function (data) {
//    ;
//});

//$.ajax({url: 'VideoData.aspx?acn=setipp&ipp=' + $(this).val() + '&tm=' + (new Date())});


var Initializing_ = true;
$(document).ready(function () {

//alert('initializing...');
    var pg = redirectPage();
    if (pg) {
        return;
    }


    testRoutines();


    setSpinner();

    checkLoginInfo();

    // show login screen

    //initPage();
    //$("#video_details").dialog();

    if ($('#noVideo').val() == '1') $('#sepPlayer').trigger('click');
    if ($('#noTree').val() == '1') $('#sepTree').trigger('click');


    Initializing_ = false;


});


function testRoutines() {
    

    // test localStorage
//    if (localStorage.getItem('sample')) {
//        alert('sample: ' + localStorage.getItem('sample'));
//        localStorage.removeItem('sample');
//    } else {
//        alert(' sample data not found!!!');
//        localStorage.setItem('sample', 'Hello local storage');
//    }



}

function isFromTestSite() {
    return ( location.href.toLowerCase().indexOf('ivltest.') != -1);
}

function isFromDevSite() {
    return ( location.href.toLowerCase().indexOf('alvdv3500') != -1);
}

function redirectPage() {

return '';	// bypassed 2018-10-25

    var hr = location.href.toLowerCase();

    if (isFromDevSite() || isFromTestSite()) return;

    if (hr.substr(0, 5) == 'http:') {
        return location.href = 'https:' + hr.substr(5);
    }

    return '';
    
}

var isInitialized = false;
function initPage() {

    //$('#details').css('display', 'none');


    if (isAdmin() || isSuperUser()) {
        //toggleButton('mnuManage', false);
        $('#mnuManage').show();
    } else {
        //toggleButton('mnuManage', true);
        $('#mnuManage').hide();
    }

    if (isAdmin()) {
        //toggleButton('mnuUser', false);
        $('#mnuUser').show();
    } else {
        //toggleButton('mnuUser', true);
        $('#mnuUser').hide();
    }

    $("#vidInspDate").datepicker();
    $("#fltFromID").datepicker();
    $("#fltToID").datepicker();


    if ($('#itemsPerPageOld').val()) {
        $('#ItemsPerPage').val($('#itemsPerPageOld').val());
    }
    

    initServerVars();

    if (isInitialized) return;

    isInitialized = true;

    showMask(1);

    

    initGlobalVars();
    setPaneDisplay();
    assignEvents();
    setupTables();

    updateLayoutSub();

    generateTree();

    showThumbnails();

    setupPlayerSize();

    showMask(-1);

    keepAlive();

//    $('#debug').dialog({
//            autoOpen: (LOGIN_INFO.uid.toLowerCase()=='alv'),
//            resizable: true,
//            width: 480,
//            height: 320,
//            modal: false
//    });

    $('#debug').dialog({
        autoOpen: false,
        resizable: true,
        width: 320,
        height: 240,
        modal: false
    });

        //chgpass_form
        $('#chgpass_form').dialog({
            autoOpen: false,
            resizable: false,
            width: 260,
            height: 170,
            modal: true,

            open: function () {
                //$('.ui-dialog-buttonpane').find('button:contains("Login")').addClass('buttonCommon');
                //var btn = $('.ui-dialog-buttonpane').find('button:contains("Login")');
                //$(btn).attr('class', 'button');

                $('.ui-dialog-buttonpane').find('button').attr('class', 'button');
                $('#ChangePasswprd').attr('src', 'Tools/UserManagement/changepassword.html?ver='+Date());

            }

        });

    retryUploadMonitor();
}

function dateStrToYMD(id) {
    var dt = $('#' + id).val();
    var ymd = '';

    if (dt) {
        var idt = new Date(dt);
        ymd = idt.getFullYear() + '-' + (idt.getMonth() + 1) + '-' + idt.getDate();
    }

    return ymd;
}

function YMDToDate(id,strDate) {

    var idt = unescape(strDate);

    $('#' + id).val('');

    if (idt) {

        var dArr = idt.split('-');

        if (dArr.length == 3) {
            if (!isNaN(dArr[0]) && !isNaN(dArr[1]) && !isNaN(dArr[2])) {
                $('#' + id).datepicker("setDate",
                    new Date(parseFloat(dArr[0]), parseFloat(dArr[1]) - 1, parseFloat(dArr[2])));
            }
        }

    }

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

function setupPlayerSize() {
    return;
    var sep = $('#sepPlayer');
    var w = $(window).width() - sep.position().left - sep.width();
    //alert($(window).width() + ' , ' + $('#sepPlayer').width() + ' , ' + $('#sepPlayer').height() + ' , ' + $('#sepPlayer').position().left);
    var h = $(window).height() - $('.sph').height() - $('#comments').height() - $('#videotitle').height();

    $('#player').width(w).height(h);
}

var withLoginDialog_ = false;

function checkLoginInfo(validate) {

    if (typeof (validate) == 'undefined') validate = false;

    if (!withLoginDialog_) {

        //chgpass_form
        $('#login_form').dialog({
            autoOpen: false,
            resizable: false,
            width: 260,
            height: 170,
            modal: true,

            open: function () {
                //$('.ui-dialog-buttonpane').find('button:contains("Login")').addClass('buttonCommon');
                //var btn = $('.ui-dialog-buttonpane').find('button:contains("Login")');
                //$(btn).attr('class', 'button');

                $('.ui-dialog-buttonpane').find('button').attr('class', 'button');

            },

            buttons: [


                {
                    text: "Login"
                    , click: function (event) {

                        //alert(event.target.style.background='red');
                        //event.target.style.backgroundColor = 'red';
                        //$(event.target).css('background', 'red');

                        if (!$('#logUID').val()) {
                            $('#logUID').focus();
                            alert('You have to supply your user name.');
                        } else if (!$('#logPWD').val()) {
                            $('#logPWD').focus();
                            alert('You have to supply a password.');
                        } else {
                            var uurl = 'VideoData.aspx?acn=ulog&u=' + $('#logUID').val() + '&p=' + $('#logPWD').val() + '&tm=' + Date();
                            $.ajax({
                                url: uurl,
                                beforeSend: function () {
                                    showMask(1);
                                }
                            }).done(function (data) {
                                showMask(-1);
                                $('#loginInfo').val(data);
                                checkLoginInfo(true);
                            })

                        }
                    }

                }


            ]
        });

        var cbtn = $('.ui-dialog-titlebar-close');
        var idx, btn, title;
        for (idx = 0; idx < cbtn.length; idx++) {
            btn = cbtn[idx];
            title = $(btn).closest('div').find('span').html();
            if (title == 'User Login') {
                $(btn).css('display', 'none');
                break;
            }
        }

        $("#login_form").keydown(function (event) {
            if (event.keyCode == 13) {
                $(this).parent()
                   .find("button:eq(1)").trigger("click");
                return false;
            }
        });

        withLoginDialog_ = true;

    }


    var inf = $('#loginInfo').val();
    if (inf) {
        LOGIN_INFO = JSON.parse(inf);
    }

    if (LOGIN_INFO.urole) {

        var logHTML = '<ul class="uopt">' +
                        '<li style="min-width:110px;">' +
                            '<span><a>Welcome:&nbsp;' + LOGIN_INFO.uname  + '!&nbsp;<img src="images/down_a.png" /></a></span>' +
                            '<ul class="dropdown" >' +
                                '<li><a href="#" id="acnChgPass">Change&nbsp;password</a></li>' +
                                '<li><a href="#" id="acnLogout">Log out</a></li>' +
                            '</ul>' +
                        '</li>' +
                      '</ul>';

        //$('#staActivity').html('Welcome ' + LOGIN_INFO.uname + '!&nbsp;<img src="images/down_a.png" title="User options..." id="userOptionsDown" />&nbsp;<a id="acnLogout" href="#">[Logout]</a>');
        $('#staActivity').html(logHTML);
        $('#login_form').dialog("close");

        $('#curtain').hide('slide', { direction: 'right' }, 400);
        $('#details_all').show('slide', { direction: 'left' }, 400);

        updateStatus();

        //show('slide', { direction: 'left' }, 1400)

        $('#acnChgPass').click(function () {
//            if (LOGIN_INFO.uid != 'alv') {
//                alert('Sorry. This feature is not yet available.');
//                return;
//            }

            //alert('Tools/UserManagement/changepassword.html');
            showMask(1);
            window.setTimeout(function(){
                $('#chgpass_form').dialog("open");
            },100);
        });



        $('#acnLogout').click(function () {

            if (!confirm('You are about to logout.\nPlease click [Ok] to proceed or [Cancel] to continue using the application')) return;

            $.ajax({
                url: 'VideoData.aspx?acn=ulogout&tm=' + Date(),
                beforeSend: function () {
                    showMask(1);

                }   // can place fetch status like masking the page

            }).done(function (data) {
                $('#loginInfo').val(data);
                $('#mnuHome').val(data).trigger("click");
                checkLoginInfo(false);
                showMask(-1);
            });

        });

        // run initial setup
        initPage();

    } else {

    if (validate) {
        alert('Invalid login information. Please try again.');
        $('#logUID').focus();
        $('#logUID').select();
    } else {
        $('#logUID').focus();
        $('#logUID').select();
        $('#logPWD').val('');
    }


        $('#curtain').show('slide', { direction: 'right' }, 400);
        $('#details_all').hide('slide', { direction: 'left' }, 400);

        $('#login_form').dialog("open");
        $('#staActivity').html('Logging in ...');

    }


    

    //alert(LOGIN_INFO.cuser);

    //
}

function closeChangePass(){
     $('#chgpass_form').dialog("close");
}

function initServerVars() {

    try {
        $.ajax({
            url: 'VideoData.aspx?acn=ivars&tm=' + Date(),
            beforeSend: function () { ; }   // can place fetch status like masking the page
        }).done(function (data) {

            USER_VARS = JSON.parse(data);
            THMIDX = USER_VARS.THMIDX;

            THMIDX.DESCRIPTION = THMIDX.Z + 2;
            THMIDX.COMMENTS = THMIDX.Z + 3;
            THMIDX.FILENAME = THMIDX.Z + 4;
            THMIDX.GROUPFID = THMIDX.Z + 5;
            THMIDX.ASSETFID = THMIDX.Z + 6;

            THMIDX.INSPORINT = THMIDX.Z + 7;
            THMIDX.INSPTYPE = THMIDX.Z + 8;
            THMIDX.ITEMNO = THMIDX.Z + 9;
            THMIDX.INSPDATE = THMIDX.Z + 10;
            THMIDX.VID = THMIDX.Z + 11;


            //ongoing uploads
            //alert(USER_VARS.cuser);
            $('#currentuseruploads_title').html('Ongoing Uploads (&nbsp;' + LOGIN_INFO.uname + '&nbsp;)');
            //$('#staActivity').html('User&nbsp;:&nbsp;' + USER_VARS.cuser.toUpperCase());

            if (isAdmin()) {

                $('#serveruploads').css('display', 'flex');
                $('#serverencoding').css('display', 'flex');

            } else if (isSuperUser()) {
                $('#serveruploads').css('display', 'none');
                $('#serverencoding').css('display', 'none');
            } else {
                //toggleButton('mnuManage', true);
                //$('#serverencoding').css('display', 'none');

            }

        })
    } catch (ee) {
        alert(ee.message);
    }
}

function testOnly() {

    return;

    try {
        var img = document.createElement('img');
        img.onload = function () {
            alert(this.src);
        }
        img.src = 'videos//G0045488/V00876940000001/thumbnails.png';
        //document.body.appendChild(img);
    } catch (eee) {
        alert(eee.message);
    }
}

/********************************************************************************************************
*
* Global Variables
*
********************************************************************************************************/



var GROUP_FOLDER_FORMAT = "0000000";
var VIDEO_FOLDER_FORMAT = "0000000";
var ASSET_FOLDER_FORMAT = "0000000";

var THUMB_WIDTH = 150;
var THUMB_HEIGHT = 88;

var THUMB_COLS = 5;
var THUMB_ROWS = 5;

var LOGIN_INFO = null;
var USER_VARS = null;
var THMIDX = null;

var queueDataTable;
var queueData = { "data": [] }

var uploadDataTable;
var uploadData = { "data": [] }

var encodeDataTable;
var encodeData = { "data": [] }

var thmTemplate = '<div class="{STYLE}">' +
                        '<div>' +
                            '<img src="{SOURCE}" alt="{TITLE}" />' +
                            '<duration>{DURATION}</duration>' +
                        '</div>' +
                        '<vtitle>{TITLE}</vtitle>' +
                        '<views>{VIEWS}</views>' +
                    '</div>';

//var QIDX = { FILENAME: 0, SIZE: 1, LOCATION: 2, STATUS: 3 };
var QIDX = { SELECTCHK: 0, FILENAME: 1, SIZE: 2, LOCATION: 3, STATUS: 4 };

var VIDX = { ID: 0, TITLE: 1, DURATION: 2, VIEWS: 3, COMMENTS: 4 };
var videoData = {}

var TIDX = { ID: 0, TITLE: 1, WCHILD: 2, CODE: 3 };

var testOnly = (location.href.toLowerCase().indexOf('ivltest.') != -1);


var treeData = { N0: [["45488", testOnly ? "Root Location" : "Shell Upstream Americas Deepwater", "1",testOnly ? "Root" : "UA/D"]] };
var treeDataX = { N0: [
                    ["45488", "Shell Upstream Americas Deepwater","1"]
                ],

                N45488: [
                    ["44660", "UA/D Brazil", "1"],
                    ["45601", "Non-Shell (Generic) - Americas", "1"],
                    ["45706", "UA/D Gulf of Mexico", "1"],
                    ["102107", "Spares", "1"]
                ],
                N44660: [
                    ["44661", "Bijupira-Salema", "1"],
                    ["87694", "BC10", "1"]
                ],

                N44661: [
                    ["44662", "Bijupira", "1"],
                    ["44780", "Gas Export Line", "1"],
                    ["44784", "Gas Export Line SSIV Umbilical", "1"],
                    ["45232", "Salema", "1"],
                    ["225066", "Bijupira-Salema Topsides", "1"],
                    ["225076", "Topsides Subsea Related", "1"]
                    
                ],

                N45706: [
                    ["6", "Auger", "1"],
                    ["1604", "MP-252", "1"],
                    ["2260", "Boxer", "1"],
                    ["2445", "Brutus", "1"],
                    ["2847", "Bullwinkle", "1"],
                    ["4393", "Cougar", "1"],
                    ["5070", "Cognac", "1"],
                    ["5778", "Enchilada", "1"],
                    ["6233", "Fairway", "1"],
                    ["6318", "Mars", "1"],
                    ["7588", "Nakika", "1"],
                    ["8770", "Brazos", "1"],
                    ["42934", "Ram Powell", "1"],
                    ["43134", "Ursa", "1"],
                    ["44161", "West Delta 143", "1"],
                    ["44633", "Yellowhammer", "1"],
                    ["89552", "Gasmer Test Facility", "1"],
                    ["89919", "Perdido", "1"],
                    ["232068", "Olympus", "1"]
                ] 

               }




function initGlobalVars() {
    //alert('init global variables.');
    //$('#footer').html('init global variables.@');
    //$('#footer').html('SEPCo - Inspection Video Library');

}

function toggleButton(id, disabled, noclass) {
    
    var btn = $('#' + id);

    if (typeof (noclass) == 'undefined') noclass = false;

    btn.prop('disabled', disabled);
    // do not change classname if noclass is true
    if (!noclass) btn.attr('class', 'button' + (disabled ? '_disabled' : ''));
}

function disableUploadButtons(disable) {

    if (typeof (disable) == 'undefined') disable = true;


    //toggleButton('uploadNow', disable);

// Temporarily
//    if (disable) {
//        $('#uploadNow').html('Pause Uploading');
//    } else {
//        $('#uploadNow').html('Start Uploading');
//    }

    toggleButton('uploadNow', disable);
    toggleButton('clearSelection', disable);
    toggleButton('selectFile', disable);
    toggleButton('fileSelected', disable, true);



}


function assignEvents() {

    //$('#fileSelected').prop('disabled', true);

    $(window).resize(function () {
        updateLayout();
    });


    $('#btnAssetSelector').click(function () {
        $('#asset_selector').dialog("open");
    });

    $('#uploadNow').click(function () {

        try {

            if ($(this).html().toLowerCase().indexOf('pause') != -1) {

                toggleButton('uploadNow', true);
                pauseUpload();
                //setTimeout("pauseUpload()",500);
                return;
            } else {
                paused = false;
            }


            var cnt = uploadStatusCount();
            cnt += uploadStatusCount('Paused');

            if (paused) {

                //alert('paused!!');
                //paused_

            } else {

                if (!cnt) {
                    alert('You have to select video file(s) to upload.');
                    return;
                } else {

                    if (!confirm('You are about to upload ' + cnt + ' video file' +
                        (cnt == 1 ? '' : '(s)') +
                        '.\nClick [Ok] to proceed or [Cancel] to discontinue.')) return;
                }
            }

        } catch (eee) {
            alert('error uploading video file(s): ' + eee.message);
        }

        disableUploadButtons();
        goUploadFiles();
    })


    $('#mnuHome').click(function () {
        $('#uploaddetails').css('display', 'none');
        $('#details').css('display', 'flex');
        setPaneDisplay();
        showThumbnails();
    })

    $('#mnuManage').click(function () {
        $('#details').css('display', 'none');
        $('#uploaddetails').css('display', 'flex');

        updateLayoutSub();
    })

    $('#mnuUser').click(function () {
        //var win = window.open('Tools/UserManagement/UserManagement.html', 'blank_', 'height=600,width=800');
        //var win = window.open('Tools/UserManagement/UserManagement.html', 'blank_', 'toolbar = no, location = no, directories = no, status = no, menubar = no, scrollbars = no, resizable = yes, copyhistory = no, height=600,width=1200');

        //win.focus();

        //Tools/UserManagement/UserManagement.html

        $("#user_management").dialog("open");


    });

    $('#mnuAbout').click(function () {
        //setupPlayerSize();
        //

        if (!isALV()) {
            alert('Sorry. About page is not yet available. ' + ACTIVE_UPLOADS.length); return;
        }


        if (!ACTIVE_UPLOADS.length) return;

        var upl;
        for (var idx in ACTIVE_UPLOADS) {
            upl = ACTIVE_UPLOADS[idx];
            if (upl.status().toLowerCase() == 'uploading') {
                upl.retry();
                break;
            }
        }


    })

    $('#mnuHelp').click(function () {


        alert('Sorry. Help page is not yet available.');
        //showThumbnails();
        //var li = $('#N45608');
        //alert(getAssetID());
        //alert(getGroup(li));
    })

    $('#clearSelection').click(function () {
        if (!confirm('You are about to clear all files in the upload queue.\nClick [Ok] to continue or [Cancel] to abort')) return;
        while (ACTIVE_UPLOADS.length) {
            ACTIVE_UPLOADS.pop();
        }
        ACTIVE_UPLOADS = [];
        refreshQuequeTable(true);
    });

    $('#btnVidSearch').click(function () {

        searchVideos();

    })

    $('#btnVidFilter').click(function () {

        filterVideos();

    })

    $("#vidSearchText").on('keyup', function (e) {
        if (e.keyCode == 13) {
            searchVideos();
        }
    });

    $('#fltScope').on('change', function (e) {
        //alert($(this).val());
        showDateRange($(this).val());
    });


    $("#vidSearchText").on('input', function (e) {
        if (!$(this).val()) {
            showThumbnails(false);
        }
    });

    $('#sepTree').click(function () {

        separatorClick(this);

        //$('#tree').css('display',$('#tree').css('display')=='none' ? 'flex' : 'none');
    })
    $('#sepPlayer').click(function () {

        separatorClick(this);
        //$('#playing').css('display', $('#playing').css('display')=='none' ? 'flex' : 'none');
    })

    //    $('img').load(function () {
    //        alert('hello');
    //        this.style.visibility = 'visible';
    //    });


    assignVideoEvents();

}

var mouseOverTimeout = 0;
var mouseOverImage = null;

function searchVideos() {
    var src = $('#vidSearchText');

    if (!src.val()) {
        alert('Please specify a filter text.');
        src.focus();
        return;
    }

    showThumbnails(true);

}

function filterVideos() {
    $("#video_filter").dialog("open");
}

function mouseOverEvent() {

    var img = mouseOverImage;


    var src = prevSource.substr(0, prevSource.indexOf('/tpost.png') + 1) + 'thumbnails.png';

    if (img.css("background-image") == 'none') {

        // image background is not yet set, create dummy img to load source
        var dimg = document.createElement('img');
        dimg.onload = function () {

            // set background image of the thumbnail and all associated style attributes
            img.css("background-image", "url(" + src + ")");
            img.css("background-repeat", "no-repeat");
            img.css("background-position", "0px 0px");
            animateThumbnailTimeout = setTimeout("animateThumbnail()", 300);
        }
        dimg.src = src;

    } else {
        animateThumbnail(); // call animate
    }


}

var prevSource = '';
var curTmbRow = 0;
var curTmbCol = 0;

function isAdmin() {
    return (LOGIN_INFO.urole.toLowerCase() == 'admin');  //(('.bill.mel.').indexOf('.' + USER_VARS.cuser.toLowerCase() + '.') != -1);
}

function isSuperUser() {
    return (LOGIN_INFO.urole.toLowerCase() == 'super');  //(('.alan.alv.uploader.*system*.').indexOf('.' + USER_VARS.cuser.toLowerCase() + '.') != -1);
}

function isWithMatrix(id) {
    return (videoData[id][THMIDX.WITH_MATRIX] == '1');
}

function isWithPoster(id) {
    return (videoData[id][THMIDX.WITH_POSTER] == '1');
}
function isWithThumbnail(id) {
    return (videoData[id][THMIDX.WITH_THUMBNAIL] == '1');
}

function isVideoComplete(id) {
    return (videoData[id][THMIDX.STATUS] == 'Complete');
}

function isVideoUploading(id) {
    return (videoData[id][THMIDX.STATUS] == 'Uploading');
}

function isVideoEncoding(id) {
    return (videoData[id][THMIDX.STATUS] == 'Encoding');
}

function isVideoForEncoding(id) {
    return (videoData[id][THMIDX.STATUS] == 'For Encoding');
}

function getVideoStatus(id) {
    return ({ STATUS: videoData[id][THMIDX.STATUS], PERCENT: videoData[id][THMIDX.PERCENT] });
}


function getFirstVideoID() {
    var key = 'xxx';
    for (key in videoData) {
        break;
    }
    return key;
}

function setVideoPlayerSource(id, noplay) {

    if (thmCheckVisible_) return;   // if checkbox is visible

    if (noPlay_) return;

    if (typeof (noplay) == 'undefined') noplay = false;
    if (id == -1) {
        id = getFirstVideoID();
    }


    var data = videoData[id];
    var path = '';
    var vp = $('#videoplayer');
    var poster = 'images/videoposter.png';
    var src = '';
    var title = 'No file loaded ...';
    var desc = '&nbsp;';
    var comm = '&nbsp;';

    if (data) {

        path = getVideoPath(data[THMIDX.GROUPFID], data[THMIDX.ASSETFID], parseInt(id.substr(1)));
        //title = cleanTitle(data[THMIDX.TITLE]);
        title = unescape(data[THMIDX.TITLE]);
        //desc = data[THMIDX.DESCRIPTION].replace(/\[NL\]/gi,' ');;
        desc =  unescape(data[THMIDX.DESCRIPTION]);
        if (!desc) desc = '&nbsp;';

        //comm = data[THMIDX.COMMENTS].replace(/\[NL\]/gi,'<br/>');

        comm = unescape(data[THMIDX.COMMENTS]);
        if (!comm) comm = '&nbsp;';

        if (isWithPoster(id)) poster = path + '/vpost.png';
        if (isVideoComplete(id)) src = path + '/video.mp4';


        resizeVideoPlayer();
    }

    //if (noplay) noplay

    vp[0].autoplay = !noplay;

    //alert(comm.indexOf('\n'));

    vp.attr('src', src);
    vp.attr('poster', poster);
    $('#videotitle').html(title);
    $('#videodescription').html(desc);
    $('#comments').html(comm.replace(/\n/gi,'<br/>'));

}

function getThumbs() {
    var tmbs = $('.box');
    if (tmbs.length == 0) tmbs = $('.tbox');

    return tmbs;
}

function getThumbChk(chk){
    if (typeof (chk) == 'undefined') chk = false;

    var tmbs = getThumbs();

    if(chk){
        return tmbs.find('input:checked');
    }else{
        return tmbs.find('input[type="checkbox"]');
    }
}

var thmCheckVisible_ = false;
function showChkSelect() {

    var chk = $('.box').find('input[type="checkbox"]');
    if (!chk.length) chk = $('.tbox').find('input[type="checkbox"]');

    if (!chk.length) return;

    thmCheckVisible_ = (chk.css('display') == 'none')

    chk.css('display', (thmCheckVisible_ ? 'inline' : 'none'));
    $('#divThumbSelectAll').css('display', (thmCheckVisible_ ? 'inline' : 'none'));


}


var queCheckVisible_ = false;
function showQueChkSelect() {

    queCheckVisible_ = false;   

    var chk = getQueueChk();
    if (!chk.length) return;

    queCheckVisible_ = (chk.css('display') == 'none')


    chk.css('display', (queCheckVisible_ ? 'inline' : 'none'));
    $('#divSelectAllFiles').css('display', (queCheckVisible_ ? 'inline' : 'none'));


}

var noPlay_ = false;
var currImageData = null;
var currImageID;
var currImageNoPlay = false;

var mdTimeout = 0;

function assignVideoEvents() {

    var acns = $('.acn_delete_img_det,.acn_edit_img_det,.acn_link_img_det');
    acns.unbind("click");
    
    var tmbs = $('.box, .tbox');

    tmbs.click(function () {

        setVideoPlayerSource(this.id);

    });

    tmbs.mousedown(function () {
        //return; // temporary bypass to facilitate update on the production server without applying multiple editing....
        //alert('down');
        mdTimeout = setTimeout(showChkSelect, 800);
    });

    tmbs.mouseup(function () {
        if (mdTimeout) clearTimeout(mdTimeout);
    });



    tmbs.mouseover(function () {

        var sta = getVideoStatus(this.id);

        if (isAdmin() || isSuperUser()) {
            if (sta.STATUS == 'Complete') {
                var acns = $(this).find('.acn_edit_img_det,.acn_delete_img_det,.acn_link_img_det');
                acns.show();
            }
        }



        if (!isWithMatrix(this.id)) return;

        if (mouseOverTimeout) clearTimeout(mouseOverTimeout);

        //img: first
        mouseOverImage = $(this).find('.thumb');
        prevSource = mouseOverImage.attr("src");

        mouseOverTimeout = setTimeout(mouseOverEvent, 300);

        prevSource = img.attr("src");



    })
    tmbs.mouseout(function () {

        var acns = $(this).find('.acn_edit_img_det,.acn_delete_img_det,.acn_link_img_det');
        acns.hide();

        if (mouseOverTimeout) clearTimeout(mouseOverTimeout);

        if (!isWithMatrix(this.id)) return;

        var img = $(this).find('.thumb');
        if (!img) return;
        // reset image source and global variables ...
        mouseOverImage = null;
        img.attr("src", prevSource);
        curTmbRow = 0;
        curTmbCol = 0;


    })

    acns.click(function () {
        multipleEdit = false;
        var data;
        currImageData = null;
        currImageID = $(this).parent().attr('id');
        if (this.className == 'acn_edit_img_det') {

            data = videoData[currImageID];
            if (data) {

                currImageData = data;

                if (thmCheckVisible_) {
                    var thmChk = getThumbChk(true);

                    if (thmChk.length > 1) {
                        // check if the selected data is one of the checked thumbnails
                        var chk = $('#' + currImageID).find('input:checked');
                        multipleEdit = (chk.length != 0);   // selected item is one of the checked thumbnails

                        if (multipleEdit) {
                            // prompt the user that editing will be applied to multiple videos
                            alert('Changes made will be applied to ' + thmChk.length + ' video items.');
                        }
                    }
                    // thumbnails checkboxes visible
                } else {
                    multipleEdit = false;
                }
                // transfer data
                var i = THMIDX;

                $('#vidSource').val(data[i.FILENAME]);
                $('#vidTitle').val(data[i.TITLE]);

                $('#vidAssetName').val(data[i.ASSET_NAME]);

                $('#vidDescription').val(unescape(data[i.DESCRIPTION]));
                $('#vidComment').val(unescape(data[i.COMMENTS]));

                $('#vidGroupID').val(data[i.GROUP]);
                $('#vidAssetID').val(data[i.ASSET]);

                $('#vidInspOrInt').val(unescape(data[i.INSPORINT]));
                $('#vidInspType').val(unescape(data[i.INSPTYPE]));
                $('#vidMaintItemNo').val(unescape(data[i.ITEMNO]));

                YMDToDate('vidInspDate', data[i.INSPDATE]);

                $('#video_details').dialog("open");


            }
        } else if (this.className == 'acn_delete_img_det') {
            data = videoData[currImageID];
            if (!confirm('You are about to delete video "' + data[THMIDX.TITLE] + '".\nClick [Ok] to proceed or [Cancel] to abort.')) return;

            $.ajax({
                url: 'VideoData.aspx?acn=vdel&vid=' + currImageID.substr(1),
                beforeSend: function () {
                    showMask(1);
                }

            }).done(function (data) {


                var json = JSON.parse(data);
                if (json.status == 'Success') {
                    // remove thumbnail from display
                    if ($('#vidSearchText').val()) {
                        showThumbnails(true);
                    } else {
                        showThumbnails();
                    }

                } else {
                    alert('Error deleting video. ' + json.message);
                }

                showMask(-1);

            });

            return;

        } else if (this.className == 'acn_link_img_det') {


            var img = $(this).closest('.box');
            if (!img.length) img = $(this).closest('.tbox');
            var lnk = '';

            if (!img.length) return;


            var vtit = img.find('.vtitle');
            if (vtit.length) {
                vtit = vtit.html() + '\n';
            } else {
                vtit = '';
            }

            var larr = location.href.split('\/');

            larr.pop();
            lnk = larr.join('\/') + '/?acn=vvw&vid=' + img.attr('id').substr(1);

            $('#clipboard').val(lnk);
            $('#clipboard')[0].select();

            var successful = document.execCommand('copy');
            setTimeout(function () {
                if (successful) {
                    alert(vtit + 'Video link copied to clipboard.');
                } else {
                    alert('Failed copying video link.');
                }
            }, 200);

            return;

            alert($('#clipboard').val());
            $('#clipboard')[0].select();
            var successful = document.execCommand('copy');
            alert('successful:' + successful);

            alert('copy link...');

            return;
        }

    });

}

var animateThumbnailTimeout = 0;
function animateThumbnail() {


    if (!mouseOverImage) return;

    if (animateThumbnailTimeout) clearTimeout(animateThumbnailTimeout);

    var img = mouseOverImage;

    var xPos = 0, yPos = 0;

    yPos = -curTmbRow * THUMB_HEIGHT;
    xPos = -curTmbCol * THUMB_WIDTH;

    img.css("background-position", xPos + "px " + yPos + "px");

    if (curTmbCol < (THUMB_COLS - 1)) {

        curTmbCol++;

    } else {

        curTmbCol = 0;

        if (curTmbRow < (THUMB_ROWS - 1)) {
            curTmbRow++;
        } else {
            curTmbRow = 0;
        }
    }

    if (img.attr("src") != "images/a_px.png") img.attr("src", "images/a_px.png");

    animateThumbnailTimeout = setTimeout("animateThumbnail()", 300);

}


function isWithTree() {
    return $('#tree').css('display') != 'none';
}

function isWithPlayer() {
    return $('#playing').css('display') != 'none';
}

function isWithComments() {
    return $('#comments').css('display') != 'none';
}

function separatorClick(e) {


    var id = e.id, disp;
    var pane;

    if (e.id == 'sepTree') {
        pane = $('#tree');
    } else if (e.id == 'sepPlayer') {
        pane = $('#playing');
    }

    if (!pane) return;

    disp = pane.css('display');
    pane.css('display', disp == 'none' ? 'flex' : 'none');

    if (!Initializing_) {
        // save panemode
        $.ajax({
            url: 'VideoData.aspx?acn=setpane&objid=' + pane[0].id + '&tm=' + (new Date()) + '&mode=' + (disp == 'none' ? '0' : '1'),
            beforeSend: function () {
                ;
            }
        }).done(function (data) {
            ;
        });
    }

    setPaneDisplay();

    updateLayoutSub();
}

function setThumbnailClass() {
    if (isWithTree() && isWithPlayer()) {
        $('.tbox').attr('class', 'box');
    } else {
        $('.box').attr('class', 'tbox');
    }
}

function setThumbSpinner() {
    return;
    var key;
    for (key in videoData) {
        alert(key);
    }

    return;

    var opts = {
        lines: 13 // The number of lines to draw
        , length: 20 // The length of each line
        , width: 14 // The line thickness
        , radius: 32 // The radius of the inner circle
        , scale: 1 // Scales overall size of the spinner
        , corners: 1 // Corner roundness (0..1)
        , color: '#f00' // #rgb or #rrggbb or array of colors
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
    var spn = new Spinner(opts).spin();



}

function setPaneDisplay() {
    if (isWithTree() && isWithPlayer()) {
        $('#thumbnails').css('min-width', '390px');
        $('#thumbnails').css('max-width', '390px');
    }

    if (!isWithPlayer()) {
        // if video is not visible, the thumbnails will take most of the display area
        $('#thumbnails').css("max-width", "2048px");
    } else {
        $('#thumbnails').css("max-width", "390px");
        $('#playing').css('max-width', '2048px');
    }

//    if (isWithPlayer() && isWithTree()) {
//        // display comment only if the tree and player are visible
//        $('#comments').css('display', 'flex');
//    } else {
//        $('#comments').css('display', 'none');
//    }

    setThumbnailClass();
}

function setupTables() {
    queueDataTable = $('#tblCurrentQueue').DataTable({

        'paging': false,
        'searching': false,
        'ordering': false,
        'autoWidth': true,
        'scrollY': '100px',
        'columnDefs': [
            { "width": "10px", "className": "dt-center", "targets": 0 },
            { "className": "dt-left", "targets": 1 },
            { "width": "100", "className": "dt-center", "targets": 2 },
            { "className": "dt-left", "targets": 3 },
            { "width": "100", "className": "dt-center", "targets": 4 },
            {  "width": "50", "className": "dt-center", "targets": 5 }
        ],
        'oLanguage': { 'sEmptyTable': 'No file in the queue for uploading ...' }

    });


    // {"className": "dt-center", "targets": "_all"}

//    uploadDataTable = $('#tblServerUploads').DataTable({

//        'paging': false,
//        'searching': false,
//        'ordering': false,
//        'autoWidth': true,
//        'scrollY': '100px',
//        'columnDefs': [
//            { "className": "dt-left", "targets": 0 },
//            { "width": "50", "targets": 1 },
//            { "width": "50", "targets": 2 }
//        ],
//        'oLanguage': { 'sEmptyTable': 'No file in the queue for uploading ...' }

//    });

    uploadDataTable = $('#tblServerUploads').DataTable({

        'paging': false,
        'searching': false,
        'ordering': false,
        'autoWidth': true,
        'scrollY': '100px',
        'columnDefs': [
            { "className": "dt-left", "targets": 0 },
            { "width": "50", "targets": 1 },
            { "width": "50", "targets": 2 },
            { "width": "50", "targets": 3 }
        ],
        'oLanguage': { 'sEmptyTable': 'Pending or ongoing file(s) uploading <span style="color:red;">[NOT YET AVAILABLE]</span> ...' }

    });
    
    encodeDataTable = $('#tblServerEncodings').DataTable({

        'paging': false,
        'searching': false,
        'ordering': false,
        'autoWidth': true,
        'scrollY': '100px',
        'columnDefs': [
            { "className": "dt-left", "targets": 0 },
            { "width": "50", "targets": 1 },
            { "width": "50", "targets": 2 },
            { "width": "50", "targets": 3 }
        ],
        'oLanguage': { 'sEmptyTable': 'Pending or ongoing file(s) encoding <span style="color:red;">[NOT YET AVAILABLE]</span> ...' }

    });


    setQueueData();

}

var ACTIVE_IN_QUEUE = {};

function setQueueData(reset) {

    if (typeof (reset)) reset = false;

    var key, obj, k2, name = '', size = '';
    var file;

//    if (reset) {
//        queueData.data = [];
//        for (key in ACTIVE_UPLOADS) {

//            obj = ACTIVE_UPLOADS[key];
//            if (!obj) continue;
//            obj.isOnQueue(false);

//        }
    //    }

    var acn = '';

    for (key in ACTIVE_UPLOADS) {

        acn = '';

        obj = ACTIVE_UPLOADS[key];

        if (!obj) continue;
        if (obj.isOnQueue()) continue;

        obj.isOnQueue(true);

        file = obj.fileObject;

        if (isUplEditable(obj.status())) {
            acn += '<img id="E' + key + '"  class="acn_edit_details" src="images/Edit_16x16.png" title="Edit details" />';
        } else {
            acn += '<img class="acn_noaction" src="images/a_px.png" title="" />';
        }

        acn += '&nbsp;&nbsp;';


        if (isUplRemovable(obj.status())) {
            acn += '<img id="E' + key + '"  class="acn_delete_row" src="images/delete_12x12.png" title="Remove/Cancel" />';
        } else {
            acn += '<img class="acn_noaction" src="images/a_px.png" title="" />';
        }



        //var row = [file.name, file.size, '<span style="color:lime;width:100%;text-align:center;">' +  obj.status() + '</span>'];
        //var row = [file.name, file.size, obj.assetName(), statusHTML(obj.status()), acn];
        //var row = ['<input type="checkbox" class="recselect" style="display:' + ((queCheckVisible_ && isUplEditable(obj.status())) ? 'inline' : 'none') + ';" />', file.name, file.size, obj.attrib('astName'), statusHTML(obj.status()), acn];
//        var row;
//        if (queCheckVisible_ && isUplEditable(obj.status())) {
//            row = ['<input type="checkbox" class="recselect" />', file.name, file.size, obj.attrib('astName'), statusHTML(obj.status()), acn];
//        } else {
//            row = ['&nbsp;', file.name, file.size, obj.attrib('astName'), statusHTML(obj.status()), acn];
//        }
        var row = ['<input type="checkbox" class="recselect" style="display:' + ((queCheckVisible_ && isUplEditable(obj.status())) ? 'inline' : 'none') + ';" />', file.name, file.size, obj.attrib('astName'), statusHTML(obj.status()), acn];

        obj.QObject(row);

        queueData.data.push(row);

    }

    refreshQuequeTable();

}

function isUplEditable(sta) {
    var s = sta.toLowerCase();
    return (s == 'req\'d info.' || s == 'ready' || s == 'partial');
}

function isUplRemovable(sta) {
    var s = sta.toLowerCase();
    return (s == 'req\'d info.' || s == 'ready' || s == 'duplicate' || s == 'partial');
}

function getUploadObject(filename, assetname) {
    var idx,obj,fn,an;
    for (idx = 0; idx < ACTIVE_UPLOADS.length; idx++) {

        obj = ACTIVE_UPLOADS[idx];

        fn = obj.fileObject.name;
        an = obj.attrib('astName');

        //alert('getUploadObject: ' + fn + ' , ' + filename);

        if ((filename == fn || filename.replace(/&amp;/gi, '&') == fn) && assetname == an) {
            // object found
            return { INDEX: idx, OBJECT: obj };

        }

    }
    return null;    // object not found
}

function setTableActionEvents() {

    // remove current click events bound to the buttons
    $('.acn_edit_details,.acn_delete_row').unbind("click");
    $('#chkSelectAllFiles').unbind("change");
    $('#chkThumbSelectAll').unbind("change");

    $('.acn_delete_row').click(function () {
        var key = getVideoKeyFromQ(this);
        removeQueueRow(key.Filename, key.AssetName);

    });

    $('.acn_edit_details').click(function () {
        var key = getVideoKeyFromQ(this);
        //alert('key.Filename, key.AssetName:' + key.Filename + ':' + key.AssetName);
        openVideoDetails(key.Filename, key.AssetName);
    });

    $('#chkSelectAllFiles').change(function () {
        var chk = getQueueChk();
        var chkVal = this.checked;
        chk.prop('checked', chkVal);
    });


    $('#chkThumbSelectAll').change(function () {
        var chk = getThumbChk();
        var chkVal = this.checked;
        chk.prop('checked', chkVal);
    });

    var tds = $('#tblCurrentQueue').find('td');

    tds.mousedown(function () {
        //return; // temporary bypass to facilitate update on the production server without applying multiple editing....
        //alert('down');
        mdTimeout = setTimeout(showQueChkSelect, 800);
    });

    tds.mouseup(function () {
        if (mdTimeout) clearTimeout(mdTimeout);
    });

}

function getCHKUploadObject(chk) {
    var tds = $(chk).closest('tr').find('td');
    var key = getVideoKeyFromQ(chk);
    if (key) {
        return getUploadObject(key.Filename, key.AssetName);
    } else {
        return null;
    }
}



function getQueueChk(chk) {
    if (typeof (chk) == 'undefined') chk = false;
    if (chk) {
        return $('#tblCurrentQueue').find('td').find('input:checked');
    } else {
        return $('#tblCurrentQueue').find('td').find('input[type="checkbox"]');
    }

}

function getVideoKeyFromQ(e) {
    var tds = $(e).closest('tr').find('td');
    return { Filename: tds[QIDX.FILENAME].innerHTML, AssetName: tds[QIDX.LOCATION].innerHTML }
}

function showVideoMultiEditDetails() {
    //$('#vidTitle').prop('readonly', multipleEdit).val('');
    if (multipleEdit) {

        $('#vidTitle').val('<< Not applicable for multiple record editing... >>');
        $('#vidSource').val('<< Not applicable for multiple record editing... >>');

        $('#video_details').dialog({ title: 'Video Details - (Multiple records selected for update)' });
    } else {
        $('#video_details').dialog({ title: 'Video Details' });
    }

    $('#vidTitle').prop('readonly', multipleEdit);

    $('#vidDescription').focus();

}


var vidFileName_, vidAssetName_
var openVideoDetailsBypassRetry_ = false;
var multipleEdit = false;
function openVideoDetails(fileName, assetName, bypassCheck) {

    multipleEdit = false;

    curUpObjEdit = getUploadObject(fileName, assetName);

    vidFileName_ = fileName;
    vidAssetName_ = assetName;

    if (!curUpObjEdit) {
        // this will only happen if there is an exception error
        alert('('+ fileName + ') Video upload object not found.');
        return;
    }

    var chks = getQueueChk(true);
    if (chks.length > 1) {
        //alert('Changes to be made will be applied to multiple items');


        var key;
        //alert(key.Filename + ' , ' + key.AssetName);
        // check if one of the items checked is the actual item that was clicked
        var idx;
        for (idx = 0; idx < chks.length; idx++) {
            key = getVideoKeyFromQ(chks[idx]);
            if (key) {
                if (fileName == key.Filename && assetName == key.AssetName) {
                    //if(openVideoDetailsBypassRetry_)
                        alert('Changes made will be applied to ' + chks.length + ' items in the queue.');
                    multipleEdit = true;
                    break;
                }
            }
        }

        openVideoDetailsBypassRetry_ = true;
        setTimeout(function () { openVideoDetailsBypassRetry_ = false; }, 500);
    }



    if (typeof (bypassCheck) == 'undefined') bypassCheck = false;

    var obj = curUpObjEdit.OBJECT;


    if (!bypassCheck && !multipleEdit) {
        // check video status on the server
        //var uurl = 'VideoData.aspx?acn=chkvid&fn=' + encFileName(obj.fileName()) + '&ast=' + obj.asset() + '&grp=' + obj.group();
        var uurl = 'VideoData.aspx?acn=chkvid&fn=' + encFileName(obj.fileName()) + '&ast=' + obj.attrib('ast') + '&grp=' + obj.attrib('grp');

        $.ajax({
            url: uurl,
            beforeSend: function () {
                showMask(1);
            }
        }).done(function (data) {

            showMask(-1);

            if (data.length) {
                var stat = JSON.parse(data);
                if (stat.existing == 'YES') {
                    // file already exist in the destination
                    alert('File already exist in the destination location.');
                    obj.status('Duplicate');
                    resetQueueTable();
                    return;

                } else if (stat.partial == 'YES') {

                    // partially uploaded. restrict editing of location

                    // update object client-side attributes 

                    if (obj.status() != 'Ready') {
                        alert('File is partially uploaded.\nChanging location is not possible but other information can be modified.');

                        obj.isPartial(true);

                        obj.attrib('vt', unescape(stat.title));
                        obj.attrib('ds', unescape(stat.description));
                        obj.attrib('cm', unescape(stat.comments));

                        obj.attrib('ioi', (stat.ioi));
                        obj.attrib('itp', unescape(stat.itp));
                        obj.attrib('mnm', unescape(stat.mnm));

                        obj.attrib('idt', (stat.idt));

                        obj.status('Partial');

                        resetQueueTable();

                    }

                    $('#btnAssetSelector').attr('disabled', true);  // prevent changing of location when file is partially uploaded
                    setTimeout("openVideoDetails(vidFileName_,vidAssetName_,true)", 50);
                    return;

                } else {
                    $('#btnAssetSelector').attr('disabled', false);
                    openVideoDetails(vidFileName_, vidAssetName_, true)
                }
            } else {
                $('#btnAssetSelector').attr('disabled', false);
                openVideoDetails(vidFileName_, vidAssetName_, true)
            }

        })

        
        //
        return;
    }

    try {

//        if (!obj.attrib('vt') && obj.status() == 'Req\'d Info.') {
//            //
//            $('#vidTitle').val(obj.defaultTitle());
//            $('#vidTitle').select();
//        } else {
//            $('#vidTitle').val(obj.attrib('vt'));
        //        }

        $('#vidTitle').val(obj.attrib('vt'));

        $('#vidSource').val(obj.fileName());

        $('#vidAssetName').val(obj.attrib('astName'));
        $('#vidDescription').val(obj.attrib('ds'));
        $('#vidComment').val(obj.attrib('cm'));

        $('#vidAssetID').val(obj.attrib('ast'));
        $('#vidGroupID').val(obj.attrib('grp'));

        $('#vidInspOrInt').val(obj.attrib('ioi'));
        $('#vidInspType').val(obj.attrib('itp'));
        $('#vidMaintItemNo').val(obj.attrib('mnm'));

        YMDToDate('vidInspDate', obj.attrib('idt'));    // from yyyy-mm-dd to default local date format

        $('#video_details').dialog("open");

    } catch (e) {
        alert('Error in openVideoDetails:' + e.message);
    }


}

function removeQueueRow(fileName, assetName) {

    var obj = getUploadObject(fileName, assetName);
    if (!obj) {

        // this will only happen if there is logical/programmatic error
        alert('Upload object not found.');
        return;
    }

    if (!confirm('File "' + fileName + '" will be removed from the list.\n\n' +
            'Click [Ok] to continue or [Cancel] to abort.')) return;

    // delete item from the ACTIVE_UPLOADS

    ACTIVE_UPLOADS.splice(obj.INDEX, 1);

    resetQueueTable();

}

function statusHTML(status, colorCode) {
    if (typeof (colorCode) == 'undefined') {
        switch (status.toLowerCase()) {
            case 'retrying':
            case 'req\'d info.':
                colorCode = 'o';
                break;
            case 'ready':
                colorCode = 'w';
                break;
            case 'uploading':
                colorCode = 'y';
                break;
            case 'duplicate':
            case 'error':
                colorCode = 'r';
                break;
            case 'complete':
                colorCode = 'l';
                break;
            default:
                colorCode = 'y';
        }
    }
    return '<span class="ustat ' + colorCode + '">' + status + '</span>'
}

function refreshQuequeTable(clear) {
    if (typeof (clear) == 'undefined') clear = false;

    if (clear) queueData.data = [];

    queueDataTable.clear();
    queueDataTable.rows.add(queueData.data);
    queueDataTable.draw();

    setTableActionEvents();
}


var secondEventID = 0;
function secondEvent() {
    if (secondEventID) clearTimeout(secondEventID);
    setTimeout("secondEvent()", 1000);
}


var monTimout = 0;
function procMonitor() {
    if (monTimout) clearTimeout(monTimout);
    monTimout = setTimeout("procMonitor()", 1500);
}

function getVideoPath(grpId, assId, vidId) {

    grpId = GROUP_FOLDER_FORMAT + grpId;
    assId = ASSET_FOLDER_FORMAT + assId;

    vidId = VIDEO_FOLDER_FORMAT + vidId;

    grpId = grpId.substr(grpId.length - GROUP_FOLDER_FORMAT.length, GROUP_FOLDER_FORMAT.length);
    assId = assId.substr(assId.length - ASSET_FOLDER_FORMAT.length, ASSET_FOLDER_FORMAT.length);
    vidId = vidId.substr(vidId.length - VIDEO_FOLDER_FORMAT.length, VIDEO_FOLDER_FORMAT.length);

    return 'Videos/G' + grpId + '/V' + assId + vidId;

}

function getGroupID(asset) {
    // get resolve id based on the currenty selected asset node on the tree

    if (typeof (asset) == 'undefined') {
        // get group based on the asset selected on the tree
        //return 45488;
        // get group id of the currently selected node
        return getGroup();

    } else {
        // get group based on the asset id passed

        var li = $('#N' + asset);
        return getGroup(li);

    }
}

function getAssetID() {
    // get asset id based on the currenty selected node on the tree
    return $('span.clicked').parent().prop('id').substr(1);
}

function getAssetName() {
    return $('span.clicked').html();
}

var ACTIVE_UPLOADS = [];


var queFiles_ = null;
function sendToQueue(e) {
    queFiles_ = e;
    // disable buttons
    //$('#fileSelected').attr("disabled", "disabled");
    //$('#uploadNow').attr("disabled", "disabled");
    showMask(1);
    setTimeout("uploadFileSelected()", 500);
}


function isValidFile(file) {
    // get extenf
    var extension = file.name.replace(/^.*\./, '').toLowerCase();

    var validFile = '.mp4.asf.mks.mkv.mts.mpg.avi.mov.flv.ts.wmv.';
    return (validFile.indexOf('.'+extension+'.')!=-1)
    //return true;
}

function defaultVideoTitle(file) {

    var fn = file.name;
    var ext = fn.replace(/^.*\./, '').toLowerCase();

    return fn.substr(0, fn.length - (ext.length + 1));
}


function uploadFileSelected() {

    // check if the file was already selected

    var e = queFiles_;

    try {

        var duplicates = '';
        var isAlreadySelected = false;
        var file, idx, ctr = 0;

        var withInvalid = false;


        for (idx = 0; idx < e.files.length; idx++) {
            file = e.files[idx];
            if (!isValidFile(file)) {
                withInvalid = true;
                continue;
            }
            if (isInFilesSelected(file)) {
                ctr++;
                duplicates += (duplicates ? '\n' : '') + ' - ' + file.name;
            } else {



                //ACTIVE_UPLOADS[ACTIVE_UPLOADS.length] = new UploadFileChunks(file, getGroupID(), getAssetID() + ':' + getAssetName());

//                ACTIVE_UPLOADS[ACTIVE_UPLOADS.length] = new UploadFileChunks(file, getGroupID(),
                //                    getAssetID() + ':' + getAssetName(), 'VideoUpload3.aspx', null, null);

//                params = 'grp=' + group_ + '&ast=' + asset_ + 
//                         '&vt=' + title_ + '&ds=' + encodeURIComponent(description_) + '&cm=' + encodeURIComponent(comments_) +
//                         '&grpfid=' + group_ + '&astfid=' + asset_ + '&uid=' + uid_ + '&tm=' + (new Date());

//            var attrib = {
//                __grp: getGroupID(), __ast: getAssetID(), $vt: '', $ds: '', $cm: '',
//                grpfid: getGroupID(), astfid: getAssetID(), uid: LOGIN_INFO.uid,
//                _astName: getAssetName(), ioi: '', $itp: '', $mnm: '', idt: ''
                //            };

                

                var attrib = {
                            ast: { value: getAssetID(), persist: true, encode: false }
                                , grp: { value: getGroupID(), persist: true, encode: false }
                                , vt: { value: defaultVideoTitle(file), persist: false, encode: true }
                                , ds: { value: '', persist: false, encode: true }
                                , cm: { value: '', persist: false, encode: true }
                                , grpfid: { value: getGroupID(), persist: false, encode: false }
                                , astfid: { value: getAssetID(), persist: false, encode: false }
                                , uid: { value: LOGIN_INFO.uid, persist: true, encode: false }
                                , astName: { value: getAssetName(), persist: false, encode: false, exclude: true }
                                , ioi: { value: '', persist: false, encode: false }
                                , itp: { value: '', persist: false, encode: true }
                                , mnm: { value: '', persist: false, encode: true }
                                , idt: { value: '', persist: false, encode: false }
                        };

                        /***************************************************************************
                        NOTE: grpfid and astfid will be replaced with values from the manifest 
                        within the UploadFileChunks method the reason the persist function 
                        was set to false even if these parameters will still be used during
                        the actual chunk upload. 
                        ***************************************************************************/

                ACTIVE_UPLOADS[ACTIVE_UPLOADS.length] = new UploadFileChunks(file, attrib, 'VideoUpload3.aspx', null, null);

                
            }
        }

        $("#fileSelected").val("");

        if (duplicates) alert('File(s) already in the selection:\n' + duplicates);
        if (withInvalid) alert('You have selected invalid file(s). Only video files with extension name(s) *.mp4,*.asf,*.mks,*.mts,*.mkv,*.mpg,*.avi,*.mov,*.flv,*.ts,*.wmv. are allowed for uploading');

        setQueueData();

    } catch (ee) {
        alert('Error in uploadFileSelected: ' + ee.message);
    } finally {
        showMask(-1);
    }

}

function isInFilesSelected(file) {

    var isAlreadySelected = false;

    for (var k in ACTIVE_UPLOADS) {

        var obj = ACTIVE_UPLOADS[k];

        if (obj) {

            isAlreadySelected = (file.name == obj.fileObject.name);

            if (isAlreadySelected) break;

        }

    }

    return isAlreadySelected;
}

function queStatusCount(sta){
    var status = '';
    var upl;
    var cnt = 0;

    for (var idx in ACTIVE_UPLOADS) {
        upl = ACTIVE_UPLOADS[idx];
        status = upl.status().toLowerCase();
        if (status == sta.toLowerCase()) cnt++;
    }
    return cnt;
}

function uploadStatusCount(sta) {
    //status_ = 'Complete';

    //var sta = 'ready'
    if (typeof (sta) == 'undefined') sta = 'ready';

    var status = '';
    var upl;
    var cnt = 0;

    for (var idx in ACTIVE_UPLOADS) {
        upl = ACTIVE_UPLOADS[idx];
        status = upl.status().toLowerCase();
        
        if (typeof (sta) == 'undefined') {
            if (isStatusForUploading(status)) cnt++;
        } else {
            if (status == sta) cnt++;
        }
    }
    return cnt;
}

var goUploadFiles_ = 0;
var paused = false;
var curUpObj = null;
var curUpObjEdit = null;

function pauseUpload() {
    if (curUpObj) curUpObj.stop();
    //alert('curUpObj.status():' + curUpObj.status());
    paused = true;
    setTimeout("disableUploadButtons(false);toggleButton('uploadNow', false);curUpObj.reset()", 1000);

}

function isStatusForUploading(sta) {
    var s = sta.toLowerCase();
    //return (s == 'ready' || s == 'retrying');
    return (s == 'ready');
}

var testNetwork_ = 0;
function testNetwork() {

    if (!noNetwork_) return;

    try {

        var xhr = new XMLHttpRequest();

        $('#staCurrentAction').html('( Network outage. Reconnecting attempt ' + reConnectAttempt_ + '... )&nbsp;');

        xhr.open('POST', 'VideoData.aspx?acn=tnet', true)
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        var params = 'dt=' + (new Date());

        xhr.onload = function (e) {

            if (e.target.readyState == 4) {

                $('#staCurrentAction').html('&nbsp;');
                reConnectAttempt_ = 1;
                noNetwork_ = false;
                if (retryUploadMonitor_) clearTimeout(retryUploadMonitor_);
                retryUploadMonitor_ = setTimeout("retryUploadMonitor()", 1000); // network is back proceed with upload

            }
        }

        xhr.send(params);
        if (testNetwork_) clearTimeout(testNetwork_);
        testNetwork_ = setTimeout(function () {
            reConnectAttempt_++;
            testNetwork();
        }, 5000);

        
    } catch (eee) {

    }

}

var reConnectAttempt_ = 1;
var noNetwork_ = false;
var retryUploadMonitor_=0;
function retryUploadMonitor() {

    if (!uploadLooping_) {

        if (ACTIVE_UPLOADS.length) {

            var rtr = queStatusCount('Retrying');

            if (rtr) {

                if (noNetwork_) {
                    // if retry is due to network outage...
                    // hold retry until the network is back
                    // check every 10 seconds

                    if (testNetwork_) clearTimeout(testNetwork_);
                    disableUploadButtons();
                    testNetwork_ = setTimeout("testNetwork()", 1000);

                } else {

                    // retry found

                    showMask(1);

                    for (var idx in ACTIVE_UPLOADS) {
                        upl = ACTIVE_UPLOADS[idx];
                        if (upl.status().toLowerCase() == 'retrying') {
                            upl.chgStatus('Ready',true);    // change status to ready and reset network outage flag
                        }
                    }

                    if (goUploadFiles_) clearTimeout(goUploadFiles_);
                    disableUploadButtons();
                    goUploadFiles_ = setTimeout("goUploadFiles()", 1000);

                }   // network available

            }

        }

    }

    //if(retryUploadMonitor_)clearTimeout(retryUploadMonitor_);

    retryUploadMonitor_ = setTimeout("retryUploadMonitor()", 1000);
}

var uploadLooping_=false;
function goUploadFiles() {

    // this will continuously be called to check if there are any pending jobs

    if (paused) return;

    uploadLooping_=true;

    var idx, upl = null;
    var withActive = false;
    var incObj = null;
    var sta;

    // clear any timeout previously called
    if (goUploadFiles_) clearTimeout(goUploadFiles_);

    // check if none of the recorded uploads is currently uploading
    for (idx in ACTIVE_UPLOADS) {

        upl = ACTIVE_UPLOADS[idx];
        sta = upl.status().toLowerCase();

        if (!withActive) withActive = (sta=='uploading');
        if (!incObj) if (isStatusForUploading(sta)) incObj = upl;
    }

    // execute upload (obj.startUploading()) the first item that is not completed and not uploading

    if (!withActive && incObj) {

        curUpObj = incObj;

        if (!$('#video_details').dialog('isOpen')) {
            incObj.startUploading();
            showMask(-1);   // hide mask when uploading starts
        }

    } else {


    }

    if (isWithPendingUpload()) {

        // if there are pending or ongoing uploads, continue calling this routine
        // call goUploadFiles after 1 second
        disableUploadButtons();
        goUploadFiles_ = setTimeout("goUploadFiles()", 1000);

    } else {

        // enable upload selected file buttons when there is no pending jobs
        setTimeout(function(){
            // check if retry status is existing

            uploadLooping_ = false;

            if(!queStatusCount('Retrying')) resetQueueTable();disableUploadButtons(false);

        }, 500);
        
    }
    
}

function isWithPendingUpload() {
    // this function checks for items in the queue that are currently uploading or ready

    var idx, row, withPending = false; ;
    var sta;
    for (idx in queueData.data) {
        row = queueData.data[idx];
        sta = row[QIDX.STATUS].toLowerCase();
        withPending = (sta.indexOf('uploading') != -1 || sta.indexOf('ready') != -1);
        if (withPending) break;
    }
    return withPending;
}


function withMask() {
    return ($('#mask').css('display') != 'none')
}

function showMask(mode) {
    // mode: 1-show, -1-hide, else no action on visibility
    var mask = $('#mask');
    var img = $('#loading_img');
    var win = $(window);

    if (mode == -1) {
        mask.css('display', 'none');
        spinner.stop();
        //img.css('display', 'none');
    } else if (mode == 1) {
        mask.css('display', 'inline');
        spinner.spin(document.body);

        //img.css('display', 'inline');
    }

    if (withMask()) {

        mask.css('top', win.scrollTop());
        //img.css('top', win.scrollTop() + (win.height() - img.height()) / 2);
        //img.css('left', (win.width() - img.width()) / 2);

    }
}

var updateLayoutTimeout = 0;
function updateLayout() {
    if (updateLayoutTimeout) clearTimeout(updateLayoutTimeout);
    showMask();

    resizeTimeout = setTimeout("updateLayoutSub()", 300);

}

function updateLayoutSub() {

    resizeStatusTable('currentuseruploads');
    queueDataTable.draw();

    resizeStatusTable('serveruploads');
    uploadDataTable.draw();

    resizeStatusTable('serverencoding');
    encodeDataTable.draw();

    resizeVideoPlayer();
}

function resizeVideoPlayer() {
    // this section is specifically made for IE browser

    var sph = $('.sph').height();
    var wh = $(window).height();
    var ww = $(window).width();
    //ph = $('#playing').height();

    var ps = $('#sepPlayer');
    var psw = ps.outerWidth();
    var psp = ps.position();

    var hs = $('#headerSeparator');
    var hsp = hs.position();

    var ch = $('#comments').outerHeight() + $('#comments_heading').outerHeight() + $('#videodescription').outerHeight() + $('#videotitle').outerHeight() + $('#footer').outerHeight() + sph * 2;

    var playdiv = $('#player');
    var play = $('#videoplayer');
    //comments_heading + videodescription + videotitle + sph;
    //alert(wh + ' , ' + pp.top + ', ' + $('#sepPlayer').height());
    //alert($('.sph').height() + ', ' + pp.top);
    //alert($('#comments').height());

    var wd = ww - psp.left - psw;

    play.height(wh - hsp.top - ch);
    play.width(wd);

    playdiv.height(wh - hsp.top - ch);
    playdiv.width(wd);

    $('#comments').width(wd-10);
    $('#comments_heading').width(wd);

    //alert(ch);

    try {
        if (LOGIN_INFO) {
            
            if (isALV()) {
                $('#footer').html(ww + ' : ' + psp.left + ' , ' + play.position().left + ' : ' + psw + ', ' + LOGIN_INFO.uid + ' , ' + (ww - psp.left - psw) +' $("#videodescription").height():'+$('#videodescription').outerHeight());
            }
        }
    } catch (ee) {
    }

}

function isALV(){
    return (LOGIN_INFO.uid.toLowerCase() == 'alv')
}

function resizeStatusTable(tableContainerId) {
    var win = $(window);
    var par = $('#' + tableContainerId);
    var scr = par.find('.dataTables_scrollBody:eq(0)');
    var us = $('#uploaddetails_sub');
    var ft = $('#footer');
    var tblOff = 110;

    scr.height(win.height() - ft.height() - us.position().top - tblOff);
}

var prompt = true;

function onStatusChange(e) {

    // this is the event called by UploadFileChunks object when the object status is changed

    if (!noNetwork_ && e.networkOutage()) noNetwork_ = true;

    var sta = e.status();

    if (sta.toLowerCase() != 'uploading') {

        $('#prgFilename').html('No file being uploaded...');
        $('#prgPercent').html('0.0 %');
        $('#prgPercentSize').html('&nbsp;');
        $('#progressBar').css('width', '0%');

    }

    var qobj = e.QObject();
    qobj[QIDX.STATUS] = statusHTML(sta);

    resetQueueTable();
    //refreshQuequeTable();


}

function onFileUploadProgress(e) {

    // this is the event called by UploadFileChunks object each time a chunk of file is uploaded

    var upl = e.sizeUploaded();
    var siz = e.fileSize();
    var perc = upl / siz;
    var percSize = Math.round(upl / 1000.0) + ' of ' + Math.round(siz / 1000.0);

    $('#prgFilename').html(e.fileObject.name);
    $('#prgPercent').html(Math.round(1000.0 * (upl / siz))/10.0 + '&nbsp;%');
    $('#prgPercentSize').html(percSize);
    $('#progressBar').css('width', (perc * 100) + '%');

}


//var VIDX={ID:0,TITLE:1,DURATION:2,VIEWS:3,COMMENTS:4};
//"1","v01","00:01:44","12","Very informative"

function isEmptyVideoData() {
    var isEmpty = true;
    for (var kkk in videoData) {
        isEmpty = false;
        break;
    }
    return isEmpty;
}

var videoStatusCheckTimeout = 0;
var videoStatusCheckActive = false;
function videoStatusCheck() {
    if (videoStatusCheckTimeout) clearTimeout(videoStatusCheckTimeout);

    if (!videoStatusCheckActive) {
        videoStatusCheckActive = true;

    }

    setTimeout("videoStatusCheck()", 500);
}

function cleanTitle(title) {

    title = title.replace(/_/gi, ' ');

    if (title.length > 5) {
        if (title.substr(title.length - 4, 1) == '.') {
            title = title.substr(0, title.length - 4);
        }
    }

    return title;
}

function generateThumbnails() {

    setVideoPlayerSource('xxx');    // clear video source;

    var vDisp = videoToDisplay();

    var noThumb = '<div id="nothumbnails">Sorry. No video file(s) available ...</div>';

    

    $('#gallery').html(noThumb);

    if (isEmptyVideoData()) {
        $('#nothumbnails').html('Sorry. No video file(s) available ...');
        $('#nothumbnails').show();
        return;
    }

    var key, dat, title, i = THMIDX;
    var path;
    var src;
    var dur;
    var asset;
    var comments;
    var desc;
    var views;
    var status = '';
    var ts = '';
    var tpl = '<div id="{ID}" class="box">' +
                '<input id="TCK_{ID}" type="checkbox" style="z-index:100;display:{DS};" />' +
                '<div>' +
                    '<img class="thumb" src="{SRC}" />' +
                    '<duration>{DURATION}</duration>' +
                '</div>' +
                '<div class="vtitle" title="{DESC}">{TITLE}</div>' +
                '<div class="vasset">{ASSET}</div>' +
                '<debug>{DEBUG}</debug>' +
                '<views>{VIEWS}</views>' +
                '<img class="acn_edit_img_det" src="images/Edit_16x16.png" title="Edit video details" />' +
                '<img class="acn_delete_img_det" src="images/delete_12x12.png" title="Delete video" />' +
                '<img class="acn_link_img_det" src="images/Link.png" title="Copy Video Link" />' +
                '{STATUS}' +
              '</div>';

    //videoData = { "V3": ["102107", "102107", "", "Home Made Router Table & Table Saw.mp4", "Complete", "00:06:26.33", "23513255", "100", "*SYSTEM*", "1", "1", "1", "1", "0", ""], "V4": ["102107", "102107", "", "Homemade jointer build.mp4", "Complete", "00:06:53.08", "28802169", "100", "*SYSTEM*", "1", "1", "1", "1", "0", ""], "V5": ["102107", "102107", "", "Cosby Pastel Pink.mts", "Uploading", "--:--:--", "194488320", "66.85", "*SYSTEM*", "1", "1", "0", "14", "0", ""], "V6": ["102107", "102107", "", "24GEP_KP88.5.asf", "Complete", "00:00:34.76", "17421587", "100", "*SYSTEM*", "1", "1", "1", "1", "0", ""] };

    


    for (key in vDisp) {
        status = '';
        dat = vDisp[key];

        title = cleanTitle(dat[i.TITLE]);
        dur = dat[i.DURATION];
        asset = dat[i.ASSET_NAME];
        views = 'Views:&nbsp;' + dat[i.Z];

        desc = dat[i.DESCRIPTION];
        comments = dat[i.COMMENTS];

        path = getVideoPath(dat[i.GROUPFID], dat[i.ASSETFID], parseInt(key.substr(1)));
        if (isWithThumbnail(key)) {
            src = path + '/tpost.png';
        } else {
            src = 'images/a_px.png';
        }

        if (!isVideoComplete(key)) {
            var sta = getVideoStatus(key);
            if (sta.STATUS == 'Uploading' || sta.STATUS == 'Encoding') {
                dur = sta.PERCENT +  '&nbsp;%';
            }
            status = '<water class="rotate">' + sta.STATUS + '</water>';
        }

        ts += tpl.replace(/{ID}/gi, key).replace(/{SRC}/gi, src).replace(/{DURATION}/gi, dur).replace(/{TITLE}/gi, title).replace(/{ASSET}/gi, asset).replace(/{VIEWS}/gi, views).replace(/{STATUS}/gi, status).replace(/{DESC}/gi, desc).replace(/{DS}/gi,(thmCheckVisible_ ? 'inline' : 'none')).replace(/{DEBUG}/gi,(LOGIN_INFO.uid.toLowerCase()=='alv'?dat[i.VID]:'&nbsp;'));
    }

    $('#gallery').html(ts);

    assignVideoEvents();

    if (currImageID) {
        //setVideoPlayerSource(currImageID, false);
        setVideoPlayerSource(currImageID, currImageNoPlay);
        currImageNoPlay = false;
        currImageID = '';
    } else {
        setVideoPlayerSource(-1, true);
    }
    setThumbnailClass();

    setThumbSpinner();

}

function videoDataCount() {

    if (!videoData) return 0;

    var retVal = 0;
    for (var k in videoData) {
        retVal++;
    }
    return retVal;
}

function videoPageCount() {
    var ipp = parseInt($('#ItemsPerPage').val());
    var vcnt = videoDataCount()

    var pgCnt = parseInt(vcnt / ipp) + (vcnt % ipp ? 1 : 0);

    return pgCnt;
}

var cpage_ = 1;
var cmaxPage = -1;
function videoToDisplay() {

    var maxPages = 3;
    //if (cmaxPage == -1) cmaxPage = maxPages;

    var pgs = $('#paging');
    
    

    var ipp = parseInt($('#ItemsPerPage').val());
    var retVal = videoData;

    var pgCnt = videoPageCount();
    if (!pgCnt) {
        pgs.hide();
    } else {
        pgs.show();
    }

    var pgs = $('#videoPages');

    var ts = '';
    var i;


    //var sp = cmaxPage - maxPages;             // start page-1

    var sp = 0;

    var ctr = 0;
    for (i = 0; i < pgCnt; i++) {


        if (i < sp) continue;

//        ctr++;
//        if (ctr > maxPages) {
//            ts += '...<a href="#" ' + (cpage_ == (i + 1) ? ' class="cpage" ' : '') + '>' + pgCnt + '</a>';
//            break;
//        } else {
//            ts += '<a href="#" ' + (cpage_ == (i + 1) ? ' class="cpage" ' : '') + '>' + (i + 1) + '</a>';
//        }

        ts += '<a href="#" ' + (cpage_ == (i + 1) ? ' class="cpage" ' : '') + '>' + (i + 1) + '</a>';


        
    }

    pgs.html(ts);

    assignPagingEvents();

    i = 0;
    var sv = (cpage_ - 1) * ipp + 1;      // start video
    var tmpObj = {};
    var vid1 = null;
    for (k in videoData) {
        i++;
        if (i < sv) continue;   // if current index is not in the range

        if (i > (sv + ipp - 1)) break;

        tmpObj[k] = videoData[k];

        if (!vid1) {
            currImageID = k;
            currImageNoPlay = true;
            vid1 = tmpObj[k];
        }
        
    }

    retVal = tmpObj;

    return retVal;
}

function assignPagingEvents() {
    var a = $('#videoPages').find('a');
    a.click(function () {
        if (this.className == 'cpage') return;
        cpage_ = parseInt($(this).html());
        //videoToDisplay();
        generateThumbnails();
    });

    $('#btnPagePrev').unbind('click');
    $('#btnPageNext').unbind('click');
    $('#ItemsPerPage').unbind('change');

    $('#ItemsPerPage').change(function () {
        cpage_ = 1;
        generateThumbnails();

        if (!Initializing_) {
            // save panemode
            $.ajax({url: 'VideoData.aspx?acn=setipp&ipp=' + $(this).val() + '&tm=' + (new Date())});
        }

    });

    $('#btnPagePrev').click(function () {
        var pgCnt = videoPageCount();
        if (cpage_ > 1) {
            cpage_--;
            //videoToDisplay();
            generateThumbnails();
        }
    });

    $('#btnPageNext').click(function () {
        var pgCnt = videoPageCount();
        if (cpage_ < pgCnt) {
            cpage_++;
            //videoToDisplay();
            generateThumbnails();
        }
    });


    //alert(a.length);
}

function isVisibleGallery() {
    // test if ditails pane is visible
    var retVal = ($('#details').css('display') != 'none');
    if (retVal) {
        // edit popup window is visible.
        retVal = !$('#asset_selector').dialog('isOpen');
    }
    return retVal;
}

var updateThumbs = true;
function showThumbnails(filtered) {

    if (typeof (id) == 'undefined') id = -1;
    if (!updateThumbs) return;

    if(typeof(filtered)=='undefined')filtered = false;

    var vurl;
    $('#nothumbnails').html('Searching videos. Please wait...');
    $('#nothumbnails').show();

    var aflt = $('#fltAdvParams').val();
    if (aflt) {

        vurl = 'VideoData.aspx?acn=avida&ast=' + getAssetID() + '&flt=' + $('#vidSearchText').val() + aflt + '&tm=' + Date();

    } else {

        if (filtered) {
            $('#vidSearchText').select();
            vurl = 'VideoData.aspx?acn=avidf&ast=' + getAssetID() + '&flt=' + $('#vidSearchText').val() + '&tm=' + Date();

        } else {

            vurl = 'VideoData.aspx?acn=avid&ast=' + getAssetID() + '&tm=' + Date();

        }

    }


    try {
        $.ajax({
            url: vurl,
            beforeSend: function () {
                showMask(1);
            }   // can place fetch status like masking the page
        }).done(function (data) {

            //videoData = JSON.parse(data);
            videoData = JSON.parse(unescape(data));

            var vKey, vDat;
            for (vKey in videoData) {
                vDat = videoData[vKey];
                vDat[THMIDX.VID] = vKey.substr(1);
            }

            generateThumbnails();

            showMask(-1);

        })
    } catch (ee) {
        alert('Error getting thumbnails: ' + ee.message);
    }

    return;

    alert('showThumbnails...');

    var path = '';

    var assId = getAssetID();
    var grpId = getGroupID(assId);

    var data = videoData['A' + assId];

    //    var thmTemplate = '<div class="{STYLE}">' +
    //                        '<div>' +
    //                            '<img src="{SOURCE}" alt="{TITLE}" />' +
    //                            '<duration>{DURATION}</duration>' +
    //                        '</div>' +
    //                        '<vtitle>{TITLE}</vtitle>' +
    //                        '<views>{VIEWS}</views>' +
    //                    '</div>';

    var idx, row, html = '';
    for (idx = 0; idx < data.length; idx++) {
        row = data[idx];
        path = getVideoPath(grpId, assId, row[VIDX.ID]);
        html += thmTemplate.replace(/{STYLE}/gi, 'box').replace(/{TITLE}/gi, row[VIDX.TITLE]).replace(/{DURATION}/gi, row[VIDX.DURATION]).replace(/{VIEWS}/gi, row[VIDX.VIEWS]).replace(/{SOURCE}/gi, path + '\/tpost.png');
    }

    $('#thumbnails').html(html);
    assignVideoEvents();
}




function thumbMouseEvent(e) {
    return;
    alert('thumbMouseEvent...');
    //alert(e);
    return;
    alert(e.type);
    if (e.type == 'mouseover') {
    } else if (e.type == 'mouseout') {
    }
}


function generateTree() {

    // clear treeView

    //alert('treeData:'+treeData);

    generateTreeSub();

    assignTreeEvent();

    //alert($(tree).parent().attr('id'));
    //$(tree).parent().hide();

    $("#user_management").dialog({
        autoOpen: false,
        resizable: false,
        width: 800,
        height: 510,
        modal: true,

        open: function () {
            //$('.ui-dialog-buttonpane').find('button').attr('class', 'button');

            showMask(1);
            $('#userManagement').attr('src', 'Tools/UserManagement/UserManagement.html?ver='+Date());
            
            showMask(-1);
        }
        
//        ,buttons: {
//            Close: function () {
//                $('#user_management').dialog("close");
//            }
//        }

    });

    $("#asset_selector").dialog({
        autoOpen: false,
        resizable: true,
        height: 600,
        width: 400,
        modal: true,

        open: function () {
            var tree = $('#treeView');
            var pop = $('#details_tree');
            pop.append(tree);
        },

        buttons: {


            Select: function () {

                // validate selection if the file is yet existing in the selected location

                if (!multipleEdit) {

                    var uurl = 'VideoData.aspx?acn=chkvid&fn=' + encFileName($('#vidSource').val()) + '&ast=' + getAssetID() + '&grp=' + getGroupID();

                    $.ajax({
                        url: uurl,
                        beforeSend: function () {
                            showMask(1);
                        }
                    }).done(function (data) {

                        showMask(-1);

                        if (data.length) {
                            var stat = JSON.parse(data);
                            if (stat.existing == 'YES' || stat.partial == 'YES') {
                                // file already exist in the destination
                                alert('File already exist in the selected location.');
                                return;
                            }
                        }

                        // 

                        $('#asset_selector').dialog("close");
                        returnTreeToMainPanel();    // return tree to the main panel
                        $('#vidAssetName').val(getAssetName());
                        $('#vidAssetID').val(getAssetID());
                        $('#vidGroupID').val(getGroupID());

                    })

                } else {
                    $('#asset_selector').dialog("close");
                    returnTreeToMainPanel();    // return tree to the main panel
                    $('#vidAssetName').val(getAssetName());
                    $('#vidAssetID').val(getAssetID());
                    $('#vidGroupID').val(getGroupID());
                }



                //alert(getAssetID() + ', ' + getAssetName());
            },

            Cancel: function () {
                $(this).dialog("close");
                returnTreeToMainPanel();
            }

        }


    });

    $(document).on('click', '.ui-dialog-titlebar-close', function () {
        var html = $(this).closest('div').find('span').html();
        if (typeof (html) == 'undefined') html = '';

        switch (html) {
            case 'Asset Selector':
                returnTreeToMainPanel();
                break;

            default:
        }


    });

    $("#video_filter").dialog({
        autoOpen: false
        , resizable: false
        , height: 255
        , width: 520
        , modal: true
        , open: function () {
            $('.ui-dialog-buttonpane').find('button').attr('class', 'button');
        }
        , close: function () { }
        , buttons: [
            {
                text: 'Apply Filter'
                , click: function () {
                    applyVideoFilter();
                    
                }
            }
            , {
                text: 'Clear Filter'
                , click: function () {
                    clearVideoFilter();
                }
            }
        ]
    });



    $("#video_details").dialog({
        autoOpen: false,
        resizable: false,
        height: 500,
        width: 720,
        modal: true,

        open: function () {
            //            var tree = $('#treeView');
            //            var pop = $('#details_tree');
            //            pop.append(tree);


            //showVideoDetails();
            showVideoMultiEditDetails();

            noPlay_ = true;
            $('.ui-dialog-buttonpane').find('button').attr('class', 'button');
        },

        close: function () {
            noPlay_ = false;
        },

        buttons: {
            Save: function () {

                if (isVisibleGallery()) {

                    saveVideoThumbnailDetails();

                } else {
                    saveVideoDetails();
                }

            },
            Cancel: function () {
                $(this).dialog("close");
            }
        }


    });

    updateLocation();


}

function saveVideoThumbnailDetails() {
    // transfer data
    var i = THMIDX;

    //alert('$("#vidAssetID").val():' + $('#vidAssetID').val());

    var imgArr = [];

    if (!multipleEdit) {

        imgArr[0] = currImageData;

    } else {
        // get all checked thumbnails
        var tIdx;
        var thmChk = getThumbChk(true);
        
        if (!thmChk.length) return;
        var datID = thmChk[0].id.substr(4);

        for (tIdx = 0; tIdx < thmChk.length; tIdx++) {
            datID = thmChk[tIdx].id.split('_')[1];
            if (isVideoComplete(datID)) imgArr[imgArr.length] = videoData[datID];   // editing/saving is only possible if all video process is complete
        }
    }

    var iDat, dat, iVid;
    var postData;
    var chk;
    var ids = '';

    for (iDat = 0; iDat < imgArr.length; iDat++) {

        dat = imgArr[iDat];

        dat[i.GROUP] = $('#vidGroupID').val();
        dat[i.ASSET] = $('#vidAssetID').val();
        dat[i.ASSET_NAME] = $('#vidAssetName').val();

        if (!multipleEdit) dat[i.TITLE] = $('#vidTitle').val();

        dat[i.COMMENTS] = $('#vidComment').val();
        dat[i.DESCRIPTION] = $('#vidDescription').val();

        dat[i.INSPORINT] = $('#vidInspOrInt').val();
        dat[i.INSPTYPE] = $('#vidInspType').val();
        dat[i.ITEMNO] = $('#vidMaintItemNo').val();
        dat[i.INSPDATE] = dateStrToYMD('vidInspDate');

        ids += (ids ? ',' : '') + dat[i.VID];

    }

    postData = { vid: ids
                        , grp: $('#vidGroupID').val(), ast: $('#vidAssetID').val()
                        , vt: uri((multipleEdit ? '-' : $('#vidTitle').val()))
                        , ds: uri($('#vidDescription').val())
                        , cm: uri($('#vidComment').val())
                        , ioi: uri($('#vidInspOrInt').val())
                        , itp: uri($('#vidInspType').val())
                        , mnm: uri($('#vidMaintItemNo').val())
                        , idt: dateStrToYMD('vidInspDate')
                        , tm: Date()
    };

    $.ajax({
        type: 'POST',
        url: "VideoData.aspx?acn=vupd",
        data: postData,
        dataType: "text",
        success: function (data) {

            $("#video_details").dialog("close");
            showMask(-1);           // last video data processed

        },
        beforeSend: function () {
            showMask(1);                         // first video data processed
        }
    });


    showThumbnails();
    //generateThumbnails();

    $("#video_details").dialog("close");

}

//function postVideoData(){
//    var uurl = 'VideoData.aspx';
//    var params = null;
//    try {

//        var xhr = new XMLHttpRequest();
//        var obj;

//        params = 'acn=vsave&'&ast=' + asset_ + '&chk=1&fn=' + FILENAME + '&sz=' + SIZE + '&cnt=' + chunks.length + '&bpc=' + BYTE_PER_CHUNK +
//                    '&vt=' + title_ + '&ds=' + description_.replace(/\n/gi, '[NL]') + '&cm=' + comments_.replace(/\n/gi, '[NL]') + '&tm=' + (new Date());

//        if (!blobOrFile) {
//            // get manifest
//            //obj = chunks[0];
//            //                uurl += '?grp=' + group + '&ast=' + asset_ + '&chk=1&fn=' + FILENAME + '&sz=' + SIZE + '&cnt=' + chunks.length + '&bpc=' + BYTE_PER_CHUNK +
//            //                        '&tm=' + (new Date());


//            xhr.open('POST', uurl, true)

//            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

//        } else {

//            uurl += '?grp=' + group_ + '&ast=' + asset_ + '&cnt=' + chunks.length + '&idx=' + idx + '&fn=' + FILENAME + '&sz=' + SIZE + '&vid=' + vid +
//                                                    '&csz=' + blobOrFile.size + '&tm=' + (new Date());

//            changeStatus('Uploading');
//            isUploading_ = true;

//            xhr.open('POST', uurl, true)

//        }


//        try {

//            xhr.onload = onFileUploaded;

//            if (!blobOrFile) blobOrFile = params;

//            xhr.send(blobOrFile);

//        } catch (eee) {

//            changeStatus('Error: Upload, ' + eee.message);
//            //alert('Error uploading chunk...:' + eee.message);


//        }

//    } catch (ee) {
//        alert('upload error: ' + ee.message);
//    }    
//}

function uri(text){ return encodeURIComponent(text); }

function returnTreeToMainPanel() {
    var tree = $('#treeView');
    var dest = $('#tree');
    dest.append(tree);
}

function showDateRange(scope) {
    //showDateRange($(this).val());
    var scp = scope.toLowerCase();
    $('#fltFromID').attr('disabled', (scp == 'all' || scp == 'unspecified' || scp == 'before'))
    $('#fltToID').attr('disabled', (scp == 'all' || scp == 'unspecified' || scp == 'after'))

    if ($('#fltFromID').attr('disabled') == 'disabled') $('#fltFromID').val('');
    if ($('#fltToID').attr('disabled') == 'disabled') $('#fltToID').val('');

    if ($('#fltFromID').attr('disabled') != 'disabled') {
        $('#fltFromID').focus();
    } else if ($('#fltToID').attr('disabled') != 'disabled') {
        $('#fltToID').focus();
    }

}

function clearVideoFilter() {

    $('#fltInspOrInt').val('All');
    $('#fltInspType').val('');
    $('#fltMaintItemNo').val('');

    $('#fltScope').val('All');
    $('#fltFromID').val('');
    $('#fltToID').val('');

    $('#btnVidFilter').css('text-decoration', 'none');
    $('#btnVidFilter').css('color', '#ffffff');
    $('#btnVidFilter').attr('title', 'Click to set advanced filter parameters ...');

    $('#fltAdvParams').val('');

    $('#video_filter').dialog("close");
    showThumbnails($('#vidSearchText').val().length != 0);

}

function applyVideoFilter() {

    var scp = $('#fltScope').val().toLowerCase();
    var frm = $('#fltFromID').val();
    var to = $('#fltToID').val();
    var ioi = $('#fltInspOrInt').val().toLowerCase();
    var mnm = $('#fltMaintItemNo').val();
    var itp = $('#fltInspType').val();

    if (!itp && !mnm && ioi == 'all' && scp == 'all') {
        alert('No filtering parameters set.');
        $('#fltInspOrInt').focus();
        return;
    }

    // validate entries
    if (scp == 'before' && !$('#fltToID').val()) {
        alert('You have to specify inspection ending date');
        $('#fltToID').focus();
        return;
    }

    if (scp == 'after' && !$('#fltFromID').val()) {
        alert('You have to specify inspection start date');
        $('#fltFromID').focus();
        return;
    }

    if (scp == 'between'){
        if (!$('#fltFromID').val() || !$('#fltToID').val()) {
            alert('You have to specify both inspection start and end dates');
            if (!$('#fltFromID').val()) {
                $('#fltFromID').focus();
            } else {
                $('#fltToID').focus();
            }
            return;

        } else if (new Date($('#fltToID').val()) < new Date($('#fltFromID').val())) {
            alert('You cannot specify start date which is later than end date.');
            $('#fltFromID').focus();
            return;
        }
    }

    var params = '&scp=' + $('#fltScope').val() + '&ioi=' + $('#fltInspOrInt').val()
                + '&mnm=' + $('#fltMaintItemNo').val() + '&dfr=' + dateStrToYMD('fltFromID')
                + '&dto=' + dateStrToYMD('fltToID') + '&itp=' + $('#fltInspType').val();

    $('#btnVidFilter').css('text-decoration', 'underline');
    $('#btnVidFilter').css('color', '#00ff00');
    $('#btnVidFilter').attr('title', 'Click to change/clear advanced filter setting ...');

    $('#fltAdvParams').val(params);

    $('#video_filter').dialog("close");
    showThumbnails();
}

function saveVideoDetails() {


    // validate entries
    if (!$('#vidTitle').val() && !multipleEdit) {
        // mandatory field checking is only applicable on single record editing
        alert('Video title is a mandatory field.');
        $('#vidTitle').focus();
        return;
    }

    if (!curUpObjEdit) {
        // this will only happen if there is an exception error
        alert('Error saving. Current upload object not found.');
        return;
    }

    try {

        var objArr=[];

        if (multipleEdit) {

            var chks = getQueueChk(true)
            var iChk;

            for (iChk = 0; iChk < chks.length; iChk++) {
                objArr[objArr.length] = getCHKUploadObject(chks[iChk]);
            }

        } else {

            objArr[0] = curUpObjEdit;

        }

        var iObj;
        var obj;
        for (iObj = 0; iObj < objArr.length; iObj++) {

            obj = objArr[iObj];
            if (obj) {
                obj = obj.OBJECT;

                if (!multipleEdit) obj.attrib('vt', $('#vidTitle').val());  // for single editing, update title

                obj.attrib('astName', $('#vidAssetName').val());
                obj.attrib('ast', $('#vidAssetID').val());
                obj.attrib('grp', $('#vidGroupID').val());

                obj.attrib('ds', $('#vidDescription').val());
                obj.attrib('cm', $('#vidComment').val());

                obj.attrib('ioi', $('#vidInspOrInt').val());
                obj.attrib('itp', $('#vidInspType').val());
                obj.attrib('mnm', $('#vidMaintItemNo').val());
                obj.attrib('idt', dateStrToYMD('vidInspDate'));

                obj.status('Ready');

                objArr[iObj].OBJECT = obj;
                ACTIVE_UPLOADS[objArr[iObj].INDEX] = obj;

            }

        }


        resetQueueTable();

        $('#chkSelectAllFiles').prop('checked', false);
        $('#video_details').dialog("close");

    } catch (e) {
        alert('Error in saveVideoDetails : ' + e.message);
    }

}

function resetQueueTable() {
    // reset object on queue flag
    var idx, upl;
    for (idx = 0; idx < ACTIVE_UPLOADS.length; idx++) {
        upl = ACTIVE_UPLOADS[idx];
        upl.isOnQueue(false);
    }

    // Reset active queue table;
    queueData.data = [];

    setQueueData();
}

function updateLocation() {

    var nodeSpan = $('.clicked');
    var li, id;
    var loc = $('location');

    if (nodeSpan.length) {
        var par = $(nodeSpan).parent();

        var parId = par.parent().prop('id');

        var parh, sp;

        //var ts = '<u>' + nodeSpan.html() + '</u>';
        var ts =  nodeSpan.html();
        var html;

        if (parId != 'treeView') {

            id = par.attr('id');
            while (id != 'treeView') {
                parh = $(par).parent();
                id = parh.attr('id');

                if (typeof (id) != 'undefined') {
                    sp = par.find('span');
                    html = sp.html();
                    ts = (html != ts ? sp.html() + '&nbsp;-&gt;&nbsp;' : '') + ts;
                    //ts = sp.html() + '&nbsp;-&gt;&nbsp;' + ts;
                }

                par = parh;
            }
        }

        loc.html(ts);
        loc.prop('title', ts.replace(/&gt;/gi, '\>').replace(/&nbsp;/gi, ' ').replace(/<u>/gi, '').replace(/<\/u>/gi, ''));

        loc.scrollLeft(loc.prop("scrollWidth"));

    } else {
        loc.html('');
        loc.prop('title', '');
    }



}

function getGroup(child) {

    if (typeof (child) == 'undefined') {

        child = $('span.clicked').parent()[0];

    } else {

        if (typeof (child.length) != 'undefined') {
            // from jQuery selection
            if (child.prop('tagName') != 'LI') {
                child = child.parent()[0];
            } else {
                child = child[0];
            }
        } else {
            // single element
            if (child.tagName != 'LI') {
                child = $(child).parent()[0];
            }
        }

    }

    var grp=null;
    var par = $(child).parent();
    var ppar;
    var parh;
    var parId = par.prop('id');

    if (parId == 'treeView') {

        grp = child;
        parId = grp.id;

    } else {

        par = child;
        parId = $(par).parent().parent().parent().prop('id');

        while (parId != 'treeView') {
            par = $(par).parent();
            parId = par.parent().parent().parent().prop('id');
        }

        parId=$(par).prop('id');
    }

    return parId.substr(1);

}

function generateTreeSub(p) {

    try {

        var i, n;
        var li, img, span;
        var dispId = false;

        if (typeof (p) == 'undefined') p = null;

        var sdat = null;
        
        if (!p) {
            // generate root node
            
            var tv = $('#treeView');
            tv.empty();

            for (i = 0; i < treeData.N0.length; i++) {

                n = treeData.N0[i];

                li = document.createElement('li');
                li.id = 'N' + n[TIDX.ID];
                li.title = n[TIDX.CODE] + '-' + n[TIDX.TITLE];

                sdat = treeData[li.id];

                img = document.createElement('img');
                img.src = 'images/a_px.png';
                img.className = (n[TIDX.WCHILD] == '1' ? (sdat ? 'm' : 'p') : '');

                span = document.createElement('span');
                span.className = 'clicked';

                $(span).html((dispId ? li.id + '-' : '') + n[TIDX.TITLE]);

                $(li).append(img);
                $(li).append(span);
                tv.append(li);

                if (n[TIDX.WCHILD] == '1') generateTreeSub(li);

                getNodeData(li.id); // get second level child nodes

            }

        } else {
            // parent is existing // parent LI
            // create new UL and append to the parent LI

            var dat = treeData[p.id];   // data may not be available all the time

            if (dat) {

                var ul = document.createElement('UL');

                for (i = 0; i < dat.length; i++) {

                    n = dat[i];

                    li = document.createElement('li');
                    li.id = 'N' + n[TIDX.ID];

                    li.title = n[TIDX.CODE] + ' - ' +n[TIDX.TITLE];

                    sdat = treeData[li.id];

                    img = document.createElement('img');
                    img.src = 'images/a_px.png';
                    img.className = (n[TIDX.WCHILD] == '1' ? (sdat ? 'm' : 'p') : '');

                    span = document.createElement('span');

                    $(span).html((dispId ? li.id + '-' : '') + n[TIDX.TITLE]);

                    $(li).append(img);
                    $(li).append(span);
                    $(ul).append(li);


                    if (n[TIDX.WCHILD] == '1') generateTreeSub(li);

                }

                $(p).append(ul);
            }

        }

    } catch (ee) {
        alert(ee.message);
    }

}

function setNodeSelection(img) {

    var span = $(img).parent().find('span');
    $('.clicked').prop('class', '');
    $(span[0]).prop('class', 'clicked');

    updateLocation();
    
}

function assignTreeEvent() {
    var lis = $('#treeView').find('img');
    lis.unbind("click");
    lis.click(function () {

        var ul = $(this).parent().find('ul');

        if (this.className == 'm') {

            setNodeSelection(this);

            this.className = 'p';
            //$(ul[0]).hide("fast");
            
            $(ul[0]).slideUp();
        } else if (this.className == 'p') {
            //$(this).class('m');

            var id = $(this).parent().attr('id');
            var sdat = treeData[id];

            setNodeSelection(this);

            if (typeof (sdat) == 'undefined') {

                getNodeData(id);

            } else {

                this.className = 'm';
                
                $(ul[0]).slideDown();

            }

        }

    });

    var spans = $('#treeView').find('span');
    spans.unbind("click")
    spans.click(function () {

        $("[class*='clicked']").attr('class', '');  // remove selected node hilight
        $(this).attr('class', 'clicked');           // show selected node hilight

        //Location: Root -> Level1 -> Level2 -> Level3

        updateLocation();
        if(isVisibleGallery())showThumbnails();

        //alert($(this).parent().parent().attr('id'));

        p = $(this).parent();

    });

}


function getNodeData(id) {

    $.ajax({
        url: "VideoData.aspx?acn=chn&id=" + id + '&tm=' + Date(),
        beforeSend: function () { showMask(1); }   // can place fetch status like masking the page
    }).done(function (data) {

        if (data.substr(0, 5) == 'error') {
            alert('Failed loading child node data.\n' + data);
        } else {


            try {

                var json = JSON.parse(data);
                for (var key in json) {
                    // validate key which must start with N and the rest of the characters must be numeric
                    if (key.substr(0, 1) == 'N' && !isNaN(key.substr(1))) {

                        // search li with id=key
                        var li = $('#' + key);
                        var img = $(li).find('img');
                        treeData[key] = json[key];

                        generateTreeSub(li[0])
                        img.attr('class', 'm');


                    }
                }

                assignTreeEvent();

            } catch (ee) {
                alert('error:' + ee.message);
            }

        }

        showMask(-1);   // hide mask

    });

    //alert('Get node data for ' + id);
}


function encFileName(fn){
    return  fn.replace(/#/gi, '[S]').replace(/&/gi, '[A]').replace(/©/gi, '[C]').replace(/®/gi, '[R]').replace(/™/gi, '[T]');
}

var keepAlive_ = 0;
function keepAlive() {

    if (keepAlive_) clearTimeout(keepAlive_);

    $.ajax({
        url: 'VideoData.aspx?acn=alive&tm=' + Date(),
        beforeSend: function () {
            ;
        }
    }).done(function (data) {
        ;
    });

    keepAlive_ = setTimeout("keepAlive()", 100000);
}


var updateStatus_ = 0;
function updateStatus() {
    if (updateStatus_) clearTimeout(updateStatus_);

    var checkInterval = 1500;
    var key, ids='';

    for (key in videoData) {
        //alert('key:' + isVideoComplete(key));
        if (!isVideoComplete(key)) {
            ids += (ids ? ',' : '') + key;
        }
    }

    if (ids) {
        // check status
        //alert(ids);
    }

    //alert(videoData);

    updateStatus_ = setTimeout("updateStatus()", checkInterval);
}



function changePassResult(e) {
    // e:{uid:1,stat:'fail/success',msg:'error message'}
    if (typeof (parent.changePassResult) == 'undefined') {
        return;
    } else {
        parent.changePassResult({ uid: 1, stat: 'fail', msg: 'errrorrrororor' });
    } 
}