

Imports System.Threading
Imports System.Data
Imports System.Data.OleDb
Imports System.Web.HttpUtility


Partial Class VideoData
    Inherits VidCommon


    Private debugMode As Boolean = True
    Private cProcess As Hashtable



    Structure ProcessStatus

        Dim StatusFile As String
        Dim Duration As DateTime
        Dim Percentage As Double
        Dim VideoTime As DateTime
        Dim Frame As Long
        Dim FPS As Integer
        Dim Size As Long
        Dim BitRate As Double
        Dim Dup As Integer
        Dim Drop As Integer
        Dim Speed As Double
        Dim Q As Double

    End Structure

 

    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load
        LogEvent("VideoData start")
        Select Case vidAction

            Case "setipp"

                Session("ITEMS_PER_PAGE") = parIPP

            Case "setpane"

                If parObjID = "tree" Then
                    Session("NO_TREE") = parMode
                ElseIf parObjID = "playing" Then
                    Session("NO_PLAYER") = parMode
                End If

            Case "rstvi"
                ResetNewVideoID()
                Exit Sub
            Case "chn"
                GetChildNodes()
            Case "delall"
                vidClearVideoData()
            Case "ivars"
                vidInitialServerVariables()

            Case "avida"
                vidJSONString("VW_VIDEO_PER_BRANCH_FILTERED_ADVANCED")

            Case "avid"
                'vidJSONPerAsset()
                vidJSONString("VW_VIDEO_PER_BRANCH")

            Case "avidf"
                Try
                    'vidJSONPerTitleFilter()
                    vidJSONString("VW_VIDEO_PER_BRANCH_FILTERED")

                Catch ex As Exception
                    Response.Write("Error:" & ex.Message)
                End Try

            Case "chkvid"
                vidCheckStatus()

            Case "ulogout"

                Response.Write(BlankLogInfo())

            Case "ulog"

                UserLogin()

            Case "vdel"

                vidMarkDeleteRecord()

            Case "alive"

                ReturnOperationStatus("Alive", "I am alive")

            Case "vupd"

                vidSaveVideoDetails()


            Case "admupdsql"

                AdminUpdateSQL()

            Case "testcreate"
                TestCreateVIDEO()

            Case "testbrowsetable"
                TestGetVIDEOData()

        End Select

        Exit Sub

        InitPage()

        GetProcessStatus()
    End Sub

    Sub GetChildNodes()

        LogEvent("GetChildNodes start")
        Response.Write(GetTreeData(New String() {parId.Substring(1)}))
        LogEvent("GetChildNodes end")

    End Sub


    Function ReadStatus(ByVal sPath As String) As ProcessStatus

        Dim retVal As New ProcessStatus

        If Not My.Computer.FileSystem.FileExists(sPath) Then Return retVal

        Dim content As String = My.Computer.FileSystem.ReadAllText(sPath)

        ' Extract duration
        Dim durArr1 As String() = Split(content, "Duration: ")  ' Duration first temporary array
        Dim durArr2 As String()                                 ' Duration second temporary array
        Dim durVal As String() = New String() {}                ' Actual duration of the video
        Dim durSec As Double
        Dim durSecTotal As Integer

        If durArr1.Length >= 2 Then
            durArr2 = Split(durArr1(1), ", start:")

            'DebugPrompt(durArr2(0))

            durVal = Split(durArr2(0), ":")

            durSec = CDbl(durVal(2))
            'DebugPrompt("durSec: " & CInt(durSec))

            With retVal
                .Duration = TimeSerial(CInt(durVal(0)), CInt(durVal(1)), CInt(durSec))

                durSecTotal = .Duration.Hour * 60 * 60 + .Duration.Minute * 60 + .Duration.Second
            End With

            'DebugPrompt("durSecTotal: " & durSecTotal)


        Else
            'Status file is not yet formed properly
            Return retVal
        End If

        Dim frmArr1 As String() = Split(content, "frame= ")
        Dim frmItemArr As String()
        Dim sArr As String()

        frmItemArr = Split(Split(frmArr1(frmArr1.Length - 1).Replace("   ", " ").Replace("  ", " ").Replace("= ", "="), "video:")(0).Trim, " ")

        With retVal

            'DebugPrompt(frmItemArr(4))

            durVal = Split(Split(frmItemArr(4), "=")(1), ":")
            durSec = CDbl(durVal(2))

            .Frame = CLng(frmItemArr(0))
            .FPS = CLng(Split(frmItemArr(1), "=")(1))

            .VideoTime = TimeSerial(CInt(durVal(0)), CInt(durVal(1)), CInt(durSec))

            'DebugPrompt("Duration: " & .Duration)
            'DebugPrompt("VideoTime: " & .VideoTime)
            'DebugPrompt(".VideoTime.Second: " & .VideoTime.Second)

            sArr = Split(frmItemArr(3), "=")

            'DebugPrompt(sArr(0))
            If sArr(0) = "Lsize" Then
                .Percentage = 100
            Else

                .Percentage = Math.Round(100 * (1 - (durSecTotal - (.VideoTime.Hour * 60 * 60 + .VideoTime.Minute * 60 + .VideoTime.Second)) / durSecTotal), 1)
            End If

            .Size = Val(sArr(1))
            .Speed = Val(Split(frmItemArr(8), "=")(1))
            .Dup = Val(Split(frmItemArr(6), "=")(1))
            .BitRate = Val(Split(frmItemArr(5), "=")(1))
            .Drop = Val(Split(frmItemArr(7), "=")(1))
            .Q = Val(Split(frmItemArr(2), "=")(1))
            .StatusFile = sPath

        End With

        Return retVal

    End Function


    Sub GetProcessStatus()

        'Dim oPath As String = Server.MapPath("Videos") & "\Output"
        Dim oPath As String = "D:\Profiles\alv\Documents\SOGA\VideoLibraryConverter\bin\Debug\Videos\Output"
        Dim procStatus As Object

        Dim cFiles As Object = My.Computer.FileSystem.GetFiles(oPath, FileIO.SearchOption.SearchTopLevelOnly, "*.txt")
        Dim fPath As String
        Dim tPath As String
        Dim dPath As String
        Dim key As String
        Dim proc As Object
        Dim idx As Integer = 0

        Dim cFolders As Object = My.Computer.FileSystem.GetDirectories(oPath, FileIO.SearchOption.SearchTopLevelOnly, "*.out")

        Response.Write("<table border=""1"" cellpadding=""4"" cellspacing=""0"">")
        Response.Write("<tr><th align=""center"" colspan=""3"">Video Encoding Status Report</th></tr>")

        For Each dPath In cFolders
            idx += 1

            fPath = dPath & "\status.txt"

            tPath = NewFileExtension(fPath, "tmp")

            key = FileNameOnly(dPath)

            If cProcess.Item(key) Is Nothing Then
                proc = New ProcessStatus
                proc.Percentage = 0.0
                cProcess.Add(key, proc)
            Else
                proc = cProcess.Item(key)
                'DebugPrompt(cProcess.Item(key).Duration)
            End If

            Try
                DeleteExisting(tPath)
                My.Computer.FileSystem.CopyFile(fPath, tPath)

                procStatus = ReadStatus(tPath)
                DeleteExisting(tPath)

                proc = procStatus
                Application.Lock()
                Application("CPROCESS").Item(key) = proc
                Application.UnLock()

            Catch ex As Exception

                procStatus = proc

            End Try

            Response.Write("<tr><td>" & idx & "</td><td>" & key & "</td><td align=""right"">" & procStatus.Percentage & " %</td></tr>")
        Next

        Response.Write("</table>")

    End Sub

    Function NewFileExtension(ByVal FileName As String, ByVal NewExtension As String) As String
        Dim dotMark As Long = InStrRev(FileName, ".")
        Return FileName.Substring(0, dotMark) & NewExtension
    End Function

    Function FileNameOnly(ByVal fPath As String) As String

        Dim m1 As Long = InStrRev(fPath, "\")
        Dim m2 As Long = InStrRev(fPath, ".")

        Return fPath.Substring(m1, m2 - m1 - 1)

    End Function

    Sub DeleteExisting(ByVal FullPath As String)
        If My.Computer.FileSystem.FileExists(FullPath) Then
            My.Computer.FileSystem.DeleteFile(FullPath)
        End If
    End Sub


    Sub RemoveVideos()
        Dim ast As Long = vidAsset
        Dim vid As Long = vidID

        If vid <> -1 Then
            ' remove single video

        ElseIf ast <> -1 Then

            ' all videos under the given asset

        End If

    End Sub


    Sub DebugPrompt(ByVal msg As String, Optional ByVal WithLineFeed As Boolean = True)
        If Not debugMode Then Exit Sub
        Response.Write(msg & IIf(WithLineFeed, "<br/>", ""))
    End Sub

    Sub InitPage()
        'Application("CPROCESS") = New Hashtable
        If Application("CPROCESS") Is Nothing Then
            Application("CPROCESS") = New Hashtable
        End If
        cProcess = Application("CPROCESS")
    End Sub


    Sub AdminUpdateSQL()
        Response.Write(Request.Params("sql") & "")
    End Sub

End Class
