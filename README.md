# FlowRoll - BJJ Notes & Technique Tracker

A React Native/Expo application for tracking Brazilian Jiu-Jitsu techniques and training sessions. Built with TypeScript and designed for iOS, Android, and web platforms.

## Features

### 📝 Technique Management
- Add, edit, and delete BJJ techniques
- Categorize techniques (Submission, Sweep, Escape, Guard Pass, Takedown, Defense, Transition, Control)
- Add custom tags for better organization
- Attach reference links and notes to techniques
- Advanced search and filtering capabilities

### 🥋 Training Session Tracking
- Log training sessions with date, location, and type (gi/no-gi)
- Track techniques practiced in each session
- Record submissions achieved with counts
- Rate session satisfaction (1-5 stars)
- Add session notes

### 📊 Analytics Dashboard
- View training frequency and consistency
- Track most practiced techniques
- Monitor satisfaction trends over time
- Visualize technique distribution by category
- Track total training hours

### 👤 User Profile
- Set your belt rank and stripe count
- Personalized experience based on your level
- All data stored locally on your device

## Tech Stack

- **Framework**: React Native with Expo (SDK 53)
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router (file-based)
- **Database**: SQLite (expo-sqlite)
- **UI Components**: Custom components with React Native primitives
- **Icons**: Lucide React Native
- **Charts**: React Native Chart Kit
- **Storage**: Local SQLite with automatic AsyncStorage migration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dave11k/flow-roll-app.git
cd flow-roll
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Run on your device:
   - Download Expo Go from App Store (iOS) or Google Play (Android)
   - Scan the QR code displayed in the terminal
   - For web: Press 'w' in the terminal or navigate to the URL shown

## Project Structure

```
flow-roll/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Techniques screen
│   │   ├── analytics.tsx  # Analytics dashboard
│   │   ├── sessions.tsx   # Training sessions
│   │   └── settings.tsx   # Settings and profile
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── contexts/             # React contexts
├── services/             # Database and storage services
├── types/                # TypeScript type definitions
├── constants/            # App constants and colors
├── hooks/                # Custom React hooks
├── utils/                # Utility functions
└── data/                 # Static data and suggestions
```

## Available Scripts

- `npm run dev` - Start the Expo development server
- `npm run build:web` - Build for web platform
- `npm run lint` - Run ESLint
- `npm run check` - Run TypeScript and linting checks

## Key Features Implementation

### Database Schema
The app uses SQLite with the following main tables:
- `techniques` - Stores technique information
- `sessions` - Training session data
- `technique_tags` - Many-to-many relationship for tags
- `session_techniques` - Links techniques to sessions
- `submissions` - Tracks submissions per session
- `tags` - Available tags (predefined and custom)

### Data Persistence
- Automatic migration from AsyncStorage to SQLite on first launch
- All data stored locally - no cloud sync
- Efficient indexing for fast queries
- Supports offline usage

### UI/UX Design
- Clean, modern interface with dark green theme (#1e3a2e)
- Category-specific colors for visual organization
- Smooth animations and transitions
- Responsive design for all screen sizes
- Modal-based editing for better mobile UX

## Privacy

FlowRoll stores all data locally on your device. No data is sent to external servers. See `privacy-policy.txt` for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, feature requests, or questions:
- Contact: [davidkiely97@gmail.com]

## Acknowledgments

- Built with Expo and React Native
- Icons by Lucide
- Charts by React Native Chart Kit