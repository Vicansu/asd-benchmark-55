import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Award, 
  Target, 
  Users,
  BarChart3,
  Play,
  History,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const recentAssessments = [
    { id: 1, title: "Reading Comprehension", score: 85, date: "2024-01-15", duration: "45 min" },
    { id: 2, title: "Mathematical Literacy", score: 78, date: "2024-01-12", duration: "60 min" },
    { id: 3, title: "Scientific Literacy", score: 92, date: "2024-01-10", duration: "55 min" },
  ];

  const subjectPerformance = [
    { subject: "Reading", score: 85, change: +5 },
    { subject: "Mathematics", score: 78, change: -2 },
    { subject: "Science", score: 92, change: +8 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Student Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, Alex Johnson</p>
            </div>
            <Button 
              onClick={() => navigate("/assessment")}
              className="btn-primary-material"
            >
              <Play className="h-4 w-4 mr-2" />
              Start New Assessment
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assessments</p>
                <p className="text-3xl font-bold">12</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold">85%</p>
              </div>
              <Award className="h-8 w-8 text-secondary" />
            </div>
          </Card>

          <Card className="p-6 card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Spent</p>
                <p className="text-3xl font-bold">18h</p>
              </div>
              <Clock className="h-8 w-8 text-success" />
            </div>
          </Card>

          <Card className="p-6 card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Class Rank</p>
                <p className="text-3xl font-bold">#3</p>
                <p className="text-xs text-muted-foreground">out of 28</p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning" />
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Assessments */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Assessments
                </h2>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="space-y-4">
                {recentAssessments.map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{assessment.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {assessment.date} • {assessment.duration}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">{assessment.score}%</p>
                      <Button variant="ghost" size="sm" className="text-xs">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Performance Trends */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance by Subject
              </h2>
              <div className="space-y-4">
                {subjectPerformance.map((subject) => (
                  <div key={subject.subject} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subject.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{subject.score}%</span>
                        <span className={`text-sm ${subject.change > 0 ? 'text-success' : 'text-destructive'}`}>
                          {subject.change > 0 ? '+' : ''}{subject.change}%
                        </span>
                      </div>
                    </div>
                    <Progress value={subject.score} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate("/assessment")}
                  className="w-full btn-primary-material justify-start"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Assessment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Practice Mode
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </Card>

            {/* Class Comparison */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Class Comparison
              </h2>
              <div className="space-y-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">85%</p>
                  <p className="text-sm text-muted-foreground">Your Average</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold">78%</p>
                  <p className="text-sm text-muted-foreground">Class Average</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-success font-medium">
                    +7% above class average
                  </p>
                </div>
              </div>
            </Card>

            {/* Upcoming Assessments */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h3 className="font-medium">Scientific Literacy</h3>
                  <p className="text-sm text-muted-foreground">Due: Jan 20, 2024</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h3 className="font-medium">Problem Solving</h3>
                  <p className="text-sm text-muted-foreground">Due: Jan 25, 2024</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;