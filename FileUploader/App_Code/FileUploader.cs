using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;

using System.IO;

using System.Web.Script.Serialization;
using System.Data;
using System.Data.OleDb;


/// <summary>
/// Summary description for FileUploader
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]
public class FileUploader : System.Web.Services.WebService
{

    private String STR_MANIFEST_FILE;
    private  String STR_RAW_FILE;

    public FileUploader()
    {
        //STR_MANIFEST_FILE = "manifest.json";
        STR_MANIFEST_FILE = pVal("fn") + ".manifest.json";
        STR_RAW_FILE = pVal("fn") + ".raw.$$$";

        string cnTpl = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source={0}\\VideoLibrary.mdb;Persist Security Info=True;";
        string libraryPath = System.Configuration.ConfigurationManager.AppSettings["VIDEO_LIBRARY_DATA_PATH"];
        APP_GLOBAL.VIDEO_LIBRARY_DATA_PATH = String.Format(cnTpl,Context.Server.MapPath(libraryPath));

        // set manifest same as the original file name
        //Uncomment the following line if using designed components 
        //InitializeComponent(); 
    }

    public ProcessResult processResult = null;

    [WebMethod]
    public void TestClientAccess()
    {
        Stream strm = Context.Request.InputStream;

        Byte[] buffer = new byte[strm.Length];
        strm.Read(buffer, 0, buffer.Length);

        String s = System.Text.Encoding.UTF8.GetString(buffer, 0, buffer.Length);

        processResult = new ProcessResult();

        JavaScriptSerializer js = new JavaScriptSerializer();

        Context.Response.Write(js.Serialize(processResult));

    }

    [WebMethod]
    public void ReceiveChunk()
    {

        string acn = pVal("acn");
        if (acn == "test")
        {
            PerformTestRoutines();
            return;
        }else if (acn == "info")
        {
            GetInformation();
            return;
        }

            //return "Hello Chunk";
            //Context.Response.Write("Hello chunk!!!" + Context.Request.Params["idx"]);

            /**************************************************************************************************************
             * Get Input parameters
             * **************************************************************************************************************/
            String fileFolder = getFileFolder();

        Int64 idx = pVal64("idx");

        setManifest();

        String rawFile = fileFolder + "\\" + STR_RAW_FILE;
        FileInfo rfi = new FileInfo(rawFile);


        if (idx == -1)
        {
            if (rfi.Exists)
            {
                if (rfi.Length < processResult.fileSize)
                {
                    Double nextChunk = rfi.Length / processResult.firstBlobSize;
                    if(nextChunk == (int)nextChunk)
                    {
                        processResult.nextBlobIndex = (int)nextChunk;
                    }
                }
                // check if the file size, first blob size, last blob size and chunk count match
                // calculate the index of the last blob that was appended to the raw file
                String temp = "ddd";

            }else
            {

            }

            // 

        }
        else
        {
            // save individual chunk
            if (idx == 0)
            {
                
            }

            Stream strm = Context.Request.InputStream;

            Boolean isLastBlob = ((idx + 1) == processResult.blobCount);
            Int64 blobRefSize = (isLastBlob ? processResult.lastBlobSize : processResult.firstBlobSize);
            Boolean isRightLength = (strm.Length == blobRefSize);  // expected size of stream;

            try
            {

                if (isRightLength)
                {
                    Byte[] buffer = new byte[strm.Length];
                    strm.Read(buffer, 0, buffer.Length);

                    // Append new chunk to the video file being built...
                    String appendError = AppendAllBytes(rawFile, buffer);
                    if (appendError.Length == 0)
                    {
                        if (isLastBlob)
                        {
                            // if last blob is being processed, rename rawFile to processResult.targetFileName
                            renFile(rawFile, fileFolder + "\\" + processResult.fileName);
                            processResult.isUploadComplete = true;

                            // Call additional process which creates file manifest record into a database
                            // this must be executed only if the last file which belong to the same group of files
                            // is sent. The method shall return a new id which is also set as the new processResult
                            // new file id.
                            PostFileRecord();

                        }

                    }
                    else
                    {
                        processResult.errMessage = "Error append bytes: " + appendError;
                    }

                    File.WriteAllText(fileFolder + "\\" + STR_MANIFEST_FILE, new JavaScriptSerializer().Serialize(processResult));


                }   // end of right size
                else
                {
                    processResult.errMessage = "Stream size did not match expected blob size";
                }   // end of not right size
            }
            catch (Exception e)
            {
                processResult.errMessage ="Error ReceiveChunk(): " + e.Message;
            }

            processResult.currentBlobIndex = idx;


            // read input and compare lenth with the expected blob size 
        }



        /* ********************************************************************************************************
         * check uploade status
         * 
        ************************************************************************************************************/
        JavaScriptSerializer js = new JavaScriptSerializer();

        Context.Response.Write(js.Serialize(processResult));
    }

