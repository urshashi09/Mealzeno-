# 🍳 MealZeno: AI-Powered Culinary Assistant

MealZeno is a sophisticated, full-stack web application designed to eliminate kitchen indecision and food waste. By leveraging state-of-the-art Generative AI, MealZeno transforms your existing pantry inventory into personalized, delicious recipes, while helping you organize your culinary life through smart meal planning and automated shopping lists.



## ✨ Key Features

### 🤖 AI Recipe Generation
*   **Intelligent Transformation**: Turn any combination of ingredients into chef-quality recipes.
*   **Dual-Model Reliability**: Powered by **Google Gemini** with an automatic fallback to **Groq (Llama 3)** to ensure 99.9% availability.
*   **Specific Pantry Inclusion**: Select specific items you *must* use, and let the AI find the perfect companion ingredients.
*   **Chef's Secrets**: Every recipe comes with pro cooking tips and nutritional insights.

### 📅 Smart Meal Planner
*   **Weekly Scheduling**: Interactive calendar to plan breakfast, lunch, and dinner.
*   **Custom Meals**: Add restaurant nights or quick favorites alongside AI generated recipes into your calender.
*   **Nutrition Tracking**: Monitor your weekly culinary balance at a glance.

### 📦 Pantry & Inventory Management
*   **Real-time Tracking**: Keep a digital record of what's in your kitchen. Get warnings based on items expiring or items running low.
*   **Smart Suggestions**: Get recipe ideas based specifically on what's in your pantry right now. 

### 🛒 Automated Shopping Lists
*   **One-Click Generation**: Generate beautifully formatted PDFs of your shopping items in one click.
*   **Sync Across Devices**: Access your list on your phone while at the grocery store.

### 👤 Smart User Profiles & Preferences
*   **Personalized Culinary Profile**: Set your dietary preferences (Vegetarian, Vegan, Keto, etc.) and favorite cuisines to influence every AI generation.
*   **Safety First (Allergy Protection)**: Define your allergies once, and MealZeno will automatically ensure all generated recipes are safe for you and your family.
*   **Measurement Sync**: Choose between Metric and Imperial units, which are reflected across all recipes and the shopping list.

---

## 🛠️ Tech Stack

**Frontend:**
*   React 18 + Vite
*   Custom CSS Utility System (Material Design 3 tokens)
*   Lucide React & Material Symbols for iconography
*   React Router for seamless navigation
*   React Hot Toast for intuitive feedback

**Backend:**
*   Node.js & Express.js (ES Modules)
*   PostgreSQL with Sequelize ORM
*   JWT (JSON Web Tokens) for secure authentication
*   Express Rate Limit for API security

**AI Infrastructure:**
*   Google Generative AI (Gemini 1.5 Pro/Flash)
*   Groq Cloud (Llama 3 70B)
*   Custom prompt engineering for structured JSON recipes

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   PostgreSQL database
*   API keys for Gemini and/or Groq

### Installation

1.  **Clone the repository**
    ```bash
    git clone (https://github.com/urshashi09/Mealzeno-.git)
    cd mealzeno
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` folder:
    ```env
    PORT=3000
    DATABASE_URL=postgresql://your_user:your_password@your_host/neondb
    JWT_SECRET=your_super_secret_key
    GEMINI_API_KEY=your_gemini_key
    GROQ_API_KEY=your_groq_key
    ```
    Run migrations:
    ```bash
    node migrate.js
    ```

3.  **Frontend Setup**
    ```bash
    cd ../frontend
    npm install
    ```
    Create a `.env` file in the `frontend` folder:
    ```env
    VITE_API_URL=http://localhost:3000/api
    ```

### Running the App

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

## 🛡️ API Security & Rate Limiting

To ensure fair usage and protect AI quotas, the recipe generation endpoint is rate-limited:
*   **Limit**: 5 requests per minute per user.
*   **Protection**: Prevents rapid-fire API calls and automated scraping.

---

## 🙌 Acknowledgments

*   Design inspired by Material Design 3 and modern culinary apps.
*   AI capabilities powered by Google DeepMind and Meta AI via Groq.
*   Icons from [Lucide](https://lucide.dev/) and [Google Fonts](https://fonts.google.com/icons).
