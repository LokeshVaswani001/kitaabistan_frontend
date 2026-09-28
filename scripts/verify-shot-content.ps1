Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.Ocr.OcrEngine,Windows.Foundation,ContentType=WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder,Windows.Foundation,ContentType=WindowsRuntime]
$null = [Windows.Storage.StorageFile,Windows.Foundation,ContentType=WindowsRuntime]

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() |
  Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]

function Await($op, $type) {
  $asTask = $asTaskGeneric.MakeGenericMethod($type)
  $netTask = $asTask.Invoke($null, @($op))
  $netTask.Wait(-1) | Out-Null
  return $netTask.Result
}

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) { Write-Output "NO OCR ENGINE"; exit 1 }

# file -> words that must appear (case-insensitive) so the caption matches the picture
$expect = @{
  "home.png"          = @("shelf", "Search books")
  "library.png"       = @("Eight shelves", "Cartoon poem")
  "chatbot.png"       = @("Ask", "without internet")
  "languages.png"     = @("PERSIAN", "TURKISH")
  "add-books.png"     = @("Add your own books", "Upload")
  "animated-books.png" = @("Peter Rabbit", "Animated Books")
}

$dir = "C:\Users\afzal\kitaabistan_frontend\public\screenshots"
$fail = 0

foreach ($name in ($expect.Keys | Sort-Object)) {
  $path = Join-Path $dir $name
  if (-not (Test-Path $path)) { Write-Output "FAIL  $name :: file missing"; $fail++; continue }
  $f = Get-Item $path
  try {
    $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($f.FullName)) ([Windows.Storage.StorageFile])
    $stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bmp = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $result = Await ($engine.RecognizeAsync($bmp)) ([Windows.Media.Ocr.OcrResult])
    $text = $result.Text
    $stream.Dispose()

    $missing = @()
    foreach ($word in $expect[$name]) {
      if ($text -notmatch [regex]::Escape($word)) { $missing += $word }
    }
    $leak = if ($text -match "gmail|@|Fatima") { "LEAK: email/name visible" } else { "" }

    if ($missing.Count -eq 0 -and -not $leak) {
      Write-Output "PASS  $name shows: $($expect[$name] -join ' + ')"
    } else {
      Write-Output "FAIL  $name missing [$($missing -join ', ')] $leak"
      Write-Output "      OCR: " + ($text -replace "\s+", " ").Substring(0, [Math]::Min(220, $text.Length))
      $fail++
    }
  } catch {
    Write-Output "FAIL  $name ERROR: $($_.Exception.Message)"
    $fail++
  }
}

Write-Output ""
if ($fail) { Write-Output "$fail FAILED"; exit 1 } else { Write-Output "ALL SHOTS MATCH THEIR CAPTIONS" }
