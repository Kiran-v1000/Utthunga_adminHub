param(
  [string]$PgPassword = "yourpassword",
  [string]$PgUser     = "postgres",
  [string]$DbName     = "adminhub_db"
)

Write-Host "=== Utthunga AdminHub - Windows Setup ===" -ForegroundColor Cyan

# 1. Create .env
if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  (Get-Content ".env") -replace "yourpassword", $PgPassword | Set-Content ".env" -Encoding UTF8
  Write-Host "[1/5] .env created" -ForegroundColor Green
} else {
  Write-Host "[1/5] .env already exists - skipping" -ForegroundColor Yellow
}

# 2. Create database
Write-Host "[2/5] Creating PostgreSQL database '$DbName'..." -ForegroundColor Cyan
$env:PGPASSWORD = $PgPassword
psql -U $PgUser -c "CREATE DATABASE $DbName;" 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Host "      Database created." -ForegroundColor Green
} else {
  Write-Host "      Database may already exist - continuing." -ForegroundColor Yellow
}

# 3. Install packages
Write-Host "[3/5] Installing Node packages..." -ForegroundColor Cyan
yarn install
if ($LASTEXITCODE -ne 0) { Write-Error "yarn install failed"; exit 1 }
Write-Host "      Done." -ForegroundColor Green

# 4. Prisma generate + migrate
Write-Host "[4/5] Running Prisma migrate..." -ForegroundColor Cyan
yarn db:generate
yarn db:migrate
Write-Host "      Schema applied." -ForegroundColor Green

# 5. Seed
Write-Host "[5/5] Seeding database..." -ForegroundColor Cyan
yarn db:seed
Write-Host "      Seed complete." -ForegroundColor Green

Write-Host ""
Write-Host "=== Setup complete! ===" -ForegroundColor Cyan
Write-Host "Run:  yarn dev"
Write-Host "  API  -> http://localhost:4000"
Write-Host "  Web  -> http://localhost:5173"
Write-Host ""
Write-Host "Seed accounts:"
Write-Host "  admin@utthunga.com    (SUPER_ADMIN)"
Write-Host "  employee@utthunga.com (EMPLOYEE)"
