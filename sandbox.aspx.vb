Imports System.Data
Imports System.Data.OleDb
Imports System.IO
Imports Newtonsoft.Json

Partial Class sandbox
    Inherits System.Web.UI.Page

    ReadOnly Property CnStr() As String
        Get
            Return ConfigurationManager.ConnectionStrings("CONNECTION_STRING").ConnectionString
        End Get
    End Property

    Private ReadOnly Property Conn As OleDbConnection
        Get
            Dim cn As New OleDbConnection(CnStr)
            cn.Open()
            Return cn
        End Get
    End Property

    Private Sub sandbox_Load(sender As Object, e As EventArgs) Handles Me.Load
        Response.Write("Hello page " & CnStr & ": " & GetCampaigns())
        Dim acn As String = Request.Params("acn") & ""

        Select Case acn
            Case "comp"

        End Select

    End Sub


    Private Function GetCampaigns() As String
        Dim tbl As DataTable = ReadToTableSP("select distinct vid_campaign as cmp from TBL_VIDEOS where not vid_deleted order by vid_campaign;")
        Dim ret As String = TableToJSON(tbl)
        tbl.Dispose()
        Return ret
    End Function

    Function TableToJSON(tbl As DataTable) As String
        Dim ret As String = String.Empty
        ret = JsonConvert.SerializeObject(tbl)
        Return ret
    End Function

    Function ReadToTableSP(ByVal SPName As String, _
                           Optional ByVal ParamArr As OleDbParameter() = Nothing, _
                           Optional ByVal cnn As OleDbConnection = Nothing, _
                           Optional ByVal IsSQL As Boolean = False) As DataTable

        '** Note : parameters must be passed in the same order at they are defined in the stored procedure

        If Left(LCase(SPName), 7) = "select " Then IsSQL = True

        Dim retVal As New DataTable(IIf(IsSQL, SPName, "OUTTBL"))
        Dim da As OleDbDataAdapter = Nothing
        Dim cn As OleDbConnection = Nothing
        Dim cmd As OleDbCommand = Nothing

        Dim alwaysPrompt As Boolean = False

        Try
            If cnn IsNot Nothing Then
                cn = cnn
            Else
                cn = Conn
            End If
            cmd = New OleDbCommand(SPName, cn)

            If IsSQL Then
                cmd.CommandType = CommandType.Text
            Else
                cmd.CommandType = CommandType.StoredProcedure
            End If


            da = New OleDbDataAdapter(cmd)

            Dim par As OleDbParameter

            If ParamArr IsNot Nothing Then
                For Each par In ParamArr
                    cmd.Parameters.Add(par)
                Next
            End If

            da.Fill(retVal)


            cmd.Dispose()

            'Response.Write("<br/>Fill completed!!!")

        Catch ex As Exception


        Finally

            If cmd IsNot Nothing Then cmd.Dispose()
            If da IsNot Nothing Then da.Dispose()

            If cn IsNot Nothing Then
                If cn.State = ConnectionState.Open Then cn.Close()
                cn.Dispose()
            End If

        End Try

        Return retVal
    End Function
End Class
