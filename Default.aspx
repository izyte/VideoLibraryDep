<%@ Page Language="VB" AutoEventWireup="false" CodeFile="Default.aspx.vb" Inherits="_Default" %>

<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>SEPCo Inspection Video Library</title>
    <link rel="icon" href="favicon.ico?ver=2" type="image/x-icon" />
    <link rel="shortcut icon" href="favicon.ico?ver=2" type="image/x-icon" />
</head>

<body onresize="winResize();" onload="winResize();">

    <link rel="stylesheet" href="./css/bootstrap.min.css">
    <link href="./css/all.css" type="text/css" rel="stylesheet" media="all">
    <link rel="stylesheet" href="css/video.css" />
    <link rel="stylesheet" href="css/Buttons.css" />

    <link rel="stylesheet" href="css/MenuStyles.css?ver=<%=Version("css/MenuStyles.css") %>" />
    <link rel="Stylesheet" href="css/jquery.dataTables.min.css" />
    <link rel="stylesheet" href="css/select.dataTables.min.css" />
    <link rel="stylesheet" href="css/VideoLibrary.css?ver=<%=Version("css/VideoLibrary.css") %>" />
    <link rel="stylesheet" href="css/Scrolls.css?ver=<%=Version("css/Scrolls.css") %>" />
    <link rel="stylesheet" href="css/VideoPlayer.css" />
    <link rel="stylesheet" href="css/jquery-ui.min2.css?ver=<%=Version("css/jquery-ui.min2.css") %>" />
    <link rel="stylesheet" href="css/UserOptions.css?ver=<%=Version("css/UserOptions.css") %>" />


    <img src="images/video_clapper_85x85.gif" style="position: absolute; top: 0px; left: 0px;
        width: 1px; height: 1px;" />
    <img src="images/a_px.png" style="position: absolute; top: 0px; left: 0px; width: 1px;
        height: 1px;" />
    <div id="main_wrapper">
        <div id="header">
            <img src="images/shell_logo_d.png" id="site_logo" alt="" title="SEPCo IVL - Inspection Video Library" />
            <site_title>SEPCo - IVL</site_title>
            <site_sub_title>(Inspection Video Library)</site_sub_title>
        </div>
        <div class="sph">
            &nbsp;</div>




        <div id="menubar">
            <div id="menu">
                <button class='button menu_button' id="mnuHome" title="Navigate and view uploaded videos...">
                    Home</button>
                <button class='button' id="mnuManage" title="Upload videos and monitor progress status...">
                    Manage Uploads</button>
                <button class='button' id="mnuAbout" title="About Inspection Video Library (IVL)...">
                    About</button>
                <button class='button' id="mnuHelp" title="User guide...">
                    Help</button>
                <button class='button' id="mnuUser" title="User management...">
                    User Management</button>
            </div>
            <div id="menustat">
                <%=AppVer()%></div>
        </div>
        <div id="statusbar">
            <span>Location:&nbsp;</span>
            <location style="cursor: default; padding-right: 10px;
                flex-grow: 1; overflow: hidden; white-space: nowrap;"></location>
            <status id="staCurrentAction">&nbsp;</status>&nbsp;<activity id="staActivity">Initializing ...</activity>
        </div>
        <div class="sph" id="headerSeparator">&nbsp;</div>
        <div id="curtain" style="display: none;">&nbsp;</div>
        <div id="details_all" style="display: none;">
            <div id="tree" class="scroll4">
                <ul id="treeView">
                </ul>
            </div>
            <div id="details">
                <div class="spv2" id="sepTree">
                    <e title="click to toggle pane visibility...">.<br />.<br />.</e>
                </div>
                <div id="thumbnails" style="flex-grow:1;">
                    <div id="thumbsearch"  style="display: flex;justify-content: flex-start;">

                        <input type="text" id="vidSearchText" style="max-width:500px;"/>
                        <button id="btnVidSearch" class="button">
                            Search</button>
                        <button id="btnVidFilter" class="button" title="Click to set advanced filter parameters...">
                            Filter<sup><i id="icoAdvFilter" class="fa fa-filter pl-2 text-success" style="display:none;font-size:0.6rem;" title="Advanced filter applied..."></i></sup></button>
                    </div>
                    <div id="vidMultiSelectControls" style="display: none;justify-content: flex-end;">
                        <button id="btnVidSelect" class="button">Select All</button>
                        <button id="btnVidClear" class="button">Clear Selection</button>
                        <button id="btnVidInvert" class="button">Invert Selection</button>
                        <button id="btnVidEdit" class="button">Edit</button>
                        <button id="btnVidExit" class="button">Exit</button>

                    </div>
                    <div class="sph">&nbsp;</div>
                    <div id="gallery" class="scroll4">
                        <div id="nothumbnails">
                            Searching videos. Please wait ...</div>
                    </div><!-- gallery -->
                    <div id="paging">
                        <label for="ItemsPerPage">
                            Items per page</label>
                        <select id="ItemsPerPage">
                            <option value="5">5</option>
                            <option value="10" selected>10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <button class="button" id="btnPagePrev" title="Click to display previous page">
                        </button><span id="videoPages"> <a href="#" class="cpage">. . .</a> </span>
                        <button class="button" id="btnPageNext" title="Click to display next page">
                            ></button>
                        <!--label>
                            Go to:</label><input type="text" value="1" id="GoToPage" /-->
                    </div>
                </div>
                <!--end of thumbnails column-->
                <div class="spv2" id="sepPlayer">
                    <e title="click to toggle pane visibility...">.<br />.<br />.</e>
                </div>

                <div id="playing" class="flex-grow-1 br" 
                    style="display:flex;background:none;flex-direction:column;">

                    <div class="m-0 flex-grow-1 d-flex flex-column" style="height:100%;">
                        <!--video player-->
                        <div class="flex-grow-1" style="display:flex;background:black;flex-direction: column;">
                            <div id="player_new" class="c-video" style="display:none;background:none;margin:auto 0px;">
                                <video id="my-video" class="video m-0" controlsList="nodownload"
                                    style="margin:auto auto;"
                                    oncontextmenu="return false;" loop src=""></video>
                                <div class="controls">
                                    <div class="orange-bar">
                                        <div id="orange-time" class="orange-juice"></div>
                                    </div>
                                    <div class="buttons">
                                        <button id="play-pause" data-toggle="tooltip" data-placement="bottom"
                                            title="Play/Pause"><i class="far fa-play-circle"></i></button>
                                        <button id="rewind" data-toggle="tooltip" data-placement="bottom"
                                            title="Rewind 3 secs"><i class="fa fa-backward sm"></i></button>
                                        <button id="forward" data-toggle="tooltip" data-placement="bottom"
                                            title="Forward 3 secs"><i class="fa fa-forward sm"></i></button>
                                        <div style="flex-grow:1;">&nbsp;</div>
                                        <button id="mute-unmute" data-toggle="tooltip" data-placement="bottom"
                                            title="Mute/UnMute">
                                            <i class="fa fa-volume-up sm"></i>
                                        </button>
                                        <div class="volume-bar">
                                            <div class="volume"></div>
                                        </div>
                                        <button id="fullscreen" data-toggle="tooltip" data-placement="bottom"
                                            title="Fullcreen"><i class="far fa-square"></i></button>
                                    </div>
                                </div>
                            </div>

                            <div id="player" class="c-video" style="display:none;background:none;">
                                <video id="videoplayer" type="video/mp4" controls autoplay loop
                                    style="background-color: #000000;margin:auto auto;height:100%;background:none;">
                                    <source id="vid" src="">
                                    </source>
                                </video>
                                <!--v-container end-->
                            </div>                            

                        </div><!--new video player wrapper-->

                    </div>
                    <div class="d-flex" style="height:30px;">
                        <button class="m-1 btn btn-secondary btn-sm" style="height: 22px;" onclick="DownloadASX()">
                            <img src="images/asx16x16.png" alt="Download ASX File" title="Download ASX File" /></button>
                        <div class="mt-1" id="videotitle"  style="min-height:20px;"></div>

                    </div>
                    <div class="pt-0"  id="videodescription" 
                        style="min-height:20px;overflow: hidden;display:inline-block;">&nbsp;</div>
                    <div class="sph">&nbsp;</div>
                    <div id="comments_heading" class="pt-0" style="min-height:20px;">Comments:</div>
                    <div id="comments" class="scroll4" style="overflow-y:auto">&nbsp;</div>
                </div>

            </div>

                       <div id="uploaddetails">
                <div id="upload_controls">
                    <input type="file" id="fileSelected" multiple onchange="sendToQueue(this);">
                    <button id="selectFile" class="button">
                        Select File(s) to Upload</button>
                    <button id="clearSelection" class="button">
                        Clear File(s)</button>
                    <button id="uploadNow" class="button">
                        Start Uploading</button>
                    <div id="progressStatus">
                        <div id="progressBarContainer">
                            <span id="prgPercent">0&nbsp;%</span>
                            <div id="progressBar">
                                &nbsp;</div>
                        </div>
                        <span id="prgFilename">No file being uploaded......</span> <span id="prgPercentSize">
                            0 / 0</span>
                    </div>
                </div>
                <div class="sph">
                    &nbsp;</div>
                <div id="uploaddetails_sub">
                    <div id="currentuseruploads">
                        <div id="currentuseruploads_title">
                            &nbsp;</div>
                        <div class="sph">
                            &nbsp;</div>
                        <table id="tblCurrentQueue">
                            <thead>
                                <tr>
                                    <th>
                                        <div id="divSelectAllFiles" style="display: none;">
                                            <span>All</span><br />
                                            <input type="checkbox" id="chkSelectAllFiles"
                                                title="Select/UnSelect all items" />
                                        </div>
                                    </th>
                                    <th>
                                        Filename
                                    </th>
                                    <th>
                                        Size<br />
                                        (bytes)
                                    </th>
                                    <th>
                                        Location
                                    </th>
                                    <th>
                                        Status
                                    </th>
                                    <th>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div class="spv1">
                        &nbsp;</div>
                    <div id="serveruploads">
                        <div id="serveruploads_title">
                            Ongoing Uploads ( All Users )</div>
                        <div class="sph">
                            &nbsp;</div>
                        <table id="tblServerUploads">
                            <thead>
                                <tr>
                                    <th>
                                        Filename
                                    </th>
                                    <th>
                                        Size<br />
                                        (bytes)
                                    </th>
                                    <th>
                                        Completed<br />
                                        (%)
                                    </th>
                                    <th>
                                        User
                                    </th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div class="spv1">
                        &nbsp;</div>
                    <div id="serverencoding">
                        <div id="serverencoding_title">
                            Encoding Queue</div>
                        <div class="sph">
                            &nbsp;</div>
                        <table id="tblServerEncodings">
                            <thead>
                                <tr>
                                    <th>
                                        Filename
                                    </th>
                                    <th>
                                        Size<br />
                                        (bytes)
                                    </th>
                                    <th>
                                        Completed<br />
                                        (%)
                                    </th>
                                    <th>
                                        User
                                    </th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>



        </div>
        <div id="details_all_old" style="display: none;">

            <div id="uploaddetails">
                <div id="upload_controls">
                    <input type="file" id="fileSelected" multiple onchange="sendToQueue(this);">
                    <button id="selectFile" class="button">
                        Select File(s) to Upload</button>
                    <button id="clearSelection" class="button">
                        Clear File(s)</button>
                    <button id="uploadNow" class="button">
                        Start Uploading</button>
                    <div id="progressStatus">
                        <div id="progressBarContainer">
                            <span id="prgPercent">0&nbsp;%</span>
                            <div id="progressBar">
                                &nbsp;</div>
                        </div>
                        <span id="prgFilename">No file being uploaded......</span> <span id="prgPercentSize">
                            0 / 0</span>
                    </div>
                </div>
                <div class="sph">
                    &nbsp;</div>
                <div id="uploaddetails_sub">
                    <div id="currentuseruploads">
                        <div id="currentuseruploads_title">
                            &nbsp;</div>
                        <div class="sph">
                            &nbsp;</div>
                        <table id="tblCurrentQueue">
                            <thead>
                                <tr>
                                    <th>
                                        <div id="divSelectAllFiles" style="display: none;">
                                            <span>All</span><br />
                                            <input type="checkbox" id="chkSelectAllFiles"
                                                title="Select/UnSelect all items" />
                                        </div>
                                    </th>
                                    <th>
                                        Filename
                                    </th>
                                    <th>
                                        Size<br />
                                        (bytes)
                                    </th>
                                    <th>
                                        Location
                                    </th>
                                    <th>
                                        Status
                                    </th>
                                    <th>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div class="spv1">
                        &nbsp;</div>
                    <div id="serveruploads">
                        <div id="serveruploads_title">
                            Ongoing Uploads ( All Users )</div>
                        <div class="sph">
                            &nbsp;</div>
                        <table id="tblServerUploads">
                            <thead>
                                <tr>
                                    <th>
                                        Filename
                                    </th>
                                    <th>
                                        Size<br />
                                        (bytes)
                                    </th>
                                    <th>
                                        Completed<br />
                                        (%)
                                    </th>
                                    <th>
                                        User
                                    </th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div class="spv1">
                        &nbsp;</div>
                    <div id="serverencoding">
                        <div id="serverencoding_title">
                            Encoding Queue</div>
                        <div class="sph">
                            &nbsp;</div>
                        <table id="tblServerEncodings">
                            <thead>
                                <tr>
                                    <th>
                                        Filename
                                    </th>
                                    <th>
                                        Size<br />
                                        (bytes)
                                    </th>
                                    <th>
                                        Completed<br />
                                        (%)
                                    </th>
                                    <th>
                                        User
                                    </th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>

            <div id="details_old">
                <div id="thumbnails_old">
                    <div id="thumbsearch_old">

                        <div style="display: flex; text-align: right;">


                        </div>
                    </div>

                    <div id="gallery_old" class="scroll4">
                        <div id="nothumbnails_old">
                            Searching videos. Please wait ...</div>
                        <!--div class="box">
                            <div>
                                <img class="thumb" src="Videos/G0045601/V00456010000021/tpost.png" />
                                <duration>01:30:25</duration>
                            </div>
                            <water class="rotate">Encoding</water>
                            <div class="vtitle">This is the video title</div>
                            <div class="vasset">Asset</div>
                            <views>12345</views>

                            <img class="acn_edit_img_det" src="images/Edit_16x16.png" title="Edit video details" />
                            <img class="acn_delete_img_det" src="images/delete_12x12.png" title="Delete video" />
                            
                        </div>
                        <!--div class="box">
                            <div>
                                <img src="Videos/G0045488/V00876940000006/tpost.png" />
                                <duration>01:30:25</duration>
                            </div>
                            <vtitle>The quick brown fox jumps over the lazy dog.</vtitle>
                            <views>12345</views>
                        </div>
                        <div class="box">
                            <div>
                                <img src="Videos/G0045488/V00876940000006/tpost.png" alt="Inlay carving with a router pantograph" />
                                <duration>01:30:25</duration>
                            </div>
                            <vtitle>The quick brown fox jumps over the lazy dog.</vtitle>
                            <views>12345</views>
                        </div>
                        <div class="box">
                            <div>
                                <img src="Videos/G0045488/V00876940000004/tpost.png" alt="Inlay carving with a router pantograph" />
                                <duration>01:30:25</duration>
                            </div>
                            <vtitle>The quick brown fox jumps over the lazy dog.</vtitle>
                            <views>12345</views>
                        </div>
                        <div class="box">
                            <div>
                                <img src="Videos/G0045488/V00876940000004/tpost.png" alt="" />
                                <duration>01:30:25</duration>
                            </div>
                            <vtitle>The quick brown fox jumps over the lazy dog.</vtitle>
                            <views>12345</views>
                        </div-->
                    </div>
                    <div id="paging_old">
                        <label for="ItemsPerPage">
                            Items per page</label>
                        <select id="ItemsPerPage">
                            <option value="5">5</option>
                            <option value="10" selected>10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <button class="button" id="btnPagePrev" title="Click to display previous page">
                        </button><span id="videoPages"> <a href="#" class="cpage">. . .</a> </span>
                        <button class="button" id="btnPageNext" title="Click to display next page">
                            ></button>
                        <!--label>
                            Go to:</label><input type="text" value="1" id="GoToPage" /-->
                    </div>
                </div>

                <div id="playing_old">
                    <!--main video player 20200121 -->



                </div>
            </div>
        </div><!-- end of details_all -->
        <div class="sph">&nbsp;</div>
        <div id="footer">SEPCo - Inspection Video Library</div>
    </div>
    <!--end of main wrapper-->
    <div id="mask">
        &nbsp;</div>
    <img id="loading_img" alt="busy" src="images/busy.gif" />


    <div id="duration_form" title="Create ASX File" style="overflow: hidden;">
        <p style="margin:10px 5px;line-height:20px;" id="lblASXTitle">Enter ASX File title</p>
        <div style="display:flex;flex-direction:column;">
            <input style="padding:5px;color:black;border-radius:5px;" type="text" id="vidASXTitle" value="title" />
        </div>
        <p style="margin:15px 5px;line-height:20px;" id="durLabel">Enter Video Duration</p>
        <div>
            <input style="padding:5px;color:black;border-radius:5px;text-align:center;" type="text" id="durValue"
                value="0" /><span>&nbsp;&nbsp;Seconds</span>
        </div>
    </div>

    <div id="login_form" title="User Login" style="overflow: hidden;">
        <div class="form-group d-flex justify-content-end">
            <label  for="logUID">User ID:</label>
            <input class="form-control form-control-sm ml-3" type="text"  style="width:150px;" id="logUID" value="">
        </div>
        <div class="form-group d-flex justify-content-end">
            <label   for="logPWD">
                Password:</label>
            <input class="form-control form-control-sm ml-3" type="password"  style="width:150px;" id="logPWD" value="">
        </div>
    </div>

    <div id="chgpass_form" title="Change Password" style="margin:0px;padding:0px;overflow:hidden;">
        <iframe frameborder="0" src="" id="ChangePasswprd"></iframe>
    </div>

    <div id="asset_selector" title="Asset Selector">
        <div id="details_tree" class="scroll4">
        </div>
    </div>
    <div id="user_management" title="User Management">
        <iframe frameborder="0" src="" id="userManagement"></iframe>
    </div>
    <div id="about_dialog" title="About Inspection Video Library" style="overflow:hidden;">
        <div id="aboutVer"
            style="display:none;position:absolute;z-index:100;color:red;top:120px;font-size:0.8em;text-align:right;width:495px;">
            <%=AppVer()%></div>
        <img style="position:relative;" src="images/ivl.png" title="About instpection Video Library"
            alt="About instpection Video Library" />
    </div>
    <div id="video_filter" title="Video Filter" style="overflow:hidden;">
        <table id="tblVideoFilter" border="0">
            <tr>
                <td><input type="checkbox" id="fltInclCampaign" title="Include campaign when filtering ..." /></td><td>Campaign</td>
                <td>
                    <!--input type="text" id="fltCampaign" style="width: 320px;" placeholder="Enter conatined text ..." /-->
                    <select id="fltCampaign" style="width: 320px;">
                        <option value="All">All</option>
                    </select>
                </td>

            </tr>
            <tr>
                <td><input type="checkbox" id="fltInclInspOrInt" title="Include Inspection or Intervention when filtering ..." /></td><td>
                    Inspection Or Intervention?
                </td>
                <td>
                    <select id="fltInspOrInt" style="width: 320px;">
                        <option value="all">« All »</option>
                        <option value="Unspecified">Unspecified</option>
                        <option value="Inspection">Inspection</option>
                        <option value="Intervention">Intervention</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td><input type="checkbox" id="fltInclInspType" title="Include inspection type when filtering ..." /></td><td>
                    Inspection Type
                </td>
                <td>
                    <select id="fltInspType" style="width: 320px;">
                        <option value="all">« All »</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td><input type="checkbox" id="fltInclMaintItemNo" title="Include maintenance item number when filtering ..." /></td>
                <td>
                    Maintenance Item No.
                </td>
                <td>
                    <input type="text" id="fltMaintItemNo" style="width: 320px;"
                        placeholder="Enter contained text or blank to filter for unpecified entries..." />
                </td>
            </tr>
            <tr>
                <td><input type="checkbox" id="fltInclScope" title="Include inspection date when filtering ..." /></td><td>
                    Inspection Date (inclusive)
                </td>
                <td>
                    <select id="fltScope" style="width: 90px;">
                        <option selected="selected" value="all" >All</option>
                        <option value="unspecified">« Unspecified »</option>
                        <option value="before">Before</option>
                        <option value="after">After</option>
                        <option value="between">Between</option>
                    </select>
                    From-<input type="text" id="fltFromID" onfocus="this.blur();" ondblclick="this.value='';"
                        placeholder="" style="width: 75px; text-align: center;" />&nbsp; To-<input type="text"
                        id="fltToID" onfocus="this.blur();" ondblclick="this.value='';" placeholder=""
                        style="width: 75px; text-align: center;" />
                </td>
            </tr>
            <tr>
                <td colspan="4">
                </td>
            </tr>
        </table>
    </div>
    <div id="debug" title="Debug details" style="overflow: hidden;">
        <textarea id="debugDetails" cols="80" style="width: 100%; height: 100%; color: Black;">
    </textarea>
    </div>
    <div id="video_details" title="Video Details" style="overflow:hidden;">
        <div id="details_main">
            <div id="details_fields" class="container-fluid">
                <div class="form-group mt-3" >
                    <label for="vidSource" id="lblSource">Source File</label>
                    <input class="form-control" type="text" disabled id="vidSource" value="Current Video File.mks">
                </div>
                <div class="form-group">
                     <input type="checkbox"  id="vidCommonTitle" class="clone" checked="checked" title="Apply common title" />
                            <label for="vidTitle">Title *</label>
                     <input class="form-control" type="text" id="vidTitle" placeholder="Enter video title here" />
                </div>
                <div class="form-group">
                    <input type="checkbox"  id="vidCommonAssetName" class="clone" checked="checked" title="Apply common location" />
                    <label for="vidAssetName">Location</label>
                    <div class="input-group">
                        <input class="form-control" type="text" id="vidAssetName" onfocus="this.blur();"
                                placeholder="Click the asset selector button" />
                        <div class="input-group-append">
                            <button class="btn btn-primary" style="padding: 0px; margin-top: 0px; width: 28px; height: 28px;
                                margin: 0px; font-weight: bolder;" id="btnAssetSelector"
                                title="Click to launch asset selector...">
                                ...</button>
                            <!--span class="input-group-text">

                            </!--span-->
                        </div>

                    </div>
                </div>

                <div class="form-group">
                    <input type="checkbox"  id="vidCommonDescription" class="clone" checked="checked" title="Apply common description" />
                    <label for="vidDescription">Description</label>
                    <textarea class="form-control" rows="3" id="vidDescription" 
                        placeholder="Enter video description here"></textarea>
                </div>

                <div class="form-group">
                    <input type="checkbox"  id="vidCommonComment" class="clone" checked="checked" title="Apply common comment" />
                    <label for="vidComment" >Comment</label>
                    <textarea class="form-control" rows="6" id="vidComment" 
                        placeholder=""Enter comments here"></textarea>
                </div>

                <div class="form-group">
                    <input type="checkbox"  id="vidCommonCampaign" class="clone" checked="checked" title="Apply common campaign" />
                    <label for="vidCampaign">Campaign</label>
                    <input class="form-control" type="text" id="vidCampaign" placeholder="Enter campaign title here">
                </div>

                <div class="form-group" style="justify-content:flex-start;">
                    <input type="checkbox"  id="vidCommonInspOrInt" class="clone" checked="checked" title="Apply common inspection or intervention" />
                    <label for="vidInspOrInt" style="width:180px;">Inspection or Intervention?</label>
                    <select class="form-control" id="vidInspOrInt" style="width:200px;">
                        <option value=""></option>
                        <option value="Inspection">Inspection</option>
                        <option value="Intervention">Intervention</option>
                    </select>
                    <input type="checkbox"  id="vidCommonInspType" class="clone" 
                        style="margin-left:56px;"
                        checked="checked" title="Apply common inspection type" />
                    <label for="vidInspType"  class="lbl2c" style="width:130px;">Inspection Type?</label>
                    <input class="form-control" type="text" style="width:200px;"
                        id="vidInspType" placeholder="Input inspection type" />
                </div>
                <div class="form-group pb-4" style="justify-content:flex-start;border-bottom:solid 1px gray;">
                    <input type="checkbox"  id="vidCommonMaintItemNo" class="clone" checked="checked" title="Apply common maintenance item #" />
                    <label for="vidMaintItemNo"  style="width:180px;" >Maintenance Item #</label>
                    <input class="form-control" type="text" id="vidMaintItemNo" 
                         style="width:200px;" placeholder="Maintenance Item #" />

                    <input type="checkbox"  id="vidCommonInspDate" class="clone" 
                        style="margin-left:56px;"
                        checked="checked" title="Apply common inspection date" />

                    <label for="vidInspDate" class="lbl2c" style="width:130px;">Inspection Date</label>
                    <input class="form-control" type="text" id="vidInspDate" 
                        style="width:200px;" onfocus="this.blur();" 
                        ondblclick="this.value='';" placeholder="Click to change date" />
                </div>
                <h6>* - Mandatory field(s)</h6>
            </div>
            <!--end of data_fields-->
        </div>
        <div id="userOptions" style="display:none;">
            <ul>
                <li>Change password ...</li>
                <li>Logout</li>
            </ul>
        </div>
    </div>
    <form id="form2" runat="server">
        <asp:HiddenField ID="vidGroupID" runat="server" />
        <asp:HiddenField ID="vidAssetID" runat="server" />
        <asp:HiddenField ID="noVideo" runat="server" />
        <asp:HiddenField ID="itemsPerPageOld" runat="server" />
        <asp:HiddenField ID="noTree" runat="server" />
        <asp:HiddenField ID="fltAdvParams" runat="server" />
        <input id="clipboard" type="text" value="" style="border: none; position: absolute;
        z-index: 0; top: 0px; left: 0px; width: 1px; height: 1px; background: #282828;
        color: #282828;" />
        <asp:HiddenField ID="loginInfo" runat="server" />
    </form>


    <script type="text/javascript" src="js/jquery-3.1.0.min.js"></script>
    <script type="text/javascript" src="js/jquery-ui.min.js"></script>
    <script type="text/javascript" src="js/jcanvas.min.js"></script>
    <script type="text/javascript" src="js/jquery.dataTables.min.js"></script>
    <script type="text/javascript" src="js/spin.js"></script>
    <script type="text/javascript" src="js/FileSaver.min.js"></script>
    <script type="text/javascript" src="js/jquery.spin.js"></script>
    <script type="text/javascript" src="js/dataTables.select.min.js"></script>
    <script type="text/javascript" src="js/VideoLibraryMain.js?ver=<%=Version("js/VideoLibraryMain.js") %>"></script>
    <script type="text/javascript" src="js/UploadChunks.js?ver=<%=Version("js/UploadChunks.js") %>"></script>

    <script src="./js/popper.min.js"></script>
    <script src="./js/bootstrap.min.js"></script>
    <script src="./js/video.js"></script>


</body>

</html>