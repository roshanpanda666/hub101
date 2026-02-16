# 🎓 CPGS Hub

> **Empowering Students with Intelligence & Resources.**
> A modern, AI-integrated platform for managing campus resources, routines, and student interactions for CPGS.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8) ![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)

---

## 🌟 Key Features

- **🔐 Robust Authentication**: Secure login/signup system with role-based access (Student, Admin, Developer, CR, HOD).
- **🤖 AI Integration**: Built-in **Gemini AI** assistant for answering queries and analyzing uploaded content.
- **📚 Resource Hub**: Upload, browse, and manage study materials categorized by branch (CSE, ABM, BI).
- **📅 Routine Management**: Dynamic class routine viewer and creator.
- **🎨 Modern UI/UX**: Fully responsive design with **Dark/Light mode** toggle and glassmorphism aesthetics.
- **🛡️ Admin Dashboard**: Dedicated panel for managing users and resources.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT & Bcrypt
- **AI Model**: Google Generative AI (Gemini)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/cpgs-hub.git
cd cpgs-hub/hub101
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory (`hub101/`) and add the following variables:

```env
# MongoDB Connection String
CONNECTIONURI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appname>

# Google Gemini API Key
GEMINI_KEY=your_gemini_api_key_here

# JWT Secret for Authentication
JWT_SECRET=your_secure_jwt_secret
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
hub101/
├── app/                # Application routes (Next.js App Router)
│   ├── api/            # API routes (Auth, Admin, Upload, Chat)
│   ├── admin/          # Admin dashboard pages
│   ├── (auth)/         # Auth pages (Login, Register)
│   ├── browse/         # Resource browsing
│   └── ...
├── components/         # Reusable UI components
├── lib/                # Utility functions (dbConnect, generic utils)
├── models/             # Mongoose database models (User, File, etc.)
├── context/            # React Context (AuthContext)
└── public/             # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Made with ❤️ by **Sabyasachi Panda**
