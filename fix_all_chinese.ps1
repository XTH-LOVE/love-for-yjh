$filePath = "D:\love-for-yjh\frontend\src\App.tsx"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Fix corrupted strings
$content = $content -replace "message: '请输入邀请码'", "message: 'Enter invite code'"
$content = $content -replace 'placeholder="邀请码（必填，找我要）"', 'placeholder="Invite code (required)"'
$content = $content -replace "message: '请输入用户名'", "message: 'Enter username'"
$content = $content -replace "message: '用户名2-20字符'", "message: 'Username 2-20 chars'"
$content = $content -replace 'placeholder="用户名"', 'placeholder="Username"'
$content = $content -replace "message: '请输入密码'", "message: 'Enter password'"
$content = $content -replace "message: '密码至少 6 位'", "message: 'Password min 6 chars'"
$content = $content -replace "message: '确认密码'", "message: 'Confirm password'"

# Write back with UTF-8 BOM
$utf8WithBom = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText($filePath, $content, $utf8WithBom)
Write-Host "File saved"
