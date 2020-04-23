$.blockUI.defaults.message = '<img src="../images/busy.gif" />';
$.blockUI.defaults.centerY = true;
$.blockUI.defaults.centerX = true;
$.blockUI.defaults.css.width = '155px';
$.blockUI.defaults.css.border = '1px solid #cbcdcc';
$.blockUI.defaults.overlayCSS.backgroundColor = '#726df7';
$.maxlength.setDefaults({ showFeedback: true });
var scripts_loaded = [];
$.ajaxSetup({
    cache: true
});
var COOKIE_EXP = 90; //90 Days

// Automatically cancel unfinished ajax requests 
// when the user navigates elsewhere.
var xhrPool = [];
function Abort() { $.each(xhrPool, function (idx, jqXHR) { jqXHR.abort(); }); }
///$(document).ajaxSend(function (e, jqXHR, options) { xhrPool.push(jqXHR); });
//$(document).ajaxComplete(function (e, jqXHR, options) { xhrPool = $.grep(xhrPool, function (x) { return x != jqXHR }); });
/*
--------------------------------------------------------------------------------------------------------
--------------------------------------------APPLICATION INITIALIZATION AND UNLOADING  START----------
--------------------------------------------------------------------------------------------------------
*/
var u_id = -1;
var u_role = -1;
var u_name = '';
var c_m = ($.cookie('_cm') ? $.cookie('_cm') : ''); //cURRENT MODULE
var c_rpt = 'AN_01'; //cURRENT REPORT
function PageInit() {   
    usrListLoad();
    usrparListLoad();
    sizeContent();
    $(window).resize(sizeContent);//Window size
}

/*Layout global variables */
var m_l; //Storage for main splitter layout.
var w_l; //Storage for west main splitter layout.
function InitControls() {
    //$.cookie.defaults = { expires: 30 };
    $('#main_hdr').show();
    //$('#m_pane').show();
    //ResizeLayout();
    /* Set main splitter layout */
  
    //Launch Menu
    $('#mnu>.p-mnu>span').removeClass('ui-state-highlight-l');
    $('#mnu>.p-mnu>span').on('mouseover', function () { $(this).addClass('ui-state-hover-l'); });
    $('#mnu>.p-mnu>span').on('mouseout', function () { $(this).removeClass('ui-state-hover-l'); });
    $('#mnu>.p-mnu>span').click(function () {
        $('#mnu>.p-mnu>span').removeClass('ui-state-highlight-l');
        $('#mnu>.s-mnu>span').removeClass('ui-state-highlight-l');
        $('#mnu>.s-mnu').hide();
        $(this).addClass('ui-state-highlight-l');
        var m = $(this).prop('id').replace('_', '_s_');
        $('#' + m).show();
    });
    $('#mnu>.s-mnu>span').removeClass('ui-state-highlight-l');
    $('#mnu>.s-mnu>span').on('mouseover', function () { $(this).addClass('ui-state-hover-l'); });
    $('#mnu>.s-mnu>span').on('mouseout', function () { $(this).removeClass('ui-state-hover-l'); });
    $('#mnu>.s-mnu>span').click(function () {
        $('#mnu>.s-mnu>span').removeClass('ui-state-highlight-l');
        $('#mnu>.p-mnu>span').removeClass('ui-state-highlight-l');
        $(this).addClass('ui-state-highlight-l');
        var m = $(this).prop('id').replace('_s', '');
        $('#' + m).addClass('ui-state-highlight-l');
    });
    $('#mnu_m').click();
}


var idle_time = 0;
var pause_idle = false;

//Session timeout
function RedirectToWelcomePage() {
    MessageBox('Session Expired', 'Your login session has expired. Do you want to login again?', 'ui-icon-help', function () {
        LogoutUser('relogin');
    }, function () {
        LogoutUser('session_expired');
    }
    );
}
var s_t = ($.cookie('_st') ? $.cookie('_st') : ''); //Session Timeout
var r_t = ($.cookie('_rt') ? $.cookie('_rt') : '10'); //Recache Timeout
var page_load_time = '';

/*
--------------------------------------------------------------------------------------------------------
--------------------------------------------APPLICATION INITIALIZATION AND UNLOADING  END----------
--------------------------------------------------------------------------------------------------------
*/
/*
--------------------------------------------------------------------------------------------------------
--------------------------------------------GENERIC FUNCTIONS START-----------------------------------------
--------------------------------------------------------------------------------------------------------
*/
function MSIEVersion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0)      // If Internet Explorer, return version number
        //alert(parseInt(ua.substring(msie + 5, ua.indexOf(".", msie))));
        return true;
    else                 // If another browser, return 0
        return false;

    //return false;
}
function IEVersion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0)      // If Internet Explorer, return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
    else                 // If another browser, return 0
        return 0;

    //return false;
}
function ResizeDtlTabs(c, no_layout) {
    var i = $(c).tabs("option", "active");
    if (!no_layout) $(c).height($(c).parent().height() - $(c).position().top - 10);
    else $(c).height($(c).parent().height());
    var tab = $(c).children('div:eq(' + i + ')');
    tab.height($(c).height() - tab.position().top - 10);
    $(c).find('.memo').height(0);
    var tbl = $(tab).children('table:eq(0)');
    tbl.height(tab.height());
    $(c).find('.memo').each(function () {
        $(this).height($(this).parent().height());
    });
    ResizeTable('#' + tab.attr('id'), 20);
    var i = tab.find('img.rf-i');
    if (i.length != 0 && !i.attr('no-r')) {
        i.width(i.closest('td').innerWidth())
        i.height(i.closest('.t-page').height());
    }
}
function InitSvrDate(e) {
    for (i = 0; i < e.length; i++) {
        if ($('#' + e[i]).is("input"))
            $('#' + e[i]).val($.datepicker.formatDate('dd-M-yy', new Date($("#clock .clockdate").html())));
        else
            $('#' + e[i]).html($.datepicker.formatDate('dd-M-yy', new Date($("#clock .clockdate").html())));
    }
}
function SysLookupsAsynInit(e, g, def_val, show_all, onchanged) {
    if ($('#' + e).html() === '') {
        $.ajax({
            dataType: 'json',
            url: 'requestprocessor.ashx?id=lkp&grp_id=' + g,
            success: function (r) {
                var s = ''; //Default fnull option.
                if (show_all) s += '<option value="-1">All</option>';
                for (var i = 0; i < r.length; i++)
                    s += '<option value="' + r[i][0] + '">' + r[i][1] + '</option>';

                $('#' + e).html('');
                $('#' + e).append(s);
                if (def_val) $('#' + e).val(def_val);
                else $('#' + e).prop('selectedIndex', -1);
                if (onchanged) {
                    $('#' + e).off('change.e').on('change.e', function () {
                        onchanged($(this));
                    });
                }
            }

        });
    } else {
        if (def_val) $('#' + e).val(def_val);
        else $('#' + e).prop('selectedIndex', -1);
    }

}

