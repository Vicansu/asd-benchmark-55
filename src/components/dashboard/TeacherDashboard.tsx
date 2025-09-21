import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Plus,
  Settings,
  Download,
  BarChart3,
  Clock,
  Award,
  Target
} from "lucide-react";

const TeacherDashboard = () => {
  const classStats = [
    { name: "Class 10A", students: 28, avgScore: 85, trend: +3 },
    { name: "Class 10B", students: 25, avgScore: 78, trend: -1 },
    { name: "Class 10C", students: 30, avgScore: 92, trend: +5 },
  ];

  const recentActivity = [
    { student: "Alice Johnson", assessment: "Reading Comprehension", score: 92, time: "2 hours ago" },
    { student: "Bob Smith", assessment: "Mathematical Literacy", score: 78, time: "4 hours ago" },
    { student: "Carol Davis", assessment: "Scientific Literacy", score: 88, time: "1 day ago" },
  ];

  const subjectPerformance = [
    { subject: "Reading", avgScore: 85, students: 83, improvement: +5 },
    { subject: "Mathematics", avgScore: 78, students: 83, improvement: -2 },
    { subject: "Science", avgScore: 82, students: 83, improvement: +3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, Dr. Sarah Wilson</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Questions
              </Button>
              <Button className="btn-primary-material">
                <Plus className="h-4 w-4 mr-2" />
                Create Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold">83</p>
                <p className="text-xs text-success">+3 this month</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Assessments</p>
                <p className="text-3xl font-bold">12</p>
              </div>
              <BookOpen className="h-8 w-8 text-secondary" />
            </div>
          </Card>

          <Card className="p-6 card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Class Score</p>
                <p className="text-3xl font-bold">82%</p>
                <p className="text-xs text-success">+2% this week</p>
              </div>
              <Award className="h-8 w-8 text-success" />
            </div>
          </Card>

          <Card className="p-6 card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold">94%</p>
              </div>
              <Target className="h-8 w-8 text-warning" />
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Class Performance */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Class Performance Overview
                </h2>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
              <div className="space-y-4">
                {classStats.map((classInfo) => (
                  <div key={classInfo.name} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{classInfo.name}</h3>
                      <Badge variant={classInfo.trend > 0 ? "default" : "secondary"}>
                        {classInfo.trend > 0 ? '+' : ''}{classInfo.trend}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{classInfo.students} students</span>
                      <span className="font-medium">Average: {classInfo.avgScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Subject Performance */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Subject Performance Analysis</h2>
              <div className="space-y-4">
                {subjectPerformance.map((subject) => (
                  <div key={subject.subject} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{subject.subject}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{subject.avgScore}%</span>
                        <span className={`text-sm ${subject.improvement > 0 ? 'text-success' : 'text-destructive'}`}>
                          {subject.improvement > 0 ? '+' : ''}{subject.improvement}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {subject.students} students participated
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Student Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{activity.student}</h3>
                      <p className="text-sm text-muted-foreground">
                        Completed {activity.assessment}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{activity.score}%</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
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
                <Button className="w-full btn-primary-material justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Assessment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Questions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  View All Students
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Analytics
                </Button>
              </div>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deadlines
              </h2>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h3 className="font-medium">Scientific Literacy Test</h3>
                  <p className="text-sm text-muted-foreground">Due: Jan 20, 2024</p>
                  <Badge variant="outline" className="mt-1">Class 10A</Badge>
                </div>
                <div className="p-3 border rounded-lg">
                  <h3 className="font-medium">Problem Solving Assessment</h3>
                  <p className="text-sm text-muted-foreground">Due: Jan 25, 2024</p>
                  <Badge variant="outline" className="mt-1">All Classes</Badge>
                </div>
              </div>
            </Card>

            {/* Performance Insights */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Insights
              </h2>
              <div className="space-y-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary">Top Performer</p>
                  <p className="text-sm">Class 10C leads with 92% average</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="text-sm font-medium text-warning">Needs Attention</p>
                  <p className="text-sm">Mathematics scores declined by 2%</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="text-sm font-medium text-success">Improvement</p>
                  <p className="text-sm">Reading scores up 5% this month</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;