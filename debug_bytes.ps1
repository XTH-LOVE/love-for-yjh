$filePath = "D:\love-for-yjh\frontend\src\App.tsx"
$bytes = [System.IO.File]::ReadAllBytes($filePath)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Find the problematic string
$searchStr = "message: '请输入邀请码'"
$idx = $content.IndexOf($searchStr)
if ($idx -ge 0) {
    Write-Host "Found at byte position: $idx"
    Write-Host "Bytes around it: $($bytes[($idx-10)..($idx+30)])"
    Write-Host "String around it: $($content.Substring($idx-10, 50))"
} else {
    Write-Host "String not found!"
}

# Check if there are any non-ASCII chars in the message
$str = "请输入邀请码"
$strBytes = [System.Text.Encoding]::UTF8.GetBytes($str)
Write-Host "UTF-8 bytes of '请输入邀请码': $strBytes"
