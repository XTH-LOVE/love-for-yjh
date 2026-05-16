$content = [System.IO.File]::ReadAllText('D:/love-for-yjh/frontend/src/App.tsx', [System.Text.Encoding]::UTF8)
$searchStr = 'inviteCode'
$idx = $content.IndexOf($searchStr)
if ($idx -ge 0) {
    $contextStart = [Math]::Max(0, $idx - 50)
    $contextEnd = [Math]::Min($content.Length, $idx + $searchStr.Length + 100)
    $context = $content.Substring($contextStart, $contextEnd - $contextStart)
    Write-Host "Found at position: $idx"
    Write-Host "Context around 'inviteCode':"
    Write-Host $context
}
