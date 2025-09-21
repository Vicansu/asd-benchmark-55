import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Users, BookOpen, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("student");

  const handleLogin = (userType: string) => {
    if (userType === "student") {
      navigate("/student/dashboard");
    } else {
      navigate("/teacher/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-6 animate-fade-in">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="p-3 bg-primary rounded-2xl shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">PISA Practice</h1>
              <p className="text-muted-foreground">Assessment Platform</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-medium text-foreground">
              Professional Assessment Experience
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Experience PISA-style assessments with adaptive testing, comprehensive analytics, 
              and detailed performance insights for both students and teachers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl shadow-sm">
              <BookOpen className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-medium">Adaptive Testing</h3>
                <p className="text-sm text-muted-foreground">Smart difficulty adjustment</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl shadow-sm">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-medium">Detailed Analytics</h3>
                <p className="text-sm text-muted-foreground">Comprehensive insights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="p-8 shadow-xl animate-scale-in">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="student" className="text-base py-3">
                Student Login
              </TabsTrigger>
              <TabsTrigger value="teacher" className="text-base py-3">
                Teacher Login
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-semibold">Welcome Back, Student</h3>
                <p className="text-muted-foreground">Continue your PISA practice journey</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email Address</Label>
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="Enter your email"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input
                    id="student-password"
                    type="password"
                    placeholder="Enter your password"
                    className="h-12"
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleLogin("student")}
                className="w-full h-12 btn-primary-material group"
              >
                Sign In to Dashboard
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => navigate("/signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="teacher" className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-semibold">Welcome Back, Teacher</h3>
                <p className="text-muted-foreground">Access your teaching dashboard</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Email Address</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    placeholder="Enter your email"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-password">Password</Label>
                  <Input
                    id="teacher-password"
                    type="password"
                    placeholder="Enter your password"
                    className="h-12"
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleLogin("teacher")}
                className="w-full h-12 btn-primary-material group"
              >
                Access Teaching Dashboard
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Need a teacher account?{" "}
                  <button 
                    onClick={() => navigate("/signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;