import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  type: "multiple-choice" | "short-answer";
  isPractice: boolean;
  difficulty: "easy" | "medium" | "hard";
  title: string;
  passage: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
}

const AssessmentInterface = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [studentData, setStudentData] = useState<any>(null);
  const [assignedLevel, setAssignedLevel] = useState<"easy" | "medium" | "hard" | null>(null);
  const [practiceComplete, setPracticeComplete] = useState(false);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());

  useEffect(() => {
    const data = localStorage.getItem("studentData");
    if (!data) {
      navigate("/");
      return;
    }
    setStudentData(JSON.parse(data));

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Sample questions
  const practiceQuestions: Question[] = [
    {
      id: "p1",
      type: "multiple-choice",
      isPractice: true,
      difficulty: "medium",
      title: "Practice Question 1",
      passage: "Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, such as through variations in the solar cycle. But since the 1800s, human activities have been the main driver of climate change, primarily due to burning fossil fuels like coal, oil and gas.\n\nBurning fossil fuels generates greenhouse gas emissions that act like a blanket wrapped around the Earth, trapping the sun's heat and raising temperatures. The main greenhouse gases that are causing climate change include carbon dioxide and methane. These come from using gasoline for driving a car or coal for heating a building, for example.",
      question: "According to the passage, what has been the main driver of climate change since the 1800s?",
      options: [
        "Natural variations in the solar cycle",
        "Human activities, primarily burning fossil fuels",
        "Changes in ocean temperatures",
        "Volcanic eruptions"
      ],
      correctAnswer: "Human activities, primarily burning fossil fuels"
    },
    {
      id: "p2",
      type: "multiple-choice",
      isPractice: true,
      difficulty: "medium",
      title: "Practice Question 2",
      passage: "Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that can later be released to fuel the organism's activities. This chemical energy is stored in carbohydrate molecules, such as sugars, which are synthesized from carbon dioxide and water.\n\nDuring photosynthesis, plants take in carbon dioxide from the air through tiny pores in their leaves called stomata. They also absorb water from the soil through their roots. Using sunlight as energy, they convert these raw materials into glucose and oxygen. The oxygen is released back into the atmosphere as a byproduct.",
      question: "What do plants release into the atmosphere during photosynthesis?",
      options: [
        "Carbon dioxide",
        "Glucose",
        "Oxygen",
        "Water"
      ],
      correctAnswer: "Oxygen"
    },
    {
      id: "p3",
      type: "multiple-choice",
      isPractice: true,
      difficulty: "medium",
      title: "Practice Question 3",
      passage: "The water cycle, also known as the hydrological cycle, describes the continuous movement of water on, above, and below the surface of the Earth. Water evaporates from the surface of oceans, lakes, and rivers, rising into the atmosphere where cooler temperatures cause it to condense into clouds.\n\nWhen the water droplets in clouds combine and grow heavy enough, they fall back to Earth as precipitation—rain, snow, sleet, or hail. This precipitation can flow across the land into rivers, lakes, and eventually the oceans, or it can seep into the ground to become groundwater.",
      question: "What happens to water after it evaporates from the Earth's surface?",
      options: [
        "It immediately falls as rain",
        "It rises into the atmosphere and condenses into clouds",
        "It becomes groundwater",
        "It flows into rivers and oceans"
      ],
      correctAnswer: "It rises into the atmosphere and condenses into clouds"
    }
  ];

  const mainQuestions: Record<"easy" | "medium" | "hard", Question[]> = {
    easy: [
      {
        id: "e1",
        type: "multiple-choice",
        isPractice: false,
        difficulty: "easy",
        title: "Reading Comprehension",
        passage: "The library is a place where books are kept for people to read or borrow. Libraries have existed for thousands of years, serving as centers of knowledge and learning. Ancient libraries, like the famous Library of Alexandria, stored information on clay tablets and papyrus scrolls.\n\nToday's modern libraries have evolved to contain not just books, but also magazines, newspapers, and digital resources like computers and e-books. Many libraries also offer valuable programs such as reading clubs for children, homework help sessions, and community events that bring people together.",
        question: "What is the main purpose of a library?",
        options: [
          "To sell books to people",
          "To keep books for people to read or borrow",
          "To store ancient clay tablets",
          "To organize community events only"
        ],
        correctAnswer: "To keep books for people to read or borrow"
      },
      {
        id: "e2",
        type: "multiple-choice",
        isPractice: false,
        difficulty: "easy",
        title: "Reading Comprehension",
        passage: "Bees are remarkable insects that play a crucial role in helping plants grow and reproduce. They accomplish this through a process called pollination, which is essential for the production of many fruits and vegetables that humans eat.\n\nWhen a bee visits a flower to drink its sweet nectar, tiny grains of pollen stick to the bee's fuzzy body. As the bee moves from flower to flower in search of more nectar, it transfers this pollen, allowing plants to produce seeds and fruit. Without bees and other pollinators, many of our favorite foods would not exist.",
        question: "How do bees help plants grow?",
        options: [
          "By eating the leaves",
          "By transferring pollen between flowers",
          "By watering the plants",
          "By protecting them from other insects"
        ],
        correctAnswer: "By transferring pollen between flowers"
      }
    ],
    medium: [
      {
        id: "m1",
        type: "multiple-choice",
        isPractice: false,
        difficulty: "medium",
        title: "Critical Reading",
        passage: "Artificial Intelligence (AI) is rapidly transforming industries worldwide, from healthcare diagnostics to financial analysis. AI systems can analyze vast amounts of data faster and often more accurately than humans, leading to breakthroughs in medical research and business optimization.\n\nHowever, this powerful technology also raises significant ethical concerns that society must address. Privacy issues arise when AI systems collect and process personal data without adequate consent or transparency. There are also legitimate fears about job displacement as machines increasingly take over tasks previously performed by humans. Despite these challenges, many experts believe that AI will ultimately benefit society—if developed and deployed responsibly.",
        question: "What is one concern mentioned about AI in the passage?",
        options: [
          "AI cannot analyze data as well as humans",
          "AI systems raise privacy concerns",
          "AI is too expensive to implement",
          "AI cannot be used in healthcare"
        ],
        correctAnswer: "AI systems raise privacy concerns"
      }
    ],
    hard: [
      {
        id: "h1",
        type: "multiple-choice",
        isPractice: false,
        difficulty: "hard",
        title: "Advanced Analysis",
        passage: "Quantum computing represents a fundamental paradigm shift in computational capability that could revolutionize fields from cryptography to drug discovery. Unlike classical computers that process information in binary bits—which exist as either 0 or 1—quantum computers use quantum bits, or 'qubits,' that can exist in multiple states simultaneously through a phenomenon called superposition.\n\nThis remarkable property, combined with quantum entanglement—where qubits become interconnected and the state of one instantly influences another regardless of distance—allows quantum computers to solve certain problems exponentially faster than any classical computer. However, quantum systems are extremely fragile and require temperatures near absolute zero to function, making them currently impractical for everyday use.",
        question: "What makes quantum computers potentially more powerful than classical computers?",
        options: [
          "They operate at room temperature",
          "They use binary processing like classical computers",
          "Qubits can exist in multiple states simultaneously",
          "They are more affordable to manufacture"
        ],
        correctAnswer: "Qubits can exist in multiple states simultaneously"
      }
    ]
  };

  const getCurrentQuestions = () => {
    if (!practiceComplete) {
      return practiceQuestions;
    }
    return mainQuestions[assignedLevel || "medium"];
  };

  const questions = getCurrentQuestions();

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const updatedAnswers = { ...answers, [currentQuestion]: answer };
    setAnswers(updatedAnswers);

    if (!practiceComplete && currentQuestion === practiceQuestions.length - 1) {
      const practiceScore = calculatePracticeScore(updatedAnswers);
      assignDifficultyLevel(practiceScore);
    }
  };

  const calculatePracticeScore = (practiceAnswers: Record<number, string>) => {
    let correct = 0;
    practiceQuestions.forEach((q, idx) => {
      if (practiceAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    return (correct / practiceQuestions.length) * 100;
  };

  const assignDifficultyLevel = (score: number) => {
    let level: "easy" | "medium" | "hard";
    if (score >= 75) {
      level = "hard";
    } else if (score >= 50) {
      level = "medium";
    } else {
      level = "easy";
    }
    setAssignedLevel(level);
    setPracticeComplete(true);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    
    toast({
      title: "Practice Complete!",
      description: `Moving to ${level} difficulty questions`,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || "");
    } else if (!practiceComplete) {
      setCurrentQuestion(0);
      setSelectedAnswer("");
    } else {
      handleSubmit();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || "");
    }
  };

  const handleSubmit = () => {
    const questions = getCurrentQuestions();
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    const score = Math.round((correct / questions.length) * 100);

    const currentTest = JSON.parse(localStorage.getItem("currentTest") || "{}");
    
    const result = {
      studentId: studentData.studentId,
      testCode: currentTest.testCode || "DEMO",
      testTitle: currentTest.title || "Demo Test",
      subject: currentTest.subject || "General",
      score,
      difficultyLevel: assignedLevel,
      timeSpent: 3600 - timeRemaining,
      completedAt: new Date().toISOString(),
      answers,
      markedForReview: Array.from(markedForReview)
    };
    
    const testResults = JSON.parse(localStorage.getItem("testResults") || "[]");
    testResults.push(result);
    localStorage.setItem("testResults", JSON.stringify(testResults));
    
    localStorage.removeItem("currentTest");
    
    toast({
      title: "Assessment Complete!",
      description: `Your score: ${score}%`,
    });
    
    navigate("/student/dashboard");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMarkForReview = () => {
    const newMarked = new Set(markedForReview);
    if (newMarked.has(currentQuestion)) {
      newMarked.delete(currentQuestion);
      toast({ title: "Unmarked", description: "Question removed from review list" });
    } else {
      newMarked.add(currentQuestion);
      toast({ title: "Marked for Review", description: "You can revisit this question later" });
    }
    setMarkedForReview(newMarked);
  };

  if (!studentData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      {/* Top Cloud Bubble - Global Header */}
      <div className="sticky top-4 z-50 mx-4 mt-4">
        <div className="cloud-bubble-top px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-md">
                <span className="text-lg font-bold text-primary-foreground">P</span>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">PISA Practice Platform</h2>
                <p className="text-xs text-muted-foreground">
                  {practiceComplete ? `${assignedLevel?.toUpperCase()} Level` : "Practice Round"}
                </p>
              </div>
            </div>

            {/* Center: Timer */}
            <div className="flex items-center gap-2 px-5 py-2.5 bg-card/80 rounded-full shadow-sm border border-border/50">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-mono font-bold text-lg text-foreground">{formatTime(timeRemaining)}</span>
            </div>

            {/* Right: Question Navigation Bubbles */}
            <div className="flex items-center gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentQuestion(idx);
                    setSelectedAnswer(answers[idx] || "");
                  }}
                  className={`question-nav-bubble relative ${
                    idx === currentQuestion ? "active" : answers[idx] ? "answered" : "unanswered"
                  }`}
                >
                  {idx + 1}
                  {markedForReview.has(idx) && (
                    <Flag className="h-3 w-3 absolute -top-1 -right-1 fill-warning text-warning" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Middle Cloud Bubble */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="cloud-bubble-main p-6">
          {/* 60/40 Split Layout */}
          <div className="grid lg:grid-cols-5 gap-8 min-h-[calc(100vh-220px)]">
            
            {/* Left Panel - Reading Passage (60%) */}
            <div className="lg:col-span-3">
              <div className="passage-bubble h-full">
                <div className="mb-6 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground font-poppins">Reading Passage</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">{questions[currentQuestion].title}</p>
                </div>
                
                {/* Passage Text with Serif Font */}
                <div className="passage-text">
                  {questions[currentQuestion].passage.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Question & Answers (40%) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="question-bubble flex-1">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full">
                      Question {currentQuestion + 1} of {questions.length}
                    </span>
                    {practiceComplete && (
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {questions[currentQuestion].difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground leading-relaxed">
                    {questions[currentQuestion].question}
                  </h3>
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {questions[currentQuestion].options?.map((option, idx) => (
                    <label
                      key={idx}
                      className={`answer-card ${selectedAnswer === option ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={selectedAnswer === option}
                        onChange={() => handleAnswerSelect(option)}
                        className="sr-only"
                      />
                      <div className="flex-shrink-0 w-7 h-7 rounded-full border-2 border-muted-foreground/50 flex items-center justify-center transition-all">
                        {selectedAnswer === option && (
                          <div className="w-4 h-4 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-sm text-foreground leading-relaxed">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mark for Review */}
              <Button
                variant="outline"
                onClick={toggleMarkForReview}
                className={`w-full rounded-xl ${markedForReview.has(currentQuestion) ? 'border-warning text-warning' : ''}`}
              >
                <Flag className={`h-4 w-4 mr-2 ${markedForReview.has(currentQuestion) ? 'fill-warning' : ''}`} />
                {markedForReview.has(currentQuestion) ? 'Marked for Review' : 'Mark for Review'}
              </Button>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestion === 0}
                  className="nav-btn-prev flex-1"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  className="nav-btn-next flex-1"
                >
                  {currentQuestion === questions.length - 1 && practiceComplete ? 'Submit' : 'Next'}
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentInterface;
