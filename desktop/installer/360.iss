#define AppName "360"
#define AppPublisher "TRIREX"
#define AppVersion "1.0.16"
#define AppExeName "360.exe"
#define ProjectRoot "..\.."
#define PublishDir ProjectRoot + "\desktop\360.WebView2\bin\Release\net9.0-windows\win-x64\publish"
#define AppIcon ProjectRoot + "\desktop\360.WebView2\Resources\360.ico"

[Setup]
AppId={{C58DCC44-6692-40D7-AEA4-ED1D83B67DA0}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={localappdata}\Programs\TRIREX\360
DefaultGroupName=TRIREX
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
OutputDir=output
OutputBaseFilename=360-Setup-{#AppVersion}-win-x64
SetupIconFile={#AppIcon}
UninstallDisplayIcon={app}\{#AppExeName}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
CloseApplications=yes
RestartApplications=no
VersionInfoVersion={#AppVersion}.0
VersionInfoCompany={#AppPublisher}
VersionInfoDescription=360 Desktop Installer
VersionInfoProductName={#AppName}
VersionInfoProductVersion={#AppVersion}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "{#PublishDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\360"; Filename: "{app}\{#AppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\{#AppExeName}"
Name: "{autodesktop}\360"; Filename: "{app}\{#AppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\{#AppExeName}"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; GroupDescription: "Additional shortcuts:"; Flags: checkedonce

[Run]
Filename: "{app}\{#AppExeName}"; Description: "Launch 360"; Flags: nowait postinstall skipifsilent

[Code]
const
  WebView2ClientGuid = '{{F1E7E632-CF0F-4D4D-8A24-95DB6B7C2E5B}';
  WebView2DownloadUrl = 'https://go.microsoft.com/fwlink/p/?LinkId=2124703';

function WebView2IsInstalled: Boolean;
var
  Version: String;
  ClientKey: String;
begin
  ClientKey := 'SOFTWARE\Microsoft\EdgeUpdate\Clients\' + WebView2ClientGuid;
  Result :=
    RegQueryStringValue(HKLM64, ClientKey, 'pv', Version) or
    RegQueryStringValue(HKLM32, ClientKey, 'pv', Version) or
    RegQueryStringValue(HKCU, ClientKey, 'pv', Version);
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ErrorCode: Integer;
begin
  if (CurStep = ssPostInstall) and (not WebView2IsInstalled) then
  begin
    if MsgBox(
      '360 requires Microsoft Edge WebView2 Runtime.' + #13#10 +
      'Open the Microsoft download page now?',
      mbConfirmation,
      MB_YESNO) = IDYES then
    begin
      ShellExec('open', WebView2DownloadUrl, '', '', SW_SHOWNORMAL, ewNoWait, ErrorCode);
    end;
  end;
end;
