$(document).ready(function () {
    startAdmin();

});


function startAdmin() {
    try {

        $('#btnSubmitSQL').click(function () {
            var postData = { tm: Date(), name: 'VW_VIDEO_TREE_BY_PARENT', sql: $('#txtSQL').val() };
            var saveData = $.ajax({
                type: 'POST',
                url: "AdminData.aspx?acn=admupdsql",
                data: postData,
                dataType: "text",
                success: function (data) {
                    alert(data);
                },
                beforeSend: function () {
                    ;
                }
            });

        })
    } catch (e) {
        alert(e.message);
    }
}
