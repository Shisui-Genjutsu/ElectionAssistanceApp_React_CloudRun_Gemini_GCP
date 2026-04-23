import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.VITE_GOOGLE_GEMINI_API_KEY);

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Please analyze these screenshots of a web application's UI carefully. The user wants me to update the 'chat' and 'tabs contents after chat' to match exactly what is shown in these images. Provide an EXTREMELY DETAILED technical breakdown of the UI/UX. What does the chat page look like? What do the other tabs (like Booth & Status, Key Dates, Rescue, etc.) look like? Describe the colors, layouts, typography, paddings, margins, shadows, input fields, message bubbles, headers, etc. Provide enough detail so a frontend developer can replicate it perfectly.";

  const imageParts = [
    fileToGenerativePart("/private/var/folders/jz/l2bxc2td6wjc_6440jdqnq8w0000gp/T/TemporaryItems/NSIRD_screencaptureui_C8GM8A/Screenshot 2026-04-23 at 5.01.37\u202FPM.png", "image/png"),
    fileToGenerativePart("/private/var/folders/jz/l2bxc2td6wjc_6440jdqnq8w0000gp/T/TemporaryItems/NSIRD_screencaptureui_822EOr/Screenshot 2026-04-23 at 5.02.00\u202FPM.png", "image/png"),
    fileToGenerativePart("/private/var/folders/jz/l2bxc2td6wjc_6440jdqnq8w0000gp/T/TemporaryItems/NSIRD_screencaptureui_S6COiZ/Screenshot 2026-04-23 at 5.02.18\u202FPM.png", "image/png"),
    fileToGenerativePart("/private/var/folders/jz/l2bxc2td6wjc_6440jdqnq8w0000gp/T/TemporaryItems/NSIRD_screencaptureui_2io23b/Screenshot 2026-04-23 at 5.02.30\u202FPM.png", "image/png")
  ];

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    console.log(response.text());
  } catch (e) {
    console.error(e);
  }
}

run();
