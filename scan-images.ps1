# scan-images.ps1
# Scans "Renovation Booklet" and "Renovation Booklet/latest images" for image files
# and outputs scanned-images.json

$baseDir = "c:\Users\ehnew\Downloads\Property Renovations\Remodeling Photos Picks\Renovation Bookletunzipped"
$renovationBookletDir = Join-Path $baseDir "Renovation Booklet"
$latestImagesDir = Join-Path $renovationBookletDir "latest images"

$images = @()

# Helper function to get human-readable file size
function Get-FormattedSize($bytes) {
    if ($bytes -ge 1MB) {
        return "{0:N2} MB" -f ($bytes / 1MB)
    } elseif ($bytes -ge 1KB) {
        return "{0:N2} KB" -f ($bytes / 1KB)
    } else {
        return "$bytes Bytes"
    }
}

# 1. Scan latest images directory
if (Test-Path $latestImagesDir) {
    $latestFiles = Get-ChildItem -Path $latestImagesDir -File | Where-Object { $_.Extension -match "(?i)^\.(jpg|jpeg|png)$" }
    foreach ($file in $latestFiles) {
        $relPath = "Renovation Booklet/latest images/$($file.Name)"
        $images += [PSCustomObject]@{
            path = $relPath
            filename = $file.Name
            folder = "latest"
            sizeBytes = $file.Length
            sizeFormatted = Get-FormattedSize $file.Length
        }
    }
}

# 2. Scan core images directory (excluding "latest images" subfolder)
if (Test-Path $renovationBookletDir) {
    $coreFiles = Get-ChildItem -Path $renovationBookletDir -File | Where-Object { $_.Extension -match "(?i)^\.(jpg|jpeg|png)$" }
    foreach ($file in $coreFiles) {
        $relPath = "Renovation Booklet/$($file.Name)"
        $images += [PSCustomObject]@{
            path = $relPath
            filename = $file.Name
            folder = "core"
            sizeBytes = $file.Length
            sizeFormatted = Get-FormattedSize $file.Length
        }
    }
}

# Convert to JSON and save
$jsonOutput = $images | ConvertTo-Json -Depth 5
$jsonPath = Join-Path $baseDir "scanned-images.json"
$jsonOutput | Out-File -FilePath $jsonPath -Encoding utf8

Write-Host "Successfully scanned $($images.Count) images."
Write-Host "Saved output to scanned-images.json"
