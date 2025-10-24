import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signIn, user } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(true);
  const [studentForm, setStudentForm] = useState({
    email: "", password: "", studentId: "", fullName: "", grade: "", class: "", gender: "", age: "", subject: ""
  });

  const [teacherForm, setTeacherForm] = useState({
    email: "", password: "", fullName: "", subject: ""
  });

  // Redirect if already logged in
  if (user) {
    setTimeout(() => navigate('/dashboard'), 0);
    return null;
  }

  const handleStudentAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.email || !studentForm.password || !studentForm.studentId || !studentForm.fullName || 
        !studentForm.grade || !studentForm.class || !studentForm.gender || !studentForm.age || !studentForm.subject) {
      toast({ title: "Missing Information", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const { error } = isSignUp 
      ? await signUp(studentForm.email, studentForm.password, {
          role: 'student',
          fullName: studentForm.fullName,
          studentId: studentForm.studentId,
          grade: studentForm.grade,
          class: studentForm.class,
          gender: studentForm.gender,
          age: parseInt(studentForm.age),
          subject: studentForm.subject
        })
      : await signIn(studentForm.email, studentForm.password);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: isSignUp ? "Account created!" : "Welcome back!" });
      navigate("/dashboard");
    }
  };

  const handleTeacherAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.email || !teacherForm.password || !teacherForm.fullName || !teacherForm.subject) {
      toast({ title: "Missing Information", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    if (isSignUp && teacherForm.password !== "Amb@ssador#Bench!") {
      toast({ title: "Invalid Admin Password", description: "Please check your password", variant: "destructive" });
      return;
    }

    const { error } = isSignUp
      ? await signUp(teacherForm.email, teacherForm.password, {
          role: 'teacher',
          fullName: teacherForm.fullName,
          subject: teacherForm.subject
        })
      : await signIn(teacherForm.email, teacherForm.password);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: isSignUp ? "Account created!" : "Welcome back!" });
      navigate("/teacher/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl cloud-bubble p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">ASD Benchmark Assessment</h1>
          <p className="text-muted-foreground">Professional PISA-Style Assessment Platform</p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />Student
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />Teacher
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <div className="mb-4 flex gap-2 justify-center">
              <Button 
                variant={isSignUp ? "default" : "outline"} 
                onClick={() => setIsSignUp(true)}
                className="flex-1"
              >
                Sign Up
              </Button>
              <Button 
                variant={!isSignUp ? "default" : "outline"} 
                onClick={() => setIsSignUp(false)}
                className="flex-1"
              >
                Login
              </Button>
            </div>

            <form onSubmit={handleStudentAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-email">Email *</Label>
                <Input id="student-email" type="email" placeholder="Enter email" value={studentForm.email}
                  onChange={(e) => setStudentForm({...studentForm, email: e.target.value})} className="input-glassy" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-password">Password *</Label>
                <Input id="student-password" type="password" placeholder="Enter password" value={studentForm.password}
                  onChange={(e) => setStudentForm({...studentForm, password: e.target.value})} className="input-glassy" />
              </div>

              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID *</Label>
                    <Input id="studentId" placeholder="Enter student ID" value={studentForm.studentId}
                      onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value})} className="input-glassy" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" placeholder="Enter full name" value={studentForm.fullName}
                      onChange={(e) => setStudentForm({...studentForm, fullName: e.target.value})} className="input-glassy" />
                  </div>

                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Select value={studentForm.subject} onValueChange={(value) => setStudentForm({...studentForm, subject: value})}>
                      <SelectTrigger className="input-glassy"><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade *</Label>
                    <Input id="grade" placeholder="e.g., 10" value={studentForm.grade}
                      onChange={(e) => setStudentForm({...studentForm, grade: e.target.value})} className="input-glassy" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class">Class *</Label>
                    <Input id="class" placeholder="e.g., A" value={studentForm.class}
                      onChange={(e) => setStudentForm({...studentForm, class: e.target.value})} className="input-glassy" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Input id="gender" placeholder="e.g., Male, Female, Other" value={studentForm.gender}
                      onChange={(e) => setStudentForm({...studentForm, gender: e.target.value})} className="input-glassy" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input id="age" type="number" placeholder="Enter age" value={studentForm.age}
                      onChange={(e) => setStudentForm({...studentForm, age: e.target.value})} className="input-glassy" />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full nav-btn-next mt-6">
                {isSignUp ? "Sign Up" : "Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="teacher">
            <div className="mb-4 flex gap-2 justify-center">
              <Button 
                variant={isSignUp ? "default" : "outline"} 
                onClick={() => setIsSignUp(true)}
                className="flex-1"
              >
                Sign Up
              </Button>
              <Button 
                variant={!isSignUp ? "default" : "outline"} 
                onClick={() => setIsSignUp(false)}
                className="flex-1"
              >
                Login
              </Button>
            </div>

            <form onSubmit={handleTeacherAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-email">Email *</Label>
                <Input id="teacher-email" type="email" placeholder="Enter email" value={teacherForm.email}
                  onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})} className="input-glassy" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher-password">{isSignUp ? "Admin Password" : "Password"} *</Label>
                <Input id="teacher-password" type="password" 
                  placeholder={isSignUp ? "Enter admin password" : "Enter password"} 
                  value={teacherForm.password}
                  onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})} className="input-glassy" />
              </div>

              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-name">Full Name *</Label>
                    <Input id="teacher-name" placeholder="Enter your name" value={teacherForm.fullName}
                      onChange={(e) => setTeacherForm({...teacherForm, fullName: e.target.value})} className="input-glassy" />
                  </div>

                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Select value={teacherForm.subject} onValueChange={(value) => setTeacherForm({...teacherForm, subject: value})}>
                      <SelectTrigger className="input-glassy"><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full nav-btn-next mt-6">
                {isSignUp ? "Sign Up" : "Login to Dashboard"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoginPage;