function SysLookupsInit(e, g, def_idx, show_all, p, onchanged, async) {
    $.ajax({
        dataType: 'json',
        async: (async ? false : true), //Disable async to prevent bugs in selected index
        url: 'nHandlerVL.ashx', data: { id: 'lkp', grp_id: g, p: p },
        success: function (r) {
            var s = ''; //Default fnull option.
            if (show_all) s += '<option value="-1">All</option>';
            for (var i = 0; i < r.length; i++)
                s += '<option value="' + r[i][0] + '">' + r[i][1] + '</option>';
            for (i = 0; i < e.length; i++) {
                $('#' + e[i]).html('');
                $('#' + e[i]).append(s);
                if (def_idx) $('#' + e[i]).prop('selectedIndex', def_idx);
                else $('#' + e[i]).val(def_idx);
                if (onchanged) {
                    $('#' + e[i]).off('change.e').on('change.e', function () {
                        onchanged($(this));
                    });
                }
                //sortDropDownListByText(e_1); //Sort
            }
        }
    });
}
function SortDropDownListByText(selectId) {
    var sel = $('#' + selectId)
    var arrOptions = [];
    var i = 0;
    sel.find("option").each(function () {
        arrOptions[i] = [];
        arrOptions[i][0] = jQuery(this).text();
        arrOptions[i][1] = jQuery(this);
        i += 1;
    });
    arrOptions.sort();
    for (var i = 0; i < arrOptions.length; i++) {
        sel.append(arrOptions[i][1]);
    }
};

function GetTabIndex(n, t) {
    var i = 0;
    //$('#' + t + ' > ul > li').each(function () {
    $('#' + t).find('ul:eq(0)').children('li').each(function () {
        if ($(this).attr('id') === n)
            return false;
        i++;
    });
    return i;
}

