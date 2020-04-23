Imports System.Threading
Imports System.Data
Imports System.Data.OleDb
Imports System.Web.HttpUtility

Partial Class DiagToolData
    Inherits VidCommon

    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load
        Select Case vidAction
            Case "diagmemo"
                'Prompt("Diagnose memo")
                Dim txt As String = "The quick " & vbCrLf & " brown fox "" jumps" & vbCrLf & vbCrLf & vbCrLf & vbCrLf & " over the lazy dog!!!"

                Dim line As String = ""
                'Save text to database

                Try


                    Dim cn As OleDbConnection = Conn
                    Dim cmd As New OleDbCommand("SP_GET_DIAGNOSE", cn)
                    cmd.CommandType = CommandType.StoredProcedure
                    cmd.Parameters.Add(New OleDbParameter("NAME", Request.Params("name")))
                    Dim rdr As OleDbDataReader = cmd.ExecuteReader()
                    Dim memo As String = ""
                    If rdr.HasRows Then
                        rdr.Read()
                        'save data to memo
                        'Response.Write("{""result"":""success"",""msg"":""" & Uri.EscapeUriString(rdr("DIAG_MEMO1")) & """}")

                        ' Get data from memo
                        memo = rdr("DIAG_MEMO3")


                    End If

                    line = "After getting data..."

                    cmd = New OleDbCommand("SP_UPDATE_DIAGNOSE_MEMO2", cn)
                    cmd.CommandType = CommandType.StoredProcedure
                    cmd.Parameters.Clear()
                    cmd.Parameters.Add(New OleDbParameter("NAME", Request.Params("name")))

                    txt = Uri.UnescapeDataString(Request.Params("memo2"))

                    cmd.Parameters.Add(New OleDbParameter("MEMO2", txt))

                    Dim result As Long = cmd.ExecuteNonQuery()

                    line = "After updating data..."



                    If cn.State = ConnectionState.Open Then cn.Close()
                    cn.Dispose()

                    Response.Write("{""result"":""success"",""msg"":""" & Uri.EscapeUriString("Got Data: " & vbCrLf & vbCrLf & memo & vbCrLf & vbCrLf & "Saved data:" & result & vbCrLf & vbCrLf & "Saved memo: " & vbCrLf & txt) & """}")

                    'Response.Write("{""result"":""success"",""msg"":""" & Uri.EscapeUriString(txt) & """}")

                Catch ex As Exception
                    Response.Write("{""result"":""error"",""msg"":""" & Uri.EscapeUriString("Line:" & line & vbCrLf & vbCrLf & ex.Message) & """}")
                End Try


        End Select
    End Sub
End Class
