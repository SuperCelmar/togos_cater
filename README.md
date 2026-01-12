<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1vq2XUh9YlUYiHL6T4EI6qwstzbJ7edIQ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment

### Vercel

1. **Environment Variables**: Add `GEMINI_API_KEY` to your Vercel project settings.
2. **Build Settings**: The app is configured with `vercel.json`. Vercel will automatically use:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Framework Preset**: Vite
3. **Deploy**: Push to your repository or use the Vercel CLI:
   ```bash
   vercel
   ```
