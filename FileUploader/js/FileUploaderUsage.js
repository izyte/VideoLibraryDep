// beforeChunk, whileChunk, afterChunk, beforeUpload, afterUpload

function useUploadFile(fileId) {
    uploadFile({

        files: document.getElementById(fileId),

        beforeUpload: useBeforeUpload,
        whileUpload: useWhileUpload,
        afterUpload: useAfterUpload,

        beforeChunk:useBeforeChunk,
        whileChunk: useWhileChunk,
        afterChunk: useAfterChunk,

        onRetry:useOnRetry,

        fileParent: document.getElementById('fldParent').value,
        targetName: document.getElementById('fldTarget').value,
        fileTag: document.getElementById('fldTag').value,

        httpResponse: httpOnLoad
    })
}

function useBeforeChunk(file) {

}

function useWhileChunk(file, start, end) {

}

function useAfterChunk(file, chunks) {

}

function useBeforeUpload(file, chunks) {

}

function useWhileUpload(file, chunks, chIdx, url) {
    //
    
    setTimeout(() => {
        var prg = document.getElementById('progressBar');
        var prc = document.getElementById('percentage');
        var urlF = document.getElementById('urlInitial');
        var urlC = document.getElementById('urlCurrent');
        var bArr = document.getElementById('txtBytes');

        var perc = (100 * (chIdx + 1) / chunks.length);
        
        prg.style.width = perc + '%';

        prc.innerHTML = Math.round(perc) + " % ";

        if (chIdx == -1) {
            urlF.value = url;
        } else {
            urlC.value = url;
            
        }

        if (chIdx == 0) {
            var ts = '';
            var cnk = chunks[parseInt(chIdx)];
            for (var bIdx = 0; bIdx < 100; bIdx++) {
                ts += (ts ? ', ' : '') + bIdx + ':' + chunks[0][4] + ':';// + String.fromCharCode(chunks[0][bIdx]);
            }
            bArr.value = ts;

        }


    }, 10);
}

function useAfterUpload(file, chunks) {
    setTimeout(() => {
        alert(file.name + " file Upload complete!");
    }, 15);
    
}

function useOnRetry(file, blobs, reason) {
    
}

function httpOnLoad(e) {
    if (e.target.readyState != 4) return;
    console.log(e.target.responseText);
}

function cancelUpload() {
    alert('Cancel upload!');
}