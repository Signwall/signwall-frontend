
import { useEffect, useState } from 'react';
import { fetchCallReadOnlyFunction, uintCV, cvToJSON } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import styles from './Wall.module.css';

interface Signature {
  id: number;
  name: string;
  message: string;
  timestamp: string;
  signer: string;
}

interface RawSignature {
  id: number;
  name: { value: string };
  message: { value: string };
  'block-height': { value: string };
  signer: { value: string };
}

const CONTRACT_ADDRESS = 'SP1GNDB8SXJ51GBMSVVXMWGTPRFHGSMWNNBEY25A4';
const CONTRACT_NAME = 'signwallV2';

export default function Wall() {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSignatures = async () => {
      try {
        const network = STACKS_MAINNET;
        
        // 1. Get total count
        const countFn = 'get-signature-count';
        const countRes = await fetchCallReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: countFn,
          functionArgs: [],
          network,
          senderAddress: CONTRACT_ADDRESS,
        });
        
        const countJSON = cvToJSON(countRes);
        // For a uint CV, cvToJSON returns { type: 'uint', value: 'N' }
        const totalCount = parseInt(countJSON.value);
        
        console.log("Total signatures fetched:", totalCount);

        if (totalCount === 0) {
          setIsLoading(false);
          setSignatures([]); // Ensure signatures array is empty
          return;
        }

        // 2. Fetch last 20 signatures
        const limit = 20;
        const startIndex = Math.max(0, totalCount - limit);
        const promises = [];

        for (let i = totalCount - 1; i >= startIndex; i--) {
           promises.push(
             fetchCallReadOnlyFunction({
               contractAddress: CONTRACT_ADDRESS,
               contractName: CONTRACT_NAME,
               functionName: 'get-signature-by-index',
               functionArgs: [uintCV(i)],
               network,
               senderAddress: CONTRACT_ADDRESS,
             }).then(res => { 
                const data = cvToJSON(res);
                // get-signature-by-index returns (optional (tuple ...))
                // If data.value is null (None), return null to filter out later.
                // Otherwise, data.value.value contains the tuple fields.
                return data.value ? { ...data.value.value, id: i } : null;
             })
           );
        }

        const rawSignatures = await Promise.all(promises);
        
        // 3. Format data
        const formattedSignatures: Signature[] = rawSignatures
          .filter((sig): sig is RawSignature => sig !== null)
          .map((sig) => ({
            id: sig.id,
            name: sig.name.value,
            message: sig.message.value,
            timestamp: `Block ${sig['block-height'].value}`, // Using block height as timestamp proxy
            signer: sig.signer.value
          }));

        setSignatures(formattedSignatures);
      } catch (error) {
        console.error("Error fetching signatures:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignatures();
  }, []);

  return (
    <section className={styles.wallSection}>
      <h2 className={styles.wallHeader}>Recent Signatures</h2>
      {isLoading ? (
        <div className={`container ${styles.grid}`}>
           <p className={styles.loadingText}>Loading signatures...</p>
        </div>
      ) : (
        <div className={`container ${styles.grid}`}>
          {signatures.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No signatures yet. Be the first to sign the wall!</p>
            </div>
          ) : (
            signatures.map((sig) => (
              <div key={sig.id} className={`glass-panel ${styles.card}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.headerLeft}>
                    <span className={styles.name}>{sig.name}</span>
                    <span className={styles.signer}>{sig.signer.slice(0, 6)}...{sig.signer.slice(-4)}</span>
                  </div>
                  <span className={styles.timestamp}>{sig.timestamp}</span>
                </div>
                <p className={styles.message}>{sig.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}

