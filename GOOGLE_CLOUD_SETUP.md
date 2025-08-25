# Google Cloud API Setup Guide for LiveSpeak

## Overview
This guide will help you set up Google Cloud APIs for LiveSpeak's speech recognition and translation features.

## Prerequisites
- Google Cloud account
- Billing enabled on your Google Cloud project
- Basic knowledge of Google Cloud Console

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `livespeak-api` (or your preferred name)
4. Click "Create"
5. Note your **Project ID** (you'll need this for the .env file)

## Step 2: Enable Required APIs

1. In your project, go to "APIs & Services" → "Library"
2. Search for and enable these APIs:
   - **Speech-to-Text API**
   - **Translation API**
3. Wait for APIs to be enabled (usually takes a few minutes)

## Step 3: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in:
   - **Name**: `livespeak-service-account`
   - **Description**: `Service account for LiveSpeak API access`
4. Click "Create and Continue"
5. For roles, add:
   - **Speech-to-Text User**
   - **Translation API User**
6. Click "Continue" → "Done"

## Step 4: Generate Service Account Key

1. Click on your new service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON" format
5. Click "Create"
6. **Download the JSON file** and save it in your project root as `google-credentials.json`

## Step 5: Configure Environment Variables

1. Copy the `env.example` file to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and fill in your values:
   ```bash
   # Replace with your actual project ID
   GOOGLE_CLOUD_PROJECT_ID=livespeak-api-123456
   
   # Path to your downloaded credentials file
   GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
   
   # Environment
   NODE_ENV=development
   ```

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the translation API:
   ```bash
   curl -X POST http://localhost:3000/api/translate \
     -H "Content-Type: application/json" \
     -d '{"text":"Hello world","targetLanguage":"es"}'
   ```

3. Check the console for any authentication errors

## Troubleshooting

### Common Issues:

1. **"authentication failed" error**
   - Check that `GOOGLE_APPLICATION_CREDENTIALS` points to the correct file
   - Verify the JSON file contains valid credentials
   - Ensure the service account has the correct roles

2. **"API not enabled" error**
   - Go to APIs & Services → Library
   - Make sure Speech-to-Text and Translation APIs are enabled
   - Wait a few minutes after enabling

3. **"quota exceeded" error**
   - Check your billing is enabled
   - Monitor usage in Google Cloud Console
   - Consider setting up quotas and alerts

4. **"project not found" error**
   - Verify your `GOOGLE_CLOUD_PROJECT_ID` is correct
   - Check that you're using the right project

## Security Best Practices

1. **Never commit credentials to git**
   - `.env` and `google-credentials.json` are already in `.gitignore`
   - Use environment variables in production

2. **Restrict API access**
   - Only enable the APIs you need
   - Use service accounts with minimal required permissions
   - Set up API quotas to prevent abuse

3. **Monitor usage**
   - Set up billing alerts
   - Monitor API usage in Google Cloud Console
   - Set up logging for API calls

## Production Deployment

For production (Netlify), you'll need to:

1. **Set environment variables** in Netlify dashboard
2. **Upload credentials** securely (consider using Netlify's secret management)
3. **Set up proper CORS** if needed
4. **Monitor API usage** and costs

## Cost Estimation

Google Cloud APIs pricing (as of 2025):
- **Speech-to-Text**: $0.006 per 15 seconds
- **Translation**: $20 per million characters

For development/testing, you'll likely stay within the free tier limits.

## Support

If you encounter issues:
1. Check Google Cloud Console for error details
2. Verify your credentials and permissions
3. Check the API quotas and billing status
4. Review the Google Cloud documentation for the specific APIs
