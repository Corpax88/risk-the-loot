[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SourceKra,

    [Parameter(Mandatory = $true)]
    [ValidateSet('01_Cape', '03_Legs', '04_Boots', '05_Chest', '06_Scarf', '07_Hat', '08_Weapon', '09_Effects')]
    [string]$Group,

    [Parameter(Mandatory = $true)]
    [string]$OutputPng
)

$ErrorActionPreference = 'Stop'
$krita = 'C:\Program Files\Krita (x64)\bin\krita.com'
if (-not (Test-Path -LiteralPath $krita)) {
    throw 'Krita 5.3.3 is not installed at the expected official winget location.'
}

$source = (Resolve-Path -LiteralPath $SourceKra).Path
$output = [IO.Path]::GetFullPath($OutputPng)
$slotByGroup = @{
    '01_Cape' = 'cape'; '03_Legs' = 'legs'; '04_Boots' = 'boots'; '05_Chest' = 'chest'
    '06_Scarf' = 'scarf'; '07_Hat' = 'hat'; '08_Weapon' = 'weapon'; '09_Effects' = 'effects'
}
$pattern = '^(common|rare|epic|legendary)_[a-z0-9]+(?:_[a-z0-9]+)*_(cape|legs|boots|chest|scarf|hat|weapon|effects)_\d{2}\.png$'
if ([IO.Path]::GetFileName($output) -notmatch $pattern) { throw 'Output filename must match rarity_setname_slot_variant.png' }
if ([IO.Path]::GetFileName($output) -notmatch "_$($slotByGroup[$Group])_\d{2}\.png$") { throw 'Filename slot does not match the selected layer group.' }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$tempKra = Join-Path $env:TEMP ('risk-loot-export-' + [guid]::NewGuid().ToString('N') + '.kra')
try {
    Copy-Item -LiteralPath $source -Destination $tempKra
    $archive = [IO.Compression.ZipFile]::Open($tempKra, [IO.Compression.ZipArchiveMode]::Update)
    try {
        $entry = $archive.GetEntry('maindoc.xml')
        if (-not $entry) { throw 'Source KRA has no maindoc.xml.' }
        $reader = [IO.StreamReader]::new($entry.Open())
        try { [xml]$xml = $reader.ReadToEnd() } finally { $reader.Dispose() }
        $namespace = [Xml.XmlNamespaceManager]::new($xml.NameTable)
        $namespace.AddNamespace('k', 'http://www.calligra.org/DTD/krita')
        $topLayers = $xml.SelectNodes('/k:DOC/k:IMAGE/k:layers/k:layer', $namespace)
        $found = $false
        foreach ($layer in $topLayers) {
            $visible = if ($layer.name -eq $Group) { '1' } else { '0' }
            $layer.SetAttribute('visible', $visible)
            if ($layer.name -eq $Group) { $found = $true }
        }
        if (-not $found) { throw "Source KRA is missing group $Group" }

        $settings = [Xml.XmlWriterSettings]::new()
        $settings.Encoding = [Text.UTF8Encoding]::new($false)
        $settings.Indent = $true
        $memory = [IO.MemoryStream]::new()
        $writer = [Xml.XmlWriter]::Create($memory, $settings)
        try { $xml.Save($writer) } finally { $writer.Dispose() }
        $bytes = $memory.ToArray()
        $memory.Dispose()

        $entry.Delete()
        $newEntry = $archive.CreateEntry('maindoc.xml', [IO.Compression.CompressionLevel]::Optimal)
        $stream = $newEntry.Open()
        try { $stream.Write($bytes, 0, $bytes.Length) } finally { $stream.Dispose() }
    }
    finally { $archive.Dispose() }

    $outputDirectory = Split-Path -Parent $output
    if ($outputDirectory) { New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null }
    & $krita --export --export-filename $output $tempKra
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $output)) { throw "Krita export failed with exit code $LASTEXITCODE" }
}
finally {
    Remove-Item -LiteralPath $tempKra -Force -ErrorAction SilentlyContinue
}

& (Join-Path $PSScriptRoot 'Validate-KritaExport.ps1') -PngPath $output
