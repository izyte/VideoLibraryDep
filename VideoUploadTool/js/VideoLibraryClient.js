// component versioning template object
var __compInfo = {
    "name":"Asset Tree",
    "nameMinor":"",
    "build":"Alpha 1.0.0.2","date":"2019-08-01","by":"Terence", "details":["Started creating framework"],
    "history":[
        {"build":"Alpha 1.0.0.1","date":"2019-07-31 16:25","by":"Terence","details":["Created component boilerplate"]},
    ]
}

var appInfo = {
    "appName": "Video Upload Tool",
    "appNameMinor": "SEPCo IVL - (Inspection Video Library)", 
    "date":"2019-10-29", "build":"v1.2.1 - 20191029","details":"Remove NewtonSoft usage and replace with javascript serialization because newtonsoft throws errors when used in Shell GI machine.",
    "updates":[
        {"date":"2019-10-23", "build":"v1.2.0 - 20191023","details":"Fixed exeption error when on process exit and implemented temp files cleanup."},
        {"date":"2019-10-11", "build":"v1.1.2 - 20191011","details":"Exception error on ProcessExit and implementing post sumission changes."},
        {"date":"2019-10-10", "build":"v1.1.1 - 20191010","details":"Troubleshooting config marformed json string."},
	    {"date":"2019-09-06", "build":"v1.1.0 - 20191004","details":"Continuing implementation of changes after first onsite demo."},
        {"date":"2019-08-01", "build":"v1.0.9 - 20190801","details":"Implementation of changes after first onsite demo."},
        {"date":"2019-07-17", "build":"v1.0.8 - 20190717","details":"Demo version on site"},
        {"date":"2019-07-03","details":"Implement unsupported extension and invalid file error indicator"},
        {"date":"2019-07-03 18:13","details":"Fix manifest query error on key handling. Move archive icon to the right of the cell and tooltip to indicate filename."},
        {"date":"2019-07-11 09:36","build":"Beta 1.0.7 - 20190711","details":"Fix issue with videos which do not report duration on probe."},
    ]
};

var notSet="[ not set ]";

var alertInfo= {};

var header = "Sample header"
var endcoded = [1, 2, 3, 4];

function noSource(){
    var html = $("#currentSource").html();
    return html == notSet || html.toLowerCase().indexOf('initializing')!=-1;
}

function testClient() {
    alert('testClient');
}

var prompted = false;  
function clientInterface(e)
{
    var retObj = JSON.parse(e);
    switch (retObj.action) {
        case 'update_progress':
            updateProgress(retObj);
            break;
        case 'get_server_info':
            setVideoSource(retObj);
            setOnlineStatus(retObj);
            setOtherStatus(retObj);
            break;
        default:
    }

    //alert("Hello call name: " + retObj.filename + ", Modified: " + retObj.modified + ", Ticks: " + retObj.ticks + ", Size: " + retObj.size);
    //console.log("Hello call " + e);
    //$("#testPrompt").value(e);
    $("#txtInitializing").css("display","none");
}

function setOtherStatus(retObj){
    var sta = $("#currentStatus");
    var src = $("#currentSource");
    var host = $("#txtHost");
    
    var icoNoSrc = $("#noSourcePath");

    var cfg = JSON.parse(retObj.appConfig);
    var VideoSourceCurrent = JSON.parse(retObj.videoSourceCurrent);
    
    var sourceFound = (retObj.sourceFound == "true")
    //alert(VideoSourceCurrent.cancelled);

    //alert(12123)
    host.html(cfg.upload_url.substring(0,cfg.upload_url.indexOf("FileUploader")));
    src.html(cfg.source.path ? cfg.source.path + (VideoSourceCurrent.cancelled ? '&nbsp;(cancelled)': 
                                                            (VideoSourceCurrent.complete ? '&nbsp;(complete)' :'')) : notSet);
    src.removeClass(sourceFound ? "text-warning" : "text-white").addClass(sourceFound ? "text-white" : "text-warning");
    icoNoSrc.css("display", sourceFound || !cfg.source.path ? "none" : "inline");
    
    if(retObj.withPending){
        sta.html('<i class="fa fa-hourglass-half text-warning" style="cursor:default;"></i>');
        sta.css("display","inline");
        sta.attr('title','With pending process for the current source.')
    }else{
        sta.css("display","none");
    }
    
}

