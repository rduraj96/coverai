import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

export async function POST(req: NextRequest) {
  const { resume: base64EncodedFile, description } = await req.json();

  if (!base64EncodedFile) {
    return new NextResponse(JSON.stringify({ error: "No files uploaded." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fileBuffer = Buffer.from(
    base64EncodedFile.split("base64,")[1],
    "base64"
  );

  try {
    const parsedData = await pdfParse(fileBuffer);
    const parsedText = parsedData.text;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content:
            "Write a cover letter for the job description below using references from my resume:\n" +
            parsedText +
            "\nJob Description:\n" +
            description +
            "\nPlease format the cover letter with labeled sections: Applicant Details, Date, Greeting, Body, and Closing.",
        },
      ],
      max_tokens: 1000,
    });

    return new NextResponse(
      JSON.stringify({ text: response.choices[0].message.content }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error during PDF parsing or processing:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to process the PDF file." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
