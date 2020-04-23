Imports System.Data
Imports System.Data.OleDb
Imports System.Web.Configuration
'Shared Class Base Data Access Layer
<System.ComponentModel.DataObject()> _
Public Class DAL

    Public Shared con_string As String = WebConfigurationManager.ConnectionStrings("CONSTR_UserManagement").ToString()
    'Uses adhoc query
    Shared Function GetString(ByVal sql As String, ByVal connstring As String, _
            Optional ByVal pRowDelim As String = "®", Optional ByVal pColDelim As String = "©") As String

        Dim cnn As New OleDbConnection(connstring)
        cnn.Open()

        Dim da As New OleDbDataAdapter, mStr As New StringBuilder, mArr As Object()
        da.SelectCommand = New OleDbCommand(sql, cnn)

        Dim dr As OleDbDataReader = da.SelectCommand.ExecuteReader

        Dim mFldCnt As Integer = dr.VisibleFieldCount
        Do While dr.Read
            mArr = New Object() {}
            ReDim mArr(mFldCnt - 1)
            dr.GetValues(mArr)
            mStr.Append(pRowDelim & Join(mArr, pColDelim))
        Loop

        dr.Close()
        cnn.Close()
        cnn.Dispose()
        da.Dispose()

        Dim mRetVal As String = mStr.ToString
        If mRetVal.Length > 0 Then
            mRetVal = mRetVal.Substring(1)
        End If
        Return mRetVal

    End Function

    Shared Function ExecuteDataTable(ByVal Oledb As String, ByVal connstring As String, Optional ByVal params As Object() = Nothing) As DataTable

        Dim da As New OleDbDataAdapter
        da.SelectCommand = New OleDbCommand(Oledb, New OleDbConnection(connstring))
        ''Neo 20130606 Added Optional params as object
        Dim x As Integer
        If params IsNot Nothing Then
            For x = 0 To params.Length - 1
                da.SelectCommand.Parameters.Add(New OleDb.OleDbParameter("P" & x, params(x)))
            Next
        End If
        Dim dt As New DataTable
        da.Fill(dt)

        da.Dispose()
        da = Nothing

        Return dt

    End Function

    Shared Function ExecuteScalar(ByVal Oledb As String, ByVal connstring As String, Optional ByVal params As Object() = Nothing) As Object

        Dim output As Object
        Dim command As New OleDbCommand
        Dim x As Integer
        With command
            .Connection = New OleDbConnection(connstring)
            .Connection.Open()
            .CommandText = Oledb
            ''Neo 20130606 Added Optional params as object
            If params IsNot Nothing Then
                For x = 0 To params.Length - 1
                    .Parameters.Add(New OleDb.OleDbParameter("P" & x, params(x)))
                Next
            End If
            ''End
            output = .ExecuteScalar()
            .Connection.Close()
            .Connection.Dispose()
            .Dispose()
        End With

        command = Nothing
        Return output

    End Function
    '20110628 Added Optional params as object
    Shared Function ExecuteQuery(ByVal Oledb As String, ByVal connstring As String, Optional ByVal params As Object() = Nothing) As Integer

        Dim output As Integer
        Dim command As New OleDbCommand
        Dim i As Integer

        With command
            .Connection = New OleDbConnection(connstring)
            .Connection.Open()
            .CommandText = Oledb
            ''20110628 Added Optional params as object
            If params IsNot Nothing Then
                For i = 0 To params.Length - 1
                    .Parameters.Add(New OleDb.OleDbParameter("P" & i, params(i)))
                Next
            End If
            ''End
            output = .ExecuteNonQuery()
            .Connection.Close()
            .Connection.Dispose()
            .Dispose()
        End With

        command = Nothing
        Return output

    End Function

    Shared Function ExecuteDataTableSP(ByVal sp As String, Optional ByVal parameters As OleDbParameter() = Nothing) As DataTable

        Dim da As New OleDbDataAdapter
        da.SelectCommand = New OleDbCommand(sp, New OleDbConnection(con_string))
        da.SelectCommand.CommandType = CommandType.StoredProcedure
        If Not parameters Is Nothing Then
            With da.SelectCommand
                For Each param As OleDbParameter In parameters
                    .Parameters.Add(param)
                Next
            End With
        End If

        Dim dt As New DataTable()
        da.Fill(dt)

        da.Dispose()
        da = Nothing

        Return dt

    End Function

End Class


