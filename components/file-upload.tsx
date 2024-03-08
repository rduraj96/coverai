"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import { ReloadIcon } from "@radix-ui/react-icons";
import { downloadPDF, parseCoverLetterResponse } from "@/utils/downloadPDF";

export default function FileUpload() {
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [sections, setSections] = useState<CoverLetterSections>();
  const [description, setDescription] = useState<string>("");
  const [resume, setResume] = useState<File>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleUpload = async () => {
    if (!resume) {
      setError("Please upload a resume before generating.");
      return;
    }

    setLoading(true);
    setError("");

    const reader = new FileReader();
    reader.readAsDataURL(resume);
    reader.onload = async () => {
      const base64String = reader.result;
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume: base64String,
            description: description,
          }),
        });
        if (!response.ok) {
          throw new Error(
            "Failed to upload. Server responded with " + response.status
          );
        }
        const data = await response.json();
        setCoverLetter(data.text);
        const parsedSections = parseCoverLetterResponse(data.text);
        console.log("Parsed sections:" + parsedSections);
        setSections(parsedSections);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to generate improved text. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      setError("Failed to read the file.");
      setLoading(false);
    };
  };

  const replaceWithBr = (text: string) => text.replace(/\n/g, "<br />");

  // const sections = parseCoverLetterResponse(coverLetter);

  return (
    <div className="w-2/3 space-y-5 mt-5">
      <Input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          let files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            setResume(files[0]);
          }
        }}
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Job Description"
        className="h-32"
      />
      <div className="w-full flex justify-center">
        {loading ? (
          <Button disabled size={"lg"}>
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            Generating
          </Button>
        ) : (
          <Button onClick={handleUpload} size={"lg"}>
            Generate
          </Button>
        )}
      </div>
      <div className="">
        {/* <p
          dangerouslySetInnerHTML={{
            __html: replaceWithBr(coverLetter),
          }}
        /> */}
        {sections && (
          <div>
            <p
              dangerouslySetInnerHTML={{
                __html: replaceWithBr(sections.details),
              }}
            />
            <br></br>
            <p
              dangerouslySetInnerHTML={{ __html: replaceWithBr(sections.date) }}
            />
            <br></br>
            <p
              dangerouslySetInnerHTML={{
                __html: replaceWithBr(sections.greetings),
              }}
            />
            <br></br>
            <p
              dangerouslySetInnerHTML={{ __html: replaceWithBr(sections.body) }}
            />
            <br></br>
            <p
              dangerouslySetInnerHTML={{
                __html: replaceWithBr(sections.closing),
              }}
            />
          </div>
        )}

        {coverLetter && (
          <div className="w-full flex items-center justify-center mt-4">
            <Button onClick={() => downloadPDF(coverLetter)} size={"lg"}>
              {" "}
              Download PDF
            </Button>
          </div>
        )}
        {error && <p className="text-red-400 font-bold">{error}</p>}
      </div>
    </div>
  );
}
