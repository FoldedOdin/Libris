$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8000/api/login/" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -SessionVariable session

Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
