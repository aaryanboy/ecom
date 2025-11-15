'use client';

export default function PaymentMessage({ status, refId }) {
  if (!status) return null;
  if (status === 'success') {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Payment Successful!</strong>
        <span className="block sm:inline"> Your payment has been processed successfully.</span>
        {refId && <p className="text-sm">Transaction Reference: {refId}</p>}
      </div>
    );
  }
  if (status === 'invalid') {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Payment Verification Failed!</strong>
        <span className="block sm:inline"> We couldn't verify your payment. Please contact support if you believe this is an error.</span>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Payment Error!</strong>
        <span className="block sm:inline"> There was an error processing your payment. Please try again later.</span>
      </div>
    );
  }
  return null;
}