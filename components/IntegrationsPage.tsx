import React, { useState, useEffect } from 'react';
import { Integration, ServiceType } from '../types';
import IntegrationCard from './IntegrationCard';
import IntegrationModal from './IntegrationModal';
import { GlassCard } from './GlassUI';
import { MessageCircle, Mail, Hash, Gamepad2, MessageSquare, Camera, Webhook, Zap, BellRing } from 'lucide-react';

const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [modalState, setModalState] = useState<{ isOpen: boolean; service: ServiceType | null; mode: 'connect' | 'settings' }>({
    isOpen: false,
    service: null,
    mode: 'connect'
  });

  // Mock initial data load
  useEffect(() => {
    // Simulating API fetch
    const mockData: Integration[] = [
      {
        id: 'email',
        name: 'Email',
        description: 'Receive job alerts directly to your inbox.',
        status: 'connected',
        isPremium: false,
        connectionInfo: { email: 'alex.dev@example.com' },
        settings: { frequency: 'daily', format: 'html' },
        lastNotification: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        id: 'telegram',
        name: 'Telegram',
        description: 'Get instant notifications via our Telegram bot.',
        status: 'disconnected',
        isPremium: false,
      },
      {
        id: 'slack',
        name: 'Slack',
        description: 'Post new job matches to a specific channel.',
        status: 'disconnected',
        isPremium: false,
      },
      {
        id: 'discord',
        name: 'Discord',
        description: 'Send vacancy alerts to your Discord server.',
        status: 'disconnected',
        isPremium: false,
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        description: 'Get alerts on your phone via WhatsApp.',
        status: 'disconnected',
        isPremium: true,
      },
      {
        id: 'instagram',
        name: 'Instagram',
        description: 'Receive DMs about hot new vacancies.',
        status: 'disconnected',
        isPremium: true,
      },
      {
        id: 'webhook',
        name: 'Custom Webhook',
        description: 'Send JSON payload to your own endpoint.',
        status: 'disconnected',
        isPremium: false,
      },
    ];
    setIntegrations(mockData);
  }, []);

  const getIcon = (id: string) => {
    const size = 24;
    const color = "text-white";
    switch(id) {
      case 'telegram': return <MessageCircle size={size} className="text-blue-400" />;
      case 'email': return <Mail size={size} className="text-emerald-400" />;
      case 'slack': return <Hash size={size} className="text-purple-400" />;
      case 'discord': return <Gamepad2 size={size} className="text-indigo-400" />;
      case 'whatsapp': return <MessageSquare size={size} className="text-green-400" />;
      case 'instagram': return <Camera size={size} className="text-pink-400" />;
      case 'webhook': return <Webhook size={size} className="text-orange-400" />;
      default: return <Zap size={size} className={color} />;
    }
  };

  const handleConnect = (service: ServiceType) => {
    setModalState({ isOpen: true, service, mode: 'connect' });
  };

  const handleSettings = (service: ServiceType) => {
    setModalState({ isOpen: true, service, mode: 'settings' });
  };

  const handleDisconnect = async (serviceId: ServiceType) => {
    if (confirm(`Are you sure you want to disconnect ${serviceId}?`)) {
      setIntegrations(prev => prev.map(item => 
        item.id === serviceId ? { ...item, status: 'disconnected', connectionInfo: undefined } : item
      ));
    }
  };

  const handleTest = async (serviceId: ServiceType) => {
    alert(`Sending test notification to ${serviceId}...`);
  };

  const handleSaveModal = async (data: any) => {
    if (!modalState.service) return;
    
    // Simulate updating backend
    setIntegrations(prev => prev.map(item => {
      if (item.id === modalState.service) {
        if (modalState.mode === 'connect') {
           return {
             ...item,
             status: 'connected',
             connectionInfo: {
               username: data.verificationCode ? '@alex_dev' : undefined, // Mock username
               webhookUrl: data.webhookUrl
             },
             lastNotification: new Date()
           };
        } else {
          return { ...item, settings: data.settings };
        }
      }
      return item;
    }));
  };

  const activeIntegrations = integrations.filter(i => i.status === 'connected' || i.status === 'error');
  const availableIntegrations = integrations.filter(i => i.status === 'disconnected' || i.status === 'premium');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <GlassCard className="p-8 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-500/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-400/30">
            <BellRing size={32} className="text-blue-200" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Manage Notification Channels</h1>
            <p className="text-gray-300">Choose where and how you want to receive your AI-matched job alerts.</p>
          </div>
        </div>
      </GlassCard>

      {/* Active Integrations */}
      {activeIntegrations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
            Active Integrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeIntegrations.map(integration => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                icon={getIcon(integration.id)}
                onConnect={() => handleConnect(integration.id)}
                onDisconnect={() => handleDisconnect(integration.id)}
                onSettings={() => handleSettings(integration.id)}
                onTest={() => handleTest(integration.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
           <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
           Available Integrations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {availableIntegrations.map(integration => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                icon={getIcon(integration.id)}
                onConnect={() => handleConnect(integration.id)}
                onDisconnect={() => handleDisconnect(integration.id)}
                onSettings={() => handleSettings(integration.id)}
                onTest={() => handleTest(integration.id)}
              />
            ))}
        </div>
      </div>

      {/* Modal */}
      {modalState.service && (
        <IntegrationModal
          isOpen={modalState.isOpen}
          service={modalState.service}
          mode={modalState.mode}
          initialSettings={integrations.find(i => i.id === modalState.service)?.settings}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          onSave={handleSaveModal}
        />
      )}
    </div>
  );
};

export default IntegrationsPage;