function BgroundColor(c) {
    switch (c.toLowerCase()) {
        case 'green': return '#008000';
        case 'amber': return '#FFBF00';
        case 'red': return '#FF0000';
    }
}
function ToBoolean(val) {
    if ((val.toLowerCase() === 'true') || (val.toLowerCase() === 'y') ||
        (val === '1') || (val === '1') || (val.toLowerCase() === '✔')) return true;
    return false;
}
function ToBooleanPr(val) {
    if ((val.toLowerCase() == 'true') || (val.toLowerCase() == 'y') ||
        (val == '1') || (val.toLowerCase() === '✔')) return '✔';
    return '';
}
function MessageBox(t, m, i, c_Y, c_N, c_C) {
    if (i === '' || i == null) i = 'ui-icon-circle-close';
    var d = '<div title="' + t + '">' +
                '<p><span class="s d-icons ui-icon ' + i + '" style="float:left; margin:0 7px 50px 0;"></span>' +
                m +
                '</p>' +
            '</div>';
    if (c_Y && !c_C) {//If confirm function is passed, used confimation dialog without CANCEL
        $(d).dialog({
            modal: true, resizable: false,
            buttons: {
                Yes: function () { c_Y(); $(this).dialog("close"); },
                No: function () { if (c_N) c_N(); $(this).dialog("close"); }
            },
            close: function () { pause_idle = false; },
            open: function () {
                pause_idle = true;
            }
        });
    }
    else if (c_Y && c_C) {//If confirm function is passed, used confimation dialog with CANCEL
        $(d).dialog({
            modal: true, resizable: false,
            buttons: {
                Yes: function () { c_Y(); $(this).dialog("close"); },
                No: function () { if (c_N) c_N(); $(this).dialog("close"); },
                Cancel: function () { c_C(); $(this).dialog("close"); }
            },
            close: function () { pause_idle = false; },
            open: function () {
                pause_idle = true;
            }
        });
    } else {
        $(d).dialog({
            modal: true, resizable: false,
            buttons: {
                Ok: function () { $(this).dialog("close"); }
            },
            close: function () { pause_idle = false; },
            open: function () {
                pause_idle = true;
            }
        });
    }
}
function ProceedUpd(e) {
    var v = true;
    $('#' + e).find('.noillegal').each(function () {
        var a = $(this).val().split('\\');
        if (a.length > 0) {
            var f = a[a.length - 1];
            if (new RegExp(/[\s\[\]\(\)=,+%"\/\?@\:\;]/g).test(f)) {
                if ($(this).closest('.t-page').length > 0) {
                    var t_chd = $(this).closest('.t-page');
                    var t_par = t_chd.parent('div');
                    t_par.tabs('option', 'active', GetTabIndex(t_chd.prop('id').replace('_tab', '_tb'), t_par.prop('id')));
                }
                $(this).focus();
                var title = $(this).closest('td').prev().text().replace(/:/g, '').toUpperCase();
                MessageBox('Invalid Record', '[' + title + '] field must have a valid character value to proceed.');
                v = false;
                return false;
            }
        }
    });
    if (v === false) return false;
    $('#' + e).find('.numeric').each(function () {
        if ($.trim($(this).val()) != '' && !$.isNumeric($(this).val())) {
            if ($(this).closest('.t-page').length > 0) {
                var t_chd = $(this).closest('.t-page');
                var t_par = t_chd.parent('div');
                t_par.tabs('option', 'active', GetTabIndex(t_chd.prop('id').replace('_tab', '_tb'), t_par.prop('id')));
            }
            $(this).focus();
            var title = $(this).parent().prev().text().replace(/:/g, '').toUpperCase();
            MessageBox('Invalid Record', '[' + title + '] field must have a valid numeric value to proceed.');
            v = false;
            return false;
        }
    });
    if (v === false) return false;
    $('#' + e).find('.reqd').each(function () {
        if ($.trim($(this).val()) === '' || ($(this).val() === null)) {
            v = false;
            if ($(this).closest('.t-page').length > 0) {
                var t_chd = $(this).closest('.t-page');
                var t_par = t_chd.parent('div');
                t_par.tabs('option', 'active', GetTabIndex(t_chd.prop('id').replace('_tab', '_tb'), t_par.prop('id')));
            }
            var title = $(this).parent().prev().text().replace(/:/g, '').toUpperCase();
            MessageBox('Invalid Record', '[' + title + '] must have a valid value to proceed.');
            $(this).focus();
            v = false;
            return false;
        }
    });
    return v;
}
function TogPane(caller, c, d) {
    if (caller.is('.ui-icon-pin-s')) {
        if (d) c.toggle(d);
        caller.removeClass('ui-icon-pin-s').addClass('ui-icon-pin-w');
    } else {
        if (d) c.open(d);
        caller.removeClass('ui-icon-pin-w').addClass('ui-icon-pin-s');
    }
}
function ShowNoty(msg, icon) {
    var layout = 'bottomRight';
    noty({
        layout: layout,
        theme: 'noty_theme_facebook',
        animateOpen: { height: 'toggle' },
        animateClose: { height: 'toggle' },
        easing: 'swing', // easing
        speed: 80, // opening & closing animation speed
        timeout: 1000, // delay for closing event. Set false for sticky notifications
        closeOnSelfClick: true, // close the noty on self click when set to true
        force: true, // adds notification to the beginning of queue when set to true
        template: '<div class="ui-widget-header-n">' +
        '<p><span class="ui-icon ui-icon-' + icon + '" style="float:left; margin:0 7px 0 0;"></span>' + msg + '</p>' +
        '</div>'
    });
}
function ResizeTable(c, t) {
    var p = c;
    if (c.length === 0) p = $(c); //If id is passed.
    if ($(p).find('.dataTables_scrollBody').length > 0) {
        var m = window['c_m'];
        if (m === 'ch') m += ('_' + window['ch_c_m']);
        var h = $(p).find('.dataTable').find('thead:eq(0)').innerHeight();
        var f = $(p).find('.dataTables_length:eq(0)').innerHeight();
        $(p).find('.dataTables_scrollBody:eq(0)').height($(p).height() - ($(p).position().top + h + f + t));
    }
}
function ResizeLayout(show_menu) {
    $('#menu').width($('body').width() - 542);
    $('#m_pane').height($(window).height() - $('#m_pane').offset().top);
    $('#c_pane').children('div').height($('#m_pane').height() - 37);
}
function TitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}
function ExpClpsLp(e) {
    var ex = (e.is('.f-c'));
    if (ex) {
        e.parent('li').children('ul').show();
        e.removeClass('f-c').addClass('f-e');
    } else { // Of collapse
        e.removeClass('f-e').addClass('f-c');
        e.parent('li').children('ul').hide();
    }
}
function FldIcnsLoad(e) {
    var s3 = '<span class="d-icons ui-icon ui-icon-star"></span><span>Required</span>';
    var s4 = '<span class="d-icons ui-icon ui-icon-locked"></span><span>Readonly</span>';
    //Remove footer first
    $('#' + e).find('.d-icons.ui-icon.ui-icon-lightbulb').next('span').remove();
    $('#' + e).find('.d-icons.ui-icon.ui-icon-star').next('span').remove();
    //  $('#' + e).find('.d-icons.ui-icon.ui-icon-locked').next('span').remove();
    //Then icons then add again Set required and locked icons .
    $('#' + e).find('.d-icons.ui-icon.ui-icon-lightbulb').remove();
    $('#' + e).find('.numeric').parent().prev().append('<span class="d-icons ui-icon ui-icon-lightbulb"></span>');
    $('#' + e).find('.d-icons.ui-icon.ui-icon-star').remove();
    $('#' + e).find('.reqd').parents('td').prev().append('<span class="d-icons ui-icon ui-icon-star"></span>');
    $('#' + e).find('.d-icons.ui-icon.ui-icon-locked').remove();
    // $('#' + e).find('.value').prev('td').remove('.l_f_n').append('<span class="l_f_n d-icons ui-icon ui-icon-locked"></span>');
    $('#' + e).find('.value').css('background-color', '#D8D8D8');
    $('#' + e).append('<span class="d-icons ui-icon ui-icon-lightbulb"></span><span>Numbers Only</span>');
    $('#' + e).append('<span class="d-icons ui-icon ui-icon-star"></span><span>Required</span>');
    // $('#' + e).append('<span class="d-icons ui-icon ui-icon-locked"></span><span>Readonly</span>');
}


/*
--------------------------------------------------------------------------------------------------------
--------------------------------------------GENERIC FUNCTIONS END-----------------------------------------
--------------------------------------------------------------------------------------------------------
*/
/*
--------------------------------------------------------------------------------------------------------
--------------------------------------------DATATABLE START-----------------------------------------
--------------------------------------------------------------------------------------------------------
*/
var S_CLICK_DELAY = 0, clicks = 0, timer = null;
var BTN_PDF = { 'sExtends': 'pdf', 'sPdfOrientation': 'landscape', 'sTitle': 'IMSA', 'mColumns': 'visible' };
var BTN_CSV = { 'sExtends': 'csv', 'mColumns': 'visible' };
var BTN_COPY = { 'sExtends': 'copy', 'mColumns': 'visible' };
function DataTableInit(p) {
    //'l' - Length changing
    //'f' - Filtering input
    //'t' - The table!
    //'i' - Information
    //'p' - Pagination
    //'r' - pRocessing
    //The following constants are allowed:
    //'H' - jQueryUI theme "header" classes ('fg-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix')
    //'F' - jQueryUI theme "footer" classes ('fg-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix')
    //The following syntax is expected:
    //'<' and '>' - div elements
    //'<"class" and '>' - div with a class
    //'<"#id" and '>' - div with an ID
    //Examples:
    //'<"wrapper"flipt>'
    //'ip>'
    //Generate filter and Clear filter buttons button.
    var btns = (p['aButtons'] ? p['aButtons'] : []);
    if (p['bFilter'] === true && p['sFilterSrc'] != '') {
        //Filter Button
        btns.push({
            'sExtends': 'text', 'sToolTip': 'Click to filter records', 'sButtonText': 'Filter',
            'fnClick': function (b, c) {
                DataTabletFtrLoad(p['sDT'], b, p['sFilterSrc']);
            }
        });
        //Clear Filter Buttons
        btns.push({
            'sExtends': 'text', 'sButtonClass': 'tabletools-r-space', 'sToolTip': 'Click to clear filter', 'sButtonText': 'Clear Filters',
            'fnClick': function () {
                var dt = $('#' + p['sDT']).dataTable();
                if (dt.fnIsFiltered()) { //Show message if currently filtered
                    MessageBox('Filter', 'Are you sure you want to remove filter from all columns?', 'ui-icon-help', function () {
                        DataTableFtrClr(p['sDT']);
                    });
                } else {
                    MessageBox('Filter', 'There are no filters applied');
                }
            }
        });
    }
    
    //Generate Refresh buttons
    btns.push({
        'sExtends': 'text', 'sToolTip': 'Click to refresh records', 'sButtonText': 'Refresh',
        'fnClick': function () {
            $('#main_cpSummary').block();//Neo added 20141105
            $('#' + p['sDT']).dataTable().fnDraw();
        }
    });
    //btns.push({ 'sExtends': 'pdf', 'sPdfOrientation': 'landscape', 'sTitle': 'IMSA', 'mColumns': 'visible' });
    //btns.push({ 'sExtends': 'csv', 'mColumns': 'visible' });
    //btns.push({ 'sExtends': 'copy', 'mColumns': 'visible' });
    $('#' + p['sDT']).dataTable({
        'bProcessing': false,
        'bStateSave': true,
        "sScrollX": "100%",
        'bScrollCollapse': true,
        'iDisplayLength': 50,
        'iCookieDuration': (COOKIE_EXP * 86400), //90 days
        'bAutoWidth': false,
        'bJQueryUI': true,
        'aLengthMenu': [25, 50, 100, 200, 500],
        'sDom': '<"H"TRClr>t<"F"ip>',
        'oColReorder': { 'iFixedColumns': 0 },
        'bServerSide': true,
        'sPaginationType': 'full_numbers',
        'sDom': (p['sDom'] ? p['sDom'] : '<"H"TRr>t<"F">'),
        'oLanguage': { 'sProcessing': '<img src="images/busy.gif" />' },
        'sScrollY': (p['sScrollY'] ? p['sScrollY'] : $('#' + p['sDT']).parent('div').height() - 97),
        'oColVis': {
            'buttonText': 'Columns',
            'bRestore': true,
            'sRestore': 'Restore Default',
            'sAlign': 'right',
            'aiExclude': (p['aiExclude'] ? p['aiExclude'] : [0]),
            'fnStateChange': function (iColumn, bVisible) {
                if (p['fnResizeCallback']) p['fnResizeCallback']();
            }
        },
        //'aoColumnDefs': [{ 'bVisible': false, 'aTargets': p['aiExclude'] }],
        'oTableTools': {
            'aButtons': btns,
            'sSwfPath': 'scripts/copy_csv_xls_pdf.swf'
        },
        'order': (p['defSort'] ? p['defSort'] : [[0, 'asc']]),
        'sAjaxSource': p['sAjaxSource'],
        'aoColumns': (p['aoColumns'] ? p['aoColumns'] : [
            { 'sExtends': 'text', 'sToolTip': 'Click to filter records', 'sButtonText': 'Filter' },
            { 'sExtends': 'text', 'sButtonClass': 'tabletools-r-space', 'sToolTip': 'Click to clear filter', 'sButtonText': 'Clear Filters' }
        ]),
        'fnDrawCallback': function (oSettings) {
            if (p['fnDrawCallback']) p['fnDrawCallback'](oSettings);
        },
        'fnServerData': function (sSource, aoData, fnCallback, oSettings) {
            //$('#' + p['sDT']).parent().block(); // Neo comment 20141105
            var dt = oSettings.oInstance;
            for (var i = 0, iLen = oSettings.aoPreSearchCols.length ; i < iLen ; i++) {
                if (oSettings.aoPreSearchCols[i].sSearch != '') {
                    var c = (i - 1);
                    //Add remove filter icons.
                    var th = $('#' + p['sDT']).parent().parent().find('th:eq(' + (c) + ')').children('div');
                    th.append('<span class="ui-icon ui-icon-cart ptr" style="right: 12px;"></span>');
                    th.children('.ui-icon-cart').off('click.e').on('click.e', function (e) {
                        e.stopPropagation();
                        var c_t = dt.fnSettings().aoColumns[c + 1].sTitle;
                        var c_n = dt.fnSettings().aoColumns[c + 1].sName;
                        MessageBox('Filter Settings', 'Are you sure you want to remove filter from column ' + c_t.substr(1) + '?', 'ui-icon-help', function () {
                            dt.fnFilter('', dt.fnGetColumnIndex(c_n));
                            var th = $('#' + p['sDT']).parent().parent().find('th:eq(' + (c) + ')').children('div');
                            th.children('span.ui-icon-cart').remove();
                        });
                    });
                }
            }
            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "url": sSource,
                "data": aoData,
                "success": function (json) {
                    fnCallback(json);
                    var tr = oSettings.oInstance.find('tbody').find('tr');
                    tr.off('click.e').on('click.e', function (e) {
                        if (json.aaData.length > 0) {
                            var t = this;
                            //clicks++;  //count clicks
                            //if (clicks === 1) {
                            //    timer = setTimeout(function () { //perform single-click action    
                            dt = oSettings.oInstance;
                            $(oSettings.aoData).each(function () { $(this.nTr).removeClass('row-ptr'); });
                            $(t).addClass('row-ptr');
                            var r = dt.fnGetData(t);
                            //Get primary key column index.]; //Tables' primary key value.
                            window[p['sDT']]['key'] = r[dt.fnGetColumnIndex(p['sKeyCol'])];
                            window[p['sDT']]['r'] = dt.fnGetPosition(t); //Table's row index.
                            
                            if (p['fnClickCallback']) p['fnClickCallback']();
                            //clicks = 0;             //after action performed, reset counter
                            //  }, S_CLICK_DELAY);
                            //} else {
                            //    clearTimeout(timer);    //prevent single-click action
                            //perform double-click action
                            //   clicks = 0;             //after action performed, reset counter
                            //if (p['fnDClickCallback']) p['fnDClickCallback']();
                            // }
                        }
                    });
                    if (json.aaData.length > 0) {
                        if (p['bSelLast']) {
                            $(oSettings.nTable.parentNode).scrollTo(oSettings.oInstance.innerHeight());
                            oSettings.oInstance.find('tbody').find('tr:eq(' + (json.aaData.length - 1) + ')').click(); //Select last row.
                        } else {
                            oSettings.oInstance.find('tbody').find('tr:eq(0)').click(); //Select first row.
                        }
                    } else {
                        window[oSettings.sTableId]['key'] = -1;
                        window[oSettings.sTableId]['r'] = -1;
                        if (p['fnClickCallback']) p['fnClickCallback']();
                    }
                    //$('.dataTables_scrollBody').parent().width($('#' + p['sDT']).parent('div').innerWidth() - 200); //Fixed for non x-scrollbar ie8;
                    //oSettings.oInstance.fnAdjustColumnSizing(false);
                }
            });
        },
        'fnServerParams': function (aoData) { },
        'fnStateLoadParams': function (oSettings, oData) { },
        'fnDrawCallback': function (oSettings) {
            if (p['fnDrawCallback']) p['fnDrawCallback'](oSettings);
            if (p['fnResizeCallback']) p['fnResizeCallback']();
            //$('#' + p['sDT']).parent().unblock(); // Neo comment 20141105
        },
        'fnFooterCallback': function (nFoot, aData, iStart, iEnd, aiDisplay) { },
        'fnRowCallback': function (nRow, aData, iDisplayIndex, iDisplayIndexFull) { }
    });
}
function DataTableExists(nTable) {
    var settings = $.fn.dataTableSettings;
    for (var i = 0, iLen = settings.length; i < iLen; i++) {
        if (settings[i].nTable == nTable) {
            return true;
        }
    }
    return false;
}
function DataTableFtrClr(par_dt) {
    var dt = $('#' + par_dt).dataTable();
    var oSettings = dt.fnSettings();
    for (var i = 0, iLen = oSettings.aoPreSearchCols.length ; i < iLen ; i++) {
        if (oSettings.aoPreSearchCols[i].sSearch != '') {
            //Add remove filter icons.
            var th = $('#' + par_dt).parent().parent().find('th:eq(' + (i - 1) + ')').children('div');
            th.children('span.ui-icon-cart').remove();
        }
    }
    dt.fnFilterClear();
}
function DataTabletFtrLoad(par_dt, btn, ajax_src) {
    $('<div id="dt_f" title="Filter Settings" style="width: 200px;">' +
        '<div>Select Data Column to Filter:</div>' +
        '<select style="width: 100%;"></select>' +
        '<table id="f_dt" class="dt"></table>' +
        '<textarea style="width: 100%; height: 60px;"></textarea>' +
    '</div>').dialog({
        show: 'blind',
        hide: 'blind',
        draggable: false, modal: true, resizable: false,
        position: { my: "left top", at: "left bottom", of: btn },
        height: 450,
        width: 300,
        buttons: {
            'Apply': {
                title: 'Click to filter record.', text: 'Apply', icons: { primary: 'ui-icon-search' },
                click: function () {
                    var dt = $('#' + par_dt).dataTable();
                    var c = dt.fnGetColumnIndex($(this).find('select').val());
                    dt.fnFilter($(this).find('textarea').val().replace(/^,|,$/g, ''), c);
                    $(this).dialog('close');
                }
            },
            'Close': {
                text: 'Close', icons: { primary: 'ui-icon-arrowreturnthick-1-w' },
                click: function () { $(this).dialog('close'); }
            }
        },
        close: function () {
            $(this).dialog('destroy');
            pause_idle = false;
        },
        create: function () {
            pause_idle = true;
            var c = $('#' + par_dt).dataTable().fnSettings().aoColumns;
            var o = '';
            for (var i = 0; i < c.length; i++) {
                o += '<option value="' + c[i].sName + '">' + c[i].sTitle + '</option>';
            }
            var s = $(this).find('select:eq(0)');
            s.off('change.e');
            s.append(o);
            s.on('change.e', function () {
                $('#dt_f').find('textarea:eq(0)').val('');
                var sTitle = $(this).children('option:selected').text();
                var sName = $(this).children('option:selected').val();
                if (DataTableExists($('#f_dt')[0])) {
                    $('#f_dt').empty();
                    $('#f_dt').dataTable().fnDestroy();
                }
                //var m = (window['c_m'] === 'ch' ? 
                //        window['c_m'] + '_' + window['ch_c_m'] : 
                //        window['c_m']);
                //'sDom': '<"H"TRClr>t<"F"ip>', | My Orig Need 'sDom': '<"H"lr>t<"F"p>'
                $('#f_dt').dataTable({
                    'bProcessing': true,
                    'sScrollX': '100%',
                    'bScrollCollapse': true,
                    'iDisplayLength': 50,
                    'bJQueryUI': true,
                    'sDom': '<"H"lr>t<"F"p>',
                    'bServerSide': true,
                    'oLanguage': { 'sProcessing': '<img src="images/busy.gif" />' },
                    'sScrollY': '176px',
                    'aoColumns': [
                        {
                            'sName': 'bSel', //for selection
                            'mRender': function (data, type, r) {
                                return '<input type="checkbox" onchange="DataTableFtrSelect($(\'#dt_f\').find(\'textarea\'),$(this),\'' +
                                    escape(r[1]) + '\');" />';
                            },
                            'sWidth': '15px'
                        },
                        { 'sName': sName, 'sTitle': sTitle, 'sWidth': '220px' }],
                    'sAjaxSource': ajax_src,
                    //'fnServerData': function (sSource, aoData, fnCallback, oSettings) {
                    //    $('#f_dt').block();
                    //},
                    'fnDrawCallback': function (oSettings) {
                        ResizeTable('#dt_f', 101);
                        //  $('#f_dt').parent().unblock();
                    }
                });
            });
            s.prop('selectedIndex', 2);
            s.change();
        }
    });
}
function DataTableFtrSelect(t, e, v) {
    var v_prv = $(t).val();
    if (e.is(':checked')) {
        t.val(v_prv + unescape(v) + ',');
    } else {
        t.val(v_prv.replace(unescape(v) + ',', ''));
    }
}
function DataTableClientInit(dt) {
    window[dt] = new Object();
    window[dt]['key'] = -1
    window[dt]['r'] = -1
}
jQuery.fn.dataTableExt.oSort['numeric-comma-asc'] = function (a, b) {
    var x = (a == "-") ? 0 : a.replace(/,/, ".");
    var y = (b == "-") ? 0 : b.replace(/,/, ".");
    x = parseFloat(x);
    y = parseFloat(y);
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
};
jQuery.fn.dataTableExt.oSort['numeric-comma-desc'] = function (a, b) {
    var x = (a == "-") ? 0 : a.replace(/,/, ".");
    var y = (b == "-") ? 0 : b.replace(/,/, ".");
    x = parseFloat(x);
    y = parseFloat(y);
    return ((x < y) ? 1 : ((x > y) ? -1 : 0));
};
jQuery.fn.dataTableExt.oSort['numeric-dash-asc'] = function (a, b) {
    var x = (a == "-") ? 0 : a.replace(/-/, ".");
    var y = (b == "-") ? 0 : b.replace(/-/, ".");
    x = parseFloat(x);
    y = parseFloat(y);
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
};
jQuery.fn.dataTableExt.oSort['numeric-dash-desc'] = function (a, b) {
    var x = (a == "-") ? 0 : a.replace(/-/, ".");
    var y = (b == "-") ? 0 : b.replace(/-/, ".");
    x = parseFloat(x);
    y = parseFloat(y);
    return ((x < y) ? 1 : ((x > y) ? -1 : 0));
};
/*
--------------------------------------------------------------------------------------------------------
--------------------------------------------DATATABLE END-----------------------------------------
--------------------------------------------------------------------------------------------------------
*/
function usrListLoad() {   
    DataTableClientInit('usrlist_dt');
    var p = new Object();
    p['sDT'] = 'usrlist_dt';
    var BTN_ADD = { 'sExtends': 'text', 'sToolTip': 'Click to add record', 'sButtonText': 'Add', 'fnClick': function () { usrAdd(); } };
    var BTN_EDIT = { 'sExtends': 'text', 'sToolTip': 'Click to edit record', 'sButtonText': 'Edit', 'fnClick': function () { usrEdit(); } };
    var BTN_DEL = { 'sExtends': 'text', 'sButtonClass': 'tabletools-r-space', 'sToolTip': 'Click to delete record', 'sButtonText': 'Delete', 'fnClick': function () { usrDelete(); } };
    p['aButtons'] = [BTN_ADD, BTN_EDIT, BTN_DEL];
    p['aoColumns'] = [
       { 'sTitle': 'User Id', 'sName': 'sUSR_ID', 'sClass': 'nCenter-align', 'sWidth': '30px' }, //{ 'sTitle': 'User Id', 'sName': 'sUSR_ID', 'bVisible': false },
       { 'sTitle': 'User Name', 'sName': 'sUSR_NAME', 'sWidth': '110px' }
    ];
    p['defSort'] = [[1, 'desc']];
    p['sAjaxSource'] = 'nHandlerVL.ashx?id=usr_list';
    p['aiExclude'] = [0];
    p['sKeyCol'] = 'iUSR_ID';
    p['bRClick'] = false;
    p['bDClick'] = true;
    p['fnResizeCallback'] = function () {
        //ResizeTable('#cpsum_pane', 60);/////cpsum_c_pane
    };
    p['fnClickCallback'] = function () {
        var r = $('#usrlist_dt').dataTable().fnGetData(window['usrlist_dt']['r']);
        var rev = r[$('#usrlist_dt').dataTable().fnGetColumnIndex('sUSR_ID')];
        usrparListLoad(rev);
    };

    DataTableInit(p);
}

function usrparListLoad(rev) {
    DataTableClientInit('usrparlist_dt');
    if (DataTableExists($('#usrparlist_dt')[0])) {
        var r = $('#usrlist_dt').dataTable().fnGetData(window['usrlist_dt']['r']);
        var rev = r[$('#usrlist_dt').dataTable().fnGetColumnIndex('sUSR_ID')];
        $('#usrparlist_dt').dataTable().fnSettings().sAjaxSource = 'nHandlerVL.ashx?id=usrpar_list&usr_param_id=' + rev;
        $('#usrparlist_dt').dataTable().fnDraw();

    }else {
    //DataTableClientInit('usrparlist_dt');
    var p = new Object();
    p['sDT'] = 'usrparlist_dt';
    var BTN_ADD = { 'sExtends': 'text', 'sToolTip': 'Click to add record', 'sButtonText': 'Add', 'fnClick': function () { usrparAdd(); } };
    var BTN_EDIT = { 'sExtends': 'text', 'sToolTip': 'Click to edit record', 'sButtonText': 'Edit', 'fnClick': function () { usrparEdit(); } };
    var BTN_DEL = { 'sExtends': 'text', 'sButtonClass': 'tabletools-r-space', 'sToolTip': 'Click to delete record', 'sButtonText': 'Delete', 'fnClick': function () { usrparDelete(); } };
    p['aButtons'] = [BTN_ADD, BTN_EDIT, BTN_DEL];
    p['aoColumns'] = [
       { 'sTitle': 'User Param ID', 'sName': 'sUPR_ID', 'bVisible': false },
       { 'sTitle': 'User ID', 'sName': 'sUSR_ID', 'bVisible': false },
       { 'sTitle': 'User NAME', 'sName': 'sUSR_NAME', 'bVisible': false },
       { 'sTitle': 'User Role Title', 'sName': 'sUPRUSRID_Code', 'bVisible': false },
       { 'sTitle': 'User Role Title', 'sName': 'sUPRUSRID_Title', 'bVisible': false },
       { 'sTitle': 'User Role Title', 'sName': 'sUPRLKPID_Code', 'bVisible': false },
       { 'sTitle': 'Parameter', 'sName': 'sUPRLKPID_Title', 'sWidth': '50px' },
       { 'sTitle': 'User Role Title', 'sName': 'sUPRVALLKPID_Code', 'bVisible': false },
       { 'sTitle': 'Setting', 'sName': 'sPAR_SET_TXT', 'sWidth': '100px' }
    ];
    p['aaSorting'] = [[1, 'desc']];
    p['sAjaxSource'] = 'nHandlerVL.ashx?id=usrpar_list&usr_param_id=' + rev;
    p['aiExclude'] = [0];
    p['sKeyCol'] = 'iUSR_ID';
    p['bRClick'] = false;
    p['bDClick'] = true;
    p['fnResizeCallback'] = function () {
        //ResizeTable('#usrparlist_dt', 60);/////cpsum_c_pane
    };
    p['fnClickCallback'] = function () {
        //var r = $('#cplist_dt').dataTable().fnGetData(window['cplist_dt']['r']);
        //var rev = r[$('#cplist_dt').dataTable().fnGetColumnIndex('sCP_MODULE_TAG')];
        //$('#CP_MODE_KEYData').val(rev);
        //loadmodule();
    };

    DataTableInit(p);
}
}




