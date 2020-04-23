@echo off
rem
rem edited 2019/06/28 08:43 - change encoding method to cut original then encoding 
rem instead of making use of the main source to generate segment of encoded videos
rem

goto continue_process

echo Intentional Pause for Debugging purpose
pause

:continue_process


setlocal EnableDelayedExpansion

rem **********************************************************************************************************************
rem Syntax:
rem
set syntax=ffmpegencsegment.bat [source video] [output folder] [video duration hh:mm:ss] [number of parts]
rem ex. ffmpegencsegment.bat "d:\VideoSource\asset01\raw.MTS" "d:\VideoOutput\20190208112432494_3766737732" 00:29:03 15
rem
rem ********************************************************************************************************************** 
cls
if %1=="" (
   echo.
   echo Syntax: !syntax!
   echo.
   echo Example: ffmpegencsegment.bat "d:\VideoSource\asset01\raw8.mts" "d:\VideoOutput\20190403141457561_142036820" 00:01:03 5
   echo.
   echo.
   goto exit
)
rem set tpath=d:\Users\alv\Documents\Data\soga\VideoLibraryClient\VideoLibraryClient\VideoLibraryClient\bin\Debug\ffmpeg.exe
set tpath=ffmpeg.exe
set fld=%2
set outFolder=%fld:"=%
set output=
set input=%1
set inputclean=%input:"=%
set dur=00:00:05
set vdur=%3
set /a parts=%4

rem check if source video is existing, exit when not evaialble
if NOT EXIST !input! GOTO exit


FOR %%i IN (!input!) DO (
set filedrive=%%~di
set filepath=%%~pi
set filename=%%~ni
set fileextension=%%~xi
)
set origsegment="!outFolder!\segment!fileextension!"
echo !filedrive!
echo !filepath!
echo !filename!
echo !fileextension!
echo !origsegment!
echo input !inputclean!

set tmbsize=150x88
set tpostsize=150x88
set spostsize=320x240
set vpostsize=640x360

echo Video Duration !vdur!
set vh=!vdur:~0,2!
set vm=!vdur:~3,2!
set vs=!vdur:~6,2!
set /a dursec=vh*60*60+vm*60+vs
set /a tmbsec=!dursec!/25

rem if duration is not specified, the duration is assumed to be 25secs
if "!tmbsec!"=="0" set /a tmbsec=1

echo !vh! !vm! !vs! = !dursec!
set /a intdur=!dursec!/parts
set /a ubound=!parts!-1
echo.
echo ubound:!ubound! !parts!
set /a h=0
set /a m=0
set /a s=0
set /a st=0
set /a diff=0
set idx=
set hh=
set mm=
set ss=
set ssp=00:00:00
set durTime=

set stopinfo="!outFolder!\stop.info"
set stoppedinfo="!outFolder!\stopped.info"
set stageinfo="!outFolder!\stage.info"
set finallog="!outFolder!\video.stat"
set finalvideo="!outFolder!\video.mp4"
set finalvideoinfo="!outFolder!\video.inf"
set filesinfo="!outFolder!\fileslist.info"
set stage=INITIALIZED

del !stageinfo!

if NOT EXIST !stageinfo! (
	echo !stage!>!stageinfo!
) else (
	set /p stage=<!stageinfo!
)

if !stage!==COMPLETE (
echo.
echo Video processing is complete...
echo.
goto exit
)

if EXIST !filesinfo! del !filesinfo!

if !stage! NEQ INITIALIZED goto afterEncoding


set /a dh=!intdur!/60/60
set /a diff=!intdur!-!dh!*60*60
set /a dm=!diff!/60
set /a diff=!diff!-!dm!*60
set /a ds=!diff!

if !dh! LEQ 9 ( 
   set hh=0!dh!
) else (
   set hh=!dh!
)
if !dm! LEQ 9 ( 
   set mm=0!dm!
) else (
   set mm=!dm!
)
if !ds! LEQ 9 ( 
   set ss=0!ds!
) else (
   set ss=!ds!
)
set durTime=!hh!:!mm!:!ss!

