import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, UserCircle, ShieldCheck, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ADMIN_ID = "Amb@ssador#Bench!2025";

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const defaultRole = searchParams.get("role") || "student";
  const [activeTab, setActiveTab] = useState(defaultRole);
  const [isSignUp, setIsSignUp] = useState(true);
  
  const [studentForm, setStudentForm] = useState({
    studentId: "", password: "", fullName: "", grade: "", class: "", gender: "", age: ""
  });

  const [teacherForm, setTeacherForm] = useState({
    adminId: "", teacherId: "", password: "", fullName: "", subject: ""
  });

  useEffect(() => {
    if (searchParams.get("role")) {
      setActiveTab(searchParams.get("role") || "student");
    }
  }, [searchParams]);

  // Validation helpers
  const validateStudentId = (id: string) => id.trim().length >= 3 && id.trim().length <= 20;
  const validatePassword = (pass: string) => pass.length >= 4;
  const validateName = (name: string) => name.trim().length >= 2 && name.trim().length <= 50;

  const handleStudentAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      if (!studentForm.studentId || !studentForm.password || !studentForm.fullName || 
          !studentForm.grade || !studentForm.class || !studentForm.gender || !studentForm.age) {
        toast({ title: "Missing Information", description: "Please fill in all fields", variant: "destructive" });
        return;
      }

      if (!validateStudentId(studentForm.studentId)) {
        toast({ title: "Invalid Student ID", description: "Student ID must be 3-20 characters", variant: "destructive" });
        return;
      }

      if (!validatePassword(studentForm.password)) {
        toast({ title: "Weak Password", description: "Password must be at least 4 characters", variant: "destructive" });
        return;
      }

      if (!validateName(studentForm.fullName)) {
        toast({ title: "Invalid Name", description: "Name must be 2-50 characters", variant: "destructive" });
        return;
      }
      
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      if (students.find((s: any) => s.studentId === studentForm.studentId.trim())) {
        toast({ title: "Error", description: "Student ID already exists", variant: "destructive" });
        return;
      }
      
      const sanitizedStudent = {
        ...studentForm,
        studentId: studentForm.studentId.trim(),
        fullName: studentForm.fullName.trim(),
        grade: studentForm.grade.trim(),
        class: studentForm.class.trim(),
        age: studentForm.age.trim()
      };
      
      students.push(sanitizedStudent);
      localStorage.setItem("students", JSON.stringify(students));
      toast({ title: "Success!", description: "Account created! Please login." });
      setIsSignUp(false);
      setStudentForm({ ...studentForm, password: "" });
    } else {
      if (!studentForm.studentId || !studentForm.password) {
        toast({ title: "Missing Information", description: "Please enter Student ID and password", variant: "destructive" });
        return;
      }
      
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const student = students.find((s: any) => 
        s.studentId === studentForm.studentId.trim() && s.password === studentForm.password
      );
      
      if (!student) {
        toast({ title: "Error", description: "Invalid Student ID or password", variant: "destructive" });
        return;
      }
      
      localStorage.setItem("currentStudent", JSON.stringify(student));
      localStorage.setItem("userRole", "student");
      toast({ title: "Welcome!", description: `Logged in as ${student.fullName}` });
      navigate("/student/dashboard");
    }
  };

  const handleTeacherAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      if (!teacherForm.adminId || !teacherForm.teacherId || !teacherForm.password || 
          !teacherForm.fullName || !teacherForm.subject) {
        toast({ title: "Missing Information", description: "Please fill in all fields", variant: "destructive" });
        return;
      }
      
      if (teacherForm.adminId !== ADMIN_ID) {
        toast({ title: "Invalid Admin ID", description: "Please contact administrator for valid Admin ID", variant: "destructive" });
        return;
      }

      if (!validateStudentId(teacherForm.teacherId)) {
        toast({ title: "Invalid Teacher ID", description: "Teacher ID must be 3-20 characters", variant: "destructive" });
        return;
      }

      if (!validatePassword(teacherForm.password)) {
        toast({ title: "Weak Password", description: "Password must be at least 4 characters", variant: "destructive" });
        return;
      }

      if (!validateName(teacherForm.fullName)) {
        toast({ title: "Invalid Name", description: "Name must be 2-50 characters", variant: "destructive" });
        return;
      }
      
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      if (teachers.find((t: any) => t.teacherId === teacherForm.teacherId.trim())) {
        toast({ title: "Error", description: "Teacher ID already exists", variant: "destructive" });
        return;
      }
      
      const newTeacher = {
        teacherId: teacherForm.teacherId.trim(),
        password: teacherForm.password,
        fullName: teacherForm.fullName.trim(),
        subject: teacherForm.subject
      };
      
      teachers.push(newTeacher);
      localStorage.setItem("teachers", JSON.stringify(teachers));
      toast({ title: "Success!", description: "Account created! Please login with your password." });
      setIsSignUp(false);
      setTeacherForm({ adminId: "", teacherId: "", password: "", fullName: "", subject: "" });
    } else {
      if (!teacherForm.teacherId || !teacherForm.password) {
        toast({ title: "Missing Information", description: "Please enter Teacher ID and password", variant: "destructive" });
        return;
      }
      
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const teacher = teachers.find((t: any) => 
        t.teacherId === teacherForm.teacherId.trim() && t.password === teacherForm.password
      );
      
      if (!teacher) {
        toast({ title: "Error", description: "Invalid Teacher ID or password", variant: "destructive" });
        return;
      }
      
      localStorage.setItem("currentTeacher", JSON.stringify(teacher));
      localStorage.setItem("userRole", "teacher");
      toast({ title: "Welcome!", description: `Logged in as ${teacher.fullName}` });
      navigate("/teacher/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl cloud-bubble p-8 animate-enter">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">PISA Practice Platform</h1>
          <p className="text-muted-foreground">Sign in to continue</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 rounded-2xl p-1 bg-muted/50">
            <TabsTrigger value="student" className="flex items-center gap-2 rounded-xl">
              <GraduationCap className="h-4 w-4" />Student
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2 rounded-xl">
              <UserCircle className="h-4 w-4" />Teacher
            </TabsTrigger>
          </TabsList>

          {/* STUDENT TAB */}
          <TabsContent value="student">
            <div className="mb-6 flex gap-2 justify-center">
              <Button 
                variant={isSignUp ? "default" : "outline"} 
                onClick={() => setIsSignUp(true)}
                className="flex-1 rounded-xl"
              >
                Sign Up
              </Button>
              <Button 
                variant={!isSignUp ? "default" : "outline"} 
                onClick={() => setIsSignUp(false)}
                className="flex-1 rounded-xl"
              >
                Login
              </Button>
            </div>

            <form onSubmit={handleStudentAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-id">Student ID</Label>
                <Input 
                  id="student-id" 
                  placeholder="Enter student ID" 
                  value={studentForm.studentId}
                  onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value})} 
                  className="input-glassy" 
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-password">Password</Label>
                <Input 
                  id="student-password" 
                  type="password" 
                  placeholder="Enter password" 
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({...studentForm, password: e.target.value})} 
                  className="input-glassy" 
                />
              </div>

              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      placeholder="Enter full name" 
                      value={studentForm.fullName}
                      onChange={(e) => setStudentForm({...studentForm, fullName: e.target.value})} 
                      className="input-glassy" 
                      maxLength={50}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Input 
                        id="grade" 
                        placeholder="e.g., 10" 
                        value={studentForm.grade}
                        onChange={(e) => setStudentForm({...studentForm, grade: e.target.value})} 
                        className="input-glassy" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <Input 
                        id="class" 
                        placeholder="e.g., A" 
                        value={studentForm.class}
                        onChange={(e) => setStudentForm({...studentForm, class: e.target.value})} 
                        className="input-glassy" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select 
                        value={studentForm.gender} 
                        onValueChange={(value) => setStudentForm({...studentForm, gender: value})}
                      >
                        <SelectTrigger className="input-glassy">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input 
                        id="age" 
                        type="number" 
                        placeholder="Age" 
                        value={studentForm.age}
                        onChange={(e) => setStudentForm({...studentForm, age: e.target.value})} 
                        className="input-glassy"
                        min={5}
                        max={25}
                      />
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full nav-btn-next mt-6">
                {isSignUp ? "Sign Up" : "Login"}
              </Button>
            </form>
          </TabsContent>

          {/* TEACHER TAB */}
          <TabsContent value="teacher">
            <div className="mb-6 flex gap-2 justify-center">
              <Button 
                variant={isSignUp ? "default" : "outline"} 
                onClick={() => setIsSignUp(true)}
                className="flex-1 rounded-xl"
              >
                Sign Up
              </Button>
              <Button 
                variant={!isSignUp ? "default" : "outline"} 
                onClick={() => setIsSignUp(false)}
                className="flex-1 rounded-xl"
              >
                Login
              </Button>
            </div>

            <form onSubmit={handleTeacherAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="admin-id" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Admin ID
                  </Label>
                  <Input 
                    id="admin-id" 
                    type="password"
                    placeholder="Enter Admin ID to verify" 
                    value={teacherForm.adminId}
                    onChange={(e) => setTeacherForm({...teacherForm, adminId: e.target.value})} 
                    className="input-glassy" 
                  />
                  <p className="text-xs text-muted-foreground">Contact administrator for Admin ID</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="teacher-id">Teacher ID</Label>
                <Input 
                  id="teacher-id" 
                  placeholder={isSignUp ? "Create your Teacher ID" : "Enter Teacher ID"} 
                  value={teacherForm.teacherId}
                  onChange={(e) => setTeacherForm({...teacherForm, teacherId: e.target.value})} 
                  className="input-glassy" 
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher-password">Password</Label>
                <Input 
                  id="teacher-password" 
                  type="password" 
                  placeholder={isSignUp ? "Create your password" : "Enter your password"} 
                  value={teacherForm.password}
                  onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})} 
                  className="input-glassy" 
                />
              </div>

              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-name">Full Name</Label>
                    <Input 
                      id="teacher-name" 
                      placeholder="Enter your full name" 
                      value={teacherForm.fullName}
                      onChange={(e) => setTeacherForm({...teacherForm, fullName: e.target.value})} 
                      className="input-glassy" 
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select 
                      value={teacherForm.subject} 
                      onValueChange={(value) => setTeacherForm({...teacherForm, subject: value})}
                    >
                      <SelectTrigger className="input-glassy">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full nav-btn-next mt-6">
                {isSignUp ? "Sign Up" : "Login"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoginPage;
