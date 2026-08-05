[CmdletBinding()]
param([switch]$SkipKrita)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$artRoot = Join-Path $projectRoot 'art'
$masterPath = Join-Path $artRoot 'masters\pappa_hammer_master_v1.png'
$stagingRoot = Join-Path $artRoot 'working\legendary\stormcaller\staging'
$workingRoot = Join-Path $artRoot 'working\legendary\stormcaller'
$krita = 'C:\Program Files\Krita (x64)\bin\krita.com'

if (-not (Test-Path -LiteralPath $masterPath)) { throw "Missing V1 master: $masterPath" }
if (-not (Test-Path -LiteralPath $krita)) { throw 'Krita is not installed at the official winget location.' }

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$master = [Drawing.Bitmap]::new($masterPath)
try {
    $width = $master.Width
    $height = $master.Height
}
finally { $master.Dispose() }

if ($width -ne 1402 -or $height -ne 1122) { throw "Unexpected V1 master canvas: ${width}x${height}" }

$slots = [ordered]@{
    cape = [ordered]@{ group = '01_Cape'; scale = 0.73; rotation = 0.0; pivotX = 0; pivotY = 0; targetX = 0; targetY = 0; offsetX = 71; offsetY = 145 }
    legs = [ordered]@{
        group = '03_Legs'; scale = 0.86; rotation = 0.0; pivotX = 0; pivotY = 0; targetX = 0; targetY = 0; offsetX = -12; offsetY = 315
        clearRects = @(
            [ordered]@{ x = 0; y = 1032; width = 520; height = 90 },
            [ordered]@{ x = 520; y = 986; width = 882; height = 136 }
        )
    }
    boots = [ordered]@{ group = '04_Boots'; scale = 0.75; rotation = 0.0; pivotX = 0; pivotY = 0; targetX = 0; targetY = 0; offsetX = 70; offsetY = 280 }
    chest = [ordered]@{ group = '05_Chest'; scale = 0.75; rotation = 0.0; pivotX = 0; pivotY = 0; targetX = 0; targetY = 0; offsetX = 107; offsetY = 10 }
    scarf = [ordered]@{ group = '06_Scarf'; scale = 0.45; rotation = 0.0; pivotX = 0; pivotY = 0; targetX = 0; targetY = 0; offsetX = 200; offsetY = 50 }
    hat = [ordered]@{ group = '07_Hat'; scale = 0.58; rotation = 0.0; pivotX = 0; pivotY = 0; targetX = 0; targetY = 0; offsetX = 198; offsetY = 2 }
    weapon = [ordered]@{ group = '08_Weapon'; scale = 0.65; rotation = 38.0; pivotX = 720; pivotY = 600; targetX = 820; targetY = 455; offsetX = 0; offsetY = 0 }
}

