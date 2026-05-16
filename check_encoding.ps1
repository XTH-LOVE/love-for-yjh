$bytes = [System.IO.File]::ReadAllBytes('D:/love-for-yjh/frontend/src/App.tsx')
$line = 1
$col = 0
$targetLine = 522
$targetCol = 41
$pos = 0

for ($i = 0; $i -lt $bytes.Length; $i++) {
    if ($bytes[$i] -eq 10) {
        $line++
        $col = 0
    } else {
        $col++
    }
    if ($line -eq $targetLine -and $col -eq $targetCol) {
        $pos = $i
        break
    }
}

Write-Host "Line 522, Col 41 byte: $($bytes[$pos])"
Write-Host "Context bytes: $($bytes[($pos-20)..($pos+20)])"
Write-Host "Context text: $([System.Text.Encoding]::UTF8.GetString($bytes[($pos-20)..($pos+20)]))"
