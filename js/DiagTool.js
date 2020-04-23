$(document).ready(function () {

    startDiagnose();
    //checkNetwork();
    testNetwork();
});

var checkNetwork_ = 0;
var checkedActive_ = false;
function checkNetwork() {
    if (checkNetwork_) clearTimeout(checkNetwork_);
    $.ajax({
        url: 'VideoData.aspx?acn=tnet',
        beforeSend: function () {
            ;
        },
        success: function (data) {
            alert('data:' + data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            // if error occured, set status of all items in the queue to retry and set flag that all uploads are suspended
            alert('errorThrown:' + errorThrown)
        }
    }).done(function (data) {
        
    });
    checkNetwork_ = setTimeout("checkNetwork()", 5000);
}


function testNetwork() {

    if (checkNetwork_) clearTimeout(checkNetwork_);

    try {

        var xhr = new XMLHttpRequest();

        xhr.open('POST', 'VideoData.aspx?acn=tnet', true)
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        var params = 'dt=' + (new Date());

        xhr.onload = function (e) {
            alert(e.target.readyState);
            if (e.target.readyState == 4) {
                alert('resp:' + e.target.responseText);
            }
        }

        xhr.onerror = function () {
            alert('an error has occured');
        }

        xhr.send(params);

        checkNetwork_ = setTimeout("testNetwork()", 5000);

    } catch (eee) {

        alert('Error:' + eee.message);

        if (checkNetwork_) clearTimeout(checkNetwork_);
        checkNetwork_ = setTimeout("testNetwork()", 5000);
    }

}

function startDiagnose() {

    // assign events

    $('#btnTest').click(function () {
        //alert($('#txtMemo1').val());
        var postData = { name: 'LTXT'
            , memo1:'Another smaple text'
            , memo2: encodeURIComponent($('#txtMemo1').val())
            , memo3: 'Sample text.'
            , tm: Date()
        };

        var saveData = $.ajax({
            type: 'POST',
            url: "DiagToolData.aspx?acn=diagmemo",
            data: postData,
            success: function (data) {
                var json = JSON.parse(data);
                alert(json.result + ' , ' + unescape( json.msg));
                //alert(json.result);
            },
            beforeSend: function () {
                //alert('before sending data...');
            }
        });

        saveData.error(function () {
            alert("Something went wrong");
        });


    });

    displayAttempt();

}


function displayAttempt() {
    var html = '';
    
    if (localStorage.getItem('attempt')) {
        html += localStorage.getItem('attempt');
    }

    if (localStorage.getItem('attemptError')) {
        html += (html ? '<br/>' : '') + localStorage.getItem('attemptError');

    }

    if (html) {
        $('#attemptDetails').html(html);
    }
}