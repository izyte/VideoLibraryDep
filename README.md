# VideoLibraryDep
Video Library deployment package

## Setup Instructions

- Download deployment package
<img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/download_package.png" />

- Extract files from the zip package into the target application folder
<img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/extract_files_to_app_folder_hl.png" />

- Create Video Library application pool and Enable32-bit application from the Advanced Settings
<div>
<img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/create_videolib_pool.png" /><br/>
  <img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/create_videolib_pool_Enable32-bit.png" />
  </div>


- Create FileUpload application pool and Enable32-bit application from the Advanced Settings
<div>
<img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/create_fileupload_pool.png" /><br/>
  <img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/create_fileupload_pool_Enable32-bit.png" />
  </div>


- Create Video Library application and associate the Video Library application pool
<img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/create_videolib_app.png" />

- Expand Video Library application branch. Convert FileUpload folder to application and associate the application pool created earlier.
<div>
<img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/convert_fileupload_folder_to_application.png" />
<img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/convert_fileupload_folder_to_application_set_pool.png" />
</div>


- Expand the FileUpload application branch and create a virtual folder pointing to the absolute path of the Video Library application.
<div>
<img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/create_library_virtual_folder.png" />
<img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/create_library_virtual_folder_path.png" />
</div>

- Extract video upload tool zip package (located in the Tools folder) into a prefered location.
<img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/extract_video_upload_tools.png" />


- Configure upload tool by editing VideoUploadTool.Config.json. Set the desired ```output_path```, ```archive_path``` and the receiving FileUpload url (```upload_url```).
<img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/video_upload_tool_config.png" />

- Set IIS_IUSRS security access to ```<app_root>/App_Data``` and ```<app_root>/Videos``` folders.
<div>
  <h5>App_Data Folder</h5>
<img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/security_app_data_folder.png" />
  <h5>Videos Folder</h5>
  <img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/security_videos_folder.png" />
</div>
  <br/>
  <br/>

- Test Video Library preferably using Google Chrome browser using the default credentials ``` user: admin, password: admin ```
<div>
<img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/test_run.png" style="border: solid 1px blue;"/>
  <img src="https://github.com/izyte/GitAssets/blob/master/VideoLibrary/test_run_default_credentials.png" style="border: solid 1px blue;"/>
  </div>
