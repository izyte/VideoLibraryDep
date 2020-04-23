<%@ Page Language="VB" AutoEventWireup="false" CodeFile="VideoManagement.aspx.vb" Inherits="VideoManagement" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>SEPCo IVL Management Tool</title>
    <link rel="icon" href="favicon.ico?ver=2" type="image/x-icon" />
    <link rel="shortcut icon" href="favicon.ico?ver=2" type="image/x-icon" />
</head>
<body>
    <link rel="stylesheet" href="css/InputRange.css" />
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
            <site_title>SEPCo - IVL Management Tool</site_title>
            <site_sub_title>&nbsp;</site_sub_title>
        </div>
        <div class="sph">
            &nbsp;</div>
        <div id="menubar">
            <div id="menu">Menu bar ...
                <!--button class='button menu_button' id="mnuHome" title="Navigate and view uploaded videos...">
                    Home</button>
                <button class='button' id="mnuManage" title="Upload videos and monitor progress status...">
                    Manage Uploads</button>
                <button class='button' id="mnuAbout" title="About Inspection Video Library (IVL)...">
                    About</button>
                <button class='button' id="mnuHelp" title="User guide...">
                    Help</button>
                <button class='button' id="mnuUser" title="User management...">
                    User Management</button-->
            </div>
            <div id="menustat">
                <%=AppVer()%></div>
        </div>
        <div id="statusbar">
            <span>Status ...&nbsp;</span><location style="cursor: default; padding-right: 10px;
                flex-grow: 1; overflow: hidden; white-space: nowrap;"></location>
            <status id="staCurrentAction">&nbsp;</status>&nbsp;<activity id="staActivity">&nbsp;</activity>
        </div>
        <div class="sph" id="headerSeparator">
            &nbsp;</div>

        <div id="details_all" style="display: flex;">
            <div id="tree" class="scroll4">
                This is the tree section
                <ul id="treeView">
                </ul>
            </div>
            <div class="spv2" id="sepTree">
                &nbsp;
            </div>

            <div id="details" style="color:White;">
            Details section<br />
            <button style="height:35px;color:Black;padding:5px;margin:5px;border-radius:5px;" id="testDownload">Test Download</button>
            </div>
        </div>
        <div class="sph">
            &nbsp;</div>
        <div id="footer">
            SEPCo - Inspection Video Library</div>
    </div>
    <div id="mask">
        &nbsp;</div>
    <img id="loading_img" alt="busy" src="images/busy.gif" />
    <div id="login_form" title="User Login">
        <table cellspacing="10" id="logTable">
            <tr>
                <td>
                    <label for="logUID">
                        User ID:</label>
                </td>
                <td>
                    <input type="text" id="logUID" value="">
                </td>
            </tr>
            <tr>
                <td>
                    <label for="logPWD">
                        Password:</label>
                </td>
                <td>
                    <input type="password" id="logPWD" value="">
                </td>
            </tr>
        </table>
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
    <div id="video_filter" title="Video Filter">
        <table id="tblVideoFilter" border="0">
            <tr>
                <td>
                    Inspection Or Intervention?
                </td>
                <td>
                    <select id="fltInspOrInt" style="width: 335px;">
                        <option value="All">All</option>
                        <option value="Unspecified">Unspecified</option>
                        <option value="Inspection">Inspection</option>
                        <option value="Intervention">Intervention</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    Inspection Type
                </td>
                <td>
                    <input type="text" id="fltInspType" style="width: 320px;" placeholder="Enter conatined text ..." />
                </td>
            </tr>
            <tr>
                <td>
                    Maintenance Item No.
                </td>
                <td>
                    <input type="text" id="fltMaintItemNo" style="width: 320px;" placeholder="Enter conatined text ..." />
                </td>
            </tr>
            <tr>
                <td>
                    Inspection Date (inclusive)
                </td>
                <td>
                    <select id="fltScope" style="width: 100px;">
                        <option value="All">All</option>
                        <option value="Unspecified">Unspecified</option>
                        <option value="Before">Before</option>
                        <option value="After">After</option>
                        <option value="Between">Between</option>
                    </select>
                    From-<input type="text" id="fltFromID" disabled onfocus="this.blur();" ondblclick="this.value='';"
                        placeholder="" style="width: 65px; text-align: center;" />&nbsp; To-<input type="text"
                            id="fltToID" disabled onfocus="this.blur();" ondblclick="this.value='';" placeholder=""
                            style="width: 65px; text-align: center;" />
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
    <div id="video_details" title="Video Details">
        <div id="details_main">
            <div id="details_fields">
                <table id="tblVideoDetails" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <label for="vidSource">
                                Source File</label>
                        </td>
                        <td>
                            <input type="text" disabled id="vidSource" value="Current Video File.mks">
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label for="vidTitle">
                                Title *</label>
                        </td>
                        <td>
                            <input type="text" id="vidTitle" placeholder="Enter video title here">
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label for="vidAssetName">
                                Location</label>
                        </td>
                        <td style="display: flex;">
                            <input type="text" id="vidAssetName" onfocus="this.blur();" placeholder="Click the asset selector button">
                            <button class="button" style="padding: 0px; margin-top: 0px; width: 28px; height: 28px;
                                margin: 0px; font-weight: bolder;" id="btnAssetSelector" title="Click to launch asset selector...">
                                ...</button>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label for="vidDescription">
                                Description</label>
                        </td>
                        <td>
                            <textarea rows="3" id="vidDescription" placeholder="Enter video description here"></textarea>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label for="vidComment">
                                Comment</label>
                        </td>
                        <td>
                            <textarea rows="6" id="vidComment" placeholder="Enter comments here"></textarea>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label for="vidInspOrInt">
                                Inspection or Intervention?</label>
                        </td>
                        <td style="display: flex; justify-content: space-between;">
                            <select id="vidInspOrInt">
                                <option value=""></option>
                                <option value="Inspection">Inspection</option>
                                <option value="Intervention">Intervention</option>
                            </select>
                            <div>
                                <label for="vidInspType" style="width: 160px;">
                                    Inspection Type</label><input type="text" id="vidInspType" placeholder="Input inspection type">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label for="vidMaintItemNo">
                                Maintenance Item #</label>
                        </td>
                        <td style="display: flex; justify-content: space-between;">
                            <input type="text" id="vidMaintItemNo" placeholder="Maintenance Item #">
                            <div>
                                <label for="vidInspDate" style="margin-left: 20px;">
                                    Inspection Date</label>
                                <input type="text" id="vidInspDate" onfocus="this.blur();" ondblclick="this.value='';"
                                    placeholder="Click to change date">
                            </div>
                            <!--button class="button" title="Click to select a new date" style="width:28px;height:28px;padding:0px;font-weight:bold;background-image:url(images/calendar_b.png);background-repeat:no-repeat;background-position:center center;background-color:#1a1a86;">&nbsp;</button-->
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" style="font-size: 9px; vertical-align: bottom; height: 25px;">
                            * - Mandatory field(s)
                        </td>
                    </tr>
                </table>
            </div>
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
    <script type="text/javascript" src="js/jquery.spin.js"></script>
    <script type="text/javascript" src="js/dataTables.select.min.js"></script>

    <script type="text/javascript" src="js/VideoManagement.js?ver=<%=Version("js/VideoManagement.js") %>"></script>
</body>
</html>
