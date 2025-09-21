import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, Flag, ChevronLeft, ChevronRight } from "lucide-react";

interface Question {
  id: string;
  type: "multiple-choice" | "short-answer" | "visual";
  title: string;
  content: string;
  image?: string;
  options?: string[];
  correctAnswer?: string;
}

const AssessmentInterface = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes in seconds
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Sample questions based on the reference image
  const questions: Question[] = [
    {
      id: "1",
      type: "multiple-choice",
      title: "FEEL GOOD IN YOUR RUNNERS",
      content: `For fourteen years the Lyon Institute of Medicine (France) has been studying the injuries of young sports players and sports professionals. The study has established that the best course is prevention... and good shoes.

Knocks, falls, wear and tear...
Eighteen per cent of sports players aged 8 to 12 already have heel injuries. By the age of 12, football players' ankles become prominent...

This is what is known as degenerative osteoarthritis. This may be caused by shoes with soles and ankle parts that are too flexible.

Protect, support, stabilise, absorb

If a shoe is too rigid, it restricts movement. If it is too flexible, it increases the risk of injuries and sprains. A good sports shoe should meet four criteria.

Firstly, it must provide exterior protection: resisting knocks from the ball, coping with unevenness in the ground, and keeping the foot warm and dry even when it is freezing cold and raining.

It must support the foot, and in particular the ankle joint, to avoid sprains, swelling and other problems, which may even affect the knee.

It must also provide players with good stability so that they do not slip on a wet ground or skid on a surface that is too dry.

Finally, it must absorb all vertically of knocks suffered by volleyball and basketball players who are constantly jumping.

Dry feet
To avoid minor problems such as blisters or even splits or athlete's foot (fungal infections), the shoe must allow evaporation of perspiration and must prevent dampness from getting in.

The ideal material for this is leather, which can be water-proofed to prevent the shoe from getting soaked the first time it rains.`,
      options: [
        "That the quality of many sports shoes has greatly improved.",
        "That it is best not to play football if you are under 12 years of age.",
        "That young people are suffering more and more injuries due to their poor physical condition.",
        "That it is very important for young sports players to wear good sports shoes."
      ]
    },
    {
      id: "2",
      type: "multiple-choice",
      title: "Reading Comprehension - Question 2",
      content: "Based on the text about sports shoes, what percentage of young sports players aged 8 to 12 already have heel injuries?",
      options: [
        "8%",
        "12%",
        "18%",
        "25%"
      ]
    }
  ];

  const questionNavItems = ["A", "B", "C", "D", "E"];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || "");
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || "");
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-semibold">PISA Reading Assessment</span>
              </div>
              <Progress value={progressPercentage} className="w-32 h-2" />
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
              </div>
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4 mr-2" />
                Mark for Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Assessment Interface */}
      <div className="container mx-auto p-4">
        <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Left Panel - Reading Passage */}
          <div className="lg:col-span-7">
            <Card className="h-full assessment-panel p-6 overflow-y-auto">
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-center border-b pb-4">
                  {questions[currentQuestion].title}
                </h1>
                
                <div className="prose prose-sm max-w-none">
                  {questions[currentQuestion].content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-sm leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel - Question and Answers */}
          <div className="lg:col-span-5 space-y-4">
            {/* Question Navigation */}
            <Card className="p-4">
              <div className="flex justify-center gap-2">
                {questionNavItems.map((item, index) => (
                  <button
                    key={item}
                    onClick={() => setCurrentQuestion(index)}
                    className={`question-nav-tab ${
                      index === currentQuestion ? 'active' : ''
                    } ${answers[index] ? 'bg-primary-light' : ''}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Card>

            {/* Question and Answer Options */}
            <Card className="flex-1 assessment-panel p-6">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  What does the author intend to show in this text?
                </h2>

                <div className="space-y-3">
                  {questions[currentQuestion].options?.map((option, index) => (
                    <label
                      key={index}
                      className={`answer-option ${
                        selectedAnswer === option ? 'selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={selectedAnswer === option}
                        onChange={() => handleAnswerSelect(option)}
                        className="sr-only"
                      />
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center flex-shrink-0 transition-colors">
                        {selectedAnswer === option && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
                className="nav-btn-prev"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Prev
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={currentQuestion === questions.length - 1}
                className="nav-btn-next"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentInterface;