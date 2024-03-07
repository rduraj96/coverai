"use client";
import "filepond/dist/filepond.min.css";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import { ReloadIcon } from "@radix-ui/react-icons";

export default function FileUpload() {
  const [improvedText, setImprovedText] = useState<string>("");
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
    const formData = new FormData();
    formData.append("file", resume as File);
    formData.append("description", description);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      // console.log(await response.text());
      const data = await response.json();
      setImprovedText(data.text);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const replaceWithBr = () => improvedText.replace(/\n/g, "<br />");

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
        <p dangerouslySetInnerHTML={{ __html: replaceWithBr() }} />
        {error && <p className="text-red-400 font-bold">{error}</p>}
      </div>
    </div>
  );
}