var isOffline = true;
function setOnlineStatus(data){
    var withError = (data.error!=null);
    var net = $("#icoNetwork").removeClass("text-danger").removeClass("text-success");
    var txtRemote=$("#txtRemoteSize");
    var icoRemote=$("#icoRemote").removeClass("text-danger").removeClass("text-warning").removeClass("text-success");

    isOffline = withError;
    if(withError){
        
        net.addClass("text-danger")
        $("#txtInternet").html("Offline (or slow network)")

        txtRemote.html("unknown");

    }else{
        net.addClass("text-success")
        $("#txtInternet").html("Online")

        if(data.totalSize != undefined){
            var spAvail=Math.round(parseFloat(data.availableFreeSpace));
            var spTotal=Math.round(parseFloat(data.totalSize));
            var unAvail=data.availableFreeSpaceUnit;
            var unTotal=data.totalSizeUnit;
        
            var perc = ((spAvail + 0.000001) / spTotal) *  100.0;
            if(perc<10.0){
                icoRemote.addClass("text-danger");
            }else if(perc<30.0){
                icoRemote.addClass("text-warning");
            }else{
                icoRemote.addClass("text-success");
            }
    
            txtRemote.html(spAvail + (unAvail==unTotal ? "" : unAvail) + "/" + spTotal + unTotal);
        }else{
            txtRemote.html("unknown");
        }



    }

    
}

function callHost(action, args) {
    var newArgs = JSON.parse(JSON.stringify(args));
    newArgs["action"] = action;
    return window.external.hostInterface(JSON.stringify(newArgs))
}

var lastGoodNewPath = "";
var lastGoodNewPathItemsFound = 0;
var scanningFiles = false;
var withErrorInPath = false;
var isCancelledSource = false;
var isCompleteSource = false;

function setVideoSource(retObj){

    var sourcePath=$("#sourcePath");
    var processedCount=$("#processedCount");
    var sourceCount=$("#sourceCount");
    var icoBulb=$("#icoBulb");
    var found=$("#txtFound");

    var VideoSource = JSON.parse(retObj.videoSource);
    var sourceCancelled = VideoSource.cancelled;
    var VideoSourceCurrent = JSON.parse(retObj.videoSourceCurrent);
    var currentSourcePath = VideoSourceCurrent.path;
    var currentSourceCancelled = VideoSourceCurrent.cancelled;
    var currentSourceComplete = VideoSourceCurrent.complete;
    var isProcessingInput = retObj.isProcessingInput;
    var sourceFound = (retObj.sourceFound == "true")

    icoBulb.removeClass("text-muted text-warning")
        .addClass(isProcessingInput ?  "text-warning" : "text-muted");
    
    if(inProcessToggled){
        $("#btnStart").prop("disabled",false)
        $("#btnStop").prop("disabled",false)
        $("#sourceStatus").html("");
        inProcessToggled=false;
    }
    if(isCancelling){
        $("#sourceStatus").html("");
        isCancelling=false;
    }

    //var showCancel= !noSource() && currentSourcePath.length!=0 && 
    //    !currentSourceCancelled && !currentSourceComplete && !isPauseVisible();
    //if(showCancel && currentSourcePath.length!=0){
    //    if(currentSourcePath.toLowerCase().substring(0,3)=="err")showCancel=false;
    //}

    // resume -  show when not currently processing and source is found with stil items to process
    $("#btnStart").css("display",!isProcessingInput && sourceFound && 
        !currentSourceCancelled && !currentSourceComplete ? "inline" : "none");    

    var showCancel = isResumeVisible() || (!sourceFound && !noSource());
    
    var showSelect = !showCancel && (currentSourceCancelled || currentSourceComplete || !sourceFound) ;
    var showStart = showSelect && lastGoodNewPath.length>0;
    if(showStart)
        if(!VideoSource.scanning)
            if(VideoSource.tempPath.length!=0 && !VideoSource.error)
                if(VideoSource.cancelled || VideoSource.complete) showStart= false;

    $("#btnSelectSource").css("display",showSelect ? "inline" : "none")
    $("#btnApplyNewSource").css("display",showStart ? "inline" : "none")
    if(showStart) $("#btnApplyNewSource").prop("disabled",false);

    // pause -  show when currently processing and source is found with stil items to process
    $("#btnStop").css("display",isProcessingInput && sourceFound ? "inline" : "none");    

    // cancel -  show when currently processing and source is found with stil items to process
    $("#btnCancel").css("display", showCancel ? "inline" : "none");
    if(showCancel)$("#btnCancel").prop("disabled",false);

    found.html("");
    sourcePath.html("");
    if(VideoSource.scanning){
        if(VideoSource.tempPath.length!=0){
            scanningFiles=true;
            sourcePath.html('  **** Searching video files in <span class="text-info" style="font-weight:bold;">[ ' + VideoSource.tempPath + ' ]</span>. Please wait ... ****');
        }
    }else{

        if(VideoSource.tempPath.length!=0){
            if(!VideoSource.error){
                if(VideoSource.cancelled || VideoSource.complete){
                    sourcePath.removeClass("text-info").addClass("text-white");
                    sourcePath.html('Selected path: <span class="text-danger" style="font-weight:bold;">[ '+  VideoSource.tempPath + ' ]</span> was previously <u>cancelled</u> or <u>completed</u>.');
                    found.html("");
                }else{

                    lastGoodNewPath=VideoSource.tempPath;
                    isCancelledSource=VideoSource.cancelled;
                    isCompleteSource=VideoSource.complete;
                    lastGoodNewPathItemsFound=VideoSource.items;
                    scanningFiles=false;
                    withErrorInPath=false;
                    sourcePath.html('New Selected Path: <span class="text-info" style="font-weight:bold;">[ ' + lastGoodNewPath + (sourceCancelled ? '&nbsp;(cancelled)' : 
                    (isCompleteSource ? '&nbsp;(complete)' :'')) + " ]</span>");
                    found.html("(found " + VideoSource.items + " item" + (VideoSource.items>1?"s":"")  + ")")
                        .css("color","gray");
                }

            }else{
                withErrorInPath=true;
                sourcePath.html("Error scanning '"+ VideoSource.tempPath +"'. " + VideoSource.errorMessage);
                found.html("");
            }
        }

    }

    var itemsFound=false;
    var rem = $("#lblRemaining");
    var srcPath = $("#currentSource").html();
    if(noSource() || !sourceFound || currentSourceComplete || currentSourceCancelled){
        processedCount.html('---');
        sourceCount.html('---');
    }else{
        if(VideoSourceCurrent.scanning){

        }else{
            if(!VideoSourceCurrent.error){
                if(VideoSourceCurrent.items){
                    ctr = $("#listProcessed").find("tr").length;
                    processedCount.html(ctr);
                    sourceCount.html(VideoSourceCurrent.items);
                    if(!itemsFound)rem.css("display","inline");
                    itemsFound=true;
                }
            }else{
                sourceCount.html("Error scanning '"+ VideoSourceCurrent.path +"'. " + VideoSourceCurrent.errorMessage);
            }
        }
    }

    if(!itemsFound)rem.css("display","none");


}

function SetSourceFolder(){
    //check if switch of source is in queue and stop process if true
    forceStopNewSource();   // stop any pending new source change in queue
    
    // trigger folder selection from host
    var VideoSource = callHost('select_folder',{ "default":lastGoodNewPath });
    var videoSource = JSON.parse(VideoSource);

    if(videoSource.path.toLowerCase() == videoSource.tempPath.toLowerCase()){

        if(!noSource()) alert("You cannot select the current source folder.");
    }else{
        // update source patch right after selection of new folder from the dialog box
        setVideoSource({"videoSource" : VideoSource});
    }
}

function applyNewSource(){
    forceStopNewSource();

}

inProcessToggled=false;
isCancelling=false;
function stopAll(){
    $("#btnStop").prop("disabled",true);

    $("#sourceStatus").html("Stopping all process. Please wait...");
    setTimeout(function(){
        inProcessToggled=true;
        callHost( 'stop_all' ,{ });
    },100);
    
}
function startScan(){
    $("#btnStart").prop("disabled",true)
    $("#btnCancel").css("display","none");

    $("#sourceStatus").html("Resuming process. Please wait...");
    setTimeout(function(){
        inProcessToggled=true;
        callHost( 'start_scan' ,{ });
    },100);
}

function cancelProcess(){
    if(!confirm("This action will block the current source which will subsequently make it as an invalid selection.\n\nClick OK to coninue or CANCEL to abort"))return;
    $("#btnCancel").prop("disabled",true)
    $("#sourceStatus").html("Cancelling all processes in the current source. Please wait...");
    setTimeout(function(){
        isCancelling=true;
        callHost( 'cancel_scan' ,{ });
    },100);
}

function forceStopNewSource(){
    var isStopped = callHost( 'is_stopped' ,{ });
    if(!isStopped) StartStop(1);
}

function exitApp(){
    if(!confirm("You are about to close the application and treminate any pending process.\n\nClick OK to proceed or CANCEL to abort"))return;
    $("#btnExit").prop("disabled",true);
    setTimeout(function(){
        callHost( 'exit_app' ,{ });
    },100);
}

