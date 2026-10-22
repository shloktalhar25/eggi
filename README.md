# FormAgent AI — Intelligent Document Extraction & Browser Automation

An AI coworker web application that automates document intake, field validation with human-in-the-loop clarification, and live browser form autofill.

## 🚀 Features

- **Document Extraction (Step 1)**: Extracts structured fields from uploaded PDF documents (candidate name, DOB, contact details, academic scores, etc.).
- **Human-in-the-Loop Validation (Step 2)**: Checks for missing or invalid values (e.g. 9-digit phone number instead of 10) and prompts the user only for unclear data.
- **Workflow Step Cards**: 2x3 interactive visual progress grid showing live status of each stage.
- **AI Coworker Chat Interface**: Conversational panel allowing users to give natural language instructions or review parameters before launching the portal.
- **Live Split-Screen Browser Automation (Steps 3–6)**: Spawns the target admission portal and simulates agent form-filling in real time with animated typing, field verification badges, and final submission.

## 📁 Project Structure

```
├── index.html     # Split-screen UI, step grid, and browser frame
├── styles.css     # Clean, professional white theme CSS
├── app.js         # Automation pipeline, chat logic, and form filling engine
└── README.md      # Project documentation
```

## 💻 How to Run

Simply open `index.html` in any web browser.
Click **"Continue in browser"** to watch the autonomous form filling pipeline in action!
