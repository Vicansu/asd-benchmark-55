import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { BookOpen, TrendingUp, Award, LogOut, Code, ChartLine, History, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ActiveSection = "home" | "performance" | "history" | "profile";

const NewStudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<any>(null);
  const [testCode, setTestCode] = useState("");
  const [testResults, setTestResults] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<ActiveSection>("home");

  useEffect(() => {
    const currentStudent = localStorage.getItem("currentStudent");
    if (!currentStudent) {
      navigate('/');
      return;
    }
    const studentData = JSON.parse(currentStudent);
    setStudent(studentData);

    const results = JSON.parse(localStorage.getItem("testResults") || "[]");
    const studentResults = results.filter((r: any) => r.studentId === studentData.studentId);
    setTestResults(studentResults);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentStudent");
    localStorage.removeItem("userRole");
    toast({ title: "Logged out", description: "See you next time!" });
    navigate('/');
  };

  const handleEnterTestCode = () => {
    if (!testCode.trim()) {
      toast({ title: "Error", description: "Please enter a test code", variant: "destructive" });
      return;
    }

    if (testCode.length !== 6) {
      toast({ title: "Error", description: "Test code must be 6 characters", variant: "destructive" });
      return;
    }

    const tests = JSON.parse(localStorage.getItem("tests") || "[]");
    const test = tests.find((t: any) => t.testCode === testCode.toUpperCase());

    if (!test) {
      toast({ title: "Error", description: "Invalid test code", variant: "destructive" });
      return;
    }

    const hasAlreadyTaken = testResults.some(r => r.testCode === testCode.toUpperCase());
    if (hasAlreadyTaken) {
      toast({ title: "Already Taken", description: "You have already completed this test", variant: "destructive" });
      return;
    }

    localStorage.setItem('currentTest', JSON.stringify(test));
    localStorage.setItem("studentData", JSON.stringify(student));
    navigate('/assessment');
  };

  if (!student) return null;

  const avgScore = testResults.length > 0 
    ? (testResults.reduce((sum, r) => sum + (r.score || 0), 0) / testResults.length).toFixed(1)
    : 0;

  const scoreData = testResults.slice(0, 10).reverse().map((r, i) => ({
    name: `Test ${i + 1}`,
    score: r.score || 0
  }));

  const subjectData = Object.entries(
    testResults.reduce((acc: any, r) => {
      const subject = r.subject || 'Unknown';
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const difficultyData = Object.entries(
    testResults.reduce((acc: any, r) => {
      const diff = r.difficultyLevel || 'Unknown';
      acc[diff] = (acc[diff] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  // Render section content
  const renderSection = () => {
    switch (activeSection) {
      case "performance":
        return (
          <div className="space-y-6 animate-fade-in">
            <Card className="cloud-bubble p-6">
              <h3 className="text-xl font-semibold mb-2">Score Trend</h3>
              <p className="text-muted-foreground text-sm mb-4">Your performance over time</p>
              {scoreData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '1rem'
                      }} 
                    />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-12">No test data yet. Take a test to see your progress!</p>
              )}
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="cloud-bubble p-6">
                <h3 className="text-lg font-semibold mb-4">Tests by Subject</h3>
                {subjectData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={subjectData} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} outerRadius={80} fill="#8884d8" dataKey="value">
                        {subjectData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No data yet</p>
                )}
              </Card>

              <Card className="cloud-bubble p-6">
                <h3 className="text-lg font-semibold mb-4">Difficulty Levels</h3>
                {difficultyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={difficultyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No data yet</p>
                )}
              </Card>
            </div>
          </div>
        );

      case "history":
        return (
          <Card className="cloud-bubble p-6 animate-fade-in">
            <h3 className="text-xl font-semibold mb-2">Test History</h3>
            <p className="text-muted-foreground text-sm mb-6">All your completed assessments</p>
            <div className="space-y-4">
              {testResults.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No tests taken yet. Enter a test code to get started!</p>
              ) : (
                testResults.map((result, idx) => (
                  <div key={idx} className="flex justify-between items-center p-5 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">{result.testTitle || 'Assessment'}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(result.completedAt).toLocaleDateString()} • {result.difficultyLevel || 'Standard'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">{result.score}%</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(result.timeSpent / 60)} min
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        );

      case "profile":
        return (
          <Card className="cloud-bubble p-8 animate-fade-in">
            <h3 className="text-xl font-semibold mb-2">Your Profile</h3>
            <p className="text-muted-foreground text-sm mb-6">Personal information</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Student ID</p>
                  <p className="text-lg font-semibold mt-1">{student.studentId}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</p>
                  <p className="text-lg font-semibold mt-1">{student.fullName}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Grade & Class</p>
                  <p className="text-lg font-semibold mt-1">{student.grade}-{student.class}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Gender</p>
                  <p className="text-lg font-semibold mt-1">{student.gender}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Age</p>
                  <p className="text-lg font-semibold mt-1">{student.age} years</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-xl">
                  <p className="text-xs text-primary uppercase tracking-wide">Tests Completed</p>
                  <p className="text-lg font-semibold mt-1 text-primary">{testResults.length}</p>
                </div>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {activeSection === "home" ? "Student Dashboard" : (
                activeSection === "performance" ? "Performance" :
                activeSection === "history" ? "Test History" : "Profile"
              )}
            </h1>
            <p className="text-muted-foreground">Welcome back, {student.fullName}!</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="rounded-xl">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Back button when in a section */}
        {activeSection !== "home" && (
          <button
            onClick={() => setActiveSection("home")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Dashboard</span>
          </button>
        )}

        {activeSection === "home" ? (
          <>
            {/* Test Code Entry */}
            <Card className="cloud-bubble p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Enter Test Code</h3>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter 6-letter code (e.g., E1A2B3)"
                      value={testCode}
                      onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                      className="input-glassy uppercase text-lg tracking-wider"
                      maxLength={6}
                    />
                    <Button onClick={handleEnterTestCode} className="nav-btn-next px-8">
                      Start Test
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <Card className="cloud-bubble p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tests Taken</p>
                    <p className="text-2xl font-bold">{testResults.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="cloud-bubble p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">{avgScore}%</p>
                  </div>
                </div>
              </Card>

              <Card className="cloud-bubble p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <Award className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subjects</p>
                    <p className="text-2xl font-bold">All</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Navigation Bubbles */}
            <h2 className="text-xl font-semibold mb-6">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button onClick={() => setActiveSection("performance")} className="nav-bubble">
                <div className="nav-bubble-icon">
                  <ChartLine className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Performance</h3>
                  <p className="text-sm text-muted-foreground mt-1">View your progress & analytics</p>
                </div>
              </button>

              <button onClick={() => setActiveSection("history")} className="nav-bubble">
                <div className="nav-bubble-icon">
                  <History className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Test History</h3>
                  <p className="text-sm text-muted-foreground mt-1">All your completed tests</p>
                </div>
              </button>

              <button onClick={() => setActiveSection("profile")} className="nav-bubble">
                <div className="nav-bubble-icon">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Profile</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your personal information</p>
                </div>
              </button>
            </div>
          </>
        ) : (
          renderSection()
        )}
      </div>
    </div>
  );
};

export default NewStudentDashboard;