<System.ComponentModel.DataObject()> _
Public Class DALParameter

    Private Shared date_formats As String() = {"d-M-yyyy H:mm:ss tt", "d-M-yyyy H:mm tt", "dd-MM-yyyy HH:mm:ss", "d-M-yyyy H:mm:ss", "d-M-yyyy HH:mm tt", "d-M-yyyy HH tt", _
            "d-M-yyyy H:mm", "d-M-yyyy H:mm", "dd-MM-yyyy HH:mm", "dd-M-yyyy HH:mm", "dd-MM-yyyy", "dd-MMM-yyyy"}


    Private Const date_format As String = "dd-MMM-yyyy"



    Private parameters() As OleDbParameter = Nothing

    Public Sub New()

    End Sub
    Public Sub Clear()
        parameters = Nothing
    End Sub
    Public Sub StoredProcParamSet(Of T)(ByVal name As String, ByVal value As T, Optional ByVal direction As ParameterDirection = ParameterDirection.Input)
        Dim index As Integer
        If parameters Is Nothing Then
            index = 0
            ReDim parameters(index)
        Else

            '091208
            'Different approach to maintain
            'the value of parameters array while at the
            'same time resizing its size, conclusion was almost the same speed,
            'but decided to use the redim preserve since less code.
            'Redim Preserve 15 | Array.Copy 16.

            'Dim start As Integer = System.Environment.TickCount
            'For ctr As Integer = 1 To 2000000
            '    ctr += 1
            'Next
            'index = parameters.Length
            'Dim tmp(parameters.Length) As OleDbParameter
            'parameters.CopyTo(tmp, 0)
            'ReDim parameters(index)
            'tmp.CopyTo(parameters, 0)
            'MessageBox.Show(System.Environment.TickCount - start)

            'Dim start2 As Integer = System.Environment.TickCount
            'For ctr As Integer = 1 To 2000000
            '    ctr += 1
            'Next
            index = parameters.Length
            ReDim Preserve parameters(parameters.Length)
            'MessageBox.Show(System.Environment.TickCount - start2)

        End If

        parameters(index) = New OleDbParameter
        parameters(index).ParameterName = name
        parameters(index).Value = value
        parameters(index).Direction = direction

    End Sub

    Public Function StoredProcParam() As OleDbParameter()
        Return parameters
    End Function
    Public Function StoredProcParamGet(ByVal name As String) As Object
        For index As Integer = 0 To parameters.Length - 1
            If parameters(index).ParameterName = name Then
                Return parameters(index).Value
            End If
        Next
        Return Nothing
    End Function
    Public Shared Function GetJSON(dt As DataTable) As String
        Return GetJSON(dt, Nothing, Nothing)
    End Function
    Public Shared Function GetJSON(dt As DataTable, return_cols As String(), decode_cols As String()) As String
        Try
            Dim cols As String() = return_cols
            If cols Is Nothing OrElse cols.Length = 0 Then
                cols = New String(dt.Columns.Count - 1) {}
                For i As Integer = 0 To cols.Length - 1
                    cols(i) = dt.Columns(i).ColumnName
                Next
            End If

            Dim sb As New StringBuilder()
            For Each dr As DataRow In dt.Rows
                sb.Append("[")
                For Each col As String In cols
                    Dim cell_val As String = dr(col).ToString()

                    If decode_cols IsNot Nothing AndAlso decode_cols.ToString.Contains(col) Then
                        cell_val = HttpUtility.UrlEncode(cell_val)
                    Else
                        cell_val = ValidateJSON(cell_val)
                    End If

                    sb.Append((Convert.ToString("""") & cell_val) + """,")
                Next
                sb.Remove(sb.Length - 1, 1)
                sb.Append("],")
            Next

            Dim json As String = sb.ToString().TrimEnd(","c)
            sb.Length = 0
            sb.Append("[")
            sb.Append(json)
            sb.Append("]")
            json = sb.ToString()

            Return json
        Catch e As Exception
            Throw e
        End Try
    End Function

    Public Shared Function GetJDataTableJSON(c As HttpContext, view As String, filter As String) As String
        Return GetJDataTableJSON(c, view, filter, False)
    End Function
    Public Shared Function GetJDataTableJSON(ByVal c As HttpContext, view As String, filter As String, for_filter As Boolean, Optional ByVal nIsSP As Boolean = False, Optional ByVal nIsSPParam As Integer = Nothing) As String
        Dim echo As Integer = Int32.Parse(c.Request.QueryString("sEcho"))
        Dim disp_len As Integer = Int32.Parse(c.Request.QueryString("iDisplayLength"))
        Dim disp_start As Integer = Int32.Parse(c.Request.QueryString("iDisplayStart"))
        Dim search As String = c.Request.QueryString("sSearch")

        Dim cols As String = c.Request.QueryString("sColumns")

        If cols.Contains("bSel") Then
            'If selection column has been encountered remove it and force for_filter
            'cols = cols.Replace("bSel,", "");
            for_filter = True
        End If

        If for_filter Then
            'If for filter datatable, start in 1 column to disregard checkbox.
            '20141104 Neo comment for there is not filter on this app, besides .skip is not working in .net framework 2.0
            'cols = String.Join(",", System.Text.RegularExpressions.Regex.Split(c.Request.QueryString("sColumns"), ",").Skip(1).ToArray())
        End If

        Dim col_names As String() = cols.Split(","c)
        Dim col_types As String() = New String(col_names.Length - 1) {}
        For i As Integer = 0 To col_names.Length - 1
            'Remove datatype flag from col_names then passed it to seperate varable.
            col_types(i) = col_names(i).ToCharArray()(0).ToString()
            col_names(i) = col_names(i).Remove(0, 1)
        Next

        ' Build order by clause.
        Dim order_clause As String = String.Empty
        If Not String.IsNullOrEmpty(c.Request.QueryString("iSortCol_0")) Then
            Dim sort_col As Integer = Integer.Parse(c.Request.QueryString("iSortCol_0"))
            Dim sort_dir As Integer
            sort_dir = (IIf(c.Request.QueryString("sSortDir_0").ToUpper() = "DESC", 1, -1))

            order_clause += col_names(sort_col)
            order_clause += " "
            order_clause += (IIf(sort_dir = 1, "DESC", "ASC"))
        End If

        'Build where clause
        Dim where_clause As String = String.Empty

        ' if additional filter was passed use it.

        For ctr As Integer = 0 To col_names.Length - 1
            If Not String.IsNullOrEmpty(c.Request.QueryString("sSearch_" & ctr)) Then
                Dim w As String = c.Request.QueryString("sSearch_" & ctr)
                If col_types(ctr) <> "d" Then
                    'Not Date Time  
                    where_clause += " AND "
                    If w.Contains("*"c) Then
                        w = w.Replace("*", "")
                        where_clause += "(" + col_names(ctr) + " LIKE '%" + w.Replace(",", "' OR " + col_names(ctr) + " LIKE='%") + "%')"
                    Else
                        where_clause += "(" + col_names(ctr) + "='" + w.Replace(",", "' OR " + col_names(ctr) + "='") + "')"
                    End If
                Else
                    where_clause += " AND "
                    If w.Contains("*"c) Then
                        w = w.Replace("*", "")
                        'where_clause += "(" + col_names[ctr] + " LIKE '" + w.Replace(",", "' OR " + col_names[ctr] + " LIKE='") + "')";
                        where_clause += "(TO_CHAR(" + col_names(ctr) + ",'DD-Mon-YYYY') LIKE '%" + w.Replace(",", "' OR TO_CHAR(" + col_names(ctr) + ",'DD-Mon-YYYY') LIKE '%") + "%')"
                    Else
                        where_clause += "(TO_CHAR(" + col_names(ctr) + ",'DD-Mon-YYYY')='" + w.Replace(",", "' OR TO_CHAR(" + col_names(ctr) + ",'DD-Mon-YYYY')='") + "')"
                    End If
                End If
            End If
        Next

        '            if (where_clause.StartsWith(" AND ")) where_clause = where_clause.Remove(0, 5);

        If where_clause.Length > 0 Then
            filter += where_clause
        End If
        Dim after_filter_c As Integer = 0
        Dim before_filter_c As Integer = 0 '

        '''''
        Dim dt As DataTable = Nothing
        If nIsSP Then
            Dim parameter As New DALParameter
            parameter.StoredProcParamSet(Of Integer)("@USERID", nIsSPParam)
            'Dim dtup As DataTable = DAL.ExecuteDataTableSP(view, parameter.StoredProcParam)
            dt = DAL.ExecuteDataTableSP(view, parameter.StoredProcParam)
        Else
            dt = DAL.ExecuteDataTable(view, DAL.con_string)
        End If
        'Dim dt As DataTable = DAL.ExecuteDataTable(view, DAL.con_string)
        'Dim dt As DataTable = DataAccess.GetSP_DataTableWCount("SP_TABLE_BY_PAGE", New OracleParameter() {New OracleParameter("P_TABLE", view), New OracleParameter("P_COLS", String.Join(",", col_names)), New OracleParameter("P_WHERE", filter), New OracleParameter("P_ORDER_BY", order_clause), New OracleParameter("P_ROW_NO_MAX", (disp_start + disp_len)), New OracleParameter("P_ROW_NO_MIN", disp_start), _
        '    New OracleParameter("P_GROUP_BY", (If(for_filter, String.Join(",", col_names), Nothing)))}, after_filter_c, before_filter_c)

        Dim total_display_records As Integer = after_filter_c
        Dim total_records As Integer = before_filter_c

        Dim sb As New StringBuilder()
        For i As Integer = 0 To dt.Rows.Count - 1
            Dim dr As DataRow = dt.Rows(i)

            sb.Append("[")
            For Each col As String In col_names
                Dim cell_val As String = String.Empty
                'Neo 20141104 changed  If dr(col).[GetType]() = GetType(System.DateTime) Then to the code below, = is not working in .net framework 2.0
                If dr(col).[GetType]() Is GetType(System.DateTime) Then
                    cell_val = DateTime.Parse(dr(col).ToString(), Nothing).ToString(date_format)
                Else
                    cell_val = dr(col).ToString()
                End If

                cell_val = ValidateJSON(cell_val)

                If for_filter Then
                    sb.Append(""""",")
                End If
                'Add null col for filter checkbox
                sb.Append((Convert.ToString("""") & cell_val) + """,")
            Next
            sb.Remove(sb.Length - 1, 1)
            sb.Append("],")
        Next

        Dim json As String = String.Empty
        json = sb.ToString().TrimEnd(","c)

        sb.Length = 0
        sb.Append("{")
        sb.Append("""sEcho"": ")
        sb.Append(echo)
        sb.Append(",")
        sb.Append("""iTotalRecords"": ")
        sb.Append(total_records)
        sb.Append(",")
        sb.Append("""iTotalDisplayRecords"": ")
        sb.Append(total_display_records)
        sb.Append(",")
        sb.Append("""aaData"": [")
        sb.Append(json)
        sb.Append("]}")
        json = sb.ToString()

        Return json

    End Function

    Public Shared Function GetJSONFromDataRow(dr As DataRow) As String
        Try
            Dim sb As New StringBuilder()
            sb.Append("[")

            For i As Integer = 0 To (dr.Table.Columns.Count - 1)
                Dim o As Object = dr(i)
                Dim cell_val As String = o.ToString()
                cell_val = ValidateJSON(cell_val)
                If cell_val.Contains("|©®") Then
                    Dim ResString As String
                    ResString = cell_val.Substring(0, cell_val.Length - 3)
                    Dim IACCheckBoxes As String()
                    IACCheckBoxes = ResString.Split("|")
                    For Each value As String In IACCheckBoxes
                        sb.Append((Convert.ToString("""") & value) + """,")
                    Next
                Else
                    sb.Append((Convert.ToString("""") & cell_val) + """,")
                End If
                'sb.Append((Convert.ToString("""") & cell_val) + """,")
            Next

            sb.Remove(sb.Length - 1, 1)
            sb.Append("],")

            Dim json As String = sb.ToString().TrimEnd(","c)
            sb.Length = 0
            sb.Append("[")
            sb.Append(json)
            sb.Append("]")
            json = sb.ToString()

            Return json
        Catch e As Exception
            Throw e
        End Try
    End Function



    Public Shared Function ValidateJSON(val As String) As String
        Try
            If val.IndexOf("\"c) > -1 Then
                val = val.Replace("\", "\\")
            End If
            If val.IndexOf("/"c) > -1 Then
                val = val.Replace("/", "\/")
            End If
            If val.Contains(vbCr) Then
                val = val.Replace(vbCr, "\r")
            End If
            If val.Contains(vbLf) Then
                val = val.Replace(vbLf, "\n")
            End If
            If val.Contains(vbTab) Then
                val = val.Replace(vbTab, "\t")
            End If
            If val.IndexOf(""""c) > -1 Then
                val = val.Replace("""", "\""")
            End If

            Return val
        Catch e As Exception
            'LogServerException(e, "ValidateJSON")
            Throw e
        End Try
    End Function

End Class



