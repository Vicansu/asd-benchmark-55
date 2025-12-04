import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Save, X, Trash2, Upload, Image, FileAudio, FileVideo } from 'lucide-react';

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

interface QuestionEditorProps {
  question: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}

export const QuestionEditor = ({ question, onSave, onCancel, onDelete }: QuestionEditorProps) => {
  const { toast } = useToast();
  const { uploadMedia, uploading } = useFileUpload();
  const [editedQuestion, setEditedQuestion] = useState<Question>({ ...question });

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...editedQuestion.options];
    newOptions[index] = { ...newOptions[index], text: value };
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = file.type.startsWith('image/') ? 'image' 
      : file.type.startsWith('audio/') ? 'audio' 
      : file.type.startsWith('video/') ? 'video' : null;

    if (!type) {
      toast({ title: 'Error', description: 'Unsupported file type', variant: 'destructive' });
      return;
    }

    const url = await uploadMedia(file, editedQuestion.test_id);
    if (url) {
      setEditedQuestion({ ...editedQuestion, media_url: url, media_type: type });
      toast({ title: 'Success', description: 'Media uploaded' });
    }
  };

  const handleSave = () => {
    if (!editedQuestion.question_text.trim()) {
      toast({ title: 'Error', description: 'Question text is required', variant: 'destructive' });
      return;
    }

    const hasEmptyOptions = editedQuestion.options.some(opt => !opt.text.trim());
    if (hasEmptyOptions) {
      toast({ title: 'Error', description: 'All options must have text', variant: 'destructive' });
      return;
    }

    onSave(editedQuestion);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'practice': return 'bg-accent/20 text-accent-foreground';
      case 'easy': return 'bg-success/20 text-success';
      case 'medium': return 'bg-warning/20 text-warning';
      case 'hard': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="p-6 border-2 border-primary/50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">Edit Question</h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => {
              if (window.confirm('Delete this question?')) {
                onDelete(question.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-success text-success-foreground hover:bg-success/90">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Difficulty and Marks */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select
              value={editedQuestion.difficulty}
              onValueChange={(v) => setEditedQuestion({ ...editedQuestion, difficulty: v })}
            >
              <SelectTrigger className={getDifficultyColor(editedQuestion.difficulty)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="practice">Practice</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Marks</Label>
            <Input
              type="number"
              value={editedQuestion.marks}
              onChange={(e) => setEditedQuestion({ ...editedQuestion, marks: parseInt(e.target.value) || 1 })}
              min={1}
              max={10}
              className="input-glassy"
            />
          </div>
        </div>

        {/* Passage */}
        <div className="space-y-2">
          <Label>Passage Title (Optional)</Label>
          <Input
            value={editedQuestion.passage_title || ''}
            onChange={(e) => setEditedQuestion({ ...editedQuestion, passage_title: e.target.value })}
            placeholder="Enter passage title..."
            className="input-glassy"
          />
        </div>
        <div className="space-y-2">
          <Label>Passage Text (Optional)</Label>
          <Textarea
            value={editedQuestion.passage_text || ''}
            onChange={(e) => setEditedQuestion({ ...editedQuestion, passage_text: e.target.value })}
            placeholder="Enter reading passage..."
            rows={3}
            className="input-glassy"
          />
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <Label>Question Text *</Label>
          <Textarea
            value={editedQuestion.question_text}
            onChange={(e) => setEditedQuestion({ ...editedQuestion, question_text: e.target.value })}
            placeholder="Enter your question..."
            rows={2}
            className="input-glassy"
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <Label>Answer Options</Label>
          {editedQuestion.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isCorrect = editedQuestion.correct_answer === letter;
            return (
              <div key={idx} className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isCorrect ? "default" : "outline"}
                  size="sm"
                  className={`w-10 h-10 ${isCorrect ? 'bg-success hover:bg-success/90' : ''}`}
                  onClick={() => setEditedQuestion({ ...editedQuestion, correct_answer: letter })}
                >
                  {letter}
                </Button>
                <Input
                  value={option.text}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${letter}`}
                  className={`input-glassy flex-1 ${isCorrect ? 'border-success' : ''}`}
                />
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">Click a letter to set it as the correct answer</p>
        </div>

        {/* Media Upload */}
        <div className="space-y-2">
          <Label>Media Attachment</Label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              id={`media-${question.id}`}
              accept="image/*,audio/*,video/*"
              onChange={handleMediaUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById(`media-${question.id}`)?.click()}
              disabled={uploading}
              className="rounded-xl"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Media'}
            </Button>
            
            {editedQuestion.media_url && (
              <div className="flex items-center gap-2 px-3 py-1 bg-success/20 rounded-lg">
                {editedQuestion.media_type === 'image' && <Image className="h-4 w-4" />}
                {editedQuestion.media_type === 'audio' && <FileAudio className="h-4 w-4" />}
                {editedQuestion.media_type === 'video' && <FileVideo className="h-4 w-4" />}
                <span className="text-sm text-success">Media attached</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setEditedQuestion({ ...editedQuestion, media_url: '', media_type: '' })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Media Preview */}
          {editedQuestion.media_url && editedQuestion.media_type === 'image' && (
            <img
              src={editedQuestion.media_url}
              alt="Question media"
              className="max-h-40 rounded-lg border"
            />
          )}
        </div>
      </div>
    </Card>
  );
};
