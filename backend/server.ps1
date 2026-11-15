<#
    .SYNOPSIS
    Full Stack Backend Server for Wood Puzzle Screw & Bolt Game
    Zero external dependencies: Pure PowerShell & .NET TCP HTTP Server
#>

param(
    [int]$Port = 8080,
    [string]$HostAddress = "127.0.0.1"
)

$RootDir = (Resolve-Path "$PSScriptRoot\..").Path
$DataDir = Join-Path $PSScriptRoot "data"

if (!(Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
}

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".wav"  = "audio/wav"
    ".mp3"  = "audio/mpeg"
}

function Send-Response {
    param(
        [System.Net.Sockets.NetworkStream]$Stream,
        [int]$StatusCode,
        [string]$StatusText,
        [string]$ContentType,
        [byte[]]$BodyBytes,
        [hashtable]$ExtraHeaders = @{}
    )
    
    $headerText = "HTTP/1.1 $StatusCode $StatusText`r`n"
    $headerText += "Content-Type: $ContentType`r`n"
    $headerText += "Content-Length: $($BodyBytes.Length)`r`n"
    $headerText += "Access-Control-Allow-Origin: *`r`n"
    $headerText += "Access-Control-Allow-Methods: GET, POST, OPTIONS`r`n"
    $headerText += "Access-Control-Allow-Headers: Content-Type, Authorization`r`n"
    $headerText += "Connection: close`r`n"
    
    foreach ($key in $ExtraHeaders.Keys) {
        $headerText += "$key`: $($ExtraHeaders[$key])`r`n"
    }
    $headerText += "`r`n"
    
    $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($headerText)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)
    if ($BodyBytes.Length -gt 0) {
        $Stream.Write($BodyBytes, 0, $BodyBytes.Length)
    }
    $Stream.Flush()
}

function Send-JsonResponse {
    param(
        [System.Net.Sockets.NetworkStream]$Stream,
        [int]$StatusCode = 200,
        [string]$StatusText = "OK",
        [object]$Data
    )
    $json = $Data | ConvertTo-Json -Depth 10 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    Send-Response -Stream $Stream -StatusCode $StatusCode -StatusText $StatusText -ContentType "application/json; charset=utf-8" -BodyBytes $bytes
}