function StartStop(e){

    //if(!forceStop)forceStop=false;
    var isStopped = callHost(e ? 'start_stop' : 'is_stopped' ,{ });

    if(e){
        if(isNaN(e)){
            // object
            var lbl = $(e).find("#lblStartStop").html();
            if(lbl=="Start"){
                if(lastGoodNewPath.length==0){
                    alert("Please select a new video source folder.");
                    return;
                }
                if(withErrorInPath){
                    alert("Error scanning video files in selected folder.");
                    return;
                }
                if(scanningFiles){
                    alert("Source cannot be changed while still scanning files.");
                    return;
                }
                if(isCancelledSource || isCompleteSource){
                    alert("Cannot process videos from source that was previously completed or cancelled.");
                    return;
                }
                if(lastGoodNewPathItemsFound==0){
                    alert("No videos found in the selected path.");
                    return;
                }
                
                //setVideoSource({"scanning":false,"tempPath":"","path":""});

                $("#btnApplyNewSource").prop("disabled",true)
                setTimeout(function(){
                    $("#sourcePath").html("Setting video source to '" + lastGoodNewPath + "'. Please wait...");
                    $("#sourcePath").removeClass("text-white").addClass("text-info");
                    lastGoodNewPath="";
                    lastGoodNewPathItemsFound=0;
                                },100);
                var changeReturn = callHost('change_source' ,{ });
                setVideoSource({"scanning":false,"tempPath":"","path":""});
                $("#sourcePath").removeClass("text-info").addClass("text-white");


            }else if(lbl=="Abort"){
                callHost('abort_change_source' ,{ });
            }
        }
    }

    //alert((e ? 'start_stop' : 'is_stopped') + ", " + isStopped);

    /*

    $("#lblStartStop").html(isStopped ? "Apply" : "Abort");
    if(isStopped){
        $("#icoStartStop").removeClass("fa-stop").removeClass("text-danger");
        $("#icoStartStop").addClass("fa-play").addClass("text-success");
    }else{
        $("#icoStartStop").removeClass("fa-play").removeClass("text-success");
        $("#icoStartStop").addClass("fa-stop").addClass("text-danger");
    }

    */


    


    //var appStat=JSON.parse(callHost('app_status' ,{ })); 
    //var cfg = JSON.parse(appStat.appConfig)
    
    //alert(appStat.withPending);

    //alert(cfg.source.path);


}

function GetSourceFolder(){
    var selectedPath = callHost('get_source_folder',{ });
    if(selectedPath.length!=0){
        // $("#sourcePath").html(selectedPath);
    }

    return selectedPath;
}

function ReloadPage(){
    location.reload();
}

function callClientTest(e) {
    alert('Hello');
};

function initVideoClient() {
    String.prototype.format = function () {
        var a = this;
        for (var k in arguments) {
            a = a.replace(new RegExp("\\{" + k + "\\}", 'g'), arguments[k]);
        }
        return a
    }
    callHost("set_title", appInfo);
    //callHost("stop_process", {"id":idArr[1]});

    //appInfo
    $('#appTitleMain').html(appInfo.appName);
    $('#appTitleSub').html(appInfo.appNameMinor);
    $('#appBuild').html('Build: '+ appInfo.build);

    //$('#killModal').modal('show');

    getTemplateHTML();

    //$('listProcessed').css('display','inline');
    //$('listCompleted').css('display','inline');

    updateVideoList();
    assignEvents();

    GetSourceFolder();
    StartStop();

}
function isPauseVisible(){
    return $("#btnStop").css("display")!="none";
}
function isResumeVisible(){
    return $("#btnStart").css("display")!="none";
}
function isOverFlowing(id){
    var item = $("#" + id);
    return item.prop('scrollHeight') > item.height();
}

function assignEvents() {
    // select tr parents of td with colspan = 5. these are the details rows to assign the events to
    var sel = $('td[colspan=5]').parents("tr");

    sel.on('hidden.bs.collapse', function () {
        //alert('ddd');
        console.log("collapse!")
    })

    sel.on('shown.bs.collapse', function () {
        //alert('eeee');
        console.log("expand!")
        var row = $(this);
        console.log(row.prev());
        var btn = row.prev().closest('a');
        console.log('Closest anchor');
        console.log(btn.length);
        console.log('row.prev()');
        console.log(row.prev().length);
        var tgl = row.prev().find([name = "encExpCol"]);
        console.log("tgl.length:" + tgl.length);
    })

}

