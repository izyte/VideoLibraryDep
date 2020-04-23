<%@ Page Language="VB" AutoEventWireup="false" CodeFile="Admin.aspx.vb" Inherits="Admin" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <textarea id="txtSQL" style="height: 128px; width: 471px"></textarea>
    <br /><button id="btnSubmitSQL">Submit SQL</button>
    <form id="form1" runat="server">
    </form>

    <script type="text/javascript" src="js/jquery-3.1.0.min.js"></script>
    <script type="text/javascript" src="js/jquery-ui.min.js"></script>
    <script type="text/javascript" src="js/jquery.dataTables.min.js"></script>
    <script type="text/javascript" src="js/dataTables.select.min.js"></script>

    <script type="text/javascript" src="js/Admin.js?ver=<%=Version("js/Admin.js") %>"></script>

</body>
</html>
