import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Eye, Download, Trash2, Settings, AlertCircle, Loader2, Copy, Check } from 'lucide-react';

const WebPageGeneratorUI = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your web page generator assistant. Tell me what kind of website you'd like to create and I'll generate the HTML, CSS, and JavaScript for you. You can see the live preview on the right!",
      timestamp: new Date(),
      isError: false
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [copySuccess, setCopySuccess] = useState(false);
  const messagesEndRef = useRef(null);
  const [generatedCode, setGeneratedCode] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 3em; margin-bottom: 20px; }
        p { font-size: 1.2em; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome!</h1>
        <p>Your generated website will appear here. Start chatting to create something amazing!</p>
    </div>
</body>
</html>`);

  // Function to call FastAPI backend
  const callAgentAPI = async (prompt) => {
    try {
      const response = await fetch(`${apiUrl}/agent/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Helper function to force newlines to render correctly in Markdown
  const formatNewlinesForMarkdown = (text) => {
    // Replace single newlines with two spaces and a newline, which forces a line break in Markdown
    return text.replace(/\n/g, '  \n');
  };

  // Extract HTML code from agent response
  const extractHTMLFromResponse = (responseText) => {
    if (!responseText) return null;
    
    // Check if the entire response is an HTML document
    if (responseText.trim().startsWith('<!DOCTYPE html') && responseText.trim().includes('</html>')) {
      return responseText.trim();
    }
    
    // Look for HTML code blocks (```html...```)
    const codeBlockRegex = /```html\s*([\s\S]*?)\s*```/gi;
    const matches = responseText.match(codeBlockRegex);
    if (matches && matches.length > 0) {
      let htmlCode = matches[0];
      htmlCode = htmlCode.replace(/```html\s*|\s*```/g, '').trim();
      return htmlCode;
    }
    
    // Look for HTML documents within the text
    const htmlDocRegex = /<!DOCTYPE html[\s\S]*?<\/html>/gi;
    const htmlMatches = responseText.match(htmlDocRegex);
    if (htmlMatches && htmlMatches.length > 0) {
      return htmlMatches[0].trim();
    }
    
    return null;
  };

  // Clean response text for chat display (remove HTML code)
  const cleanResponseForChat = (responseText) => {
    if (!responseText) return '';
    
    // If the entire response is HTML, show a user-friendly message
    if (responseText.trim().startsWith('<!DOCTYPE html') && responseText.trim().includes('</html>')) {
      return "I've created your website! You can see the live preview on the right side.";
    }
    
    // Remove HTML code blocks
    let cleanText = responseText.replace(/```html\s*[\s\S]*?\s*```/gi, '');
    
    // Remove HTML documents from mixed content
    cleanText = cleanText.replace(/<!DOCTYPE html[\s\S]*?<\/html>/gi, '');
    
    // Clean up extra whitespace and newlines, but preserve the essential newlines
    cleanText = cleanText.replace(/\n\s*\n/g, '\n').trim();
    
    // If nothing meaningful is left, provide a default message
    if (!cleanText || cleanText.length < 10) {
      return "I've generated your website! Check out the preview panel to see how it looks.";
    }
    
    return cleanText;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      isError: false
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Call the FastAPI backend
      const response = await callAgentAPI(currentInput);
      
      if (response.status === 'success') {
        // Extract HTML code first
        const htmlCode = extractHTMLFromResponse(response.response);
        
        // Clean the response text for chat display
        const cleanedResponse = cleanResponseForChat(response.response);
        
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: formatNewlinesForMarkdown(cleanedResponse), // Format the content for proper newlines
          timestamp: new Date(),
          isError: false
        };

        setMessages(prev => [...prev, botMessage]);

        // Update preview if HTML code was found
        if (htmlCode) {
          setGeneratedCode(htmlCode);
        }
      } else {
        throw new Error('Agent responded with error status');
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Sorry, I encountered an error: ${error.message}. Please check your connection and try again.`,
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy code:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      type: 'bot',
      content: "Chat cleared! Tell me what kind of website you'd like to create.",
      timestamp: new Date(),
      isError: false
    }]);
    setError(null);
  };

  const handleApiUrlChange = () => {
    const newUrl = prompt('Enter API URL:', apiUrl);
    if (newUrl && newUrl.trim()) {
      setApiUrl(newUrl.trim());
      setError(null);
    }
  };

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Left Panel - Chat Interface */}
      <div className="w-1/2 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">PageGenie</h1>
                <p className="text-sm text-gray-500">
                  {error ? (
                    <span className="text-red-500 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Connection Error
                    </span>
                  ) : (
                    "Static Website Generator"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="text-xs text-gray-500">
                API: {apiUrl}
              </div>
              <button
                onClick={clearChat}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear Chat"
                disabled={isLoading}
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
                onClick={handleApiUrlChange}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-2' : 'mr-2'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                  }`}>
                    {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : message.isError
                    ? 'bg-red-50 text-red-800 shadow-sm rounded-bl-sm border border-red-200'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border'
                } ${message.type === 'bot' ? 'prose prose-sm' : ''}`}>
                  {message.type === 'bot' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : message.isError ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex">
                <div className="mr-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-white text-gray-800 shadow-sm rounded-bl-sm border">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm">Bot is thinking...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
                onKeyPress={handleKeyPress}
                placeholder="Describe the website you want to create..."
                className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] max-h-32 overflow-hidden"
                rows="1"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0 self-start"
              style={{ minHeight: '44px', minWidth: '44px', marginTop: '0px' }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {error ? (
              <span className="text-red-500">⚠️ Check API connection and try again</span>
            ) : (
              'Try: "Create a landing page", "Make a portfolio site", "Build a blog layout"'
            )}
          </p>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-1/2 flex flex-col">
        {/* Preview Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Live Preview</h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={copyCode}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  copySuccess 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
              <button
                onClick={downloadCode}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 bg-gray-100 overflow-hidden">
          <div className="h-full border rounded-lg m-4 bg-white shadow-inner overflow-hidden" style={{height: 'calc(100% - 2rem)'}}>
            <iframe
              srcDoc={generatedCode}
              className="w-full h-full border-none"
              title="Website Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebPageGeneratorUI;