function naddzero(str, max) {
    str = str.toString();
    return str.length < max ? naddzero("0" + str, max) : str;
}



// Users Add/EditDelete Begins Here
function usrAdd() {
    var cc = new Date(new Date());
    var Edited = $.datepicker.formatDate('mmddyy', new Date(new Date())) + naddzero(cc.getHours(), 2) + naddzero(cc.getMinutes(), 2) + naddzero(cc.getSeconds(), 2);
    var Addusr = '<div id="AddDivusr" title="Add/Edit User" class="ui-widget-content no-disp" style="width: 200px;">' +
        '<table>' +
            '<tr>' +
                '<td>User Name:</td><td><input type="text" id="txtusrname" class="textn"/></td>' +
            '</tr>' +
            '</table>' +
    '</div>'
    $(Addusr).dialog({
        modal: true, closeOnEscape: false, resizable: false, dialogClass: 'no-close',
        width: 400,
        buttons: {
            'Save': {
                text: 'Save', icons: { primary: 'ui-icon-disk' },
                click: function () {
                    if ($('#txtusrname').val() === '') {
                        MessageBox('Add User', 'Please enter user name before proceeding.');
                    } else {
                        $('#content').block();
                        $.ajax({
                            type: 'POST',
                            url: 'nHandlerVL.ashx?id=usr_add',
                            data: {
                              
                                USR_NAME: $('#txtusrname').val()
                            }
                        }).done(function (r) {
                            ShowNoty('User has been added.', 'info');
                            $('#usrlist_dt').dataTable().fnDraw();
                            $('#usrparlist_dt').dataTable().fnDraw();
                            $('#content').unblock();
                        });
                        $(this).dialog('destroy');
                    }
                    
                   
                }
            },
            'Close': {
                text: 'Close', icons: { primary: 'ui-icon-arrowreturnthick-1-w' },
                click: function () { $(this).dialog('destroy'); }
            }
        },
        create: function () {
        }
    });
}