# Start TCP Listener
$ip = [System.Net.IPAddress]::Parse($HostAddress)
$listener = New-Object System.Net.Sockets.TcpListener($ip, $Port)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " [WOOD PUZZLE SCREW & BOLT] FULL-STACK SERVER STARTED" -ForegroundColor Yellow
    Write-Host " Listening on: http://$HostAddress`:$Port" -ForegroundColor Cyan
    Write-Host " Root Directory: $RootDir" -ForegroundColor Gray
    Write-Host " Press Ctrl+C in this console to stop the server" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Green

    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)

        $requestLine = $reader.ReadLine()
        if ([string]::IsNullOrWhiteSpace($requestLine)) {
            $client.Close()
            continue
        }

        $parts = $requestLine -split " "
        if ($parts.Length -lt 2) {
            $client.Close()
            continue
        }

        $method = $parts[0].ToUpper()
        $rawUrl = $parts[1]
        $urlPath = $rawUrl.Split('?')[0]

        # Read headers
        $headers = @{}
        while ($true) {
            $hLine = $reader.ReadLine()
            if ([string]::IsNullOrEmpty($hLine)) { break }
            $colonPos = $hLine.IndexOf(":")
            if ($colonPos -gt 0) {
                $hName = $hLine.Substring(0, $colonPos).Trim().ToLower()
                $hVal = $hLine.Substring($colonPos + 1).Trim()
                $headers[$hName] = $hVal
            }
        }

        # Read body if present
        $body = ""
        if ($headers.ContainsKey("content-length")) {
            $contentLen = 0
            if ([int]::TryParse($headers["content-length"], [ref]$contentLen) -and $contentLen -gt 0) {
                $charBuffer = New-Object char[] $contentLen
                $readCount = 0
                while ($readCount -lt $contentLen) {
                    $n = $reader.Read($charBuffer, $readCount, $contentLen - $readCount)
                    if ($n -le 0) { break }
                    $readCount += $n
                }
                $body = New-Object string ($charBuffer, 0, $readCount)
            }
        }

        Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] $method $urlPath" -ForegroundColor White

        # CORS preflight
        if ($method -eq "OPTIONS") {
            Send-Response -Stream $stream -StatusCode 204 -StatusText "No Content" -ContentType "text/plain" -BodyBytes @()
            $client.Close()
            continue
        }

        # API Routes
        if ($urlPath.StartsWith("/api/")) {
            try {
                if ($urlPath -eq "/api/progress" -and $method -eq "GET") {
                    $filePath = Join-Path $DataDir "progress.json"
                    $content = if (Test-Path $filePath) { Get-Content $filePath -Raw -Encoding UTF8 } else { "{}" }
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
                    Send-Response -Stream $stream -StatusCode 200 -StatusText "OK" -ContentType "application/json" -BodyBytes $bytes
                }
                elseif ($urlPath -eq "/api/progress" -and $method -eq "POST") {
                    $filePath = Join-Path $DataDir "progress.json"
                    [System.IO.File]::WriteAllText($filePath, $body, [System.Text.Encoding]::UTF8)
                    Send-JsonResponse -Stream $stream -StatusCode 200 -Data @{ success = $true; message = "Progress saved" }
                }
                elseif ($urlPath -eq "/api/leaderboard" -and $method -eq "GET") {
                    $filePath = Join-Path $DataDir "leaderboard.json"
                    $content = if (Test-Path $filePath) { Get-Content $filePath -Raw -Encoding UTF8 } else { "[]" }
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
                    Send-Response -Stream $stream -StatusCode 200 -StatusText "OK" -ContentType "application/json" -BodyBytes $bytes
                }
                elseif ($urlPath -eq "/api/leaderboard" -and $method -eq "POST") {
                    $filePath = Join-Path $DataDir "leaderboard.json"
                    $list = if (Test-Path $filePath) { (Get-Content $filePath -Raw | ConvertFrom-Json) } else { @() }
                    $newItem = $body | ConvertFrom-Json
                    $newItem | Add-Member -MemberType NoteProperty -Name "id" -Value ([Guid]::NewGuid().ToString().Substring(0,8)) -Force
                    $newItem | Add-Member -MemberType NoteProperty -Name "date" -Value ([DateTime]::Now.ToString("yyyy-MM-dd")) -Force
                    $combined = @($list) + @($newItem) | Sort-Object -Property stars -Descending | Select-Object -First 20
                    $json = $combined | ConvertTo-Json -Depth 5
                    [System.IO.File]::WriteAllText($filePath, $json, [System.Text.Encoding]::UTF8)
                    Send-JsonResponse -Stream $stream -StatusCode 200 -Data @{ success = $true; leaderboard = $combined }
                }
                elseif ($urlPath -eq "/api/levels" -and $method -eq "GET") {
                    $filePath = Join-Path $DataDir "custom_levels.json"
                    $content = if (Test-Path $filePath) { Get-Content $filePath -Raw -Encoding UTF8 } else { "[]" }
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
                    Send-Response -Stream $stream -StatusCode 200 -StatusText "OK" -ContentType "application/json" -BodyBytes $bytes
                }
                elseif ($urlPath -eq "/api/levels" -and $method -eq "POST") {
                    $filePath = Join-Path $DataDir "custom_levels.json"
                    $list = if (Test-Path $filePath) { (Get-Content $filePath -Raw | ConvertFrom-Json) } else { @() }
                    $newLevel = $body | ConvertFrom-Json
                    if (-not $newLevel.id) {
                        $newLevel | Add-Member -MemberType NoteProperty -Name "id" -Value ([Guid]::NewGuid().ToString().Substring(0,8)) -Force
                    }
                    $combined = @($list) + @($newLevel)
                    $json = $combined | ConvertTo-Json -Depth 10
                    [System.IO.File]::WriteAllText($filePath, $json, [System.Text.Encoding]::UTF8)
                    Send-JsonResponse -Stream $stream -StatusCode 201 -Data @{ success = $true; level = $newLevel }
                }
                elseif ($urlPath -eq "/api/stats" -and $method -eq "GET") {
                    $progFile = Join-Path $DataDir "progress.json"
                    $leadFile = Join-Path $DataDir "leaderboard.json"
                    $custFile = Join-Path $DataDir "custom_levels.json"
                    $stats = @{
                        serverTime = [DateTime]::UtcNow.ToString("o")
                        customLevelsCount = if (Test-Path $custFile) { ((Get-Content $custFile -Raw | ConvertFrom-Json)).Count } else { 0 }
                        leaderboardEntries = if (Test-Path $leadFile) { ((Get-Content $leadFile -Raw | ConvertFrom-Json)).Count } else { 0 }
                        status = "online"
                    }
                    Send-JsonResponse -Stream $stream -StatusCode 200 -Data $stats
                }
                else {
                    Send-JsonResponse -Stream $stream -StatusCode 404 -StatusText "Not Found" -Data @{ error = "Endpoint not found" }
                }
            }
            catch {
                Write-Host "API Error: $_" -ForegroundColor Red
                Send-JsonResponse -Stream $stream -StatusCode 500 -StatusText "Internal Server Error" -Data @{ error = $_.Exception.Message }
            }
            $client.Close()
            continue
        }

        # Static File Serving
        $relPath = if ($urlPath -eq "/" -or $urlPath -eq "") { "index.html" } else { $urlPath.TrimStart('/') }
        $relPath = [System.Uri]::UnescapeDataString($relPath).Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $filePath = Join-Path $RootDir $relPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($MimeTypes.ContainsKey($ext)) { $MimeTypes[$ext] } else { "application/octet-stream" }
            $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
            Send-Response -Stream $stream -StatusCode 200 -StatusText "OK" -ContentType $mime -BodyBytes $fileBytes
        }
        else {
            $errBody = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found: $urlPath</h1>")
            Send-Response -Stream $stream -StatusCode 404 -StatusText "Not Found" -ContentType "text/html" -BodyBytes $errBody
        }

        $client.Close()
    }
}
finally {
    $listener.Stop()
    Write-Host "Server stopped." -ForegroundColor Red
}
