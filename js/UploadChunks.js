//var ooo = {$k:'encoding',_k:'exclude',__k:'always'}
//for(kkk in ooo){
//    alert(kkk + ' : ' + ooo[kkk]);
//}
//alert('hello');

//function UploadFileChunks(file, groupInfo, assetInfo, url, onChunkUploaded, onCompleted) {
function UploadFileChunks(file, data, url, onChunkUploaded, onCompleted) {

    /************************************************************************************************************
    * file - file object to be uploaded
    * group - parent group id of the file to be uploaded
    * onChunkUploaded - event to fire up each time a chunk is uploaded (takes manifest data after chunk upload
    * onCompleted - event to fire up when the file upload has been completed
    * url - server-side script page which processes the file chunk uploading
    *
    * manifest object = {SIZE_UPLOADED:<long>, TOTAL_SIZE:<long>, COMPLETED:<boolean>, FILENAME:<string>}
    *************************************************************************************************************/

    // LOGIN_INFO.uid


    /*

    var attrib = {
        __grp: getGroupID(), __ast: getAssetID(), $vt: '', $ds: '', $cm: '',
        grpfid: getGroupID(), astfid: getAssetID(), uid: LOGIN_INFO.uid,
        _astName: getAssetName(), ioi: '', $itp: '', $mnm: '', idt: ''
    };


    data:{  
            ast:{value:1,persist:false,encode:false}
            , grp:{value:1,persist:false,encode:false}
            , vt:{value:1,persist:false,encode:true}
            , ds:{value:'',persist:false,encode:true}
            , cm:{value:'',persist:false,encode:true}
            , grpfid:{value:getGroupID(),persist:true,encode:false}
            , astfid:{value:LOGIN_INFO.uid,persist:true,encode:false}
            , uid:{value:getAssetID(),persist:true,encode:false}
            , astName:{value:'',persist:false,encode:false,exclude:true}
            , ioi:{value:'',persist:false,encode:false}
            , itp:{value:'',persist:false,encode:true}
            , mnm:{value:'',persist:false,encode:true}
            , idt:{value:'',persist:false,encode:false}
        }

    */


//    var uid_ = '*SYSTEM*';

//    if (typeof (LOGIN_INFO) != 'undefined') {
//        if (typeof (LOGIN_INFO.uid) != 'undefined') {
//            uid_ = LOGIN_INFO.uid;
//        }
//    }

    //var BYTE_PER_CHUNK = 1024 * 1024; // 1MB
    var BYTE_PER_CHUNK = 1024 * 128; // 1MB

    //if (isFromTestSite() || isFromDevSite()) {
    if (isFromTestSite()) {
        BYTE_PER_CHUNK = 1024 * 10;
    }

    var SIZE = file.size;
    //var FILENAME = file.name.replace(/#/gi, '[S]').replace(/&/gi, '[A]').replace(/©/gi, '[C]').replace(/®/gi, '[R]').replace(/™/gi, '[T]');

    var FILENAME = file.name;

    var start = 0;
    var end = BYTE_PER_CHUNK;var t

    var chunks;
    var uplBytes=0;

    this.fileObject = file;

    var Attempt_ = 0;
    var isRetrying_ = false;

    var isCompleted_ = false;
    var isUploading_ = false;
    var isOnQueue_ = false;

    var status_ = 'Req\'d Info.';

    var mainClass_ = this;
    var QObject_ = null;

    var stopped_ = false;
    //this.stop = function () { stopped_ = true; }

    this.stop = function (sta) {
        changeStatus('Stopped');
        stopped_ = true;
    }

    var retryUpload_ = false;
    var retryUploadHandle_ = 0;
    var retryUpload = function (caller) {

        retryUpload_ = true;
        try {


            if (typeof (caller) == 'undefined') caller = 'default';


            Attempt_++;
            stopped_ = true;
            //changeStatus('Ready');
            changeStatus('Retrying');

            var attStr = '';

            if (localStorage.getItem('attempt')) {
                attStr = localStorage.getItem('attempt');
            }

            attStr += (attStr ? '<br/>' : '') + '(' + (new Date()) + ')(' + file.name + ')' + caller + ' attempt (' + Attempt_ + ')';

            localStorage.setItem('attempt', attStr);
        } catch (ee) {

            var errMsg = '';

            if (localStorage.getItem('attemptError')) {
                errMsg = localStorage.getItem('attemptError');
            }

            errMsg += (errMsg ? '<br/>' : '') + '(' + (new Date()) + ')(' + file.name + ')' + 'error retrying on attempt (' + Attempt_ + ')';

            localStorage.setItem('attemptError', errMsg);
        }


    }

    this.retry = function (msg) {
        if (typeof (msg) == 'undefined') msg = ' force retry!!!';
        clearRetry()
        retryUpload(msg);
    }

    var isPartial_ = false;
    this.isPartial = function (p) {
        if (typeof (p) != 'undefined') isPartial_ = p;
        return isPartial_;
    }

//    var title_ = ''; //  cleanTitle(file.name);

//    this.title = function (t) {
//        if (typeof (t) != 'undefined') title_ = t;
//        return title_;
//    }

//    var description_ = '';
//    this.description = function (d) {
//        if (typeof (d) != 'undefined') description_ = d;
//        return description_;
//    }

//    var comments_ = '';
//    this.comments = function (c) {
//        if (typeof (c) != 'undefined') comments_ = c;
//        return comments_;
//    }
//    

//    // parse asset parameter <asset:asset desc>
//    assetArr = assetInfo.split(':');
//    var asset_ = assetArr[0];

//    var assetName_ = '';
//    if (assetArr.length >= 2) {
//        assetName_ = assetArr[1];
//    }

//    this.assetName = function (name) {

//        if (typeof (name) != 'undefined') assetName_ = name;

//        return assetName_;
//    }

//    this.asset = function (id) {
//        if (typeof (id) != 'undefined') {
//            asset_ = id;
//        }

//        return asset_;
//    }

//    var group_ = 45488;
//    if (typeof (groupInfo) != 'undefined') group_ = groupInfo;
//    this.group = function (id) {
//        if (typeof (id) != 'undefined') {
//            group_ = id;
//        }

//        return group_;
//    }

    var attrib_ = data;
    //var params_ = {};

    this.attrib = function (attr, val) {
        if (typeof (attr) != 'undefined' && typeof (val) != 'undefined') {
            // set attribute value attrib_[attr] = val
            attrib_[attr].value = val;
        } else if (typeof (attr) == 'string') {
            // return value of attribute attrib_[attr]
            return attrib_[attr].value;
        } else if (typeof (attr) == 'object') {
            // replace attrib_ with attr
            attrib_ = attr;
        } else {
            return attrib_
        }
    }

    var saveToLocal = function () {
        // save file chunks and meta data
        //alert('saveToLocal...!');
        //alert(JSON.stringify(attrib_));

        attrib_ = JSON.parse(JSON.stringify(attrib_))


        //        for (var key in attrib_) {
        //            alert(key + ':' + attrib_[key]);
        //        }

        var i, ch;
        var max = 5;
        chunkToBase64();
        alert('start blob:' + max);
        //        for (i = 0; i < max; i++) {
        //            ch = chunks[i];
        //            chunkToBase64(ch);
        //        }


    }

    var chunkToBase64 = function (chunk) {

        if (typeof (chunk) == 'undefined') chunk = chunks[0];

        var rdr = new FileReader();

        rdr.onload = function (event) {
            //alert('next (' + (chunk.INDEX + 1) + ') blob loaded:(' + file.name + ' : ' + chunk.INDEX + ')\n' + event.target.result);
            var b64 = event.target.result;
            if (chunk.INDEX >= (chunks.length-1)) {
                alert('last chunk has been converted!!! (' + b64.length + ') ' + chunks.length);
                return;
            }
            chunkToBase64(chunks[chunk.INDEX + 1]);
            //            if (chunk.INDEX < max) {
            //                alert('blob loaded:(' + file.name + ' : ' + chunk.INDEX + ')\n' + event.target.result);
            //                chunkToBase64(chunks[chunk.INDEX + 1]);
            //            } else {
            //                alert('last chunk has been converted!!!');
            //            }
        }

        rdr.readAsDataURL(chunk.BLOB);

    }

//    var chunkToBase64 = function (chunk) {
//        try {
//            var rdr = new FileReader();
//            rdr.onload = function (event) {
//                alert('blob loaded:(' + file.name + ' : ' + chunk.INDEX + ')\n' + event.target.result)
//            }

//            rdr.readAsDataURL(chunk.BLOB);
//        } catch (ee) {
//            alert('Error!!' +  ee.message);
//        }
//    }


    this.saveMetaData = function () {
        saveToLocal();
    }

    var getAttribData = function (chk) {
        if (typeof (chk) == 'undefined') chk = true;

        var retVal = '';
        var excl;
        for (var key in attrib_) {
            var attr = attrib_[key];
            if (typeof (attr.exclude) != 'undefined') {
                excl = attr.exclude;
            } else {
                excl = false;
            }
            if ((chk || attr.persist) && !excl) {

                // on initial check, include all attributes except for that are tagged for exclusion
                // on upload chunks, include only attributes persist property

                retVal += '&' + key + '=' + (attr.encode ? encodeURIComponent(attr.value) : attr.value);

            }
        }

        return retVal;

    }

    var retrySendingFile = function () {
        Attempt_++; 
        isRetrying_ = true;
        alert('Timeout occured. Resend file...');
    }

    var changeStatus = function (sta) {

        if (retryUpload_) retryUpload_ = false;   // atutomatically clears retry status

        var noChange = false;
        if (typeof (sta) != 'undefined') {
            noChange = (status_ == sta)
            if (!noChange) status_ = sta;
        }

        if (typeof (onStatusChange) == 'undefined') {
            return;
        } else if (!noChange) {
            onStatusChange(mainClass_);
        }


    }

    this.chgStatus = function (sta, resetOutage) {
        if (typeof (resetOutage) == 'undefined') resetOutage = false;
        if (resetOutage) networkOutage_ = false;
        changeStatus(sta);
    }

    var networkOutage_ = false;
    this.networkOutage = function () {
        return networkOutage_;
    }


//    var cleanTitle = function (title) {

//        title = title.replace(/_/gi, ' ');

//        if (title.length > 5) {
//            if (title.substr(title.length - 4, 1) == '.') {
//                title = title.substr(0, title.length - 4);
//            }
//        }

//        return title;
//    }



    this.isCompleted = function () { return isCompleted_ }
    this.isUploading = function () { return isUploading_ }
    this.status = function (sta) {
        if (typeof (sta) != 'undefined') status_ = sta;
        return status_
    }

    this.fileName = function () { return this.fileObject.name }

    this.defaultTitle = function () {

        var fn = this.fileObject.name;
        var ext = fn.replace(/^.*\./, '').toLowerCase();

        return fn.substr(0, fn.length - (ext.length + 1));
    }

    this.QObject = function (e) {
        if (typeof (e) != 'undefined') {
            QObject_ = e;
        } else {
            return QObject_
        }
    }



    this.reset = function () {
        status_ = 'Ready';
        stopped_ = false;
    }

    var stopped_ = false;

    var paused_ = false;
    var status_prev = '';
    this.pause = function (mode) {
        if (typeof (mode) == 'undefined') mode = true;

        if (!paused_ && mode) {
            status_prev = status_;
        }

        if (paused_ != mode) {
            // change on pause status
            if (mode) {
                changeStatus('Paused');
            } else {
                changeStatus(status_prev);
            }

        }


    }


    this.sizeUploaded = function () { return uplBytes }
    this.fileSize = function () { return this.fileObject.size }

    this.isOnQueue = function (val) {
        if (typeof (val) != 'undefined') isOnQueue_ = val;
        return isOnQueue_
    }


    if (typeof (url) == 'undefined')url = 'VideoUpload3.aspx';
    if (typeof (group) == 'undefined') group = 1;

    var grpFID, astFID;

    var uploadFileTimeout_ = 0;
    var uploadFile = function (blobOrFile, idx, vid) {

        ////// pending  retry!!!
        if (retryUpload_) return;

        if (uploadFileTimeout_) clearTimeout(uploadFileTimeout_);

        var uurl = url;
        var params = null;
        try {

            var xhr = new XMLHttpRequest();
            var obj;

            if (!blobOrFile) {

                //                params = 'grp=' + group_ + '&ast=' + asset_ + '&chk=1&fn=' + encodeURIComponent(FILENAME) + '&sz=' + SIZE + '&cnt=' + chunks.length + '&bpc=' + BYTE_PER_CHUNK +
                //                         '&vt=' + title_ + '&ds=' + encodeURIComponent(description_) + '&cm=' + encodeURIComponent(comments_) +
                //                         '&grpfid=' + group_ + '&astfid=' + asset_ + '&uid=' + uid_ + '&tm=' + (new Date());


                params = 'attm=' + Attempt_ + '&tm=' + (new Date()) + '&chk=1&fn=' + encodeURIComponent(FILENAME) + '&sz=' + SIZE + '&cnt=' + chunks.length + '&bpc=' + BYTE_PER_CHUNK + getAttribData(true);

                //alert('changeStatus:'+changeStatus + ', getAttribData:'+ getAttribData +' params:' + params); 
                //alert(params);return;

                xhr.open('POST', uurl, true)

                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            } else {

                //                uurl += '?grp=' + group_ + '&ast=' + asset_ + '&cnt=' + chunks.length + '&idx=' + idx + '&fn=' + encodeURIComponent(FILENAME) + '&sz=' + SIZE + '&vid=' + vid +
                //                              '&grpfid=' + grpFID + '&astfid=' + astFID + '&uid=' + attrib_['uid'] + '&csz=' + blobOrFile.size + '&tm=' + (new Date());

                uurl += '?attm=' + Attempt_ + '&tm=' + (new Date()) + '&cnt=' + chunks.length + '&idx=' + idx + '&fn=' + encodeURIComponent(FILENAME) + '&sz=' + SIZE + '&vid=' + vid +
                              '&grpfid=' + grpFID + '&astfid=' + astFID + '&csz=' + blobOrFile.size + getAttribData(false);

                //alert(uurl);return;

                changeStatus('Uploading');
                isUploading_ = true;

                xhr.open('POST', uurl, true)

            }


            try {

                xhr.onload = onFileUploaded;

                xhr.onerror = function () {
                    if (!networkOutage_) {
                        clearRetry();
                        retryUploadHandle_ = setTimeout(function () {
                            networkOutage_ = true;
                            retryUpload('retry because network outage');
                        }, 10);
                    }
                }

                if (!blobOrFile) blobOrFile = params;

                xhr.send(blobOrFile);

                // time response from the server and if no response returned within the given duration,
                // try resending the file (include initial manifest checking)....

                //uploadFileTimeout_ = setTimeout(retrySendingFile, 120000);


                // after 4 minutes of inactivity, call retry
                clearRetry();
                retryUploadHandle_ = setTimeout(function () {
                    retryUpload('after 1.5 minutes inactivity');
                }, 90000);


            } catch (eee) {

                changeStatus('Error: Upload, ' + eee.message);
                //alert('Error uploading chunk...:' + eee.message);


            }

        } catch (ee) {
            alert('upload error: ' + ee.message);
        }
    }

    uploadFile.hostObject = this;

    var b64toBlob = function (b64, contentType) {

        if (typeof (contentType) == 'undefined') contentType = '';

        var byteCharacters = atob(b64);

        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        return new Blob([byteArray], { type: contentType });
    }


    var getFileChunks = function (blob) {

        var chIdx = 0;

        try {

            chunks = [];

            while (start < SIZE) {

                chunks[chunks.length] = { INDEX: chIdx, BLOB: blob.slice(start, end), NAME: blob.name, FILESIZE: SIZE };

                start = end;
                end = start + BYTE_PER_CHUNK;

                chIdx++;
            }


////////////            var reader = new FileReader();
////////////            reader.onload = function (event) {
////////////                //alert('blob loaded: ' + event.target.result)
////////////                //$('#debugDetails').html(event.target.result);
////////////                //alert('blob loaded...' + event.target.result);
////////////                //$('#debugDetails').html(event.target.result);
////////////                //alert(blob.size + ' , '  + event.target.result.length);
////////////                //alert(event.target.result.length);
////////////                var b64 = event.target.result.split('base64,')[1]; //.substr(0, 256);
////////////                $('#debugDetails').html(b64.substr(0, 256));

////////////                var blobNew = b64toBlob(b64);

////////////                chunks[chunks.length - 4].BLOB = blobNew;
////////////                alert('blobNew:' + blobNew);

////////////                alert( chunks[chunks.length - 1].BLOB + ' , ' + blobNew);

////////////            }
////////////            //alert(blob);
////////////            //var source = reader.readAsBinaryString(chunks[0].BLOB);
////////////            var source = reader.readAsDataURL(chunks[chunks.length - 4].BLOB);
////////////            //var source = reader.readAsDataURL(blob);
////////////            //var source = reader.readAsDataURL(blob);
////////////            //var source = reader.readAsDataURL(blob);
////////////            //alert(source)

////////////            /**********************************************
////////////            save chunks to local variables:
////////////            1. set variable prefix to the current user's id
////////////            2. save number of chunks
////////////            3. determine video key from combined filename and asset
////////////            3. loop through chunks and convert to base64 data
////////////            */


        } catch (ee) {
            alert('ERROR in getFileChunks: ' + ee.message);
        }

        return chunks;

    }

    var isFileNotSimilar = function () {
        return false;
    }

    this.startUploading = function () {
        //alert('startUploading...' + chunks.length);
        if (chunks.length) {
            stopped_ = false;
            grpFID = 0;
            astFID = 0;
            uploadFile();  // call uploadFile to create/retreive initial manifest
        }

    }

    var retryUploading = function () {
        alert('retryUploading...chunks.length:' + chunks.length);
        this.startUploading();
    };


    var onFileUploaded = function (e) {

        var mftErr = false;

        if (e.target) {

            var i, tblob, obj;

            if (e.target.readyState == '4') {

                clearRetry();

                // donw
                var rstr = e.target.responseText;

                // check if response is a valid one and not an error response from the server


                var mft = getTagContent(rstr, 'MANIFEST');
                var idx;

                if (mft.length) {

                    // manifest extracted

                    idx = parseInt('0' + getTagContent(mft, 'CHUNKINDEX'));

                    var mfName = getTagContent(mft, 'FILENAME');
                    var mfVID = parseInt('0' + getTagContent(mft, 'VIDEOID'));
                    var mfIndex = parseInt('0' + getTagContent(mft, 'INDEX'));
                    var mfChunks = parseInt('0' + getTagContent(mft, 'CHUNKS'));
                    var mfSize = parseInt('0' + getTagContent(mft, 'SIZE'));
                    var mfSizeUploaded = parseInt('0' + getTagContent(mft, 'SIZEUPLOADED'));
                    var mfComplete = (getTagContent(mft, 'COMPLETE') == 'YES');
                    var mfUploaded = getTagContent(mft, 'UPLOADED').split(',');
                    var mfAction = getTagContent(mft, 'ACTION');
                    var mfAStatus = getTagContent(mft, 'ASTATUS');
                    var mfGroupFID = getTagContent(mft, 'GROUPFID');
                    var mfAssetFID = getTagContent(mft, 'ASSETFID');

                    var mftAttempt = parseInt('0' + getTagContent(mft, 'ATTEMPT'));
                    //alert('Attempt_:' + Attempt_ + ', ' + mftAttempt);
                    if (Attempt_ != mftAttempt) {
                        // late response from the server from earlier request(s)/chunkupload(s). Further processing
                        // must be suppressed to avoid upload inconsistencies
                        return;
                    }

                    // Attempt_
                    uplBytes = mfSizeUploaded;

                    if (mfAction == 'CHK') {

                        grpFID = mfGroupFID;
                        astFID = mfAssetFID;

                        //                        alert('mfGroupFID:' + mfGroupFID + ', mfAssetFID:' + mfAssetFID);
                        //                        changeStatus('Complete');
                        //                        return;


                        if (mfSizeUploaded == mfSize) {
                            // manifest status is completed. this means that the 
                            // current file being uploaded was already completely 
                            // uploaded in previous session
                            changeStatus('Duplicate');
                            return;
                        }


                    } else {
                        if ((mfAStatus == 'COMPLETE') || (mfSizeUploaded == mfSize)) {
                            //alert('Upload complete!!!');
                            isCompleted_ = true;
                            isUploading_ = false;
                        }
                    }

                    if (typeof (onFileUploadProgress) != 'undefined') {
                        onFileUploadProgress(mainClass_);
                    }

                    // call this after the onFileUploadProgress to trigger onChangeStatus event after 
                    // all client process are completed


                    if (isCompleted_) {
                        clearRetry();
                        changeStatus('Complete');
                        return;
                    }

                    if (isCompleted_) return;

                    //alert('uplBytes:' + uplBytes + ', mfIndex:' + mfIndex);
                    //alert('getTagContent(mft!!!, "VIDEOID"):' + getTagContent(mft, 'VIDEOID'))

                    if (mfComplete) {

                        // the confirmation prompt was removed temporarily 2016/11/29 to allow
                        // sequential uploading. Instead, status is changed to "Duplicate" and 
                        // the uploading process is aborted."
                        //                        if (confirm('The file selected was already completely uploaded.\n\n' +
                        //                                'Click [OK] to re-upload or [CANCEL] to abort.')) {
                        //                            uplBytes = 0;
                        //                            obj = chunks[0];
                        //                        }

                        obj = null;
                        clearRetry();
                        return;


                    } else {
                        obj = chunks[0];

                        if (chunks.length == mfChunks && obj.FILESIZE == mfSize) {
                            // upload file from the next index to completion
                            //alert('continue upload...');
                            obj = chunks[uplBytes ? mfIndex + 1 : mfIndex];

                        } else {
                            // file characteristics do not match, upload entire file
                            //alert('upload from index 0...');

                            //                            if (confirm('Properties of partially uploaded file are not similar to the one to be uploaded.\n\n' +
                            //                                'Click [OK] to re-upload or [CANCEL] to abort.')) {
                            //                                uplBytes = 0;
                            //                                obj = chunks[0];
                            //                            } else {
                            //                                obj = null;
                            //                            }


                            obj = null; // for upload to abort because the partially uploaded file is not the same
                            // as the one being uploaded

                            changeStatus('Inconsistent');
                            clearRetry();
                            return;

                        }

                    }

                    //if (paused_) obj = null;
                    if (stopped_) {
                        obj = null;
                        //stopped_ = false;
                        return;
                    }

                    if (obj) {

                        //var uplf = this.onload.hostObject.uploadFile;   // resolve uploadFile from the xttp request object

                        setTimeout(function () {
                            try {
                                if (!stopped_) {
                                    uploadFile(obj.BLOB, obj.INDEX, mfVID);

                                } else {
                                    //alert('current upload stopped!!!');
                                }
                            } catch (ee) {
                                alert('error call this.uploadFile:' + ee.message);
                            }

                        }, 50);

                        return;

                    }

                    // end of manifest processing

                } else {

                    // no manifest found. there could be a server error... or connection was terminated
                    // alert('server response error!!!!');
                    // setTimeout(retryUploading, 500);

                    clearRetry();
                    retryUploadHandle_ = setTimeout(function () {
                        retryUpload('no manifest found on response');
                    }, 10);

                    mftErr = true;

                }

                if (!mftErr) {
                    // after 3 minutes of inactivity, call retry
                    clearRetry();
                    retryUploadHandle_ = setTimeout(function () {
                        retryUpload('after 1 minute inactivity');
                    }, 60000);
                }

            } else {
                //alert('response != 4 : ' + e.target.readyState);
            }
        }

    }


    var clearRetry = function () { if (retryUploadHandle_) clearTimeout(retryUploadHandle_); }


    var showProgress = function (uBytes,tBytes) {
        ;
    }

    // call internal methods

    getFileChunks(file);   // initial method call when the method is created

}

function getTagContent(strInput, tag) {

    //tag = tag.toUpperCase();
    var retVal = 'none';
    var arr = strInput.split('<' + tag + '>');

    if (arr.length != 2) {
        retVal = '';
    } else {
        arr = arr[1].split('</' + tag + '>');
        if (arr.length != 2) {
            retVal = '';
        } else {
            retVal = arr[0];
        }
    }

    return retVal;
}

