import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Loader2, Sparkles, Trash2, Edit2, Save, X, Image as ImageIcon } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ExtractedQuestion {
  id: string;
  passage_title: string | null;
  passage_text: string | null;
  question_text: string;
  options: string[];
  correct_answer: string;
  difficulty: 'practice' | 'easy' | 'medium' | 'hard';
  has_image: boolean;
  image_description?: string;
  selected: boolean;
  editing: boolean;
}

interface PDFExtractorProps {
  testId: string;
  onQuestionsExtracted?: (questions: ExtractedQuestion[]) => void;
  onSave?: (questions: ExtractedQuestion[]) => void;
}

export const PDFExtractor = ({ testId, onQuestionsExtracted, onSave }: PDFExtractorProps) => {
  const { toast } = useToast();
  const [extracting, setExtracting] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<string>('');

  const extractTextFromPDF = async (file: File): Promise<{ text: string; images: string[] }> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    const images: string[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      setProgress(`Extracting page ${i} of ${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `\n--- Page ${i} ---\n${pageText}`;
      
      // Extract images from page
      try {
        const ops = await page.getOperatorList();
        for (let j = 0; j < ops.fnArray.length; j++) {
          if (ops.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
            const imgName = ops.argsArray[j][0];
            try {
              const img = await page.objs.get(imgName);
              if (img && img.data) {
                // Convert to base64
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  const imgData = ctx.createImageData(img.width, img.height);
                  imgData.data.set(img.data);
                  ctx.putImageData(imgData, 0, 0);
                  images.push(canvas.toDataURL('image/png'));
                }
              }
            } catch (imgErr) {
              console.log('Could not extract image:', imgErr);
            }
          }
        }
      } catch (opsErr) {
        console.log('Could not get operators:', opsErr);
      }
    }
    
    return { text: fullText, images };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setExtractedQuestions([]);
    } else {
      toast({ title: 'Error', description: 'Please select a PDF file', variant: 'destructive' });
    }
  };

  const handleExtract = async () => {
    if (!pdfFile) {
      toast({ title: 'Error', description: 'Please select a PDF file first', variant: 'destructive' });
      return;
    }

    setExtracting(true);
    setProgress('Reading PDF...');

    try {
      // Extract text and images from PDF
      const { text, images } = await extractTextFromPDF(pdfFile);
      
      if (!text.trim()) {
        toast({ title: 'Error', description: 'Could not extract text from PDF. It may be image-based.', variant: 'destructive' });
        setExtracting(false);
        return;
      }

      setProgress('Analyzing with AI...');

      // Send to AI for question extraction
      const { data, error } = await supabase.functions.invoke('extract-questions', {
        body: { 
          extractedText: text.substring(0, 50000), // Limit text length
          imageBase64s: images.slice(0, 5) // Limit images
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const questions: ExtractedQuestion[] = (data.questions || []).map((q: any, idx: number) => ({
        id: crypto.randomUUID(),
        passage_title: q.passage_title || null,
        passage_text: q.passage_text || null,
        question_text: q.question_text || '',
        options: q.options || ['', '', '', ''],
        correct_answer: q.correct_answer || 'unknown',
        difficulty: q.difficulty || 'medium',
        has_image: q.has_image || false,
        image_description: q.image_description,
        selected: true,
        editing: false,
      }));

      setExtractedQuestions(questions);
      onQuestionsExtracted?.(questions);
      
      toast({ 
        title: 'Success!', 
        description: `Extracted ${questions.length} questions from PDF` 
      });
    } catch (err: any) {
      console.error('Extraction error:', err);
      toast({ 
        title: 'Extraction Failed', 
        description: err.message || 'Failed to extract questions', 
        variant: 'destructive' 
      });
    } finally {
      setExtracting(false);
      setProgress('');
    }
  };

  const updateQuestion = (id: string, updates: Partial<ExtractedQuestion>) => {
    setExtractedQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, ...updates } : q)
    );
  };

  const deleteQuestion = (id: string) => {
    setExtractedQuestions(prev => prev.filter(q => q.id !== id));
  };

  const toggleSelect = (id: string) => {
    updateQuestion(id, { selected: !extractedQuestions.find(q => q.id === id)?.selected });
  };

  const toggleEditing = (id: string) => {
    const q = extractedQuestions.find(q => q.id === id);
    updateQuestion(id, { editing: !q?.editing });
  };

  const handleSaveQuestions = () => {
    const selectedQuestions = extractedQuestions.filter(q => q.selected);
    
    if (selectedQuestions.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one question', variant: 'destructive' });
      return;
    }

    // Save to localStorage
    const existingQuestions = JSON.parse(localStorage.getItem('questions') || '[]');
    const newQuestions = selectedQuestions.map((q, idx) => ({
      id: crypto.randomUUID(),
      test_id: testId,
      question_text: q.question_text,
      question_type: 'mcq',
      options: q.options.map((opt, i) => ({
        id: String.fromCharCode(65 + i),
        text: opt
      })),
      correct_answer: q.correct_answer,
      difficulty: q.difficulty,
      passage_title: q.passage_title,
      passage_text: q.passage_text,
      marks: 1,
      order_index: existingQuestions.filter((eq: any) => eq.test_id === testId).length + idx,
      created_at: new Date().toISOString()
    }));

    localStorage.setItem('questions', JSON.stringify([...existingQuestions, ...newQuestions]));
    
    onSave?.(selectedQuestions);
    toast({ 
      title: 'Questions Saved!', 
      description: `Added ${selectedQuestions.length} questions to test` 
    });
    
    // Clear state
    setExtractedQuestions([]);
    setPdfFile(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'practice': return 'bg-accent/20 text-accent-foreground border-accent';
      case 'easy': return 'bg-success/20 text-success border-success';
      case 'medium': return 'bg-warning/20 text-warning border-warning';
      case 'hard': return 'bg-destructive/20 text-destructive border-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="cloud-bubble p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">AI Question Extractor</h3>
            <p className="text-muted-foreground text-sm">Upload a PDF and let AI extract questions automatically</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              id="pdf-upload"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{pdfFile ? pdfFile.name : 'Click to upload PDF'}</p>
                  <p className="text-sm text-muted-foreground">
                    {pdfFile ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` : 'Supports PDF files with text and images'}
                  </p>
                </div>
              </div>
            </label>
          </div>

          {pdfFile && (
            <Button
              onClick={handleExtract}
              disabled={extracting}
              className="w-full nav-btn-next"
            >
              {extracting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {progress}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Extract Questions with AI
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Extracted Questions */}
      {extractedQuestions.length > 0 && (
        <Card className="cloud-bubble p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Extracted Questions ({extractedQuestions.length})</h3>
              <p className="text-sm text-muted-foreground">
                Review and set difficulty for each question individually
              </p>
            </div>
            <Button onClick={handleSaveQuestions} className="bg-success text-success-foreground hover:bg-success/90">
              <Save className="h-4 w-4 mr-2" />
              Save Selected ({extractedQuestions.filter(q => q.selected).length})
            </Button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {extractedQuestions.map((q, idx) => (
              <Card 
                key={q.id} 
                className={`p-4 border-2 transition-all ${q.selected ? 'border-primary/50 bg-primary/5' : 'border-border opacity-60'}`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={q.selected}
                    onCheckedChange={() => toggleSelect(q.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-3">
                    {/* Header with difficulty and actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Q{idx + 1}</span>
                        <Select
                          value={q.difficulty}
                          onValueChange={(v: any) => updateQuestion(q.id, { difficulty: v })}
                        >
                          <SelectTrigger className={`w-28 h-7 text-xs ${getDifficultyColor(q.difficulty)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="practice">Practice</SelectItem>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        {q.has_image && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ImageIcon className="h-3 w-3" />
                            Has image
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleEditing(q.id)}
                          className="h-7 w-7"
                        >
                          {q.editing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteQuestion(q.id)}
                          className="h-7 w-7 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Passage if exists */}
                    {q.passage_text && (
                      <div className="bg-muted/50 p-3 rounded-lg text-sm">
                        {q.passage_title && (
                          <p className="font-medium mb-1">{q.passage_title}</p>
                        )}
                        <p className="text-muted-foreground line-clamp-3">{q.passage_text}</p>
                      </div>
                    )}

                    {/* Question */}
                    {q.editing ? (
                      <Input
                        value={q.question_text}
                        onChange={(e) => updateQuestion(q.id, { question_text: e.target.value })}
                        className="input-glassy"
                      />
                    ) : (
                      <p className="font-medium">{q.question_text}</p>
                    )}

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isCorrect = q.correct_answer === letter;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-lg text-sm flex items-center gap-2 ${
                              isCorrect 
                                ? 'bg-success/20 border border-success' 
                                : 'bg-muted/50'
                            }`}
                          >
                            <span className={`font-medium ${isCorrect ? 'text-success' : 'text-muted-foreground'}`}>
                              {letter}.
                            </span>
                            {q.editing ? (
                              <Input
                                value={opt}
                                onChange={(e) => {
                                  const newOptions = [...q.options];
                                  newOptions[optIdx] = e.target.value;
                                  updateQuestion(q.id, { options: newOptions });
                                }}
                                className="h-7 text-sm"
                              />
                            ) : (
                              <span>{opt}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Correct Answer Selector when editing */}
                    {q.editing && (
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Correct Answer:</Label>
                        <Select
                          value={q.correct_answer}
                          onValueChange={(v) => updateQuestion(q.id, { correct_answer: v })}
                        >
                          <SelectTrigger className="w-20 h-7">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="cloud-bubble p-6 bg-primary/5 border-primary/20">
        <h4 className="font-semibold mb-2 text-primary">How it works</h4>
        <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
          <li>Upload any PDF with educational content or exam questions</li>
          <li>AI extracts MCQ questions with passages and answer options</li>
          <li>Set difficulty level for each question individually (Practice/Easy/Medium/Hard)</li>
          <li>Edit questions as needed before saving</li>
          <li>Tables and complex layouts are preserved as descriptions</li>
        </ul>
      </Card>
    </div>
  );
};
