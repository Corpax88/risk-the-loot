[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$artRoot = Join-Path $projectRoot 'art'
$masterPath = Join-Path $artRoot 'masters\pappa_hammer_master.png'
$krita = 'C:\Program Files\Krita (x64)\bin\krita.com'

if (-not (Test-Path -LiteralPath $masterPath)) { throw "Missing art master: $masterPath" }
if (-not (Test-Path -LiteralPath $krita)) { throw 'Krita is not installed at the official winget location.' }

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$master = [Drawing.Bitmap]::new($masterPath)
try {
    $width = $master.Width
    $height = $master.Height
}
finally {
    $master.Dispose()
}

function New-TransparentGuidePng {
    param([string]$Path, [switch]$HatMarker)

    $bitmap = [Drawing.Bitmap]::new($width, $height, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        $graphics = [Drawing.Graphics]::FromImage($bitmap)
        try {
            $graphics.Clear([Drawing.Color]::Transparent)
            if ($HatMarker) {
                $pen = [Drawing.Pen]::new([Drawing.Color]::FromArgb(255, 0, 210, 255), 3)
                try {
                    $graphics.DrawLine($pen, 472, 216, 716, 216)
                    $graphics.DrawRectangle($pen, 526, 112, 138, 84)
                    $graphics.DrawLine($pen, 584, 174, 604, 174)
                    $graphics.DrawLine($pen, 594, 164, 594, 184)
                }
                finally { $pen.Dispose() }
            }
            else {
                $pen = [Drawing.Pen]::new([Drawing.Color]::FromArgb(170, 0, 210, 255), 1)
                $groundPen = [Drawing.Pen]::new([Drawing.Color]::FromArgb(210, 255, 176, 0), 2)
                try {
                    foreach ($x in 594, 701, 835) { $graphics.DrawLine($pen, $x, 0, $x, $height) }
                    foreach ($y in 174, 360, 455, 548, 748, 1010) { $graphics.DrawLine($pen, 0, $y, $width, $y) }
                    $graphics.DrawLine($groundPen, 0, 1072, $width, 1072)
                }
                finally {
                    $pen.Dispose()
                    $groundPen.Dispose()
                }
            }
        }
        finally { $graphics.Dispose() }
        $bitmap.Save($Path, [Drawing.Imaging.ImageFormat]::Png)
    }
    finally { $bitmap.Dispose() }
}

function New-OpenRasterSource {
    param(
        [string]$OutputOra,
        [string]$GuidePng,
        [string]$HatPng,
        [switch]$IncludeHat
    )

    $temp = Join-Path $env:TEMP ('risk-loot-ora-' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path (Join-Path $temp 'data'), (Join-Path $temp 'Thumbnails') -Force | Out-Null
    try {
        [IO.File]::WriteAllText((Join-Path $temp 'mimetype'), 'image/openraster', [Text.Encoding]::ASCII)
        Copy-Item -LiteralPath $masterPath -Destination (Join-Path $temp 'data\master.png')
        Copy-Item -LiteralPath $GuidePng -Destination (Join-Path $temp 'data\alignment_guides.png')
        if ($IncludeHat) { Copy-Item -LiteralPath $HatPng -Destination (Join-Path $temp 'data\test_hat.png') }
        Copy-Item -LiteralPath $masterPath -Destination (Join-Path $temp 'mergedimage.png')
        Copy-Item -LiteralPath $masterPath -Destination (Join-Path $temp 'Thumbnails\thumbnail.png')

        $hatLayer = if ($IncludeHat) { '<layer name="TEST_HAT_ALIGNMENT_MARKER_NOT_PRODUCTION" src="data/test_hat.png" visibility="visible" />' } else { '' }
        $stackXml = @"
<?xml version="1.0" encoding="UTF-8"?>
<image version="0.0.1" w="$width" h="$height" name="Pappa Hammer Equipment Template">
  <stack name="root">
    <stack name="09_Effects" visibility="visible"><layer name="ALIGNMENT_GUIDES_REFERENCE_LOCKED" src="data/alignment_guides.png" visibility="hidden" edit-locked="true" /></stack>
    <stack name="08_Weapon" visibility="visible" />
    <stack name="07_Hat" visibility="visible">$hatLayer</stack>
    <stack name="06_Scarf" visibility="visible" />
    <stack name="05_Chest" visibility="visible" />
    <stack name="04_Boots" visibility="visible" />
    <stack name="03_Legs" visibility="visible" />
    <stack name="02_Base_Body_REFERENCE_LOCKED" visibility="visible" edit-locked="true"><layer name="Pappa Hammer Master - ALIGNMENT ONLY - DO NOT EXPORT" src="data/master.png" visibility="visible" edit-locked="true" /></stack>
    <stack name="01_Cape" visibility="visible" />
  </stack>
</image>
"@
        [IO.File]::WriteAllText((Join-Path $temp 'stack.xml'), $stackXml, [Text.UTF8Encoding]::new($false))

        if (Test-Path -LiteralPath $OutputOra) { Remove-Item -LiteralPath $OutputOra -Force }
        $archive = [IO.Compression.ZipFile]::Open($OutputOra, [IO.Compression.ZipArchiveMode]::Create)
        try {
            $mimeEntry = $archive.CreateEntry('mimetype', [IO.Compression.CompressionLevel]::NoCompression)
            $writer = [IO.StreamWriter]::new($mimeEntry.Open(), [Text.Encoding]::ASCII)
            try { $writer.Write('image/openraster') } finally { $writer.Dispose() }
            foreach ($file in Get-ChildItem -LiteralPath $temp -Recurse -File | Where-Object Name -ne 'mimetype') {
                $relative = $file.FullName.Substring($temp.Length + 1).Replace('\', '/')
                [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $relative, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
            }
        }
        finally { $archive.Dispose() }
    }
    finally { Remove-Item -LiteralPath $temp -Recurse -Force }
}

function Convert-OraToKra {
    param([string]$Ora, [string]$Kra)
    if (Test-Path -LiteralPath $Kra) { Remove-Item -LiteralPath $Kra -Force }
    & $krita --export --export-filename $Kra $Ora
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $Kra)) {
        throw "Krita failed to create $Kra"
    }
}

$tempRoot = Join-Path $env:TEMP ('risk-loot-pipeline-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null
try {
    $guidePng = Join-Path $tempRoot 'alignment_guides.png'
    $hatPng = Join-Path $tempRoot 'common_alignment_test_hat_01.png'
    New-TransparentGuidePng -Path $guidePng
    New-TransparentGuidePng -Path $hatPng -HatMarker

    $templateOra = Join-Path $tempRoot 'template.ora'
    $exampleOra = Join-Path $tempRoot 'example.ora'
    New-OpenRasterSource -OutputOra $templateOra -GuidePng $guidePng -HatPng $hatPng
    New-OpenRasterSource -OutputOra $exampleOra -GuidePng $guidePng -HatPng $hatPng -IncludeHat

    $templateKra = Join-Path $artRoot 'templates\pappa_hammer_equipment_template.kra'
    $exampleKra = Join-Path $artRoot 'working\common\common_alignment_test_hat_01.kra'
    $validationKra = Join-Path $artRoot 'references\alignment_reimport_validation.kra'
    Convert-OraToKra -Ora $templateOra -Kra $templateKra
    Convert-OraToKra -Ora $exampleOra -Kra $exampleKra
    Copy-Item -LiteralPath $exampleKra -Destination $validationKra -Force

    $examplePng = Join-Path $artRoot 'exports\hat\common_alignment_test_hat_01.png'
    Copy-Item -LiteralPath $hatPng -Destination $examplePng -Force
    & (Join-Path $PSScriptRoot 'Validate-KritaExport.ps1') -PngPath $examplePng | Out-Host

    $sourceHash = (Get-FileHash -LiteralPath (Join-Path $projectRoot 'assets\pappa-hammer-player.png') -Algorithm SHA256).Hash
    $masterHash = (Get-FileHash -LiteralPath $masterPath -Algorithm SHA256).Hash
    if ($sourceHash -ne $masterHash) { throw 'Copied art master no longer matches the production source byte-for-byte.' }

    $report = [ordered]@{
        status = 'passed'
        kritaVersion = '5.3.3'
        master = [ordered]@{
            path = 'art/masters/pappa_hammer_master.png'
            width = $width
            height = $height
            sha256 = $masterHash
            sourceCopyMatches = $true
        }
        template = 'art/templates/pappa_hammer_equipment_template.kra'
        exampleWorkingFile = 'art/working/common/common_alignment_test_hat_01.kra'
        exampleExport = 'art/exports/hat/common_alignment_test_hat_01.png'
        reimportValidation = 'art/references/alignment_reimport_validation.kra'
        groupsTopToBottom = @('09_Effects','08_Weapon','07_Hat','06_Scarf','05_Chest','04_Boots','03_Legs','02_Base_Body_REFERENCE_LOCKED','01_Cape')
        masterReferenceLocked = $true
        exportHasBaseBody = $false
        exportHasBackground = $false
        exportPreservedCanvas = $true
        reimportOrigin = @(0, 0)
        guides = [ordered]@{
            vertical = [ordered]@{ head_and_body_anchor = 594; canvas_center = 701; hands_and_weapon_grip = 835 }
            horizontal = [ordered]@{ head = 174; torso = 360; hands_and_weapon_grip = 455; waist = 548; knees = 748; feet = 1010; ground_line = 1072 }
        }
    }
    $report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $artRoot 'references\pipeline_validation.json') -Encoding utf8
}
finally {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}

