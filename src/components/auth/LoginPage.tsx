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

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [studentForm, setStudentForm] = useState({
    studentId: "", fullName: "", grade: "", class: "", gender: "", age: "", subject: ""
  });

  const [teacherForm, setTeacherForm] = useState({
    name: "", subject: "", password: ""
  });

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.studentId || !studentForm.fullName || !studentForm.grade || 
        !studentForm.class || !studentForm.gender || !studentForm.age || !studentForm.subject) {
      toast({ title: "Missing Information", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    localStorage.setItem("studentData", JSON.stringify(studentForm));
    localStorage.setItem("userRole", "student");
    toast({ title: "Welcome!", description: `Starting your ${studentForm.subject} assessment` });
    navigate("/assessment");
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name || !teacherForm.subject || !teacherForm.password) {
      toast({ title: "Missing Information", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (teacherForm.password !== "teacher2024") {
      toast({ title: "Invalid Password", description: "Please check your password", variant: "destructive" });
      return;
    }
    localStorage.setItem("teacherData", JSON.stringify(teacherForm));
    localStorage.setItem("userRole", "teacher");
    toast({ title: "Welcome Back!", description: "Redirecting to dashboard..." });
    navigate("/teacher/dashboard");
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
              <GraduationCap className="h-4 w-4" />Student Login
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />Teacher Login
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Grade *</Label>
                  <Select value={studentForm.grade} onValueChange={(value) => setStudentForm({...studentForm, grade: value})}>
                    <SelectTrigger className="input-glassy"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {[6, 7, 8, 9, 10, 11, 12].map(g => <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select value={studentForm.class} onValueChange={(value) => setStudentForm({...studentForm, class: value})}>
                    <SelectTrigger className="input-glassy"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['A', 'B', 'C', 'D', 'E'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Age *</Label>
                  <Input type="number" placeholder="Age" value={studentForm.age}
                    onChange={(e) => setStudentForm({...studentForm, age: e.target.value})} className="input-glassy" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select value={studentForm.gender} onValueChange={(value) => setStudentForm({...studentForm, gender: value})}>
                    <SelectTrigger className="input-glassy"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select value={studentForm.subject} onValueChange={(value) => setStudentForm({...studentForm, subject: value})}>
                    <SelectTrigger className="input-glassy"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full nav-btn-next mt-6">Start Assessment</Button>
            </form>
          </TabsContent>

          <TabsContent value="teacher">
            <form onSubmit={handleTeacherLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input placeholder="Enter your name" value={teacherForm.name}
                  onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})} className="input-glassy" />
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={teacherForm.subject} onValueChange={(value) => setTeacherForm({...teacherForm, subject: value})}>
                  <SelectTrigger className="input-glassy"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input type="password" placeholder="Enter password" value={teacherForm.password}
                  onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})} className="input-glassy" />
              </div>
              <Button type="submit" className="w-full nav-btn-next mt-6">Login to Dashboard</Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoginPage;
