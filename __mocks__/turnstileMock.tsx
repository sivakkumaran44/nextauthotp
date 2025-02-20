import React from 'react';
interface TurnstileProps {
  onVerify?: (token: string) => void;
  [key: string]: unknown;
}
const Turnstile: React.FC<TurnstileProps> = ({ onVerify, ...props }) => (
  <div data-testid="mock-turnstile" {...props}>
    <button onClick={() => onVerify?.('mock-token')}>Verify Turnstile</button>
  </div>
);
export { Turnstile };
export default { Turnstile };