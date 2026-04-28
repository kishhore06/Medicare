import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const CheckoutPayment = ({ amount, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const [isReady, setIsReady] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements || !isReady) {
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const { error: submitError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '/orders',
                },
                redirect: 'if_required'
            });

            if (submitError) {
                setError(submitError.message);
                setProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                onSuccess();
            } else {
                setError('Payment failed. Please try again. Status: ' + (paymentIntent?.status || 'Unknown'));
                setProcessing(false);
            }
        } catch (err) {
            console.error("Payment confirmation error:", err);
            setError(err.message || 'An unexpected error occurred.');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Payment Details</h3>
            <div style={{ marginBottom: '1.5rem' }}>
                <PaymentElement onReady={() => setIsReady(true)} />
            </div>
            
            {error && (
                <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    {error}
                </div>
            )}
            
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!stripe || !elements || !isReady || processing}
                    style={{ width: '100%', padding: '0.75rem' }}
                >
                    {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
                </button>
                <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={onCancel}
                    disabled={processing}
                    style={{ width: '100%', padding: '0.75rem' }}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default CheckoutPayment;
