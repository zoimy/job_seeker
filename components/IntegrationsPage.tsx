import React, { useState, useEffect } from 'react';
import { Integration, ServiceType } from '../types';
import IntegrationCard from './IntegrationCard';
import IntegrationModal from './IntegrationModal';
import { GlassCard } from './GlassUI';
import { MessageCircle, Mail, Hash, Gamepad2, MessageSquare, Camera, Webhook, Zap, BellRing, Link2 } from 'lucide-react';
import { integrationService } from '../services/integrationService';

const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<{ isOpen: boolean; service: ServiceType | null; mode: 'connect' | 'settings' }>({
    isOpen: false,
    service: null,
    mode: 'connect'
  });

  // Load integrations from backend
  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    const data = await integrationService.getIntegrations();
    setIntegrations(data);
    setLoading(false);
  };

  const getIcon = (id: string) => {
    const size = 26;
    const color = "text-white";
    switch(id) {
      case 'telegram': return <MessageCircle size={size} className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />;
      case 'email': return <Mail size={size} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />;
      case 'slack': return <Hash size={size} className="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />;
      case 'discord': return <Gamepad2 size={size} className="text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />;
      case 'whatsapp': return <MessageSquare size={size} className="text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" />;
      case 'instagram': return <Camera size={size} className="text-pink-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]" />;
      case 'webhook': return <Webhook size={size} className="text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]" />;
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
      const success = await integrationService.disconnectIntegration(serviceId);
      if (success) {
        await loadIntegrations(); // Reload to get updated status
      } else {
        alert('Failed to disconnect integration');
      }
    }
  };

  const handleTest = async (serviceId: ServiceType) => {
    const testButton = document.activeElement as HTMLButtonElement;
    if (testButton) testButton.disabled = true;
    
    const result = await integrationService.testIntegration(serviceId);
    
    if (result.success) {
      alert(`✅ Test notification sent to ${serviceId}! Check your ${serviceId} app.`);
    } else {
      alert(`❌ Failed to send test notification: ${result.error || 'Unknown error'}`);
    }
    
    if (testButton) testButton.disabled = false;
  };

  const handleSaveModal = async (data: any) => {
    if (!modalState.service) return;
    
    let result;
    
    if (modalState.mode === 'connect') {
      // Handle connection
      const serviceId = modalState.service;
      
      if (serviceId === 'telegram' && data.chatId) {
        result = await integrationService.updateIntegration(serviceId, {
          status: 'connected',
          connectionInfo: { chatId: data.chatId },
          settings: data.settings || { frequency: 'instant', format: 'compact' }
        });
      } else if (['slack', 'discord', 'webhook'].includes(serviceId) && data.webhookUrl) {
        result = await integrationService.updateIntegration(serviceId, {
          status: 'connected',
          connectionInfo: { webhookUrl: data.webhookUrl },
          settings: data.settings || { frequency: 'instant', format: 'compact' }
        });
      } else if (serviceId === 'email' && data.email) {
        result = await integrationService.updateIntegration(serviceId, {
          status: 'connected',
          connectionInfo: { email: data.email },
          settings: data.settings || { frequency: 'daily', format: 'html' }
        });
      }
    } else {
      // Handle settings update
      result = await integrationService.updateIntegration(modalState.service, {
        settings: data.settings
      });
    }
    
    if (result?.success) {
      await loadIntegrations(); // Reload to get updated data
    } else {
      alert(`Failed to save: ${result?.error || 'Unknown error'}`);
    }
  };

  const activeIntegrations = integrations.filter(i => i.status === 'connected' || i.status === 'error');
  const availableIntegrations = integrations.filter(i => i.status === 'disconnected' || i.status === 'premium');

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <GlassCard className="p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border-t border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="p-5 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative z-10">
          <BellRing size={40} className="text-white drop-shadow-lg" />
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Notification Channels</h1>
          <p className="text-blue-200/70 text-lg max-w-2xl">Connect your favorite platforms to receive instant job alerts powered by AI. Manage your subscriptions and preferences in one place.</p>
        </div>
      </GlassCard>

      {/* Active Integrations */}
      {activeIntegrations.length > 0 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-3 pl-2">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            Active Channels
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
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-3 pl-2">
           <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
           Available Channels
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