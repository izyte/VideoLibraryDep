<%@ Page Language="VB" AutoEventWireup="false" CodeFile="Default3.aspx.vb" Inherits="Default3" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>

    <link rel="stylesheet" href="css/VideoLibrary.css" />
    <link rel="stylesheet" href="css/VideoPlayer.css" />
    <link rel="stylesheet" href="css/InputRange.css" />
    <link rel="stylesheet" href="css/Buttons.css" />
    <link rel="stylesheet" href="css/MenuStyles.css" />
    <link rel="Stylesheet" href="css/jquery.dataTables.min.css" />
    <link rel="stylesheet" href="css/select.dataTables.min.css" />
       
        
    <style type="text/css">
        

    </style>
</head>
<body>
<div align="left" style="display:block;">
    <ul id="tree">
        <li>
            <img class="m" src="images/a_px.png" /><span>Root</span>
            <ul>
                <li>
                    <img src="images/a_px.png" style="background-image:url(Videos/G0045488/V00876940000001/tmb05.png);" /><span>This should be green!</span></li>
                <li class="exp">
                    <img class="m" src="images/a_px.png" /><span>This is also green...</span>
                    <ul>
                        <li>
                            <img src="images/a_px.png" class="p" /><span>But this is not, it's, um...blue!</span></li>
                        <li>
                            <img src="images/a_px.png" /><span>And so on...</span></li>
                    </ul>
                </li>
                <li class="col"><img src="images/a_px.png" class="m" /><span>This is also green...</span>
                    <ul>
                        <li><img src="images/a_px.png" /><span>But this is not, it's, um...blue!</span></li>
                        <li><img src="images/a_px.png" /><span>And so on...</span></li>
                    </ul>
                </li>
            </ul>
        </li>
    </ul>
</div>
</body>
</html>
