@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper Executable Windows Batch File (Zero-Dependency Edition)
@REM ----------------------------------------------------------------------------
@echo off
setlocal

set "MAVEN_PROJECTBASEDIR=%~dp0"
set "MVN_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6"
set "MVN_BIN=%MVN_DIR%\apache-maven-3.9.6\bin\mvn.cmd"

if exist "%MVN_BIN%" (
    call "%MVN_BIN%" %*
    exit /b %ERRORLEVEL%
)

echo [INFO] Downloading Apache Maven 3.9.6 binary...
if not exist "%USERPROFILE%\.m2\wrapper\dists" mkdir "%USERPROFILE%\.m2\wrapper\dists"
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip' -OutFile '%USERPROFILE%\.m2\wrapper\dists\maven.zip'; Expand-Archive -Path '%USERPROFILE%\.m2\wrapper\dists\maven.zip' -DestinationPath '%MVN_DIR%' -Force; Remove-Item '%USERPROFILE%\.m2\wrapper\dists\maven.zip'"

if exist "%MVN_BIN%" (
    call "%MVN_BIN%" %*
    exit /b %ERRORLEVEL%
) else (
    echo [ERROR] Failed to extract Maven. Please check your internet connection or install Maven manually.
    exit /b 1
)
