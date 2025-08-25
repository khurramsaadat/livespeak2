# Netlify Deployment Guide

This guide explains how to deploy LiveSpeak to Netlify.

## Prerequisites

- A Netlify account
- Your LiveSpeak project code pushed to GitHub

## Deployment Steps

### 1. Connect to GitHub

1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose "GitHub" as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select the `khurramsaadat/livespeak2` repository

### 2. Configure Build Settings

Netlify will automatically detect the build settings from `netlify.toml`:

- **Build command**: `npm run build`
- **Publish directory**: `out`
- **Node.js version**: 18

### 3. Deploy

1. Click "Deploy site"
2. Wait for the build to complete
3. Your site will be live at a Netlify subdomain

### 4. Custom Domain (Optional)

1. Go to "Domain settings" in your site dashboard
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Configuration Files

- `netlify.toml` - Netlify build configuration
- `.nvmrc` - Node.js version specification
- `next.config.ts` - Next.js static export configuration

## Build Process

1. **Install dependencies**: `npm install`
2. **Build static files**: `npm run build`
3. **Export to `out` directory**: Next.js generates static HTML/CSS/JS
4. **Deploy**: Netlify serves files from the `out` directory

## Features

- ✅ Static site generation
- ✅ Automatic builds on Git push
- ✅ Global CDN
- ✅ HTTPS enabled
- ✅ Form handling (if needed)
- ✅ Serverless functions support

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are installed
- Check for TypeScript/ESLint errors

### Site Not Working
- Verify the publish directory is `out`
- Check build logs for errors
- Ensure static export is working locally

### Performance Issues
- Enable Netlify's image optimization
- Use Netlify's asset optimization features
- Consider implementing caching strategies

## Support

For deployment issues:
1. Check Netlify build logs
2. Verify local build works (`npm run build`)
3. Check Netlify documentation
4. Review Next.js static export guide