var tplHTML = { encoding: '', uploading: '', standby: '' };

var tplProcessed = null;
var tplCompleted = null;

function getTemplateHTML() {
    // get encoding template, at design time, intial row is layed out with data placeholders and HTML is stored in tplHTML.encoding field.

    
    var prompt = $('#tmpPrompt');   // get test prompt object
    var body = $('#listProcessed'); // get body object
    listCompleted
    tplProcessed = body.html();     // get template html
    body.html('');                  // clear body html

    body = $('#listCompleted');     // get body object
    tplCompleted = body.html();     // get template html
    body.html('');                  // clear body html

//    var bdy = $('#bodyEncoding');
//    tplHTML.encoding = bdy.html();
//    bdy.html('');
}

function updateList() {
    var mfts = JSON.parse(callHost('get_manifests', {}));
    alert(mfts.length);
}

var intUpdateVideoList = 0;
function updateVideoList() {

    if (intUpdateVideoList) clearTimeout(intUpdateVideoList);
    var manifests=[];
    var prm = $('#testPrompt');
    var ret = [];
    //prm.val(new Date());
    //return;
    try {
        
        var retObj={};
        var tmp = callHost("get_manifests", {});

        if (tmp.length != 0) {
            retObj=JSON.parse(tmp);
            //if(retObj.cancelled) return;

            manifests = JSON.parse(retObj.manifests);
        }
        prm.val(manifests.length);

        for (var idx = 0; idx < manifests.length; idx++) {
            const mft=manifests[idx];
            ret.push({
                id: mft.id,
                file: mft.origFilename,
                //asset: mft.dirInfo.description,
                asset: "",
                origPath: mft.origPath,
                size: mft.size,
                encSize: mft.encSize,
                status: mft.status,
                statusDisplay: mft.statusDisplay,
                interrupt: mft.interrupt,
                progress:mft.progress
            })
        }
        listEncodedVideos(ret);

        var mfIdx={};
        for(idx=0;idx<ret.length;idx++){
            mfIdx[ret[idx].id] = true;
        }
        removeListItemNotInManifest(mfIdx)
        //ret.push({});


    } catch (e) {
        //manifests = [];
        prm.val("Error:" + e.message);
    }

    intUpdateVideoList = setTimeout(updateVideoList, 1500);
}

var enc=[]

var firstRunOnly=false;
function removeListItemNotInManifest(mfts){
    //if(firstRunOnly) return;
    if(!mfts) return;

    firstRunOnly=true;

    var body = $('#listProcessed');
    var children=body.children();
    var bodyComplete = $('#listCompleted');     // get body object    

    for (var idx=0;idx<children.length;idx++) {
        var tr = $(children[idx]);
        var id = tr.attr('id');
        if(!mfts[id])tr.remove();
    }    

}

