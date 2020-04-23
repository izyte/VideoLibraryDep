<%@ Page Language="VB" AutoEventWireup="false" CodeFile="VideoViewer2.aspx.vb" Inherits="VideoViewer2" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <title>Responsive Player2</title>
  <style type="text/css">
    .containing-block {
      width: 75%;
    }
    .outer-container {
      position: relative;
      height: 0;
      padding-bottom: 56.25%;
    }
    .BrightcoveExperience {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  </style>
</head>

<body>
  <p>Lorem ipsum dolor sit amet, ...</p>
  <br />
  <div class="containing-block">
    <div class="outer-container">

    <video width="400" height="200" id="videoplayer" type="video/mp4" autoplay controls loop style="background-color: #000000;"
                poster="videos/G0102107/V00453070000049/tpost.png">
                <source id="vid" src="videos/G0102107/V00453070000049/video.mp4"></source>
    </div>
  </div>
  <p>Lorem ipsum dolor sit amet, ...</p>
</body>
</html>
