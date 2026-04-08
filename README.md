#  My Chat App

A real-time chat application built with **React**, **Vite**, and **Firebase**.

## Features

-  User authentication (sign up, log in, log out) via Firebase Auth
-  Real-time messaging powered by Firebase Firestore
-  Online/offline user presence indicators
-  Responsive design — works on desktop and mobile
-  Fast development and build times with Vite

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Build Tool | Vite |
| Backend / Database | Firebase Firestore |
| Authentication | Firebase Auth |
| Hosting | Firebase Hosting (optional) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Firebase](https://firebase.google.com/) project with Firestore and Authentication enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Yerm4002/my-chat-app.git
   cd my-chat-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase**

   Create a `.env` file in the project root and add your Firebase config:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

   > You can find these values in your Firebase Console under **Project Settings → General → Your apps**.

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

## Firebase Setup

In your Firebase Console:

1. Enable **Email/Password** authentication under **Authentication → Sign-in method**
2. Create a **Firestore Database** in production or test mode
3. Set up the following Firestore security rules (or customize as needed):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /messages/{messageId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build locally |

## Deployment

To deploy to Firebase Hosting:

```bash
npm run build
firebase deploy
```

Make sure you have the Firebase CLI installed (`npm install -g firebase-tools`) and have run `firebase login` and `firebase init` first.

## Project Structure

```
my-chat-app/
├── public/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components
│   ├── firebase.js      # Firebase initialization
│   ├── App.jsx
│   └── main.jsx
├── .env                 # Environment variables (not committed)
├── index.html
└── vite.config.js
```

## License

This project is open source and available under the [MIT License](LICENSE).
