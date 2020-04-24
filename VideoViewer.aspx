<%@ Page Language="VB" AutoEventWireup="false" CodeFile="VideoViewer.aspx.vb" Inherits="VideoViewer" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Inspection Video Library Viewer</title>
</head>
<body>
    <link rel="stylesheet" href="css/VideoViewer.css?ver=<%=Version("css/VideoViewer.css") %>" />
    <link rel="stylesheet" href="css/Scrolls.css?ver=<%=Version("css/Scrolls.css") %>" />
    <div id="divMain">
        <div id="divPlayer">
            <video id="videoplayer" type="video/mp4" autoplay controls loop style="background-color: #000000;"
                poster="<%=vvwPoster %>">
                <source id="vid" src="<%=vvwSource %>"></source>
        </div>
        <div id="divTitle"><%= vvwTitle%></div>
        <div id="divDesc"><%= vvwDescription%></div>
        <div id="divCommHead">Comments :</div>
        <div id="divComm" class="scroll4"><%= vvwComments%></div>
        <input type="text" style="display:none;position:absolute;top:0px;left:0px;width=200px;z-index:1000;color:Black;" value="123"  id="hw" />
    </div>
    <script type="text/javascript" src="js/jquery-3.1.0.min.js"></script>
    <script type="text/javascript" src="js/jquery-ui.min.js"></script>
    <script type="text/javascript" src="js/jcanvas.min.js"></script>
    <script type="text/javascript" src="js/jquery.dataTables.min.js"></script>
    <script type="text/javascript" src="js/spin.js"></script>
    <script type="text/javascript" src="js/jquery.spin.js"></script>
    <script type="text/javascript" src="js/VideoViewerMain.js?ver=<%=Version("js/VideoViewerMain.js") %>"></script>
</body>
</html>