function isInManifest(mfts,id){
    if(!mfts) return false;
    for(var i;i<mfts.length;i++){
        if(mfts[i].id==id) return true;
    }
    return false;
}
function listEncodedVideos(mfts) {

    //var enc = [];
    if (!mfts) mfts = [];

    if (mfts) {
        enc = mfts;
    } else {
        enc = [
        { "id": "31be30ce-586d-4cf1-8d3b-a57f770a98eb", "file": "raw.MTS", "asset": 'West Boreas MMM', size: 123, status: 'Encoding', progress: 0.5 },
        { id: 2, file: 'Inspection Video2.mts', asset: 'Brutus', size: 456, status: 'Encoding', progress: 0.8 },
        { id: 3, file: 'Inspection Video3.mts', asset: 'Olive', size: 789, status: 'Encoding', progress: 0.7 },
        { id: 4, file: 'Inspection Video4.mts', asset: 'Whimpy', size: 101112, status: 'Encoding', progress: 0.2 },
        { id: 5, file: 'Inspection Video5.mts', asset: 'Spongebob', size: 131415, status: 'Encoding', progress: 0.45 },
        { id: 6, file: 'Inspection Video6.mts', asset: 'Patric', size: 161718, status: 'Encoding', progress: 0.87 },
        { id: 7, file: 'Inspection Video7.mts', asset: 'Squid', size: 192021, status: 'Encoding', progress: 0.33 },
        { id: 8, file: 'Inspection Video8.mts', asset: 'Voltes5', size: 222324, status: 'Encoding', progress: 0.68 },
        ];
    }

    //alert(enc.length);


    var procs = $('#listProcessed');
    //$('#tmpPrompt').html(enc.length);
    var body = $('#listProcessed');
    var childCount = body.children().length;

    var bodyComplete = $('#listCompleted');     // get body object

    if (childCount == 0) {
        $('#encData').html(JSON.stringify(enc).replace(",",", "));
    }


    $('#tmpPrompt').html(childCount);
try{

    for (var idx in enc) {
        var obj = enc[idx];
        var id = obj.id
        var progress = obj.progress;
        var status = obj.statusDisplay=="encode" ? "to upload" : obj.statusDisplay;
        var interrup = obj.interrupt;
        var currTR, interrupHTML='';



        if(status=="encoding"){
            interrupHTML = (interrup=="stopped" ? 
                '<span id="stp_'+ id +'" title="Encoding stopped. Click to resume..."><i class="fa fa-play text-success"></i></span>' : 
                (interrup=="stopping" ? '<span title="Encoding process stopping ..."><i class="fa fa-ban text-danger" style="cursor:default;"></i></span>' : 
                '<span id="stp_'+ id +'" title="Click to pause encoding..."><i class="fa fa-pause text-white"></i></span>'))
        }


        
        /***************************************
            id: mft.id,
            file: mft.origFilename,
            //asset: mft.dirInfo.description,
            asset: "",
            size: mft.size,
            status: mft.status,
            statusDisplay: mft.statusDisplay,
            interrupt: mft.interrupt,
            progress:mft.progress
        ***************************************/

/*
        var mftStatus=null;
        var strStatus=callHost("get_status",{"id":id});
        try{
            mftStatus = JSON.parse(callHost("get_status",{"id":id}));
        }catch(e){
            $("#procTableTitle").html(e.message + "-" + strStatus);
        }
         
  */      
        
        if(status=="complete"){

            // remove row from the processed list
            currTR = body.find('#' + id);
            if (currTR.length != 0) currTR.remove();

            // search row from the completed table
            currTR = bodyComplete.find('#' + id);

            // if completed row is not found
            if (currTR.length == 0) {
                // createNew completed row
                currTR = $(tplCompleted);
                currTR.attr('id',id);
                currTR.find("[name='btnPruge']").attr('id',"prg_" + id);
                currTR.appendTo(bodyComplete);  // append object 

/****** the following section was taken out to disable purging of archived videos
 * 
                var btnArchive = currTR.find("[name='btnArchive']");
                
                btnArchive.attr("id","arc_"+id).attr('title',"Archive file '" + obj.file +'"');
                addModalEvent(btnArchive,"Archiving warning",
                    "You are about to move '"+ obj.file +"' to the archive folder. "+
                    "This action will also delete the source file and all encoding-related files.",
                    "archive text-danger","Continue",function(e){
                        var resp = callHost("archive_file",{"id":e.attr('id').split('_')[1]});
                        var respObj = JSON.parse(resp);
                        if(respObj["result"]=="success"){
                            setTimeout(function(){
                                location.reload();
                            },500);

                        }else{
                            alert(respObj["message"]);
                        }  
                    },"Close");
 *********/                              

            }else{

            }

            // set filename column
            var colObj = currTR.find("[name='fileName']");
            colObj.html(obj.file);
            colObj.attr('title',obj.file);

            currTR.find("[name='rawSize']").html(convertSizeWithUnit(obj.size));
            //currTR.find("[name='encodedSize']").html(obj.size ? obj.size :  "-");
            currTR.find("[name='encodedSize']").html(obj.encSize ? 
                convertSizeWithUnit(obj.encSize) :  "-");

            currTR.find("[name='origPath']").html(obj.origPath).attr('title',obj.origPath);

                

        }else{

            // under the currently processed video files

            var procRowFound=true;

            currTR = body.find('#' + id);

            if (currTR.length == 0) {
                // createNew processed row
                currTR = $(tplProcessed);
                currTR.attr('id',id);
                currTR.appendTo(body);  // append object 
                procRowFound=false;
            }

            // upadate status
            var stat=currTR.find("[name='status']");
            var isStopped = (interrup.length != 0);
            var textClass = "text-white";
            var waiting;
/*
            if(status=="encoding"){
                if(mftStatus.stopped){
                    var stpd=mftStatus.stopInfo=="stopped";
                    var stp=mftStatus.stopInfo=="stop";
                    status = '<span><i class="fa fa-'+(stpd ? 'stop' : 'hourglass' )+' p-0 m-0 mt-2 mr-1 text-secondary" style="cursor:default;"></i></span>'+
                        '<span>' + status + "</span>"
                    textClass = (stp ? "text-warning" :(stpd ? "text-danger": 
                                (mftStatus.locked?"text-white":"text-warning") ) );
                }
                stat.html(status)
                .removeClass("text-white").removeClass("text-warning").removeClass("text-danger")
                .addClass(textClass);
            
            //}else if(status=="uploading"){
            }else{
                stat.html(status)
                .removeClass(isStopped ? "text-white" : "text-danger")
                //.addClass(isStopped ? "text-danger" : "text-white");
                .addClass(mftStatus.stopped ? "text-danger" : "text-white");
            }
            */

            stat.html(status)
                .removeClass(isStopped ? "text-white" : "text-danger")
                .addClass(isStopped ? "text-danger" : "text-white");
                //.addClass(mftStatus.stopped ? "text-danger" : "text-white");
                

            // update progress percentage
            if (obj.status == "complete") progress = 100;
            currTR.find("[name='percent']").html(progress + "%");

            // update progress bar
            var prg = currTR.find("[name='progress']");
            prg.css('width', progress + "%");
            prg.attr('aria-valuenow', progress);

            var btnPause = currTR.find("[name='progPauseResume']");
            var btnPurge = currTR.find("[name='progPurge']");

            var iconPurge=btnPurge.find("[name='icoPurge']");
            var iconPurgeBan=btnPurge.find("[name='icoPurgeBan']");

            var icon=btnPause.find("[name='icoPauseResume']");
            var iconPending=btnPause.find("[name='icoPauseResumePending']"); // ppp

            var stpInf = getStopInfo(id);

            var isStopped = (stpInf=='stopped' || (stpInf=='stop' && obj.status=='encode'));

            iconPending.css('visibility',isStopped ? 'hidden' : (stpInf!='stop' && stpInf!='stopped' ? 'hidden' : 'visible'));

            var isPlay = icon.hasClass("fa-play");
            btnPause.attr('title','Click to ');
            //btnPause.attr('title','Click to '+ (isPlay ? 'resume' : 'hold') +' process... ' + (iconPending.css('visibility')=='visible' ? '(with ongoing process)' : '');

            if(isStopped){
                // if status is initialized (currently encoding), stop info is 'stopped'
                // or if status is encode (currently uploading), stop info can be 'stop'
                iconPurgeBan.css('visibility','hidden');
                iconPurge.removeClass("text-warning").addClass("text-danger");
                btnPurge.attr('title','Click to purge file from the list ...');
            }else{
                iconPurgeBan.css('visibility','visible');
                iconPurge.removeClass("text-danger").addClass("text-warning");
                btnPurge.attr('title','File purging not allowed ...');
            }
            //iconPurgeBan.css('visibility','hidden');
            
            if(!procRowFound){
                // update filename/size/status column
                var trObj = currTR.find("[name='fileName']");
                trObj.html(obj.file);
                trObj.attr('title',obj.file);

                trObj = currTR.find("[name='filePath']");
                trObj.html(obj.origPath);
                trObj.attr('title',obj.origPath);


                currTR.find("[name='fileSize']").html(convertSizeWithUnit(obj.size));

                btnPause.attr('id',"pr_" + id);
                btnPause.unbind("click");
                btnPause.click(function(){

                    var btnIcon=$(this).find("[name='icoPauseResume']");

                    var idArr=this.id.split('_');

                    if(btnIcon.hasClass('fa-ban')){

                    }else{

                        if(btnIcon.hasClass('fa-pause')){
                            // execute pause on current progress
    
                            btnIcon.removeClass('fa-pause').addClass('fa-play')
                                .removeClass("text-info").addClass("text-success");
    
                            callHost("stop_process", {"id":idArr[1]});
    
                        }else{
                            // execute resume on current pprogress
    
                            btnIcon.removeClass('fa-play').addClass('fa-pause')
                                .removeClass("text-success").addClass("text-info");
    
                                callHost("resume_process", {"id":idArr[1]});
    
                        }                        

                    }



                    //alert(idArr[1]);
                });

                btnPurge.attr('id',"pg_" + id);
                btnPurge.unbind('click').click(function(){

                    var idArrPrg=this.id.split('_');
                    var icoPrg = $(this).find("[name='icoPurge']");
                    var stpInfPrg = getStopInfo(idArrPrg[1]);

                    // + obj.status + "," + idArrPrg[1]

                    if(icoPrg.hasClass('text-warning')){
                        // no action is required. Just prompting the user that purging
                        // cannot be performed at the current condition
                        addModalEventNoClick(this,"No Purging",
                            stpInfPrg=="" ? "Purging is not allowed while active processing is taking place." :
                            "Purging is not allowed until the current segement encoding is complete.",
                            "trash text-info","-",null,"Ok");

                        return;
                    }

                    if(icoPrg.hasClass('text-danger')){
                        var mft = getManifestById(idArrPrg[1]);
                        addModalEventNoClick(this,"Purge Warning",
                            "<strong>You are about to delete video file '"+ mft.file +"'</strong>.<br/>Do you want to contiue?",
                            "trash text-danger","Purge",function(e){
                                
                                var resp = callHost("purge_file",{"id":$(e).attr('id').split('_')[1]});
                                var respObj = JSON.parse(resp);
                                if(respObj["result"]=="success"){
                                    //alert("Archiving file successful.");
                                    //$('#listCompleted').remove('#'+respObj["id"]);
                                    setTimeout(function(){
                                        location.reload();
                                    },500);
                                    
                                    // remove table row
                                }else{
                                    alert(respObj["message"]);
                                }  
        
                                
                                //alert('purge ' + $(e).attr('id').split('_')[1]);

                            },"Close");
                        
                        return;
                    }                    

                });
                

                if(interrup.length!=0){
                    icon.removeClass('fa-pause').addClass('fa-play')
                        .removeClass("text-info").addClass("text-success");
                }else{
                    icon.removeClass('fa-play').addClass('fa-pause')
                        .removeClass("text-success").addClass("text-info");
                }                

            }else{  // end of not procRowFound

            }






            /*
            var stp=currTR.find('#stp_'+id);
            stp.unbind("click");
            stp.click(function(){
                var idArr=this.id.split('_');
                alert(idArr[1]);
            })
            */

        }
        
    }
}catch(e){


}

    winResize();

}

