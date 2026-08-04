[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$PngPath,

    [int]$ExpectedWidth = 1402,
    [int]$ExpectedHeight = 1122
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$resolved = (Resolve-Path -LiteralPath $PngPath).Path
$bitmap = [Drawing.Bitmap]::new($resolved)
try {
    if ($bitmap.Width -ne $ExpectedWidth -or $bitmap.Height -ne $ExpectedHeight) {
        throw "Canvas is $($bitmap.Width)x$($bitmap.Height), expected ${ExpectedWidth}x${ExpectedHeight}."
    }
    if (-not [Drawing.Image]::IsAlphaPixelFormat($bitmap.PixelFormat)) {
        throw "Export is not an alpha-capable RGBA PNG: $($bitmap.PixelFormat)"
    }

    $hasTransparentPixel = $false
    $hasVisiblePixel = $false
    for ($y = 0; $y -lt $bitmap.Height; $y += 16) {
        for ($x = 0; $x -lt $bitmap.Width; $x += 16) {
            $alpha = $bitmap.GetPixel($x, $y).A
            if ($alpha -eq 0) { $hasTransparentPixel = $true }
            if ($alpha -gt 0) { $hasVisiblePixel = $true }
        }
    }
    if (-not $hasTransparentPixel) { throw 'Export has no sampled transparent pixels.' }
    if (-not $hasVisiblePixel) { throw 'Export has no sampled visible pixels.' }

    [pscustomobject]@{
        Path = $resolved
        Width = $bitmap.Width
        Height = $bitmap.Height
        PixelFormat = $bitmap.PixelFormat.ToString()
        TransparentBackground = $true
        VisibleArtwork = $true
        Validation = 'Passed'
    }
}
finally {
    $bitmap.Dispose()
}