    private void GetInformation()
    {
        //Context.Response.Write("GetInformation");
        processResult = new ProcessResult();
        processResult.action = "info";

        string json = "";

        string jsonTpl = "\"format\":\"{0}\"," +
                "\"totalSize\":{1},\"totalSizeUnit\":\"{2}\"," +
                "\"totalFreeSize\":{3},\"totalFreeSizeUnit\":\"{4}\"," +
                "\"availableFreeSpace\":{5},\"availableFreeSpaceUnit\":\"{6}\"," +
                "\"type\":\"{7}\",\"ready\":{8},\"root\":\"{9}\"," +
                "\"volumeLabel\":\"{10}\",\"created\":{11}";


        string root = System.Configuration.ConfigurationManager.AppSettings["UPLOAD_LOCATION"];
        if (!System.IO.Path.IsPathRooted(root)) root = Server.MapPath(root);
        DirectoryInfo rDi = new DirectoryInfo(root);
        try
        {
            foreach (DriveInfo di in DriveInfo.GetDrives())
            {
                if (di.Name.ToLower() == rDi.Root.ToString().ToLower())
                {
                    string[] sizeTotal = convertSizeWithUnit(di.TotalSize).Split('|');
                    string[] sizeFree = convertSizeWithUnit(di.TotalFreeSpace).Split('|');
                    string[] sizeAvailable = convertSizeWithUnit(di.AvailableFreeSpace).Split('|');


                    json = String.Format(jsonTpl
                            , di.DriveFormat
                            , Convert.ToDouble(sizeTotal[0])
                            , sizeTotal[1]
                            , Convert.ToDouble(sizeFree[0])
                            , sizeFree[1]
                            , Convert.ToDouble(sizeAvailable[0])
                            , sizeAvailable[1]
                            , di.DriveType
                            , di.IsReady
                            , di.RootDirectory.Name.Replace("\\", "\\\\")
                            , di.VolumeLabel
                            , di.RootDirectory.CreationTime.Ticks
                        );

                    break;
                }
            } // end of foreach in DriveInfo.GetDrives()
        }
        catch (Exception e)
        {
            json = String.Format(jsonTpl
                , ""
                , -1
                , -1
                , -1
                , -1
                , -1
                , -1
                , ""
                , false
                , ""
                , ""
                , 0
            );
        }


        //JavaScriptSerializer js = new JavaScriptSerializer();
        //Context.Response.Write(js.Serialize(processResult));
        Context.Response.Write("{" + json.Replace("True", "true").Replace("False", "false") + "}");

    }

    private string convertSizeWithUnit(Int64 sizeInBytes)
    {
        if (sizeInBytes < 1000)
        {
            return sizeInBytes + "|b";
        }
        else if (sizeInBytes >= 1000 && sizeInBytes < 1000000)
        {
            return (sizeInBytes / 1000.0) + "|Kb";
        }
        else if (sizeInBytes >= 1000000 && sizeInBytes < 1000000000)
        {
            return (sizeInBytes / 1000000.0) + "|Mb";
        }
        else if (sizeInBytes >= 1000000000 && sizeInBytes < 1000000000000)
        {
            return (sizeInBytes / 1000000000.0) + "|Gb";
        }
        else if (sizeInBytes >= 1000000000000 && sizeInBytes < 1000000000000000)
        {
            return (sizeInBytes / 1000000000000.0) + "|Tb";
        }
        else if (sizeInBytes >= 1000000000000000 && sizeInBytes < 1000000000000000000)
        {
            return (sizeInBytes / 1000000000000000.0) + "|Pb";
        }
        else
        {
            return (sizeInBytes / 1000000000000000000.0) + "|Eb";
        }
    }
    private void PerformTestRoutines()
    {
        //testAccessVideoLibraryData();
        //PostFileRecord();

        Context.Response.Write("PerformTestRoutines");
    }

