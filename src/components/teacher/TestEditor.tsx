import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { QuestionEditor } from './QuestionEditor';
import { PDFExtractor } from './PDFExtractor';
import { 
  ArrowLeft, Save, Trash2, PlusCircle, FileText, 
  Settings, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';

interface Question {
  id: string;
  test_id: string;
  question_text: string;
  question_type: string;
  options: { id: string; text: string }[];
  correct_answer: string;
  difficulty: string;
  passage_title?: string;
  passage_text?: string;
  media_url?: string;
  media_type?: string;
  marks: number;
  order_index: number;
}

interface Test {
  id: string;
  testCode: string;
  title: string;
  subject: string;
  duration_minutes?: number;
  durationMinutes?: number;
  teacherId: string;
  createdAt: string;
  is_active?: boolean;
}

interface TestEditorProps {
  test: Test;
  onSave: (test: Test) => void;
  onClose: () => void;
}

export const TestEditor = ({ test, onSave, onClose }: TestEditorProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('settings');
  const [editedTest, setEditedTest] = useState<Test>({ ...test });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadQuestions();
  }, [test.id]);

  const loadQuestions = () => {
    const allQuestions = JSON.parse(localStorage.getItem('questions') || '[]');
    const testQuestions = allQuestions
      .filter((q: Question) => q.test_id === test.id)
      .sort((a: Question, b: Question) => a.order_index - b.order_index);
    setQuestions(testQuestions);
  };

  const handleSaveTest = () => {
    const allTests = JSON.parse(localStorage.getItem('tests') || '[]');
    const testIndex = allTests.findIndex((t: Test) => t.id === test.id);
    
    if (testIndex !== -1) {
      allTests[testIndex] = {
        ...allTests[testIndex],
        title: editedTest.title,
        subject: editedTest.subject,
        duration_minutes: editedTest.duration_minutes || editedTest.durationMinutes || 60,
      };
      localStorage.setItem('tests', JSON.stringify(allTests));
      onSave(allTests[testIndex]);
      toast({ title: 'Success', description: 'Test settings saved' });
    }
  };

  const handleSaveQuestion = (updatedQuestion: Question) => {
    const allQuestions = JSON.parse(localStorage.getItem('questions') || '[]');
    const qIndex = allQuestions.findIndex((q: Question) => q.id === updatedQuestion.id);
    
    if (qIndex !== -1) {
      allQuestions[qIndex] = updatedQuestion;
      localStorage.setItem('questions', JSON.stringify(allQuestions));
      loadQuestions();
      toast({ title: 'Success', description: 'Question saved' });
    }
    setEditingQuestionId(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const allQuestions = JSON.parse(localStorage.getItem('questions') || '[]');
    const filtered = allQuestions.filter((q: Question) => q.id !== questionId);
    localStorage.setItem('questions', JSON.stringify(filtered));
    loadQuestions();
    setEditingQuestionId(null);
    toast({ title: 'Deleted', description: 'Question removed' });
  };

  const toggleExpand = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
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

  const getDifficultyStats = () => {
    return {
      practice: questions.filter(q => q.difficulty === 'practice').length,
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length,
    };
  };

  const stats = getDifficultyStats();

  return (
    <Card className="cloud-bubble p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">{editedTest.title}</h2>
            <p className="text-sm text-muted-foreground">
              {editedTest.subject} • Code: <span className="font-mono text-primary">{test.testCode}</span>
            </p>
          </div>
        </div>
        <Button onClick={handleSaveTest} className="bg-success text-success-foreground hover:bg-success/90">
          <Save className="h-4 w-4 mr-2" />
          Save All
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor('practice')}`}>
          Practice: {stats.practice}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor('easy')}`}>
          Easy: {stats.easy}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor('medium')}`}>
          Medium: {stats.medium}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor('hard')}`}>
          Hard: {stats.hard}
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
          Total: {questions.length}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">
            <Settings className="h-3 w-3 mr-1" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="questions">
            <FileText className="h-3 w-3 mr-1" />
            Questions ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="add">
            <Sparkles className="h-3 w-3 mr-1" />
            Add More
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6 space-y-4">
          <Card className="p-6 border-2 border-border">
            <h3 className="font-semibold mb-4">Test Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Test Title</Label>
                <Input
                  value={editedTest.title}
                  onChange={(e) => setEditedTest({ ...editedTest, title: e.target.value })}
                  className="input-glassy"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select
                    value={editedTest.subject}
                    onValueChange={(v) => setEditedTest({ ...editedTest, subject: v })}
                  >
                    <SelectTrigger className="input-glassy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={editedTest.duration_minutes || editedTest.durationMinutes || 60}
                    onChange={(e) => setEditedTest({ 
                      ...editedTest, 
                      duration_minutes: parseInt(e.target.value) || 60 
                    })}
                    min={10}
                    max={300}
                    className="input-glassy"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Missing Difficulty Warning */}
          {(stats.practice === 0 || stats.easy === 0 || stats.medium === 0 || stats.hard === 0) && (
            <Card className="p-4 border-2 border-warning/50 bg-warning/10">
              <h4 className="font-medium text-warning mb-2">Missing Difficulty Levels</h4>
              <p className="text-sm text-muted-foreground">
                Some difficulty levels have no questions:
                {stats.practice === 0 && <span className="text-warning"> Practice</span>}
                {stats.easy === 0 && <span className="text-warning"> Easy</span>}
                {stats.medium === 0 && <span className="text-warning"> Medium</span>}
                {stats.hard === 0 && <span className="text-warning"> Hard</span>}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Students assigned to missing levels will skip to the next available level.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="mt-6">
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No questions yet. Go to "Add More" tab to add questions.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {questions.map((q, idx) => (
                <div key={q.id}>
                  {editingQuestionId === q.id ? (
                    <QuestionEditor
                      question={q}
                      onSave={handleSaveQuestion}
                      onCancel={() => setEditingQuestionId(null)}
                      onDelete={handleDeleteQuestion}
                    />
                  ) : (
                    <Card 
                      className="p-4 border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(q.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-medium text-muted-foreground w-8">
                            Q{idx + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                          <p className="text-sm flex-1 line-clamp-1">{q.question_text}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingQuestionId(q.id);
                            }}
                          >
                            Edit
                          </Button>
                          {expandedQuestions.has(q.id) ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Expanded View */}
                      {expandedQuestions.has(q.id) && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          {q.passage_text && (
                            <div className="bg-muted/50 p-3 rounded-lg text-sm">
                              {q.passage_title && <p className="font-medium mb-1">{q.passage_title}</p>}
                              <p className="text-muted-foreground">{q.passage_text}</p>
                            </div>
                          )}
                          <p className="font-medium">{q.question_text}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, optIdx) => {
                              const letter = opt.id || String.fromCharCode(65 + optIdx);
                              const isCorrect = q.correct_answer === letter;
                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2 rounded-lg text-sm ${
                                    isCorrect ? 'bg-success/20 border border-success' : 'bg-muted/50'
                                  }`}
                                >
                                  <span className={`font-medium ${isCorrect ? 'text-success' : ''}`}>
                                    {letter}.
                                  </span>{' '}
                                  {opt.text}
                                </div>
                              );
                            })}
                          </div>
                          {q.media_url && (
                            <div className="mt-2">
                              {q.media_type === 'image' && (
                                <img src={q.media_url} alt="Question media" className="max-h-32 rounded-lg" />
                              )}
                              {q.media_type === 'audio' && (
                                <audio controls src={q.media_url} className="w-full" />
                              )}
                              {q.media_type === 'video' && (
                                <video controls src={q.media_url} className="max-h-32 rounded-lg" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Add More Tab */}
        <TabsContent value="add" className="mt-6">
          <PDFExtractor
            testId={test.id}
            onSave={() => {
              loadQuestions();
              setActiveTab('questions');
            }}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