function usrEdit() {
    var r = $('#usrlist_dt').dataTable().fnGetData(window['usrlist_dt']['r']);
    var rev = r[$('#usrlist_dt').dataTable().fnGetColumnIndex('sUSR_ID')];

    if (rev === -1)
        MessageBox('Record Update', 'There are no record to edit');
    else
        usrDlgLoad(rev);
}

function usrDlgLoad(rev) {
    $('#content').block();
    var eFT = '<div id="nDivusreditload" title="Update User" class="ui-widget-content no-disp">' +
        '<table>' +
            '<tr>' +
                '<td>User Name:</td><td><input id="e_usr_usrname" class="textn"/></td>' +
            '</tr>' +
            '</table>' +
    '</div>'
    $(eFT).dialog({
        modal: true, closeOnEscape: false, resizable: false, dialogClass: 'no-close',
        width: 400,
        buttons: {
            'Save': {
                text: 'Save', icons: { primary: 'ui-icon-disk' },
                click: function () { if (ProceedUpd('nDivusreditload')) usrUpd(rev); $(this).dialog('destroy'); }
            },
            'Cancel': {
                text: 'Cancel', icons: { primary: 'ui-icon-arrowreturnthick-1-w' },
                click: function () { ShowNoty('Action cancelled.', 'info'); $(this).dialog('destroy'); }
            }
        },
        create: function () {},
        open: function () {
            $('#content').unblock();
            usrDlgEditLoad(rev);
        }
    });
}

function usrDlgEditLoad(rev) {
    $('#content').block();
    $.ajax({
        dataType: 'json',
        url: 'nHandlerVL.ashx?id=usr_edit&usr_id=' + rev,
        success: function (r) { usrDtlsDisp(r); }
    });
}
function usrDtlsDisp(r) {
    $('#e_usr_usrname').val(r[0][0]);
    $('#content').unblock();
}

function usrUpd(rev) {
    var nupdatNoRedraw;
    nupdatNoRedraw = $('#e_usr_usrname').val();
   if ($('#e_usr_usrname').val() === '') {
        MessageBox('Update User', 'Please do not leave user name empty before proceeding.');
    } else {
        $.ajax({
            type: 'POST',
            url: 'nHandlerVL.ashx?id=usr_upd&usr_id=' + rev,
            data: {
                USR_NAME: $('#e_usr_usrname').val()
            }
        }).done(function (r) {
            ShowNoty('The selected record is now updated.', 'info');
            //$('#usrlist_dt').dataTable().fnDraw();
            // do not redraw the contract list, update the text instead
            var dt = $('#usrlist_dt').dataTable();
            var r = window['usrlist_dt']['r']; //Current Row////
            dt.fnUpdate(nupdatNoRedraw, r, dt.fnGetColumnIndex('sUSR_NAME'), false, false);
        });       
    }   
}