function testClick123(e){
    //alert($(e).parent().attr('id'));
    alert('ggg');
}

function getManifestById(id){
    for(var i=0;i<enc.length;i++){
        var mft = enc[i];
        if(mft.id == id) return mft;
    }
    return null;
}


function addModalEventNoClick(obj,title,message,iconClass,posText,posAction,negText,negAction){
    $('#btnContinue').unbind("click").click(function(){
        posAction(obj);
    }).html(posText ? posText : "Continue")
    .css('display',(posText == '-'?'none':'inline'));

    $('#btnStop').unbind("click").click(negAction)
        .html(negText ? negText : "Close")
        .css('display',(negText == '-'?'none':'inline'));

    $('#alertTitle').html(title);
    $('#alertBody').html(message);

    $('#alertIcon').removeClass().addClass('fa fa-'+iconClass);
}
function addModalEvent(obj,title,message,iconClass,posText,posAction,negText,negAction){
    $(obj).unbind("click")
    .click(function(){
        addModalEventNoClick(obj,title,message,iconClass,posText,posAction,negText,negAction);
    });

}


function updateProgress(e) {
    //document.getElementById('testPrompt').value = 'Params: ' + e.currentItem + ', ' + e.totalItems;
}

function getStopInfo(id){
    return callHost("get_stop_info", {"id":id});
}

