# JourneyHub

JourneyHub is an AI-powered travel planning web application that generates
a complete day-by-day itinerary based on your destination, travel dates,
budget, and interests. It is built to remove the usual clutter from trip
planning and give you a clear, usable plan in seconds.

## What It Does

You enter a destination, select your travel dates, set a daily budget,
and choose your interests. The app sends that information to an AI model
which returns a structured itinerary with activities, hotels, and cost
estimates for each day.

The itinerary is displayed alongside an interactive map that plots all
the key stops from your plan. Each location on the map includes a direct
link to open it in Google Maps. Trips can be saved locally and revisited
from the Saved Trips page. The plan can also be exported as a PDF.

## Features

- AI-generated day-by-day itinerary with activities, hotels, and budgets
- Interactive map view with all stops plotted and linked to Google Maps
- Save trips locally and access them from the Saved Trips page
- Export your itinerary as a PDF
- Light and dark theme support
- Fully responsive across mobile, tablet, and desktop

## Tech Stack

- React with Vite
- Tailwind CSS
- React Router
- Groq API (llama-3.3-70b-versatile) for AI itinerary generation
- Leaflet for interactive maps
- Vercel for deployment and serverless API routes

## Live Demo

[https://journeyhub-planner.vercel.app](https://journeyhub-planner.vercel.app)
