
//function fupFileSelected(e) {

//}

//function fupProgressUpdate() {

//}

//function fupUploadChunk() {

//}


var arrFiles = [null, null, null, null, null, null, null, null, null, null];
var fidx, blob, uplBytes = 0;

function avFileID() {
    // get index of available element in the blob array
    var idx;
    for(idx=0;idx<arrFiles.length;idx++){
        if(!arrFiles[idx]){
            return idx;
        }
    }
    return -1;
}

function onFileUploaded(e) {

    if (e.target) {

        var i, tblob, obj;

        if (e.target.readyState == '4') {

            // donw
            var rstr = e.target.responseText;

            var mft = getTagContent(rstr, 'MANIFEST');
            var idx = parseInt('0' + getTagContent(rstr, 'CHUNKINDEX'));

            if (mft.length) {
                // manifest extracted
                var mfName = getTagContent(mft, 'FILENAME');
                var mfIndex = parseInt('0' + getTagContent(mft, 'INDEX0'));
                var mfChunks = parseInt('0' + getTagContent(mft, 'CHUNKS'));
                var mfSize = parseInt('0' + getTagContent(mft, 'SIZE'));
                var mfSizeUploaded = parseInt('0' + getTagContent(mft, 'SIZEUPLOADED'));
                var mfComplete = (getTagContent(mft, 'COMPLETE') == 'YES');
                var mfUploaded = getTagContent(mft, 'UPLOADED').split(',');

                uplBytes = mfSizeUploaded;

                if (mfComplete) {
                    if (confirm('The file selected was already completely uploaded.\n\n' +
                                'Click [OK] to re-upload or [CANCEL] to abort.')) {
                        uplBytes = 0;
                        obj = fidx[0];
                    }
                } else {
                    obj = fidx[0];

                    if (fidx.length == mfChunks && obj.FILESIZE == mfSize) {
                        // upload file from the next index to completion
                        //alert('continue upload...');
                        obj = fidx[mfIndex + 1];

                    } else {
                        // file characteristics do not match, upload entire file
                        //alert('upload from index 0...');

                        if (confirm('Properties of partially uploaded file are not similar to the one to be uploaded.\n\n' +
                                'Click [OK] to re-upload or [CANCEL] to abort.')) {
                            uplBytes = 0;
                            obj = fidx[0];
                        } else {
                            obj = null;
                            showProgress(0, -1);
                        }


                    }

                }

                if (obj) {

                    showProgress(uplBytes, obj.FILESIZE);
                    setTimeout(function () {
                        upload(obj.BLOB, obj.NAME, obj.FILESIZE, obj.INDEX);
                    }, 50);


                }

            } else {


                //alert('e.target.responseText:'+e.target.responseText);
                if (e.target.responseText == '<MANIFEST></MANIFEST>') {
                    // if no manifest details....
                    idx = 0;
                } else {
                    idx += 1;
                }

                obj = fidx[idx];
                if (obj) {
                    //uplBytes+=
                    if (idx) uplBytes += fidx[idx - 1].BLOB.size;   // calculate uploaded bytes
                    showProgress(uplBytes, obj.FILESIZE);
                    setTimeout(function () {
                        upload(obj.BLOB, obj.NAME, obj.FILESIZE, obj.INDEX);
                    }, 50);
                } else {
                    // completed
                    uplBytes = 0;
                    showProgress(-1, -1);

                }
            }
        }
    }

}

function getTagContent(strInput, tag) {

    //tag = tag.toUpperCase();
    var retVal = 'nono';
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

function getAssetID() {
    // get asset id based on the currenty selected node on the tree
    return 87694;
}

function upload(blobOrFile, fn, sz, idx) {

    try {

        var xhr = new XMLHttpRequest();
        var obj, url;

        if (!blobOrFile) {
            // get manifest
            obj = fidx[0];
            url = 'VideoUpload3.aspx?grp=' + getGroupID() + '&chk=1&fn=' + obj.NAME + '&tm=' + (new Date());

        } else {
            
            url='VideoUpload3.aspx?grp=' + getGroupID() + '&cnt=' + (fidx.length) + '&idx=' + idx + '&fn=' + fn + '&sz=' + sz +
                                                        '&csz=' + blobOrFile.size + '&tm=' + (new Date());
        }

        xhr.open('POST', url, true)

        xhr.onload = onFileUploaded;
        xhr.send(blobOrFile);

    } catch (ee) {
        alert('upload error: ' + ee.message);
    }

}

function fileSelected(e) {
    //alert('fileSelected!!!');
    // alert('This feature is temporarily disabled.')

    //if (!e.target.files) return;
    //if (!e.target.files.length) return;

    if (!e) return;

    //var blob = e.target.files[0];
    //alert(e.files)
    if (!e.files) {
        alert('File upload is not supported on this browser!!!\nThis feature works with Google Chrome and IE 10 or Later.');
        return;
    }
    var blob = e.files[0];

    var BYTE_PER_CHUNK = 1024 * 1024; // 1MB
    var SIZE = blob.size;

    var start = 0;
    var end = BYTE_PER_CHUNK;

    var idx = 0;

//    document.getElementById('filename').innerHTML = 'Uploading '+blob.name;
//    document.getElementById('filesize').innerHTML = 'Reading...' //'0\/' + parseInt(SIZE/1024) + 'kb&nbsp;';
//    document.getElementById('perc').innerHTML = '0%';

    try {

        // divide file into chunks

        fidx = []
        while (start < SIZE) {

            //upload(blob.slice(start, end), blob.name, SIZE, idx);
            fidx[fidx.length] = { INDEX: idx, BLOB: blob.slice(start, end), NAME: blob.name, FILESIZE: SIZE };

            start = end;
            end = start + BYTE_PER_CHUNK;
            idx++;
        }
    } catch (e) {
        //console.log('ERROR:' + e.message);
        alert('ERROR:' + e.message);
    }

    if (fidx.length) {
        var obj = fidx[0];
        //upload(obj.BLOB, obj.NAME, obj.FILESIZE, obj.INDEX);
        upload();
    }
}

function showProgress(upSize, totalSize) {

    return; // temporary progress bypass

    var maxPx = 500;
    var percValFloat=upSize / totalSize;
    var percVal = parseInt(100 * (percValFloat));

    var completed = (percVal == 100 || upSize == -1);

    document.getElementById('filesize').innerHTML = completed ? 'Done.' : parseInt(upSize / 1024) + '\/' + parseInt(totalSize / 1024) + 'kb';
    document.getElementById('perc').innerHTML = ((parseInt(percValFloat*100.0*1000))/1000.0) + '%';  // (parseInt(percValFloat * 1000) / 1000) + '%';
    document.getElementById('bar').style.width = (percVal) + '%';

    if (completed) {
        try {
            if (evtReloadPage) {
                setTimeout(evtReloadPage, 200);
                //evtReloadPage();
            }
        } catch (e) { }
    }
}
