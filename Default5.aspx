<%@ Page Language="VB" AutoEventWireup="false" CodeFile="Default5.aspx.vb" Inherits="Default5" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <link rel="stylesheet" href="css/UserOptions.css?ver=<%=Version("css/UserOptions.css") %>" />
    <div style="background:red;position:absolute;top:100px;left:0px;padding:0px;margin:0px;">
   <ul class="uopt">
      <li>Welcome </li>
      <li>
          <span><a>Archangel Villarojo!&nbsp;<img src="images/down_a.png" /></a></span>
          <ul class="dropdown" >
              <li><a href="#">Change&nbsp;password</a></li>
              <li><a href="#">Log out</a></li>
          </ul>
      </li>
   </ul>
   </div>
</body>
</html>
