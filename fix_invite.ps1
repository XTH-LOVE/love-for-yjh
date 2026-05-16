$filePath = "D:\love-for-yjh\frontend\src\App.tsx"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

$oldBlock = @'
            {isRegister && (
              <Form.Item name="inviteCode" rules={[{ required: true, message: '请输入邀请码' }]}>
                <Input.Password
                  placeholder="邀请码（必填，找我要）"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', borderRadius: 14, height: 48,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                />
              </Form.Item>
            )}
'@

$newBlock = @'
            {isRegister && (
              <Form.Item name="inviteCode" rules={[{ required: true, message: 'Please enter invite code' }]}>
                <Input.Password
                  placeholder="Invite code (required, ask me)"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', borderRadius: 14, height: 48,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                />
              </Form.Item>
            )}
'@

$content = $content.Replace($oldBlock, $newBlock)
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done"
