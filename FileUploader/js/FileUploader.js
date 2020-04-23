var HTTP_STATUS_ERROR = 0;
var HTTP_STATUS_OK = 200;
var HTTP_STATUS_SERVICE_UNAVAILABLE = 503;
var HTTP_STATUS_NOT_FOUND = 404;
var HTTP_READY_STATE_DONE = 4;

//var BYTE_PER_CHUNK = 256 * 1;

// (maximum value=int.MaxValue ... 2147483647);
//var BYTE_PER_CHUNK = 1024000.0 / 2;  // 512kb
var BYTE_PER_CHUNK = 1024000.0 / 2;  // 512kb

//var BYTE_PER_CHUNK =1024000.0;  // 1mb

function uvl(origVal, newVal) {
    return (origVal == undefined ? newVal : origVal);
}

function uploadFile(params) {

    var fl = params.files;
    var targetName = uvl(params.targetName, '');
    var fileTag = uvl(params.fileTag, '');
    var fileParent = uvl(params.fileParent,'');
    var beforeChunk = params.beforeChunk;
    var whileChunk = params.whileChunk;
    var afterChunk = params.afterChunk;
    var beforeUpload = params.beforeUpload;
    var whileUpload = params.whileUpload;
    var afterUpload = params.afterUpload;
    var httpResponse = params.httpResponse;

    var retryDelay = params.retryDelay ? params.retryDelay : 5000;
    var onRetry = params.onRetry;


    if(fl.files.length==0){
        alert('no file selected!');
        return;
    }

    var uploadComplete = false;

    var file = fl.files[0];

    // create chunks of the file selected
    var FILE_SIZE = file.size;
    var chunks = [];

    var start = 0;
    var end = BYTE_PER_CHUNK;

    if (beforeChunk) beforeChunk(file)

    while (start < FILE_SIZE) {

        //chunks[chunks.length] = { INDEX: chIdx, BLOB: blob.slice(start, end), NAME: blob.name, FILESIZE: SIZE };
        chunks[chunks.length] = file.slice(start, end);

        if (whileChunk) whileChunk(file, start, end);

        start = end;
        end = start + BYTE_PER_CHUNK;

    }

    if (afterChunk) afterChunk(file, chunks);

    if (beforeUpload) beforeUpload(file, chunks);

    var retryUploadChunk = 0;

    var retryUpload = function (file, blobs, reason) {
        console.log("Retry uploading chunk because ..." + reason + ".");
        if (retryUploadChunk) clearTimeout(retryUploadChunk)
        if (onRetry) onRetry(file, blobs, reason);
        retryUploadChunk = setTimeout(() => { uploadChunk(file, blobs, -1); }, retryDelay);
    }

    var uploadChunk = function (file, blobs, bIdx) {


        //if (bIdx > 3 || bIdx>=blobs.length) return;   // process only the first element
        if (bIdx >= blobs.length) {
            //alert("Upload complete!");
            if (afterUpload) afterUpload(file, chunks);
            return;   // process only the first element
        }


        var xhr = new XMLHttpRequest();


        //xhr.timeout = 60000;
        //xhr.timeout = 6000;
        xhr.timeout = 0;

        xhr.onprogress = function (e) {
            console.log("=>OnProgress..." + e.target.status);
            if (e.target.status == HTTP_STATUS_NOT_FOUND) {
                console.log("Cannot find requested page.")
            } else if (e.target.status == HTTP_STATUS_SERVICE_UNAVAILABLE) {
                
                retryUpload(file, blobs,"Service unavailable");
            } else {
                // 
            }
        }

        xhr.onload = function (e) {
            if (e.target.readyState == HTTP_READY_STATE_DONE && e.target.status == HTTP_STATUS_OK) {

                console.log("=>OnLoadResponse (" + e.target.status + ")")
                console.log(e.target);

                // Convert response text to JSON object
                var respObj = JSON.parse(e.target.response);
                if (respObj.errMessage.length != 0) {
                    // Error has occured. Abort subsequent processes
                    alert(respObj.errMessage);
                    return;
                }



                
                //processResult.

                console.log(respObj);
                if (respObj.nextBlobIndex != -1) {
                    uploadChunk(file, blobs, respObj.nextBlobIndex);
                } else {
                    // start call is sent
                    if (respObj.isUploadComplete) {
                        
                    } else {
                        uploadChunk(file, blobs, bIdx + 1);
                    }
                }


            } else if (e.target.status == HTTP_STATUS_NOT_FOUND) {
                console.log("=>OnLoadResponse (Cannot find requested page.)");
            }
        }

        xhr.onerror = function (e) {
            // error will likely occur when there is an internet outage or the server is not reachable
            console.log("=>OnError status: " + e.target.status + " , ready state: " + e.target.readyState);
            console.log(e.target);

            retryUpload(file, blobs,"Error uploading chunk");
        }

        xhr.onabort = function (e) {
            console.log("=>OnLoadAbort" + e.target.status)
        }

        xhr.onloadend = function (e) {
            console.log("=>OnLoadEnd" + e.target.status)
        }
        
        xhr.onloadstart = function (e) {
            console.log("=>OnLoadStart" + e.target.status)
        }

        xhr.ontimeout = function (e) {
            //alert('Timout exceeds: ' + e.target.timeout);
            console.log("=>OnTimeout:" + e.target.status + ", "  + e.target.timeout);
        }

        var blob = null;

        console.log("bIdx: " + bIdx);

        if (bIdx != -1) {
            blob = blobs[bIdx]; // get blob object only if already sending chunks and not during sending the header information
        } else {
            // 
        }

        if (targetName.length != 0) {
            if (targetName.substr(targetName.length - 2, 2) == ".*") {
                targetName = targetName.substr(0, targetName.length - 1) + file.name.split('.').pop();

            }
        }


        var firstBlob = blobs[0];
        var lastBlob = blobs[blobs.length - 1];
        var url = "FileUploader.asmx/ReceiveChunk?idx=" + bIdx + "&lm=" + getStringDate(new Date(file.lastModified), true, true) + "&fs=" + file.size +
                            "&tag=" + fileTag + "&parent=" + fileParent +
                            (bIdx == -1 ? "&tc=" + blobs.length + "&tfn=" + targetName +
                            "&fbs=" + firstBlob.size + "&lbs=" + lastBlob.size +
                             "&fn=" + file.name : "&cs=" + blob.size);


        if (whileUpload) whileUpload(file, blobs, bIdx, url);


        /*
        parent = parent location where the destination folder will be created. if not supplied, the destination folder will
                become a child of the UPLOAD_LOCATION set in web.config.
        tag = destinatopm folder where the file will be processed and stored. if not supplied,
                <lastModified (lm)>_<fileSize (fs)> will be used as destination folder
        tfn = target filename tu be used as destination filename, 
                if not supplied original filename will be used in the destination.

        */

        xhr.open('POST', url, true);

        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        try{
            xhr.send(blob);
        } catch (e) {
            alert('Error!')
            //alert(e.message);
        }

    }

    uploadChunk(file, chunks, -1);

    console.log('Processing file: ' + file.name + ', size: ' + FILE_SIZE + ', chunks: ' + chunks.length +
        ', start length:' + chunks[0].size + ', end length:' + chunks[chunks.length - 1].size);

    console.log(file);

}

function getStringDate(dateValue,withTime,withMils) {
    if (!withTime) withTime = false;
    if (!withMils) withMils = false;

    var dt = dateValue;

    var ret = dt.getFullYear() + p2(dt.getMonth() + 1) + p2(dt.getDate());
    if (withTime) {
        ret += p2(dt.getHours()) + p2(dt.getMinutes()) + p2(dt.getSeconds());
        if (withMils) ret += p3(dt.getMilliseconds());
    }

    return ret;

}

function p2(n) {
    return (n < 10 ? "0" : "") + n.toString();
}
function p3(n) {
    return (n < 10 ? "00" : (n < 100 ? "0" : "")) + n.toString();
}


function afterBase64(b64) {
    //console.log(b64);
    //console.log("Break\n");
    console.log("Base64 Length:" + b64.length);
}

function blobToBase64(blob, callback,noSplit) {
    var reader = new FileReader();
    if (noSplit == null) noSplit = false;
    reader.onload = function () {
        var dataUrl = reader.result;
        var base64 = dataUrl;

        if (!noSplit) base64 = dataUrl.split(',')[1];

        callback(base64);
    };
    reader.readAsDataURL(blob);
};