    private void PostFileRecord()
    {

        ProcessResult pr;
        bool testMode = false;
        if (processResult != null)
        {
            // abort this process when the file being processed is not the main (viceo) file
            if (!processResult.mainFile) return;
            // abort this process when final tag has already been assigned
            if (processResult.finalTag.Length != 0) return;
            pr = processResult;
        }else
        {
            pr = new ProcessResult();
            testMode = true;
        }

        const Int64 UPLOAD_PARENT_ID = 240275;
        string grp = "G0" + UPLOAD_PARENT_ID.ToString();
        string tpl = "\"videoTag\":\"{0}\", \"CONNECTION_STRING\":\"{1}\"";
        string getCn = comClsDAL.CnStr();

        Int64 tblNewId = (Int64)comClsDAL.comReadScalar("VW_NEW_VIDEO_ID");


        /***************************************************************************************
         * SP - SP_CREATE_VIDEO_RECORD
         * Params:
         * 1.  VideoId
         * 2.  VideoGroup
         * 3.  VideoAsset
         * 4.  Title                (default: fileName)
         * 5.  Filename
         * 6.  CurrentUser
         * 7.  VideoSize
         * 8.  VideoDescription
         * 9.  VideoComments
         * 10. InspectionOrIntervention
         * 11. InspectonType
         * 12. MaintenanceItemNo
         * 13. InspectionDate
         ***************************************************************************************/
        //ProcessResult pr =processResult;

        string padId = ("0000000" + tblNewId.ToString());
        pr.finalTag = "V0240275" + padId.Substring(padId.Length - 7);

        // Build parameters
        List<object> cmdParams = 
            new List<object>(){
                                    tblNewId,
                                    UPLOAD_PARENT_ID,
                                    UPLOAD_PARENT_ID,
                                    pr.sourceFileName,
                                    pr.sourceFileName,
                                    pr.userId,
                                    pr.fileSize,
                                    "",
                                    "",
                                    "Inspection",
                                    "",
                                    "",
                                    DBNull.Value
                                };

        // Execute command
        ExecCommandsReturn result = comClsDAL.comExeCommands(new List<commandParam>()
            {
                new commandParam()
                {
                    cmdText="SP_CREATE_VIDEO_RECORD",
                    cmdParams=cmdParams
                }

            });

        if (!testMode)
        {
            // Rename folder



            string origPath = getFileFolder(grp, pr.tag);
            if (!Directory.Exists(origPath)) return;        // if source path does noet exist

            string newPath = getFileFolder(grp, pr.finalTag);
            if (Directory.Exists(newPath)) Directory.Delete(newPath, true);    // delete existin new folder

            Directory.Move(origPath, newPath);
            if(Directory.GetFiles(newPath,"*.manifest.json").Length!=0)
                foreach(string mftFile in Directory.GetFiles(newPath, "*.manifest.json"))
                {
                    File.Delete(mftFile);
                }
            // Delete manifest all upload manifest files


                // Create Video.json file containing current parameters about the video file
                //{"V48":["240275","240275","Tree (XT) - Troika TA006 Well","Troika%20TA6%20Inspection%2011-02-2009%20Leak","Complete","00:01:07.88","5877846","100","*SYSTEM*","1","1","1","0","<VIEWS>",""]}
                /*
                 * 0 - New video id
                 * 1 - parent/asset(temporary) id
                 * 2 - Name/Description
                 * 3 - duration in hh:mm:ss.nn format
                 * 4 - video size in bytes
                 * 5 - user id
                 */

            string vidJSONPath = newPath + "\\Video.json";
            string vTpl = "\"V{0}\":[\"{1}\",\"{1}\",\"{2}\",\"{2}\",\"Complete\",\"{3}\",\"{4}\",\"100\",\"{5}\",\"1\",\"1\",\"1\",\"0\",\"<VIEWS>\",\"\"]";
            File.WriteAllText(vidJSONPath, String.Format(vTpl, tblNewId, UPLOAD_PARENT_ID,pr.sourceFileName, pr.duration,pr.fileSize,pr.userId));

        }
        else
        {

            Context.Response.Write("This is a test 1234. " + "\n\n");
            Context.Response.Write(getFileFolder(grp, "original") + "\n\n");
            Context.Response.Write(getFileFolder(grp, "new") + "\n\n");

            // Send response to client if on test mode
            Context.Response.Write(new JavaScriptSerializer().Serialize(pr) + "\n\n");
            Context.Response.Write("{" + String.Format(tpl, tblNewId, getCn) + "}");
        }


    }

    private Int64 GetNewVideoId()
    {
        Int64 ret = 0;
        return 0;
    }

    private void testAccessVideoLibraryData()
    {
        string tpl = "\"videoTag\":\"{0}\", \"CONNECTION_STRING\":\"{1}\"";
        Context.Response.Write("{" + String.Format(tpl, 48,VideoLibCnStr())+ "}");
    }

