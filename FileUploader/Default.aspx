<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
    <div>
        <asp:FileUpload ID="fl" runat="server" />
        <input id="Button1" type="button" value="Upload File" 
            OnClick="useUploadFile('fl')"/>
    </div>
    <br />
    <div style="width:500px;background:yellow;height:30px;">
            <div id="progressBar" style="width:0%;height:100%;background:blue;color:white;">&nbsp;</div>
    </div>
    <span id="percentage" style="margin-right:50px;">0%</span><button onclick="cancelUpload()">Cancel</button>
        <br />
        <table>
            <tr><td>Parent Folder:</td><td><input type="text" id="fldParent" value="sample" /></td></tr>
            <tr><td>File Tag: </td><td><input type="text" id="fldTag" value="" /></td></tr>
            <tr><td>Target Filename: </td><td><input type="text" id="fldTarget" value="raw.*" /></td></tr>
            <tr><td>Initial Url: </td><td><input type="text" id="urlInitial" value="" style="width:1000px;"/></td></tr>
            <tr><td>Current Url: </td><td><input type="text" id="urlCurrent" value=""  style="width:1000px;"/></td></tr>
            <tr><td style="vertical-align:top;">Byte Array: </td><td><textarea rows="10" cols="100" id="txtBytes" style="width:1000px;"/>cccc</textarea></td></tr>
        </table>
    </form>
    <script src="js/FileUploader.js?v=<%=dt()%>"></script>
    <script src="js/FileUploaderUsage.js?v=<%=dt()%>"></script>
</body>
</html>
