<%@ WebHandler Language="VB" Class="nHandlerVL" %>

Imports System
Imports System.Data
Imports System.Data.OleDb
Imports System.Web
Imports System.Web.Services
Imports System.Web.UI.WebControls
Imports System.Web.UI.WebControls.WebParts
Imports System.IO
Public Class nHandlerVL : Implements IHttpHandler

    Public Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest
        context.Response.Cache.SetCacheability(HttpCacheability.ServerAndNoCache)
        'Dim qry_str = context.Request.QueryString
        If context.Request.QueryString("id") IsNot Nothing Then
            Dim ret As String = "{""success"":true}"
            Dim data_id As String = context.Request.QueryString("id").ToLower()
            Dim s_var_1 As String = Nothing
            Dim s_var_2 As String = Nothing
            Dim dt_var As DataTable = Nothing
            Dim i_var_1 As Integer = 0
            Dim dt As DataTable = Nothing
            Dim dr_var As DataRow = Nothing
            Dim nUpdateDatabase As Boolean = False
            Select Case context.Request.QueryString("id")
                Case "usr_list"
                    'Remove Visitor
                    If nUpdateDatabase Then
                        DAL.ExecuteQuery("DELETE * FROM SYS_LOOKUPS WHERE LKP_ID=1303", DAL.con_string)
                    End If
                    'ret = DALParameter.GetJDataTableJSON(context, "SELECT USR_ID, USR_NAME FROM TBL_USERS ORDER BY USR_ID DESC;", "")
                    ret = DALParameter.GetJDataTableJSON(context, "SELECT USR_ID, USR_NAME FROM TBL_USERS ORDER BY USR_NAME ASC;", "")
                    Exit Select
                Case "usrpar_list"
                    If context.Request.QueryString("usr_param_id") <> "undefined" Then
                        i_var_1 = context.Request.QueryString("usr_param_id")
                    End If
                    'Dim parameter As New DALParameter
                    'parameter.StoredProcParamSet(Of Integer)("@USERID", "1")
                    'Dim dtup As DataTable = DAL.ExecuteDataTableSP("SYS_QRY_PARAMS", parameter.StoredProcParam)
                    ret = DALParameter.GetJDataTableJSON(context, "SYS_QRY_USER_PARAMS", "", False, True, i_var_1)
                    Exit Select
                Case "usr_add"
                    Dim newID As Integer = 0
                    i_var_1 = 0
                    Dim mDT As DataTable = DAL.ExecuteDataTable("SELECT MAX(USR_ID) FROM TBL_USERS", DAL.con_string)
                    If Not mDT.Rows(0)(0) Is DBNull.Value Then
                        newID = mDT.Rows(0)(0) + 1
                    Else
                        newID = 1
                    End If
                    DAL.ExecuteQuery("INSERT INTO TBL_USERS (USR_ID, USR_NAME) VALUES (?,?)", DAL.con_string, New Object() {newID, context.Request.Params("USR_NAME")})
                    Exit Select
                Case "usr_edit"
                    If context.Request.QueryString("usr_id") <> "undefined" Then
                        i_var_1 = context.Request.QueryString("usr_id")
                    End If
                    s_var_1 = context.Request.QueryString("usr_id")
                    dt = DAL.ExecuteDataTable("SELECT USR_NAME FROM TBL_USERS WHERE USR_ID=" & s_var_1, DAL.con_string)
                    If dt.Rows.Count > 0 Then
                        dr_var = dt.Rows(0)
                    Else
                        dr_var = Nothing
                    End If
                    ret = DALParameter.GetJSONFromDataRow(dr_var)
                    Exit Select
                Case "usr_upd"
                    i_var_1 = Integer.Parse(context.Request.QueryString("usr_id"))
                    i_var_1 = DAL.ExecuteQuery("UPDATE TBL_USERS SET USR_NAME=? WHERE USR_ID=?", DAL.con_string, New Object() {context.Request.Params("USR_NAME"), i_var_1})
                    ret = "{""resp"":" + i_var_1.ToString() + "}"
                    Exit Select
                Case "usr_delete"
                    i_var_1 = Integer.Parse(context.Request.QueryString("usr_id"))
                    DAL.ExecuteQuery("DELETE * FROM TBL_USERS_PARAMS WHERE UPR_USR_ID=?", DAL.con_string, New Object() {i_var_1})
                    i_var_1 = DAL.ExecuteQuery("DELETE * FROM TBL_USERS WHERE USR_ID=?", DAL.con_string, New Object() {i_var_1})
                    ret = "{""resp"":" + i_var_1.ToString() + "}"
                    Exit Select
                Case "usr_par_add"
                    Dim ParSetting As Integer
                    Dim newID As Integer = 0
                    i_var_1 = 0
                    Dim mDT As DataTable = DAL.ExecuteDataTable("SELECT MAX(UPR_ID) FROM TBL_USERS_PARAMS", DAL.con_string)
                    If Not mDT.Rows(0)(0) Is DBNull.Value Then
                        newID = mDT.Rows(0)(0) + 1
                    Else
                        newID = 1
                    End If

                    If CInt(context.Request.Params("PAR") + 0) = 1102 Or CInt(context.Request.Params("PAR") + 0) = 1104 Then
                        ParSetting = CInt(context.Request.Params("PARSET") + 0)
                        Dim ParamSettingsExist As DataTable = DAL.ExecuteDataTable("SELECT * FROM TBL_USERS_PARAMS WHERE UPR_VAL_LKP_ID=? AND UPR_USR_ID=? ", DAL.con_string, New Object() {CInt(IIf(context.Request.Params("PARSET") = "", 0, context.Request.Params("PARSET")) + 0), CInt(context.Request.Params("usrIDadd") + 0)})
                        If ParamSettingsExist.Rows.Count = 0 Then
                            DAL.ExecuteQuery("INSERT INTO TBL_USERS_PARAMS (UPR_ID, UPR_USR_ID, UPR_LKP_ID, UPR_VAL_LKP_ID, UPR_VAL_TEXT) VALUES (?,?,?,?,?)", DAL.con_string, New Object() {newID, _
                                             CInt(context.Request.Params("USRID") + 0), CInt(context.Request.Params("PAR") + 0), ParSetting, context.Request.Params("PARTEXT")})
                        Else
                            ret = "duplicate"
                        End If
                    Else
                        ParSetting = 0
                        DAL.ExecuteQuery("INSERT INTO TBL_USERS_PARAMS (UPR_ID, UPR_USR_ID, UPR_LKP_ID, UPR_VAL_LKP_ID, UPR_VAL_TEXT) VALUES (?,?,?,?,?)", DAL.con_string, New Object() {newID, _
                                             CInt(context.Request.Params("USRID") + 0), CInt(context.Request.Params("PAR") + 0), ParSetting, context.Request.Params("PARTEXT")})
                    End If


                    Exit Select
                Case "usr_par_edit"

                    If context.Request.QueryString("usr_par_id") <> "undefined" Then
                        i_var_1 = context.Request.QueryString("usr_par_id")
                    End If
                    s_var_1 = context.Request.QueryString("usr_par_id")

                    dt = DAL.ExecuteDataTable("SELECT UPR_LKP_ID, UPR_VAL_LKP_ID, UPR_VAL_TEXT FROM TBL_USERS_PARAMS WHERE UPR_ID=" & s_var_1, DAL.con_string)
                    If dt.Rows.Count > 0 Then
                        dr_var = dt.Rows(0)
                    Else
                        dr_var = Nothing
                    End If
                    ret = DALParameter.GetJSONFromDataRow(dr_var)
                    Exit Select
                Case "usr_par_editPass"
                    Dim userID As Integer
                    Dim currPass, oldPass, NewPass As String

                    userID = CInt(context.Request.Params("USRID"))
                    oldPass = context.Request.Params("OldPass")
                    NewPass = context.Request.Params("NewPass")
                    currPass = DAL.ExecuteScalar("SELECT UPR_VAL_TEXT FROM TBL_USERS_PARAMS WHERE UPR_USR_ID=? AND UPR_LKP_ID=?", DAL.con_string, New Object() {userID, "1101"})

                    Try
                        If oldPass <> currPass Then
                            ret = "OldPassNotMatch"
                        Else
                            i_var_1 = DAL.ExecuteQuery("UPDATE TBL_USERS_PARAMS SET UPR_VAL_TEXT=? WHERE UPR_USR_ID=? AND UPR_LKP_ID=?", DAL.con_string, New Object() {NewPass, userID, 1101})
                            ret = "{""resp"":" + i_var_1.ToString() + "}"
                        End If
                    Catch ex As Exception
                        ret = ex.Message
                    End Try

                    Exit Select
                Case "usr_par_upd"
                    Dim ParSetting As Integer
                    i_var_1 = Integer.Parse(context.Request.QueryString("usr_par_id"))

                    '''''''''''
                    If CInt(context.Request.Params("PAR") + 0) = 1102 Or CInt(context.Request.Params("PAR") + 0) = 1104 Then
                        ParSetting = CInt(context.Request.Params("PARSET") + 0)
                        Dim ParamSettingsExist As DataTable = DAL.ExecuteDataTable("SELECT * FROM TBL_USERS_PARAMS WHERE UPR_VAL_LKP_ID=? AND UPR_USR_ID=? ", DAL.con_string, New Object() {CInt(IIf(context.Request.Params("PARSET") = "", 0, context.Request.Params("PARSET")) + 0), CInt(context.Request.Params("usrID") + 0)})
                        If ParamSettingsExist.Rows.Count = 0 Then
                            i_var_1 = DAL.ExecuteQuery("UPDATE TBL_USERS_PARAMS SET UPR_LKP_ID=?,UPR_VAL_LKP_ID=?,UPR_VAL_TEXT=? WHERE UPR_ID=?", DAL.con_string, New Object() {CInt(context.Request.Params("PAR") + 0), CInt(IIf(context.Request.Params("PARSET") = "", 0, context.Request.Params("PARSET")) + 0), context.Request.Params("PARTXT"), i_var_1})
                            ret = "{""resp"":" + i_var_1.ToString() + "}"
                        Else
                            ret = "duplicate"
                        End If
                    Else
                        ParSetting = 0
                        i_var_1 = DAL.ExecuteQuery("UPDATE TBL_USERS_PARAMS SET UPR_LKP_ID=?,UPR_VAL_LKP_ID=?,UPR_VAL_TEXT=? WHERE UPR_ID=?", DAL.con_string, New Object() {CInt(context.Request.Params("PAR") + 0), CInt(IIf(context.Request.Params("PARSET") = "", 0, context.Request.Params("PARSET")) + 0), context.Request.Params("PARTXT"), i_var_1})
                        ret = "{""resp"":" + i_var_1.ToString() + "}"
                    End If

                    '''''''''''


                    Exit Select
                Case "usr_par_delete"
                    i_var_1 = Integer.Parse(context.Request.QueryString("usr_id"))
                    i_var_1 = DAL.ExecuteQuery("DELETE * FROM TBL_USERS_PARAMS WHERE UPR_ID=?", DAL.con_string, New Object() {i_var_1})
                    ret = "{""resp"":" + i_var_1.ToString() + "}"
                    Exit Select
                Case "lkp"
                    s_var_1 = context.Request.QueryString("grp_id")
                    s_var_2 = context.Request.QueryString("p")
                    If s_var_2 Is Nothing OrElse s_var_2 = "" Then
                        dt = DAL.ExecuteDataTable("SELECT LKP_ID, LKP_DESC_B FROM SYS_LOOKUPS WHERE LKP_GRP_ID=" & s_var_1, DAL.con_string)
                    Else
                        dt = DAL.ExecuteDataTable("SELECT LKP_ID, LKP_DESC_B FROM SYS_LOOKUPS WHERE LKP_GRP_ID=" & s_var_1, DAL.con_string)
                    End If
                    ret = DALParameter.GetJSON(dt)
                    Exit Select


                Case "usr_chng_pass"

                    ' Check old password

                    s_var_1 = context.Request.QueryString("usr_id")

                    '''''''''''
                    Dim OldPass As String = DAL.ExecuteScalar("SELECT UPR_VAL_TEXT FROM TBL_USERS_PARAMS WHERE UPR_USR_ID=? AND UPR_LKP_ID=? ", DAL.con_string, New Object() {s_var_1, 1101})
                    If String.Compare(OldPass, context.Request.Params("OLDPASS"), False) = 0 Then

                        i_var_1 = DAL.ExecuteQuery("UPDATE TBL_USERS_PARAMS SET UPR_VAL_TEXT=? WHERE UPR_USR_ID=? AND UPR_LKP_ID=?", DAL.con_string, New Object() {context.Request.Params("MATCHNEWPASS"), s_var_1, 1101})
                        ret = "{""resp"":" + i_var_1.ToString() + "}"
                    Else
                        ret = "OldPassNotMatch"
                    End If

                    Exit Select
            End Select
            context.Response.Write(ret)
        End If
    End Sub

    Public ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class