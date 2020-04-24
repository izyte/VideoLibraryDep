Imports System.Data
Imports System.Data.OleDb
Imports System.IO

Imports System.Web.HttpServerUtility

Public Class VidCommon
    Inherits System.Web.UI.Page

    Public ReadOnly Property AppVer As String
        Get
            Return "Inspection Video Library Release&nbsp;1.0-2017.01.19.1330"
        End Get
    End Property


    Public Const BYTE_PER_CHUNK As Long = 1024 * 128

    Public Const TMP_FILE_EXT_FORMAT As String = "0000000"
    Public Const GROUP_FOLDER_FORMAT As String = "0000000"
    Public Const VIDEO_FOLDER_FORMAT As String = "0000000"
    Public Const ASSET_FOLDER_FORMAT As String = "0000000"

    Public Const MANIFEST_FILE As String = "Manifest.TXT"
    Public Const MANIFEST_FORMAT As String = "<MANIFEST><FILENAME>{0}</FILENAME><SIZE>{1}</SIZE><INDEX>{2}</INDEX>" & _
            "<CHUNKS>{3}</CHUNKS><SIZEUPLOADED>{4}</SIZEUPLOADED><SESSION>{5}</SESSION><UPLOADED>{6}</UPLOADED>" & _
            "<COMPLETE>{7}</COMPLETE><SAMEFILE>{8}</SAMEFILE><AMSG>{9}</AMSG><ACTION>{10}</ACTION>" & _
            "<ASTATUS>{11}</ASTATUS><VIDEOID>{12}</VIDEOID><GROUPID>{13}</GROUPID><ASSETID>{14}</ASSETID>" & _
            "<LASTUPDATED>{15}</LASTUPDATED><BPCHUNK>{16}</BPCHUNK><TITLE>{17}</TITLE><USER>{18}</USER>" & _
            "<ASSET_NAME>{19}</ASSET_NAME><GROUPFID>{20}</GROUPFID><ASSETFID>{21}</ASSETFID><ATTEMPT>{22}</ATTEMPT></MANIFEST>"

    Public Const IVARS_FORMAT As String = """cuser"":""{0}"",""uname"":""{1}"",""rights"":""{2}"""
    Public Const UINFOFMT As String = """uid"":""{0}"",""session"":""{1}"",""uname"":""{2}"",""urole"":""{3}"",""unum"":""{4}"""


    Public Const UPLOAD_FOLDER As String = "Videos"

    Enum VideoStatusIndex

        GROUP = 0
        ASSET = 1
        ASSET_NAME = 2
        TITLE = 3
        STATUS = 4
        DURATION = 5
        SIZE = 6
        PERCENT = 7
        USER = 8
        WITH_THUMBNAIL = 9
        WITH_POSTER = 10
        WITH_MATRIX = 11
        AGE = 12
        Z = 13

    End Enum

    Structure VideoManifest

        Dim VideoGroup As Long
        Dim VideoGroupFolderID As Long
        Dim VideoId As Long
        Dim VideoAsset As Long
        Dim VideoAssetFolderID As Long
        Dim VideoSize As Long
        Dim AssetName As String
        Dim UserName As String

        Dim BytesPerChunk As Long
        Dim Title As String
        Dim Filename As String
        Dim Uploaded As Long
        Dim FileSize As Long
        Dim Duration As Long
        Dim VideoPath As String
        Dim ChunksCount As Long
        Dim Index As Long
        Dim DateUploaded As DateTime
        Dim Completed As Boolean

        Dim Comments As String
        Dim Description As String

        Dim IsNewFile As Boolean

        Dim IsSameFile As Boolean
        Dim AlertMessage As String
        Dim ActionStatus As String


        Dim InspectionOrIntervention As String
        Dim InspectionType As String
        Dim MaintenanceItemNo As String
        Dim InspectionDate As DateTime

    End Structure


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


    Structure VideoInformation
        Dim Title As String
        Dim Duration As String      'hh:mm:ss'
        Dim Status As String        'Uploading, Encoding, Complete
        Dim CurrentFrame As String  'hh:mm:ss
        Dim CurrentSize As Long
        Dim ExpectedSize As Long
        Dim WithThumbnail As Boolean

        Dim Percentage As Double

        Dim UploadApandoned As Boolean
        Dim EncodeAbandoned As Boolean

        Dim Views As Long


    End Structure

    ReadOnly Property NewVideoID As Long
        Get

            Dim retVal As Object
            If Application("NEW_VIDEO_ID") Is Nothing Then

                Dim cn As OleDbConnection = Conn
                Dim cmd As New OleDbCommand("select * from VW_NEW_VIDEO_ID", cn)

                retVal = CLng(cmd.ExecuteScalar)

                If cn.State = ConnectionState.Open Then cn.Close()


                Application("NEW_VIDEO_ID") = retVal
            Else
                Application.Lock()
                Application("NEW_VIDEO_ID") += 1
                Application.UnLock()
            End If

            retVal = Application("NEW_VIDEO_ID")

            Return retVal

        End Get
    End Property

    ReadOnly Property IStream As IO.Stream
        Get
            Return Request.InputStream
        End Get
    End Property

    ReadOnly Property WithInputStream As Boolean
        Get
            Return (IStream IsNot Nothing)
        End Get
    End Property

    ReadOnly Property inputStreamLength As Long
        Get
            If WithInputStream Then
                Return IStream.Length
            Else
                Return -1
            End If
        End Get
    End Property

    ReadOnly Property CurrentUser As String
        Get
            'Dim arr As String() = Split(Request.ServerVariables("AUTH_USER"), "\")
            'Dim retVal As String = arr(UBound(arr))

            Dim retVal As String = Request.Params("uid") & ""

            If retVal.Length = 0 Then retVal = "*SYSTEM*"
            Return retVal
        End Get
    End Property

    ReadOnly Property CnStr() As String
        Get
            Return ConfigurationManager.ConnectionStrings("CONNECTION_STRING").ConnectionString
        End Get
    End Property


    ReadOnly Property UserCnStr() As String
        Get
            Return ConfigurationManager.ConnectionStrings("CONSTR_UserManagement").ConnectionString
        End Get
    End Property

    ReadOnly Property UserConn As OleDbConnection
        Get
            Dim cn As New OleDbConnection(UserCnStr)
            cn.Open()
            Return cn
        End Get
    End Property

    ReadOnly Property Conn As OleDbConnection
        Get
            Dim cn As New OleDbConnection(CnStr)
            cn.Open()
            Return cn
        End Get
    End Property

    ReadOnly Property logUID As String

        Get
            Return Request.Params("u") & ""
        End Get

    End Property

    ReadOnly Property logPWD As String

        Get
            Return Request.Params("p") & ""
        End Get

    End Property

    ReadOnly Property parMode As String
        Get
            Return Request.Params("mode") & ""
        End Get
    End Property

    ReadOnly Property parObjID As String
        Get
            Return Request.Params("objid") & ""
        End Get
    End Property

    ReadOnly Property parIPP As String
        Get
            Return Request.Params("ipp") & ""
        End Get
    End Property

    ReadOnly Property vidID As Long
        Get
            Dim vid As Object = Request.Params("vid")
            If vid Is Nothing Then
                Return -1
            Else
                Return CInt(vid)
            End If
        End Get
    End Property


    ReadOnly Property vidIDs As String()
        Get
            'Return New String() {"36", "37"}   ' this is just to emulate the upadte funtion on multiple records

            Dim vids As Object = Request.Params("vid")
            If vids Is Nothing Then vids = Request.Params("vids")

            If vids Is Nothing Then
                Return New String() {}
            Else
                Return Split(CStr(vids), ",")
            End If
        End Get
    End Property

    ReadOnly Property vidGroup As Long
        Get
            Dim grp As Object = Request.Params("grp")
            If grp Is Nothing Then
                Return 0
            Else
                Return CInt(grp)
            End If
        End Get
    End Property

    ReadOnly Property vidGroupFID As Long
        Get
            Dim grp As Object = Request.Params("grpfid")
            If grp Is Nothing Then
                Return 0
            Else
                Return CLng(grp)
            End If
        End Get
    End Property


    ReadOnly Property vidAsset As Long
        Get
            Dim ast As Object = Request.Params("ast")
            If ast Is Nothing Then
                Return -1
            Else
                Return CLng(ast)
            End If
        End Get
    End Property

    ReadOnly Property vidAssetFID As Long
        Get
            Dim ast As Object = Request.Params("astfid")
            If ast Is Nothing Then
                Return -1
            Else
                Return CLng(ast)
            End If
        End Get
    End Property

    ReadOnly Property vidAttempt As Long
        Get
            Dim attm As Object = Request.Params("attm")
            If attm Is Nothing Then
                Return -1
            Else
                Return CLng(attm)
            End If
        End Get
    End Property


    ReadOnly Property vidFilter As String
        Get
            Dim flt As Object = Request.Params("flt")
            If flt Is Nothing Then
                Return ""
            Else
                Return CStr(flt)
            End If
        End Get
    End Property


    ReadOnly Property vidFilename As String
        Get
            Return Uri.UnescapeDataString(Request.Params("fn") & "") 'vidDecodeFilename(Request.Params("fn") & "")
        End Get
    End Property

    ReadOnly Property vidFileNoExt As String
        Get
            Dim fn As String = vidFilename
            Return fn.Substring(0, InStrRev(fn, ".") - 1)
        End Get
    End Property

    ReadOnly Property vidFileExtOnly As String
        Get
            Dim fn As String = vidFilename
            Return fn.Substring(InStrRev(fn, "."))
        End Get
    End Property

    ReadOnly Property vidTitle As String
        Get
            Dim retVal As String = Uri.UnescapeDataString(Request.Params("vt") & "")

            'If retVal.Length = 0 Then
            '    Dim fn As String = vidFilename
            '    retVal = vidDecodeFilename(fn.Substring(0, InStrRev(fn, ".") - 1))
            'End If

            Return retVal

        End Get
    End Property

    ReadOnly Property vidDescription As String
        Get
            Return Uri.UnescapeDataString(Request.Params("ds") & "")

        End Get
    End Property

    ReadOnly Property vidComments As String
        Get
            Return Uri.UnescapeDataString(Request.Params("cm") & "")

        End Get
    End Property

    ReadOnly Property vidInspOrInt As String
        Get
            Return Uri.UnescapeDataString(Request.Params("ioi") & "")

        End Get
    End Property

    ReadOnly Property vidInspDateScope As String
        Get
            Return Uri.UnescapeDataString(Request.Params("scp") & "")
        End Get
    End Property

    ReadOnly Property vidInspType As String
        Get
            Return Uri.UnescapeDataString(Request.Params("itp") & "")

        End Get
    End Property

    ReadOnly Property vidInspDate As DateTime
        Get
            '//Convert.DBNull
            Return YMDToDate("idt")
        End Get
    End Property

    ReadOnly Property vidInspDateObj As Object
        Get
            Return YMDToDateObj("idt")
        End Get
    End Property

    ReadOnly Property fltDateFrom As DateTime
        Get
            Return YMDToDate("dfr")
        End Get
    End Property

    ReadOnly Property fltDateFromObj As Object
        Get
            Return YMDToDateObj("dfr")
        End Get
    End Property


    ReadOnly Property fltDateTo As DateTime
        Get
            Return YMDToDate("dto")
        End Get
    End Property

    ReadOnly Property fltDateToObj As Object
        Get
            Return YMDToDateObj("dto")
        End Get
    End Property

    Function YMDToDateObj(ByVal qstr As String) As Object
        Dim dt As DateTime = YMDToDate(qstr)
        If dt = TimeSerial(0, 0, 0) Then
            Return Convert.DBNull
        Else
            Return dt
        End If
    End Function

    Function YMDToDate(ByVal qstr As String) As DateTime
        Try
            Dim idt As String = Uri.UnescapeDataString(Request.Params(qstr) & "")

            If idt.Length Then
                Dim dArr As String() = Split(idt, "-")
                Return DateSerial(CInt(dArr(0)), CInt(dArr(1)), CInt(dArr(2)))
            Else
                Return TimeSerial(0, 0, 0)
            End If

        Catch ex As Exception
            Return TimeSerial(0, 0, 0)

        End Try
    End Function

    ReadOnly Property vidMaintItemNo As String
        Get
            Return Uri.UnescapeDataString(Request.Params("mnm") & "")

        End Get
    End Property

    ReadOnly Property tplNode As String
        Get
            '0 - id, 1 - Title, 2 - With children?
            Return "[""{0}"",""{1}"",""{2}"",""{3}""],"
        End Get
    End Property

    ReadOnly Property tplNodeJson As String
        Get
            ' 0 - id, 1 - data array
            Return """{0}"":[{1}]"
        End Get
    End Property

    ReadOnly Property vidAction As String
        Get
            Return Request.Params("acn") & ""
        End Get
    End Property

    ReadOnly Property parId As String
        Get
            Return Request.Params("id") & ""
        End Get
    End Property


    Function vidDecodeFilename(ByVal name As String) As String
        Return name.Replace("[R]", "®").Replace("[C]", "©").Replace("[T]", "™").Replace("[A]", "&").Replace("[S]", "#")
    End Function

    ReadOnly Property vidFileSize As Long
        Get
            Dim sz As Object = Request.Params("sz")
            If sz Is Nothing Then
                Return -1
            Else
                Return Val(sz & "")
            End If
        End Get
    End Property

    ReadOnly Property vidBytesPerChunk As Long
        Get
            LogEvent("bytes per chunk:" & Request.Params("bpc"), "bpc")
            Dim sz As Object = Request.Params("bpc")
            If sz Is Nothing Then
                Return -1
            Else
                Return Val(sz & "")
            End If

        End Get
    End Property

    ReadOnly Property vidFileChunkSize As Long
        Get
            Dim sz As Object = Request.Params("csz")
            If sz Is Nothing Then
                Return -1
            Else
                Return Val(sz & "")
            End If
        End Get
    End Property

    ReadOnly Property vidFileChunkCount As Long
        Get
            Dim cnt As Object = Request.Params("cnt")
            If cnt Is Nothing Then
                Return -1
            Else
                Return Val(cnt & "")
            End If
        End Get
    End Property

    ReadOnly Property vidFileChunkIndex As Long

        Get
            Dim idx As Object = Request.Params("idx")
            If idx Is Nothing Then
                Return -1
            Else
                Return Val(idx & "")
            End If
        End Get

    End Property

    ReadOnly Property vidCheck As Boolean

        Get
            Dim chk As Object = Request.Params("chk")
            If chk Is Nothing Then
                Return False
            Else
                Return ((chk & "") = "1")
            End If
        End Get

    End Property

    Function vidTotalChunks(ByVal totalLength As Long, ByVal bytesPerChunk As Long) As Integer
        Return Int(totalLength / bytesPerChunk) + IIf(totalLength Mod bytesPerChunk, 1, 0)
    End Function

    Function vidCurrentChunkIndex(ByVal currentLength As Long, ByVal bytesPerChunk As Long) As Integer

        Dim retVal As Integer

        If currentLength Mod bytesPerChunk Then
            retVal = -1
        Else
            retVal = Int(currentLength / bytesPerChunk)
        End If

        Return retVal

    End Function

    Function vidManifest(Optional ByVal CheckDatabase As Boolean = False) As VideoManifest

        Dim retVal As New VideoManifest
        Dim recs As Integer

        Try


            Dim currMft As VideoManifest
            Dim file As String = vidFilename



            If CheckDatabase Then

                Dim tbl As DataTable = ReadToTableSP("SP_GET_VIDEO_BY_FILENAME", np2("asset", vidAsset, "filename", file))
                Dim row As DataRow

                With retVal

                    .VideoGroup = vidGroup
                    .VideoGroupFolderID = vidGroup

                    .Filename = vidFilename
                    .ChunksCount = vidFileChunkCount
                    .BytesPerChunk = vidBytesPerChunk

                    .Title = vidTitle
                    .Description = vidDescription
                    .Comments = vidComments

                    .InspectionOrIntervention = vidInspOrInt
                    .InspectionType = vidInspType
                    .MaintenanceItemNo = vidMaintItemNo
                    .InspectionDate = vidInspDate

                    If tbl.Rows.Count Then

                        row = tbl.Rows(0)

                        .IsNewFile = False

                        .VideoId = row("vid_id")

                        .VideoGroup = row("vid_group")
                        .VideoGroupFolderID = row("vid_group_ftag")

                        .VideoAsset = row("vid_asset")
                        .VideoAssetFolderID = row("vid_asset_ftag")

                        .Filename = row("vid_filename")
                        .VideoSize = row("vid_size")

                        .VideoPath = GetVideoFolder(.VideoId, .VideoGroupFolderID, .VideoAssetFolderID, False)

                        ' check and read manifest file
                        currMft = ReadManifest(.VideoPath)

                        .Index = currMft.Index
                        .Uploaded = currMft.Uploaded
                        .DateUploaded = currMft.DateUploaded
                        .Completed = currMft.Completed


                        If .VideoSize = .Uploaded Then
                            ' update video details if not duplicate
                        ElseIf .Uploaded <> 0 Then
                            ' partial upload has already been made. change in asset is not allowed
                        End If



                        '0-vid,1-title,2-desc,3-comment,4-asset,5-group

                        recs = ExecuteSP("SP_UPDATE_VIDEO_RECORD_A", npa(New Object() { _
                                                        "VideoId", .VideoId _
                                                        , "VideoGroup", .VideoGroup _
                                                        , "VideoAsset", .VideoAsset _
                                                        , "Title", .Title _
                                                        , "VideoComments", .Comments _
                                                        , "VideoDescription", .Description _
                                                        , "InspectionOrIntervention", .InspectionOrIntervention _
                                                        , "InspectionType", .InspectionType _
                                                        , "MaintenanceItemNo", .MaintenanceItemNo _
                                                        , "InspectionDate", vidInspDateObj _
                                                }))


                        LogEvent("Has rows :" & .VideoPath, "vidManifest")

                    Else
                        .IsNewFile = True

                        ' get new video id
                        .VideoId = NewVideoID
                        .VideoAsset = vidAsset
                        .VideoAssetFolderID = vidAsset

                        .Title = vidTitle

                        .Description = vidDescription
                        .Comments = vidComments

                        .VideoSize = vidFileSize
                        .DateUploaded = Now
                        .Uploaded = 0
                        .Index = 0
                        .ActionStatus = "NEW"
                        .AssetName = "" ' GetAssetName(vidAsset)

                        LogEvent(".BytesPerChunk=" & .BytesPerChunk, "vidManifest - isnewfile")

                        ' create new video record

                        Try
                            recs = ExecuteSP("SP_CREATE_VIDEO_RECORD", npa(New Object() { _
                                                            "VideoId", .VideoId _
                                                            , "VideoGroup", .VideoGroup _
                                                            , "VideoAsset", .VideoAsset _
                                                            , "Title", .Title _
                                                            , "Filename", .Filename _
                                                            , "CurrentUser", CurrentUser _
                                                            , "VideoSize", .VideoSize _
                                                            , "VideoComments", .Description _
                                                            , "VideoDescription", .Comments _
                                                            , "InspectionOrIntervention", .InspectionOrIntervention _
                                                            , "InspectionType", .InspectionType _
                                                            , "MaintenanceItemNo", .MaintenanceItemNo _
                                                            , "InspectionDate", vidInspDateObj _
                                                    }))

                        Catch ex As Exception

                            LogEvent("Error SP_CREATE_VIDEO_RECORD: " & ex.Message)

                        End Try

                        .VideoPath = GetVideoFolder(.VideoId)

                    End If

                    ' Leave video group and asset folder tags to be used during uploading of chunks...
                    Session("CURRENT_GROUP_FOLDER_ID") = .VideoGroupFolderID
                    Session("CURRENT_ASSET_FOLDER_ID") = .VideoAssetFolderID

                End With


                tbl.Dispose()


            Else
                '// read existing manifest
                'retVal = ReadManifest()

                With retVal

                    ' get parameters to  resolve video folder from the existing manifest file 
                    .VideoId = vidID
                    .VideoGroup = vidGroup
                    .VideoAsset = vidAsset

                    .VideoGroupFolderID = vidGroupFID
                    .VideoAssetFolderID = vidAssetFID

                    .VideoPath = GetVideoFolder(.VideoId, Session("CURRENT_GROUP_FOLDER_ID"), Session("CURRENT_ASSET_FOLDER_ID"), False)

                    currMft = ReadManifest(.VideoPath)

                    .Filename = currMft.Filename
                    .VideoSize = currMft.VideoSize

                    .IsSameFile = currMft.IsSameFile
                    .ChunksCount = currMft.ChunksCount
                    .DateUploaded = currMft.DateUploaded

                    .Uploaded = currMft.Uploaded
                    .BytesPerChunk = currMft.BytesPerChunk

                End With


            End If


            With retVal
                .Filename = vidFilename
            End With

        Catch ex As Exception
            LogEvent(ex.Message, "vidManifest Error")
        End Try

        Return retVal

    End Function

    Sub DebugPrompt(ByVal msg As String)
        Response.Write(msg & vbLf)
    End Sub

    Sub Prompt(ByVal text As String, Optional ByVal nolinefeed As Boolean = False)
        Response.Write(text & IIf(nolinefeed, "", "<br/>"))
    End Sub

    Sub testPrompt(ByVal msg As String, Optional ByVal nolinefeed As Boolean = False, Optional ByVal forceDisplay As Boolean = False)
        If vidAction.ToLower().StartsWith("test") Or forceDisplay Then
            Response.Write(msg & IIf(nolinefeed, "", "<br/>"))
        End If
    End Sub

    Sub vidCheckStatus()
        'SP_GET_VIDEO_BY_FILENAME

        Const tpl As String = """clear"":""{0}"",""existing"":""{1}"",""partial"":""{2}"",""title"":""{3}"",""description"":""{4}"",""comments"":""{5}"",""ioi"":""{6}"",""itp"":""{7}"",""mnm"":""{8}"",""idt"":""{9}"""

        Dim clear_ As String = "NO"
        Dim existing_ As String = "NO"
        Dim partial_ As String = "NO"
        Dim title_ As String = ""
        Dim description_ As String = ""
        Dim comment_ As String = ""
        Dim ioi_ As String = ""
        Dim itp_ As String = ""
        Dim mnm_ As String = ""
        Dim idt_ As String = ""

        Dim tbl As DataTable = ReadToTableSP("SP_GET_VIDEO_BY_FILENAME", np2("asset", vidAsset, "filename", vidFilename))
        Dim row As DataRow


        If tbl.Rows.Count Then
            row = tbl.Rows(0)

            Dim path As String = GetVideoFolder(row("vid_id"), row("vid_group_ftag"), row("vid_asset_ftag"))

            title_ = escText(row("vid_title") & "")
            description_ = escText(row("vid_description") & "")
            comment_ = escText(row("vid_comments") & "")

            ioi_ = row("vid_insp_or_int") & ""
            itp_ = escText(row("vid_insp_type") & "")
            mnm_ = escText(row("vid_maint_item_no") & "")

            idt_ = dateToYMD(row("vid_insp_date"))

            If My.Computer.FileSystem.DirectoryExists(path) Then
                Dim cRaws As Object = My.Computer.FileSystem.GetFiles(path, FileIO.SearchOption.SearchTopLevelOnly, New String() {"RAW.*"})
                If cRaws.count Then
                    Dim fInfo As FileInfo = My.Computer.FileSystem.GetFileInfo(cRaws(0))
                    If fInfo.Name.ToUpper() = "RAW.$$$" Then
                        partial_ = "YES"
                    Else
                        existing_ = "YES"
                    End If
                End If
            Else
                clear_ = "YES"
            End If

        Else
            clear_ = "YES"
        End If

        tbl.Dispose()

        Response.Write("{" & String.Format(tpl, New String() {clear_, existing_, partial_, _
                                    title_, description_, comment_, ioi_, itp_, mnm_, idt_}) & "}")

    End Sub

    Sub vidInitialServerVariables()
        'IVARS_FORMAT As String = """cuser"":""{0}"",""uname"":""{1}"",""rights"":""{3}"""
        Dim retVal As String = String.Format(IVARS_FORMAT, New String() {CurrentUser, "", "admin"})
        Dim enumPath As String = Server.MapPath("Videos") & "\videoEnum.json"
        If IsExisting(enumPath) Then
            Dim text As String = ReadText(enumPath)
            If text.Length Then
                retVal &= "," & text.Substring(1, text.Length - 2)
            End If

        End If

        Response.Write("{" & retVal & "}")

        'Response.Write("hello")
    End Sub

    Function dateToYMD(ByVal dt As Object) As String
        Dim idt As String = ""
        If Len(dt & "") Then
            Dim dtVal As DateTime = CDate(dt)
            idt = Format(dtVal, "yyyy-MM-dd")
        End If
        Return idt
    End Function

    Function GetVideoJSON(ByVal path As String, _
                             ByVal dbParams As String(), _
                             Optional ByVal AssetName As String = "", _
                             Optional ByVal VidGroup As Long = -1, _
                             Optional ByVal VidAsset As Long = -1) As String

        Dim vPath As String = path & "\Video.json"
        Dim sPath As String = path & "\Status.json"
        Dim viewsPath As String = path & "\Views.txt"

        Dim text As String = ""
        Dim retVal As New StringBuilder
        Dim views As Long = 0

        If IsExisting(viewsPath) Then
            views = CLng(ReadText(viewsPath))
        Else
            views = 0
        End If

        Dim tPath As String = ""

        If IsExisting(vPath) Then
            ' video is complete
            tPath = vPath

        ElseIf IsExisting(sPath) Then
            tPath = sPath
        End If

        If tPath.Length Then text = ReadText(tPath).Replace(vbLf, "$LF$")

        If text.Length Then

            Dim txtArr As String() = Split(text, """,""")
            Dim isModified As Boolean = False

            If VidGroup <> -1 And VidAsset <> -1 Then
                Dim gArr As String() = Split(txtArr(VideoStatusIndex.GROUP), "[""")
                gArr(1) = VidGroup
                txtArr(VideoStatusIndex.GROUP) = Join(gArr, "[""")
                txtArr(VideoStatusIndex.ASSET) = VidAsset
            End If

            If dbParams(0).Length Then
                txtArr(VideoStatusIndex.TITLE) = escText(dbParams(0))
            End If

            If txtArr(VideoStatusIndex.WITH_MATRIX) = "0" And IsExisting(path & "\thumbnails.png") Then
                txtArr(VideoStatusIndex.WITH_MATRIX) = "1"
                isModified = True
            End If

            If txtArr(VideoStatusIndex.WITH_THUMBNAIL) = "0" And IsExisting(path & "\tpost.png") Then
                txtArr(VideoStatusIndex.WITH_THUMBNAIL) = "1"
                isModified = True
            End If

            If txtArr(VideoStatusIndex.WITH_POSTER) = "0" And IsExisting(path & "\vpost.png") Then
                txtArr(VideoStatusIndex.WITH_POSTER) = "1"
                isModified = True

            End If

            If AssetName.Length Then
                txtArr(VideoStatusIndex.ASSET_NAME) = AssetName
            End If

            Try
                text = Join(txtArr, """,""")

                If isModified Then

                    WriteText(tPath, text, False)

                Else

                End If


            Catch ex As Exception
                Response.Write("Error:" & ex.Message)
            End Try

            ' removed the last square baracket to allow additional elements in the array
            text = text.Replace("<VIEWS>", views).TrimStart("{").TrimEnd("}").TrimEnd("]")

            ' add extra fields at the end of the json string
            'text &= escText(",""" & dbParams(1) & """,""" & dbParams(2) & """,""" & _
            '                dbParams(3) & """,""" & dbParams(4) & """,""" & dbParams(5) & """,""" & _
            '                dbParams(6) & """,""" & dbParams(7) & """,""" & dbParams(8) & """,""" & dbParams(9) & """")

            text &= (",""" & escText(dbParams(1)) & """,""" & escText(dbParams(2)) & """,""" & _
                 escText(dbParams(3)) & """,""" & escText(dbParams(4)) & """,""" & dbParams(5) & """,""" & _
                 escText(dbParams(6)) & """,""" & escText(dbParams(7)) & """,""" & escText(dbParams(8)) & """,""" & dbParams(9) & """")



            'text &= ",""" & escText(dbParams(1)) & """,""" & escText(dbParams(2)) & """,""" & escText(dbParams(3)) & """,""" & dbParams(4) & """,""" & dbParams(5) & """"

            ' the following section will append parameters taken from the data table record of the video file
            ' 

            Return text & "]"   ' sqare bracket to close the array
        Else
            Return ""
        End If

    End Function

    Sub vidJSONString(ByVal SPName As String)

        Dim params As OleDbParameter() = Nothing
        Dim tbl As DataTable, row As DataRow

        If SPName = "VW_VIDEO_PER_BRANCH" Then

            params = np1("ptag", vidAsset)

        ElseIf SPName = "VW_VIDEO_PER_BRANCH_FILTERED" Then

            params = np2("ptag", vidAsset, "VideoTitleFilter", vidFilter)

        ElseIf SPName = "VW_VIDEO_PER_BRANCH_FILTERED_ADVANCED" Then

            params = npa(New Object() { _
                          "ptag", vidAsset _
                        , "VideoTitleFilter", vidFilter _
                        , "InspectionOrIntervention", vidInspOrInt _
                        , "InspectionType", vidInspType _
                        , "MaintenanceItemNo", vidMaintItemNo _
                        , "Scope", vidInspDateScope _
                        , "DFrom", fltDateFromObj _
                        , "DTo", fltDateToObj _
                    })


            'Scope Text ( 255 ), [DFrom] DateTime, DTo DateTime;
        End If

        If params Is Nothing Then
            tbl = ReadToTableSP(SPName)
        Else
            tbl = ReadToTableSP(SPName, params)
        End If

        Dim path As String
        Dim text As String = ""
        Dim retVal As New StringBuilder

        If tbl.Rows.Count Then
            For Each row In tbl.Rows
                path = GetVideoFolder(row("vid_id"), row("vid_group_ftag"), row("vid_asset_ftag"))

                text = GetVideoJSON(path, _
                                    New String() { _
                                                row("vid_title") & "" _
                                                , row("vid_description") & "" _
                                                , row("vid_comments") & "" _
                                                , row("vid_filename") & "" _
                                                , row("vid_group_ftag") & "" _
                                                , row("vid_asset_ftag") & "" _
                                                , row("vid_insp_or_int") & "" _
                                                , row("vid_insp_type") & "" _
                                                , row("vid_maint_item_no") & "" _
                                                , dateToYMD(row("vid_insp_date")) _
                                                }, _
                                    row("vid_asset_name") & "" _
                                    , row("vid_group") _
                                    , row("vid_asset"))

                If text.Length Then retVal.Append(text & ",")

            Next

        End If

        tbl.Dispose()

        Response.Write("{" & retVal.ToString.TrimEnd(",") & "}")

    End Sub

    'Sub vidJSONPerTitleFilter()

    '    Dim cn As OleDbConnection = Conn
    '    Dim cmd As OleDbCommand = New OleDbCommand("VW_VIDEO_PER_BRANCH_FILTERED", cn)

    '    cmd.CommandType = CommandType.StoredProcedure
    '    cmd.Parameters.Add(New OleDbParameter("ptag", vidAsset))
    '    cmd.Parameters.Add(New OleDbParameter("VideoTitleFilter", vidFilter))

    '    Dim rdr As OleDbDataReader = cmd.ExecuteReader()

    '    Dim path As String
    '    Dim text As String = ""
    '    Dim retVal As New StringBuilder

    '    If rdr.HasRows Then
    '        Do While rdr.Read()

    '            path = GetVideoFolder(rdr("vid_id"), rdr("vid_group_ftag"), rdr("vid_asset_ftag"))

    '            text = GetVideoJSON(path, _
    '                                New String() { _
    '                                            rdr("vid_title") & "" _
    '                                            , rdr("vid_description") & "" _
    '                                            , rdr("vid_comments") & "" _
    '                                            , rdr("vid_filename") & "" _
    '                                            , rdr("vid_group_ftag") & "" _
    '                                            , rdr("vid_asset_ftag") & "" _
    '                                            , rdr("vid_insp_or_int") & "" _
    '                                            , rdr("vid_insp_type") & "" _
    '                                            , rdr("vid_maint_item_no") & "" _
    '                                            , dateToYMD(rdr("vid_insp_date")) _
    '                                            }, _
    '                                rdr("vid_asset_name") & "")

    '            If text.Length Then retVal.Append(text & ",")

    '        Loop
    '    End If

    '    If cn.State = ConnectionState.Open Then cn.Close()
    '    cn.Dispose()

    '    Response.Write("{" & retVal.ToString.TrimEnd(",") & "}")

    'End Sub




    'Sub vidJSONPerAsset()

    '    Dim path As String
    '    Dim text As String = ""
    '    Dim retVal As New StringBuilder

    '    Dim cn As OleDbConnection = Conn
    '    Dim cmd As OleDbCommand = New OleDbCommand("VW_VIDEO_PER_BRANCH", cn)
    '    cmd.CommandType = CommandType.StoredProcedure

    '    cmd.Parameters.Add(New OleDbParameter("ptag", vidAsset))

    '    Dim rdr As OleDbDataReader = cmd.ExecuteReader()

    '    Do While rdr.Read()

    '        path = GetVideoFolder(rdr("vid_id"), rdr("vid_group_ftag"), rdr("vid_asset_ftag"), False)

    '        text = GetVideoJSON(path, _
    '                                    New String() { _
    '                                            rdr("vid_title") & "" _
    '                                            , rdr("vid_description") & "" _
    '                                            , rdr("vid_comments") & "" _
    '                                            , rdr("vid_filename") & "" _
    '                                            , rdr("vid_group_ftag") & "" _
    '                                            , rdr("vid_asset_ftag") & "" _
    '                                            , rdr("vid_insp_or_int") & "" _
    '                                            , rdr("vid_insp_type") & "" _
    '                                            , rdr("vid_maint_item_no") & "" _
    '                                            , dateToYMD(rdr("vid_insp_date")) _
    '                                        }, _
    '                            rdr("vid_asset_name") & "")

    '        If text.Length Then retVal.Append(text & ",")
    '    Loop

    '    If cn.State = ConnectionState.Open Then
    '        cn.Close()
    '    End If

    '    cn.Dispose()


    '    Response.Write("{" & retVal.ToString.TrimEnd(",") & "}")

    'End Sub

    Function BlankLogInfo() As String
        Session("LOG_INFO") = "{" & String.Format(UINFOFMT, _
                                New String() {"", Session.SessionID, "", "", ""}) & "}"
        Return Session("LOG_INFO")
    End Function

    Sub UserLogin(Optional ByVal Logout As Boolean = False)

        Dim uname As String = ""
        Dim urole As String = ""
        Dim upass As String = ""
        Dim lurole As String = ""
        Dim uid As String = logUID
        Dim uidnum As Long
        Dim tbl As DataTable = Nothing

        Dim info As String = BlankLogInfo()

        If Logout Then
            Response.Write(info)
            Return
        End If

        Try

            tbl = ReadToTableSP("SP_GET_USER_INFO", np2("log_uid", logUID, "log_pwd", logPWD), UserConn)
            Dim row As DataRow
            For Each row In tbl.Rows

                uidnum = row("USR_ID")
                uname = row("USERNAME")
                urole = row("USERROLE")
                upass = row("USERPWD")

                lurole = LCase(urole)

                ' check if the record suffice
                If String.Compare(upass, logPWD, False) = 0 And _
                    (lurole = "admin" Or lurole = "super" Or lurole = "user" Or lurole = "visitor") Then
                    ' valid user found
                    Session("LOG_INFO") = "{" & String.Format(UINFOFMT, _
                            New String() {uid, Session.SessionID, uname, urole, uidnum}) & "}"

                    Exit For
                End If
            Next
            
            Response.Write(Session("LOG_INFO"))

        Catch ex As Exception
            Response.Write("{""error"":""" & ex.Message.Replace("""", "&quot;") & """}")
        Finally
            If tbl Is Nothing Then tbl.Dispose()
        End Try

    End Sub

    Function escText(ByVal text As String) As String
        Return Uri.EscapeUriString(text.Replace(vbCrLf, "\n").Replace(vbLf, "\n").Replace("""", "\"""))
    End Function

    Function GetVideoInformation(ByVal path As String) As VideoInformation
        Dim retVal As New VideoInformation
        Dim rawUpload As String = path & "\RAW.$$$"
        Dim rawVideo As String = path & "\RAW.mp4"
        Dim finalVideo As String = path & "\video.mp4"
        Dim manifest As String = path & "\Manifest.TXT"
        Dim info As String = path & "\info.txt"
        Dim status As String = path & "\status.txt"
        Dim thumbnails As String = path & "\thumbnails.png"
        Dim tmbPattern As String = "tmb??.png"
        Dim infoText As String = ""
        Dim manText As String = ""
        Dim fInfo As FileInfo

        Dim duration As String = ""

        manText = ReadText(manifest)
        If IsExisting(infoText) Then
            infoText = ReadText(info)
            Dim durArr1 As String() = Split(infoText, "Duration: ")  ' Duration first temporary array
            If durArr1.Length >= 2 Then
                Dim durArr2 As String() = Split(durArr1(1), ", start:")
                Response.Write(durArr2(0) & "<br/>")
            End If
        End If

        With retVal

            .Title = GetTagContent(manText, "TITLE") & ""
            LogEvent(".Title : " & .Title, "GetVideoInformation")

            If .Title.Length = 0 Then
                .Title = GetTagContent(manText, "FILENAME") & ""
            End If


            If IsExisting(rawUpload) Then
                ' file is still uploading
                .ExpectedSize = CLng(GetTagContent(manText, "SIZE"))
                .Status = "Uploading"
                fInfo = My.Computer.FileSystem.GetFileInfo(rawUpload)

                .Percentage = 100.0 * (fInfo.Length / .ExpectedSize)


            ElseIf Not IsExisting(thumbnails) Then
                ' currently encoding

                Dim proc As ProcessStatus = ReadStatus(status)
                .Status = "Encoding"
                fInfo = My.Computer.FileSystem.GetFileInfo(rawVideo)
                If (fInfo.Exists) Then
                    .Percentage = proc.Percentage
                Else
                    .Percentage = 0
                End If

            ElseIf IsExisting(finalVideo) Then

                .Status = "Complete"

            Else

                .Status = "Missing"

            End If



        End With


        Return retVal
    End Function

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
            durVal = Split(durArr2(0), ":")

            durSec = CDbl(durVal(2))
            With retVal
                .Duration = TimeSerial(CInt(durVal(0)), CInt(durVal(1)), CInt(durSec))
                'retVal.Duration.AddMilliseconds((durSec - CInt(durSec)) * 1000.0)

                durSecTotal = .Duration.Hour * 60 * 60 + .Duration.Minute * 60 + .Duration.Second
            End With

        Else
            'Status file is not yet formed properly
            Return retVal
        End If

        Dim frmArr1 As String() = Split(content, "frame= ")
        Dim frmItemArr As String()

        frmItemArr = Split(Split(frmArr1(frmArr1.Length - 2).Replace("   ", " ").Replace("  ", " ").Replace("= ", "="), "video:")(0).Trim, " ")

        With retVal

            durVal = Split(Split(frmItemArr(4), "=")(1), ":")
            durSec = CDbl(durVal(2))

            .Frame = CLng(frmItemArr(0))
            .FPS = CLng(Split(frmItemArr(1), "=")(1))

            .VideoTime = TimeSerial(CInt(durVal(0)), CInt(durVal(1)), CInt(durSec))
            .Percentage = Math.Round(100 * (1 - (durSecTotal - (.VideoTime.Hour * 60 * 60 + .VideoTime.Minute * 60 + .VideoTime.Second)) / durSecTotal), 1)

            .Size = Val(Split(frmItemArr(3), "=")(1))
            .Speed = Val(Split(frmItemArr(8), "=")(1))
            .Dup = Val(Split(frmItemArr(6), "=")(1))
            .BitRate = Val(Split(frmItemArr(5), "=")(1))
            .Drop = Val(Split(frmItemArr(7), "=")(1))
            .Q = Val(Split(frmItemArr(2), "=")(1))
            .StatusFile = sPath

        End With

        Return retVal

    End Function

    Sub vidSaveVideoDetails()
        Try

            Dim recs As Integer = 0

            Dim id As String
            For Each id In vidIDs

                recs += ExecuteSP("SP_UPDATE_VIDEO_RECORD_A", npa(New Object() { _
                                            "VideoId", CLng(id) _
                                            , "VideoGroup", vidGroup _
                                            , "VideoAsset", vidAsset _
                                            , "Title", IIf(vidIDs.Length > 1, Convert.DBNull, vidTitle) _
                                            , "VideoComments", vidComments _
                                            , "VideoDescription", vidDescription _
                                            , "InspectionOrIntervention", vidInspOrInt _
                                            , "InspectionType", vidInspType _
                                            , "MaintenanceItemNo", vidMaintItemNo _
                                            , "InspectionDate", vidInspDateObj _
                                    }))

            Next


            ReturnOperationStatus("Success", args:="vid=" & Join(vidIDs, ",") & "&recs=" & recs)

        Catch ex As Exception
            ReturnOperationStatus("Error", "vidSaveVideoDetails: " & ex.Message & " , " & vidGroup)
        End Try
    End Sub


    Sub vidMarkDeleteRecord()

        Try


            Dim cn As OleDbConnection = Conn
            Dim cmd As OleDbCommand = New OleDbCommand("SP_DELETE_VIDEO_RECORD_BY_ID", cn)

            cmd.CommandType = CommandType.StoredProcedure
            cmd.Parameters.Add(New OleDbParameter("vid", vidID))
            cmd.ExecuteNonQuery()


            If cn.State = ConnectionState.Open Then cn.Close()
            cn.Dispose()
            cmd.Dispose()

            ReturnOperationStatus("Success", args:="vid=" & vidID)

        Catch ex As Exception

            ReturnOperationStatus("Error", "vidMarkDeleteRecord: " & ex.Message)

        End Try

    End Sub

    Sub ReturnOperationStatus(ByVal stat As String, Optional ByVal msg As String = "", Optional ByVal args As String = "")
        Const SFMT As String = """action"":""{0}"",""status"":""{1}"",""message"":""{2}"",""args"":""{3}"""

        Response.Write("{" & String.Format(SFMT, New String() {vidAction, stat, msg, args}) & "}")
    End Sub

    Sub vidClearVideoData()
        Dim cn As OleDbConnection = Conn
        Dim cmd As OleDbCommand = New OleDbCommand("SP_DELETE_VIDEO_RECORDS", cn)
        cmd.CommandType = CommandType.StoredProcedure
        cmd.ExecuteNonQuery()
        If cn.State = ConnectionState.Open Then cn.Close()
        cn.Dispose()
        cmd.Dispose()
    End Sub

    Sub vidStatUploadingToEncoding(ByVal vid As Long)
        Dim cn As OleDbConnection = Conn
        Dim cmd As OleDbCommand = New OleDbCommand("SP_STA_UPLOADING_TO_ENCODING", cn)
        cmd.CommandType = CommandType.StoredProcedure
        cmd.Parameters.Add(New OleDbParameter("vid", vid))
        cmd.ExecuteNonQuery()
        If cn.State = ConnectionState.Open Then cn.Close()
        cn.Dispose()
        cmd.Dispose()
    End Sub
    Sub vidStatEncodingToProcessed(ByVal vid As Long)
        Dim cn As OleDbConnection = Conn
        Dim cmd As OleDbCommand = New OleDbCommand("SP_STA_ENCODING_TO_PROCESSED", cn)
        cmd.CommandType = CommandType.StoredProcedure
        cmd.Parameters.Add(New OleDbParameter("vid", vid))
        cmd.ExecuteNonQuery()
        If cn.State = ConnectionState.Open Then cn.Close()
        cn.Dispose()
        cmd.Dispose()
    End Sub

    Function GetAssetName(ByVal aid As Long) As String
        Dim retVal As String = ""
        Dim tbl As DataTable = ReadToTableSP("SP_GET_ASSET_NAME")

        Dim cn As OleDbConnection = Conn
        Dim cmd As OleDbCommand = New OleDbCommand("SP_GET_ASSET_NAME", cn)
        cmd.CommandType = CommandType.StoredProcedure
        cmd.Parameters.Add(New OleDbParameter("AssetID", aid))

        Dim rdr As OleDbDataReader = cmd.ExecuteReader()

        If rdr.HasRows Then
            rdr.Read()
            retVal = rdr("NODE_DESC")
        End If

        If cn.State = ConnectionState.Open Then cn.Close()
        cn.Dispose()
        cmd.Dispose()

        Return retVal
    End Function

    Function GetManifestCollection(Optional ByVal mode As String = "UPLOADING") As Hashtable
        ' mode = UPLOADING, ENCODING
        Dim retVal As Hashtable
        Dim ctr As Integer = 0
        Dim sql As String = "select * from " & IIf(mode = "UPLOADING", _
                                                "VW_UPLOADING_VIDEOS", "VW_ENCODING_VIDEOS")


        'sql = "select * from TBL_VIDEOS;"


        Response.Write(sql & vbCrLf)

        Application.Lock()
        Application(mode) = Nothing
        Application.UnLock()

        If Application(mode) Is Nothing Then
            '

            Dim rdr As OleDbDataReader
            Dim cn As OleDbConnection = Conn

            Dim cmd As New OleDbCommand(sql, cn)
            Dim mft As VideoManifest


            rdr = cmd.ExecuteReader()
            retVal = New Hashtable()

            Response.Write("HasRows:" & rdr.HasRows & vbCrLf)

            While rdr.Read()

                mft = New VideoManifest
                ctr += 1

                With mft

                    .VideoId = rdr("vid_id")
                    .VideoGroup = rdr("vid_group")
                    .Title = rdr("vid_title")
                    .Filename = rdr("vid_filename")
                    .FileSize = Val(rdr("vid_size") & "")
                    .Duration = Val(rdr("vid_duration") & "")

                End With

                retVal.Add(mft.Filename, mft)

            End While


            Application.Lock()
            Application(mode) = retVal
            Application.UnLock()


            If cn.State = ConnectionState.Open Then cn.Close()
            cmd.Dispose()

        Else
            retVal = Application(mode)
        End If

        Response.Write("ctr:" & ctr & vbCrLf)

        'Return New Hashtable()


        Return retVal

    End Function

    Function GetTreeData(ByVal ids As String()) As String
        Dim retVal As String = ""
        Dim id As String

        Dim path As String = Server.MapPath("App_Data/TreeData")
        Dim fPath As String
        Dim nodes As New StringBuilder
        Dim text As String

        For Each id In ids
            fPath = path & "\N" & id & ".node"
            If IsExisting(fPath) Then
                text = ReadText(fPath)
                nodes.Append(text.TrimStart("{").TrimEnd("}") & ",")
            Else

                Dim cn As OleDbConnection = Conn
                Try

                    Dim cmd As New OleDbCommand("VW_VIDEO_TREE_BY_PARENT", cn)
                    cmd.CommandType = CommandType.StoredProcedure

                    cmd.Parameters.Add(New OleDbParameter("ptag", parId.Substring(1)))

                    Dim rd As OleDbDataReader = cmd.ExecuteReader()
                    Dim dat As New StringBuilder

                    While rd.Read()
                        dat.Append(String.Format(tplNode, _
                                New String() {CStr(rd("REC_TAG")), _
                                              (rd("NODE_DESC") & "").ToString.Replace("""", "\"""), _
                                              CStr(Math.Abs(rd("WITH_CHILDREN"))), _
                                              (rd("NODE_ID") & "").ToString.Replace("""", "\""")}))
                    End While

                    rd.Close()
                    If cn.State = ConnectionState.Open Then cn.Close()
                    cn.Dispose()

                    text = String.Format(tplNodeJson, New String() {"N" & id, dat.ToString.TrimEnd(",")})
                    nodes.Append(text & ",")

                    WriteText(fPath, "{" & text & "}")

                Catch ex As Exception

                    Dim errMsg As String = "error (GetChildNodes):" & ex.Message

                    If cn IsNot Nothing Then
                        If cn.State = ConnectionState.Open Then cn.Close()
                        cn.Dispose()
                    End If

                    Return errMsg

                End Try

            End If
        Next

        Return "{" & nodes.ToString.TrimEnd(",") & "}"

        'GetChildNodes
    End Function

    Function ReadText(ByVal fPath As String) As String
        If IsExisting(fPath) Then
            Return My.Computer.FileSystem.ReadAllText(fPath)
        Else
            Return ""
        End If
    End Function

    Function WriteText(ByVal fPath As String, ByVal text As String, Optional ByVal append As Boolean = False) As String
        Try
            My.Computer.FileSystem.WriteAllText(fPath, text, append)

            Return ""

        Catch ex As Exception

            Return "error (WriteText):" & ex.Message

        End Try
    End Function

    Function IsExisting(ByVal fPath As String) As Boolean
        Return My.Computer.FileSystem.FileExists(fPath)
    End Function

    Function ReadManifest(ByVal VideoPath As String) As VideoManifest

        Dim mft As New VideoManifest

        Try

            Dim fullPath As String = VideoPath & "\" & MANIFEST_FILE
            Dim txt As String = My.Computer.FileSystem.ReadAllText(fullPath)
            Dim Upl As String()

            With mft

                .Filename = GetTagContent(txt, "FILENAME")
                .Title = GetTagContent(txt, "TITLE")
                .VideoSize = CLng(GetTagContent(txt, "SIZE"))

                .UserName = GetTagContent(txt, "USER")
                .AssetName = GetTagContent(txt, "ASSET_NAME")




                Upl = Split(GetTagContent(txt, "UPLOADED"), ",")

                .DateUploaded = DateSerial(CInt(Upl(0)), CInt(Upl(1)), CInt(Upl(2))).AddHours(CInt(Upl(3))).AddMinutes(CInt(Upl(4))).AddSeconds(CInt(Upl(5)))

                .ChunksCount = GetTagContent(txt, "CHUNKS")
                .BytesPerChunk = CLng(GetTagContent(txt, "BPCHUNK"))
                .Completed = (GetTagContent(txt, "COMPLETE") = "YES")

                If .Completed Then
                    .Index = GetTagContent(txt, "INDEX")
                    .Uploaded = CLng(GetTagContent(txt, "SIZEUPLOADED"))
                Else
                    Dim rawPath As String = VideoPath & "\RAW.$$$"
                    If IsExisting(rawPath) Then
                        Dim rawInfo As FileInfo = My.Computer.FileSystem.GetFileInfo(rawPath)
                        'LogEvent("Using RAW.$$$ length=" & rawInfo.Length & " as basis for index value", "Readmanifest")
                        If rawInfo.Length Mod .BytesPerChunk Then
                            .Index = (rawInfo.Length Mod .BytesPerChunk) / .BytesPerChunk
                        Else
                            .Index = 1 + (rawInfo.Length / .BytesPerChunk)
                        End If
                        .Uploaded = CLng(rawInfo.Length)
                    Else
                        ' if raw file is not existing, there could be some error previously occured and
                        ' the entire file should have been re-uploaded and index must be set to 0???
                        .Index = GetTagContent(txt, "INDEX")
                        .Uploaded = CLng(GetTagContent(txt, "SIZEUPLOADED"))
                    End If
                    'Dim rawInfo As FileInfo=My.Computer.FileSystem.GetFileInfo(vi
                End If

                .AlertMessage = GetTagContent(txt, "AMSG")
                .IsSameFile = (.VideoSize = vidFileSize)

                .VideoId = CLng("0" & GetTagContent(txt, "VIDEOID"))
                .VideoGroup = CLng("0" & GetTagContent(txt, "GROUPID"))
                .VideoAsset = CLng("0" & GetTagContent(txt, "ASSETID"))

                Dim fid As String = GetTagContent(txt, "GROUPFID")
                If Len(fid) Then
                    .VideoGroupFolderID = fid
                Else
                    .VideoGroupFolderID = .VideoGroup
                End If

                fid = GetTagContent(txt, "ASSETFID")
                If Len(fid) Then
                    .VideoAssetFolderID = fid
                Else
                    .VideoAssetFolderID = .VideoAsset
                End If

                'LogEvent("VideoPath: " & VideoPath & ".VideoAssetFolderID :" & .VideoAssetFolderID & ", .VideoGroupFolderID:" & .VideoGroupFolderID, "ReadManifest")

            End With

        Catch ex As Exception
            LogEvent(ex.Message, "ReadManifest Error")
        End Try

        Return mft

    End Function

    Function GetTagContent(ByVal str As String, ByVal tag As String) As String

        tag = tag.ToUpper()
        Dim retVal As String = ""
        Dim Arr1 As String() = Split(str, "<" & tag & ">")

        If Arr1.Length = 2 Then
            Dim Arr2 As String() = Split(Arr1(1), "</" & tag & ">")
            If Arr2.Length >= 2 Then
                retVal = Arr2(0)
            End If
        End If

        Return retVal

    End Function

    Sub ResetNewVideoID()
        Application.Lock()
        Application("NEW_VIDEO_ID") = Nothing
        Application.UnLock()
    End Sub

    Sub ResetUploadingVideos()
        Application.Lock()
        Application("UPLOADING") = Nothing
        Application.UnLock()
    End Sub

    Sub ResetEncodingVideos()
        Application.Lock()
        Application("ENCODING") = Nothing
        Application.UnLock()
    End Sub

    Function GetVideoFolder(Optional ByVal VideoID As Long = -1, Optional ByVal GroupFolderID As Long = -1, _
                            Optional ByVal AssetFolderID As Long = -1, Optional ByVal CreateIfNotExisting As Boolean = True, _
                            Optional ByVal ReturnURLPath As Boolean = False, Optional ByVal GetFromTable As Boolean = False) As String

        Dim retVal As String = ""
        If GroupFolderID = -1 Then GroupFolderID = vidGroup
        If AssetFolderID = -1 Then AssetFolderID = vidAsset

        If VideoID > 0 And GetFromTable Then
            Dim tbl As DataTable = ReadDataToTable("select vid_group_ftag, vid_asset_ftag from tbl_videos where vid_id=? ", _
                                                   New Object() {VideoID})
            If tbl.Rows.Count Then
                GroupFolderID = tbl.Rows(0)("vid_group_ftag")
                AssetFolderID = tbl.Rows(0)("vid_asset_ftag")
            End If
            tbl.Dispose()
        End If

        If ReturnURLPath Then

            retVal = UPLOAD_FOLDER & "/G" & Format(GroupFolderID, GROUP_FOLDER_FORMAT) & _
                     "/V" & Format(AssetFolderID, ASSET_FOLDER_FORMAT) & Format(VideoID, VIDEO_FOLDER_FORMAT)

        Else

            retVal = MapPath(UPLOAD_FOLDER) & "\G" & Format(GroupFolderID, GROUP_FOLDER_FORMAT) & _
                                            "\V" & Format(AssetFolderID, ASSET_FOLDER_FORMAT) & Format(VideoID, VIDEO_FOLDER_FORMAT)
            If CreateIfNotExisting Then
                If Not My.Computer.FileSystem.DirectoryExists(retVal) Then
                    My.Computer.FileSystem.CreateDirectory(retVal)
                End If
            End If

        End If

        Return retVal

    End Function

    Function UpdateManifestFile(ByVal manifest As VideoManifest, ByVal Action As String) As String

        Dim retVal As String = ""
        Dim fullPath As String

        With manifest

            fullPath = .VideoPath & "\" & MANIFEST_FILE

            Kill(fullPath)

            retVal = String.Format(MANIFEST_FORMAT, New String() {.Filename, _
                                                .VideoSize, _
                                                .Index, _
                                                .ChunksCount, _
                                                .Uploaded, _
                                                Session.SessionID, _
                                                Format(.DateUploaded, "yyyy,MM,dd,HH,mm,ss"), _
                                                IIf(.Completed, "YES", "NO"), _
                                                IIf(.IsSameFile, "YES", "NO"), _
                                                .AlertMessage, _
                                                Action, _
                                                .ActionStatus, _
                                                .VideoId, _
                                                .VideoGroup, _
                                                .VideoAsset, _
                                                Format(Now(), "yyyy,MM,dd,HH,mm,ss"), _
                                                .BytesPerChunk, _
                                                .Title, _
                                                CurrentUser, _
                                                .AssetName, _
                                                .VideoGroupFolderID, _
                                                .VideoAssetFolderID, _
                                                vidAttempt})

            My.Computer.FileSystem.WriteAllText(fullPath, retVal, False)

        End With
        Return retVal
    End Function

    Sub KillAllFiles(ByVal path As String)

        Dim fcol As Object = My.Computer.FileSystem.GetFiles(path)
        Dim p As String

        For Each p In fcol
            My.Computer.FileSystem.DeleteFile(p)
        Next

        fcol = My.Computer.FileSystem.GetDirectories(path)

        For Each p In fcol
            My.Computer.FileSystem.DeleteDirectory(p, FileIO.DeleteDirectoryOption.DeleteAllContents)
        Next

    End Sub


    Sub Kill(ByVal fullPath As String)
        If My.Computer.FileSystem.FileExists(fullPath) Then
            My.Computer.FileSystem.DeleteFile(fullPath)
        End If
    End Sub

    'Sub ExecuteSP(ByVal spname As String, ByVal params As OleDbParameter())

    '    Dim cn As OleDbConnection = Conn
    '    Dim cmd As OleDbCommand = New OleDbCommand(spname, cn)

    '    cmd.CommandType = CommandType.StoredProcedure

    '    Dim idx As Long
    '    For idx = 0 To params.Length
    '        cmd.Parameters.Add(params(idx))
    '    Next

    '    cmd.ExecuteNonQuery()
    '    If cn.State = ConnectionState.Open Then cn.Close()
    '    cn.Dispose()
    '    cmd.Dispose()

    'End Sub


    Sub LogEvent(ByVal msg As String, Optional ByVal rout As String = "")

        Try


            Dim txt As String = "====================================================================================" & vbCrLf
            If msg <> "-" Then
                txt = Now() & ": " & IIf(rout.Length, "(" & rout & ") ", "") & msg & vbCrLf
            End If

            My.Computer.FileSystem.WriteAllText(MapPath("App_Data") & "\events.log", txt, True)

        Catch ex As Exception

        End Try

    End Sub

    Function Version(ByVal fn As String) As String
        Dim f As FileInfo = My.Computer.FileSystem.GetFileInfo(MapPath(fn))
        Return Format(f.LastWriteTime, "yyyyMMddHHmmss")
    End Function

    'Function np(ByVal name As String, ByVal value As Object) As OleDbParameter
    '    Return New OleDbParameter(name, value)
    'End Function

    'Function np(ByVal name As String, ByVal value As Object, _
    '         Optional ByVal name2 As String = Nothing, Optional ByVal value2 As Object = Nothing, _
    '         Optional ByVal name3 As String = Nothing, Optional ByVal value3 As Object = Nothing, _
    '         Optional ByVal name4 As String = Nothing, Optional ByVal value4 As Object = Nothing, _
    '         Optional ByVal name5 As String = Nothing, Optional ByVal value5 As Object = Nothing, _
    '         Optional ByVal name6 As String = Nothing, Optional ByVal value6 As Object = Nothing, _
    '         Optional ByVal name7 As String = Nothing, Optional ByVal value7 As Object = Nothing, _
    '         Optional ByVal name8 As String = Nothing, Optional ByVal value8 As Object = Nothing) As OleDbParameter()

    '    Return New OleDbParameter() {New OleDbParameter(name, value), New OleDbParameter(name2, value2), _
    '                                 New OleDbParameter(name3, value3), New OleDbParameter(name4, value4), _
    '                                 New OleDbParameter(name5, value5), New OleDbParameter(name6, value6), _
    '                                 New OleDbParameter(name7, value7), New OleDbParameter(name8, value8)}
    'End Function


    Function np1(ByVal name As String, ByVal value As Object) As OleDbParameter()
        Return New OleDbParameter() {New OleDbParameter(name, value)}
    End Function

    Function np2(ByVal name As String, ByVal value As Object, ByVal name2 As String, ByVal value2 As Object) As OleDbParameter()
        Return New OleDbParameter() {New OleDbParameter(name, value), New OleDbParameter(name2, value2)}
    End Function

    Function np3(ByVal name As String, ByVal value As Object, _
                 ByVal name2 As String, ByVal value2 As Object, _
                 ByVal name3 As String, ByVal value3 As Object) As OleDbParameter()
        Return New OleDbParameter() {New OleDbParameter(name, value), New OleDbParameter(name2, value2), _
                                     New OleDbParameter(name3, value3)}
    End Function

    Function np4(ByVal name As String, ByVal value As Object, _
                 ByVal name2 As String, ByVal value2 As Object, _
                 ByVal name3 As String, ByVal value3 As Object, _
                 ByVal name4 As String, ByVal value4 As Object) As OleDbParameter()
        Return New OleDbParameter() {New OleDbParameter(name, value), New OleDbParameter(name2, value2), _
                                     New OleDbParameter(name3, value3), New OleDbParameter(name4, value4)}
    End Function

    Function np5(ByVal name As String, ByVal value As Object, _
                 ByVal name2 As String, ByVal value2 As Object, _
                 ByVal name3 As String, ByVal value3 As Object, _
                 ByVal name4 As String, ByVal value4 As Object, _
                 ByVal name5 As String, ByVal value5 As Object) As OleDbParameter()
        Return New OleDbParameter() {New OleDbParameter(name, value), New OleDbParameter(name2, value2), _
                                     New OleDbParameter(name3, value3), New OleDbParameter(name4, value4), _
                                     New OleDbParameter(name5, value5)}
    End Function

    Function np6(ByVal name As String, ByVal value As Object, _
                 ByVal name2 As String, ByVal value2 As Object, _
                 ByVal name3 As String, ByVal value3 As Object, _
                 ByVal name4 As String, ByVal value4 As Object, _
                 ByVal name5 As String, ByVal value5 As Object, _
                 ByVal name6 As String, ByVal value6 As Object) As OleDbParameter()
        Return New OleDbParameter() {New OleDbParameter(name, value), New OleDbParameter(name2, value2), _
                                     New OleDbParameter(name3, value3), New OleDbParameter(name4, value4), _
                                     New OleDbParameter(name5, value5), New OleDbParameter(name6, value6)}
    End Function

    Function np7(ByVal name As String, ByVal value As Object, _
             ByVal name2 As String, ByVal value2 As Object, _
             ByVal name3 As String, ByVal value3 As Object, _
             ByVal name4 As String, ByVal value4 As Object, _
             ByVal name5 As String, ByVal value5 As Object, _
             ByVal name6 As String, ByVal value6 As Object, _
             ByVal name7 As String, ByVal value7 As Object) As OleDbParameter()
        Return New OleDbParameter() {New OleDbParameter(name, value), New OleDbParameter(name2, value2), _
                                     New OleDbParameter(name3, value3), New OleDbParameter(name4, value4), _
                                     New OleDbParameter(name5, value5), New OleDbParameter(name6, value6), _
                                     New OleDbParameter(name7, value7)}
    End Function

    Function np8(ByVal name As String, ByVal value As Object, _
             ByVal name2 As String, ByVal value2 As Object, _
             ByVal name3 As String, ByVal value3 As Object, _
             ByVal name4 As String, ByVal value4 As Object, _
             ByVal name5 As String, ByVal value5 As Object, _
             ByVal name6 As String, ByVal value6 As Object, _
             ByVal name7 As String, ByVal value7 As Object, _
             ByVal name8 As String, ByVal value8 As Object) As OleDbParameter()
        Return New OleDbParameter() {New OleDbParameter(name, value), New OleDbParameter(name2, value2), _
                                     New OleDbParameter(name3, value3), New OleDbParameter(name4, value4), _
                                     New OleDbParameter(name5, value5), New OleDbParameter(name6, value6), _
                                     New OleDbParameter(name7, value7), New OleDbParameter(name8, value8)}
    End Function


    Function npa(ByVal paramArr As Object()) As OleDbParameter()

        Dim ubn As Long = ((UBound(paramArr) + 1) / 2) - 1

        Dim retVal As OleDbParameter()
        ReDim retVal(ubn)

        Dim idx As Long
        For idx = 0 To UBound(paramArr) Step 2
            retVal(idx / 2) = New OleDbParameter(CStr(paramArr(idx)), paramArr(idx + 1))
        Next

        Return retVal

    End Function

    Sub TestCreateVIDEO()
        Dim vid As Long = NewVideoID
        Dim mft As New VideoManifest

        mft.InspectionDate = vidInspDate

        'Dim params As OleDbParameter() = New OleDbParameter() { _
        '        New OleDbParameter("VideoId", vid) _
        '        , New OleDbParameter("VideoGroup", 2) _
        '        , New OleDbParameter("VideoAsset", 1) _
        '        , New OleDbParameter("Title", "sample video file(" & vid & ")") _
        '        , New OleDbParameter("Filename", "sample video file(" & vid & ").mp4") _
        '        , New OleDbParameter("CurrentUser", CurrentUser) _
        '        , New OleDbParameter("VideoSize", 1024) _
        '        , New OleDbParameter("VideoComments", "The quick brown fox jumps over the lazy dog") _
        '        , New OleDbParameter("VideoDescription", "Hello sample video") _
        '        , New OleDbParameter("InspectionOrIntervention", 1024) _
        '        , New OleDbParameter("InspectionType", 1024) _
        '        , New OleDbParameter("MaintenanceItemNo", "(" & vid & ")maint 1234") _
        '        , New OleDbParameter("InspectionDate", vidInspDateObj) _
        '    }

        Dim retVal As Integer = ExecuteSP("SP_CREATE_VIDEO_RECORD", npa(New Object() { _
                                            "VideoId", vid _
                                            , "VideoGroup", 2 _
                                            , "VideoAsset", 1 _
                                            , "Title", "sample video file(" & vid & ")" _
                                            , "Filename", "sample video file(" & vid & ").mp4" _
                                            , "CurrentUser", CurrentUser _
                                            , "VideoSize", 1024 _
                                            , "VideoComments", "The quick brown fox jumps over the lazy dog" _
                                            , "VideoDescription", "Hello sample video" _
                                            , "InspectionOrIntervention", 1024 _
                                            , "InspectionType", 1024 _
                                            , "MaintenanceItemNo", "(" & vid & ")maint 1234" _
                                            , "InspectionDate", vidInspDateObj _
                                          }))

        Response.Write("<br/>" & Now & " - Created " & retVal & " video record (vidInspDate=" & vidInspDate & ").")

    End Sub



    Sub TestGetVIDEOData()
        Dim tbl As DataTable = ReadToTableSP("SP_GET_VIDEO_BY_FILENAME", _
                                np2("asset", "102107", "filename", "MA-6 MACPAC LEAK 20secs_C1.mp4"))


        Response.Write("<br/>TestGetVIDEOData Rows.Count:" & tbl.Rows.Count)

        tbl.Dispose()
    End Sub

    Function ReadToTableSP(ByVal SPName As String, _
                           Optional ByVal ParamArr As OleDbParameter() = Nothing, _
                           Optional ByVal cnn As OleDbConnection = Nothing, _
                           Optional ByVal IsSQL As Boolean = False) As DataTable

        '** Note : parameters must be passed in the same order at they are defined in the stored procedure

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

            testPrompt("Rows.Count: " & retVal.Rows.Count, forceDisplay:=alwaysPrompt)
            testPrompt("Connection: " & cn.ConnectionString, forceDisplay:=alwaysPrompt)
            testPrompt("Parameters: " & cmd.Parameters.Count, forceDisplay:=alwaysPrompt)

            cmd.Dispose()

            'Response.Write("<br/>Fill completed!!!")

        Catch ex As Exception

            testPrompt("Error execution : " & ex.Message, forceDisplay:=alwaysPrompt)
            'Response.Write("<br/>Error!!! " & ex.Message & "<br/>")

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

    Function ExecuteSP(ByVal SPName As String, Optional ByVal ParamArr As OleDbParameter() = Nothing) As Integer

        '** Note : parameters must be passed in the same order at they are defined in the stored procedure

        Dim retVal As Integer = -1
        Dim cn As OleDbConnection = Nothing
        Dim cmd As OleDbCommand = Nothing

        Try
            cn = Conn
            cmd = New OleDbCommand(SPName, cn)
            Dim par As OleDbParameter

            If ParamArr IsNot Nothing Then
                For Each par In ParamArr
                    cmd.Parameters.Add(par)
                Next
            End If

            cmd.CommandType = CommandType.StoredProcedure
            retVal = cmd.ExecuteNonQuery()

            cmd.Dispose()

        Catch ex As Exception

            testPrompt("Error execution : " & ex.Message)
            retVal = -1

        Finally

            If cmd IsNot Nothing Then cmd.Dispose()

            If cn IsNot Nothing Then
                If cn.State = ConnectionState.Open Then cn.Close()
                cn.Dispose()
            End If

        End Try

        Return retVal
    End Function

    Function ReadDataToTable(ByVal CmdString As String, _
                                Optional ByVal params As Object() = Nothing, _
                                Optional ByVal cnn As OleDbConnection = Nothing, _
                                Optional ByRef errObj As Exception = Nothing) As DataTable

        Dim retVal As New DataTable
        Dim isSQL As Boolean = (InStr(CmdString, " ") <> 0)

        Dim da As OleDbDataAdapter = Nothing
        Dim cn As OleDbConnection = Nothing
        Dim cmd As OleDbCommand = Nothing

        Try



            If cnn IsNot Nothing Then
                cn = cnn
            Else
                cn = Conn
            End If

            cmd = New OleDbCommand(CmdString, cn)

            da = New OleDbDataAdapter(cmd)

            cmd.CommandType = IIf(isSQL, CommandType.Text, CommandType.StoredProcedure)


            If params IsNot Nothing Then
                Dim pIdx As Long
                For pIdx = 0 To UBound(params)
                    cmd.Parameters.Add(New OleDbParameter("p" & pIdx, params(pIdx)))
                Next
            End If

            da.Fill(retVal)

        Catch ex As Exception

            ' log error
            errObj = ex

        Finally

            'close all
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
