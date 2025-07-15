'use client';

import { useState, useEffect } from 'react';
import { getRegistrations, getShowcases } from '@/app/actions/registration-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

type Submission = {
  id: string;
  submittedAt: string;
  [key: string]: any;
};

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'password';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [registrations, setRegistrations] = useState<Submission[]>([]);
  const [showcases, setShowcases] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      async function loadData() {
        setLoading(true);
        const [regResult, showcaseResult] = await Promise.all([
          getRegistrations(),
          getShowcases()
        ]);

        if (regResult.success) {
          setRegistrations(regResult.data);
        } else {
          toast({
            title: 'Error Loading Registrations',
            description: regResult.error,
            variant: 'destructive',
          });
        }

        if (showcaseResult.success) {
          setShowcases(showcaseResult.data);
        } else {
            toast({
                title: 'Error Loading Showcases',
                description: showcaseResult.error,
                variant: 'destructive',
            });
        }
        setLoading(false);
      }
      loadData();
    }
  }, [isAuthenticated, toast]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      toast({
        title: 'Authentication Failed',
        description: 'Incorrect password.',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <CardDescription>Enter the password to view submissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <Toaster />
      </>
    );
  }

  const renderTable = (data: Submission[], type: 'registration' | 'showcase') => {
      const mainKeys = type === 'registration' 
        ? ['full_name', 'email'] 
        : ['projectName', 'presenterName', 'presenterEmail'];

      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submission Date</TableHead>
              {mainKeys.map(key => <TableHead key={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</TableHead>)}
              <TableHead>Other Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{new Date(item.submittedAt).toLocaleString()}</TableCell>
                {mainKeys.map(key => <TableCell key={key}>{item[key] || 'N/A'}</TableCell>)}
                <TableCell>
                  {Object.entries(item)
                    .filter(([key]) => !['id', 'submittedAt', ...mainKeys].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}:</span> {String(value)}
                      </div>
                    ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-primary">Event Submissions</h1>
      <Tabs defaultValue="registrations">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registrations">Registrations ({registrations.length})</TabsTrigger>
          <TabsTrigger value="showcases">Project Showcases ({showcases.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="registrations">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                 <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                 </div>
              ) : registrations.length > 0 ? (
                renderTable(registrations, 'registration')
              ) : (
                <p className="text-center text-muted-foreground py-8">No registrations yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="showcases">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : showcases.length > 0 ? (
                renderTable(showcases, 'showcase')
              ) : (
                <p className="text-center text-muted-foreground py-8">No project showcases submitted yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}
