import { useState } from 'react';
import { useConnect } from '@stacks/connect-react';
import { stringAsciiCV, stringUtf8CV } from '@stacks/transactions';
import { userSession } from '@/config';
import styles from './SignModal.module.css';

interface SignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignModal({ isOpen, onClose }: SignModalProps) {
  const { doContractCall } = useConnect();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    
    
    // Contract details (Placeholder - Update with actual deployed address)
    const contractAddress = 'SP1GNDB8SXJ51GBMSVVXMWGTPRFHGSMWNNBEY25A4'; 
    const contractName = 'signwallV2';
    const functionName = 'sign';

    doContractCall({
      contractAddress,
      contractName,
      functionName,
      functionArgs: [stringAsciiCV(name), stringUtf8CV(message)],
      onFinish: (data) => {
        console.log('Transaction finished:', data);
        onClose();
        // Ideally show a pending state or toast here
      },
      onCancel: () => {
        console.log('Transaction canceled');
      },
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>Initialize Signature</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Identity Name</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Enter your display name..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Transmission Message</label>
            <textarea 
              className={styles.textarea} 
              placeholder="Write something for the blockchain..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className={styles.actions}>
            <button className="btn-secondary" type="button" onClick={onClose}>Abort</button>
            <button className="btn-primary" type="submit">Sign Wall</button>
          </div>
        </form>
      </div>
    </div>
  );
}
