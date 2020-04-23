
var Initializing_ = true;
$(document).ready(function () {
    initPage();
});


function initPage(){
    //alert('hello management!!!!');
    var x = 1;
    assignEvents();
}

function unescapeJSON(j) {
    var key;
    for (key in j) {
        j[key] = unescape(j[key]);
    }
    return j;
}

function parseJSON(data) {
    var j = JSON.parse(data);
    var key;
    for (key in j) {
        j[key] = unescape(j[key]);
    }
    return j;
}

function assignEvents() {
    $('#testDownload').click(function () {

        try {
            $.ajax({
                url: 'VideoData.aspx?acn=dload&vid=50',
                beforeSend: function () {
                    ;
                }
            }).done(function (data) {
                //alert(JSON.parse + '\n' + data);
                //var dat = JSON.parse('{"f1":"v1","f2":"sdfsfsf"}');

                var dat = parseJSON(data);

                if (dat.ERR) {
                    alert(dat.ERR);
                    return;
                } else {
                    //alert('Count: ' + dat.COUNT);
                }


                alert('Size: ' + dat.SIZE + ', Filename:' + dat.PATH + '\\' + dat.FILENAME + ', B64:' + dat.B64 + ', LEN:' + dat.LEN);

                //alert(data);
                //alert(dat.ID + '\n' + dat.PATH);
                //alert(dat.f1 + ' \n ' + dat.f2 + '\n' + data);
                //alert(dat.ID + '\n\n\n' + dat.PATH);


            });

            //alert($(this).html() + ', ' + url);
        } catch (eee) {
            alert(eee.message);
        }
    });
}
