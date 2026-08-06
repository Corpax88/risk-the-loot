param(
    [switch]$Publish
)

$ErrorActionPreference = 'Stop'

$project = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$krita = 'C:\Program Files\Krita (x64)\bin\krita.exe'
$master = Join-Path $project 'art\masters\pappa_hammer_master_v1.png'
$runtime = Join-Path $project 'assets\equipment\stormcaller'
$aligned = Join-Path $project 'art\working\legendary\stormcaller\aligned'
$working = Join-Path $env:TEMP 'risk-the-loot-stormcaller-krita-fit'

if (-not (Test-Path -LiteralPath $krita)) {
    throw "Official Krita installation not found: $krita"
}

New-Item -ItemType Directory -Path $working -Force | Out-Null

$slots = [ordered]@{
    cape   = @{ scale = 1.00; pivotX = 540; pivotY = 430; dx = -3; dy =  4; mask = $null }
    legs   = @{ scale = 1.00; pivotX = 555; pivotY = 700; dx =  0; dy =  2; mask = $null }
    boots  = @{ scale = 1.00; pivotX = 550; pivotY = 900; dx =  0; dy =  3; mask = $null }
    chest  = @{ scale = 1.08; pivotX = 610; pivotY = 390; dx =  6; dy =  5; mask = @('566,178 680,171 704,215 686,268 650,293 604,290 565,260 548,218','746,412 786,399 838,411 891,434 908,460 901,491 870,514 815,508 768,488 745,458') }
    scarf  = @{ scale = 0.90; pivotX = 590; pivotY = 275; dx =  4; dy =  8; mask = '554,132 724,130 746,194 729,244 691,279 626,282 578,246 552,190' }
    hat    = @{ scale = 0.82; pivotX = 590; pivotY = 155; dx =  2; dy = -7; mask = $null }
    weapon = @{ scale = 0.90; pivotX = 820; pivotY = 450; dx =  0; dy =  0; mask = '746,412 786,399 838,411 891,434 908,460 901,491 870,514 815,508 768,488 745,458' }
}

function Get-PngDataUri([string]$Path) {
    $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $Path).Path)
    return 'data:image/png;base64,' + [Convert]::ToBase64String($bytes)
}

function Invoke-KritaExport([string]$Source, [string]$Destination) {
    if (Test-Path -LiteralPath $Destination) {
        Remove-Item -LiteralPath $Destination -Force
    }
    & $krita --nosplash --export --export-filename $Destination $Source | Out-Null
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0 -or -not (Test-Path -LiteralPath $Destination)) {
        throw "Krita export failed for $Source (exit $exitCode)."
    }
}

foreach ($slot in $slots.Keys) {
    $source = Join-Path $aligned "stormcaller_${slot}_aligned.png"
    $sourceUri = Get-PngDataUri $source
    $maskMarkup = ''
    $imageMask = ''
    $polygons = @($slots[$slot].mask) | Where-Object { $_ }
    if ($polygons.Count -gt 0) {
        $blackShapes = ($polygons | ForEach-Object { "<polygon points=`"$_`" fill=`"black`"/>" }) -join "`n"
        $maskMarkup = @"
  <defs>
    <mask id="fit-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1402" height="1122">
      <rect width="1402" height="1122" fill="white"/>
      $blackShapes
    </mask>
  </defs>
"@
        $imageMask = ' mask="url(#fit-mask)"'
    }

    $scale = [double]$slots[$slot].scale
    $x = [double]$slots[$slot].pivotX + [double]$slots[$slot].dx - ([double]$slots[$slot].pivotX * $scale)
    $y = [double]$slots[$slot].pivotY + [double]$slots[$slot].dy - ([double]$slots[$slot].pivotY * $scale)
    $width = 1402 * $scale
    $height = 1122 * $scale
    $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1402" height="1122" viewBox="0 0 1402 1122">
$maskMarkup
  <image x="$x" y="$y" width="$width" height="$height" preserveAspectRatio="none" href="$sourceUri" xlink:href="$sourceUri"$imageMask/>
</svg>
"@
    $svgPath = Join-Path $working "legendary_stormcaller_${slot}_01_fit.svg"
    $pngPath = Join-Path $working "legendary_stormcaller_${slot}_01.png"
    [System.IO.File]::WriteAllText($svgPath, $svg, [System.Text.UTF8Encoding]::new($false))
    Invoke-KritaExport $svgPath $pngPath
}

$masterUri = Get-PngDataUri $master
$layerOrder = @('cape', 'legs', 'boots', 'chest', 'scarf', 'hat', 'weapon')
$images = foreach ($slot in $layerOrder) {
    $uri = Get-PngDataUri (Join-Path $working "legendary_stormcaller_${slot}_01.png")
    "  <image x=`"0`" y=`"0`" width=`"1402`" height=`"1122`" href=`"$uri`" xlink:href=`"$uri`"/>"
}
$previewSvg = @"
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1402" height="1122" viewBox="0 0 1402 1122">
  $($images[0])
  <image x="0" y="0" width="1402" height="1122" href="$masterUri" xlink:href="$masterUri"/>
$($images[1..($images.Count - 1)] -join "`n")
</svg>
"@
$previewSvgPath = Join-Path $working 'legendary_stormcaller_set_01_fit_preview.svg'
$previewPngPath = Join-Path $working 'legendary_stormcaller_set_01_fit_preview.png'
[System.IO.File]::WriteAllText($previewSvgPath, $previewSvg, [System.Text.UTF8Encoding]::new($false))
Invoke-KritaExport $previewSvgPath $previewPngPath

if ($Publish) {
    foreach ($slot in $slots.Keys) {
        $fitted = Join-Path $working "legendary_stormcaller_${slot}_01.png"
        Copy-Item -LiteralPath $fitted -Destination (Join-Path $runtime "legendary_stormcaller_${slot}_01.png") -Force
        Copy-Item -LiteralPath $fitted -Destination (Join-Path $project "art\exports\$slot\legendary_stormcaller_${slot}_01.png") -Force
    }
    Copy-Item -LiteralPath $previewPngPath -Destination (Join-Path $project 'art\working\legendary\stormcaller\legendary_stormcaller_set_01_preview.png') -Force
}

Write-Output $previewPngPath