function callTest() {

    var sel = $('td[colspan=5]').parents("tr");
    //alert(sel.length);
    callHost("check_files", {})
}

function purgeComplete(e){
    alert(e.id);
}

function convertSizeWithUnit(sizeInBytes)
{
    var size=0;
    var unit=0;
    if (sizeInBytes < 1000)
    {
        size = sizeInBytes  
        unit = "b";
    }
    else if (sizeInBytes >= 1000 && sizeInBytes < 1000000)
    {
        size = (sizeInBytes / 1000.0) 
        unit = "Kb";
    }
    else if (sizeInBytes >= 1000000 && sizeInBytes < 1000000000)
    {
        size = (sizeInBytes / 1000000.0) 
        unit = "Mb";
    }
    else if (sizeInBytes >= 1000000000 && sizeInBytes < 1000000000000)
    {
        size = (sizeInBytes / 1000000000.0) 
        unit = "Gb";
    }
    else if (sizeInBytes >= 1000000000000 && sizeInBytes < 1000000000000000)
    {
        size = (sizeInBytes / 1000000000000.0) 
        unit = "Tb";
    }
    else if (sizeInBytes >= 1000000000000000 && sizeInBytes < 1000000000000000000)
    {
        size = (sizeInBytes / 1000000000000000.0) 
        unit = "Pb";
    }
    else
    {
        size = (sizeInBytes / 1000000000000000000.0) 
        unit = "Eb";
    }
    return (unit == "b" ? size : size.toFixed(2)) + " " + unit.toUpperCase();
} 

