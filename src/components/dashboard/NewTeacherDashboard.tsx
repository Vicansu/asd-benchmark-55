import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Upload, Users, TrendingUp, BarChart3, LogOut, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

const NewTeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload form
  const [testTitle, setTestTitle] = useState("");
  const [testSubject, setTestSubject] = useState("");
  const [testDuration, setTestDuration] = useState("60");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      setProfile(profileData);

      // Load tests created by this teacher
      const { data: testsData } = await supabase
        .from('tests')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      setTests(testsData || []);

      // Load all test results
      const { data: resultsData } = await supabase
        .from('test_results')
        .select(`
          *,
          tests!inner(created_by),
          profiles!test_results_student_id_fkey(full_name, gender, grade, class)
        `)
        .eq('tests.created_by', user?.id);

      setAllResults(resultsData || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle || !testSubject) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      // Generate test code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_test_code', { subject_param: testSubject });

      if (codeError) throw codeError;

      // Create test
      const { error: insertError } = await supabase
        .from('tests')
        .insert({
          test_code: codeData,
          subject: testSubject,
          title: testTitle,
          duration_minutes: parseInt(testDuration),
          created_by: user?.id
        });

      if (insertError) throw insertError;

      toast({ 
        title: "Test Created!", 
        description: `Test code: ${codeData}`,
        duration: 5000
      });

      // Reset form and reload
      setTestTitle("");
      setTestSubject("");
      setTestDuration("60");
      loadDashboardData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const copyTestCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: "Test code copied to clipboard" });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Analytics calculations
  const avgScore = allResults.length > 0
    ? (allResults.reduce((sum, r) => sum + (r.score || 0), 0) / allResults.length).toFixed(1)
    : 0;

  const genderPerformance = Object.entries(
    allResults.reduce((acc: any, r) => {
      const gender = r.profiles?.gender || 'Unknown';
      if (!acc[gender]) acc[gender] = { total: 0, count: 0 };
      acc[gender].total += r.score || 0;
      acc[gender].count += 1;
      return acc;
    }, {})
  ).map(([gender, data]: [string, any]) => ({
    gender,
    avgScore: (data.total / data.count).toFixed(1)
  }));

  const classPerformance = Object.entries(
    allResults.reduce((acc: any, r) => {
      const className = `${r.profiles?.grade}-${r.profiles?.class}` || 'Unknown';
      if (!acc[className]) acc[className] = { total: 0, count: 0 };
      acc[className].total += r.score || 0;
      acc[className].count += 1;
      return acc;
    }, {})
  ).map(([name, data]: [string, any]) => ({
    name,
    avgScore: (data.total / data.count).toFixed(1)
  }));

  const performanceTrend = allResults
    .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
    .slice(-10)
    .map((r, i) => ({
      test: `T${i + 1}`,
      score: r.score || 0
    }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {profile?.full_name}!</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="cloud-bubble p-6">
            <div className="flex items-center gap-4">
              <Upload className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Tests Created</p>
                <p className="text-3xl font-bold">{tests.length}</p>
              </div>
            </div>
          </Card>

          <Card className="cloud-bubble p-6">
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold">{new Set(allResults.map(r => r.student_id)).size}</p>
              </div>
            </div>
          </Card>

          <Card className="cloud-bubble p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-3xl font-bold">{avgScore}%</p>
              </div>
            </div>
          </Card>

          <Card className="cloud-bubble p-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Tests Taken</p>
                <p className="text-3xl font-bold">{allResults.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create Test</TabsTrigger>
            <TabsTrigger value="tests">My Tests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card className="cloud-bubble p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Test</h3>
              <form onSubmit={handleCreateTest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testTitle">Test Title *</Label>
                  <Input
                    id="testTitle"
                    placeholder="e.g., Midterm Assessment"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="input-glassy"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select value={testSubject} onValueChange={setTestSubject}>
                    <SelectTrigger className="input-glassy">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={testDuration}
                    onChange={(e) => setTestDuration(e.target.value)}
                    className="input-glassy"
                  />
                </div>

                <Button type="submit" disabled={uploading} className="w-full nav-btn-next">
                  {uploading ? "Creating..." : "Create Test"}
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card className="cloud-bubble p-6">
              <h3 className="text-lg font-semibold mb-4">Your Tests</h3>
              <div className="space-y-4">
                {tests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No tests created yet</p>
                ) : (
                  tests.map((test) => (
                    <div key={test.id} className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{test.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {test.subject} • {test.duration_minutes} min • {new Date(test.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <p className="text-lg font-bold text-primary">{test.test_code}</p>
                          <p className="text-xs text-muted-foreground">Test Code</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyTestCode(test.test_code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="cloud-bubble p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="test" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="cloud-bubble p-6">
                <h3 className="text-lg font-semibold mb-4">Gender Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={genderPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="gender" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgScore" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="cloud-bubble p-6">
                <h3 className="text-lg font-semibold mb-4">Class Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={classPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgScore" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <Card className="cloud-bubble p-6">
              <h3 className="text-lg font-semibold mb-4">Individual Student Performance</h3>
              <div className="space-y-4">
                {allResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No student results yet</p>
                ) : (
                  allResults.map((result) => (
                    <div key={result.id} className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                      <div>
                        <p className="font-medium">{result.profiles?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">
                          Grade {result.profiles?.grade}-{result.profiles?.class} • {result.profiles?.gender} • {result.difficulty_level}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{result.score}%</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NewTeacherDashboard;