function usrDelete() {
    var r = $('#usrlist_dt').dataTable().fnGetData(window['usrlist_dt']['r']);
    var rev = r[$('#usrlist_dt').dataTable().fnGetColumnIndex('sUSR_ID')];

    if (rev === -1)
        MessageBox('Record Delete', 'There are no record to delete.');
    else {
        MessageBox('Record Delete', 'Are you sure you want to delete the selected user?', 'ui-icon-help', function () {
            $('#content').block();
            $.ajax({ 
                type: 'POST',
                url: 'nHandlerVL.ashx?id=usr_delete&usr_id=' + rev
            }).done(function (r) {
                var r = window['usrlist_dt']['r'];
                $('#usrlist_dt').dataTable().fnDeleteRow(r);
                $('#content').unblock();
                ShowNoty('Record has been successfully deleted.', 'info');
            });
        });
    }
}
// Users Add/EditDelete Ends Here
//--------------------------------------------
// USer Parameters Add/EditDelete Begins Here
function usrparAdd() {
    var r = $('#usrlist_dt').dataTable().fnGetData(window['usrlist_dt']['r']);
    var usrID = r[$('#usrlist_dt').dataTable().fnGetColumnIndex('sUSR_ID')];
    var cc = new Date(new Date());
    var Edited = $.datepicker.formatDate('mmddyy', new Date(new Date())) + naddzero(cc.getHours(), 2) + naddzero(cc.getMinutes(), 2) + naddzero(cc.getSeconds(), 2);
    var Addusr = '<div id="AddDivusrpar" title="Add/Edit User Parameters" class="ui-widget-content no-disp" style="width: 200px;">' +
        '<table>' +
            '<tr>' +
                '<td>Parameter:</td><td><select id="e_dd_par" class="textn"></select></td>' +
            '</tr>' +
            '<tr>' +
                '<td>Parameter Setting:</td><td><select id="e_dd_parset" class="textn"></select></td>' +
            '</tr>' +
            '<tr>' +
                '<td>Parameter Text:</td><td><input type="text" id="e_txt_partxt" class="textn"/></td>' +
            '</tr>' +
            '</table>' +
    '</div>'
    $(Addusr).dialog({
        modal: true, closeOnEscape: false, resizable: false, dialogClass: 'no-close',
        width: 400,
        buttons: {
            'Save': {
                text: 'Save', icons: { primary: 'ui-icon-disk' },
                click: function () {
                    //
                    var r = $('#usrlist_dt').dataTable().fnGetData(window['usrlist_dt']['r']);
                    var uID = r[$('#usrlist_dt').dataTable().fnGetColumnIndex('sUSR_ID')];
                    //
                    if ($('#e_dd_par').val() === '') {
                        MessageBox('Add User Parameter', 'Please enter user name before proceeding.');
                    } else {
                        $('#content').block();
                        $.ajax({
                            type: 'POST',
                            url: 'nHandlerVL.ashx?id=usr_par_add',
                            data: {
                                USRID: usrID,
                                PAR: $('#e_dd_par').val(),
                                PARSET: $('#e_dd_parset').val(),
                                PARTEXT: $('#e_txt_partxt').val(),
                                usrIDadd: uID
                            }
                        }).done(function (r) {
                            //start
                            if (r != 'duplicate') {
                                ShowNoty('User Parameter has been added.', 'info');
                                $('#usrparlist_dt').dataTable().fnDraw();
                                $('#content').unblock();
                            } else {
                                alert('Multiple parameter settings are not allowed');
                                $('#content').unblock();
                            }
                            ////end
                            //ShowNoty('User Parameter has been added.', 'info');
                            //$('#usrparlist_dt').dataTable().fnDraw();
                            //$('#content').unblock();
                        });
                        $(this).dialog('destroy');
                    }


                }
            },
            'Close': {
                text: 'Close', icons: { primary: 'ui-icon-arrowreturnthick-1-w' },
                click: function () { $(this).dialog('destroy'); }
            }
        },
        create: function () {
            SysLookupsInit(['e_dd_par'], 101);
            SysLookupsInit(['e_dd_parset'], 103);
            //Enable/Disable Control
            nChangeOnSelectUSERPAR();
            $('#e_dd_parset').attr('disabled', 'disabled');
            $('#e_dd_parset').text("");
            //Enable/Disable Control Ends Here
        }
    });
}



function usrparEdit() {
    var r = $('#usrparlist_dt').dataTable().fnGetData(window['usrparlist_dt']['r']);
    var rev = r[$('#usrparlist_dt').dataTable().fnGetColumnIndex('sUPR_ID')];

    if (rev === -1)
        MessageBox('Record Update', 'There are no record to edit');
    else
    $('#content').block();
    var EditUserPar = '<div id="EditDivusrpar" title="Add/Edit User Parameters" class="ui-widget-content no-disp" style="width: 200px;">' +
        '<table>' +
            '<tr>' +
                '<td>Parameter:</td><td><select id="e_dd_par" class="textn"></select></td>' +
            '</tr>' +
            '<tr>' +
                '<td>Parameter Setting:</td><td><select id="e_dd_parset" class="textn"></select></td>' +
            '</tr>' +
            '<tr>' +
                '<td>Parameter Text:</td><td><input type="text" id="e_txt_partxt" class="textn"/></td>' +
            '</tr>' +
            '</table>' +
    '</div>'
    $(EditUserPar).dialog({
        modal: true, closeOnEscape: false, resizable: false, dialogClass: 'no-close',
        width: 400,
        buttons: {
            'Save': {
                text: 'Save', icons: { primary: 'ui-icon-disk' },
                click: function () { if (ProceedUpd('EditDivusrpar')) usrparUpd(rev); $(this).dialog('destroy'); }
            },
            'Cancel': {
                text: 'Cancel', icons: { primary: 'ui-icon-arrowreturnthick-1-w' },
                click: function () { ShowNoty('Action cancelled.', 'info'); $(this).dialog('destroy'); }
            }
        },
        open: function () {
            $('#content').block();
            SysLookupsInit(['e_dd_par'], 101);
            //SysLookupsInit(['e_dd_parset'], 103);
            setTimeout(function () {
                usrparDlgEditLoad(rev);
                nChangeOnSelectUSERPAR();
            }, 90);
            
        }
    });
}


