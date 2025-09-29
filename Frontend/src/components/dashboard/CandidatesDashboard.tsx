import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, User, Mail, Phone, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Candidate, CandidateAnswer } from '@/types/candidate';

// Mock data for demonstration
const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    finalScore: 78,
    aiSummary: 'Strong foundational knowledge in React and JavaScript. Good problem-solving skills but needs improvement in system design.',
    interviewDate: '2024-01-15T10:30:00Z',
    answers: [
      {
        question: 'Explain the difference between let, const, and var in JavaScript.',
        answer: 'Let and const are block-scoped while var is function-scoped. Const cannot be reassigned after declaration.',
        score: 8,
        feedback: 'Good understanding of scoping, could have mentioned hoisting behavior.',
        difficulty: 'Easy'
      },
      {
        question: 'What are React Hooks and how do they work?',
        answer: 'Hooks are functions that let you use state and lifecycle features in functional components.',
        score: 7,
        feedback: 'Correct basic definition, but could elaborate on rules and common hooks.',
        difficulty: 'Easy'
      },
      {
        question: 'What is the virtual DOM in React and how does it improve performance?',
        answer: 'Virtual DOM is a JavaScript representation of the real DOM. React uses it to optimize updates by comparing versions.',
        score: 9,
        feedback: 'Excellent explanation with clear understanding of the reconciliation process.',
        difficulty: 'Medium'
      }
    ]
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0456',
    finalScore: 92,
    aiSummary: 'Exceptional candidate with deep understanding of full-stack development. Excellent system design skills and clear communication.',
    interviewDate: '2024-01-16T14:00:00Z',
    answers: [
      {
        question: 'Explain the difference between let, const, and var in JavaScript.',
        answer: 'Var is function-scoped and hoisted, let and const are block-scoped. Const prevents reassignment, let allows it. All are hoisted but let/const have temporal dead zone.',
        score: 10,
        feedback: 'Perfect answer covering all aspects including hoisting and temporal dead zone.',
        difficulty: 'Easy'
      },
      {
        question: 'How would you design a RESTful API for an e-commerce application?',
        answer: 'I would use resource-based URLs, proper HTTP methods, implement authentication with JWT, use pagination, versioning, and proper error handling with meaningful status codes.',
        score: 9,
        feedback: 'Comprehensive answer covering most best practices, excellent system thinking.',
        difficulty: 'Hard'
      }
    ]
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    phone: '+1-555-0789',
    finalScore: 65,
    aiSummary: 'Basic understanding of web development concepts. Shows promise but needs more experience with advanced topics.',
    interviewDate: '2024-01-17T09:15:00Z',
    answers: [
      {
        question: 'Explain middleware in Express.js and provide an example.',
        answer: 'Middleware are functions that execute during the request-response cycle. They can modify request/response objects.',
        score: 6,
        feedback: 'Basic understanding shown, but could provide concrete examples and explain next() function.',
        difficulty: 'Medium'
      }
    ]
  }
];

type SortField = 'name' | 'finalScore' | 'interviewDate';
type SortDirection = 'asc' | 'desc';

const CandidatesDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('finalScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredAndSortedCandidates = useMemo(() => {
    const filtered = mockCandidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'finalScore':
          aValue = a.finalScore;
          bValue = b.finalScore;
          break;
        case 'interviewDate':
          aValue = new Date(a.interviewDate).getTime();
          bValue = new Date(b.interviewDate).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleRowClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: CandidateAnswer['difficulty']) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 ml-1 inline" /> : 
      <ChevronDown className="w-4 h-4 ml-1 inline" />;
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidates Dashboard</h1>
        <p className="text-gray-600">Review and analyze interview results</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search candidates by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredAndSortedCandidates.length} of {mockCandidates.length} candidates
      </div>

      {/* Candidates Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('name')}
                >
                  Name <SortIcon field="name" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 select-none text-center"
                  onClick={() => handleSort('finalScore')}
                >
                  Final Score <SortIcon field="finalScore" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('interviewDate')}
                >
                  Interview Date <SortIcon field="interviewDate" />
                </TableHead>
                <TableHead className="max-w-md">AI Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCandidates.map((candidate) => (
                <TableRow 
                  key={candidate.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleRowClick(candidate)}
                >
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{candidate.name}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-bold text-lg ${getScoreColor(candidate.finalScore)}`}>
                      {candidate.finalScore}
                    </span>
                    <span className="text-gray-500">/100</span>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(candidate.interviewDate)}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm text-gray-700 leading-relaxed overflow-hidden">
                      {candidate.aiSummary.length > 100 
                        ? `${candidate.aiSummary.substring(0, 100)}...` 
                        : candidate.aiSummary}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* No Results */}
      {filteredAndSortedCandidates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No candidates found matching your search.</p>
        </div>
      )}

      {/* Candidate Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedCandidate.name} - Interview Details
                </DialogTitle>
                <DialogDescription>
                  Interview conducted on {formatDate(selectedCandidate.interviewDate)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Candidate Profile */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Candidate Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Name:</span> {selectedCandidate.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Email:</span> {selectedCandidate.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Phone:</span> {selectedCandidate.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Interview Date:</span> {formatDate(selectedCandidate.interviewDate)}
                    </div>
                  </CardContent>
                </Card>

                {/* Overall Score and Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-medium">Final Score:</span>
                        <span className={`text-3xl font-bold ${getScoreColor(selectedCandidate.finalScore)}`}>
                          {selectedCandidate.finalScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            selectedCandidate.finalScore >= 80 ? 'bg-green-500' :
                            selectedCandidate.finalScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${selectedCandidate.finalScore}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">AI Summary:</h4>
                      <p className="text-gray-700 leading-relaxed">{selectedCandidate.aiSummary}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Question-by-Question Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Question-by-Question Analysis</CardTitle>
                    <CardDescription>
                      Detailed breakdown of each interview question and response
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedCandidate.answers.map((answer, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`${getDifficultyColor(answer.difficulty)} border-0`}>
                              {answer.difficulty}
                            </Badge>
                            <span className="font-medium text-sm">Question {index + 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Score:</span>
                            <span className={`font-bold text-lg ${getScoreColor(answer.score * 10)}`}>
                              {answer.score}/10
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Question:</h4>
                            <p className="text-gray-700">{answer.question}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Answer:</h4>
                            <p className="text-gray-700 bg-white p-3 rounded border">{answer.answer}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">AI Feedback:</h4>
                            <p className="text-gray-600 italic">{answer.feedback}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidatesDashboard;