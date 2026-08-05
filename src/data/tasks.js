export const tasks = [
  {
    id: 1,
    title: "Consumer Electronics Feedback",
    category: "Survey",
    reward: "$2.50",
    time: "10 mins",
    description: "Share your thoughts on the latest smartphone features and design.",
    platform: "TechInsights",
    difficulty: "Easy",
    questions: [
      { type: "select", prompt: "Which primary smartphone brand do you currently use?", options: ["Apple (iPhone)", "Samsung Galaxy", "Google Pixel", "Xiaomi / Redmi", "Other"] },
      { type: "select", prompt: "How would you rate the battery life of your current device?", options: ["Excellent (2+ days)", "Good (1.5 days)", "Average (Full day)", "Poor (Needs mid-day charge)"] },
      { type: "text", prompt: "What is the most important feature to you in your next purchase?" }
    ]
  },
  {
    id: 2,
    title: "Eco-Friendly Packaging Review",
    category: "Writing",
    reward: "$5.00",
    time: "20 mins",
    description: "Write a short review based on images of sustainable packaging solutions.",
    platform: "GreenEarth",
    difficulty: "Medium",
    questions: [
      { type: "select", prompt: "Look at the image of the bamboo packaging. How appealing is the design?", options: ["Very Appealing", "Somewhat Appealing", "Neutral", "Not Appealing"] },
      { type: "select", prompt: "Would you pay a 5% premium for products using this packaging?", options: ["Definitely", "Probably", "Not Sure", "Definitely Not"] },
      { type: "text", prompt: "Write a 50-word review explaining your feelings on this aesthetic." }
    ]
  },
  {
    id: 3,
    title: "Audio Transcription: Customer Support",
    category: "Transcription",
    reward: "$8.00",
    time: "15 mins",
    description: "Transcribe short audio clips from customer service interactions.",
    platform: "VoiceData",
    difficulty: "Hard",
    questions: [
      { type: "text", prompt: "Please transcribe the audio clip starting at 0:00: 'Thank you for calling support...'" },
      { type: "select", prompt: "What was the customer's main issue?", options: ["Billing Query", "Technical Support", "Account Cancellation", "General Inquiry"] },
      { type: "select", prompt: "Did the agent resolve the issue within this clip?", options: ["Yes, fully resolved", "Partial resolution provided", "No resolution yet"] }
    ]
  },
  {
    id: 4,
    title: "Street View Object Identification",
    category: "Data Labeling",
    reward: "$1.20",
    time: "5 mins",
    description: "Identify and label traffic signs in provided street images.",
    platform: "MapMaster",
    difficulty: "Easy",
    questions: [
      { type: "select", prompt: "How many STOP signs are visible in the provided image (Image A)?", options: ["0", "1", "2", "3 or more"] },
      { type: "select", prompt: "Are there any pedestrian crossing signs visible?", options: ["Yes, clearly visible", "Yes, partially obscured", "No"] },
      { type: "text", prompt: "Describe any anomalies or unclear objects near the intersection." }
    ]
  },
  {
    id: 5,
    title: "Brand Perception Research",
    category: "Survey",
    reward: "$3.75",
    time: "12 mins",
    description: "Evaluate the visual identity of leading global brands.",
    platform: "BrandWatch",
    difficulty: "Medium",
    questions: [
      { type: "select", prompt: "When you see the Nike logo, what emotion do you associate it with most?", options: ["Motivation/Energy", "Premium/Luxury", "Nostalgia", "Indifference"] },
      { type: "select", prompt: "How often do you purchase athletic wear?", options: ["Weekly", "Monthly", "Few times a year", "Rarely"] },
      { type: "text", prompt: "What phrase or slogan comes to mind first for Nike?" }
    ]
  },
  {
    id: 6,
    title: "Creative Storytelling Draft",
    category: "Writing",
    reward: "$12.00",
    time: "45 mins",
    description: "Create a 500-word story based on a specific set of prompts.",
    platform: "WriterHub",
    difficulty: "Hard",
    questions: [
      { type: "select", prompt: "Select your preferred genre for the prompt:", options: ["Sci-Fi Mystery", "Historical Fiction", "Modern Romance", "Fantasy"] },
      { type: "text", prompt: "Write the opening paragraph (approx 50 words) introducing your protagonist." },
      { type: "text", prompt: "Write the rest of your story draft based on the prompt." }
    ]
  },
  {
    id: 7,
    title: "Medical Record Digitization",
    category: "Transcription",
    reward: "$15.00",
    time: "30 mins",
    description: "Handwritten medical note transcription for digital records.",
    platform: "HealthData",
    difficulty: "Hard",
    questions: [
      { type: "select", prompt: "Is the handwriting in Document 1 legible?", options: ["Fully Legible", "Partially Legible", "Hard to Read", "Illegible"] },
      { type: "text", prompt: "Transcribe the doctor's notes under the 'Diagnosis' section." },
      { type: "text", prompt: "Transcribe the prescribed medication list." }
    ]
  },
  {
    id: 8,
    title: "Pedestrian Movement Tracking",
    category: "Data Labeling",
    reward: "$2.10",
    time: "8 mins",
    description: "Draw bounding boxes around pedestrians in video frames.",
    platform: "VisionAI",
    difficulty: "Medium",
    questions: [
      { type: "select", prompt: "In Frame 14, how many pedestrians are crossing outside the crosswalk?", options: ["0", "1", "2-3", "4 or more"] },
      { type: "select", prompt: "Are any pedestrians pushing objects (strollers, carts)?", options: ["Yes", "No"] },
      { type: "text", prompt: "Note any obscured pedestrians in the corner frame." }
    ]
  },
  {
    id: 9,
    title: "Work-Life Balance Study",
    category: "Survey",
    reward: "$1.50",
    time: "15 mins",
    description: "How has remote work affected your daily routine?",
    platform: "LifeMetrics",
    difficulty: "Easy",
    questions: [
      { type: "select", prompt: "How many days a week do you work from home?", options: ["0 (Fully in-office)", "1-2 days", "3-4 days", "5 days (Fully remote)"] },
      { type: "select", prompt: "Has your productivity increased or decreased?", options: ["Significantly Increased", "Slightly Increased", "No Change", "Decreased"] },
      { type: "text", prompt: "What is your biggest challenge with your current work arrangement?" }
    ]
  },
  {
    id: 10,
    title: "Product Description Optimization",
    category: "Writing",
    reward: "$4.50",
    time: "15 mins",
    description: "Enhance product descriptions for better SEO performance.",
    platform: "ShopSmart",
    difficulty: "Medium",
    questions: [
      { type: "select", prompt: "Which title is better optimized for SEO (Coffee Maker)?", options: ["Brewing Machine Fast", "Stainless Steel Programmable 12-Cup Coffee Maker", "Best Coffee Pot 2024", "Coffee Maker Black"] },
      { type: "text", prompt: "Write a 3-bullet point feature list for this coffee maker." },
      { type: "text", prompt: "Write a catchy 50-word product description including keywords 'drip coffee, automated, hot'." }
    ]
  },
  {
    id: 11,
    title: "Multi-speaker Meeting Transcription",
    category: "Transcription",
    reward: "$20.00",
    time: "40 mins",
    description: "Transcribe a recorded business meeting with 3+ participants.",
    platform: "ProScribe",
    difficulty: "Hard",
    questions: [
      { type: "text", prompt: "Identify the speakers in the first 2 minutes (e.g., Speaker 1: John, Speaker 2: Sarah)." },
      { type: "text", prompt: "Transcribe the project timeline discussion from 04:30 to 06:15." },
      { type: "select", prompt: "Was the tone of the meeting generally collaborative or contentious?", options: ["Very Collaborative", "Neutral", "Somewhat Contentious", "Very Contentious"] }
    ]
  },
  {
    id: 12,
    title: "Autonomous Vehicle Obstacle Detection",
    category: "Data Labeling",
    reward: "$3.50",
    time: "10 mins",
    description: "Categorize obstacles in night-vision camera feeds.",
    platform: "DriveAI",
    difficulty: "Hard",
    questions: [
      { type: "select", prompt: "What is the primary obstacle crossing the street in Video Clip B?", options: ["Pedestrian", "Animal (Deer/Dog)", "Another Vehicle", "Debris"] },
      { type: "select", prompt: "Is the obstacle moving away or towards the camera vehicle?", options: ["Moving Away", "Moving Towards", "Crossing Laterally", "Stationary"] },
      { type: "text", prompt: "Estimate the distance of the obstacle in meters based on the reference grid." }
    ]
  },
  {
    id: 13,
    title: "Vacation Habits Survey",
    category: "Survey",
    reward: "$2.00",
    time: "8 mins",
    description: "Tell us about your favorite travel destinations and budget.",
    platform: "TravelPulse",
    difficulty: "Easy",
    questions: [
      { type: "select", prompt: "What type of vacation do you prefer?", options: ["Beach Resort", "City Exploration", "Nature/Hiking", "Cruise"] },
      { type: "select", prompt: "What is your typical budget per person for a 1-week trip?", options: ["Under $500", "$500 - $1000", "$1000 - $2500", "Over $2500"] },
      { type: "text", prompt: "What is your next dream vacation destination and why?" }
    ]
  },
  {
    id: 14,
    title: "Real Estate Property Descriptions",
    category: "Writing",
    reward: "$6.00",
    time: "20 mins",
    description: "Write compelling descriptions for high-end residential listings.",
    platform: "EstateView",
    difficulty: "Medium",
    questions: [
      { type: "select", prompt: "Which headline is more engaging for a Penthouse?", options: ["Apartment on Top Floor", "Luxury Penthouse with Panoramic City Views", "3 Bed 2 Bath Available Now", "High Rise Condo"] },
      { type: "text", prompt: "Write a short paragraph describing the living room based on the provided photos." },
      { type: "text", prompt: "Write a closing paragraph highlighting the neighborhood amenities." }
    ]
  },
  {
    id: 15,
    title: "Legal Document Summarization",
    category: "Writing",
    reward: "$25.00",
    time: "60 mins",
    description: "Summarize complex legal clauses into plain English.",
    platform: "LegalEase",
    difficulty: "Hard",
    questions: [
      { type: "text", prompt: "Summarize Section 2 (Termination of Agreement) in 3 bullet points." },
      { type: "text", prompt: "Explain the liability clause (Section 4.1) in simple terms." },
      { type: "select", prompt: "Is there a non-compete clause mentioned in this text?", options: ["Yes, for 1 year", "Yes, for 2 years", "No", "Unclear"] }
    ]
  },
  {
    id: 16,
    title: "Satellite Imagery Analysis",
    category: "Data Labeling",
    reward: "$5.00",
    time: "15 mins",
    description: "Identify building footprints in high-resolution satellite shots.",
    platform: "GeoData",
    difficulty: "Hard",
    questions: [
      { type: "select", prompt: "How many structures are visible in Sector 7G?", options: ["0-5", "6-15", "16-30", "30+"] },
      { type: "select", prompt: "Are there clear roads connecting these structures?", options: ["Yes, paved", "Yes, unpaved", "No visible access roads"] },
      { type: "text", prompt: "Describe the terrain surrounding the settlement." }
    ]
  },
  {
    id: 17,
    title: "Gaming Behavior Survey",
    category: "Survey",
    reward: "$3.20",
    time: "12 mins",
    description: "Focusing on micro-transaction habits in mobile gaming.",
    platform: "GameRef",
    difficulty: "Medium",
    questions: [
      { type: "select", prompt: "Have you ever made an in-app purchase in a mobile game?", options: ["Yes, frequently", "Yes, rarely", "No, never"] },
      { type: "select", prompt: "What do you usually purchase?", options: ["Cosmetics/Skins", "Extra Lives/Time", "Unlocking Levels", "I don't make purchases"] },
      { type: "text", prompt: "What is your opinion on 'Pay-to-Win' mechanics?" }
    ]
  },
  {
    id: 18,
    title: "Technical Manual Proofreading",
    category: "Writing",
    reward: "$18.00",
    time: "50 mins",
    description: "Review and fix errors in industrial equipment manuals.",
    platform: "TechDocs",
    difficulty: "Hard",
    questions: [
      { type: "text", prompt: "Rewrite Step 4 to fix grammatical errors and improve clarity." },
      { type: "select", prompt: "Does the safety warning box use the correct hazard symbol?", options: ["Yes", "No, it should be Flammable", "No, it should be Toxic", "Unclear"] },
      { type: "text", prompt: "Provide a summary of the maintenance schedule." }
    ]
  },
  {
    id: 19,
    title: "Foreign Language Audio Extraction",
    category: "Transcription",
    reward: "$30.00",
    time: "25 mins",
    description: "Extract specific phrases from Spanish audio recordings.",
    platform: "LingoWorks",
    difficulty: "Hard",
    questions: [
      { type: "text", prompt: "Transcribe the greeting phrase used at 0:15 (in Spanish)." },
      { type: "select", prompt: "What dialect or accent is predominantly used?", options: ["Castilian (Spain)", "Mexican Spanish", "Argentinian Spanish", "Other/Unsure"] },
      { type: "text", prompt: "Provide an English translation summary of the main request." }
    ]
  },
  {
    id: 20,
    title: "Retail Shelf Inventory Check",
    category: "Data Labeling",
    reward: "$1.80",
    time: "6 mins",
    description: "Count missing items on supermarket shelf photos.",
    platform: "ShelfLogic",
    difficulty: "Easy",
    questions: [
      { type: "select", prompt: "How many empty slots are on the top shelf?", options: ["0", "1", "2-3", "More than 3"] },
      { type: "select", prompt: "Is the pricing label visible for the 'Brand X' cereal?", options: ["Yes", "No", "Partially blocked"] },
      { type: "text", prompt: "Note any misplaced items in this aisle section." }
    ]
  },
  {
    id: 21,
    title: "AI Chatbot Sentiment Analysis",
    category: "Micro-task",
    reward: "$0.50",
    time: "2 mins",
    description: "Categorize the tone of AI responses as helpful or repetitive.",
    platform: "AIChat",
    difficulty: "Easy",
    questions: [
      { type: "select", prompt: "How would you rate the tone of the chatbot's response?", options: ["Very Helpful/Polite", "Neutral", "Repetitive/Frustrating", "Confusing"] },
      { type: "select", prompt: "Did the chatbot answer the user's specific question?", options: ["Yes, completely", "Partially", "No, it missed the point"] },
      { type: "text", prompt: "Suggest one way to improve this specific response." }
    ]
  },
  {
    id: 22,
    title: "Social Media Trend Analysis",
    category: "Survey",
    reward: "$4.00",
    time: "15 mins",
    description: "Rank currently trending topics by personal relevance.",
    platform: "SocialPulse",
    difficulty: "Medium",
    questions: [
      { type: "select", prompt: "Which social media platform do you use most for news?", options: ["Twitter / X", "TikTok", "Instagram", "Reddit", "Facebook"] },
      { type: "select", prompt: "How credible do you find influencer-sponsored content?", options: ["Very Credible", "Somewhat Credible", "Rarely Credible", "Not Credible At All"] },
      { type: "text", prompt: "What was the last trending topic that caught your attention?" }
    ]
  }
];