function usrparDlgEditLoad(rev) {
    $.ajax({
        dataType: 'json',
        url: 'nHandlerVL.ashx?id=usr_par_edit&usr_par_id=' + rev,
        success: function (r) { usrparDtlsDisp(r); }
    });
}
function usrparDtlsDisp(r) {
    $('#e_dd_par').val(r[0][0]);
    $('#e_dd_parset').val(r[0][1]);
    $('#e_txt_partxt').val(r[0][2]);

    if ($('#e_dd_par option:selected').val() == 1102) {
        SysLookupsInit(['e_dd_parset'], 103);
        setTimeout(function () {
            $('#e_dd_parset').removeAttr('disabled', 'disabled');
            $('#e_txt_partxt').attr('disabled', 'disabled');
            //$('#e_edd_parset').val(1302);
            $('#e_txt_partxt').val("");
            $('#e_dd_parset').val(r[0][1]);
        }, 90);
        
    }
    else if ($('#e_dd_par option:selected').val() == 1104) {
        SysLookupsInit(['e_dd_parset'], 1104);     
        setTimeout(function () {
            $('#e_dd_parset').removeAttr('disabled', 'disabled');
            $('#e_txt_partxt').attr('disabled', 'disabled');
            //$("#e_txt_partxt").prop('type', 'text');
            $('#e_txt_partxt').val("");
            $('#e_dd_parset').val(r[0][1]);
        }, 90);

    }
    else if ($('#e_dd_par option:selected').val() == 1101) {
        $('#e_dd_parset').attr('disabled', 'disabled');
        $('#e_txt_partxt').removeAttr('disabled', 'disabled');
        //$("#e_txt_partxt").prop('type', 'password');
        $('#e_txt_partxt').val("");
        $('#e_dd_parset').val("");
    }
    else {
        $('#e_dd_parset').attr('disabled', 'disabled');
        $('#e_txt_partxt').removeAttr('disabled', 'disabled');
        $('#e_dd_parset').val("");
    }
    $('#content').unblock();
}

function nChangeOnSelectUSERPAR() {
    //Enable/Disable Control
    $('select[id=e_dd_par]').change(function () {
        if ($('#e_dd_par option:selected').val() == 1102) {
            $('#e_dd_parset').removeAttr('disabled', 'disabled');
            $('#e_txt_partxt').attr('disabled', 'disabled');
            //$('#e_dd_parset').val(1302);
        } else if ($('#e_dd_par option:selected').val() == 1104) {
            SysLookupsInit(['e_dd_parset'], 1104);
            $('#e_dd_parset').removeAttr('disabled', 'disabled');
            $('#e_txt_partxt').attr('disabled', 'disabled');

        } else if ($('#e_dd_par option:selected').val() == 1101) {
            $('#e_dd_parset').attr('disabled', 'disabled');
            $('#e_txt_partxt').removeAttr('disabled', 'disabled');
            $("e_txt_partxt").prop('type', 'password');
            $('#e_dd_parset').val("");

        }else {
            $('#e_dd_parset').attr('disabled', 'disabled');
            $('#e_txt_partxt').removeAttr('disabled', 'disabled');
            $('#e_dd_parset').val("");
        }
    });
}

function usrparUpd(rev) {
    var isPassword;
    var nupdatNoRedraw;
    isPassword = $('#e_dd_par option:selected').val();

    if ($('#e_dd_par option:selected').val() == 1102) {
        nupdatNoRedraw = $('#e_dd_parset option:selected').text()
    } else {
        nupdatNoRedraw = $('#e_txt_partxt').val();
    }

    if (isPassword == 1101) {
        if ($('#e_txt_partxt').val() == '') {
            alert('You need to enter a new password')
            return;
        }
    }

    var r = $('#usrlist_dt').dataTable().fnGetData(window['usrlist_dt']['r']);
    var uID = r[$('#usrlist_dt').dataTable().fnGetColumnIndex('sUSR_ID')];
    $.ajax({
        type: 'POST',
        url: 'nHandlerVL.ashx?id=usr_par_upd&usr_par_id=' + rev,
        data: {
            PAR: $('#e_dd_par').val(),
            PARSET: $('#e_dd_parset').val(),
            PARTXT: $('#e_txt_partxt').val(),
            usrID: uID
        }
    }).done(function (r) {
        if (r != 'duplicate') {
            ShowNoty('The selected record is now updated.', 'info');
            //$('#usrlist_dt').dataTable().fnDraw();
            // do not redraw the contract list, update the text instead
            var dt = $('#usrparlist_dt').dataTable();
            var r = window['usrparlist_dt']['r']; //Current Row////

            if (isPassword == 1101) {
                dt.fnUpdate('********************', r, dt.fnGetColumnIndex('sPAR_SET_TXT'), false, false);
            } else {
                dt.fnUpdate(nupdatNoRedraw, r, dt.fnGetColumnIndex('sPAR_SET_TXT'), false, false);
            }
            
        } else {
            alert('Multiple parameter settings are not allowed')
        }
        
    });
}

function usrparDelete() {
    var r = $('#usrparlist_dt').dataTable().fnGetData(window['usrparlist_dt']['r']);
    var rev = r[$('#usrparlist_dt').dataTable().fnGetColumnIndex('sUPR_ID')];

    if (rev === -1)
        MessageBox('Record Delete', 'There are no record to delete.');
    else {
        MessageBox('Record Delete', 'Are you sure you want to delete the selected user parameter?', 'ui-icon-help', function () {
            $('#content').block();
            $.ajax({
                type: 'POST',
                url: 'nHandlerVL.ashx?id=usr_par_delete&usr_id=' + rev
            }).done(function (r) {
                var r = window['usrparlist_dt']['r'];
                $('#usrparlist_dt').dataTable().fnDeleteRow(r);
                $('#content').unblock();
                ShowNoty('Record has been successfully deleted.', 'info');
            });
        });
    }
}

// USer Parameters Add/EditDelete ends Here

// App user
function EditPassword() {
    

    var LOGIN_Details = null;
    //$('#e_oldpass').val();
    //$('#e_newpass').val();
    //$('#e_confirmnewpass').val();
    //window.parent.$('#loginInfo').val();
    var inf = $('#loginInfo', window.parent.document).val();
    if (inf) {
        LOGIN_Details = JSON.parse(inf);
    }

    if ($('#e_newpass').val() == $('#e_confirmnewpass').val()) {
            $.ajax({
                type: 'POST',
                url: 'nHandlerVL.ashx?id=usr_chng_pass&usr_id=' + LOGIN_Details.unum,
                data: {
                    OLDPASS: $('#e_oldpass').val(),
                    MATCHNEWPASS: $('#e_confirmnewpass').val()
                }
            }).done(function (r) {
                if (r != 'OldPassNotMatch') {
                    alert('Password successfully changed.')
                    parent.closeChangePass();
                } else {
                    alert('Your old password appears to be incorrect.')
                }

            });
        //if (confirm('Are you sure you want to change your password?')) {
        //}
    }
    else{
        alert('New password and confirm password do not match.')
    }

    
}

///






function nformatCurr(Cur) {
    var p = Cur.toFixed(2).split(".");
    return p[0].split("").reverse().reduce(function (acc, Cur, i, orig) {
        return Cur + (i && !(i % 3) ? "," : "") + acc;
    }, "") + "." + p[1];
}



//////////////////////////////////////// RR Module End ///////////////////////////////// @

function nStringtoInteger() {
    var myString = '1234.098';
    var myInteger = parseInt(myString); // result = 1234
    var myNumber = parseFloat(myString); // result = 1234.098To reduce the number of decimals:
    var myNumber = 1234.098;
    myNumber = myNumber.toFixed(2); // result = 1234.09

}


function sizeContent() {
    var newHeight = $(window).height() - $("#main_hdr").height() + "px";
    //var newHeight = $("html").height() - $("#main_hdr").height() + "px";
    $("#cp_pane").css("height", newHeight);
    $("#cpsum_pane").css("height", newHeight);
    $("#cpsum_c_pane").css("height", newHeight);
    //$("#main_cpSummary").css("height", newHeight);
}




