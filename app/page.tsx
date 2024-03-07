import { ModeToggle } from "@/components/ModeToggle";
import Navbar from "@/components/Navbar";
import FileUpload from "@/components/file-upload";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-12 lg:p-24 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] ">
      {/* <ModeToggle /> */}
      <Navbar />
      <FileUpload />
    </main>
  );
}
