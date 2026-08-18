$ErrorActionPreference = "Stop"

$installerDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = Resolve-Path (Join-Path $installerDirectory "..\..")
$projectPath = Join-Path $repositoryRoot "desktop\360.WebView2\360.WebView2.csproj"
$iconScript = Join-Path $installerDirectory "create-icon.mjs"
$innoCandidates = @(
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
    "C:\Program Files\Inno Setup 6\ISCC.exe",
    (Join-Path $env:LOCALAPPDATA "Programs\Inno Setup 6\ISCC.exe")
)

$innoCompiler = $innoCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $innoCompiler) {
    throw "Inno Setup 6 was not found. Install it with: winget install JRSoftware.InnoSetup"
}

Push-Location $repositoryRoot
try {
    node $iconScript
    dotnet publish $projectPath -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
    & $innoCompiler (Join-Path $installerDirectory "360.iss")
}
finally {
    Pop-Location
}

$setupPath = Join-Path $installerDirectory "output\360-Setup-1.0.10-win-x64.exe"
Write-Host "Installer created: $setupPath"
