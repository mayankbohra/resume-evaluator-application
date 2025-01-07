import os
from markdown_pdf import MarkdownPdf

class ResumeGenerator:
    def __init__(self):
        self.pdf = MarkdownPdf(toc_level=2)

    def generate_pdf(self, markdown_content, output_path='output/improved_resume.pdf'):
        try:
            # Ensure the output directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            # Add the markdown content as a section
            from markdown_pdf import Section
            self.pdf.add_section(Section(markdown_content))

            # Set PDF metadata
            self.pdf.meta["title"] = "Improved Resume"
            self.pdf.meta["author"] = "Resume Analyzer"

            # Save to file
            self.pdf.save(output_path)
            return True
        except Exception as e:
            print(f"Error generating PDF: {str(e)}")
            return False
