$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Listening on http://localhost:$port/"
$baseDir = $PSScriptRoot

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $rawUrl = $request.RawUrl.Split('?')[0]
        
        if ($request.HttpMethod -eq "POST" -and $rawUrl -eq "/save-portfolio-data") {
            $reader = New-Object System.IO.StreamReader($request.InputStream)
            $body = $reader.ReadToEnd()
            $reader.Close()
            
            $targetPath = Join-Path $baseDir "portfolio-data.json"
            [System.IO.File]::WriteAllText($targetPath, $body)
            
            $response.StatusCode = 200
            $response.ContentType = "application/json; charset=utf-8"
            $okBytes = [System.Text.Encoding]::UTF8.GetBytes('{"status":"ok"}')
            $response.OutputStream.Write($okBytes, 0, $okBytes.Length)
            $response.Close()
            continue
        }

        $decodedUrl = [System.Uri]::UnescapeDataString($rawUrl)
        $relPath = $decodedUrl.TrimStart('/')
        if ([string]::IsNullOrEmpty($relPath)) {
            $relPath = "index.html"
        }
        $filePath = Join-Path $baseDir $relPath
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = "text/plain"
            if ($ext -eq ".html" -or $ext -eq ".htm") { $mime = "text/html; charset=utf-8" }
            elseif ($ext -eq ".css") { $mime = "text/css" }
            elseif ($ext -eq ".js") { $mime = "application/javascript" }
            elseif ($ext -eq ".json") { $mime = "application/json; charset=utf-8" }
            elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $mime = "image/jpeg" }
            elseif ($ext -eq ".png") { $mime = "image/png" }
            elseif ($ext -eq ".svg") { $mime = "image/svg+xml" }
            
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("File Not Found: $filePath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
} catch {
    Write-Error $_
} finally {
    $listener.Stop()
}
