# Script to remove all white borders from TSX files

$files = Get-ChildItem -Path "src" -Filter "*.tsx" -Recurse | Where-Object { 
    (Get-Content $_.FullName -Raw) -match "border-white" 
}

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Remove various border-white patterns
    $newContent = $content `
        -replace '\s+border\s+border-white/\d+', '' `
        -replace '\s+border-white/\d+', '' `
        -replace 'border\s+border-white/\d+\s+', '' `
        -replace 'border-white/\d+\s+', '' `
        -replace '\s+border-\d+\s+border-white/\d+', '' `
        -replace 'border-t\s+border-white/\d+', '' `
        -replace 'border-b\s+border-white/\d+', '' `
        -replace 'border-l\s+border-white/\d+', '' `
        -replace 'border-r\s+border-white/\d+', '' `
        -replace 'border-dashed\s+border-white/\d+', ''
    
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        $count++
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nTotal files updated: $count"
