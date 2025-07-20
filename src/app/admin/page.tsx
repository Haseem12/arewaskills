
'use client';

import { useState, useEffect } from 'react';
import { getRegistrations, getShowcases, getPosts, markSubmissionsAsPending, updateSubmissionStatus, deletePost } from '@/app/actions/registration-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Loader2, CheckCircle, Clock, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Submission = {
  id: string;
  submittedAt: string;
  status?: 'payment_pending' | 'awaiting_confirmation' | 'paid';
  paymentMethod?: string;
  receiptNumber?: string;
  [key: string]: any;
};

type Post = {
  id: string;
  slug: string;
  title: string;
  author: string;
  date: string;
  view_count: number;
};

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'password';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [registrations, setRegistrations] = useState<Submission[]>([]);
  const [showcases, setShowcases] = useState<Submission[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);

  const { toast } = useToast();

  const [selectedRegistrations, setSelectedRegistrations] = useState<Set<string>>(new Set());
  const [selectedShowcases, setSelectedShowcases] = useState<Set<string>>(new Set());

  async function loadData() {
    setLoading(true);
    const [regResult, showcaseResult, postResult] = await Promise.all([
      getRegistrations(),
      getShowcases(),
      getPosts(),
    ]);

    if (regResult.success && regResult.data) {
      setRegistrations(regResult.data);
    } else {
      toast({
        title: 'Error Loading Registrations',
        description: regResult.error,
        variant: 'destructive',
      });
    }

    if (showcaseResult.success && showcaseResult.data) {
      setShowcases(showcaseResult.data);
    } else {
      toast({
        title: 'Error Loading Showcases',
        description: showcaseResult.error,
        variant: 'destructive',
      });
    }
    
    if (postResult.success && postResult.data) {
      setPosts(postResult.data);
    } else {
       toast({
        title: 'Error Loading Posts',
        description: postResult.error,
        variant: 'destructive',
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    if (isAuthenticated) {
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
  
  const handleSendPaymentRequest = async () => {
    setIsSending(true);
    const selectedIds = [...selectedRegistrations, ...selectedShowcases];
    
    if (selectedIds.length === 0) {
        toast({ title: "No users selected", description: "Please select at least one user to send a payment request.", variant: "destructive"});
        setIsSending(false);
        return;
    }
    
    const result = await markSubmissionsAsPending(selectedIds);

    if(result.success) {
        toast({
            title: "Payment Requests Sent!",
            description: `Successfully marked ${selectedIds.length} user(s) as pending payment.`,
        });
        setSelectedRegistrations(new Set());
        setSelectedShowcases(new Set());
        await loadData(); // Refresh data
    } else {
        toast({ title: "An Error Occurred", description: result.error, variant: "destructive" });
    }
    setIsSending(false);
  };
  
  const handleConfirmPayment = async (id: string) => {
    setConfirmingPaymentId(id);
    const result = await updateSubmissionStatus(id, 'paid');
    if (result.success) {
      toast({
        title: "Payment Confirmed",
        description: "User has been marked as paid.",
      });
      await loadData();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive"});
    }
    setConfirmingPaymentId(null);
  }

  const handleDeletePost = async (id: string) => {
    const result = await deletePost(id);
    if (result.success) {
      toast({ title: 'Post Deleted', description: 'The post has been successfully removed.' });
      setPosts(prev => prev.filter(p => p.id !== id));
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };


  const handleSelect = (id: string, type: 'registration' | 'showcase') => {
      const stateUpdater = type === 'registration' ? setSelectedRegistrations : setSelectedShowcases;
      stateUpdater(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
              newSet.delete(id);
          } else {
              newSet.add(id);
          }
          return newSet;
      });
  }

  const handleSelectAll = (type: 'registration' | 'showcase') => {
    const dataSource = type === 'registration' ? registrations : showcases;
    const selectedSource = type === 'registration' ? selectedRegistrations : selectedShowcases;
    const stateUpdater = type === 'registration' ? setSelectedRegistrations : setSelectedShowcases;

    const allIds = dataSource.filter(item => !item.status || item.status !== 'paid').map(item => item.id);

    if (selectedSource.size === allIds.length) {
        stateUpdater(new Set());
    } else {
        stateUpdater(new Set(allIds));
    }
  }

  const renderStatusBadge = (status?: string) => {
    switch(status) {
        case 'paid':
            return <Badge variant="default" className="bg-green-600">Paid</Badge>;
        case 'awaiting_confirmation':
            return <Badge variant="destructive">Awaiting Confirmation</Badge>;
        case 'payment_pending':
            return <Badge variant="secondary">Pending Payment</Badge>;
        default:
            return <Badge variant="outline">New</Badge>;
    }
  }

  const renderSubmissionsTable = (data: Submission[], type: 'registration' | 'showcase') => {
      const mainKeys = type === 'registration' 
        ? ['full_name', 'email'] 
        : ['projectName', 'presenterName', 'presenterEmail'];
        
      const selectedSet = type === 'registration' ? selectedRegistrations : selectedShowcases;

      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  onCheckedChange={() => handleSelectAll(type)}
                  checked={data.length > 0 && selectedSet.size === data.filter(item => !item.status || item.status !== 'paid').length && selectedSet.size > 0}
                  disabled={data.filter(item => !item.status || item.status !== 'paid').length === 0}
                />
              </TableHead>
              <TableHead>Submission Date</TableHead>
              {mainKeys.map(key => <TableHead key={key} className="capitalize">{key.replace(/_/g, ' ')}</TableHead>)}
              <TableHead>Status</TableHead>
              <TableHead>Payment Details</TableHead>
              <TableHead>Other Info</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} data-state={selectedSet.has(item.id) ? 'selected' : ''}>
                <TableCell>
                  <Checkbox 
                    onCheckedChange={() => handleSelect(item.id, type)}
                    checked={selectedSet.has(item.id)}
                    disabled={!!item.status && item.status === 'paid'}
                  />
                </TableCell>
                <TableCell>{new Date(item.submittedAt).toLocaleString()}</TableCell>
                {mainKeys.map(key => <TableCell key={key}>{item[key] || 'N/A'}</TableCell>)}
                <TableCell>{renderStatusBadge(item.status)}</TableCell>
                <TableCell>
                  {item.paymentMethod && <div><strong>Method:</strong> {item.paymentMethod}</div>}
                  {item.receiptNumber && <div><strong>Receipt:</strong> {item.receiptNumber}</div>}
                </TableCell>
                <TableCell>
                  {Object.entries(item)
                    .filter(([key]) => !['id', 'submittedAt', 'status', ...mainKeys, 'paymentMethod', 'receiptNumber'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}:</span> {String(value)}
                      </div>
                    ))}
                </TableCell>
                <TableCell className="text-right">
                  {item.status === 'awaiting_confirmation' && (
                    <Button 
                      size="sm"
                      onClick={() => handleConfirmPayment(item.id)}
                      disabled={confirmingPaymentId === item.id}
                    >
                      {confirmingPaymentId === item.id ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                      Confirm
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
  }

  const renderPostsTable = (posts: Post[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Views</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map(post => (
          <TableRow key={post.slug}>
            <TableCell className="font-medium">{post.title}</TableCell>
            <TableCell>{post.author}</TableCell>
            <TableCell>{new Date(post.date).toLocaleDateString()}</TableCell>
            <TableCell>{post.view_count || 0}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/blog/${post.slug}`} target="_blank"><Eye className="h-4 w-4" /></Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the post and all its comments.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeletePost(post.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

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

  const selectedCount = selectedRegistrations.size + selectedShowcases.size;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
      </div>
      <Tabs defaultValue="registrations">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="registrations">Registrations ({registrations.length})</TabsTrigger>
          <TabsTrigger value="showcases">Project Showcases ({showcases.length})</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts ({posts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="registrations">
          <Card>
            <CardHeader>
                <Button onClick={handleSendPaymentRequest} disabled={selectedCount === 0 || isSending}>
                    {isSending ? <Loader2 className="animate-spin" /> : <Mail />}
                    Send Payment Request ({selectedCount})
                </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                 <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                 </div>
              ) : registrations.length > 0 ? (
                renderSubmissionsTable(registrations, 'registration')
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
                renderSubmissionsTable(showcases, 'showcase')
              ) : (
                <p className="text-center text-muted-foreground py-8">No project showcases submitted yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="blog">
          <Card>
            <CardHeader>
              <Button asChild>
                <Link href="/admin/blog/create">
                  <PlusCircle className="mr-2" />
                  Create New Post
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                 <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                 </div>
              ) : posts.length > 0 ? (
                renderPostsTable(posts)
              ) : (
                <p className="text-center text-muted-foreground py-8">No blog posts yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}