echo.
echo ****************  Generate encoded segment  ***************************
echo.
for /l %%k in (0,1,!ubound!) do (

  if exist !stopinfo! goto stopped

  set /a st=%%k*!intdur!
  set /a h=!st!/60/60
  set /a diff=!st!-!h!*60*60
  set /a m=!diff!/60
  set /a diff=!diff!-!m!*60
  set /a s=!diff!

  if !h! LEQ 9 ( 
     set hh=0!h!
  ) else (
     set hh=!h!
  )
  if !m! LEQ 9 ( 
     set mm=0!m!
  ) else (
     set mm=!m!
  )
  if !s! LEQ 9 ( 
     set ss=0!s!
  ) else (
     set ss=!s!
  )

  set ssp=!hh!:!mm!:!ss!

  if %%k LEQ 9 (
    set idx=000%%k
  ) else (
    if %%k LEQ 99 (
      set idx=00%%k
    ) else (
      if %%k LEQ 999 (
        set idx=0%%k
      ) else (
        set idx=%%k
      )
    )
  )
  rem   echo !idx! !st! !ssp!
  set output="!outFolder!\out!idx!.mp4"
  set outputlist='!outFolder!\out!idx!.mp4'
  set log="!outFolder!\out!idx!.stat"
  set info="!outFolder!\out!idx!.inf"

  echo file !outputlist! >> !filesinfo!
  
  if NOT EXIST !input! GOTO noinput
  
  if NOT EXIST !output! (
     echo Processing !output!. Please wait...

     if %%k==!ubound! (
       ffmpeg  -i !input! -ss !ssp! -b:v 1200k -bufsize 1200k -r 25 !output! 1> !log! 2>&1
       if '%ERRORLEVEL%'=='1' GOTO terminated
       
     ) else (
       ffmpeg  -i !input! -ss !ssp! -t !durTime! -b:v 1200k -bufsize 1200k -r 25 !output! 1> !log! 2>&1
       if '%ERRORLEVEL%'=='1' GOTO terminated
     )

     timeout /t 5

     rem check if input still exist before creating info file, otherwise, terminate the process
     if NOT EXIST !input! GOTO noinput
     call ffmpeggetinfo.bat !output! !info!

     if EXIST !origsegment! del !origsegment!
 ) else (
   echo Skipping !output!.
 )

)
rem end of for each out####



rem Delete temporary video segment after encoding
if EXIST !origsegment! del !origsegment!

echo.
echo ****************  Merge encoded videos  ***************************
echo.

if NOT EXIST !input! GOTO noinput
IF NOT EXIST !finalvideo! ffmpeg -f concat -safe 0 -i !filesinfo! -c copy !finalvideo! 1> !finallog! 2>&1

if NOT EXIST !input! GOTO noinput
call ffmpeggetinfo.bat !finalvideo! !finalvideoinfo!

set stage=ENCODED
echo !stage!>!stageinfo!

:afterEncoding

rem if !stage! NEQ ENCODED goto afterThumb
if !stage! NEQ ENCODED goto terminated

echo.
echo ****************  Generate posters and thumbnails  ***************************
echo.
set tmbTimeFile="!outFolder!\thumbtime.inf"
echo !tmbTimeFile!
set tmbTimeList=
if NOT EXIST !tmbTimeFile! (
   echo Not Existing
   set tmbTimeList=NIL
   goto afterThumb
) else (
   set /p tmbTimeList=<!tmbTimeFile!
)

:generateThumbnail

echo !tmbTimeList!
echo.
set /a counter=1
for %%a in (!tmbTimeList!) do (
	set "list[!counter!]=%%~a"
    	set /a counter=counter+1
)
set thumbTile="!outFolder!\thumbnails.png"
set /a ubound=counter-1

goto skipThumbLoop
for /l %%k in (1,1,!ubound!) do (

    if exist !stopinfo! goto stopped

    if %%k == 1 (
	echo Processing posters. Please wait...
	if not exist "!outFolder!\sposter.png" ffmpeg -i !finalvideo! -s !spostsize! -ss !list[2]! -vframes 1 "!outFolder!\sposter.png"  1> "!outFolder!\sposter.stat" 2>&1
	if not exist "!outFolder!\vpost.png" ffmpeg -i !finalvideo! -s !vpostsize! -ss !list[3]! -vframes 1 "!outFolder!\vpost.png"  1> "!outFolder!\vpost.stat" 2>&1
	if not exist "!outFolder!\tpost.png" ffmpeg -i !finalvideo! -s !tpostsize! -ss !list[4]! -vframes 1 "!outFolder!\tpost.png"  1> "!outFolder!\tpost.stat" 2>&1

	echo.
    )
    
    rem Determin thumbnail output file
    if %%k LSS 10 (
        set outFile="!outFolder!\tmb0%%k.png"
	set log="!outFolder!\tmb0%%k.stat"
    ) else (
        set outFile="!outFolder!\tmb%%k.png"
	set log="!outFolder!\tmb%%k.stat"
    )

    if NOT EXIST !outFile! (
        echo Processing thumb !outFile!. Please wait...
	if EXIST !thumbTile! del !thumbTile!
	ffmpeg -i !finalvideo! -s !tmbsize! -ss !list[%%k]! -vframes 1 !outFile!  1> !log! 2>&1

    ) else (
	echo Skipping !outFile!
    )
)

:skipThumbLoop

set stage=THUMBNAIL
echo !stage!>!stageinfo!

if !stage! NEQ THUMBNAIL goto terminated

if exist !stopinfo! goto stopped

echo.
echo ****************  Generate thumbnails preview tile  ***************************
echo.

set tmbr1="!outFolder!\tmbr1.png"
set tmbr2="!outFolder!\tmbr2.png"
set tmbr3="!outFolder!\tmbr3.png"
set tmbr4="!outFolder!\tmbr4.png"
set tmbr5="!outFolder!\tmbr5.png"


