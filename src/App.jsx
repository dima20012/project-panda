import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ServerProvider, useServer } from './context/ServerContext';
import { VoiceProvider, useVoice } from './context/VoiceContext';
import { ThemeProvider } from './context/ThemeContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

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
import { SearchModal } from './components/modals/SearchModal';

import { PinnedModal } from './components/modals/PinnedModal';
import { ServerConnectionModal } from './components/modals/ServerConnectionModal';

const HarmonyAppContent = () => {
  const { activeServerId, activeChannel, channels, selectChannel } = useServer();
  const { activeVoiceChannelId, isMuted, setIsMuted } = useVoice();
  const { loading } = useAuth();

  const [showMembers, setShowMembers] = useState(true);
  const [replyTo, setReplyTo] = useState(null);

  // Modals state
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [createCategoryTarget, setCreateCategoryTarget] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showPinnedModal, setShowPinnedModal] = useState(false);
  const [showNodeManagerModal, setShowNodeManagerModal] = useState(false);

  // Global Keyboard Shortcuts
  useKeyboardShortcuts({
    onToggleSearch: () => setShowSearchModal(prev => !prev),
    onCloseModals: () => {
      setShowSearchModal(false);
      setShowSettingsModal(false);
      setShowInviteModal(false);
      setShowAddServerModal(false);
      setShowPinnedModal(false);
      setShowNodeManagerModal(false);
      setCreateCategoryTarget(null);
    },
    onPrevChannel: () => {
      if (!channels || channels.length === 0) return;
      const currentIdx = channels.findIndex(c => c.id === activeChannel?.id);
      const prevIdx = (currentIdx - 1 + channels.length) % channels.length;
      selectChannel(channels[prevIdx]);
    },
    onNextChannel: () => {
      if (!channels || channels.length === 0) return;
      const currentIdx = channels.findIndex(c => c.id === activeChannel?.id);
      const nextIdx = (currentIdx + 1) % channels.length;
      selectChannel(channels[nextIdx]);
    },
    onToggleVoiceMute: () => {
      setIsMuted(prev => !prev);
    }
  });

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
        <div style={{ marginBottom: '12px', fontSize: '36px' }}>🐼</div>
        Initializing Project Panda Windows Node...
      </div>
    );
  }

  const isVoiceActiveChannel = Boolean(activeVoiceChannelId && activeChannel?.id === activeVoiceChannelId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Native Windows Frameless Titlebar */}
      <WindowsTitlebar />

      <div className="app-container">
        {/* 1. Leftmost Server Navigation Sidebar */}
        <ServersBar 
          onOpenAddServer={() => setShowAddServerModal(true)} 
          onOpenNodeManager={() => setShowNodeManagerModal(true)}
        />

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
              onOpenSearch={() => setShowSearchModal(true)}
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

        {showSearchModal && (
          <SearchModal onClose={() => setShowSearchModal(false)} />
        )}

        {showNodeManagerModal && (
          <ServerConnectionModal onClose={() => setShowNodeManagerModal(false)} />
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ServerProvider>
            <VoiceProvider>
              <HarmonyAppContent />
            </VoiceProvider>
          </ServerProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