function New-AlignedLayer {
    param(
        [Parameter(Mandatory = $true)][string]$InputPath,
        [Parameter(Mandatory = $true)][string]$OutputPath,
        [Parameter(Mandatory = $true)][System.Collections.IDictionary]$Transform
    )

    $source = [Drawing.Bitmap]::new($InputPath)
    $output = [Drawing.Bitmap]::new($width, $height, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        $graphics = [Drawing.Graphics]::FromImage($output)
        try {
            $graphics.Clear([Drawing.Color]::Transparent)
            $graphics.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceOver
            $graphics.CompositingQuality = [Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::HighQuality

            if ([Math]::Abs([double]$Transform.rotation) -gt 0.001) {
                $graphics.TranslateTransform([single]$Transform.targetX, [single]$Transform.targetY)
                $graphics.RotateTransform([single]$Transform.rotation)
                $graphics.ScaleTransform([single]$Transform.scale, [single]$Transform.scale)
                $graphics.TranslateTransform([single](-$Transform.pivotX), [single](-$Transform.pivotY))
                $graphics.DrawImage($source, 0, 0, $source.Width, $source.Height)
            }
            else {
                $destination = [Drawing.RectangleF]::new(
                    [single]$Transform.offsetX,
                    [single]$Transform.offsetY,
                    [single]($source.Width * $Transform.scale),
                    [single]($source.Height * $Transform.scale)
                )
                $graphics.DrawImage($source, $destination)
            }

            # The concept trousers include display-only lower-leg fabric. Clear it
            # on the aligned production layer so the dedicated boots remain the
            # sole visual source below the ankle.
            if ($Transform.Contains('clearRects')) {
                $graphics.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceCopy
                $clearBrush = [Drawing.SolidBrush]::new([Drawing.Color]::Transparent)
                try {
                    foreach ($rect in $Transform.clearRects) {
                        $graphics.FillRectangle(
                            $clearBrush,
                            [single]$rect.x,
                            [single]$rect.y,
                            [single]$rect.width,
                            [single]$rect.height
                        )
                    }
                }
                finally { $clearBrush.Dispose() }
            }
        }
        finally { $graphics.Dispose() }
        $output.Save($OutputPath, [Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
        $source.Dispose()
        $output.Dispose()
    }
}

function New-StormcallerOra {
    param(
        [Parameter(Mandatory = $true)][string]$OutputOra,
        [Parameter(Mandatory = $true)][hashtable]$LayerPaths
    )

    $temp = Join-Path $env:TEMP ('risk-loot-stormcaller-ora-' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path (Join-Path $temp 'data'), (Join-Path $temp 'Thumbnails') -Force | Out-Null
    try {
        [IO.File]::WriteAllText((Join-Path $temp 'mimetype'), 'image/openraster', [Text.Encoding]::ASCII)
        Copy-Item -LiteralPath $masterPath -Destination (Join-Path $temp 'data\master.png')
        foreach ($slot in $LayerPaths.Keys) {
            Copy-Item -LiteralPath $LayerPaths[$slot] -Destination (Join-Path $temp "data\$slot.png")
        }
        Copy-Item -LiteralPath $masterPath -Destination (Join-Path $temp 'mergedimage.png')
        Copy-Item -LiteralPath $masterPath -Destination (Join-Path $temp 'Thumbnails\thumbnail.png')

        $stackXml = @"
<?xml version="1.0" encoding="UTF-8"?>
<image version="0.0.1" w="$width" h="$height" name="Stormcaller Proof Set">
  <stack name="root">
    <stack name="09_Effects" visibility="visible" />
    <stack name="08_Weapon" visibility="visible"><layer name="legendary_stormcaller_weapon_01" src="data/weapon.png" visibility="visible" /></stack>
    <stack name="07_Hat" visibility="visible"><layer name="legendary_stormcaller_hat_01" src="data/hat.png" visibility="visible" /></stack>
    <stack name="06_Scarf" visibility="visible"><layer name="legendary_stormcaller_scarf_01" src="data/scarf.png" visibility="visible" /></stack>
    <stack name="05_Chest" visibility="visible"><layer name="legendary_stormcaller_chest_01" src="data/chest.png" visibility="visible" /></stack>
    <stack name="04_Boots" visibility="visible"><layer name="legendary_stormcaller_boots_01" src="data/boots.png" visibility="visible" /></stack>
    <stack name="03_Legs" visibility="visible"><layer name="legendary_stormcaller_legs_01" src="data/legs.png" visibility="visible" /></stack>
    <stack name="02_Base_Body_REFERENCE_LOCKED" visibility="visible" edit-locked="true"><layer name="Pappa Hammer V1 Master - ALIGNMENT ONLY - DO NOT EXPORT" src="data/master.png" visibility="visible" edit-locked="true" /></stack>
    <stack name="01_Cape" visibility="visible"><layer name="legendary_stormcaller_cape_01" src="data/cape.png" visibility="visible" /></stack>
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

New-Item -ItemType Directory -Path $workingRoot -Force | Out-Null
$alignedRoot = Join-Path $workingRoot 'aligned'
New-Item -ItemType Directory -Path $alignedRoot -Force | Out-Null
$layerPaths = @{}
foreach ($slot in $slots.Keys) {
    $input = Join-Path $stagingRoot "stormcaller_${slot}_clean.png"
    if (-not (Test-Path -LiteralPath $input)) { throw "Missing cleaned Stormcaller layer: $input" }
    $output = Join-Path $alignedRoot "stormcaller_${slot}_aligned.png"
    New-AlignedLayer -InputPath $input -OutputPath $output -Transform $slots[$slot]
    $layerPaths[$slot] = $output
}

$ora = Join-Path $workingRoot 'legendary_stormcaller_set_01.ora'
$kra = Join-Path $workingRoot 'legendary_stormcaller_set_01.kra'
$preview = Join-Path $workingRoot 'legendary_stormcaller_set_01_preview.png'
New-StormcallerOra -OutputOra $ora -LayerPaths $layerPaths
if (-not $SkipKrita) {
    if (Test-Path -LiteralPath $kra) { Remove-Item -LiteralPath $kra -Force }
    & $krita --export --export-filename $kra $ora
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $kra)) { throw 'Krita failed to build the Stormcaller working file.' }
}

$previewBitmap = [Drawing.Bitmap]::new($width, $height, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
$previewGraphics = [Drawing.Graphics]::FromImage($previewBitmap)
try {
    $previewGraphics.Clear([Drawing.Color]::Transparent)
    foreach ($path in @($layerPaths.cape, $masterPath, $layerPaths.legs, $layerPaths.boots, $layerPaths.chest, $layerPaths.scarf, $layerPaths.hat, $layerPaths.weapon)) {
        $image = [Drawing.Image]::FromFile($path)
        try { $previewGraphics.DrawImage($image, 0, 0, $width, $height) }
        finally { $image.Dispose() }
    }
}
finally { $previewGraphics.Dispose() }
try { $previewBitmap.Save($preview, [Drawing.Imaging.ImageFormat]::Png) }
finally { $previewBitmap.Dispose() }

$report = [ordered]@{
    master = 'art/masters/pappa_hammer_master_v1.png'
    canvas = @($width, $height)
    workingFile = if ($SkipKrita) { 'art/working/legendary/stormcaller/legendary_stormcaller_set_01.ora' } else { 'art/working/legendary/stormcaller/legendary_stormcaller_set_01.kra' }
    preview = 'art/working/legendary/stormcaller/legendary_stormcaller_set_01_preview.png'
    transforms = $slots
}
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $workingRoot 'stormcaller_proof_manifest.json') -Encoding utf8

if ($SkipKrita) { Write-Host "Created $ora (Krita-compatible OpenRaster source)" }
else { Write-Host "Created $kra" }
Write-Host "Created $preview"
