'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Send, Users } from 'lucide-react';
import { FeedbackModal } from '@/components/dashboard/feedback-modal';

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface GroupMember {
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    city: string | null;
  };
}


interface Group {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
}

export default function GroupChatPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params?.id as string;
  const supabase = createClient();

  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // تلقائي scroll إلى أسفل الرسائل
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/sign-in');
        return;
      }
      setCurrentUserId(user.id);

      try {
        // جلب بيانات المجموعة
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('id, name, description, avatar_url')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;
        setGroup(groupData);

        // جلب أعضاء المجموعة
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select(`
            profiles!group_members_user_id_fkey (
              id,
              full_name,
              avatar_url,
              city
            )
          `)
          .eq('group_id', groupId);

        if (membersError) throw membersError;
        setMembers((membersData || []) as unknown as GroupMember[]);

        // جلب الرسائل
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            user_id,
            content,
            created_at,
            profiles!messages_user_id_fkey (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages((messagesData || []) as unknown as Message[]);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // الاشتراك في الرسائل الجديدة (Realtime)
    const channel = supabase
      .channel(`group-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          // جلب بيانات البروفايل للرسالة الجديدة
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          const newMessage = {
            ...payload.new,
            profiles: profile,
          } as Message;

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, supabase, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          group_id: groupId,
          user_id: currentUserId,
          content: newMessage.trim(),
        });

      if (error) throw error;
      setNewMessage('');
      // Keep focus on the input for sending another message quickly
      inputRef.current?.focus();
      // Encourage scroll to the latest area
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <p>Loading chat...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <p>Group not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col">
          {/* Header inside Chat Card */}
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/dashboard/messages')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={group.avatar_url || 'https://github.com/shadcn.png'} />
                  <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {members.length} {members.length === 1 ? 'member' : 'members'}
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => setShowFeedbackModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                ⭐ Give Feedback
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <p>No messages yet</p>
                    <p className="text-sm mt-2">Be the first to say hello! 👋</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isCurrentUser = message.user_id === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={message.profiles?.avatar_url || ''} />
                          <AvatarFallback>
                            {message.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : ''}`}>
                          <div
                            className={`px-4 py-2 rounded-lg max-w-md ${
                              isCurrentUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {new Date(message.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="flex-1"
                    ref={inputRef}
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
          </CardContent>
        </Card>

        {/* Members Sidebar */}
        <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.profiles.id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={member.profiles.avatar_url || ''} />
                      <AvatarFallback>
                        {member.profiles.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.profiles.full_name || 'Anonymous'}
                        {member.profiles.id === currentUserId && (
                          <span className="text-xs text-muted-foreground ml-1">(You)</span>
                        )}
                      </p>
                      {member.profiles.city && (
                        <p className="text-xs text-muted-foreground truncate">
                          {member.profiles.city}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Modal */}
        {showFeedbackModal && (
          <FeedbackModal
            groupId={groupId}
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
          />
        )}
      </DashboardLayout>
    );
  }

