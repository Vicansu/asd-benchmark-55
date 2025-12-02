import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface PDFUploaderProps {
  testId: string;
  onPDFsChange?: (pdfs: {
    practice_pdf_url?: string;
    easy_pdf_url?: string;
    medium_pdf_url?: string;
    hard_pdf_url?: string;
    practice_question_count?: number;
    easy_question_count?: number;
    medium_question_count?: number;
    hard_question_count?: number;
  }) => void;
}

export const PDFUploader = ({ testId, onPDFsChange }: PDFUploaderProps) => {
  const { uploadPDF, uploading } = useFileUpload();
  const { toast } = useToast();

  const [pdfs, setPdfs] = useState({
    practice_pdf_url: '',
    easy_pdf_url: '',
    medium_pdf_url: '',
    hard_pdf_url: '',
    practice_question_count: 0,
    easy_question_count: 0,
    medium_question_count: 0,
    hard_question_count: 0,
  });

  const [currentPdfView, setCurrentPdfView] = useState<string>('');

  const handlePDFUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'practice' | 'easy' | 'medium' | 'hard'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast({ title: 'Error', description: 'Please upload a PDF file', variant: 'destructive' });
      return;
    }

    const url = await uploadPDF(file, testId, type);
    if (url) {
      const newPdfs = { ...pdfs, [`${type}_pdf_url`]: url };
      setPdfs(newPdfs);
      onPDFsChange?.(newPdfs);
      toast({ title: 'Success', description: `${type} PDF uploaded successfully` });
    }
  };

  const handleQuestionCountChange = (type: string, value: number) => {
    const newPdfs = { ...pdfs, [`${type}_question_count`]: value };
    setPdfs(newPdfs);
    onPDFsChange?.(newPdfs);
  };

  const renderPDFUploadSection = (
    type: 'practice' | 'easy' | 'medium' | 'hard',
    label: string,
    color: string
  ) => {
    const pdfUrl = pdfs[`${type}_pdf_url` as keyof typeof pdfs] as string;
    const questionCount = pdfs[`${type}_question_count` as keyof typeof pdfs] as number;

    return (
      <Card className={`p-5 border-2 ${pdfUrl ? 'border-success' : 'border-border'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center`}>
              <FileText className="h-4 w-4" />
            </div>
            <h4 className="font-semibold">{label} PDF</h4>
          </div>
          {pdfUrl && <span className="text-xs text-success">✓ Uploaded</span>}
        </div>

        <div className="space-y-3">
          <input
            type="file"
            id={`${type}-pdf`}
            accept="application/pdf"
            onChange={(e) => handlePDFUpload(e, type)}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById(`${type}-pdf`)?.click()}
            disabled={uploading}
            className="w-full rounded-xl"
          >
            <Upload className="h-4 w-4 mr-2" />
            {pdfUrl ? 'Replace PDF' : 'Upload PDF'}
          </Button>

          {pdfUrl && (
            <>
              <Button
                variant="outline"
                onClick={() => setCurrentPdfView(pdfUrl)}
                className="w-full rounded-xl"
              >
                View PDF
              </Button>

              <div className="space-y-2">
                <Label className="text-xs">Number of Questions</Label>
                <Input
                  type="number"
                  value={questionCount || ''}
                  onChange={(e) => handleQuestionCountChange(type, parseInt(e.target.value) || 0)}
                  placeholder="e.g., 10"
                  min={0}
                  max={100}
                  className="input-glassy"
                />
              </div>
            </>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="cloud-bubble p-6">
        <h3 className="text-xl font-semibold mb-2">PDF Question Sets</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Upload PDFs for different difficulty levels. The system will display these to students based on their practice performance.
        </p>

        <div className="space-y-4">
          {/* Practice PDF */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-lg">Practice Questions</h4>
            {renderPDFUploadSection('practice', 'Practice Set', 'bg-accent/20')}
          </div>

          {/* Main Test PDFs */}
          <div>
            <h4 className="font-semibold mb-3 text-lg">Main Test PDFs</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Students will be assigned one of these based on practice score
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {renderPDFUploadSection('easy', 'Easy', 'bg-success/10')}
              {renderPDFUploadSection('medium', 'Medium', 'bg-warning/10')}
              {renderPDFUploadSection('hard', 'Hard', 'bg-destructive/10')}
            </div>
          </div>
        </div>
      </Card>

      {/* PDF Viewer */}
      {currentPdfView && (
        <Card className="cloud-bubble p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">PDF Preview (Display Only)</h3>
            <Button
              variant="outline"
              onClick={() => setCurrentPdfView('')}
              className="rounded-xl"
            >
              Close Preview
            </Button>
          </div>
          <div className="border border-border rounded-xl overflow-hidden">
            <iframe
              src={currentPdfView}
              className="w-full h-[600px]"
              title="PDF Preview"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            This is a display-only preview. Students will see the PDF in the assessment interface.
          </p>
        </Card>
      )}

      {/* Instructions */}
      <Card className="cloud-bubble p-6 bg-primary/5 border-primary/20">
        <h4 className="font-semibold mb-2 text-primary">Important Notes</h4>
        <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
          <li>PDFs are display-only. No automatic question extraction is performed.</li>
          <li>You must manually enter the number of questions in each PDF.</li>
          <li>Students will see the PDF alongside answer input fields.</li>
          <li>Practice PDF determines which main test (Easy/Medium/Hard) students receive.</li>
        </ul>
      </Card>
    </div>
  );
};
