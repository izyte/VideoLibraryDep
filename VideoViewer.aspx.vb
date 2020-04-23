Imports System.Data
Imports System.Data.OleDb
Imports System.IO

Partial Class VideoViewer
    Inherits VidCommon
    Dim vvwTitle_ As String = ""
    ReadOnly Property vvwTitle As String
        Get
            Return escText(vvwTitle_)
        End Get
    End Property

    Dim vvwDescription_ As String = ""
    ReadOnly Property vvwDescription As String
        Get
            Return escText(vvwDescription_)
        End Get
    End Property

    Dim vvwComments_ As String = ""
    ReadOnly Property vvwComments As String
        Get
            Return escText(vvwComments_)
        End Get
    End Property

    Dim vvwPoster_ As String = ""
    ReadOnly Property vvwPoster As String
        Get
            Return vvwPoster_
        End Get
    End Property

    Dim vvwSource_ As String = ""
    ReadOnly Property vvwSource As String
        Get
            Return vvwSource_
        End Get
    End Property

    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load
        GetVideoInfo()
    End Sub

    Sub GetVideoInfo()

        Dim sql As String = "SELECT * FROM TBL_VIDEOS WHERE vid_id=" & vidID & ";"
        Dim tbl As DataTable = ReadToTableSP(sql, IsSQL:=True)

        'Response.Write(sql & "<br/>" & tbl.Rows.Count & "<br/>")

        If tbl.Rows.Count Then
            Dim r As DataRow = tbl.Rows(0)
            vvwTitle_ = r("vid_title")
            vvwDescription_ = r("vid_description")
            vvwComments_ = r("vid_comments")

            vvwComments_ = r("vid_comments")
            vvwSource_ = GetVideoFolder(r("vid_id"), r("vid_group_ftag"), r("vid_asset_ftag"), ReturnURLPath:=True) & "/video.mp4"

        Else
            vvwTitle_ = "No Video Found!"
            vvwDescription_ = "&nbsp;"
            vvwComments_ = "&nbsp;"
            vvwPoster_ = "images/clapper_e.png"
            vvwSource_ = ""
        End If

        tbl.Dispose()

    End Sub
End Class
