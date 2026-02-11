import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminChatAPI } from '../services/api';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  User, 
  Building2,
  Search,
  AlertCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';

const AdminChatPage = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    
    // Poll conversations every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchConversations(true);
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedHospitalId) {
      fetchMessages();
      
      // Poll messages every 3 seconds when chat is open
      const messagePolling = setInterval(() => {
        fetchMessages(true);
      }, 3000);

      return () => clearInterval(messagePolling);
    }
  }, [selectedHospitalId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const response = await adminChatAPI.getConversations();
      
      if (response.data.success) {
        setConversations(response.data.data || []);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      if (!silent) {
        setError('Failed to load conversations');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchMessages = async (silent = false) => {
    try {
      const response = await adminChatAPI.getMessages(selectedHospitalId);
      
      if (response.data.success) {
        setMessages(response.data.data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (!silent) {
        setError('Failed to load messages');
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedHospitalId) return;

    setSending(true);
    setError('');

    try {
      const response = await adminChatAPI.sendMessage(selectedHospitalId, newMessage.trim());
      
      if (response.data.success) {
        success('Message sent', 'Your message has been sent to the hospital');
        setNewMessage('');
        await fetchMessages(true);
        await fetchConversations(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      showError('Failed to send message', err.response?.data?.message || 'Please try again later');
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (hospitalId) => {
    setSelectedHospitalId(hospitalId);
    setMessages([]);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = conversations.find(c => c.hospitalId === selectedHospitalId);

  // Count hospitals with and without conversations
  const hospitalsWithMessages = conversations.filter(c => c.lastMessage).length;
  const hospitalsWithoutMessages = conversations.length - hospitalsWithMessages;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-zinc-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 shadow-sm flex-shrink-0">
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <MessageSquare className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-bold text-zinc-900 truncate">Hospital Messages</h1>
                <p className="text-xs sm:text-sm text-zinc-600 truncate">
                  {conversations.length} hospitals • {hospitalsWithMessages} active chats • {conversations.reduce((sum, c) => sum + (c.unreadCount?.admin || 0), 0)} unread
                </p>
              </div>
            </div>
          </div>
          
          {/* Info banner for admin */}
          {hospitalsWithoutMessages > 0 && (
            <div className="mt-3 p-2.5 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">
                <span className="font-semibold">Admin Privilege:</span> You can initiate conversations with any registered hospital. 
                {hospitalsWithoutMessages} hospital{hospitalsWithoutMessages !== 1 ? 's' : ''} without messages can be contacted.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className={`${selectedHospitalId ? 'hidden md:flex' : 'flex'} w-full md:w-96 bg-white border-r border-zinc-200 flex-col`}>
          {/* Search */}
          <div className="p-3 sm:p-4 border-b border-zinc-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search hospitals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-sm sm:text-base text-zinc-500">No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const hasMessages = conv.lastMessage || (conv.messages && conv.messages.length > 0);
                const isApproved = conv.isApproved !== false; // Default to true if not specified
                
                return (
                  <button
                    key={conv.hospitalId}
                    onClick={() => handleSelectConversation(conv.hospitalId)}
                    className={`w-full p-3 sm:p-4 border-b border-zinc-200 hover:bg-zinc-50 transition-colors text-left ${
                      selectedHospitalId === conv.hospitalId ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        selectedHospitalId === conv.hospitalId ? 'bg-blue-600' : hasMessages ? 'bg-zinc-600' : 'bg-zinc-400'
                      }`}>
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <p className="text-sm sm:text-base font-semibold text-zinc-900 truncate">{conv.hospitalName}</p>
                            {!isApproved && (
                              <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex-shrink-0">
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            {!hasMessages && (
                              <span className="px-1.5 sm:px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                New
                              </span>
                            )}
                            {conv.unreadCount?.admin > 0 && (
                              <span className="px-1.5 sm:px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                                {conv.unreadCount.admin}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className={`text-xs sm:text-sm truncate mb-1 ${
                          hasMessages ? 'text-zinc-600' : 'text-green-600 font-medium'
                        }`}>
                          {hasMessages 
                            ? conv.lastMessage 
                            : 'Start a conversation - Click to message this hospital'}
                        </p>
                        {conv.lastMessageTime && (
                          <p className="text-xs text-zinc-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(conv.lastMessageTime)}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className={`${selectedHospitalId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-zinc-50`}>
          {!selectedHospitalId ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 sm:h-16 sm:w-16 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-zinc-900 mb-2">Select a conversation</h3>
                <p className="text-sm sm:text-base text-zinc-600">Choose a hospital from the list to view messages</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-zinc-200 px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setSelectedHospitalId(null)}
                    className="md:hidden p-1.5 hover:bg-zinc-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    <ArrowLeft className="h-5 w-5 text-zinc-600" />
                  </button>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-semibold text-zinc-900 truncate">{selectedConversation?.hospitalName}</p>
                    <p className="text-xs sm:text-sm text-zinc-600 truncate">{selectedConversation?.hospitalEmail}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6 sm:p-8 max-w-md">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-zinc-900 mb-2">Start a Conversation</h3>
                      <p className="text-sm sm:text-base text-zinc-600 mb-1">
                        No messages yet with {selectedConversation?.hospitalName}
                      </p>
                      <p className="text-xs sm:text-sm text-blue-600 font-medium">
                        Type a message below to initiate the conversation
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isAdmin = msg.sender === 'admin';
                      
                      return (
                        <div
                          key={msg._id || index}
                          className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                        >
                          <div className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[70%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                              isAdmin ? 'bg-blue-600' : 'bg-zinc-600'
                            }`}>
                              {isAdmin ? (
                                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                              ) : (
                                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className={`rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
                                isAdmin 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-white border border-zinc-200 text-zinc-900'
                              }`}>
                                <p className="text-xs font-medium mb-1 opacity-75">
                                  {msg.senderName || (isAdmin ? 'You' : selectedConversation?.hospitalName)}
                                </p>
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                              </div>
                              <p className={`text-xs text-zinc-500 mt-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="bg-white border-t border-zinc-200 px-3 sm:px-6 py-3 sm:py-4">
                {error && (
                  <div className="mb-3 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-red-700">{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-3 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base flex-shrink-0"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span className="hidden sm:inline">Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Send</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;
