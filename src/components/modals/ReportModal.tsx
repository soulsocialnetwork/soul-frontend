import { useState } from 'react';
import { cn } from '../../utils/cn';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { getHttpErrorMessage } from '../../services/api';
import { moderationService } from '../../services/moderationService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'POST' | 'SOULT' | 'ACCOUNT';
}

const REASONS = [
  'Spam',
  'Conteúdo Inadequado ou Nudez',
  'Discurso de Ódio ou Assédio',
  'Informação Falsa',
  'Golpe ou Fraude',
  'Outro motivo'
];

export function ReportModal({ isOpen, onClose, targetId, targetType }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setLoading(true);
    setError(null);
    try {
      await moderationService.reportItem(targetId, targetType, selectedReason);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedReason('');
      }, 2000);
    } catch (err: unknown) {
      setError(getHttpErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = () => {
    switch (targetType) {
      case 'POST': return 'esta publicação';
      case 'SOULT': return 'este Soult';
      case 'ACCOUNT': return 'esta conta';
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-background w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden pointer-events-auto">
          <div className="p-4 sm:p-6 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Denunciar
            </h2>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-textSecondary hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 sm:p-6">
            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Denúncia Enviada</h3>
                <p className="text-sm text-textSecondary">
                  Analisaremos a denúncia o mais rápido possível e tomaremos as medidas necessárias.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-textSecondary mb-4">
                  Por que você está denunciando {getTypeLabel()}?
                </p>
                
                {error && (
                  <div className="p-3 mb-4 text-sm text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2 mb-6">
                  {REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setSelectedReason(reason)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl transition-colors text-sm font-medium",
                        selectedReason === reason 
                          ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                          : "bg-white/[0.03] text-textPrimary hover:bg-white/[0.06] border border-transparent"
                      )}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={!selectedReason || loading}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:hover:bg-red-500 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enviar Denúncia
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Check component for success
function Check(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
