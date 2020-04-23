Imports DAO
Partial Class AdminData
    Inherits VidCommon

    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load
        Select Case Request.Params("acn") & ""
            Case "admupdsql"
                AdminUpdateSQL()
        End Select
    End Sub

    Sub AdminUpdateSQL()
        Dim sql As String = Request.Params("sql")
        Dim dPath As String = Server.MapPath("App_Data/VideoLibrary.mdb")
        Dim dbe As New DAO.DBEngine

        Dim db As DAO.Database = dbe.OpenDatabase(dPath)
        Try
            Dim qd As QueryDef = db.QueryDefs(Request.Params("qd"))
            qd.SQL = sql
            qd.Close()
            Response.Write("Success")
        Catch ex As Exception
            Response.Write("error:" & ex.Message)
        End Try

        Try
            db.Close()

        Catch ex As Exception

        End Try
    End Sub
End Class
