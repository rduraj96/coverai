import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const formData: FormData = await req.formData();
  const uploadedFiles = formData.getAll("file");
  const description = formData.getAll("description");

  if (uploadedFiles && uploadedFiles.length > 0) {
    const uploadedFile = uploadedFiles[0];

    if (uploadedFile instanceof File) {
      const fileName = uuidv4();
      const tempFilePath = `/tmp/${fileName}.pdf`;
      const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
      await fs.writeFile(tempFilePath, fileBuffer);

      const parsedText = await new Promise<string>((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);

        pdfParser.on("pdfParser_dataError", (errData) => reject(errData));
        pdfParser.on("pdfParser_dataReady", () => {
          const text = (pdfParser as any).getRawTextContent();
          resolve(text);
        });

        pdfParser.loadPDF(tempFilePath);
      });

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
              description[0],
          },
        ],
        max_tokens: 1000,
      });

      // await fs.unlink(tempFilePath);

      return new NextResponse(
        JSON.stringify({ text: response.choices[0].message.content }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  return new NextResponse(
    JSON.stringify({ error: "No text found or improvement failed." }),
    {
      headers: { "Content-Type": "application/json" },
      status: 400,
    }
  );
}
