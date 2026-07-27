import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ServerProvider, useServer } from './context/ServerContext';
import { VoiceProvider, useVoice } from './context/VoiceContext';

import { WindowsTitlebar } from './components/win/WindowsTitlebar';
import { ServersBar } from './components/sidebar/ServersBar';
import { ChannelsSidebar } from './components/channels/ChannelsSidebar';
import { ChatHeader } from './components/chat/ChatHeader';
import { MessageFeed } from './components/chat/MessageFeed';
import { ChatInput } from './components/chat/ChatInput';
import { VoiceGrid } from './components/voice/VoiceGrid';
import { DirectMessagesView } from './components/dms/DirectMessagesView';
import { MembersSidebar } from './components/members/MembersSidebar';

import { AddServerModal } from './components/modals/AddServerModal';
import { CreateChannelModal } from './components/modals/CreateChannelModal';
import { InviteModal } from './components/modals/InviteModal';
import { UserSettingsModal } from './components/modals/UserSettingsModal';

const HarmonyAppContent = () => {
  const { activeServerId, activeChannel } = useServer();
  const { activeVoiceChannelId } = useVoice();
  const { loading } = useAuth();

  const [showMembers, setShowMembers] = useState(true);
  const [replyTo, setReplyTo] = useState(null);

  // Modals state
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [createCategoryTarget, setCreateCategoryTarget] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-space)',
        color: 'var(--neon-cyan)',
        fontFamily: 'var(--font-main)',
        fontSize: '22px',
        fontWeight: '800'
      }}>
        <div style={{ marginBottom: '12px', fontSize: '36px' }}>⚡</div>
        Initializing Aether Windows Node...
      </div>
    );
  }

  const isVoiceActiveChannel = activeChannel?.type === 'voice' || activeVoiceChannelId === activeChannel?.id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Native Windows Frameless Titlebar */}
      <WindowsTitlebar />

      <div className="app-container">
        {/* 1. Leftmost Server Navigation Sidebar */}
        <ServersBar onOpenAddServer={() => setShowAddServerModal(true)} />

        {/* 2. Channels Sidebar */}
        <ChannelsSidebar 
          onOpenCreateChannel={(catId) => setCreateCategoryTarget(catId)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenInvite={() => setShowInviteModal(true)}
        />

        {/* 3. Main Stage Content View */}
        {activeServerId === 'home' ? (
          <DirectMessagesView />
        ) : isVoiceActiveChannel ? (
          <VoiceGrid />
        ) : (
          <div className="main-chat-area">
            <ChatHeader 
              onToggleMembers={() => setShowMembers(!showMembers)}
              showMembers={showMembers}
            />

            <MessageFeed onSetReply={setReplyTo} />

            <ChatInput 
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              channelName={activeChannel?.name}
            />
          </div>
        )}

        {/* 4. Right Members Sidebar */}
        {activeServerId !== 'home' && !isVoiceActiveChannel && showMembers && (
          <MembersSidebar />
        )}

        {/* Modals */}
        {showAddServerModal && (
          <AddServerModal onClose={() => setShowAddServerModal(false)} />
        )}

        {createCategoryTarget && (
          <CreateChannelModal 
            categoryId={createCategoryTarget}
            onClose={() => setCreateCategoryTarget(null)}
          />
        )}

        {showInviteModal && (
          <InviteModal onClose={() => setShowInviteModal(false)} />
        )}

        {showSettingsModal && (
          <UserSettingsModal onClose={() => setShowSettingsModal(false)} />
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ServerProvider>
          <VoiceProvider>
            <HarmonyAppContent />
          </VoiceProvider>
        </ServerProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
