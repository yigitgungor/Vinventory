# Vinventory

## Overview

Vinventory is a web-based application designed to help wine enthusiasts manage their personal wine collections. Built with SvelteKit, this project allows users to add wines via manual input or OCR (Optical Character Recognition) of wine labels, store details in a local SQLite database, and view their collection in a responsive interface compatible with phones, iPads, and laptops. The app supports features like wine name recognition, region tracking, and user authentication.

This project is intended for personal use, providing a customizable and extensible platform for wine lovers to catalog their bottles.

## Features
- **Wine Collection Management**: Add, store, and view wine details (name, vintage, region, rating, and image).
- **OCR Integration**: Upload wine label images to extract details using the OCR.Space API.
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices.
- **User Authentication**: Basic login/logout functionality with user-specific collections.
- **Dynamic Suggestions**: Learn new wine brands and regions based on user input.
- **Local Database**: Uses SQLite (`vinventory.db`) for offline storage.

## Prerequisites
- **Node.js**: Version 18.x or later (recommended for SvelteKit compatibility).
- **npm**: Version 9.x or later (included with Node.js).
- **Git** (optional, for version control).
- **API Key**: An OCR.Space API key for the OCR functionality (free tier available at [ocr.space](https://ocr.space)).

## Installation

1. **Clone the Repository**:
   - If using Git, clone the project to your local machine:
     ```bash
     git clone <repository-url>
     cd Vinventory
     ```
   - Alternatively, download the ZIP file and extract it.

2. **Install Dependencies**:
   - Run the following command to install the required Node.js packages:
     ```bash
     npm install
     ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the project root (where `package.json` is located).
   - Add your OCR.Space API key:
     ```
     OCR_SPACE_API_KEY=your-api-key-here
     ```
   - Ensure `.env` is listed in `.gitignore` to prevent committing sensitive data.

4. **Initialize the Database**:
   - The application automatically creates a `vinventory.db` file in the project root or a `vinventory` subfolder when you first run it. No manual setup is required unless you need to reset it.

5. **Run the Development Server**:
   - Start the app in development mode:
     ```bash
     npm run dev
     ```
   - Open your browser and navigate to `http://localhost:5173` (or the port specified in the terminal).

## Usage

1. **Login**:
   - Access the login page (e.g., `/login`) and sign in with a registered email and password. Initial users can be added via the database or a signup route (if implemented).

2. **Add a Wine**:
   - Navigate to the collection page (e.g., `/collection`).
   - Use the "Add a Wine" form to manually enter wine details (name, vintage, region, rating) or upload an image of the wine label.
   - The OCR feature will prefill the form based on the uploaded image.

3. **View Collection**:
   - The collection page displays all wines associated with the logged-in user in a grid layout, with cards showing name, vintage, region, rating, and image (if available).

4. **Logout**:
   - Click the "Logout" button to return to the login page.

## Development

### Project Structure
- `src/`: Contains Svelte components and server-side routes.
  - `routes/collection/`: Main user interface for managing wines.
  - `routes/api/ocr/`: Endpoint for OCR processing.
  - `lib/database.ts`: SQLite database configuration.
- `data/wine-data.json`: Stores known wine brands and regions for dynamic updates.
- `vinventory.db`: Local SQLite database file.
- `node_modules/`: Node.js dependencies (managed by `package.json`).
- `.env`: Environment variables (e.g., API key).

### Running Tests
- This project does not currently include automated tests. To add testing, consider using Vitest or Playwright, and update `package.json` with relevant scripts.

### Building for Production
- Build the app for deployment:
  ```bash
  npm run build