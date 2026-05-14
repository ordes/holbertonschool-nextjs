# Holberton School – Full Stack React (Part 2)

An extended version of the Q&A web application built with Next.js 15, MySQL, and NextAuth v5, focused on improving user experience, structure, and advanced features.

# Overview

This phase builds on Part 1 by enhancing the existing Questions & Answers platform. The goal is to make the application more complete, scalable, and user-friendly.

More focus is placed on better data handling, cleaner architecture, and additional features that improve interaction between users.

# Tech Stack
Next.js 15
React
NextAuth v5
MySQL
Node.js
New & Improved Features
Improved authentication flow
Better handling of questions and answers
Enhanced voting system
Cleaner UI and improved responsiveness
More structured backend logic
Input validation and basic error handling
Core Features
User registration and login
Create and manage topics
Ask and answer questions
Vote on content
Organized discussion system
Getting Started

# Clone the repository and install dependencies:

git clone <your-repo-link>
cd qa-app-part2
npm install

# Set up environment variables:

DATABASE_URL=your_mysql_connection
NEXTAUTH_SECRET=your_secret_key

# Run the app:

npm run dev

Open http://localhost:3000
 in your browser.

# Project Structure
/app – routes and pages (Next.js App Router)
/components – UI components
/lib – database logic and utilities
/api – backend endpoints
# What Changed from Part 1
Codebase is more organized and easier to maintain
Improved user interaction (voting, navigation)
Better validation and error feedback
UI improvements for a smoother experience
QA Notes
Testing

# Manual testing was done focusing on:

Authentication flow
Posting and updating content
Voting behavior
Navigation and UI consistency
Observations
Application is more stable compared to Part 1
User experience is smoother and more intuitive
Future Improvements
Add role-based access (admin/user)
Implement search and filters
Add comments or replies to answers
Introduce automated tests