    private string VideoLibCnStr()
    {
        string cnTpl = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source={0}\\VideoLibrary.mdb;Persist Security Info=True;";
        string libraryPath = System.Configuration.ConfigurationManager.AppSettings["VIDEO_LIBRARY_DATA_PATH"];

        return String.Format(cnTpl, Context.Server.MapPath(libraryPath));
    }

    private void renFile(String oldFile, String newFile)
    {
        // rename and overwrite
        FileInfo nF = new FileInfo(newFile);
        if (nF.Exists) nF.Delete();

        File.Move(oldFile, newFile);
        
    }


    private Boolean fileExists(String fileFullPath)
    {
        FileInfo fi = new FileInfo(fileFullPath);
        return fi.Exists;
    }

    private string AppendAllBytes(string path, byte[] bytes)
    {
        //argument-checking here.
        try
        {
            using (var stream = new FileStream(path, FileMode.Append))
            {
                stream.Write(bytes, 0, bytes.Length);
            }

            return "";

        }catch(Exception e)
        {
            return e.Message;
        }
    }

    private void setManifest()
    {

        // check file tag existence in the directory structure
        /*
            idx=-1                          // blob id, -1 for initial request, >-1 if subsequent request (i.e. chunk saving)
            &nm=HouseImprovement.mp4        // raw filename
            &tc=1626                        // number of blobs to send
            &fbs=512000                     // first blob size
            &lbs=2320                       // last blob size
            &lm=1489392571887               // file was last modified   (left part file folder to use when tag is not specified)
            &fs=832002320                   // file size                (right part file folder to use when tag is not specified)
            &tag=                           // file folder to use when supplied
            &parent=                        // parent folder to use when supplied
         */

        JavaScriptSerializer js = new JavaScriptSerializer();

        Int64 idx = pVal64("idx");

        String fileFolder = getFileFolder();
        String mftFile = fileFolder + "\\" + STR_MANIFEST_FILE;
        String rawFile = fileFolder + "\\" + STR_RAW_FILE;
        String targetFile = (pVal("tfn") != "" ? pVal("tfn") : pVal("fn"));
        String targetPath = fileFolder + "\\" + targetFile;

        bool processStart = (idx == -1);

        FileInfo mft = new FileInfo(mftFile);

        if (processStart && mft.Exists)
        {
            if (!fileExists(rawFile) && !fileExists(targetPath))
            {
                mft.Delete();
                mft = new FileInfo(mftFile);
            }
        }else if (processStart && !mft.Exists && (fileExists(targetPath) || fileExists(rawFile)))
        {
            if(fileExists(targetPath))File.Delete(targetPath);
            if(fileExists(rawFile)) File.Delete(rawFile);
        }


        if (mft.Exists)
        {
            processResult = js.Deserialize<ProcessResult>(File.ReadAllText(fileFolder + "\\" + STR_MANIFEST_FILE));
        }   // if manifest exist (end)
        else
        {
            // New manifest file is to be created ...

            processResult = new ProcessResult();

            String tag = pVal("tag");
            String duration = pVal("dur");
            bool mainFile = (pVal("mfl") == "1");
            String parent = pVal("parent");
            String fileName = pVal("fn");
            String sourceFileName = pVal("sfn");
            
            String targetFileName = pVal("tfn");
            String userId = pVal("uid");

            if (targetFileName.Length == 0) targetFileName = fileName;

            Int64 fileSize = pVal64("fs");
            Int64 lastModified = pVal64("lm");

            Int64 blobCount = pVal64("tc");
            Int64 firstBlobSize = pVal64("fbs");
            Int64 lastBlobSize = pVal64("lbs");

            DirectoryInfo di = new DirectoryInfo(fileFolder);
            FileInfo fi = new FileInfo(fileFolder + "\\" + targetFileName);


            if (!di.Exists) di.Create();         // folder is not yet existing

            processResult.originalFileName = fileName;
            processResult.fileName = targetFileName;
            processResult.sourceFileName = sourceFileName;
            processResult.fileSize = fileSize;

            processResult.isFileExisting = fi.Exists;

            processResult.blobCount = blobCount;
            processResult.firstBlobSize = firstBlobSize;
            processResult.lastBlobSize = lastBlobSize;
            processResult.userId = userId;
            processResult.tag = tag;

            processResult.duration = duration;

            processResult.mainFile = mainFile;

            File.WriteAllText(fileFolder + "\\" + STR_MANIFEST_FILE, js.Serialize(processResult));

        }   // if manifest does not exist (end)

        processResult.errMessage = "";

    }

