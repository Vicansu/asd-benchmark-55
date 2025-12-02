import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionBuilder } from './QuestionBuilder';
import { PDFUploader } from './PDFUploader';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface CreateTestWizardProps {
  teacherId: string;
  onComplete?: (testCode: string) => void;
  onCancel?: () => void;
}

export const CreateTestWizard = ({ teacherId, onComplete, onCancel }: CreateTestWizardProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [testId, setTestId] = useState<string>('');
  
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    subject: '',
    duration_minutes: 60,
  });

  const [pdfInfo, setPdfInfo] = useState({
    practice_pdf_url: '',
    easy_pdf_url: '',
    medium_pdf_url: '',
    hard_pdf_url: '',
    practice_question_count: 0,
    easy_question_count: 0,
    medium_question_count: 0,
    hard_question_count: 0,
  });

  const generateTestCode = (subject: string) => {
    const prefix = subject === 'English' ? 'E' : subject === 'Science' ? 'S' : 'M';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix;
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleBasicInfoNext = async () => {
    if (!basicInfo.title || !basicInfo.subject) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
        return;
      }

      // Generate test code
      const testCode = generateTestCode(basicInfo.subject);

      // Create test in database
      const { data, error } = await supabase
        .from('tests')
        .insert([{
          title: basicInfo.title,
          subject: basicInfo.subject.toLowerCase(),
          duration_minutes: basicInfo.duration_minutes,
          test_code: testCode,
          created_by: user.id,
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;

      setTestId(data.id);
      toast({ title: 'Success', description: 'Test created! Now add questions.' });
      setActiveTab('questions');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleFinalize = async () => {
    if (!testId) return;

    try {
      // Update test with PDF info
      const { error } = await supabase
        .from('tests')
        .update(pdfInfo)
        .eq('id', testId);

      if (error) throw error;

      // Get test code
      const { data } = await supabase
        .from('tests')
        .select('test_code')
        .eq('id', testId)
        .single();

      toast({
        title: 'Test Created Successfully!',
        description: `Test code: ${data?.test_code}`,
        duration: 5000,
      });

      onComplete?.(data?.test_code || '');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="cloud-bubble p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Create New Test</h2>
            <p className="text-muted-foreground text-sm">Follow the steps to create your test</p>
          </div>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="questions" disabled={!testId}>Manual Questions</TabsTrigger>
            <TabsTrigger value="pdfs" disabled={!testId}>PDF Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-6">
            <Card className="p-6 border-2 border-border">
              <h3 className="font-semibold mb-4">Test Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Midterm Assessment 2025"
                    value={basicInfo.title}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, title: e.target.value }))}
                    className="input-glassy"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select
                    value={basicInfo.subject}
                    onValueChange={(v) => setBasicInfo(prev => ({ ...prev, subject: v }))}
                  >
                    <SelectTrigger className="input-glassy">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={basicInfo.duration_minutes}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 60 }))}
                    min={10}
                    max={300}
                    className="input-glassy"
                  />
                </div>
              </div>
            </Card>

            <Button onClick={handleBasicInfoNext} className="w-full nav-btn-next">
              Next: Add Questions
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            {testId && <QuestionBuilder testId={testId} />}
            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setActiveTab('basic')}
                className="rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setActiveTab('pdfs')}
                className="flex-1 nav-btn-next"
              >
                Next: Upload PDFs
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pdfs" className="mt-6">
            {testId && (
              <PDFUploader 
                testId={testId} 
                onPDFsChange={(updates) => setPdfInfo(prev => ({ ...prev, ...updates }))} 
              />
            )}
            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setActiveTab('questions')}
                className="rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleFinalize}
                className="flex-1 bg-success text-success-foreground hover:bg-success/90"
              >
                <Check className="h-4 w-4 mr-2" />
                Finalize & Generate Test Code
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
