# SMS & WhatsApp Marketing Campaign - Frontend

React + TypeScript + Vite frontend dashboard for managing and monitoring SMS and WhatsApp promotional marketing campaigns.

## Features
- **Campaign Dashboard**: Real-time monitoring of campaign queue status, delivery statistics, and scheduled tasks.
- **Single Recipient Test Suite**: Send instant test messages directly to individual phone numbers via WhatsApp, Cellular SMS, or Both.
- **Offer & Customer Management**: Upload and manage CSV files for targeted marketing lists and promotional discount codes.
- **Audience Segmentation**: Target campaigns by demographic groups (Men, Women, Boys, Girls, Children, All).
- **Template Customizer**: Interactive preview of marketing message copies with dynamic variables (`{{1}}` for customer name, `{{2}}` for offer, `{{3}}` for validity).
- **Channel Status Indicators**: Live visual indicators for WhatsApp Sandbox and Cellular SMS carrier readiness.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```
The optimized production build will be located in the `dist` folder.
