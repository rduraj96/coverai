import jsPDF from "jspdf";

export const parseCoverLetterResponse = (
  response: string
): CoverLetterSections => {
  const labelMap: { [key: string]: keyof CoverLetterSections } = {
    "Applicant Details": "details",
    Date: "date",
    Greeting: "greetings",
    Body: "body",
    Closing: "closing",
  };

  const sections: CoverLetterSections = {
    details: "",
    date: getCurrentFormattedDate(),
    greetings: "",
    body: "",
    closing: "",
  };

  let currentLabel: keyof CoverLetterSections | null = null;
  const sectionHeaderRegex = /^(Applicant Details|Date|Greeting|Body|Closing):/;
  response.split("\n").forEach((line) => {
    const match = line.match(sectionHeaderRegex);
    if (match) {
      const label = match[1];
      const key = labelMap[label];
      if (key) {
        sections[key] = line.substring(label.length + 2).trim();
        currentLabel = key;
      }
    } else if (currentLabel) {
      sections[currentLabel] +=
        (sections[currentLabel].length > 0 ? "\n" : "") + line;
    }
  });

  console.log(sections);
  return sections;
};

export const getCurrentFormattedDate = (): string => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
};

export function downloadPDF(response: string) {
  const doc = new jsPDF();
  const sections = parseCoverLetterResponse(response);

  // Initial document formatting
  doc.setFont("helvetica");
  doc.setFontSize(12);
  let posY = 20;

  const addSectionText = (
    text: string,
    posY: number,
    indent: number = 20
  ): number => {
    if (!text) return posY;

    const lineHeight = 6;
    const lines = doc.splitTextToSize(text, 170);
    lines.forEach((line: string) => {
      if (posY > 280) {
        doc.addPage();
        posY = 20;
      }
      doc.text(line, indent, posY);
      posY += lineHeight;
    });
    return posY + 4;
  };

  // Sections rendering
  posY = addSectionText(sections.details, posY) + 6;
  posY = addSectionText(getCurrentFormattedDate(), posY) + 6;
  posY = addSectionText(sections.greetings, posY, 20) + 4;
  posY = addSectionText(sections.body, posY, 20) + 6;
  posY = addSectionText(sections.closing, posY, 20) + 10;

  doc.save("ProfessionalCoverLetter.pdf");
}
