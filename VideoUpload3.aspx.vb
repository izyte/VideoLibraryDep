Imports System.IO
Imports System.Diagnostics
Imports System.Data
Imports System.Data.OleDb

Partial Class VideoUpload3
    Inherits VidCommon

    Public POSTER_CHUNKS As Long = 10

    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load

        If Request.Params("desc") IsNot Nothing Then
            LogEvent(Request.Params("desc"), "UploadInitialCheck")
        Else

        End If

        Dim Buffer As Byte()
        Dim len As Long
        Dim fn As String = Request.Params("fn") & ""

        Dim bfn As String, mfn As String, mf As String
        Dim tfn As String
        Dim sz As Long
        Dim csz As Long ' chunk expected size
        Dim cnt As Integer
        Dim idx As Integer = CInt(Request.Params("idx"))

        Dim grp As Integer = vidGroup


        If vidCheck Then
            InitialManifestCheck()
        Else
            UploadChunk()
        End If

        Exit Sub




    End Sub



    Function PostProcessUploadedFile(ByVal path As String, ByVal fn As String) As String

        fn = fn.ToLower()

        ' if uploaded file is already in mp4 format exit function and return "normal"
        If fn.EndsWith(".mp4") Then Return "normal"

        Dim lastDotPos As Integer = InStrRev(fn, ".")
        Dim origExt As String = fn.Substring(lastDotPos)
        Dim baseFile As String = fn.Substring(0, lastDotPos)

        'Dim p As New Process
        'Process.Start("c:\ffmpeg\bin\ffmpeg.exe", "-i " & path & "\" & fn & " " & path & "\" & baseFile & "mp4")


        Return "converted"
    End Function

    Function GetManifest(ByVal fn As String) As String
        Dim retVal As String = ""
        Dim path As String = MapPath(UPLOAD_FOLDER)

        Dim fullPath As String = path & "\" & fn
        Dim mftPath As String = fullPath.Substring(0, InStrRev(fullPath, ".")) & "$MF"

        ' check if a temporary file exists
        If My.Computer.FileSystem.FileExists(mftPath) Then
            retVal = My.Computer.FileSystem.ReadAllText(mftPath)
        End If

        Return retVal
    End Function


    ' *********************************************************************************************************
    ' *
    ' * New functions and subroutines in this section
    ' *
    ' *********************************************************************************************************

    Sub UploadChunk()
        Dim buffer As Byte()

        Dim mftText As New StringBuilder
        Dim td As DateTime = Now

        Dim mft As VideoManifest = vidManifest()

        Dim path As String
        Dim fileFullPath As String
        Dim filePosterFullPath As String
        Dim fileConvFilename As String
        Dim fileConvFullPath As String

        Try


            Dim Action As String = ""
            Dim iLen As Long = inputStreamLength
            Dim idx As Long = vidFileChunkIndex
            Dim err As Boolean = False

            With mft

                path = GetVideoFolder(.VideoId, .VideoGroupFolderID, .VideoAssetFolderID)

                fileFullPath = path & "\RAW.$$$"
                fileConvFilename = "RAW." & vidFileExtOnly
                filePosterFullPath = path & "\POSTER." & vidFileExtOnly
                fileConvFullPath = path & "\" & fileConvFilename

                If iLen <> -1 And idx <> -1 Then
                    If iLen = vidFileChunkSize Then
                        Try

                            If idx = 0 Then
                                ' initial chunk upload... reset uploaded
                                .Uploaded = 0
                                .Completed = False

                                ' delete existing RAW video files

                                Kill(fileFullPath)
                                Kill(filePosterFullPath)
                                Kill(fileConvFullPath)

                            End If


                            ' process file chunk only if uploading of the chunk was completed !!!
                            ReDim buffer(iLen - 1)
                            IStream.Read(buffer, 0, iLen)

                            ' append file chunk to the video file temporary file
                            ' ERROR TRAPPRING CAN BE PLACED HERE IF ERROR OCCURS DURING CREATION/UPDATE OF FILE
                            My.Computer.FileSystem.WriteAllBytes(fileFullPath, buffer, True)


                        Catch ex As Exception
                            err = True
                            LogEvent(ex.Message, "UploadChunk-Append process")
                        End Try

                        If Not err Then

                            ' if not error encountered during appending of chunk

                            .Uploaded += iLen               ' increment file size uploaded
                            .Index = idx                    ' update last chunk index

                        End If

                    Else
                        LogEvent("Chunk incomplete: Uploaded size: " & iLen & _
                                 ", Expected size: " & vidFileChunkSize, _
                                   "UploadChunk-Terminated upload")
                    End If
                End If


                If .Uploaded >= .VideoSize Then
                    ' check if the total uploaded chunks is already the same as the recorded file size
                    .ActionStatus = "COMPLETE"
                    .Completed = True

                    ' if poster video is not yet existing and uploading is already complete
                    If Not IsExisting(filePosterFullPath) Then
                        My.Computer.FileSystem.CopyFile(fileFullPath, filePosterFullPath)
                    End If

                    My.Computer.FileSystem.RenameFile(fileFullPath, fileConvFilename)
                    vidStatUploadingToEncoding(.VideoId)

                    'If Not IsExisting(filePosterFullPath) Then
                    '    My.Computer.FileSystem.CopyFile(fileConvFilename, filePosterFullPath)
                    'End If

                Else

                    'Dim rawInfo As FileInfo = My.Computer.FileSystem.GetFileInfo(fileFullPath)
                    'If fileFullPath.Length >= POSTER_SIZE Then
                    '    ' create poster out of the converted file
                    '    My.Computer.FileSystem.CopyFile(fileFullPath, filePosterFullPath)
                    'End If

                    Dim postFile As FileInfo = My.Computer.FileSystem.GetFileInfo(fileFullPath)

                    'If idx = POSTER_CHUNKS - 1 And Not IsExisting(filePosterFullPath) Then
                    If postFile.Length >= (10 * 1024 * 1024) And Not IsExisting(filePosterFullPath) Then
                        ' get a snapshot of the uploaded video for poster conversion
                        My.Computer.FileSystem.CopyFile(fileFullPath, filePosterFullPath)
                        'Dim posterInfo As FileInfo = My.Computer.FileSystem.GetFileInfo(filePosterFullPath)

                        'LogEvent("Poster size: " & posterInfo.Length, "UploadChunk")

                    End If

                End If


            End With

            Action = "UPLCHUNK"

            Response.Write(UpdateManifestFile(mft, Action))

        Catch ex As Exception
            LogEvent(ex.Message, "UploadChunk Error")
        End Try

    End Sub

    Sub InitialManifestCheck()
        ' check entry in the database id the file being uploaded already exist

        ' get manifest of the file being uploaded/
        ' at this point, the file uploaded will be checked if it is already
        ' in existing in the repository, under the specified asset folder

        'ResetNewVideoID()   ' this is only temporary  and only called to limit video id to "1"

        Dim mft As VideoManifest = vidManifest(True)



        Dim mark As String = "0"

        With mft

            LogEvent("-")

            LogEvent("VideoPath:" & .VideoPath & ", " & .VideoGroupFolderID & "," & .VideoAssetFolderID, "Initial manifest check...")

            Try



                ' for new file, remove all files and directories if existing
                If .IsNewFile Then
                    mark = "1"
                    KillAllFiles(.VideoPath)
                    mark = "2"
                Else
                    ' check actual file information that was uploaded
                    ' get bytesperchunk
                    ' get uploaded chunk index
                    ' get uploaded size

                    mark = "3"

                    Dim vPath As String = GetVideoFolder(.VideoId, .VideoGroupFolderID, .VideoAssetFolderID)

                    mark = "4"


                    Dim rawFullPath As String = vPath & "\RAW.$$$"

                    Dim fList As Object = My.Computer.FileSystem.GetFiles(vPath, FileIO.SearchOption.SearchTopLevelOnly, New String() {"RAW.*"})
                    Dim fInfo As IO.FileInfo
                    Dim fPath As String

                    Dim tChunks As Integer
                    Dim cChunks As Integer


                    ' this part will get state of uploaded file directly from the physical file properties
                    For Each fPath In fList

                        fInfo = My.Computer.FileSystem.GetFileInfo(fPath)
                        LogEvent("fInfo.Length:" & fInfo.Length, "InitialManifestCheck")

                        tChunks = vidTotalChunks(.VideoSize, .BytesPerChunk)

                        mark = "5"

                        cChunks = vidCurrentChunkIndex(fInfo.Length, .BytesPerChunk)

                        mark = "6"

                        LogEvent("Chunks : " & cChunks & ", Index: " & .Index, "Index check!!!")

                        If cChunks Then
                            .Index = cChunks - 1
                            .Uploaded = fInfo.Length
                        End If

                        ' get information of the first item in the list which is expected to be the only item
                        ' in the list
                        Exit For
                    Next



                End If

                LogEvent("currIndex:" & vidFileChunkIndex & ", mIndex:" & .Index & ", mUploaded: " & .Uploaded & ", bpc:" & .BytesPerChunk, "InitialManifestCheck")

            Catch ex As Exception
                LogEvent(ex.Message, "InitialManifestCheck - error (" & mark & ")")
            End Try


            ' create new manifest file
            Response.Write(UpdateManifestFile(mft, "CHK"))
            LogEvent("VideoPath:" & .VideoPath & ", " & .VideoGroupFolderID & "," & .VideoAssetFolderID, "Initial manifest check...")

        End With

    End Sub







End Class
