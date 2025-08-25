@echo off
echo ========================================
echo LiveSpeak Environment Setup Script
echo ========================================
echo.

echo This script will help you set up your .env file for Google Cloud APIs
echo.

echo Step 1: Copy env.example to .env
if not exist .env (
    copy env.example .env
    echo ✓ Created .env file from env.example
) else (
    echo ✓ .env file already exists
)

echo.
echo Step 2: You need to manually edit .env with your Google Cloud credentials
echo.
echo Required values to set:
echo - GOOGLE_CLOUD_PROJECT_ID: Your Google Cloud project ID
echo - GOOGLE_APPLICATION_CREDENTIALS: Path to your credentials file
echo.

echo Step 3: Download your Google Cloud credentials
echo - Go to: https://console.cloud.google.com/
echo - Create project and enable APIs (Speech-to-Text, Translation)
echo - Create service account and download JSON key
echo - Save as google-credentials.json in project root
echo.

echo Step 4: Edit .env file with your actual values
echo Example:
echo   GOOGLE_CLOUD_PROJECT_ID=livespeak-api-123456
echo   GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
echo.

pause
echo.
echo Setup complete! Now you can run: npm run dev