    private string errJSONString(Exception e,String methodName)
    {
        const String tpl = "{\"statos\":error,\"method\":\"{0}\", \"message\":\"{1}\"}";
        return String.Format(tpl, methodName, e.Message);
    }

    private bool isErrorJSON(string str)
    {
        return (str.ToLower().IndexOf(":error") != -1);
    }

    private String getFileFolder(string prmParent= "", string prmTag = "")
    {

        string root = System.Configuration.ConfigurationManager.AppSettings["UPLOAD_LOCATION"];
        if (!System.IO.Path.IsPathRooted(root)) root = Server.MapPath(root);


        String ret = "";

        String origTag = pVal("tag");
        String finalTag = pVal("ftag");

        String tag = prmTag.Length != 0 ? prmTag : (finalTag.Length != 0 ? finalTag : origTag);
        String parent = prmParent.Length!=0 ? prmParent : pVal("parent");

        Int64 fileSize = pVal64("fs");
        Int64 lastModified = pVal64("lm");

        ret = root + (parent.Length == 0 ? "" : "\\" + parent) +
                    "\\" + (tag.Length != 0 ? tag : lastModified + "_" + fileSize);

        
        bool reset = (pVal64("rst") == 1);

        if (Directory.Exists(ret) && reset && pVal("idx") == "-1")
        {
            // on initial send, check if reset flag then delete existing file if true
            try
            {
                String targetFile = (pVal("tfn") != "" ? pVal("tfn") : pVal("fn"));

                String raw = ret + "\\" + STR_RAW_FILE;
                String mft = ret + "\\" + STR_MANIFEST_FILE;
                String target = ret + "\\" + targetFile;

                if (File.Exists(raw)) File.Delete(raw);
                if (File.Exists(mft)) File.Delete(mft);
                if (File.Exists(target)) File.Delete(target);

            }
            catch (Exception e)
            {
                ret = errJSONString(e, "getFileFolder");
            }

        }

        return ret;
    }

    private Int64 pVal64(String pName)
    {
        return Convert.ToInt64(nvl(Context.Request.QueryString[pName], "0"));
    }

    private String pVal(String pName)
    {
        if (!Context.Request.QueryString.AllKeys.Contains(pName))
        {
            return "";
        }
        else
        {
            return nvl(Context.Request.QueryString[pName], "");
        }
    }

    private dynamic nvl(object orig, object nullVal)
    {
        if(orig != null)
        {
            return orig;
        }else
        {
            return nullVal;
        }
    }

    [WebMethod]
    public string HelloWorld()
    {
        string cnTpl = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source={0}\\VideoLibrary.mdb;Persist Security Info=True;";
        string libraryPath = System.Configuration.ConfigurationManager.AppSettings["VIDEO_LIBRARY_DATA_PATH"];

        return "{\"Connection\":" + cnTpl + ", \"prompt\":Hello World, \"libraryPath\":" + libraryPath +
            ", \"MapPath\":" + String.Format(cnTpl, Context.Server.MapPath(libraryPath)) + "}";
    }



}

public class ProcessResult
{
    public ProcessResult()
    {
        action = "";
        errMessage = "";
        isFileExisting = false;
        isUploadComplete = false;
        currentBlobIndex = -1;
        nextBlobIndex = -1;
        mainFile = false;
        returnJSON = "{}";
        remotePath = "";
        tag = "";
        finalTag = "";
        fileName = "";
        sourceFileName = "";
        userId = "";
        duration = "";
    }

    public String action { set; get; }
    public String errMessage { set; get; }
    public Boolean isFileExisting { set; get; }
    public Boolean isUploadComplete { set; get; }
    public String originalFileName { set; get; }
    public String fileName { set; get; }
    public String sourceFileName { set; get; }
    
    public Int64 fileSize { set; get; }
    public Int64 blobCount { set; get; }
    public Int64 currentBlobIndex { set; get; }
    public Int64 nextBlobIndex { set; get; }
    public Int64 firstBlobSize { set; get; }
    public Int64 lastBlobSize { set; get; }

    public String tag { set; get; }
    public String finalTag { set; get; }
    public bool mainFile { set; get; }
    public String userId { set; get; }

    public String duration { set; get; }

    public String remotePath { set; get; }
    public String returnJSON { set; get; }

}


public static class APP_GLOBAL
{
    public static string VIDEO_LIBRARY_DATA_PATH;
}

