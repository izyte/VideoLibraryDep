Imports System.IO

Partial Class _Default
    Inherits VidCommon

    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load

        'If Session("LOG_INFO") Is Nothing Then
        '    Me.loginInfo.Value = "{""uid"":"""",""session"":""" & Session.SessionID & """,""uname"":"""",""urole"":""""}"
        'Else
        '    Me.loginInfo.Value = Session("LOG_INFO")
        'End If

        If vidAction = "vvw" Then
            Response.Redirect("VideoViewer.aspx?vid=" & vidID)
            Return
        End If

        If Session("LOG_INFO") Is Nothing Then
            Me.loginInfo.Value = BlankLogInfo()
        Else
            Me.loginInfo.Value = Session("LOG_INFO")
        End If

        If Session("NO_TREE") IsNot Nothing Then Me.noTree.Value = Session("NO_TREE")
        If Session("NO_PLAYER") IsNot Nothing Then Me.noVideo.Value = Session("NO_PLAYER")
        If Session("ITEMS_PER_PAGE") IsNot Nothing Then Me.itemsPerPageOld.Value = Session("ITEMS_PER_PAGE")


        Dim url_ As String = Request.Url.ToString().ToLower()
        Dim marker_ As Long = InStr(url_, "alvdv3500")
        LogEvent(url_, "Default.aspx.vb")


        If marker_ = 0 Then
            Dim urlArr_ As String() = Split(url_, "//")
            If urlArr_(0) <> "https:" Then
		urlArr_(0) = "http:"
                '//urlArr_(0) = "https:"
                '//(remarked 2018-oct-25 to bypass redirection!) Response.Redirect(Join(urlArr_, "//"))
            End If

        End If


    End Sub


End Class