if NOT EXIST !thumbTile! (

    echo Create preview images ...
    if not exist "!outFolder!\sposter.png" ffmpeg -i !finalvideo! -s !spostsize! -ss !list[2]! -vframes 1 "!outFolder!\sposter.png"  1> "!outFolder!\sposter.stat" 2>&1
    if not exist "!outFolder!\vpost.png" ffmpeg -i !finalvideo! -s !vpostsize! -ss !list[3]! -vframes 1 "!outFolder!\vpost.png"  1> "!outFolder!\vpost.stat" 2>&1
    if not exist "!outFolder!\tpost.png" ffmpeg -i !finalvideo! -s !tpostsize! -ss !list[4]! -vframes 1 "!outFolder!\tpost.png"  1> "!outFolder!\tpost.stat" 2>&1

    echo Delete existing thumbnails ...
    del "!outFolder!\tmb??.png"
    set log="!outFolder!\thumbnails.stat"

    echo Generate thumbnails ...
    rem echo ffmpeg -i !finalvideo! -s !tmbsize! -vf fps=1/!tmbsec! "!outFolder!\tmb%%02d.png" -hide_banner
    ffmpeg -i !finalvideo! -s !tmbsize! -vf fps=1/!tmbsec! "!outFolder!\tmb%%02d.png" -hide_banner 1> !log! 2>&1

    if EXIST !tmbr1! del !tmbr1!
    if EXIST !tmbr2! del !tmbr2!
    if EXIST !tmbr3! del !tmbr3!
    if EXIST !tmbr4! del !tmbr4!
    if EXIST !tmbr5! del !tmbr5!

    echo Grid row thumbnails ...
    ffmpeg -i "!outFolder!\tmb01.png" -i "!outFolder!\tmb02.png" -i "!outFolder!\tmb03.png" -i "!outFolder!\tmb04.png" -i "!outFolder!\tmb05.png" -filter_complex hstack=inputs=5 -y "!outFolder!\tmbr1.png"
    ffmpeg -i "!outFolder!\tmb06.png" -i "!outFolder!\tmb07.png" -i "!outFolder!\tmb08.png" -i "!outFolder!\tmb09.png" -i "!outFolder!\tmb10.png" -filter_complex hstack=inputs=5 -y "!outFolder!\tmbr2.png"
    ffmpeg -i "!outFolder!\tmb11.png" -i "!outFolder!\tmb12.png" -i "!outFolder!\tmb13.png" -i "!outFolder!\tmb14.png" -i "!outFolder!\tmb15.png" -filter_complex hstack=inputs=5 -y "!outFolder!\tmbr3.png"
    ffmpeg -i "!outFolder!\tmb16.png" -i "!outFolder!\tmb17.png" -i "!outFolder!\tmb18.png" -i "!outFolder!\tmb19.png" -i "!outFolder!\tmb20.png" -filter_complex hstack=inputs=5 -y "!outFolder!\tmbr4.png"
    ffmpeg -i "!outFolder!\tmb21.png" -i "!outFolder!\tmb22.png" -i "!outFolder!\tmb23.png" -i "!outFolder!\tmb24.png" -i "!outFolder!\tmb25.png" -filter_complex hstack=inputs=5 -y "!outFolder!\tmbr5.png"

    echo Merge Grid  thumbnail rows ...
    ffmpeg -i "!outFolder!\tmbr1.png" -i "!outFolder!\tmbr2.png" -i "!outFolder!\tmbr3.png" -i "!outFolder!\tmbr4.png" -i "!outFolder!\tmbr5.png" -filter_complex vstack=inputs=5 -y !thumbTile!

    echo Delete temporary grid thumbnail rows
    del !tmbr1!
    del !tmbr2!
    del !tmbr3!
    del !tmbr4!
    del !tmbr5!

    del "!outFolder!\tmb??.png"
    del "!outFolder!\tmb???.png"


) else (
    echo.
    echo Skipping preview tile...
)

:afterThumb

set stage=THUMBGRID
echo !stage!>!stageinfo!

:afterThumbGrid

echo COMPLETE>!stageinfo!

goto exit

:noinput
echo.

echo Source pulled out!

echo !output!
echo !log!
echo !info!

if EXIST !output! echo Existing !output!

if EXIST !output! del !output!
if '%ERRORLEVEL%'=='1' echo Error deleting !output!

if EXIST !log! del !log!
if EXIST !info! del !info!

GOTO stopped

:terminated

set stage=TERMINATED
echo !stage!>!stageinfo!
if not exist !stopinfo! echo TERMINATED>!stopinfo!

:stopped
echo.
echo Terminating process...
echo Last completed output is !output!
echo.

if exist !stoppedinfo! del !stoppedinfo!
ren !stopinfo! stopped.info

goto exit

:exit
endlocal