
import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface HTMLDisplayProps {
  html: string | undefined;
  isLoading: boolean;
}

const HTMLDisplay = ({ html, isLoading }: HTMLDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (!html) return;
    
    navigator.clipboard.writeText(html)
      .then(() => {
        setCopied(true);
        toast({
          title: "Copied!",
          description: "HTML copied to clipboard",
          duration: 2000,
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to copy: " + err.message,
          variant: "destructive",
          duration: 3000,
        });
      });
  };

  const htmlStats = html 
    ? {
        length: html.length,
        elements: (html.match(/<[^>]+>/g) || []).length,
        images: (html.match(/<img[^>]+>/g) || []).length,
        links: (html.match(/<a[^>]+>/g) || []).length,
      }
    : null;

  return (
    <Card className="w-full mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>HTML Code</CardTitle>
        <div className="flex items-center">
          {htmlStats && (
            <div className="text-sm text-muted-foreground mr-4">
              <span className="font-semibold">{htmlStats.length}</span> chars | 
              <span className="font-semibold ml-2">{htmlStats.elements}</span> elements |
              <span className="font-semibold ml-2">{htmlStats.images}</span> images |
              <span className="font-semibold ml-2">{htmlStats.links}</span> links
            </div>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            onClick={copyToClipboard}
            disabled={!html || isLoading}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          ref={textareaRef}
          value={isLoading ? 'Loading HTML...' : html || 'No HTML content available'}
          readOnly
          className="font-mono text-xs h-64 overflow-auto"
        />
      </CardContent>
    </Card>
  );
};

export default HTMLDisplay;
